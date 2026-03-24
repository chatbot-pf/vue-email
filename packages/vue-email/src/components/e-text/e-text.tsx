import { type CSSProperties, defineComponent } from 'vue'

type MarginType = string | number | undefined

interface MarginResult {
  marginTop: MarginType
  marginRight: MarginType
  marginBottom: MarginType
  marginLeft: MarginType
}

function parseMarginValue(value: MarginType): MarginResult {
  if (typeof value === 'number') {
    return {
      marginTop: value,
      marginBottom: value,
      marginLeft: value,
      marginRight: value,
    }
  }

  if (typeof value === 'string') {
    const values = value.trim().split(/\s+/)

    if (values.length === 1) {
      return {
        marginTop: values[0],
        marginBottom: values[0],
        marginLeft: values[0],
        marginRight: values[0],
      }
    }

    if (values.length === 2) {
      return {
        marginTop: values[0],
        marginRight: values[1],
        marginBottom: values[0],
        marginLeft: values[1],
      }
    }

    if (values.length === 3) {
      return {
        marginTop: values[0],
        marginRight: values[1],
        marginBottom: values[2],
        marginLeft: values[1],
      }
    }

    if (values.length === 4) {
      return {
        marginTop: values[0],
        marginRight: values[1],
        marginBottom: values[2],
        marginLeft: values[3],
      }
    }
  }

  return {
    marginTop: undefined,
    marginBottom: undefined,
    marginLeft: undefined,
    marginRight: undefined,
  }
}

interface MarginProperties {
  margin?: MarginType
  marginTop?: MarginType
  marginRight?: MarginType
  marginBottom?: MarginType
  marginLeft?: MarginType
}

function computeMargins(properties: MarginProperties): MarginResult {
  let result: MarginResult = {
    marginTop: undefined,
    marginRight: undefined,
    marginBottom: undefined,
    marginLeft: undefined,
  }

  for (const [key, value] of Object.entries(properties)) {
    if (key === 'margin') {
      result = parseMarginValue(value)
    }
    else if (key === 'marginTop') {
      result.marginTop = value
    }
    else if (key === 'marginRight') {
      result.marginRight = value
    }
    else if (key === 'marginBottom') {
      result.marginBottom = value
    }
    else if (key === 'marginLeft') {
      result.marginLeft = value
    }
  }

  return result
}

function parseStyleString(style: string): CSSProperties {
  const result: Record<string, string> = {}
  for (const declaration of style.split(';')) {
    const colonIdx = declaration.indexOf(':')
    if (colonIdx === -1)
      continue
    const prop = declaration.slice(0, colonIdx).trim()
    const val = declaration.slice(colonIdx + 1).trim()
    if (!prop || !val)
      continue
    const camelProp = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    result[camelProp] = val
  }
  return result as CSSProperties
}

export const EText = defineComponent({
  name: 'EText',
  inheritAttrs: false,
  render() {
    // Extract style from $attrs to handle it ourselves
    const rawAttrs = this.$attrs
    const attrStyle = rawAttrs.style

    let styleObj: CSSProperties = {}
    if (typeof attrStyle === 'string') {
      styleObj = parseStyleString(attrStyle)
    }
    else if (attrStyle && typeof attrStyle === 'object') {
      styleObj = attrStyle as CSSProperties
    }

    const defaultMargins: CSSProperties = {}
    if ((styleObj as MarginProperties).marginTop === undefined && (styleObj as MarginProperties).margin === undefined) {
      defaultMargins.marginTop = '16px'
    }
    if ((styleObj as MarginProperties).marginBottom === undefined && (styleObj as MarginProperties).margin === undefined) {
      defaultMargins.marginBottom = '16px'
    }

    const margins = computeMargins({
      ...defaultMargins,
      ...(styleObj as MarginProperties),
    })

    // Remove shorthand and individual margin props from styleObj — replaced by expanded margins
    const { margin: _m, marginTop: _mt, marginRight: _mr, marginBottom: _mb, marginLeft: _ml, ...nonMarginStyle } = styleObj as CSSProperties & { margin?: string }

    const computedStyle: CSSProperties = {
      fontSize: '14px',
      lineHeight: '24px',
      ...nonMarginStyle,
      ...margins,
    }

    // Build attrs without style — we handle style ourselves
    const attrsWithoutStyle: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(rawAttrs)) {
      if (key !== 'style') {
        attrsWithoutStyle[key] = val
      }
    }

    return (
      <p
        {...attrsWithoutStyle}
        style={computedStyle}
      >
        {this.$slots.default?.()}
      </p>
    )
  },
})

export default EText
