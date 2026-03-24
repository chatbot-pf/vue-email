import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { EPreview } from './e-preview'

describe('ePreview', () => {
  it('renders a div element', () => {
    const wrapper = mount(EPreview, {
      slots: { default: 'Hello' },
    })
    expect(wrapper.element.tagName.toLowerCase()).toBe('div')
  })

  it('has display none style', () => {
    const wrapper = mount(EPreview, {
      slots: { default: 'Hello' },
    })
    expect(wrapper.attributes('style')).toContain('display: none')
  })

  it('has overflow hidden style', () => {
    const wrapper = mount(EPreview, {
      slots: { default: 'Hello' },
    })
    expect(wrapper.attributes('style')).toContain('overflow: hidden')
  })

  it('has opacity 0 style', () => {
    const wrapper = mount(EPreview, {
      slots: { default: 'Hello' },
    })
    expect(wrapper.attributes('style')).toContain('opacity: 0')
  })

  it('has maxHeight 0 style', () => {
    const wrapper = mount(EPreview, {
      slots: { default: 'Hello' },
    })
    expect(wrapper.attributes('style')).toContain('max-height: 0')
  })

  it('has maxWidth 0 style', () => {
    const wrapper = mount(EPreview, {
      slots: { default: 'Hello' },
    })
    expect(wrapper.attributes('style')).toContain('max-width: 0')
  })

  it('has lineHeight 1px style', () => {
    const wrapper = mount(EPreview, {
      slots: { default: 'Hello' },
    })
    expect(wrapper.attributes('style')).toContain('line-height: 1px')
  })

  it('has data-skip-in-text="true" attribute', () => {
    const wrapper = mount(EPreview, {
      slots: { default: 'Hello' },
    })
    expect(wrapper.attributes('data-skip-in-text')).toBe('true')
  })

  it('renders the text content', () => {
    const wrapper = mount(EPreview, {
      slots: { default: 'Preview text' },
    })
    expect(wrapper.text()).toContain('Preview text')
  })

  it('truncates text at 150 characters', () => {
    const longText = 'a'.repeat(200)
    const wrapper = mount(EPreview, {
      slots: { default: longText },
    })
    // The text content should be truncated at 150 chars
    const innerText = wrapper.element.textContent ?? ''
    // Total content has 150 chars of text + padding = should not start with 200 a's
    expect(innerText.startsWith('a'.repeat(150))).toBe(true)
    expect(innerText.startsWith('a'.repeat(151))).toBe(false)
  })

  it('pads with invisible unicode chars when text is less than 150 chars', () => {
    const wrapper = mount(EPreview, {
      slots: { default: 'Short text' },
    })
    const html = wrapper.html()
    // Should contain a padding div — &nbsp; is the HTML-encoded form of \xa0
    expect(html).toContain('&nbsp;')
  })

  it('does not add padding div when text is exactly 150 chars', () => {
    const exactText = 'a'.repeat(150)
    const wrapper = mount(EPreview, {
      slots: { default: exactText },
    })
    // Should not contain an extra div with padding
    const divs = wrapper.findAll('div')
    expect(divs.length).toBe(1)
  })

  it('passes through additional HTML attributes', () => {
    const wrapper = mount(EPreview, {
      attrs: { id: 'preview-1' },
      slots: { default: 'Hello' },
    })
    expect(wrapper.attributes('id')).toBe('preview-1')
  })

  it('matches snapshot', () => {
    const wrapper = mount(EPreview, {
      slots: { default: 'Preview text here' },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
