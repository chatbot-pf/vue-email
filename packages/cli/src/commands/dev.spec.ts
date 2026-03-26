import { describe, expect, it } from 'vitest'
import { buildDevConfig } from './dev'

describe('buildDevConfig', () => {
  it('returns a config object with port and emailsDir', () => {
    const config = buildDevConfig({ emailsDir: './emails', port: 3000 })
    expect(config.port).toBe(3000)
    expect(config.emailsDir).toBe('./emails')
  })

  it('defaults port to 3000 when not provided', () => {
    const config = buildDevConfig({ emailsDir: './emails' })
    expect(config.port).toBe(3000)
  })

  it('includes nuxtRootDir pointing to preview-server', () => {
    const config = buildDevConfig({ emailsDir: './emails', port: 3000 })
    expect(config.nuxtRootDir).toContain('preview-server')
  })
})
