import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTemplateBundler, type TemplateBundler } from './bundling'

let tmpDir: string
let bundler: TemplateBundler | null = null

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bundling-test-'))
})

afterEach(async () => {
  if (bundler) {
    await bundler.close()
    bundler = null
  }
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

function writeFile(relPath: string, content: string) {
  const fullPath = path.join(tmpDir, relPath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content)
}

describe('createTemplateBundler', () => {
  it('creates a bundler with a loadComponent method', async () => {
    bundler = await createTemplateBundler(tmpDir)
    expect(bundler).toBeDefined()
    expect(typeof bundler.loadComponent).toBe('function')
    expect(typeof bundler.close).toBe('function')
  })

  it('loads a .tsx component with default export', async () => {
    writeFile(
      'emails/welcome.tsx',
      `export default { name: 'WelcomeEmail' }`,
    )
    bundler = await createTemplateBundler(tmpDir)
    const mod = await bundler.loadComponent(path.join(tmpDir, 'emails/welcome.tsx'))
    expect(mod).toBeDefined()
    expect(mod.default).toBeDefined()
    expect((mod.default as any).name).toBe('WelcomeEmail')
  })

  it('loads a .vue SFC with default export', async () => {
    writeFile(
      'emails/invite.vue',
      `<script>\nexport default { name: 'InviteEmail' }\n</script>\n<template><div>hello</div></template>`,
    )
    bundler = await createTemplateBundler(tmpDir)
    const mod = await bundler.loadComponent(path.join(tmpDir, 'emails/invite.vue'))
    expect(mod).toBeDefined()
    expect(mod.default).toBeDefined()
  })

  it('throws on a file that does not exist', async () => {
    bundler = await createTemplateBundler(tmpDir)
    await expect(
      bundler.loadComponent(path.join(tmpDir, 'emails/nonexistent.tsx')),
    ).rejects.toThrow()
  })
})
