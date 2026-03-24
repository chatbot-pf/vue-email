import type { Rule, StyleSheet } from 'css-tree'
import { generate, parse } from 'css-tree'
import { describe, expect, it } from 'vitest'
import { extractRulesPerClass } from './extract-rules-per-class'

describe('extractRulesPerClass()', () => {
  function convertToComparable(map: Map<string, Rule>): Record<string, string> {
    return Object.fromEntries(Array.from(map.entries(), ([k, v]) => [k, generate(v)]))
  }

  it('works with just inlinable utilities', () => {
    const stylesheet = parse(`
      .text-center { text-align: center; }
      .bg-red-500 { background-color: red; }
    `) as StyleSheet

    const classes = ['text-center', 'bg-red-500']
    const { inlinable, nonInlinable } = extractRulesPerClass(stylesheet, classes)

    expect(convertToComparable(inlinable)).toEqual({
      'text-center': '.text-center{text-align:center}',
      'bg-red-500': '.bg-red-500{background-color:red}',
    })
    expect(convertToComparable(nonInlinable)).toEqual({})
  })

  it('handles non-inlinable utilities (media queries)', () => {
    const stylesheet = parse(`
      .lg\\:w-half {
        @media (min-width: 1024px) {
          width: 50%;
        }
      }
    `) as StyleSheet

    const classes = ['lg:w-half']
    const { inlinable, nonInlinable } = extractRulesPerClass(stylesheet, classes)

    expect(convertToComparable(inlinable)).toEqual({})
    expect(Object.keys(convertToComparable(nonInlinable))).toContain('lg:w-half')
  })

  it('ignores classes not in the provided class list', () => {
    const stylesheet = parse(`
      .text-center { text-align: center; }
      .bg-red-500 { background-color: red; }
    `) as StyleSheet

    const classes = ['text-center']
    const { inlinable, nonInlinable } = extractRulesPerClass(stylesheet, classes)

    expect(convertToComparable(inlinable)).toEqual({
      'text-center': '.text-center{text-align:center}',
    })
    expect(convertToComparable(nonInlinable)).toEqual({})
  })

  it('treats rules with pseudo-selectors as fully non-inlinable', () => {
    // When a class like "hover:text-red" has an escaped colon, the rule uses
    // CSS nesting syntax. The class selector name (decoded) is "hover:text-red".
    // However, a rule like `.btn:hover` has class "btn" + pseudo ":hover".
    const stylesheet = parse(`
      .hover\\:text-red { &:hover { color: red; } }
    `) as StyleSheet

    const classes = ['hover:text-red']
    const { inlinable, nonInlinable } = extractRulesPerClass(stylesheet, classes)

    // hover:text-red has a nested pseudo rule inside (non-inlinable)
    expect(Object.keys(convertToComparable(nonInlinable))).toContain('hover:text-red')
    expect(Object.keys(convertToComparable(inlinable))).not.toContain('hover:text-red')
  })
})
