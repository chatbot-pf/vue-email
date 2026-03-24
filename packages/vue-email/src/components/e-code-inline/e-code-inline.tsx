import { defineComponent } from 'vue'

export const ECodeInline = defineComponent({
  name: 'ECodeInline',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => {
      const { class: className, style, ...restAttrs } = attrs as Record<string, unknown>

      const classStr = className ? `${className} ` : ''

      const spanStyle = {
        display: 'none',
        ...(style !== null && typeof style === 'object' && !Array.isArray(style)
          ? (style as Record<string, string>)
          : {}),
      }

      return (
        <>
          <style>
            {`
        meta ~ .cino {
          display: none !important;
          opacity: 0 !important;
        }

        meta ~ .cio {
          display: block !important;
        }
      `}
          </style>

          <code class={`${classStr}cino`} {...restAttrs}>
            {slots.default?.()}
          </code>

          <span class={`${classStr}cio`} style={spanStyle} {...restAttrs}>
            {slots.default?.()}
          </span>
        </>
      )
    }
  },
})

export default ECodeInline
