import { describe, expect, it } from 'vitest'
import { inlineTailwind } from './inline-tailwind'

describe('inlineTailwind', () => {
  it('inlines basic utility classes as inline styles', async () => {
    const html = `<html><head></head><body><p class="text-white">Hello</p></body></html>`
    const result = await inlineTailwind(html)
    expect(result).toContain('style=')
    expect(result).not.toContain('class="text-white"')
  })

  it('inlines background color utility', async () => {
    const html = `<html><head></head><body><div class="bg-blue-500">content</div></body></html>`
    const result = await inlineTailwind(html)
    expect(result).toContain('style=')
    // bg-blue-500 should be inlined and removed from class
    expect(result).not.toContain('class="bg-blue-500"')
  })

  it('handles multiple classes on the same element', async () => {
    const html = `<html><head></head><body><div class="text-white bg-blue-500 p-4">content</div></body></html>`
    const result = await inlineTailwind(html)
    expect(result).toContain('style=')
  })

  it('handles HTML with no class attributes', async () => {
    const html = `<html><head></head><body><div>no classes</div></body></html>`
    const result = await inlineTailwind(html)
    expect(result).toBe(html)
  })

  it('preserves existing inline styles, tailwind styles come before', async () => {
    const html = `<html><head></head><body><div class="text-white" style="font-size: 16px">content</div></body></html>`
    const result = await inlineTailwind(html)
    expect(result).toContain('font-size: 16px')
    expect(result).not.toContain('class="text-white"')
  })

  it('puts non-inlinable rules in a style block in head', async () => {
    const html = `<html><head></head><body><div class="hover:text-white">content</div></body></html>`
    const result = await inlineTailwind(html)
    expect(result).toContain('<style>')
    expect(result).toContain('</style>')
  })

  it('throws error when non-inlinable rules exist but no head element', async () => {
    const html = `<div class="hover:text-white">content</div>`
    await expect(inlineTailwind(html)).rejects.toThrow()
  })

  it('accepts a tailwind config', async () => {
    const html = `<html><head></head><body><div class="text-white">content</div></body></html>`
    const result = await inlineTailwind(html, {})
    expect(result).toContain('style=')
  })

  it('handles responsive classes that go in style block', async () => {
    const html = `<html><head></head><body><div class="md:text-lg">content</div></body></html>`
    const result = await inlineTailwind(html)
    expect(result).toContain('<style>')
  })

  it('handles dark mode classes that go in style block', async () => {
    const html = `<html><head></head><body><div class="dark:text-white">content</div></body></html>`
    const result = await inlineTailwind(html)
    expect(result).toContain('<style>')
  })
})
