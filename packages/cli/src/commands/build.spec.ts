import { describe, expect, it } from 'vitest'
import { buildBuildConfig } from './build'

describe('buildBuildConfig', () => {
  it('returns config with emailsDir and outDir', () => {
    const config = buildBuildConfig({ emailsDir: './emails', outDir: '.output' })
    expect(config.emailsDir).toBe('./emails')
    expect(config.outDir).toBe('.output')
  })

  it('defaults outDir to .output when not provided', () => {
    const config = buildBuildConfig({ emailsDir: './emails' })
    expect(config.outDir).toBe('.output')
  })

  it('includes nuxtRootDir pointing to preview-server', () => {
    const config = buildBuildConfig({ emailsDir: './emails' })
    expect(config.nuxtRootDir).toContain('preview-server')
  })
})
