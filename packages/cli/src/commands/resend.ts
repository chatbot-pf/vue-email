import { createHash } from 'node:crypto'
import { hostname, userInfo } from 'node:os'
import * as nodeUtil from 'node:util'
import Conf from 'conf'
import prompts from 'prompts'

type StyleTextFunction = typeof nodeUtil.styleText
const styleText: StyleTextFunction = (nodeUtil as any).styleText
  ? (nodeUtil as any).styleText
  : (_: string, text: string) => text

// Derive an encryption key from machine-specific attributes so the stored
// API key is not decryptable with a static key embedded in source.
function deriveEncryptionKey(): string {
  try {
    const seed = `${hostname()}-${userInfo().username}-mail-please`
    return createHash('sha256').update(seed).digest('hex')
  }
  catch {
    // Fallback: use a constant that is at least not identical to the repo source
    return createHash('sha256').update('mail-please-fallback').digest('hex')
  }
}

const conf = new Conf<{ resendApiKey?: string }>({
  projectName: 'mail-please',
  encryptionKey: deriveEncryptionKey(),
})

export { conf }

export async function resendSetup(): Promise<void> {
  const previousValue = conf.get('resendApiKey')
  if (typeof previousValue === 'string' && previousValue.length > 0) {
    console.info(
      `You already have a Resend API Key configured, continuing will replace it.`,
    )
  }

  const { apiKey } = await prompts({
    type: 'password',
    name: 'apiKey',
    message: 'Enter your Resend API Key (make sure it has "Full Access")',
  })

  if (apiKey?.trim().length > 0) {
    conf.set('resendApiKey', apiKey)
    console.info(`\u2714 Resend integration successfully set up`)
    console.info(
      `You can always remove it with ${styleText('green', 'npx mail-please@latest resend reset')}`,
    )
  }
}

export function resendReset(): void {
  conf.delete('resendApiKey')
  console.info(`\u2714 Resend API Key successfully deleted`)
}
