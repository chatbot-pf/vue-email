import { defineComponent } from 'vue'

export interface EHrProps {}

export const EHr = defineComponent({
  name: 'EHr',
  inheritAttrs: false,
  render() {
    const { style, ...restAttrs } = this.$attrs as Record<string, unknown>

    const defaultStyle = {
      width: '100%',
      border: 'none',
      borderTop: '1px solid #eaeaea',
    }

    const mergedStyle = {
      ...defaultStyle,
      ...(style as Record<string, string> | undefined),
    }

    return (
      <hr
        {...restAttrs}
        style={mergedStyle}
      />
    )
  },
})

export default EHr
