import { defineComponent } from 'vue'

export interface EHeadProps {}

export const EHead = defineComponent({
  name: 'EHead',
  inheritAttrs: false,
  render() {
    return (
      <head {...this.$attrs}>
        <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
        <meta name="x-apple-disable-message-reformatting" />
        {this.$slots.default?.()}
      </head>
    )
  },
})

export default EHead
