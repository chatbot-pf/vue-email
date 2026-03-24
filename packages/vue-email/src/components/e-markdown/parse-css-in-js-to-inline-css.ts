const camelToKebabRegex = /([a-z0-9])([A-Z])/g
const quoteRegex = /"/g

function camelToKebabCase(str: string): string {
  return str.replace(camelToKebabRegex, '$1-$2').toLowerCase()
}

function escapeQuotes(value: unknown): unknown {
  if (typeof value === 'string' && value.includes('"')) {
    return value.replace(quoteRegex, '&#x27;')
  }
  return value
}

const numericalCssProperties = [
  'width',
  'height',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'borderWidth',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'outlineWidth',
  'top',
  'right',
  'bottom',
  'left',
  'fontSize',
  'letterSpacing',
  'wordSpacing',
  'maxWidth',
  'minWidth',
  'maxHeight',
  'minHeight',
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'textIndent',
  'gridColumnGap',
  'gridRowGap',
  'gridGap',
  'translateX',
  'translateY',
] as const

export function parseCssInJsToInlineCss(
  cssProperties: Record<string, unknown> | undefined,
): string {
  if (!cssProperties)
    return ''

  return Object.entries(cssProperties)
    .map(([property, value]) => {
      if (typeof value === 'number' && numericalCssProperties.includes(property as typeof numericalCssProperties[number])) {
        return `${camelToKebabCase(property)}:${value}px`
      }

      const escapedValue = escapeQuotes(value)
      return `${camelToKebabCase(property)}:${escapedValue}`
    })
    .join(';')
}
