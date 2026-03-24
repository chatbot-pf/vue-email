import { describe, expect, it } from 'vitest'
import { parseCssInJsToInlineCss } from './parse-css-in-js-to-inline-css'

describe('parseCssInJsToInlineCss', () => {
  it('returns empty string when no styles provided', () => {
    expect(parseCssInJsToInlineCss(undefined)).toBe('')
  })

  it('returns empty string for empty object', () => {
    expect(parseCssInJsToInlineCss({})).toBe('')
  })

  it('converts camelCase property to kebab-case', () => {
    expect(parseCssInJsToInlineCss({ fontWeight: 'bold' })).toBe('font-weight:bold')
  })

  it('converts multiple camelCase properties to kebab-case', () => {
    expect(parseCssInJsToInlineCss({ backgroundColor: 'red', fontSize: '16px' })).toBe('background-color:red;font-size:16px')
  })

  it('auto-appends px to numeric values for applicable properties', () => {
    expect(parseCssInJsToInlineCss({ margin: 10 })).toBe('margin:10px')
    expect(parseCssInJsToInlineCss({ padding: 20 })).toBe('padding:20px')
    expect(parseCssInJsToInlineCss({ width: 100 })).toBe('width:100px')
    expect(parseCssInJsToInlineCss({ height: 50 })).toBe('height:50px')
    expect(parseCssInJsToInlineCss({ fontSize: 14 })).toBe('font-size:14px')
    expect(parseCssInJsToInlineCss({ borderRadius: 4 })).toBe('border-radius:4px')
    expect(parseCssInJsToInlineCss({ top: 0 })).toBe('top:0px')
    expect(parseCssInJsToInlineCss({ left: 0 })).toBe('left:0px')
    expect(parseCssInJsToInlineCss({ marginTop: 8 })).toBe('margin-top:8px')
    expect(parseCssInJsToInlineCss({ paddingLeft: 16 })).toBe('padding-left:16px')
  })

  it('does NOT auto-append px to numeric values for non-applicable properties', () => {
    expect(parseCssInJsToInlineCss({ opacity: 0.5 })).toBe('opacity:0.5')
    expect(parseCssInJsToInlineCss({ zIndex: 10 })).toBe('z-index:10')
    expect(parseCssInJsToInlineCss({ fontWeight: 700 })).toBe('font-weight:700')
    expect(parseCssInJsToInlineCss({ lineHeight: 1.5 })).toBe('line-height:1.5')
    expect(parseCssInJsToInlineCss({ flexGrow: 1 })).toBe('flex-grow:1')
  })

  it('passes string values through unchanged', () => {
    expect(parseCssInJsToInlineCss({ color: 'red' })).toBe('color:red')
    expect(parseCssInJsToInlineCss({ display: 'flex' })).toBe('display:flex')
    expect(parseCssInJsToInlineCss({ position: 'absolute' })).toBe('position:absolute')
  })

  it('escapes double quotes to &#x27; in string values', () => {
    expect(parseCssInJsToInlineCss({ fontFamily: '"Arial", sans-serif' })).toBe('font-family:&#x27;Arial&#x27;, sans-serif')
  })

  it('does not escape single quotes or other characters', () => {
    expect(parseCssInJsToInlineCss({ content: "'hello'" })).toBe("content:'hello'")
  })

  it('joins multiple properties with semicolons', () => {
    const result = parseCssInJsToInlineCss({ color: 'red', margin: 10, fontWeight: 'bold' })
    expect(result).toBe('color:red;margin:10px;font-weight:bold')
  })

  it('handles all numerical CSS properties correctly', () => {
    const numericalProps = [
      'width', 'height', 'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
      'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'borderWidth', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
      'outlineWidth', 'top', 'right', 'bottom', 'left',
      'fontSize', 'letterSpacing', 'wordSpacing',
      'maxWidth', 'minWidth', 'maxHeight', 'minHeight',
      'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius',
      'borderBottomLeftRadius', 'borderBottomRightRadius',
      'textIndent', 'gridColumnGap', 'gridRowGap', 'gridGap',
      'translateX', 'translateY',
    ] as const

    for (const prop of numericalProps) {
      const result = parseCssInJsToInlineCss({ [prop]: 5 })
      expect(result, `Property ${prop} should have px suffix`).toContain('5px')
    }
  })
})
