import type { StyleSheet } from 'css-tree'
import { parse } from 'css-tree'
import { describe, expect, it } from 'vitest'
import { sanitizeStyleSheet } from './sanitize-stylesheet'

describe('sanitizeStyleSheet', () => {
  it('runs without errors on an empty stylesheet', () => {
    const styleSheet = parse('') as StyleSheet
    expect(() => sanitizeStyleSheet(styleSheet)).not.toThrow()
  })

  it('runs without errors on a simple stylesheet', () => {
    const styleSheet = parse('.foo { color: red; }') as StyleSheet
    expect(() => sanitizeStyleSheet(styleSheet)).not.toThrow()
  })

  it('processes CSS variables in declarations', () => {
    const css = `
      :root { --my-color: oklch(50% 0.2 120); }
      .foo { color: var(--my-color); }
    `
    const styleSheet = parse(css) as StyleSheet
    expect(() => sanitizeStyleSheet(styleSheet)).not.toThrow()
  })
})
