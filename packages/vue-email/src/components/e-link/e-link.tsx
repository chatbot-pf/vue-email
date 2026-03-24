import type { CSSProperties } from 'vue'
import { defineComponent } from 'vue'

export interface ELinkProps {
  href?: string
  target?: string
  style?: string | CSSProperties
}

const defaultStyle: CSSProperties = {
  color: '#067df7',
  textDecorationLine: 'none',
}

export const ELink = defineComponent({
  name: 'ELink',
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
      type: [String, Object] as unknown as () => string | CSSProperties,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    return () => {
      // Use array style binding — Vue merges defaults then user styles (last wins)
      const styleBinding = props.style
        ? [defaultStyle, props.style]
        : defaultStyle
      return (
        <a
          href={props.href}
          target={props.target}
          style={styleBinding}
          {...attrs}
        >
          {slots.default?.()}
        </a>
      )
    }
  },
})

export default ELink
