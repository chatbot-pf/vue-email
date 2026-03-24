import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { ESection } from './e-section'

describe('eSection', () => {
  it('renders a table element', () => {
    const wrapper = mount(ESection)
    expect(wrapper.element.tagName.toLowerCase()).toBe('table')
  })

  it('has align="center"', () => {
    const wrapper = mount(ESection)
    expect(wrapper.attributes('align')).toBe('center')
  })

  it('has width="100%"', () => {
    const wrapper = mount(ESection)
    expect(wrapper.attributes('width')).toBe('100%')
  })

  it('has border="0"', () => {
    const wrapper = mount(ESection)
    expect(wrapper.attributes('border')).toBe('0')
  })

  it('has cellpadding="0"', () => {
    const wrapper = mount(ESection)
    expect(wrapper.attributes('cellpadding')).toBe('0')
  })

  it('has cellspacing="0"', () => {
    const wrapper = mount(ESection)
    expect(wrapper.attributes('cellspacing')).toBe('0')
  })

  it('has role="presentation"', () => {
    const wrapper = mount(ESection)
    expect(wrapper.attributes('role')).toBe('presentation')
  })

  it('renders tbody > tr > td structure', () => {
    const wrapper = mount(ESection)
    expect(wrapper.find('tbody').exists()).toBe(true)
    expect(wrapper.find('tbody tr').exists()).toBe(true)
    expect(wrapper.find('tbody tr td').exists()).toBe(true)
  })

  it('renders slot content inside tbody > tr > td', () => {
    const wrapper = mount(ESection, {
      slots: { default: '<span>Content</span>' },
    })
    const td = wrapper.find('tbody tr td')
    expect(td.html()).toContain('<span>Content</span>')
  })

  it('passes through additional HTML attributes', () => {
    const wrapper = mount(ESection, {
      attrs: { id: 'section', class: 'test' },
    })
    expect(wrapper.attributes('id')).toBe('section')
    expect(wrapper.attributes('class')).toBe('test')
  })

  it('matches snapshot', () => {
    const wrapper = mount(ESection, {
      slots: { default: '<span>Hello</span>' },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
