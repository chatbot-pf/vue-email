import type { StyleSheet } from 'css-tree'
import { generate, parse } from 'css-tree'
import { describe, expect, it } from 'vitest'
import { sanitizeStyleSheet } from './sanitize-stylesheet'

describe('sanitizeStyleSheet', () => {
  it('runs without errors on an empty stylesheet', () => {
    const styleSheet = parse('') as StyleSheet
    expect(() => sanitizeStyleSheet(styleSheet)).not.toThrow()
  })

  it('resolves CSS variables and generates correct output', () => {
    const css = `
      :root { --my-color: red; }
      .foo { color: var(--my-color); }
    `
    const styleSheet = parse(css) as StyleSheet
    sanitizeStyleSheet(styleSheet)
    const output = generate(styleSheet)
    // Variable should be resolved to its value
    expect(output).toContain('color:red')
  })

  it('resolves calc expressions to static values', () => {
    const css = `
      .bar { width: calc(0.25rem * 4); }
    `
    const styleSheet = parse(css) as StyleSheet
    sanitizeStyleSheet(styleSheet)
    const output = generate(styleSheet)
    // calc should be reduced
    expect(output).toContain('width:1rem')
  })

  it('sanitizes oklch colors to rgb', () => {
    const css = `
      .baz { color: oklch(50% 0 0); }
    `
    const styleSheet = parse(css) as StyleSheet
    sanitizeStyleSheet(styleSheet)
    const output = generate(styleSheet)
    // oklch should be converted to rgb
    expect(output).toContain('rgb(')
    expect(output).not.toContain('oklch')
  })
})
