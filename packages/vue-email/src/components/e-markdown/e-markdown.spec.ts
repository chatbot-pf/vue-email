import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EMarkdown from './e-markdown'

describe('eMarkdown', () => {
  it('renders a div with data-id="vue-email-markdown"', () => {
    const wrapper = mount(EMarkdown, {
      slots: { default: '# Hello' },
    })
    expect(wrapper.find('[data-id="vue-email-markdown"]').exists()).toBe(true)
  })

  it('renders heading h1 from markdown', () => {
    const wrapper = mount(EMarkdown, {
      slots: { default: '# Heading 1' },
    })
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toBe('Heading 1')
  })

  it('renders heading h2 from markdown', () => {
    const wrapper = mount(EMarkdown, {
      slots: { default: '## Heading 2' },
    })
    expect(wrapper.find('h2').exists()).toBe(true)
  })

  it('renders heading h3 from markdown', () => {
    const wrapper = mount(EMarkdown, {
      slots: { default: '### Heading 3' },
    })
    expect(wrapper.find('h3').exists()).toBe(true)
  })

  it('renders heading h4 from markdown', () => {
    const wrapper = mount(EMarkdown, {
      slots: { default: '#### Heading 4' },
    })
    expect(wrapper.find('h4').exists()).toBe(true)
  })

  it('renders heading h5 from markdown', () => {
    const wrapper = mount(EMarkdown, {
      slots: { default: '##### Heading 5' },
    })
    expect(wrapper.find('h5').exists()).toBe(true)
  })

  it('renders heading h6 from markdown', () => {
    const wrapper = mount(EMarkdown, {
      slots: { default: '###### Heading 6' },
    })
    expect(wrapper.find('h6').exists()).toBe(true)
  })

  it('renders headings with default inline styles', () => {
    const wrapper = mount(EMarkdown, {
      slots: { default: '# Heading 1' },
    })
    const h1 = wrapper.find('h1')
    const style = h1.attributes('style') ?? ''
    expect(style).toContain('font-weight')
  })

  it('renders bold text', () => {
    const wrapper = mount(EMarkdown, {
      slots: { default: '**bold text**' },
    })
    expect(wrapper.find('strong').exists()).toBe(true)
    expect(wrapper.find('strong').text()).toBe('bold text')
  })

  it('renders bold with default style', () => {
    const wrapper = mount(EMarkdown, {
      slots: { default: '**bold**' },
    })
    const style = wrapper.find('strong').attributes('style') ?? ''
    expect(style).toContain('font-weight:bold')
  })

  it('renders italic text', () => {
    const wrapper = mount(EMarkdown, {
      slots: { default: '*italic text*' },
    })
    expect(wrapper.find('em').exists()).toBe(true)
    expect(wrapper.find('em').text()).toBe('italic text')
  })

  it('renders italic with default style', () => {
    const wrapper = mount(EMarkdown, {
      slots: { default: '*italic*' },
    })
    const style = wrapper.find('em').attributes('style') ?? ''
    expect(style).toContain('font-style:italic')
  })

  it('renders strikethrough text', () => {
    const wrapper = mount(EMarkdown, {
      slots: { default: '~~strikethrough~~' },
    })
    expect(wrapper.find('del').exists()).toBe(true)
  })

  it('renders links with target="_blank"', () => {
    const wrapper = mount(EMarkdown, {
      slots: { default: '[link](https://example.com)' },
    })
    const a = wrapper.find('a')
    expect(a.exists()).toBe(true)
    expect(a.attributes('href')).toBe('https://example.com')
    expect(a.attributes('target')).toBe('_blank')
  })

  it('renders links with default styles', () => {
    const wrapper = mount(EMarkdown, {
      slots: { default: '[link](https://example.com)' },
    })
    const style = wrapper.find('a').attributes('style') ?? ''
    expect(style).toContain('color:#007bff')
  })

  it('renders code block', () => {
    const wrapper = mount(EMarkdown, {
      props: { children: '```\nconst x = 1;\n```' },
    })
    expect(wrapper.find('pre').exists()).toBe(true)
    expect(wrapper.find('pre code').exists()).toBe(true)
  })

  it('renders code block with default styles', () => {
    const wrapper = mount(EMarkdown, {
      props: { children: '```\nconst x = 1;\n```' },
    })
    const style = wrapper.find('pre').attributes('style') ?? ''
    expect(style).toContain('display:block')
  })

  it('renders inline code', () => {
    const wrapper = mount(EMarkdown, {
      slots: { default: 'Use `const` keyword' },
    })
    expect(wrapper.find('code').exists()).toBe(true)
    expect(wrapper.find('code').text()).toBe('const')
  })

  it('renders inline code with default styles', () => {
    const wrapper = mount(EMarkdown, {
      slots: { default: '`code`' },
    })
    const style = wrapper.find('code').attributes('style') ?? ''
    expect(style).toContain('display:inline')
  })

  it('renders blockquote with default styles', () => {
    const wrapper = mount(EMarkdown, {
      slots: { default: '> This is a blockquote' },
    })
    const bq = wrapper.find('blockquote')
    expect(bq.exists()).toBe(true)
    const style = bq.attributes('style') ?? ''
    expect(style).toContain('background:#f9f9f9')
  })

  it('renders unordered list', () => {
    const wrapper = mount(EMarkdown, {
      props: { children: '- item 1\n- item 2\n- item 3' },
    })
    expect(wrapper.find('ul').exists()).toBe(true)
    expect(wrapper.findAll('li').length).toBe(3)
  })

  it('renders ordered list', () => {
    const wrapper = mount(EMarkdown, {
      props: { children: '1. item 1\n2. item 2\n3. item 3' },
    })
    expect(wrapper.find('ol').exists()).toBe(true)
    expect(wrapper.findAll('li').length).toBe(3)
  })

  it('renders table', () => {
    const wrapper = mount(EMarkdown, {
      props: { children: '| Col1 | Col2 |\n| --- | --- |\n| A | B |' },
    })
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.find('thead').exists()).toBe(true)
    expect(wrapper.find('tbody').exists()).toBe(true)
  })

  it('renders table with tr and td elements', () => {
    const wrapper = mount(EMarkdown, {
      props: { children: '| Col1 | Col2 |\n| --- | --- |\n| A | B |' },
    })
    expect(wrapper.find('tr').exists()).toBe(true)
    expect(wrapper.find('td').exists()).toBe(true)
  })

  it('applies custom styles for headings via markdownCustomStyles', () => {
    const wrapper = mount(EMarkdown, {
      props: {
        markdownCustomStyles: {
          h1: { color: 'red', fontSize: '3rem' },
        },
      },
      slots: { default: '# Heading 1' },
    })
    const h1 = wrapper.find('h1')
    const style = h1.attributes('style') ?? ''
    expect(style).toContain('color:red')
    expect(style).toContain('font-size:3rem')
  })

  it('custom h1 style overrides (replaces) default h1 style', () => {
    const wrapper = mount(EMarkdown, {
      props: {
        markdownCustomStyles: {
          h1: { color: 'blue' },
        },
      },
      slots: { default: '# Heading 1' },
    })
    const h1 = wrapper.find('h1')
    const style = h1.attributes('style') ?? ''
    // Custom style present
    expect(style).toContain('color:blue')
    // The default h1 styles (font-weight, font-size, padding-top) are NOT merged because
    // markdownCustomStyles does a shallow merge — h1 style object is replaced entirely
    expect(style).not.toContain('font-size:2.5rem')
  })

  it('applies container styles via markdownContainerStyles', () => {
    const wrapper = mount(EMarkdown, {
      props: {
        markdownContainerStyles: { backgroundColor: 'blue', padding: '10px' },
      },
      slots: { default: '# Hello' },
    })
    const div = wrapper.find('[data-id="vue-email-markdown"]')
    const style = div.attributes('style') ?? ''
    expect(style).toContain('background-color: blue')
  })

  it('custom link style overrides default', () => {
    const wrapper = mount(EMarkdown, {
      props: {
        markdownCustomStyles: {
          link: { color: 'green' },
        },
      },
      slots: { default: '[link](https://example.com)' },
    })
    const style = wrapper.find('a').attributes('style') ?? ''
    expect(style).toContain('color:green')
  })

  it('renders images with alt text', () => {
    const wrapper = mount(EMarkdown, {
      props: { children: '![Alt text](https://example.com/image.png)' },
    })
    const html = wrapper.html()
    expect(html).toContain('<img')
    expect(html).toContain('alt="Alt text"')
  })

  it('renders horizontal rule', () => {
    const wrapper = mount(EMarkdown, {
      props: { children: 'Before\n\n---\n\nAfter' },
    })
    expect(wrapper.find('hr').exists()).toBe(true)
  })

  it('renders strikethrough text with del element', () => {
    const wrapper = mount(EMarkdown, {
      props: { children: '~~deleted~~' },
    })
    const html = wrapper.html()
    expect(html).toContain('<del')
  })

  it('renders nested lists', () => {
    const wrapper = mount(EMarkdown, {
      props: { children: '- Item 1\n  - Nested item\n- Item 2' },
    })
    const lists = wrapper.findAll('ul')
    expect(lists.length).toBeGreaterThanOrEqual(1)
  })

  it('renders ordered list with start attribute', () => {
    const wrapper = mount(EMarkdown, {
      props: { children: '3. Item 3\n4. Item 4' },
    })
    const html = wrapper.html()
    expect(html).toContain('<ol')
  })

  it('renders table with alignment', () => {
    const wrapper = mount(EMarkdown, {
      props: { children: '| Left | Center | Right |\n| :--- | :---: | ---: |\n| A | B | C |' },
    })
    const html = wrapper.html()
    expect(html).toContain('align=')
  })

  it('renders headings h2-h6', () => {
    const wrapper = mount(EMarkdown, {
      props: { children: '## H2\n### H3\n#### H4\n##### H5\n###### H6' },
    })
    expect(wrapper.find('h2').exists()).toBe(true)
    expect(wrapper.find('h3').exists()).toBe(true)
    expect(wrapper.find('h4').exists()).toBe(true)
    expect(wrapper.find('h5').exists()).toBe(true)
    expect(wrapper.find('h6').exists()).toBe(true)
  })

  it('matches snapshot', () => {
    const wrapper = mount(EMarkdown, {
      props: {
        children: '# Hello\n\nThis is **bold** and *italic* text.\n\n[Link](https://example.com)',
      },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
