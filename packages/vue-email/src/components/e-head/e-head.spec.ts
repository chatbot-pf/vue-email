import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { EHead } from './e-head'

describe('eHead', () => {
  it('renders a head element', () => {
    const wrapper = mount(EHead)
    expect(wrapper.element.tagName.toLowerCase()).toBe('head')
  })

  it('auto-injects charset meta tag', () => {
    const wrapper = mount(EHead)
    const metaTags = wrapper.findAll('meta')
    const charsetMeta = metaTags.find(
      meta => meta.attributes('http-equiv') === 'Content-Type',
    )
    expect(charsetMeta).toBeDefined()
    expect(charsetMeta!.attributes('content')).toBe('text/html; charset=UTF-8')
  })

  it('auto-injects apple disable reformatting meta tag', () => {
    const wrapper = mount(EHead)
    const metaTags = wrapper.findAll('meta')
    const appleMeta = metaTags.find(
      meta => meta.attributes('name') === 'x-apple-disable-message-reformatting',
    )
    expect(appleMeta).toBeDefined()
  })

  it('renders two auto-injected meta tags', () => {
    const wrapper = mount(EHead)
    const metaTags = wrapper.findAll('meta')
    expect(metaTags.length).toBeGreaterThanOrEqual(2)
  })

  it('renders slot content after injected meta tags', () => {
    const wrapper = mount(EHead, {
      slots: { default: '<title>My Email</title>' },
    })
    expect(wrapper.html()).toContain('<title>My Email</title>')
  })

  it('passes through additional HTML attributes', () => {
    const wrapper = mount(EHead, { attrs: { id: 'email-head' } })
    expect(wrapper.attributes('id')).toBe('email-head')
  })

  it('matches snapshot', () => {
    const wrapper = mount(EHead, {
      slots: { default: '<title>Email</title>' },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
