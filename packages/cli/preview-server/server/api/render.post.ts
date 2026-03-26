import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { render } from '@mail-please/vue-email'
import { h } from 'vue'
import { createTemplateBundler } from '../../src/utils/bundling'

const RE_EMAIL_EXT = /\.(vue|tsx|jsx|js)$/

export interface RenderResult {
  html: string
  prettyHtml: string
  plainText: string
  source: string
  basename: string
  extname: string
}

export interface RenderErrorResult {
  error: {
    name: string
    message: string
    stack?: string
  }
}

// Lazily-created bundler shared across requests
let bundlerPromise: ReturnType<typeof createTemplateBundler> | undefined

async function getBundler() {
  const emailsDir = process.env.MAIL_PLEASE_EMAILS_DIR ?? process.cwd()
  if (!bundlerPromise) {
    bundlerPromise = createTemplateBundler(emailsDir)
  }
  return bundlerPromise
}

export default defineEventHandler(async (event): Promise<RenderResult | RenderErrorResult> => {
  const body = await readBody<{ slug: string, invalidateCache?: boolean }>(event)

  if (!body?.slug) {
    throw createError({ statusCode: 400, message: 'Missing slug parameter' })
  }

  const emailsDir = process.env.MAIL_PLEASE_EMAILS_DIR
  if (!emailsDir) {
    throw createError({
      statusCode: 500,
      message: 'MAIL_PLEASE_EMAILS_DIR environment variable is not set',
    })
  }

  // Resolve absolute path — try with extension then without
  const extensions = ['.vue', '.tsx', '.jsx', '.js']
  let absolutePath: string | undefined

  const slugWithoutExt = body.slug.replace(RE_EMAIL_EXT, '')
  const candidates = [
    path.join(emailsDir, body.slug),
    ...extensions.map(ext => path.join(emailsDir, `${slugWithoutExt}${ext}`)),
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      absolutePath = candidate
      break
    }
  }

  if (!absolutePath) {
    throw createError({ statusCode: 404, message: `Template not found: ${body.slug}` })
  }

  const basename = path.basename(absolutePath, path.extname(absolutePath))
  const extname = path.extname(absolutePath).slice(1)

  try {
    const bundler = await getBundler()

    const mod = await bundler.loadComponent(absolutePath)
    const Component = (mod.default ?? mod) as object

    const vnode = h(Component as Parameters<typeof h>[0])

    const [html, prettyHtml, plainText, source] = await Promise.all([
      render(vnode),
      render(vnode, { pretty: true }),
      render(vnode, { plainText: true }),
      fs.promises.readFile(absolutePath, 'utf-8'),
    ])

    return {
      html,
      prettyHtml,
      plainText,
      source,
      basename,
      extname,
    }
  }
  catch (err) {
    const error = err as Error
    setResponseStatus(event, 500)
    return {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    }
  }
})
