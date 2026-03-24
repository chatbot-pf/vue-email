import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { EBody } from './e-body'

describe('eBody', () => {
  it('renders a body element', () => {
    const wrapper = mount(EBody)
    expect(wrapper.element.tagName.toLowerCase()).toBe('body')
  })

  it('renders an inner table with proper attributes', () => {
    const wrapper = mount(EBody)
    const table = wrapper.find('table')
    expect(table.exists()).toBe(true)
    expect(table.attributes('border')).toBe('0')
    expect(table.attributes('width')).toBe('100%')
    expect(table.attributes('cellpadding')).toBe('0')
    expect(table.attributes('cellspacing')).toBe('0')
    expect(table.attributes('role')).toBe('presentation')
    expect(table.attributes('align')).toBe('center')
  })

  it('renders table > tbody > tr > td structure', () => {
    const wrapper = mount(EBody)
    expect(wrapper.find('table tbody tr td').exists()).toBe(true)
  })

  it('renders slot content inside td', () => {
    const wrapper = mount(EBody, {
      slots: { default: '<span>Hello</span>' },
    })
    const td = wrapper.find('table tbody tr td')
    expect(td.html()).toContain('<span>Hello</span>')
  })

  it('places backgroundColor style on body element', () => {
    const wrapper = mount(EBody, {
      attrs: { style: { backgroundColor: 'pink' } },
    })
    expect(wrapper.attributes('style')).toContain('background-color')
  })

  it('places background style on body element', () => {
    const wrapper = mount(EBody, {
      attrs: { style: { background: 'blue' } },
    })
    expect(wrapper.attributes('style')).toContain('background')
  })

  it('places user styles on the inner td', () => {
    const wrapper = mount(EBody, {
      attrs: { style: { padding: '20px', backgroundColor: 'pink' } },
    })
    const td = wrapper.find('table tbody tr td')
    expect(td.attributes('style')).toContain('padding')
  })

  it('resets margin on body element to exactly 0 when user sets margin', () => {
    const wrapper = mount(EBody, {
      attrs: { style: { margin: '10px' } },
    })
    const el = wrapper.element as HTMLElement
    expect(el.style.margin).toBe('0px')
  })

  it('resets padding on body element to exactly 0 when user sets padding', () => {
    const wrapper = mount(EBody, {
      attrs: { style: { padding: '20px' } },
    })
    const el = wrapper.element as HTMLElement
    expect(el.style.padding).toBe('0px')
  })

  it('does not add margin to body when user does not set it', () => {
    const wrapper = mount(EBody)
    const bodyStyle = wrapper.attributes('style') ?? ''
    // no margin should be on body style if user did not set it
    expect(bodyStyle).not.toContain('margin')
  })

  it('passes through non-style attributes', () => {
    const wrapper = mount(EBody, {
      attrs: { id: 'body', class: 'email-body' },
    })
    expect(wrapper.attributes('id')).toBe('body')
    expect(wrapper.attributes('class')).toBe('email-body')
  })

  it('matches snapshot', () => {
    const wrapper = mount(EBody, {
      slots: { default: '<p>Email content</p>' },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
