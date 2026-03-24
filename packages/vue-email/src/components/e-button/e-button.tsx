import type { CSSProperties } from 'vue'
import { defineComponent } from 'vue'
import { computeFontWidthAndSpaceCount, parsePadding, pxToPt } from './utils'

export interface EButtonProps {
  href?: string
  target?: string
  style?: CSSProperties
}

export const EButton = defineComponent({
  name: 'EButton',
  inheritAttrs: false,
  props: {
    href: {
      type: String,
      default: undefined,
    },
    target: {
      type: String,
      default: '_blank',
    },
    style: {
      type: Object as unknown as () => CSSProperties,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const { paddingTop, paddingRight, paddingBottom, paddingLeft } = parsePadding(
        props.style ?? {},
      )

      const y = (paddingTop ?? 0) + (paddingBottom ?? 0)
      const textRaise = pxToPt(y)

      const [plFontWidth, plSpaceCount] = computeFontWidthAndSpaceCount(paddingLeft ?? 0)
      const [prFontWidth, prSpaceCount] = computeFontWidthAndSpaceCount(paddingRight ?? 0)

      const anchorStyle: CSSProperties = {
        lineHeight: '100%',
        textDecoration: 'none',
        display: 'inline-block',
        maxWidth: '100%',
        msoPaddingAlt: '0px',
        ...props.style,
        ...(paddingTop != null ? { paddingTop: `${paddingTop}px` } : {}),
        ...(paddingRight != null ? { paddingRight: `${paddingRight}px` } : {}),
        ...(paddingBottom != null ? { paddingBottom: `${paddingBottom}px` } : {}),
        ...(paddingLeft != null ? { paddingLeft: `${paddingLeft}px` } : {}),
      }

      const leftMsoHtml = `<!--[if mso]><i style="mso-font-width:${plFontWidth * 100}%;mso-text-raise:${textRaise}" hidden>${'&#8202;'.repeat(plSpaceCount)}</i><![endif]-->`

      const rightMsoHtml = `<!--[if mso]><i style="mso-font-width:${prFontWidth * 100}%" hidden>${'&#8202;'.repeat(prSpaceCount)}&#8203;</i><![endif]-->`

      const middleSpanStyle: CSSProperties = {
        maxWidth: '100%',
        display: 'inline-block',
        lineHeight: '120%',
        msoPaddingAlt: '0px',
        msoTextRaise: pxToPt(paddingBottom),
      }

      return (
        <a href={props.href} target={props.target} style={anchorStyle} {...attrs}>
          <span innerHTML={leftMsoHtml} />
          <span style={middleSpanStyle}>{slots.default?.()}</span>
          <span innerHTML={rightMsoHtml} />
        </a>
      )
    }
  },
})

export default EButton
