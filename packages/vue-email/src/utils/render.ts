import type { HtmlToTextOptions } from 'html-to-text'
import type { VNode } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp } from 'vue'
import { pretty } from './pretty'
import { toPlainText } from './to-plain-text'

export type RenderOptions = {
  pretty?: boolean
} & (
  | { plainText?: false }
  | {
    plainText?: true
    htmlToTextOptions?: HtmlToTextOptions
  }
)

const DOCTYPE = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
const doctypeRegex = /<!DOCTYPE.*?>/i

export async function render(
  element: VNode,
  options?: RenderOptions,
): Promise<string> {
  const app = createSSRApp({
    render() {
      return element
    },
  })

  let html: string
  try {
    html = await renderToString(app)
  }
  catch (error) {
    app.unmount()
    throw new Error(
      `vue-email render failed: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    )
  }

  if (options?.plainText) {
    return toPlainText(html, 'htmlToTextOptions' in options ? options.htmlToTextOptions : undefined)
  }

  const document = `${DOCTYPE}${html.replace(doctypeRegex, '')}`

  if (options?.pretty) {
    return pretty(document)
  }

  return document
}
