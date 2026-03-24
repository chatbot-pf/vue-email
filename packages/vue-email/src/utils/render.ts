import type { VNode } from 'vue'
import type { HtmlToTextOptions } from 'html-to-text'
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { toPlainText } from './to-plain-text'
import { pretty } from './pretty'

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

export async function render(
  element: VNode,
  options?: RenderOptions,
): Promise<string> {
  const app = createSSRApp({
    render() {
      return element
    },
  })

  const html = await renderToString(app)

  if (options?.plainText) {
    return toPlainText(html, 'htmlToTextOptions' in options ? options.htmlToTextOptions : undefined)
  }

  const document = `${DOCTYPE}${html.replace(/<!DOCTYPE.*?>/i, '')}`

  if (options?.pretty) {
    return pretty(document)
  }

  return document
}
