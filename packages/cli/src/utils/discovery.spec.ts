import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getEmailsDirectoryMetadata } from './discovery'

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'discovery-test-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

function writeFile(relPath: string, content: string) {
  const fullPath = path.join(tmpDir, relPath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content)
}

describe('getEmailsDirectoryMetadata', () => {
  it('returns undefined for non-existent directory', async () => {
    const result = await getEmailsDirectoryMetadata('/non/existent/path')
    expect(result).toBeUndefined()
  })

  it('discovers .vue files with default export', async () => {
    writeFile('welcome.vue', '<script>\nexport default {}\n</script>')
    const result = await getEmailsDirectoryMetadata(tmpDir)
    expect(result).toBeDefined()
    expect(result!.emailFilenames).toContain('welcome')
  })

  it('discovers .tsx files with default export', async () => {
    writeFile('invite.tsx', 'export default function Invite() { return null }')
    const result = await getEmailsDirectoryMetadata(tmpDir)
    expect(result).toBeDefined()
    expect(result!.emailFilenames).toContain('invite')
  })

  it('ignores files without default export', async () => {
    writeFile('utils.ts', 'export const helper = () => {}')
    const result = await getEmailsDirectoryMetadata(tmpDir)
    expect(result).toBeDefined()
    expect(result!.emailFilenames).toHaveLength(0)
  })

  it('ignores non-email extensions', async () => {
    writeFile('readme.md', 'export default {}')
    writeFile('style.css', '')
    const result = await getEmailsDirectoryMetadata(tmpDir)
    expect(result!.emailFilenames).toHaveLength(0)
  })

  it('ignores directories starting with _', async () => {
    writeFile('_private/secret.vue', '<script>\nexport default {}\n</script>')
    const result = await getEmailsDirectoryMetadata(tmpDir)
    expect(result).toBeDefined()
    expect(result!.subDirectories).toHaveLength(0)
  })

  it('ignores static directory', async () => {
    writeFile('static/logo.vue', '<script>\nexport default {}\n</script>')
    const result = await getEmailsDirectoryMetadata(tmpDir)
    expect(result!.subDirectories).toHaveLength(0)
  })

  it('discovers subdirectories recursively', async () => {
    writeFile('newsletters/weekly.vue', '<script>\nexport default {}\n</script>')
    writeFile('magic-links/verify.vue', '<script>\nexport default {}\n</script>')
    const result = await getEmailsDirectoryMetadata(tmpDir)
    expect(result).toBeDefined()
    expect(result!.subDirectories).toHaveLength(2)
    const dirs = result!.subDirectories.map(d => d.directoryName).sort()
    expect(dirs).toEqual(['magic-links', 'newsletters'])
  })

  it('keeps file extensions when keepFileExtensions=true', async () => {
    writeFile('welcome.vue', '<script>\nexport default {}\n</script>')
    const result = await getEmailsDirectoryMetadata(tmpDir, true)
    expect(result!.emailFilenames).toContain('welcome.vue')
  })

  it('returns correct absolutePath and relativePath', async () => {
    writeFile('welcome.vue', '<script>\nexport default {}\n</script>')
    const result = await getEmailsDirectoryMetadata(tmpDir)
    expect(result!.absolutePath).toBe(tmpDir)
    expect(result!.relativePath).toBe('')
  })

  it('sets relative path for subdirectories', async () => {
    writeFile('promo/sale.vue', '<script>\nexport default {}\n</script>')
    const result = await getEmailsDirectoryMetadata(tmpDir)
    expect(result!.subDirectories[0]!.relativePath).toBe('promo')
  })

  it('merges single-child subdirectory chains', async () => {
    writeFile('a/b/email.vue', '<script>\nexport default {}\n</script>')
    const result = await getEmailsDirectoryMetadata(tmpDir)
    expect(result!.subDirectories).toHaveLength(1)
    expect(result!.subDirectories[0]!.directoryName).toBe(path.join('a', 'b'))
  })

  it('recognizes Vue defineComponent default export', async () => {
    writeFile('card.vue', '<script>\nimport { defineComponent } from "vue"\nexport default defineComponent({})\n</script>')
    const result = await getEmailsDirectoryMetadata(tmpDir)
    expect(result!.emailFilenames).toContain('card')
  })
})
