import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { EText } from './e-text'

describe('EText', () => {
  it('renders a p element', () => {
    const wrapper = mount(EText)
    expect(wrapper.element.tagName.toLowerCase()).toBe('p')
  })

  it('has default fontSize 14px', () => {
    const wrapper = mount(EText)
    expect(wrapper.attributes('style')).toContain('font-size: 14px')
  })

  it('has default lineHeight 24px', () => {
    const wrapper = mount(EText)
    expect(wrapper.attributes('style')).toContain('line-height: 24px')
  })

  it('has default marginTop 16px', () => {
    const wrapper = mount(EText)
    expect(wrapper.attributes('style')).toContain('margin-top: 16px')
  })

  it('has default marginBottom 16px', () => {
    const wrapper = mount(EText)
    expect(wrapper.attributes('style')).toContain('margin-bottom: 16px')
  })

  it('renders slot content', () => {
    const wrapper = mount(EText, {
      slots: { default: 'Hello world' },
    })
    expect(wrapper.text()).toBe('Hello world')
  })

  it('passes through additional HTML attributes', () => {
    const wrapper = mount(EText, {
      attrs: { id: 'text-1', class: 'my-text' },
    })
    expect(wrapper.attributes('id')).toBe('text-1')
    expect(wrapper.attributes('class')).toBe('my-text')
  })

  it('allows overriding marginTop via style prop', () => {
    const wrapper = mount(EText, {
      props: { style: 'margin-top: 24px' },
    })
    expect(wrapper.attributes('style')).toContain('margin-top: 24px')
  })

  it('allows overriding marginBottom via style prop', () => {
    const wrapper = mount(EText, {
      props: { style: 'margin-bottom: 24px' },
    })
    expect(wrapper.attributes('style')).toContain('margin-bottom: 24px')
  })

  it('parses margin shorthand: 1 value', () => {
    const wrapper = mount(EText, {
      props: { style: 'margin: 10px' },
    })
    const el = wrapper.element as HTMLElement
    // Check the DOM element's computed margin properties
    expect(el.style.marginTop).toBe('10px')
    expect(el.style.marginBottom).toBe('10px')
    expect(el.style.marginLeft).toBe('10px')
    expect(el.style.marginRight).toBe('10px')
  })

  it('parses margin shorthand: 2 values', () => {
    const wrapper = mount(EText, {
      props: { style: 'margin: 10px 20px' },
    })
    const el = wrapper.element as HTMLElement
    // Check the DOM element's computed margin properties
    expect(el.style.marginTop).toBe('10px')
    expect(el.style.marginBottom).toBe('10px')
    expect(el.style.marginLeft).toBe('20px')
    expect(el.style.marginRight).toBe('20px')
  })

  it('suppresses default margins when margin shorthand is provided', () => {
    const wrapper = mount(EText, { props: { style: 'margin: 0' } })
    const el = wrapper.element as HTMLElement
    expect(el.style.marginTop).toBe('0px')
    expect(el.style.marginBottom).toBe('0px')
  })

  it('explicit marginTop overrides shorthand regardless of key order', () => {
    const wrapper = mount(EText, {
      attrs: { style: { margin: '0', marginTop: '8px' } },
    })
    const el = wrapper.element as HTMLElement
    expect(el.style.marginTop).toBe('8px')
    expect(el.style.marginBottom).toBe('0px')
  })

  it('matches snapshot', () => {
    const wrapper = mount(EText, {
      slots: { default: 'Hello' },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
