import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createDependencyGraph } from './dependency-graph'

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dep-graph-test-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

function writeFile(relPath: string, content: string) {
  const full = path.join(tmpDir, relPath)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content)
  return full
}

describe('createDependencyGraph', () => {
  it('initializes an empty graph for an empty directory', async () => {
    const [graph] = await createDependencyGraph(tmpDir)
    expect(Object.keys(graph)).toHaveLength(0)
  })

  it('indexes a single file with no imports', async () => {
    const file = writeFile('email.tsx', 'export default function Email() {}')
    const [graph] = await createDependencyGraph(tmpDir)
    expect(graph[file]).toBeDefined()
    expect(graph[file]!.dependencyPaths).toHaveLength(0)
    expect(graph[file]!.dependentPaths).toHaveLength(0)
  })

  it('records direct dependency between files', async () => {
    const base = writeFile('components/button.tsx', 'export const Button = () => null')
    const email = writeFile('email.tsx', `import { Button } from './components/button'
export default function Email() { return null }`)
    const [graph] = await createDependencyGraph(tmpDir)
    expect(graph[email]!.dependencyPaths).toContain(base)
    expect(graph[base]!.dependentPaths).toContain(email)
  })

  it('indexes .vue files', async () => {
    const file = writeFile('welcome.vue', '<template><div/></template>')
    const [graph] = await createDependencyGraph(tmpDir)
    expect(graph[file]).toBeDefined()
  })

  it('resolves dependents transitively', async () => {
    const util = writeFile('utils.ts', 'export const x = 1')
    const comp = writeFile('comp.tsx', `import { x } from './utils'
export const Comp = () => null`)
    const email = writeFile('email.tsx', `import { Comp } from './comp'
export default function Email() { return null }`)
    const [_graph, , { resolveDependentsOf }] = await createDependencyGraph(tmpDir)
    const deps = resolveDependentsOf(util)
    expect(deps).toContain(comp)
    expect(deps).toContain(email)
    // util itself not in the list
    expect(deps).not.toContain(util)
  })

  it('handles file add event', async () => {
    const [graph, updateGraph] = await createDependencyGraph(tmpDir)
    const newFile = writeFile('new-email.tsx', 'export default function New() {}')
    await updateGraph('add', newFile)
    expect(graph[newFile]).toBeDefined()
  })

  it('handles file change event (re-indexes imports)', async () => {
    const comp = writeFile('comp.tsx', 'export const Comp = () => null')
    const email = writeFile('email.tsx', 'export default function Email() {}')
    const [graph, updateGraph] = await createDependencyGraph(tmpDir)
    expect(graph[email]!.dependencyPaths).toHaveLength(0)

    // Update the file to now import comp
    fs.writeFileSync(email, `import { Comp } from './comp'\nexport default function Email() { return null }`)
    await updateGraph('change', email)
    expect(graph[email]!.dependencyPaths).toContain(comp)
    expect(graph[comp]!.dependentPaths).toContain(email)
  })

  it('handles file unlink event', async () => {
    const file = writeFile('email.tsx', 'export default function Email() {}')
    const [graph, updateGraph] = await createDependencyGraph(tmpDir)
    expect(graph[file]).toBeDefined()
    await updateGraph('unlink', file)
    expect(graph[file]).toBeUndefined()
  })

  it('removes dependent references when a file is deleted', async () => {
    const comp = writeFile('comp.tsx', 'export const Comp = () => null')
    const email = writeFile('email.tsx', `import { Comp } from './comp'\nexport default function Email() { return null }`)
    const [graph, updateGraph] = await createDependencyGraph(tmpDir)
    expect(graph[comp]!.dependentPaths).toContain(email)

    fs.rmSync(email)
    await updateGraph('unlink', email)
    expect(graph[email]).toBeUndefined()
    expect(graph[comp]!.dependentPaths).not.toContain(email)
  })
})
