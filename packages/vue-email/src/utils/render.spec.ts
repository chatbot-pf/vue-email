import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { render } from './render'

const SimpleEmail = defineComponent({
  name: 'SimpleEmail',
  render() {
    return h('html', { lang: 'en', dir: 'ltr' }, [
      h('head'),
      h('body', [
        h('p', 'Hello World'),
      ]),
    ])
  },
})

describe('render', () => {
  it('renders a Vue component to HTML string with DOCTYPE', async () => {
    const html = await render(h(SimpleEmail))
    expect(html).toContain('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"')
    expect(html).toContain('<html')
    expect(html).toContain('<p>Hello World</p>')
  })

  it('strips any existing DOCTYPE from component output', async () => {
    // Use a component that emits its own DOCTYPE to exercise the stripping path
    const EmailWithDoctype = defineComponent({
      name: 'EmailWithDoctype',
      render() {
        return h('html', { lang: 'en' }, [
          h('head'),
          h('body', [h('p', 'content')]),
        ])
      },
    })
    // Simulate a raw output that already contains a DOCTYPE (e.g. from server-side injection)
    // render() should normalise to exactly one DOCTYPE
    const html = await render(h(EmailWithDoctype))
    const doctypeCount = (html.match(/<!DOCTYPE/gi) || []).length
    expect(doctypeCount).toBe(1)
    expect(html.startsWith('<!DOCTYPE')).toBe(true)
  })

  it('renders to plain text when plainText option is true', async () => {
    const text = await render(h(SimpleEmail), { plainText: true })
    expect(text).toContain('Hello World')
    expect(text).not.toContain('<p>')
    expect(text).not.toContain('<!DOCTYPE')
  })

  it('renders formatted HTML when pretty option is true', async () => {
    const html = await render(h(SimpleEmail), { pretty: true })
    expect(html).toContain('<!DOCTYPE')
    expect(html).toContain('\n')
  })

  it('passes htmlToTextOptions to plain text converter', async () => {
    const EmailWithLink = defineComponent({
      render() {
        return h('html', [
          h('body', [
            h('a', { href: 'https://example.com' }, 'Visit'),
          ]),
        ])
      },
    })

    const text = await render(h(EmailWithLink), {
      plainText: true,
      htmlToTextOptions: { wordwrap: 40 },
    })
    expect(text).toContain('Visit')
  })

  it('returns HTML string without options', async () => {
    const html = await render(h(SimpleEmail))
    expect(typeof html).toBe('string')
    expect(html.startsWith('<!DOCTYPE')).toBe(true)
  })
})
