import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EButton from './e-button'
import { convertToPx, parsePadding, pxToPt, computeFontWidthAndSpaceCount } from './utils'

describe('EButton', () => {
  it('renders an anchor element (not a button)', () => {
    const wrapper = mount(EButton, {
      slots: { default: 'Click me' },
    })
    expect(wrapper.find('a').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('has default target="_blank"', () => {
    const wrapper = mount(EButton, {
      slots: { default: 'Click me' },
    })
    expect(wrapper.find('a').attributes('target')).toBe('_blank')
  })

  it('renders children via default slot', () => {
    const wrapper = mount(EButton, {
      slots: { default: 'Click me' },
    })
    expect(wrapper.text()).toContain('Click me')
  })

  it('applies default styles: lineHeight 100%, textDecoration none, display inline-block, maxWidth 100%', () => {
    const wrapper = mount(EButton, {
      slots: { default: 'Click me' },
    })
    const a = wrapper.find('a')
    const style = a.attributes('style') ?? ''
    expect(style).toContain('line-height: 100%')
    expect(style).toContain('text-decoration: none')
    expect(style).toContain('display: inline-block')
    expect(style).toContain('max-width: 100%')
  })

  it('applies mso-padding-alt: 0px in default styles', () => {
    const wrapper = mount(EButton, {
      slots: { default: 'Click me' },
    })
    const a = wrapper.find('a')
    // happy-dom strips non-standard CSS vendor properties from style attribute serialization
    // (see project_happy_dom_quirks.md). Verify via the DOM style object property instead.
    const el = a.element as HTMLAnchorElement
    expect(el.style.msoPaddingAlt).toBe('0px')
  })

  it('renders with href prop', () => {
    const wrapper = mount(EButton, {
      props: { href: 'https://example.com' },
      slots: { default: 'Click me' },
    })
    expect(wrapper.find('a').attributes('href')).toBe('https://example.com')
  })

  it('allows overriding target attribute', () => {
    const wrapper = mount(EButton, {
      props: { target: '_self' },
      slots: { default: 'Click me' },
    })
    expect(wrapper.find('a').attributes('target')).toBe('_self')
  })

  it('renders three span children inside the anchor', () => {
    const wrapper = mount(EButton, {
      slots: { default: 'Click me' },
    })
    const spans = wrapper.find('a').findAll('span')
    expect(spans.length).toBe(3)
  })

  it('renders MSO conditional comments in first span for left padding', () => {
    const wrapper = mount(EButton, {
      props: { style: { paddingLeft: '20px' } },
      slots: { default: 'Click me' },
    })
    const html = wrapper.html()
    expect(html).toContain('<!--[if mso]>')
    expect(html).toContain('<![endif]-->')
    expect(html).toContain('mso-font-width')
  })

  it('renders MSO conditional comments in third span for right padding', () => {
    const wrapper = mount(EButton, {
      props: { style: { paddingRight: '20px' } },
      slots: { default: 'Click me' },
    })
    const html = wrapper.html()
    expect(html).toContain('<!--[if mso]>')
    expect(html).toContain('mso-font-width')
  })

  it('renders &#8202; hair space in MSO comment when padding > 0', () => {
    const wrapper = mount(EButton, {
      props: { style: { paddingLeft: '20px' } },
      slots: { default: 'Click me' },
    })
    const html = wrapper.html()
    // &#8202; is a hair space, may be rendered as the actual character or encoded
    expect(html).toMatch(/&#8202;|\u200a/)
  })

  it('middle span has correct styles', () => {
    const wrapper = mount(EButton, {
      slots: { default: 'Click me' },
    })
    const spans = wrapper.find('a').findAll('span')
    const middleSpan = spans[1]
    const style = middleSpan.attributes('style') ?? ''
    expect(style).toContain('max-width: 100%')
    expect(style).toContain('display: inline-block')
    expect(style).toContain('line-height: 120%')
  })

  it('applies custom padding style to the anchor', () => {
    const wrapper = mount(EButton, {
      props: { style: { padding: '10px 20px' } },
      slots: { default: 'Click me' },
    })
    const a = wrapper.find('a')
    const style = a.attributes('style') ?? ''
    // The anchor should have padding values applied
    expect(style).toMatch(/padding/)
  })

  it('matches snapshot', () => {
    const wrapper = mount(EButton, {
      props: { href: 'https://example.com', style: { padding: '12px 20px' } },
      slots: { default: 'Buy Now' },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})

describe('utils: convertToPx', () => {
  it('converts "10px" to 10', () => {
    expect(convertToPx('10px')).toBe(10)
  })

  it('converts "2em" to 32', () => {
    expect(convertToPx('2em')).toBe(32)
  })

  it('converts "1.5rem" to 24', () => {
    expect(convertToPx('1.5rem')).toBe(24)
  })

  it('converts "50%" to 300', () => {
    expect(convertToPx('50%')).toBe(300)
  })

  it('converts unsupported unit "15cm" to 0', () => {
    expect(convertToPx('15cm')).toBe(0)
  })

  it('converts invalid format to 0', () => {
    expect(convertToPx('invalid')).toBe(0)
  })

  it('converts empty string to 0', () => {
    expect(convertToPx('')).toBe(0)
  })

  it('returns number directly for number input', () => {
    expect(convertToPx(42)).toBe(42)
  })

  it('returns 0 for undefined', () => {
    expect(convertToPx(undefined)).toBe(0)
  })
})

describe('utils: parsePadding', () => {
  it('parses number padding as all four sides', () => {
    expect(parsePadding({ padding: 10 })).toEqual({
      paddingTop: 10,
      paddingRight: 10,
      paddingBottom: 10,
      paddingLeft: 10,
    })
  })

  it('parses "10px" as all four sides', () => {
    expect(parsePadding({ padding: '10px' })).toEqual({
      paddingTop: 10,
      paddingRight: 10,
      paddingBottom: 10,
      paddingLeft: 10,
    })
  })

  it('parses "10px 2em" as two-value shorthand', () => {
    expect(parsePadding({ padding: '10px 2em' })).toEqual({
      paddingTop: 10,
      paddingRight: 32,
      paddingBottom: 10,
      paddingLeft: 32,
    })
  })

  it('parses "10px 20px 30px" as three-value shorthand', () => {
    expect(parsePadding({ padding: '10px 20px 30px' })).toEqual({
      paddingTop: 10,
      paddingRight: 20,
      paddingBottom: 30,
      paddingLeft: 20,
    })
  })

  it('parses "10px 20px 30px 40px" as four-value shorthand', () => {
    expect(parsePadding({ padding: '10px 20px 30px 40px' })).toEqual({
      paddingTop: 10,
      paddingRight: 20,
      paddingBottom: 30,
      paddingLeft: 40,
    })
  })

  it('handles undefined padding as all undefined', () => {
    expect(parsePadding({ padding: undefined })).toEqual({
      paddingTop: undefined,
      paddingRight: undefined,
      paddingBottom: undefined,
      paddingLeft: undefined,
    })
  })

  it('handles explicit paddingTop/paddingLeft/etc overrides', () => {
    expect(parsePadding({ padding: 10, paddingRight: '1em' })).toEqual({
      paddingTop: 10,
      paddingRight: 16,
      paddingBottom: 10,
      paddingLeft: 10,
    })
  })

  it('returns all undefined for empty object', () => {
    expect(parsePadding({})).toEqual({
      paddingTop: undefined,
      paddingRight: undefined,
      paddingBottom: undefined,
      paddingLeft: undefined,
    })
  })
})

describe('utils: pxToPt', () => {
  it('converts 10px to 7.5pt', () => {
    expect(pxToPt(10)).toBe(7.5)
  })

  it('converts 20px to 15pt', () => {
    expect(pxToPt(20)).toBe(15)
  })

  it('converts 0px to 0pt', () => {
    expect(pxToPt(0)).toBe(0)
  })

  it('returns undefined for invalid string input', () => {
    expect(pxToPt('invalid' as unknown as number)).toBeUndefined()
  })

  it('returns undefined for undefined input', () => {
    expect(pxToPt(undefined)).toBeUndefined()
  })
})

describe('utils: computeFontWidthAndSpaceCount', () => {
  it('returns [0, 0] for 0 padding', () => {
    expect(computeFontWidthAndSpaceCount(0)).toEqual([0, 0])
  })

  it('returns font width <= 5 for any positive padding', () => {
    const [fontWidth] = computeFontWidthAndSpaceCount(20)
    expect(fontWidth).toBeLessThanOrEqual(5)
  })

  it('returns correct space count for small padding', () => {
    const [fontWidth, spaceCount] = computeFontWidthAndSpaceCount(10)
    // 10 / spaceCount / 2 <= 5
    if (spaceCount > 0) {
      expect(fontWidth).toBeLessThanOrEqual(5)
      expect(spaceCount * 2 * fontWidth).toBeCloseTo(10, 1)
    }
  })

  it('returns more spaces for larger padding', () => {
    const [, smallSpaceCount] = computeFontWidthAndSpaceCount(10)
    const [, largeSpaceCount] = computeFontWidthAndSpaceCount(100)
    expect(largeSpaceCount).toBeGreaterThanOrEqual(smallSpaceCount)
  })
})
