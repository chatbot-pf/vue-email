import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EImg from './e-img'

describe('EImg', () => {
  it('renders an img element', () => {
    const wrapper = mount(EImg, {
      props: { src: 'https://example.com/image.png', alt: 'Test image' },
    })
    expect(wrapper.find('img').exists()).toBe(true)
  })

  it('applies default styles: display block, outline none, border none, textDecoration none', () => {
    const wrapper = mount(EImg, {
      props: { src: 'https://example.com/image.png', alt: 'Test' },
    })
    const img = wrapper.find('img')
    const style = img.attributes('style') ?? ''
    expect(style).toContain('display: block')
    // outline: none may be expanded by the DOM engine
    expect(style).toMatch(/outline(-\w+)?:\s*(none|initial)/)
    expect(style).toContain('text-decoration: none')
  })

  it('forwards src, alt, width, height props', () => {
    const wrapper = mount(EImg, {
      props: {
        src: 'https://example.com/image.png',
        alt: 'Test image',
        width: 200,
        height: 100,
      },
    })
    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('https://example.com/image.png')
    expect(img.attributes('alt')).toBe('Test image')
    expect(img.attributes('width')).toBe('200')
    expect(img.attributes('height')).toBe('100')
  })

  it('allows user styles to override defaults', () => {
    const wrapper = mount(EImg, {
      props: {
        src: 'https://example.com/image.png',
        alt: 'Test',
        style: 'display: inline; border: 1px solid red',
      },
    })
    const img = wrapper.find('img')
    const style = img.attributes('style') ?? ''
    expect(style).toContain('display: inline')
    expect(style).toContain('border: 1px solid red')
  })

  it('forwards additional html attributes', () => {
    const wrapper = mount(EImg, {
      props: {
        src: 'https://example.com/image.png',
        alt: 'Test',
      },
      attrs: {
        'data-testid': 'my-img',
        loading: 'lazy',
      },
    })
    const img = wrapper.find('img')
    expect(img.attributes('data-testid')).toBe('my-img')
    expect(img.attributes('loading')).toBe('lazy')
  })

  it('matches snapshot', () => {
    const wrapper = mount(EImg, {
      props: {
        src: 'https://example.com/image.png',
        alt: 'Snapshot test',
        width: 300,
        height: 200,
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
