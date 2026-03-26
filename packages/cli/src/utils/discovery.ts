import fs from 'node:fs'
import path from 'node:path'

export interface EmailsDirectory {
  absolutePath: string
  relativePath: string
  directoryName: string
  emailFilenames: string[]
  subDirectories: EmailsDirectory[]
}

const SUPPORTED_EXTENSIONS = ['.vue', '.tsx', '.jsx', '.js']

const RE_ES6_DEFAULT_EXPORT = /\bexport\s+default\b/
const RE_COMMONJS_EXPORT = /\bmodule\.exports\s*=/
const RE_NAMED_DEFAULT_EXPORT = /\bexport\s+\{[^}]*\bdefault\b[^}]*\}/

async function isFileAnEmail(fullPath: string): Promise<boolean> {
  let fileHandle: fs.promises.FileHandle
  try {
    fileHandle = await fs.promises.open(fullPath, 'r')
  }
  catch {
    return false
  }

  try {
    const stat = await fileHandle.stat()
    if (stat.isDirectory())
      return false

    const { ext } = path.parse(fullPath)
    if (!SUPPORTED_EXTENSIONS.includes(ext))
      return false

    const fileContents = await fileHandle.readFile('utf8')
    return (
      RE_ES6_DEFAULT_EXPORT.test(fileContents)
      || RE_COMMONJS_EXPORT.test(fileContents)
      || RE_NAMED_DEFAULT_EXPORT.test(fileContents)
    )
  }
  finally {
    await fileHandle.close()
  }
}

function mergeDirectoriesWithSubDirectories(emailsDirectory: EmailsDirectory): EmailsDirectory {
  let current = emailsDirectory
  while (current.emailFilenames.length === 0 && current.subDirectories.length === 1) {
    const only = current.subDirectories[0]!
    current = {
      ...only,
      directoryName: path.join(current.directoryName, only.directoryName),
    }
  }
  return current
}

export async function getEmailsDirectoryMetadata(absolutePathToEmailsDirectory: string, keepFileExtensions = false, isSubDirectory = false, baseDirectoryPath = absolutePathToEmailsDirectory): Promise<EmailsDirectory | undefined> {
  if (!fs.existsSync(absolutePathToEmailsDirectory))
    return undefined

  const dirents = await fs.promises.readdir(absolutePathToEmailsDirectory, {
    withFileTypes: true,
  })

  // Use bounded concurrency to avoid EMFILE on large directories while
  // still being faster than fully sequential evaluation.
  const CONCURRENCY = 16
  const isEmailPredicates: boolean[] = Array.from({ length: dirents.length })
  for (let i = 0; i < dirents.length; i += CONCURRENCY) {
    const chunk = dirents.slice(i, i + CONCURRENCY)
    const results = await Promise.all(
      chunk.map(dirent =>
        isFileAnEmail(path.join(absolutePathToEmailsDirectory, dirent.name)),
      ),
    )
    for (let j = 0; j < results.length; j++) {
      isEmailPredicates[i + j] = results[j]!
    }
  }

  const emailFilenames = dirents
    .filter((_, i) => isEmailPredicates[i])
    .map(dirent =>
      keepFileExtensions
        ? dirent.name
        : dirent.name.replace(path.extname(dirent.name), ''),
    )

  const subDirectories = await Promise.all(
    dirents
      .filter(
        dirent =>
          dirent.isDirectory()
          && !dirent.name.startsWith('_')
          && dirent.name !== 'static',
      )
      .map((dirent) => {
        const direntAbsolutePath = path.join(
          absolutePathToEmailsDirectory,
          dirent.name,
        )
        return getEmailsDirectoryMetadata(
          direntAbsolutePath,
          keepFileExtensions,
          true,
          baseDirectoryPath,
        ) as Promise<EmailsDirectory>
      }),
  )

  const metadata: EmailsDirectory = {
    absolutePath: absolutePathToEmailsDirectory,
    relativePath: path.relative(baseDirectoryPath, absolutePathToEmailsDirectory),
    directoryName: absolutePathToEmailsDirectory.split(path.sep).pop()!,
    emailFilenames,
    subDirectories,
  }

  return isSubDirectory
    ? mergeDirectoriesWithSubDirectories(metadata)
    : metadata
}
