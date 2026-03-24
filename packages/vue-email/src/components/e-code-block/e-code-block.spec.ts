import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ECodeBlock from './e-code-block'
import { xonokai } from './themes'

const simpleCode = `const x = 1;`
const multiLineCode = `const x = 1;\nconst y = 2;`

describe('eCodeBlock', () => {
  it('renders a <pre> element', () => {
    const wrapper = mount(ECodeBlock, {
      props: {
        code: simpleCode,
        language: 'javascript',
        theme: xonokai,
      },
    })
    expect(wrapper.find('pre').exists()).toBe(true)
  })

  it('renders a <code> element inside <pre>', () => {
    const wrapper = mount(ECodeBlock, {
      props: {
        code: simpleCode,
        language: 'javascript',
        theme: xonokai,
      },
    })
    expect(wrapper.find('pre code').exists()).toBe(true)
  })

  it('applies theme base styles with width: 100%', () => {
    const wrapper = mount(ECodeBlock, {
      props: {
        code: simpleCode,
        language: 'javascript',
        theme: xonokai,
      },
    })
    const pre = wrapper.find('pre')
    const style = pre.attributes('style') ?? ''
    expect(style).toContain('width: 100%')
    // theme base background
    expect(style).toContain('#2a2a2a')
  })

  it('renders syntax-highlighted code with span elements', () => {
    const wrapper = mount(ECodeBlock, {
      props: {
        code: simpleCode,
        language: 'javascript',
        theme: xonokai,
      },
    })
    // should have span elements for tokens
    const spans = wrapper.findAll('span')
    expect(spans.length).toBeGreaterThan(0)
  })

  it('renders a <br> after each line', () => {
    const wrapper = mount(ECodeBlock, {
      props: {
        code: multiLineCode,
        language: 'javascript',
        theme: xonokai,
      },
    })
    const html = wrapper.html()
    expect(html).toContain('<br>')
  })

  it('renders line numbers when lineNumbers prop is true', () => {
    const wrapper = mount(ECodeBlock, {
      props: {
        // Use code without standalone "1" or "2" digits to avoid false positives
        code: `const a = true;\nconst b = false;`,
        language: 'javascript',
        theme: xonokai,
        lineNumbers: true,
      },
    })
    const spans = wrapper.findAll('span')
    // Line number spans have a fixed width of 2em — find them by their style
    const lineNumberSpans = spans.filter(s => s.attributes('style')?.includes('2em'))
    expect(lineNumberSpans.length).toBe(2)
    expect(lineNumberSpans[0].text()).toBe('1')
    expect(lineNumberSpans[1].text()).toBe('2')
  })

  it('does not render line numbers when lineNumbers is false', () => {
    const wrapper = mount(ECodeBlock, {
      props: {
        code: simpleCode,
        language: 'javascript',
        theme: xonokai,
        lineNumbers: false,
      },
    })
    const spans = wrapper.findAll('span')
    // No span should contain just "1" as a number span (line number)
    const lineNumberSpan = spans.find(s => s.text() === '1' && s.attributes('style')?.includes('2em'))
    expect(lineNumberSpan).toBeUndefined()
  })

  it('applies custom fontFamily to tokens', () => {
    const wrapper = mount(ECodeBlock, {
      props: {
        code: simpleCode,
        language: 'javascript',
        theme: xonokai,
        fontFamily: 'Courier New',
      },
    })
    const html = wrapper.html()
    expect(html).toContain('Courier New')
  })

  it('converts spaces to email-safe characters in plain text tokens', () => {
    const wrapper = mount(ECodeBlock, {
      props: {
        code: 'hello world',
        language: 'javascript',
        theme: xonokai,
      },
    })
    const html = wrapper.html()
    // Non-breaking space \xA0 (&nbsp;) + zero-width characters are used for email safety
    // The space between "hello" and "world" should be converted
    // happy-dom serializes \xA0 as &nbsp; in innerHTML
    expect(html).toMatch(/&nbsp;|\u00A0/)
  })

  it('throws an error for unknown languages', () => {
    expect(() => {
      mount(ECodeBlock, {
        props: {
          code: simpleCode,
          language: 'nonexistentlanguage' as any,
          theme: xonokai,
        },
      })
    }).toThrow()
  })

  it('passes through extra attributes to the <pre> element', () => {
    const wrapper = mount(ECodeBlock, {
      props: {
        code: simpleCode,
        language: 'javascript',
        theme: xonokai,
      },
      attrs: {
        'data-testid': 'my-codeblock',
      },
    })
    expect(wrapper.find('pre').attributes('data-testid')).toBe('my-codeblock')
  })

  it('renders code with nested token structures (e.g., template literals)', () => {
    const wrapper = mount(ECodeBlock, {
      props: {
        // eslint-disable-next-line no-template-curly-in-string
        code: 'const x = `hello ${name}`',
        language: 'javascript',
        theme: xonokai,
      },
    })
    // Template literals produce nested tokens in Prism
    const spans = wrapper.findAll('span')
    expect(spans.length).toBeGreaterThan(3)
  })

  it('renders code with token aliases (CSS selectors)', () => {
    const wrapper = mount(ECodeBlock, {
      props: {
        code: '.class { color: red; }',
        language: 'css',
        theme: xonokai,
      },
    })
    const html = wrapper.html()
    expect(html).toContain('span')
    // CSS tokens should have styling from theme
    expect(html).toContain('style=')
  })

  it('handles empty code string', () => {
    const wrapper = mount(ECodeBlock, {
      props: {
        code: '',
        language: 'javascript',
        theme: xonokai,
      },
    })
    expect(wrapper.find('pre').exists()).toBe(true)
  })

  it('matches snapshot', () => {
    const wrapper = mount(ECodeBlock, {
      props: {
        code: `const hello = "world";`,
        language: 'javascript',
        theme: xonokai,
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
