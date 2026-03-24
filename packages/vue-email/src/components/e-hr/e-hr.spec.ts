import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { EHr } from './e-hr'

describe('eHr', () => {
  it('renders an hr element', () => {
    const wrapper = mount(EHr)
    expect(wrapper.element.tagName.toLowerCase()).toBe('hr')
  })

  it('has default width style of 100%', () => {
    const wrapper = mount(EHr)
    expect((wrapper.element as HTMLElement).style.width).toBe('100%')
  })

  it('has default border style of none', () => {
    const wrapper = mount(EHr)
    // happy-dom expands shorthand `border: none` into longhand properties.
    // We verify the longhand borderStyle contains "none" (sides without borderTop)
    const el = wrapper.element as HTMLElement
    // The style attribute should reflect the border: none applied (expanded by happy-dom)
    const styleAttr = wrapper.attributes('style') ?? ''
    // happy-dom expands border: none + borderTop combination into longhand parts
    // so we check that border-style is set and includes "none" for non-top sides
    expect(styleAttr).toBeTruthy()
    // the border: none is applied as the base; happy-dom converts it to longhand
    expect(el.style.borderStyle).toContain('none')
  })

  it('has default borderTop style', () => {
    const wrapper = mount(EHr)
    const style = (wrapper.element as HTMLElement).style
    // borderTop may be represented as borderTopWidth, borderTopStyle, borderTopColor
    // so we check the combined borderTop or its parts
    const borderTop = style.borderTop
    if (borderTop) {
      expect(borderTop).toBe('1px solid #eaeaea')
    }
    else {
      expect(style.borderTopWidth).toBe('1px')
      expect(style.borderTopStyle).toBe('solid')
      expect(style.borderTopColor).toBe('rgb(234, 234, 234)')
    }
  })

  it('allows user styles to override default width', () => {
    const wrapper = mount(EHr, { attrs: { style: { width: '50%' } } })
    expect((wrapper.element as HTMLElement).style.width).toBe('50%')
  })

  it('allows user styles to override default border', () => {
    const wrapper = mount(EHr, { attrs: { style: { border: '1px solid red' } } })
    const _el = wrapper.element as HTMLElement
    // happy-dom expands border shorthand: check the border color reflects red override
    // When user border overrides, red should be present in border colors
    const styleAttr = wrapper.attributes('style') ?? ''
    expect(styleAttr).toContain('red')
  })

  it('passes through additional HTML attributes', () => {
    const wrapper = mount(EHr, { attrs: { id: 'divider', class: 'hr-line' } })
    expect(wrapper.attributes('id')).toBe('divider')
    expect(wrapper.attributes('class')).toBe('hr-line')
  })

  it('merges user styles with defaults, user styles taking precedence', () => {
    const wrapper = mount(EHr, { attrs: { style: { width: '80%', color: 'red' } } })
    const style = (wrapper.element as HTMLElement).style
    expect(style.width).toBe('80%')
    expect(style.color).toBe('red')
  })

  it('matches snapshot', () => {
    const wrapper = mount(EHr)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
