import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { EHeading } from './e-heading'

describe('eHeading', () => {
  it('renders h1 by default', () => {
    const wrapper = mount(EHeading)
    expect(wrapper.element.tagName.toLowerCase()).toBe('h1')
  })

  it('renders h2 when as="h2"', () => {
    const wrapper = mount(EHeading, { props: { as: 'h2' } })
    expect(wrapper.element.tagName.toLowerCase()).toBe('h2')
  })

  it('renders h3 when as="h3"', () => {
    const wrapper = mount(EHeading, { props: { as: 'h3' } })
    expect(wrapper.element.tagName.toLowerCase()).toBe('h3')
  })

  it('renders h4 when as="h4"', () => {
    const wrapper = mount(EHeading, { props: { as: 'h4' } })
    expect(wrapper.element.tagName.toLowerCase()).toBe('h4')
  })

  it('renders h5 when as="h5"', () => {
    const wrapper = mount(EHeading, { props: { as: 'h5' } })
    expect(wrapper.element.tagName.toLowerCase()).toBe('h5')
  })

  it('renders h6 when as="h6"', () => {
    const wrapper = mount(EHeading, { props: { as: 'h6' } })
    expect(wrapper.element.tagName.toLowerCase()).toBe('h6')
  })

  it('renders slot content', () => {
    const wrapper = mount(EHeading, {
      slots: { default: 'My Heading' },
    })
    expect(wrapper.text()).toBe('My Heading')
  })

  it('passes through additional HTML attributes', () => {
    const wrapper = mount(EHeading, {
      attrs: { id: 'heading-1', class: 'my-heading' },
    })
    expect(wrapper.attributes('id')).toBe('heading-1')
    expect(wrapper.attributes('class')).toBe('my-heading')
  })

  it('applies m margin prop', () => {
    const wrapper = mount(EHeading, { props: { m: 10 } })
    expect(wrapper.attributes('style')).toContain('margin: 10px')
  })

  it('applies mx margin prop', () => {
    const wrapper = mount(EHeading, { props: { mx: 20 } })
    const style = wrapper.attributes('style') ?? ''
    expect(style).toContain('margin-left: 20px')
    expect(style).toContain('margin-right: 20px')
  })

  it('applies my margin prop', () => {
    const wrapper = mount(EHeading, { props: { my: 20 } })
    const style = wrapper.attributes('style') ?? ''
    expect(style).toContain('margin-top: 20px')
    expect(style).toContain('margin-bottom: 20px')
  })

  it('applies mt margin prop', () => {
    const wrapper = mount(EHeading, { props: { mt: 5 } })
    expect(wrapper.attributes('style')).toContain('margin-top: 5px')
  })

  it('applies mr margin prop', () => {
    const wrapper = mount(EHeading, { props: { mr: 5 } })
    expect(wrapper.attributes('style')).toContain('margin-right: 5px')
  })

  it('applies mb margin prop', () => {
    const wrapper = mount(EHeading, { props: { mb: 5 } })
    expect(wrapper.attributes('style')).toContain('margin-bottom: 5px')
  })

  it('applies ml margin prop', () => {
    const wrapper = mount(EHeading, { props: { ml: 5 } })
    expect(wrapper.attributes('style')).toContain('margin-left: 5px')
  })

  it('mt overrides my for marginTop', () => {
    const wrapper = mount(EHeading, { props: { my: 10, mt: 5 } })
    expect(wrapper.attributes('style')).toContain('margin-top: 5px')
  })

  it('merges margin with style prop', () => {
    const wrapper = mount(EHeading, {
      props: { mt: 5, style: 'color: red' },
    })
    const style = wrapper.attributes('style') ?? ''
    expect(style).toContain('margin-top: 5px')
    expect(style).toContain('color: red')
  })

  it('matches snapshot', () => {
    const wrapper = mount(EHeading, {
      props: { as: 'h2', mt: 10, mb: 10 },
      slots: { default: 'Hello' },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
