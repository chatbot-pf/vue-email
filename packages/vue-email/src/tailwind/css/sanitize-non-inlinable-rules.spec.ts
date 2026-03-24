import { generate, parse } from 'css-tree'
import { describe, expect, it } from 'vitest'
import { sanitizeNonInlinableRules } from './sanitize-non-inlinable-rules'

describe('sanitizeNonInlinableRules()', () => {
  it('does not modify inlinable rules', () => {
    const stylesheet = parse('.bg-red-500 { background-color: red; }')
    sanitizeNonInlinableRules(stylesheet)
    expect(generate(stylesheet)).toBe('.bg-red-500{background-color:red}')
  })

  it('makes declarations important in non-inlinable rules (nested at-rule)', () => {
    // Rules with nested at-rules inside them are treated as non-inlinable
    const stylesheet = parse(`.sm\\:mx-auto {
      @media (min-width: 40rem) {
        margin-inline: auto;
      }
    }`)
    sanitizeNonInlinableRules(stylesheet)
    const result = generate(stylesheet)
    expect(result).toContain('margin-inline:auto!important')
  })

  it('sanitizes class names in non-inlinable rules', () => {
    const stylesheet = parse(`.hover\\:text-sky-600 {
      &:hover {
        color: blue;
      }
    }`)
    sanitizeNonInlinableRules(stylesheet)
    const result = generate(stylesheet)
    // class name should be sanitized (: replaced)
    expect(result).toContain('hover_text-sky-600')
  })

  it('makes declarations important for pseudo-selector rules', () => {
    const stylesheet = parse(`.btn:hover { color: red; }`)
    sanitizeNonInlinableRules(stylesheet)
    const result = generate(stylesheet)
    expect(result).toContain('color:red!important')
  })
})
