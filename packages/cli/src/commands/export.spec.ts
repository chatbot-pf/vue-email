import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { exportTemplates } from './export'

let tmpDir: string
let outDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'export-test-'))
  outDir = path.join(tmpDir, 'out')
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
  vi.restoreAllMocks()
})

function writeFile(relPath: string, content: string) {
  const full = path.join(tmpDir, relPath)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content)
  return full
}

describe('exportTemplates', () => {
  it('returns early if emailsDir does not exist', async () => {
    const result = await exportTemplates('/nonexistent/path', outDir, {})
    expect(result).toBeUndefined()
    expect(fs.existsSync(outDir)).toBe(false)
  })

  it('creates outDir and writes .html file for each template', async () => {
    // A minimal Vue SFC default export
    writeFile('emails/welcome.vue', `<script>
import { defineComponent, h } from 'vue'
export default defineComponent({
  render() { return h('html', {}, [h('body', {}, ['Hello'])]) }
})
</script>`)

    await exportTemplates(path.join(tmpDir, 'emails'), outDir, {})

    expect(fs.existsSync(outDir)).toBe(true)
    const files = fs.readdirSync(outDir)
    expect(files.some(f => f.endsWith('.html'))).toBe(true)
  })

  it('cleans outDir before writing if it already exists', async () => {
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.join(outDir, 'stale.html'), '<html/>')

    writeFile('emails/welcome.vue', `<script>
import { defineComponent, h } from 'vue'
export default defineComponent({ render() { return h('div') } })
</script>`)

    await exportTemplates(path.join(tmpDir, 'emails'), outDir, {})

    const files = fs.readdirSync(outDir)
    expect(files).not.toContain('stale.html')
  })

  it('writes plain text file when plainText option is true', async () => {
    writeFile('emails/welcome.vue', `<script>
import { defineComponent, h } from 'vue'
export default defineComponent({ render() { return h('div', {}, ['Hello world']) } })
</script>`)

    await exportTemplates(path.join(tmpDir, 'emails'), outDir, { plainText: true })

    const files = fs.readdirSync(outDir)
    expect(files.some(f => f.endsWith('.txt'))).toBe(true)
  })
})
