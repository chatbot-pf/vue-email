import type { EventName } from 'chokidar'
import { existsSync, promises as fs, statSync } from 'node:fs'
import path from 'node:path'
import { parse } from '@babel/parser'
import traverseModule from '@babel/traverse'

// @babel/traverse ships both a default and a named export depending on how
// it is bundled; handle both.
const traverse
  = typeof traverseModule === 'function'
    ? traverseModule
    : (traverseModule as unknown as { default: typeof traverseModule }).default

export interface Module {
  path: string
  dependencyPaths: string[]
  dependentPaths: string[]
  /** Node-module (non-relative) import specifiers used by this module */
  moduleDependencies: string[]
}

export type DependencyGraph = Record<string, Module>

const SUPPORTED_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs', '.vue']

function isSupportedModule(filePath: string): boolean {
  return SUPPORTED_EXTENSIONS.includes(path.extname(filePath))
}

function isScriptModule(filePath: string): boolean {
  const ext = path.extname(filePath)
  return ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs'].includes(ext)
}

async function readAllFiles(directory: string): Promise<string[]> {
  let all: string[] = []
  const dirents = await fs.readdir(directory, { withFileTypes: true })
  for (const dirent of dirents) {
    const full = path.join(directory, dirent.name)
    if (dirent.isDirectory()) {
      all = all.concat(await readAllFiles(full))
    }
    else {
      all.push(full)
    }
  }
  return all
}

const EXTENSIONS_TO_TRY = ['.ts', '.tsx', '.vue', '.js', '.jsx', '.mjs', '.cjs']

function resolveWithExtension(base: string): string | undefined {
  for (const ext of EXTENSIONS_TO_TRY) {
    if (existsSync(`${base}${ext}`))
      return `${base}${ext}`
  }
  return undefined
}

function resolveImportPath(importPath: string, importer: string): string | null {
  // Non-relative = node_module, skip
  if (!importPath.startsWith('.') && !path.isAbsolute(importPath))
    return null

  const resolved = path.isAbsolute(importPath)
    ? importPath
    : path.resolve(path.dirname(importer), importPath)

  // Directory import → try /index.*
  let isDir = false
  try {
    isDir = statSync(resolved).isDirectory()
  }
  catch { /* doesn't exist yet */ }

  if (isDir) {
    const idx = resolveWithExtension(path.join(resolved, 'index'))
    return idx ?? null
  }

  // Has extension and exists
  if (path.extname(resolved) && existsSync(resolved))
    return resolved

  // Try appending extension
  return resolveWithExtension(resolved) ?? null
}

function getImports(contents: string): string[] {
  const paths: string[] = []
  try {
    const ast = parse(contents, {
      sourceType: 'unambiguous',
      strictMode: false,
      errorRecovery: true,
      plugins: ['jsx', 'typescript', 'decorators'],
    })
    traverse(ast, {
      ImportDeclaration({ node }) {
        paths.push(node.source.value)
      },
      ExportAllDeclaration({ node }) {
        paths.push(node.source.value)
      },
      ExportNamedDeclaration({ node }) {
        if (node.source)
          paths.push(node.source.value)
      },
      CallExpression({ node }) {
        if ('name' in node.callee && node.callee.name === 'require') {
          const arg = node.arguments[0]
          if (arg?.type === 'StringLiteral')
            paths.push(arg.value)
        }
      },
    })
  }
  catch { /* parse errors are non-fatal */ }
  return paths
}

const RE_VUE_SCRIPT = /<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/i

/** Extract the <script> block source from a .vue SFC */
function extractVueScript(contents: string): string {
  const match = RE_VUE_SCRIPT.exec(contents)
  return match?.[1] ?? ''
}

async function getFileDependencies(
  filePath: string,
): Promise<{ dependencyPaths: string[], moduleDependencies: string[] }> {
  let contents: string
  try {
    contents = await fs.readFile(filePath, 'utf8')
  }
  catch {
    return { dependencyPaths: [], moduleDependencies: [] }
  }

  const src = filePath.endsWith('.vue') ? extractVueScript(contents) : contents

  if (!isScriptModule(filePath) && !filePath.endsWith('.vue')) {
    return { dependencyPaths: [], moduleDependencies: [] }
  }

  const rawImports = getImports(src)
  const dependencyPaths: string[] = []
  const moduleDependencies: string[] = []

  for (const imp of rawImports) {
    if (!imp.startsWith('.') && !path.isAbsolute(imp)) {
      moduleDependencies.push(imp)
      continue
    }
    const resolved = resolveImportPath(imp, filePath)
    if (resolved)
      dependencyPaths.push(resolved)
  }

  return { dependencyPaths, moduleDependencies }
}

