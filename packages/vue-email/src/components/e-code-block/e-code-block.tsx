import type { CSSProperties } from 'vue'
import type { PrismLanguage } from './languages'
import type { Theme } from './themes'
import * as PrismImport from 'prismjs'
import { defineComponent } from 'vue'

const lineSplitRegex = /\r\n|\r|\n/g

// Avoid import issue in different bundler contexts (same pattern as React Email)
const Prism: typeof import('prismjs') = (PrismImport as any).default ?? PrismImport

export interface ECodeBlockProps {
  code: string
  language: PrismLanguage
  theme: Theme
  lineNumbers?: boolean
  fontFamily?: string
  style?: CSSProperties
}

const SPACE_REPLACEMENT = '\xA0\u200D\u200B'

function stylesForToken(token: Prism.Token, theme: Theme): CSSProperties {
  let styles: CSSProperties = { ...(theme[token.type] ?? {}) }

  const aliases = Array.isArray(token.alias) ? token.alias : [token.alias]
  for (const alias of aliases) {
    if (alias) {
      styles = { ...styles, ...(theme[alias] ?? {}) }
    }
  }

  return styles
}

function renderToken(
  token: string | Prism.Token,
  theme: Theme,
  inheritedStyles?: CSSProperties,
): any {
  if (token instanceof Prism.Token) {
    const styleForToken: CSSProperties = {
      ...inheritedStyles,
      ...stylesForToken(token, theme),
    }

    if (token.content instanceof Prism.Token) {
      return <span style={styleForToken}>{renderToken(token.content, theme)}</span>
    }

    if (typeof token.content === 'string') {
      return <span style={styleForToken}>{token.content}</span>
    }

    // Array of tokens
    return (token.content as (string | Prism.Token)[]).map((subToken, i) => (
      <span key={i}>{renderToken(subToken, theme, styleForToken)}</span>
    ))
  }

  // Plain string token — convert spaces to email-safe characters
  return (
    <span style={inheritedStyles}>
      {token.replaceAll(' ', SPACE_REPLACEMENT)}
    </span>
  )
}

export const ECodeBlock = defineComponent({
  name: 'ECodeBlock',
  inheritAttrs: false,
  props: {
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String as unknown as () => PrismLanguage,
      required: true,
    },
    theme: {
      type: Object as unknown as () => Theme,
      required: true,
    },
    lineNumbers: {
      type: Boolean,
      default: false,
    },
    fontFamily: {
      type: String,
      default: undefined,
    },
    style: {
      type: Object as unknown as () => CSSProperties,
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    return () => {
      const languageGrammar = Prism.languages[props.language as string]
      if (typeof languageGrammar === 'undefined') {
        throw new TypeError(
          `ECodeBlock: There is no language defined on Prism called ${props.language}`,
        )
      }

      const lines = props.code.split(lineSplitRegex)
      const tokensPerLine = lines.map(line => Prism.tokenize(line, languageGrammar))

      const preStyle: CSSProperties = {
        ...props.theme.base,
        width: '100%',
        ...props.style,
      }

      return (
        <pre {...attrs} style={preStyle}>
          <code>
            {tokensPerLine.map((tokensForLine, lineIndex) => (
              <>
                {props.lineNumbers
                  ? (
                      <span
                        style={{
                          width: '2em',
                          height: '1em',
                          display: 'inline-block',
                          fontFamily: props.fontFamily,
                        }}
                      >
                        {lineIndex + 1}
                      </span>
                    )
                  : null}
                {tokensForLine.map(token =>
                  renderToken(token, props.theme, { fontFamily: props.fontFamily }),
                )}
                <br />
              </>
            ))}
          </code>
        </pre>
      )
    }
  },
})

export default ECodeBlock
