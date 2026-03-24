import type { CSSProperties } from 'vue'
import { defineComponent } from 'vue'

const kebabToCamelRegex = /-([a-z])/g

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

type MarginCSSProperty
  = | 'margin'
    | 'marginLeft'
    | 'marginRight'
    | 'marginTop'
    | 'marginBottom'

type MarginStyles = Partial<Pick<CSSProperties, MarginCSSProperty>>

export interface EHeadingProps {
  as?: HeadingTag
  m?: number | string
  mx?: number | string
  my?: number | string
  mt?: number | string
  mr?: number | string
  mb?: number | string
  ml?: number | string
  style?: string | CSSProperties
}

function withSpace(
  value: number | string | undefined,
  properties: MarginCSSProperty[],
): MarginStyles {
  const styles: MarginStyles = {}

  if (value === undefined) {
    return styles
  }

  if (Number.isNaN(Number.parseFloat(String(value)))) {
    return styles
  }

  for (const property of properties) {
    styles[property] = `${value}px`
  }

  return styles
}

function withMargin(props: {
  m?: number | string
  mx?: number | string
  my?: number | string
  mt?: number | string
  mr?: number | string
  mb?: number | string
  ml?: number | string
}): MarginStyles {
  const candidates = [
    withSpace(props.m, ['margin']),
    withSpace(props.mx, ['marginLeft', 'marginRight']),
    withSpace(props.my, ['marginTop', 'marginBottom']),
    withSpace(props.mt, ['marginTop']),
    withSpace(props.mr, ['marginRight']),
    withSpace(props.mb, ['marginBottom']),
    withSpace(props.ml, ['marginLeft']),
  ]

  const mergedStyles: MarginStyles = {}

  for (const style of candidates) {
    if (Object.keys(style).length > 0) {
      Object.assign(mergedStyles, style)
    }
  }

  return mergedStyles
}

function parseStyleString(style: string | undefined): CSSProperties {
  if (!style)
    return {}
  const result: Record<string, string> = {}
  for (const declaration of style.split(';')) {
    const [prop, ...rest] = declaration.split(':')
    if (prop && rest.length > 0) {
      const camelProp = prop.trim().replace(kebabToCamelRegex, (_, c: string) => c.toUpperCase())
      result[camelProp] = rest.join(':').trim()
    }
  }
  return result as CSSProperties
}

export const EHeading = defineComponent({
  name: 'EHeading',
  inheritAttrs: false,
  props: {
    as: {
      type: String as unknown as () => HeadingTag,
      default: 'h1',
    },
    m: {
      type: [Number, String] as unknown as () => number | string,
      default: undefined,
    },
    mx: {
      type: [Number, String] as unknown as () => number | string,
      default: undefined,
    },
    my: {
      type: [Number, String] as unknown as () => number | string,
      default: undefined,
    },
    mt: {
      type: [Number, String] as unknown as () => number | string,
      default: undefined,
    },
    mr: {
      type: [Number, String] as unknown as () => number | string,
      default: undefined,
    },
    mb: {
      type: [Number, String] as unknown as () => number | string,
      default: undefined,
    },
    ml: {
      type: [Number, String] as unknown as () => number | string,
      default: undefined,
    },
    style: {
      type: [String, Object] as unknown as () => string | CSSProperties,
      default: undefined,
    },
  },
  render() {
    const Tag = this.as as HeadingTag
    const styleObj: CSSProperties = typeof this.style === 'string'
      ? parseStyleString(this.style)
      : (this.style as CSSProperties | undefined) ?? {}

    const marginStyles = withMargin({
      m: this.m,
      mx: this.mx,
      my: this.my,
      mt: this.mt,
      mr: this.mr,
      mb: this.mb,
      ml: this.ml,
    })

    const computedStyle: CSSProperties = {
      ...marginStyles,
      ...styleObj,
    }

    return (
      <Tag
        {...this.$attrs}
        style={computedStyle}
      >
        {this.$slots.default?.()}
      </Tag>
    )
  },
})

export default EHeading
