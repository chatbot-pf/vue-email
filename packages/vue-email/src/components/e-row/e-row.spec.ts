import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { ERow } from './e-row'

describe('ERow', () => {
  it('renders a table element', () => {
    const wrapper = mount(ERow)
    expect(wrapper.element.tagName.toLowerCase()).toBe('table')
  })

  it('has align="center"', () => {
    const wrapper = mount(ERow)
    expect(wrapper.attributes('align')).toBe('center')
  })

  it('has width="100%"', () => {
    const wrapper = mount(ERow)
    expect(wrapper.attributes('width')).toBe('100%')
  })

  it('has border="0"', () => {
    const wrapper = mount(ERow)
    expect(wrapper.attributes('border')).toBe('0')
  })

  it('has cellpadding="0"', () => {
    const wrapper = mount(ERow)
    expect(wrapper.attributes('cellpadding')).toBe('0')
  })

  it('has cellspacing="0"', () => {
    const wrapper = mount(ERow)
    expect(wrapper.attributes('cellspacing')).toBe('0')
  })

  it('has role="presentation"', () => {
    const wrapper = mount(ERow)
    expect(wrapper.attributes('role')).toBe('presentation')
  })

  it('renders tbody with width 100%', () => {
    const wrapper = mount(ERow)
    const tbody = wrapper.find('tbody')
    expect(tbody.exists()).toBe(true)
    expect(tbody.attributes('style')).toContain('width')
  })

  it('renders tr with width 100%', () => {
    const wrapper = mount(ERow)
    const tr = wrapper.find('tbody tr')
    expect(tr.exists()).toBe(true)
    expect(tr.attributes('style')).toContain('width')
  })

  it('renders slot content inside tbody > tr', () => {
    const wrapper = mount(ERow, {
      slots: { default: '<td>Column</td>' },
    })
    const tr = wrapper.find('tbody tr')
    expect(tr.html()).toContain('<td>Column</td>')
  })

  it('passes through additional HTML attributes', () => {
    const wrapper = mount(ERow, {
      attrs: { id: 'row', class: 'test' },
    })
    expect(wrapper.attributes('id')).toBe('row')
    expect(wrapper.attributes('class')).toBe('test')
  })

  it('matches snapshot', () => {
    const wrapper = mount(ERow, {
      slots: { default: '<td>Cell</td>' },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
