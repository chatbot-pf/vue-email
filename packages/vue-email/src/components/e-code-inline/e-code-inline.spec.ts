import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { ECodeInline } from './e-code-inline'

describe('eCodeInline', () => {
  it('renders a style tag with Orange.fr CSS hack', () => {
    const wrapper = mount(ECodeInline, {
      slots: { default: 'code snippet' },
    })
    const html = wrapper.html()
    expect(html).toContain('<style>')
    // happy-dom may minify CSS selectors (meta ~ .cino → meta~.cino)
    expect(html).toMatch(/meta\s*~\s*\.cino/)
    expect(html).toMatch(/meta\s*~\s*\.cio/)
    expect(html).toContain('none !important')
    expect(html).toContain('opacity: 0 !important')
    expect(html).toContain('block !important')
  })

  it('renders a code element with class containing cino', () => {
    const wrapper = mount(ECodeInline, {
      slots: { default: 'code snippet' },
    })
    const code = wrapper.find('code')
    expect(code.exists()).toBe(true)
    expect(code.classes()).toContain('cino')
  })

  it('renders a span element with class containing cio', () => {
    const wrapper = mount(ECodeInline, {
      slots: { default: 'code snippet' },
    })
    const span = wrapper.find('span')
    expect(span.exists()).toBe(true)
    expect(span.classes()).toContain('cio')
  })

  it('renders span element with display:none style', () => {
    const wrapper = mount(ECodeInline, {
      slots: { default: 'code snippet' },
    })
    const span = wrapper.find('span')
    const el = span.element as HTMLSpanElement
    expect(el.style.display).toBe('none')
  })

  it('renders slot content in code element', () => {
    const wrapper = mount(ECodeInline, {
      slots: { default: 'code snippet' },
    })
    const code = wrapper.find('code')
    expect(code.text()).toContain('code snippet')
  })

  it('renders slot content in span element', () => {
    const wrapper = mount(ECodeInline, {
      slots: { default: 'code snippet' },
    })
    const span = wrapper.find('span')
    expect(span.text()).toContain('code snippet')
  })

  it('passes HTML attributes through to both code and span elements', () => {
    const wrapper = mount(ECodeInline, {
      attrs: { 'id': 'my-code', 'data-test': 'value' },
      slots: { default: 'code snippet' },
    })
    const code = wrapper.find('code')
    const span = wrapper.find('span')
    expect(code.attributes('id')).toBe('my-code')
    expect(code.attributes('data-test')).toBe('value')
    expect(span.attributes('id')).toBe('my-code')
    expect(span.attributes('data-test')).toBe('value')
  })

  it('merges additional className with cino on code element', () => {
    const wrapper = mount(ECodeInline, {
      attrs: { class: 'my-class' },
      slots: { default: 'code snippet' },
    })
    const code = wrapper.find('code')
    expect(code.classes()).toContain('my-class')
    expect(code.classes()).toContain('cino')
  })

  it('merges additional className with cio on span element', () => {
    const wrapper = mount(ECodeInline, {
      attrs: { class: 'my-class' },
      slots: { default: 'code snippet' },
    })
    const span = wrapper.find('span')
    expect(span.classes()).toContain('my-class')
    expect(span.classes()).toContain('cio')
  })

  it('matches snapshot', () => {
    const wrapper = mount(ECodeInline, {
      slots: { default: 'const x = 1' },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
