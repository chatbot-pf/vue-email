import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { EFont } from './e-font'

describe('eFont', () => {
  it('renders a style element', () => {
    const wrapper = mount(EFont, {
      props: {
        fontFamily: 'Roboto',
        fallbackFontFamily: 'Arial',
      },
    })
    expect(wrapper.element.tagName.toLowerCase()).toBe('style')
  })

  it('includes @font-face rule', () => {
    const wrapper = mount(EFont, {
      props: {
        fontFamily: 'Roboto',
        fallbackFontFamily: 'Arial',
      },
    })
    expect(wrapper.element.innerHTML).toContain('@font-face')
  })

  it('includes the fontFamily name in @font-face', () => {
    const wrapper = mount(EFont, {
      props: {
        fontFamily: 'Roboto',
        fallbackFontFamily: 'Arial',
      },
    })
    expect(wrapper.element.innerHTML).toContain('font-family: \'Roboto\'')
  })

  it('includes mso-font-alt for Outlook compatibility', () => {
    const wrapper = mount(EFont, {
      props: {
        fontFamily: 'Roboto',
        fallbackFontFamily: 'Arial',
      },
    })
    expect(wrapper.element.innerHTML).toContain('mso-font-alt: \'Arial\'')
  })

  it('uses first item of fallbackFontFamily array for mso-font-alt', () => {
    const wrapper = mount(EFont, {
      props: {
        fontFamily: 'Roboto',
        fallbackFontFamily: ['Arial', 'sans-serif'],
      },
    })
    expect(wrapper.element.innerHTML).toContain('mso-font-alt: \'Arial\'')
  })

  it('includes font-style with default "normal"', () => {
    const wrapper = mount(EFont, {
      props: {
        fontFamily: 'Roboto',
        fallbackFontFamily: 'Arial',
      },
    })
    expect(wrapper.element.innerHTML).toContain('font-style: normal')
  })

  it('allows overriding fontStyle', () => {
    const wrapper = mount(EFont, {
      props: {
        fontFamily: 'Roboto',
        fallbackFontFamily: 'Arial',
        fontStyle: 'italic',
      },
    })
    expect(wrapper.element.innerHTML).toContain('font-style: italic')
  })

  it('includes font-weight with default 400', () => {
    const wrapper = mount(EFont, {
      props: {
        fontFamily: 'Roboto',
        fallbackFontFamily: 'Arial',
      },
    })
    expect(wrapper.element.innerHTML).toContain('font-weight: 400')
  })

  it('allows overriding fontWeight', () => {
    const wrapper = mount(EFont, {
      props: {
        fontFamily: 'Roboto',
        fallbackFontFamily: 'Arial',
        fontWeight: 700,
      },
    })
    expect(wrapper.element.innerHTML).toContain('font-weight: 700')
  })

  it('includes webFont src when provided', () => {
    const wrapper = mount(EFont, {
      props: {
        fontFamily: 'Roboto',
        fallbackFontFamily: 'Arial',
        webFont: {
          url: 'https://fonts.gstatic.com/roboto.woff2',
          format: 'woff2',
        },
      },
    })
    expect(wrapper.element.innerHTML).toContain('src: url(https://fonts.gstatic.com/roboto.woff2) format(\'woff2\')')
  })

  it('does not include src when webFont is not provided', () => {
    const wrapper = mount(EFont, {
      props: {
        fontFamily: 'Roboto',
        fallbackFontFamily: 'Arial',
      },
    })
    expect(wrapper.element.innerHTML).not.toContain('src: url(')
  })

  it('includes wildcard font-family rule', () => {
    const wrapper = mount(EFont, {
      props: {
        fontFamily: 'Roboto',
        fallbackFontFamily: 'Arial',
      },
    })
    expect(wrapper.element.innerHTML).toContain('font-family: \'Roboto\', Arial')
  })

  it('includes array of fallback fonts in wildcard rule', () => {
    const wrapper = mount(EFont, {
      props: {
        fontFamily: 'Roboto',
        fallbackFontFamily: ['Arial', 'sans-serif'],
      },
    })
    expect(wrapper.element.innerHTML).toContain('font-family: \'Roboto\', Arial, sans-serif')
  })

  it('matches snapshot', () => {
    const wrapper = mount(EFont, {
      props: {
        fontFamily: 'Roboto',
        fallbackFontFamily: 'Arial',
        webFont: {
          url: 'https://fonts.gstatic.com/roboto.woff2',
          format: 'woff2',
        },
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
