import { defineComponent } from 'vue'

export const ESection = defineComponent({
  name: 'ESection',
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
        <tbody>
          <tr>
            <td>{this.$slots.default?.()}</td>
          </tr>
        </tbody>
      </table>
    )
  },
})

export default ESection
