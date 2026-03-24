import { describe, expect, it } from 'vitest'
import { getStyleProperty } from './get-style-property'

describe('getStyleProperty', () => {
  it('converts standard CSS property to camelCase', () => {
    expect(getStyleProperty('background-color')).toBe('backgroundColor')
  })

  it('converts border-radius to camelCase', () => {
    expect(getStyleProperty('border-radius')).toBe('borderRadius')
  })

  it('handles single-word property', () => {
    expect(getStyleProperty('color')).toBe('color')
  })

  it('keeps CSS custom properties as-is', () => {
    expect(getStyleProperty('--my-color')).toBe('--my-color')
  })

  it('handles -ms- vendor prefix (strips leading dash)', () => {
    expect(getStyleProperty('-ms-transform')).toBe('msTransform')
  })

  it('normalizes property name to lowercase', () => {
    expect(getStyleProperty('Background-Color')).toBe('backgroundColor')
  })
})
