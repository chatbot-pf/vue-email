import { describe, expect, it } from 'vitest'
import { fromDashCaseToCamelCase } from './from-dash-case-to-camel-case'

describe('fromDashCaseToCamelCase', () => {
  it('converts simple dash-case to camelCase', () => {
    expect(fromDashCaseToCamelCase('background-color')).toBe('backgroundColor')
  })

  it('converts multiple dashes', () => {
    expect(fromDashCaseToCamelCase('border-top-left-radius')).toBe('borderTopLeftRadius')
  })

  it('handles single word (no dashes)', () => {
    expect(fromDashCaseToCamelCase('color')).toBe('color')
  })

  it('handles leading dash (vendor prefix style)', () => {
    expect(fromDashCaseToCamelCase('-webkit-transform')).toBe('WebkitTransform')
  })

  it('handles empty string', () => {
    expect(fromDashCaseToCamelCase('')).toBe('')
  })

  it('converts padding-inline-start', () => {
    expect(fromDashCaseToCamelCase('padding-inline-start')).toBe('paddingInlineStart')
  })
})
