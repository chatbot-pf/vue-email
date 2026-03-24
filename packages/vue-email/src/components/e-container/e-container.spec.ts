import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { EContainer } from './e-container'

describe('EContainer', () => {
  it('renders a table element', () => {
    const wrapper = mount(EContainer)
    expect(wrapper.element.tagName.toLowerCase()).toBe('table')
  })

  it('has align="center"', () => {
    const wrapper = mount(EContainer)
    expect(wrapper.attributes('align')).toBe('center')
  })

  it('has width="100%"', () => {
    const wrapper = mount(EContainer)
    expect(wrapper.attributes('width')).toBe('100%')
  })

  it('has border="0"', () => {
    const wrapper = mount(EContainer)
    expect(wrapper.attributes('border')).toBe('0')
  })

  it('has cellpadding="0"', () => {
    const wrapper = mount(EContainer)
    expect(wrapper.attributes('cellpadding')).toBe('0')
  })

  it('has cellspacing="0"', () => {
    const wrapper = mount(EContainer)
    expect(wrapper.attributes('cellspacing')).toBe('0')
  })

  it('has role="presentation"', () => {
    const wrapper = mount(EContainer)
    expect(wrapper.attributes('role')).toBe('presentation')
  })

  it('has maxWidth of 37.5em in style', () => {
    const wrapper = mount(EContainer)
    expect(wrapper.attributes('style')).toContain('max-width')
    expect(wrapper.attributes('style')).toContain('37.5em')
  })

  it('renders tbody > tr > td structure', () => {
    const wrapper = mount(EContainer)
    expect(wrapper.find('tbody').exists()).toBe(true)
    expect(wrapper.find('tbody tr').exists()).toBe(true)
    expect(wrapper.find('tbody tr td').exists()).toBe(true)
  })

  it('renders slot content inside tbody > tr > td', () => {
    const wrapper = mount(EContainer, {
      slots: { default: '<span>Content</span>' },
    })
    const td = wrapper.find('tbody tr td')
    expect(td.html()).toContain('<span>Content</span>')
  })

  it('passes through additional HTML attributes', () => {
    const wrapper = mount(EContainer, {
      attrs: { id: 'container', class: 'test' },
    })
    expect(wrapper.attributes('id')).toBe('container')
    expect(wrapper.attributes('class')).toBe('test')
  })

  it('allows overriding style', () => {
    const wrapper = mount(EContainer, {
      attrs: { style: { color: 'red' } },
    })
    expect(wrapper.attributes('style')).toContain('color')
  })

  it('matches snapshot', () => {
    const wrapper = mount(EContainer, {
      slots: { default: '<span>Hello</span>' },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