/**
 * Creates a stateful, bidirectional dependency graph for all supported
 * template files (`.vue`, `.tsx`, `.ts`, `.js`, `.jsx`) inside `directory`.
 *
 * Returns a tuple of:
 * - `graph` — the live graph object (mutated by the updater)
 * - `updateGraph` — async function to call with chokidar events
 * - `{ resolveDependentsOf }` — utility to walk the graph upward
 */
export async function createDependencyGraph(directory: string): Promise<readonly [
  DependencyGraph,
  (event: EventName, filePath: string) => Promise<void>,
  { resolveDependentsOf: (pathToModule: string) => string[] },
]> {
  const files = await readAllFiles(directory)
  const modulePaths = files.filter(isSupportedModule)

  const graph: DependencyGraph = Object.fromEntries(
    modulePaths.map(p => [p, { path: p, dependencyPaths: [], dependentPaths: [], moduleDependencies: [] }]),
  )

  async function updateNode(filePath: string): Promise<void> {
    if (!graph[filePath]) {
      graph[filePath] = { path: filePath, dependencyPaths: [], dependentPaths: [], moduleDependencies: [] }
    }

    const { dependencyPaths: newDeps, moduleDependencies } = await getFileDependencies(filePath)

    // Remove stale back-references
    for (const oldDep of graph[filePath]!.dependencyPaths) {
      if (!newDeps.includes(oldDep) && graph[oldDep]) {
        graph[oldDep]!.dependentPaths = graph[oldDep]!.dependentPaths.filter(d => d !== filePath)
      }
    }

    graph[filePath]!.dependencyPaths = newDeps
    graph[filePath]!.moduleDependencies = moduleDependencies

    for (const dep of newDeps) {
      if (!graph[dep]) {
        await updateNode(dep)
      }
      if (graph[dep] && !graph[dep]!.dependentPaths.includes(filePath)) {
        graph[dep]!.dependentPaths.push(filePath)
      }
    }
  }

  function removeNode(filePath: string): void {
    const mod = graph[filePath]
    if (!mod)
      return
    for (const dep of mod.dependencyPaths) {
      if (graph[dep]) {
        graph[dep]!.dependentPaths = graph[dep]!.dependentPaths.filter(d => d !== filePath)
      }
    }
    // biome-ignore lint/performance/noDelete: graph keyed by path, delete is intentional
    const g = graph as Record<string, Module | undefined>
    g[filePath] = undefined
    delete g[filePath]
  }

  // Initial population
  for (const filePath of modulePaths) {
    await updateNode(filePath)
  }

  async function updateGraph(event: EventName, filePath: string): Promise<void> {
    switch (event) {
      case 'add':
      case 'change':
        if (isSupportedModule(filePath))
          await updateNode(filePath)
        break
      case 'unlink':
        if (isSupportedModule(filePath))
          removeNode(filePath)
        break
      case 'addDir': {
        const added = await readAllFiles(filePath)
        for (const f of added.filter(isSupportedModule))
          await updateNode(f)
        break
      }
      case 'unlinkDir': {
        // Directory already deleted — remove any tracked files under it
        for (const tracked of Object.keys(graph)) {
          if (tracked.startsWith(filePath + path.sep))
            removeNode(tracked)
        }
        break
      }
    }
  }

  function resolveDependentsOf(pathToModule: string): string[] {
    const result = new Set<string>()
    const stack = [pathToModule]
    while (stack.length > 0) {
      const curr = stack.pop()!
      const mod = graph[curr]
      if (!mod)
        continue
      for (const dep of mod.dependentPaths) {
        if (!result.has(dep) && dep !== pathToModule) {
          result.add(dep)
          stack.push(dep)
        }
      }
    }
    return [...result]
  }

  return [graph, updateGraph, { resolveDependentsOf }] as const
}
