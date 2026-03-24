import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { EHtml } from './e-html'

describe('eHtml', () => {
  it('renders an html element', () => {
    const wrapper = mount(EHtml)
    expect(wrapper.element.tagName.toLowerCase()).toBe('html')
  })

  it('has default lang="en"', () => {
    const wrapper = mount(EHtml)
    expect(wrapper.attributes('lang')).toBe('en')
  })

  it('has default dir="ltr"', () => {
    const wrapper = mount(EHtml)
    expect(wrapper.attributes('dir')).toBe('ltr')
  })

  it('allows overriding lang attribute', () => {
    const wrapper = mount(EHtml, { attrs: { lang: 'ko' } })
    expect(wrapper.attributes('lang')).toBe('ko')
  })

  it('allows overriding dir attribute', () => {
    const wrapper = mount(EHtml, { attrs: { dir: 'rtl' } })
    expect(wrapper.attributes('dir')).toBe('rtl')
  })

  it('passes through additional HTML attributes', () => {
    const wrapper = mount(EHtml, { attrs: { id: 'root', class: 'email' } })
    expect(wrapper.attributes('id')).toBe('root')
    expect(wrapper.attributes('class')).toBe('email')
  })

  it('renders slot content as children', () => {
    const wrapper = mount(EHtml, {
      slots: { default: '<body>Hello</body>' },
    })
    expect(wrapper.html()).toContain('<body>Hello</body>')
  })

  it('matches snapshot', () => {
    const wrapper = mount(EHtml, {
      slots: { default: '<body>Email body</body>' },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
