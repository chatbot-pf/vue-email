import { describe, expect, it } from 'vitest'
import indexCss from './index'
import preflightCss from './preflight'
import themeCss from './theme'
import utilitiesCss from './utilities'

describe('tailwind-stylesheets', () => {
  describe('index', () => {
    it('exports a non-empty CSS string', () => {
      expect(typeof indexCss).toBe('string')
      expect(indexCss.length).toBeGreaterThan(0)
    })

    it('contains layer declarations', () => {
      expect(indexCss).toContain('@layer theme')
      expect(indexCss).toContain('@layer base')
      expect(indexCss).toContain('@layer utilities')
    })

    it('contains tailwind utilities directive', () => {
      expect(indexCss).toContain('@tailwind utilities')
    })
  })

  describe('preflight', () => {
    it('exports a non-empty CSS string', () => {
      expect(typeof preflightCss).toBe('string')
      expect(preflightCss.length).toBeGreaterThan(0)
    })

    it('contains box-sizing reset', () => {
      expect(preflightCss).toContain('box-sizing: border-box')
    })
  })

  describe('theme', () => {
    it('exports a non-empty CSS string', () => {
      expect(typeof themeCss).toBe('string')
      expect(themeCss.length).toBeGreaterThan(0)
    })

    it('contains color variables', () => {
      expect(themeCss).toContain('--color-red-500')
      expect(themeCss).toContain('--color-blue-500')
    })

    it('contains theme directive', () => {
      expect(themeCss).toContain('@theme default')
    })
  })

  describe('utilities', () => {
    it('exports a non-empty CSS string', () => {
      expect(typeof utilitiesCss).toBe('string')
      expect(utilitiesCss.length).toBeGreaterThan(0)
    })

    it('contains utilities directive', () => {
      expect(utilitiesCss).toContain('@tailwind utilities')
    })
  })
})
