import type { StyleSheet } from 'css-tree'
import { parse } from 'css-tree'
import { describe, expect, it } from 'vitest'
import { isPartInlinable } from './is-part-inlinable'

describe('isPartInlinable', () => {
  function getFirstDeclaration(css: string) {
    const stylesheet = parse(css) as StyleSheet
    const rule = stylesheet.children.first as any
    return rule.block.children.first
  }

  it('returns true for a simple declaration', () => {
    const declaration = getFirstDeclaration('.box { color: red; }')
    expect(isPartInlinable(declaration)).toBe(true)
  })

  it('returns false for a node containing an at-rule', () => {
    // A whole rule with an atrule inside it
    const stylesheet = parse('.box { @media (min-width: 768px) { color: red; } }') as StyleSheet
    const rule = stylesheet.children.first!
    expect(isPartInlinable(rule as any)).toBe(false)
  })

  it('returns false for a rule containing a pseudo-selector', () => {
    const stylesheet = parse('.box:hover { color: red; }') as StyleSheet
    const rule = stylesheet.children.first!
    expect(isPartInlinable(rule as any)).toBe(false)
  })
})
