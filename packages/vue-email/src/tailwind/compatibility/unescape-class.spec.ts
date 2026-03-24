import { describe, expect, it } from 'vitest'
import { unescapeClass } from './unescape-class'

describe('unescapeClass', () => {
  it('removes backslash escape sequences', () => {
    expect(unescapeClass('\\[min-height-')).toBe('[min-height-')
  })

  it('removes numeric escape sequences', () => {
    expect(unescapeClass('\\3text')).toBe('text')
  })

  it('handles no escapes', () => {
    expect(unescapeClass('plain-class')).toBe('plain-class')
  })

  it('handles multiple escapes', () => {
    expect(unescapeClass('\\[calc\\(25px\\+100\\%\\)\\]')).toBe('[calc(25px+100%)]')
  })
})
