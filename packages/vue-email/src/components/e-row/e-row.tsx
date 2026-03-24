import { defineComponent } from 'vue'

export const ERow = defineComponent({
  name: 'ERow',
  inheritAttrs: false,
  render() {
    return (
      <table
        align="center"
        width="100%"
        border={0}
        cellPadding="0"
        cellSpacing="0"
        role="presentation"
        {...this.$attrs}
      >
        <tbody style={{ width: '100%' }}>
          <tr style={{ width: '100%' }}>{this.$slots.default?.()}</tr>
        </tbody>
      </table>
    )
  },
})

export default ERow
