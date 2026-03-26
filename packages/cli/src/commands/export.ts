import type { Component } from 'vue'
import type { EmailsDirectory } from '../utils/discovery'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { render } from '@mail-please/vue-email'
import { h } from 'vue'
import { createTemplateBundler } from '../utils/bundling'
import { getEmailsDirectoryMetadata } from '../utils/discovery'

export interface ExportOptions {
  pretty?: boolean
  plainText?: boolean
  outDir?: string
}

function collectTemplates(dir: EmailsDirectory): string[] {
  const paths: string[] = []
  for (const name of dir.emailFilenames) {
    // emailFilenames may include extension (when keepFileExtensions=true)
    paths.push(path.join(dir.absolutePath, name))
  }
  for (const sub of dir.subDirectories) {
    paths.push(...collectTemplates(sub))
  }
  return paths
}

/**
 * Render all templates in `emailsDir` to static HTML (or plain text) files
 * and write them to `outputDir`.
 */
export async function exportTemplates(
  emailsDir: string,
  outputDir: string,
  options: ExportOptions,
): Promise<void> {
  const metadata = await getEmailsDirectoryMetadata(emailsDir, /* keepFileExtensions */ true)
  if (!metadata) {
    console.error(`No email templates found in ${emailsDir}. Does the directory exist?`)
    process.exit(1)
  }

  // Clean output directory
  if (fs.existsSync(outputDir))
    fs.rmSync(outputDir, { recursive: true })
  fs.mkdirSync(outputDir, { recursive: true })

  const bundler = await createTemplateBundler(emailsDir)

  try {
    const templates = collectTemplates(metadata)

    for (const templatePath of templates) {
      const mod = await bundler.loadComponent(templatePath)
      const component = (mod.default ?? mod) as Component

      const vnode = h(component)
      const rendered = await render(vnode, {
        pretty: options.pretty,
        ...(options.plainText ? { plainText: true } : {}),
      })

      const ext = options.plainText ? '.txt' : '.html'
      // Preserve subdirectory structure to avoid filename collisions
      const relPath = path.relative(emailsDir, templatePath)
      const relWithoutExt = relPath.substring(0, relPath.length - path.extname(relPath).length)
      const outPath = path.join(outputDir, `${relWithoutExt}${ext}`)
      fs.mkdirSync(path.dirname(outPath), { recursive: true })

      fs.writeFileSync(outPath, rendered, 'utf8')
    }
  }
  finally {
    await bundler.close()
  }
}
