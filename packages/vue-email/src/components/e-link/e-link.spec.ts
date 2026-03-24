import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ELink from './e-link'

describe('eLink', () => {
  it('renders an anchor element', () => {
    const wrapper = mount(ELink, {
      slots: { default: 'Click me' },
    })
    expect(wrapper.find('a').exists()).toBe(true)
  })

  it('renders children via default slot', () => {
    const wrapper = mount(ELink, {
      slots: { default: 'Click me' },
    })
    expect(wrapper.find('a').text()).toBe('Click me')
  })

  it('has default target="_blank"', () => {
    const wrapper = mount(ELink, {
      slots: { default: 'Click me' },
    })
    expect(wrapper.find('a').attributes('target')).toBe('_blank')
  })

  it('applies default styles: color #067df7, textDecorationLine none', () => {
    const wrapper = mount(ELink, {
      slots: { default: 'Link' },
    })
    const a = wrapper.find('a')
    const style = a.attributes('style') ?? ''
    // happy-dom may keep color as hex or convert to rgb
    expect(style).toMatch(/color:\s*(#067df7|rgb\(6,\s*125,\s*247\))/)
    expect(style).toContain('text-decoration-line: none')
  })

  it('allows overriding target attribute', () => {
    const wrapper = mount(ELink, {
      props: { target: '_self' },
      slots: { default: 'Link' },
    })
    expect(wrapper.find('a').attributes('target')).toBe('_self')
  })

  it('allows user styles to override defaults', () => {
    const wrapper = mount(ELink, {
      props: { style: 'color: red; text-decoration-line: underline' },
      slots: { default: 'Link' },
    })
    const style = wrapper.find('a').attributes('style') ?? ''
    expect(style).toContain('color: red')
    expect(style).toContain('text-decoration-line: underline')
  })

  it('forwards href and other attributes', () => {
    const wrapper = mount(ELink, {
      props: { href: 'https://example.com' },
      attrs: { 'data-testid': 'my-link', 'rel': 'noopener' },
      slots: { default: 'Go' },
    })
    const a = wrapper.find('a')
    expect(a.attributes('href')).toBe('https://example.com')
    expect(a.attributes('data-testid')).toBe('my-link')
    expect(a.attributes('rel')).toBe('noopener')
  })

  it('matches snapshot', () => {
    const wrapper = mount(ELink, {
      props: { href: 'https://example.com' },
      slots: { default: 'Visit us' },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
