import { defineComponent } from 'vue'

type CSSProperties = Record<string, string | number | undefined>

const marginProperties: (keyof CSSProperties)[] = [
  'margin',
  'marginTop',
  'marginBottom',
  'marginRight',
  'marginLeft',
  'marginInline',
  'marginBlock',
  'marginBlockStart',
  'marginBlockEnd',
  'marginInlineStart',
  'marginInlineEnd',
]

const paddingProperties: (keyof CSSProperties)[] = [
  'padding',
  'paddingTop',
  'paddingBottom',
  'paddingRight',
  'paddingLeft',
  'paddingInline',
  'paddingBlock',
  'paddingBlockStart',
  'paddingBlockEnd',
  'paddingInlineStart',
  'paddingInlineEnd',
]

export const EBody = defineComponent({
  name: 'EBody',
  inheritAttrs: false,
  render() {
    const { style, ...attrs } = this.$attrs as { style?: CSSProperties; [key: string]: unknown }

    const bodyStyle: CSSProperties = {
      background: style?.background as string | undefined,
      backgroundColor: style?.backgroundColor as string | undefined,
    }

    if (style) {
      for (const property of [...marginProperties, ...paddingProperties]) {
        bodyStyle[property] = style[property] !== undefined ? 0 : undefined
      }
    }

    // Remove undefined values from bodyStyle for clean output
    const cleanBodyStyle = Object.fromEntries(
      Object.entries(bodyStyle).filter(([, v]) => v !== undefined),
    )

    return (
      <body
        {...attrs}
        style={Object.keys(cleanBodyStyle).length > 0 ? cleanBodyStyle : undefined}
      >
        <table
          border={0}
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          role="presentation"
          align="center"
        >
          <tbody>
            <tr>
              <td style={style}>{this.$slots.default?.()}</td>
            </tr>
          </tbody>
        </table>
      </body>
    )
  },
})

export default EBody
