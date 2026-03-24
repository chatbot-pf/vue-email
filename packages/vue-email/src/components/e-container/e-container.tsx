import { defineComponent } from 'vue'

export const EContainer = defineComponent({
  name: 'EContainer',
  inheritAttrs: false,
  render() {
    const { style, ...attrs } = this.$attrs as Record<string, unknown>
    return (
      <table
        align="center"
        width="100%"
        {...attrs}
        border={0}
        cellPadding="0"
        cellSpacing="0"
        role="presentation"
        style={{ maxWidth: '37.5em', ...(style as object | undefined) }}
      >
        <tbody>
          <tr style={{ width: '100%' }}>
            <td>{this.$slots.default?.()}</td>
          </tr>
        </tbody>
      </table>
    )
  },
})

export default EContainer
