import { describe, expect, it } from 'vitest'
import { pretty } from './pretty'

describe('pretty', () => {
  it('formats basic HTML', async () => {
    const input = '<div><p>Hello</p></div>'
    const output = await pretty(input)
    expect(output).toContain('<div>')
    expect(output).toContain('<p>Hello</p>')
  })

  it('uses lf line endings by default', async () => {
    const input = '<div><p>Hello</p></div>'
    const output = await pretty(input)
    expect(output).not.toContain('\r\n')
  })

  it('uses 2 space indentation by default', async () => {
    const input
      = '<!DOCTYPE html><html><head><title>T</title></head><body></body></html>'
    const output = await pretty(input)
    const lines = output.split('\n')
    const indentedLine = lines.find(line => line.startsWith('  '))
    expect(indentedLine).toBeDefined()
  })

  it('removes null characters from input', async () => {
    const input = '<div>\0<p>Hello\0</p></div>'
    const output = await pretty(input)
    expect(output).not.toContain('\0')
    expect(output).toContain('<p>Hello</p>')
  })

  it('preserves MSO conditional comments on a single line', async () => {
    const input
      = '<!--[if mso]><table><tr><td>content</td></tr></table><![endif]-->'
    const output = await pretty(input)
    // MSO conditional comments should be preserved and kept on one line
    expect(output).toContain('<!--[if mso]>')
    expect(output).toContain('<![endif]-->')
    // The comment should not be broken across multiple lines in a way
    // that changes the conditional structure
    const msoLine = output
      .split('\n')
      .find(line => line.includes('<!--[if mso]>'))
    expect(msoLine).toBeDefined()
    expect(msoLine).toContain('<![endif]-->')
  })

  it('formats real email HTML with DOCTYPE structure', async () => {
    const input = `<!DOCTYPE html><html><head><title>Test</title></head><body><p>Hello World</p></body></html>`
    const output = await pretty(input)
    expect(output).toContain('<!DOCTYPE html>')
    expect(output).toContain('<html>')
    expect(output).toContain('<head>')
    expect(output).toContain('<body>')
    expect(output).toContain('<p>Hello World</p>')
  })

  it('accepts custom prettier options', async () => {
    const input
      = '<!DOCTYPE html><html><head><title>T</title></head><body></body></html>'
    const output = await pretty(input, { tabWidth: 4 })
    const lines = output.split('\n')
    const indentedLine = lines.find(line => line.startsWith('    '))
    expect(indentedLine).toBeDefined()
  })

  it('returns a promise', () => {
    const result = pretty('<div></div>')
    expect(result).toBeInstanceOf(Promise)
  })
})
