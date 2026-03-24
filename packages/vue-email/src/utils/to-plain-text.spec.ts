import { describe, expect, it } from 'vitest'
import { plainTextSelectors, toPlainText } from './to-plain-text'

describe('toPlainText', () => {
  it('converts basic HTML to plain text', () => {
    const html = '<p>Hello, world!</p>'
    const result = toPlainText(html)
    expect(result.trim()).toBe('Hello, world!')
  })

  it('strips HTML tags from multiple elements', () => {
    const html = '<h1>Title</h1><p>Paragraph text.</p>'
    const result = toPlainText(html)
    // html-to-text uppercases heading content by default
    expect(result.toUpperCase()).toContain('TITLE')
    expect(result).toContain('Paragraph text.')
    expect(result).not.toContain('<h1>')
    expect(result).not.toContain('<p>')
  })

  it('skips img elements', () => {
    const html = '<p>Text before</p><img src="https://example.com/img.png" alt="Logo" /><p>Text after</p>'
    const result = toPlainText(html)
    expect(result).toContain('Text before')
    expect(result).toContain('Text after')
    expect(result).not.toContain('img.png')
    expect(result).not.toContain('Logo')
  })

  it('skips elements with data-skip-in-text=true', () => {
    const html = '<p>Visible</p><span data-skip-in-text="true">Hidden content</span><p>Also visible</p>'
    const result = toPlainText(html)
    expect(result).toContain('Visible')
    expect(result).toContain('Also visible')
    expect(result).not.toContain('Hidden content')
  })

  it('renders link text without brackets', () => {
    const html = '<a href="https://example.com">Visit us</a>'
    const result = toPlainText(html)
    expect(result).not.toContain('[')
    expect(result).not.toContain(']')
    expect(result).toContain('Visit us')
  })

  it('hides link href when it matches link text', () => {
    const url = 'https://example.com'
    const html = `<a href="${url}">${url}</a>`
    const result = toPlainText(html)
    // With hideLinkHrefIfSameAsText: true, the URL should not be repeated
    expect(result.trim()).toBe(url)
    // The URL should appear only once, not twice
    expect(result.split(url).length - 1).toBe(1)
  })

  it('includes link href when it differs from link text', () => {
    const html = '<a href="https://example.com">Click here</a>'
    const result = toPlainText(html)
    expect(result).toContain('Click here')
    expect(result).toContain('https://example.com')
  })

  it('does not wrap long lines (wordwrap disabled)', () => {
    const longText = 'A'.repeat(200)
    const html = `<p>${longText}</p>`
    const result = toPlainText(html)
    // With wordwrap: false, the long text should stay on one line
    const lines = result.trim().split('\n').filter(l => l.length > 0)
    expect(lines.length).toBe(1)
    expect(lines[0]).toBe(longText)
  })

  it('accepts custom HtmlToTextOptions', () => {
    const html = '<p>Hello</p>'
    const result = toPlainText(html, { wordwrap: 80 })
    expect(result.trim()).toBe('Hello')
  })

  it('merges custom selectors with default selectors', () => {
    const html = '<p>Keep this</p><div class="skip-me">Remove this</div>'
    const result = toPlainText(html, {
      selectors: [{ selector: 'div.skip-me', format: 'skip' }],
    })
    expect(result).toContain('Keep this')
    expect(result).not.toContain('Remove this')
  })
})

describe('plainTextSelectors', () => {
  it('exports plainTextSelectors array', () => {
    expect(Array.isArray(plainTextSelectors)).toBe(true)
    expect(plainTextSelectors.length).toBeGreaterThan(0)
  })

  it('includes img skip selector', () => {
    const imgSelector = plainTextSelectors.find(s => s.selector === 'img')
    expect(imgSelector).toBeDefined()
    expect(imgSelector?.format).toBe('skip')
  })

  it('includes data-skip-in-text selector', () => {
    const skipSelector = plainTextSelectors.find(s => s.selector === '[data-skip-in-text=true]')
    expect(skipSelector).toBeDefined()
    expect(skipSelector?.format).toBe('skip')
  })

  it('includes anchor selector with correct options', () => {
    const anchorSelector = plainTextSelectors.find(s => s.selector === 'a')
    expect(anchorSelector).toBeDefined()
    expect(anchorSelector?.options).toMatchObject({
      linkBrackets: false,
      hideLinkHrefIfSameAsText: true,
    })
  })
})
