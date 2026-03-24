import { defineComponent } from 'vue'

const PREVIEW_MAX_LENGTH = 150
const WHITE_SPACE_CODES = '\xa0\u200C\u200B\u200D\u200E\u200F\uFEFF'

function renderWhiteSpace(text: string) {
  if (text.length >= PREVIEW_MAX_LENGTH) {
    return null
  }
  return <div>{WHITE_SPACE_CODES.repeat(PREVIEW_MAX_LENGTH - text.length)}</div>
}

export const EPreview = defineComponent({
  name: 'EPreview',
  inheritAttrs: false,
  render() {
    const slotContent = this.$slots.default?.()
    let text = ''

    if (slotContent && slotContent.length > 0) {
      text = slotContent
        .map((vnode) => {
          if (typeof vnode.children === 'string') {
            return vnode.children
          }
          return String(vnode.children ?? '')
        })
        .join('')
    }

    const truncated = text.substring(0, PREVIEW_MAX_LENGTH)

    return (
      <div
        style={{
          display: 'none',
          overflow: 'hidden',
          lineHeight: '1px',
          opacity: 0,
          maxHeight: 0,
          maxWidth: 0,
        }}
        data-skip-in-text="true"
        {...this.$attrs}
      >
        {truncated}
        {renderWhiteSpace(truncated)}
      </div>
    )
  },
})

export default EPreview
