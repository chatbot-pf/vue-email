import type { CSSProperties } from 'vue'
import { defineComponent } from 'vue'

export interface EImgProps {
  src?: string
  alt?: string
  width?: number | string
  height?: number | string
  style?: string | CSSProperties
}

const defaultStyle: CSSProperties = {
  display: 'block',
  outline: 'none',
  border: 'none',
  textDecoration: 'none',
}

export const EImg = defineComponent({
  name: 'EImg',
  inheritAttrs: false,
  props: {
    src: {
      type: String,
      default: undefined,
    },
    alt: {
      type: String,
      default: undefined,
    },
    width: {
      type: [Number, String],
      default: undefined,
    },
    height: {
      type: [Number, String],
      default: undefined,
    },
    style: {
      type: [String, Object] as unknown as () => string | CSSProperties,
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    return () => {
      // Use array style binding — Vue merges defaults then user styles (last wins)
      const styleBinding = props.style
        ? [defaultStyle, props.style]
        : defaultStyle
      return (
        <img
          src={props.src}
          alt={props.alt}
          width={props.width}
          height={props.height}
          style={styleBinding}
          {...attrs}
        />
      )
    }
  },
})

export default EImg
