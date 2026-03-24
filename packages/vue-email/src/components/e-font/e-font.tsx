import { type CSSProperties, defineComponent } from 'vue'

type FallbackFont =
  | 'Arial'
  | 'Helvetica'
  | 'Verdana'
  | 'Georgia'
  | 'Times New Roman'
  | 'serif'
  | 'sans-serif'
  | 'monospace'
  | 'cursive'
  | 'fantasy'

type FontFormat =
  | 'woff'
  | 'woff2'
  | 'truetype'
  | 'opentype'
  | 'embedded-opentype'
  | 'svg'

type FontWeight = CSSProperties['fontWeight']
type FontStyle = CSSProperties['fontStyle']

export interface EFontProps {
  fontFamily: string
  fallbackFontFamily: FallbackFont | FallbackFont[]
  webFont?: {
    url: string
    format: FontFormat
  }
  fontStyle?: FontStyle
  fontWeight?: FontWeight
}

export const EFont = defineComponent({
  name: 'EFont',
  inheritAttrs: false,
  props: {
    fontFamily: {
      type: String,
      required: true,
    },
    fallbackFontFamily: {
      type: [String, Array] as unknown as () => FallbackFont | FallbackFont[],
      required: true,
    },
    webFont: {
      type: Object as unknown as () => { url: string, format: FontFormat } | undefined,
      default: undefined,
    },
    fontStyle: {
      type: String as unknown as () => FontStyle,
      default: 'normal',
    },
    fontWeight: {
      type: [Number, String] as unknown as () => FontWeight,
      default: 400,
    },
  },
  render() {
    const src = this.webFont
      ? `src: url(${this.webFont.url}) format('${this.webFont.format}');`
      : ''

    const fallback = this.fallbackFontFamily
    const msoFallback = Array.isArray(fallback) ? fallback[0] : fallback
    const fallbackList = Array.isArray(fallback) ? fallback.join(', ') : fallback

    const css = `
    @font-face {
      font-family: '${this.fontFamily}';
      font-style: ${this.fontStyle};
      font-weight: ${this.fontWeight};
      mso-font-alt: '${msoFallback}';
      ${src}
    }

    * {
      font-family: '${this.fontFamily}', ${fallbackList};
    }
  `

    return <style innerHTML={css} />
  },
})

export default EFont
