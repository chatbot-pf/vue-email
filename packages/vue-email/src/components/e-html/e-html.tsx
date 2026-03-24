import { defineComponent } from 'vue'

export interface EHtmlProps {
  lang?: string
  dir?: string
}

export const EHtml = defineComponent({
  name: 'EHtml',
  inheritAttrs: false,
  props: {
    lang: {
      type: String,
      default: 'en',
    },
    dir: {
      type: String,
      default: 'ltr',
    },
  },
  render() {
    return (
      <html
        {...this.$attrs}
        lang={this.lang}
        dir={this.dir}
      >
        {this.$slots.default?.()}
      </html>
    )
  },
})

export default EHtml
