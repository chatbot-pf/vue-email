const cssValueRegex = /^([\d.]+)(px|em|rem|%)$/
const whitespaceSplitRegex = /\s+/

type PaddingType = string | number | undefined

interface PaddingProperties {
  padding?: PaddingType
  paddingTop?: PaddingType
  paddingRight?: PaddingType
  paddingBottom?: PaddingType
  paddingLeft?: PaddingType
}

/**
 * Converts a CSS padding value to its px equivalent number.
 * - px: direct passthrough
 * - em/rem: multiply by 16
 * - %: percentage of 600 (email container width)
 * - other/invalid: 0
 */
export function convertToPx(value: PaddingType): number {
  if (!value && value !== 0)
    return 0

  if (typeof value === 'number')
    return value

  const matches = cssValueRegex.exec(value)

  if (matches && matches.length === 3) {
    const numValue = Number.parseFloat(matches[1])
    const unit = matches[2]

    switch (unit) {
      case 'px':
        return numValue
      case 'em':
      case 'rem':
        return numValue * 16
      case '%':
        return (numValue / 100) * 600
      default:
        return numValue
    }
  }

  return 0
}

function parsePaddingValue(value: PaddingType): {
  paddingTop: PaddingType
  paddingRight: PaddingType
  paddingBottom: PaddingType
  paddingLeft: PaddingType
} {
  if (typeof value === 'number') {
    return {
      paddingTop: value,
      paddingRight: value,
      paddingBottom: value,
      paddingLeft: value,
    }
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const values = value.trim().split(whitespaceSplitRegex)

    if (values.length === 1) {
      return {
        paddingTop: values[0],
        paddingRight: values[0],
        paddingBottom: values[0],
        paddingLeft: values[0],
      }
    }

    if (values.length === 2) {
      return {
        paddingTop: values[0],
        paddingRight: values[1],
        paddingBottom: values[0],
        paddingLeft: values[1],
      }
    }

    if (values.length === 3) {
      return {
        paddingTop: values[0],
        paddingRight: values[1],
        paddingBottom: values[2],
        paddingLeft: values[1],
      }
    }

    if (values.length === 4) {
      return {
        paddingTop: values[0],
        paddingRight: values[1],
        paddingBottom: values[2],
        paddingLeft: values[3],
      }
    }
  }

  return {
    paddingTop: undefined,
    paddingRight: undefined,
    paddingBottom: undefined,
    paddingLeft: undefined,
  }
}

/**
 * Parses all padding properties from a style object into individual px values.
 * Handles both shorthand `padding` and explicit `paddingTop/Right/Bottom/Left`.
 * Explicit properties override shorthand.
 */
export function parsePadding(properties: PaddingProperties): {
  paddingTop: number | undefined
  paddingRight: number | undefined
  paddingBottom: number | undefined
  paddingLeft: number | undefined
} {
  // Pass 1: process shorthand
  let { paddingTop, paddingRight, paddingBottom, paddingLeft }
    = properties.padding != null
      ? parsePaddingValue(properties.padding)
      : { paddingTop: undefined as PaddingType, paddingRight: undefined as PaddingType, paddingBottom: undefined as PaddingType, paddingLeft: undefined as PaddingType }

  // Pass 2: explicit overrides always win
  if (properties.paddingTop != null)
    paddingTop = properties.paddingTop
  if (properties.paddingRight != null)
    paddingRight = properties.paddingRight
  if (properties.paddingBottom != null)
    paddingBottom = properties.paddingBottom
  if (properties.paddingLeft != null)
    paddingLeft = properties.paddingLeft

  return {
    paddingTop: paddingTop != null ? convertToPx(paddingTop) : undefined,
    paddingRight: paddingRight != null ? convertToPx(paddingRight) : undefined,
    paddingBottom: paddingBottom != null ? convertToPx(paddingBottom) : undefined,
    paddingLeft: paddingLeft != null ? convertToPx(paddingLeft) : undefined,
  }
}

/**
 * Converts pixels to points: pt = px * 3 / 4
 */
export function pxToPt(px: number | undefined): number | undefined {
  return typeof px === 'number' && !Number.isNaN(Number(px)) ? (px * 3) / 4 : undefined
}

const maxFontWidth = 5

/**
 * Computes a mso-font-width (<=500%) and a count of hair-space characters
 * that together produce a horizontal padding as close to `expectedWidth` px as possible.
 * This is used for MSO/Outlook compatibility.
 */
export function computeFontWidthAndSpaceCount(expectedWidth: number): readonly [number, number] {
  if (expectedWidth === 0)
    return [0, 0] as const

  let smallestSpaceCount = 0

  const computeRequiredFontWidth = () => {
    if (smallestSpaceCount > 0) {
      return expectedWidth / smallestSpaceCount / 2
    }
    return Number.POSITIVE_INFINITY
  }

  while (computeRequiredFontWidth() > maxFontWidth) {
    smallestSpaceCount++
  }

  return [computeRequiredFontWidth(), smallestSpaceCount] as const
}
