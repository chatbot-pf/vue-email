import type { IncomingMessage } from 'node:http'
import http from 'node:http'
import https from 'node:https'
import { parse } from 'node-html-parser'

export interface CodeLocation {
  line: number
  column: number
}

export type ImageCheck = { passed: boolean } & (
  | { type: 'accessibility', metadata: { alt: string | undefined } }
  | { type: 'fetch_attempt', metadata: { fetchStatusCode: number | undefined } }
  | { type: 'image_size', metadata: { byteCount: number | undefined } }
  | { type: 'syntax' }
  | { type: 'security' }
)

export interface ImageCheckingResult {
  status: 'success' | 'warning' | 'error'
  source: string
  codeLocation: CodeLocation
  checks: ImageCheck[]
}

export type LinkCheck = { passed: boolean } & (
  | { type: 'fetch_attempt', metadata: { fetchStatusCode: number | undefined } }
  | { type: 'syntax' }
  | { type: 'security' }
)

export interface LinkCheckingResult {
  status: 'success' | 'warning' | 'error'
  link: string
  codeLocation: CodeLocation
  checks: LinkCheck[]
}

export type LintingRow
  = | { source: 'image', result: ImageCheckingResult }
    | { source: 'link', result: LinkCheckingResult }

function getLineAndColumn(offset: number, html: string): [number, number] {
  const before = html.slice(0, offset)
  const lines = before.split('\n')
  const line = lines.length
  const column = (lines.at(-1)?.length ?? 0) + 1
  return [line, column]
}

function quickFetch(url: URL): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    const caller = url.protocol === 'https:' ? https : http
    caller.get(url, resolve).on('error', reject)
  })
}

async function getResponseSizeBytes(res: IncomingMessage): Promise<number> {
  let total = 0
  for await (const chunk of res) {
    total += chunk.byteLength
  }
  return total
}

async function checkImages(
  html: string,
  base: string,
): Promise<ImageCheckingResult[]> {
  const ast = parse(html)
  const results: ImageCheckingResult[] = []

  for (const image of ast.querySelectorAll('img')) {
    const rawSource = image.attributes.src
    if (!rawSource)
      continue

    // Resolve relative and root-relative paths against base
    const source = (rawSource.startsWith('/') || !rawSource.includes('://')) && base
      ? new URL(rawSource, base).href
      : rawSource
    const [line, column] = getLineAndColumn(image.range[0], html)
    const result: ImageCheckingResult = {
      source: rawSource,
      codeLocation: { line, column },
      status: 'success',
      checks: [],
    }

    const alt = image.attributes.alt
    result.checks.push({ passed: alt !== undefined, type: 'accessibility', metadata: { alt } })
    if (alt === undefined)
      result.status = 'warning'

    try {
      const url = new URL(source)
      result.checks.push({ passed: true, type: 'syntax' })

      if (rawSource.startsWith('http://')) {
        result.checks.push({ passed: false, type: 'security' })
        result.status = 'warning'
      }
      else {
        result.checks.push({ passed: true, type: 'security' })
      }

      try {
        const res = await quickFetch(url)
        const hasSucceeded = res.statusCode?.toString().startsWith('2') ?? false
        result.checks.push({
          type: 'fetch_attempt',
          passed: hasSucceeded,
          metadata: { fetchStatusCode: res.statusCode },
        })
        if (!hasSucceeded) {
          result.status = res.statusCode?.toString().startsWith('3') ? 'warning' : 'error'
        }

        const bytes = await getResponseSizeBytes(res)
        result.checks.push({
          type: 'image_size',
          passed: bytes < 1_048_576,
          metadata: { byteCount: bytes },
        })
        if (bytes > 1_048_576 && result.status !== 'error') {
          result.status = 'warning'
        }
      }
      catch {
        result.checks.push({ type: 'fetch_attempt', passed: false, metadata: { fetchStatusCode: undefined } })
        result.status = 'error'
      }
    }
    catch {
      result.checks.push({ passed: false, type: 'syntax' })
      result.status = 'error'
    }

    results.push(result)
  }

  return results
}

async function checkLinks(html: string, base: string): Promise<LinkCheckingResult[]> {
  const ast = parse(html)
  const results: LinkCheckingResult[] = []

  for (const anchor of ast.querySelectorAll('a')) {
    const link = anchor.attributes.href
    if (!link)
      continue
    if (link.startsWith('mailto:'))
      continue

    const [line, column] = getLineAndColumn(anchor.range[0], html)
    const result: LinkCheckingResult = {
      link,
      codeLocation: { line, column },
      status: 'success',
      checks: [],
    }

    try {
      const url = new URL(link, base || undefined)
      result.checks.push({ passed: true, type: 'syntax' })

      if (link.startsWith('http://')) {
        result.checks.push({ passed: false, type: 'security' })
        result.status = 'warning'
      }
      else {
        result.checks.push({ passed: true, type: 'security' })
      }

      try {
        const res = await quickFetch(url)
        const hasSucceeded = res.statusCode?.toString().startsWith('2') ?? false
        res.resume()
        result.checks.push({
          type: 'fetch_attempt',
          passed: hasSucceeded,
          metadata: { fetchStatusCode: res.statusCode },
        })
        if (!hasSucceeded) {
          result.status = res.statusCode?.toString().startsWith('3') ? 'warning' : 'error'
        }
      }
      catch {
        result.checks.push({ type: 'fetch_attempt', passed: false, metadata: { fetchStatusCode: undefined } })
        result.status = 'error'
      }
    }
    catch {
      result.checks.push({ passed: false, type: 'syntax' })
      result.status = 'error'
    }

    results.push(result)
  }

  return results
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ html: string, base?: string }>(event)
  const base = body.base ?? ''

  const [imageResults, linkResults] = await Promise.all([
    checkImages(body.html, base),
    checkLinks(body.html, base),
  ])

  const rows: LintingRow[] = []

  for (const result of imageResults) {
    if (result.status !== 'success') {
      rows.push({ source: 'image', result })
    }
  }

  for (const result of linkResults) {
    if (result.status !== 'success') {
      rows.push({ source: 'link', result })
    }
  }

  rows.sort((a, b) => {
    if (a.result.status === 'error' && b.result.status === 'warning')
      return -1
    if (a.result.status === 'warning' && b.result.status === 'error')
      return 1
    return 0
  })

  return rows
})
