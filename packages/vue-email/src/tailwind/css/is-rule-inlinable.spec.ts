import type { StyleSheet } from 'css-tree'
import { parse } from 'css-tree'
import { describe, expect, it } from 'vitest'
import { isRuleInlinable } from './is-rule-inlinable'

describe('isRuleInlinable', () => {
  function getFirstRule(css: string) {
    const stylesheet = parse(css) as StyleSheet
    return stylesheet.children.first!
  }

  it('returns true for simple rule', () => {
    const rule = getFirstRule('.bg-red-500 { background-color: red; }')
    expect(isRuleInlinable(rule as any)).toBe(true)
  })

  it('returns false for rule with media query inside', () => {
    const rule = getFirstRule('.hover\\:text-red-500 { &:hover { @media (hover: hover) { color: red; } } }')
    expect(isRuleInlinable(rule as any)).toBe(false)
  })

  it('returns false for rule with pseudo-class selector', () => {
    const rule = getFirstRule('.hover\\:text-red-500:hover { color: red; }')
    expect(isRuleInlinable(rule as any)).toBe(false)
  })

  it('returns false for rule with pseudo-element selector', () => {
    const rule = getFirstRule('.before\\:block::before { display: block; }')
    expect(isRuleInlinable(rule as any)).toBe(false)
  })

  it('returns true for multi-property rule', () => {
    const rule = getFirstRule('.btn { color: red; background: blue; padding: 4px; }')
    expect(isRuleInlinable(rule as any)).toBe(true)
  })
})
