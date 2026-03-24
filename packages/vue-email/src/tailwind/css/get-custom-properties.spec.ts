import { generate, parse } from 'css-tree'
import { describe, expect, it } from 'vitest'
import { getCustomProperties } from './get-custom-properties'

describe('getCustomProperties', () => {
  it('extracts @property definitions', () => {
    const root = parse(`
      @property --tw-shadow {
        syntax: "*";
        inherits: false;
        initial-value: 0 0 #0000;
      }
    `)
    const customProperties = getCustomProperties(root)
    expect(customProperties.size).toBe(1)
    expect(customProperties.has('--tw-shadow')).toBe(true)
    const prop = customProperties.get('--tw-shadow')!
    expect(prop.syntax).toBeDefined()
    expect(prop.inherits).toBeDefined()
    expect(prop.initialValue).toBeDefined()
    // css-tree generates the value without spaces between tokens
    expect(generate(prop.initialValue!.value)).toMatch(/^0 0\s?#0000$/)
  })

  it('ignores @property without -- prefix', () => {
    const root = parse(`
      @property color {
        syntax: "<color>";
        inherits: true;
        initial-value: red;
      }
    `)
    const customProperties = getCustomProperties(root)
    expect(customProperties.size).toBe(0)
  })

  it('returns empty map for CSS with no @property rules', () => {
    const root = parse('.box { color: red; }')
    const customProperties = getCustomProperties(root)
    expect(customProperties.size).toBe(0)
  })

  it('extracts multiple @property definitions', () => {
    const root = parse(`
      @property --tw-translate-x {
        syntax: "*";
        inherits: false;
        initial-value: 0;
      }
      @property --tw-translate-y {
        syntax: "*";
        inherits: false;
        initial-value: 0;
      }
    `)
    const customProperties = getCustomProperties(root)
    expect(customProperties.size).toBe(2)
    expect(customProperties.has('--tw-translate-x')).toBe(true)
    expect(customProperties.has('--tw-translate-y')).toBe(true)
  })
})
