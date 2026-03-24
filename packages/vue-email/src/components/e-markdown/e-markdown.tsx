import type { CSSProperties, VNode } from 'vue'
import type { StylesType } from './styles'
import { marked, Renderer } from 'marked'
import { defineComponent } from 'vue'
import { parseCssInJsToInlineCss } from './parse-css-in-js-to-inline-css'
import { styles as defaultStyles } from './styles'

const trailingNewlineRegex = /\n$/

function extractTextFromVNodes(vnodes: VNode[]): string {
  return vnodes
    .map((vnode) => {
      if (typeof vnode.children === 'string') {
        return vnode.children
      }
      if (Array.isArray(vnode.children)) {
        return extractTextFromVNodes(vnode.children as VNode[])
      }
      return ''
    })
    .join('')
}

export interface EMarkdownProps {
  children?: string
  markdownCustomStyles?: StylesType
  markdownContainerStyles?: CSSProperties
}

export const EMarkdown = defineComponent({
  name: 'EMarkdown',
  inheritAttrs: false,
  props: {
    children: {
      type: String,
      default: undefined,
    },
    markdownCustomStyles: {
      type: Object as unknown as () => StylesType,
      default: undefined,
    },
    markdownContainerStyles: {
      type: Object as unknown as () => CSSProperties,
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const finalStyles: StylesType = { ...defaultStyles, ...props.markdownCustomStyles }

      const renderer = new Renderer()

      renderer.blockquote = ({ tokens }) => {
        const text = renderer.parser.parse(tokens)
        const style = parseCssInJsToInlineCss(finalStyles.blockQuote as Record<string, unknown>)
        return `<blockquote${style !== '' ? ` style="${style}"` : ''}>\n${text}</blockquote>\n`
      }

      renderer.br = () => {
        const style = parseCssInJsToInlineCss(finalStyles.br as Record<string, unknown>)
        return `<br${style !== '' ? ` style="${style}"` : ''} />`
      }

      renderer.code = ({ text }) => {
        const normalized = `${text.replace(trailingNewlineRegex, '')}\n`
        const style = parseCssInJsToInlineCss(finalStyles.codeBlock as Record<string, unknown>)
        return `<pre${style !== '' ? ` style="${style}"` : ''}><code>${normalized}</code></pre>\n`
      }

      renderer.codespan = ({ text }) => {
        const style = parseCssInJsToInlineCss(finalStyles.codeInline as Record<string, unknown>)
        return `<code${style !== '' ? ` style="${style}"` : ''}>${text}</code>`
      }

      renderer.del = ({ tokens }) => {
        const text = renderer.parser.parseInline(tokens)
        const style = parseCssInJsToInlineCss(finalStyles.strikethrough as Record<string, unknown>)
        return `<del${style !== '' ? ` style="${style}"` : ''}>${text}</del>`
      }

      renderer.em = ({ tokens }) => {
        const text = renderer.parser.parseInline(tokens)
        const style = parseCssInJsToInlineCss(finalStyles.italic as Record<string, unknown>)
        return `<em${style !== '' ? ` style="${style}"` : ''}>${text}</em>`
      }

      renderer.heading = ({ tokens, depth }) => {
        const text = renderer.parser.parseInline(tokens)
        const key = `h${depth}` as keyof StylesType
        const style = parseCssInJsToInlineCss(finalStyles[key] as Record<string, unknown>)
        return `<h${depth}${style !== '' ? ` style="${style}"` : ''}>${text}</h${depth}>`
      }

      renderer.hr = () => {
        const style = parseCssInJsToInlineCss(finalStyles.hr as Record<string, unknown>)
        return `<hr${style !== '' ? ` style="${style}"` : ''} />\n`
      }

      renderer.image = ({ href, text, title }) => {
        const style = parseCssInJsToInlineCss(finalStyles.image as Record<string, unknown>)
        return `<img src="${href.replaceAll('"', '&quot;')}" alt="${text.replaceAll('"', '&quot;')}"${
          title ? ` title="${title}"` : ''
        }${style !== '' ? ` style="${style}"` : ''}>`
      }

      renderer.link = ({ href, title, tokens }) => {
        const text = renderer.parser.parseInline(tokens)
        const style = parseCssInJsToInlineCss(finalStyles.link as Record<string, unknown>)
        return `<a href="${href}" target="_blank"${title ? ` title="${title}"` : ''}${
          style !== '' ? ` style="${style}"` : ''
        }>${text}</a>`
      }

      renderer.listitem = (item) => {
        const hasNestedList = item.tokens.some(token => token.type === 'list')
        const text = hasNestedList
          ? renderer.parser.parse(item.tokens)
          : renderer.parser.parseInline(item.tokens)
        const style = parseCssInJsToInlineCss(finalStyles.li as Record<string, unknown>)
        return `<li${style !== '' ? ` style="${style}"` : ''}>${text}</li>\n`
      }

      renderer.list = (token) => {
        const type = token.ordered ? 'ol' : 'ul'
        const startAt = token.ordered && token.start !== 1 ? ` start="${token.start}"` : ''
        const styleKey = token.ordered ? 'ol' : 'ul'
        const listStyle = parseCssInJsToInlineCss(finalStyles[styleKey] as Record<string, unknown>)
        return (
          `<${type}${startAt}${listStyle !== '' ? ` style="${listStyle}"` : ''}>\n${
            token.items.map(item => renderer.listitem(item)).join('')
          }</${type}>\n`
        )
      }

      renderer.paragraph = ({ tokens }) => {
        const text = renderer.parser.parseInline(tokens)
        const style = parseCssInJsToInlineCss(finalStyles.p as Record<string, unknown>)
        return `<p${style !== '' ? ` style="${style}"` : ''}>${text}</p>\n`
      }

      renderer.strong = ({ tokens }) => {
        const text = renderer.parser.parseInline(tokens)
        const style = parseCssInJsToInlineCss(finalStyles.bold as Record<string, unknown>)
        return `<strong${style !== '' ? ` style="${style}"` : ''}>${text}</strong>`
      }

      renderer.table = (token) => {
        const styleTable = parseCssInJsToInlineCss(finalStyles.table as Record<string, unknown>)
        const styleThead = parseCssInJsToInlineCss(finalStyles.thead as Record<string, unknown>)
        const styleTbody = parseCssInJsToInlineCss(finalStyles.tbody as Record<string, unknown>)

        const theadRow = renderer.tablerow({
          text: token.header.map(cell => renderer.tablecell(cell)).join(''),
        })

        const tbodyRows = token.rows
          .map(row =>
            renderer.tablerow({
              text: row.map(cell => renderer.tablecell(cell)).join(''),
            }),
          )
          .join('')

        const thead = `<thead${styleThead ? ` style="${styleThead}"` : ''}>\n${theadRow}</thead>`
        const tbody = `<tbody${styleTbody ? ` style="${styleTbody}"` : ''}>${tbodyRows}</tbody>`

        return `<table${styleTable ? ` style="${styleTable}"` : ''}>\n${thead}\n${tbody}</table>\n`
      }

      renderer.tablecell = (token) => {
        const text = renderer.parser.parseInline(token.tokens)
        const type = token.header ? 'th' : 'td'
        const style = parseCssInJsToInlineCss(finalStyles.td as Record<string, unknown>)
        const tag = token.align
          ? `<${type} align="${token.align}"${style !== '' ? ` style="${style}"` : ''}>`
          : `<${type}${style !== '' ? ` style="${style}"` : ''}>`
        return `${tag}${text}</${type}>\n`
      }

      renderer.tablerow = ({ text }) => {
        const style = parseCssInJsToInlineCss(finalStyles.tr as Record<string, unknown>)
        return `<tr${style !== '' ? ` style="${style}"` : ''}>\n${text}</tr>\n`
      }

      // Extract markdown string: prefer children prop, fall back to default slot
      let markdown = props.children ?? ''
      if (!markdown) {
        const slotContent = slots.default?.()
        if (slotContent && slotContent.length > 0) {
          markdown = extractTextFromVNodes(slotContent)
        }
      }

      const html = marked.parse(markdown, {
        renderer,
        async: false,
      }) as string

      return (
        <div
          {...attrs}
          data-id="vue-email-markdown"
          style={props.markdownContainerStyles}
          innerHTML={html}
        />
      )
    }
  },
})

export default EMarkdown
