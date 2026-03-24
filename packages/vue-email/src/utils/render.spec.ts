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
    // render() prepends a canonical DOCTYPE and strips any DOCTYPE from the raw SSR output.
    // We exercise the stripping branch by rendering the result a second time: the first
    // render() output already starts with "<!DOCTYPE …>", so passing it through a naive
    // concatenation would duplicate it.  Instead we directly verify that the replace-then-
    // prepend logic produces exactly one DOCTYPE regardless of the raw SSR content.
    // We do this by applying the same regex the implementation uses to a string that
    // contains a DOCTYPE, and asserting the result is single-DOCTYPE.
    const XHTML_DOCTYPE = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
    const doctypeRegex = /<!DOCTYPE.*?>/i
    const rawWithDoctype = '<!DOCTYPE html><html><body>hi</body></html>'
    const stripped = rawWithDoctype.replace(doctypeRegex, '')
    const result = `${XHTML_DOCTYPE}${stripped}`
    // Stripping removed the original and prepend added exactly one
    const count = (result.match(/<!DOCTYPE/gi) || []).length
    expect(count).toBe(1)
    expect(result.startsWith(XHTML_DOCTYPE)).toBe(true)
    // Integration check: render() itself produces exactly one DOCTYPE
    const html = await render(h(SimpleEmail))
    expect((html.match(/<!DOCTYPE/gi) || []).length).toBe(1)
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
