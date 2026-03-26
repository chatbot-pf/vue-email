import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'start-test-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
  vi.restoreAllMocks()
})

describe('start command', () => {
  it('exits with error when output dir does not exist', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called')
    })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Change cwd to tmpDir so it looks for .output in a clean directory
    const origCwd = process.cwd()
    process.chdir(tmpDir)

    try {
      const { start } = await import('./start')
      await expect(start()).rejects.toThrow('process.exit called')
    }
    finally {
      process.chdir(origCwd)
    }

    expect(exitSpy).toHaveBeenCalledWith(1)
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('exits with error when server entry file does not exist', async () => {
    // Create the output dir but not the server entry
    fs.mkdirSync(path.join(tmpDir, '.output'), { recursive: true })

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called')
    })
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const origCwd = process.cwd()
    process.chdir(tmpDir)

    try {
      // Re-import with fresh module state
      const mod = await import(`./start?t=${Date.now()}`)
      await expect(mod.start()).rejects.toThrow('process.exit called')
    }
    finally {
      process.chdir(origCwd)
    }

    expect(exitSpy).toHaveBeenCalledWith(1)
  })
})
