import type { StyleSheet } from 'css-tree'
import { generate, parse } from 'css-tree'
import { describe, expect, it } from 'vitest'
import { splitMixedRule } from './split-mixed-rule'

describe('splitMixedRule', () => {
  function getFirstRule(css: string) {
    const stylesheet = parse(css) as StyleSheet
    return stylesheet.children.first as any
  }

  it('returns only nonInlinablePart when selector has pseudo', () => {
    const rule = getFirstRule('.btn:hover { color: red; }')
    const { inlinablePart, nonInlinablePart } = splitMixedRule(rule)
    expect(inlinablePart).toBeNull()
    expect(nonInlinablePart).not.toBeNull()
    expect(generate(nonInlinablePart!)).toContain('color:red')
  })

  it('splits mixed rule into inlinable and non-inlinable parts', () => {
    // A rule with an at-rule nested inside (non-inlinable) and a plain declaration (inlinable)
    const css = '.text-body { color: green; @media (min-width: 40rem) { color: darkgreen; } }'
    const rule = getFirstRule(css)
    const { inlinablePart, nonInlinablePart } = splitMixedRule(rule)
    expect(inlinablePart).not.toBeNull()
    expect(nonInlinablePart).not.toBeNull()
    expect(generate(inlinablePart!)).toContain('color:green')
    expect(generate(nonInlinablePart!)).toContain('@media')
  })

  it('returns null inlinablePart when everything is non-inlinable', () => {
    const css = '.hover\\:text-red-500 { &:hover { color: red; } }'
    const rule = getFirstRule(css)
    // This rule has nesting – it's non-inlinable
    const { inlinablePart } = splitMixedRule(rule)
    // The rule has nesting but no pseudo in the prelude itself, so inlinablePart would be null
    // since the nested rule is not inlinable
    expect(inlinablePart).toBeNull()
  })
})
