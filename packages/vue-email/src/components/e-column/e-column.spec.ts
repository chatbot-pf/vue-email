import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EColumn from './e-column'

describe('eColumn', () => {
  it('renders a td element', () => {
    const wrapper = mount(EColumn, {
      slots: { default: 'Content' },
    })
    expect(wrapper.find('td').exists()).toBe(true)
  })

  it('has data-id="__react-email-column" attribute', () => {
    const wrapper = mount(EColumn, {
      slots: { default: 'Content' },
    })
    expect(wrapper.find('td').attributes('data-id')).toBe('__react-email-column')
  })

  it('renders children via default slot', () => {
    const wrapper = mount(EColumn, {
      slots: { default: 'Cell content' },
    })
    expect(wrapper.find('td').text()).toBe('Cell content')
  })

  it('forwards style attribute', () => {
    const wrapper = mount(EColumn, {
      props: { style: 'background-color: red; padding: 10px' },
      slots: { default: 'Content' },
    })
    const style = wrapper.find('td').attributes('style') ?? ''
    expect(style).toContain('background-color: red')
    expect(style).toContain('padding: 10px')
  })

  it('forwards additional html attributes', () => {
    const wrapper = mount(EColumn, {
      attrs: {
        'colspan': '2',
        'data-custom': 'value',
      },
      slots: { default: 'Content' },
    })
    const td = wrapper.find('td')
    expect(td.attributes('colspan')).toBe('2')
    expect(td.attributes('data-custom')).toBe('value')
  })

  it('matches snapshot', () => {
    const wrapper = mount(EColumn, {
      props: { style: 'width: 50%' },
      slots: { default: 'Column content' },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
