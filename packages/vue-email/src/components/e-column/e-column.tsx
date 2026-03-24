import type { CSSProperties } from 'vue'
import { defineComponent } from 'vue'

export interface EColumnProps {
  style?: string | CSSProperties
}

export const EColumn = defineComponent({
  name: 'EColumn',
  inheritAttrs: false,
  props: {
    style: {
      type: [String, Object] as unknown as () => string | CSSProperties,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const { ...restAttrs } = attrs as Record<string, unknown>
      return (
        <td
          data-id="__react-email-column"
          style={props.style as CSSProperties | undefined}
          {...restAttrs}
        >
          {slots.default?.()}
        </td>
      )
    }
  },
})

export default EColumn
