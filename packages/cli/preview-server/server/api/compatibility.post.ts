import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { parse } from 'node-html-parser'

type EmailClient = 'gmail' | 'outlook' | 'yahoo' | 'apple-mail'
type SupportStatus = 'success' | 'warning' | 'error'

export interface CompatibilityIssue {
  title: string
  url: string
  status: SupportStatus
  unsupportedIn: string[]
}

const clientNicenames: Record<EmailClient, string> = {
  'gmail': 'Gmail',
  'outlook': 'Outlook',
  'yahoo': 'Yahoo! Mail',
  'apple-mail': 'Apple Mail',
}

const relevantClients: EmailClient[] = ['gmail', 'outlook', 'yahoo', 'apple-mail']

// Cache loaded support entries in memory across requests
let cachedEntries: any[] | null = null

async function getSupportEntries(): Promise<any[]> {
  if (cachedEntries)
    return cachedEntries

  // Try to resolve caniemail-data relative to the working directory (dev mode)
  // The CLI sets process.env.MAIL_PLEASE_ROOT to the project root
  const root = process.env.MAIL_PLEASE_ROOT ?? process.cwd()
  const candidates = [
    resolve(root, 'node_modules/@react-email/preview-server/src/actions/email-validation/caniemail-data.js'),
    resolve(root, '../vendor/react-email/packages/preview-server/src/actions/email-validation/caniemail-data.ts'),
  ]

  for (const candidate of candidates) {
    try {
      await readFile(candidate, 'utf-8')
      const mod = await import(candidate)
      cachedEntries = mod.supportEntries ?? []
      return cachedEntries!
    }
    catch {
      // try next
    }
  }

  return []
}

function getUnsupportedClients(entry: any): string[] {
  const unsupportedIn: string[] = []
  for (const client of relevantClients) {
    const rawStats = entry.stats?.[client]
    if (!rawStats)
      continue

    for (const statusPerVersion of Object.values(rawStats) as any[]) {
      const latest = (statusPerVersion as any[])[statusPerVersion.length - 1]
      if (!latest)
        continue
      const statusStr: string = latest[Object.keys(latest)[0]!] ?? ''
      if (statusStr.startsWith('n')) {
        unsupportedIn.push(clientNicenames[client])
        break
      }
    }
  }
  return unsupportedIn
}

function extractHtmlElements(html: string): Set<string> {
  const ast = parse(html)
  const names = new Set<string>()
  ast.querySelectorAll('*').forEach(el => names.add(el.tagName.toLowerCase()))
  return names
}

const RE_STYLE_ATTR = /style="([^"]*)"/gi
const RE_STYLE_TAG = /<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/gi
const RE_CSS_RULE_BODY = /\{([^{}]*)\}/g
const RE_HTML_TITLE_TAG = /<([^>]*)> element/
const RE_CSS_PROP_TITLE = /^([a-z-]+)/i
const RE_KEYWORD_SPLIT = /\s*,\s*/

function extractCssProperties(html: string): Set<string> {
  const properties = new Set<string>()

  function extractFromDeclarationBlock(declarations: string) {
    for (const decl of declarations.split(';')) {
      const colonIdx = decl.indexOf(':')
      if (colonIdx > -1) {
        const prop = decl.slice(0, colonIdx).trim().toLowerCase()
        if (prop)
          properties.add(prop)
      }
    }
  }

  // Parse inline style attributes
  let match: RegExpExecArray | null
  RE_STYLE_ATTR.lastIndex = 0
  match = RE_STYLE_ATTR.exec(html)
  while (match !== null) {
    extractFromDeclarationBlock(match[1]!)
    match = RE_STYLE_ATTR.exec(html)
  }

  // Parse <style> tag contents
  RE_STYLE_TAG.lastIndex = 0
  let styleMatch: RegExpExecArray | null
  styleMatch = RE_STYLE_TAG.exec(html)
  while (styleMatch !== null) {
    const cssText = styleMatch[1]!
    RE_CSS_RULE_BODY.lastIndex = 0
    let ruleMatch: RegExpExecArray | null
    ruleMatch = RE_CSS_RULE_BODY.exec(cssText)
    while (ruleMatch !== null) {
      extractFromDeclarationBlock(ruleMatch[1]!)
      ruleMatch = RE_CSS_RULE_BODY.exec(cssText)
    }
    styleMatch = RE_STYLE_TAG.exec(html)
  }

  return properties
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ html?: string }>(event)

  if (!body?.html) {
    throw createError({ statusCode: 400, message: 'Missing html parameter' })
  }

  const supportEntries = await getSupportEntries()
  if (supportEntries.length === 0) {
    return [] as CompatibilityIssue[]
  }

  const usedElements = extractHtmlElements(body.html)
  const usedCssProperties = extractCssProperties(body.html)

  const issues: CompatibilityIssue[] = []

  for (const entry of supportEntries) {
    const unsupportedIn = getUnsupportedClients(entry)
    if (unsupportedIn.length === 0)
      continue

    let matched = false

    if (entry.category === 'html') {
      const titleMatch = RE_HTML_TITLE_TAG.exec(entry.title)
      if (titleMatch?.[1]) {
        matched = usedElements.has(titleMatch[1].toLowerCase())
      }
      else if (entry.keywords) {
        matched = entry.keywords.toLowerCase().split(RE_KEYWORD_SPLIT).some(
          (kw: string) => usedElements.has(kw.trim()),
        )
      }
    }
    else if (entry.category === 'css') {
      const propMatch = RE_CSS_PROP_TITLE.exec(entry.title)
      if (propMatch?.[1]) {
        matched = usedCssProperties.has(propMatch[1].toLowerCase())
      }
      else if (entry.keywords) {
        matched = entry.keywords.toLowerCase().split(RE_KEYWORD_SPLIT).some(
          (kw: string) => usedCssProperties.has(kw.trim()),
        )
      }
    }

    if (!matched)
      continue

    issues.push({
      title: entry.title,
      url: entry.url,
      status: 'error',
      unsupportedIn,
    })
  }

  return issues
})
