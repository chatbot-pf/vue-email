import type { StyleSheet } from 'css-tree'
import { parse } from 'css-tree'
import { describe, expect, it } from 'vitest'
import { unwrapValue } from './unwrap-value'

describe('unwrapValue', () => {
  function getDeclarationValue(css: string) {
    const stylesheet = parse(css) as StyleSheet
    const rule = stylesheet.children.first as any
    const decl = rule.block.children.first as any
    return decl.value
  }

  it('unwraps a Value with a single child', () => {
    const value = getDeclarationValue('.box { color: red; }')
    // A single Identifier node should be unwrapped
    const result = unwrapValue(value)
    expect(result.type).toBe('Identifier')
  })

  it('does not unwrap a Value with multiple children', () => {
    const value = getDeclarationValue('.box { margin: 10px 20px; }')
    const result = unwrapValue(value)
    expect(result.type).toBe('Value')
  })

  it('returns Raw value as-is', () => {
    const raw: any = { type: 'Raw', value: '100px' }
    const result = unwrapValue(raw)
    expect(result).toBe(raw)
  })
})
