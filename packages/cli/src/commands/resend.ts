import { randomBytes } from 'node:crypto'
import * as nodeUtil from 'node:util'
import Conf from 'conf'
import prompts from 'prompts'

type StyleTextFunction = typeof nodeUtil.styleText
const styleText: StyleTextFunction = (nodeUtil as any).styleText
  ? (nodeUtil as any).styleText
  : (_: string, text: string) => text

// Use a separate unencrypted store just to hold the encryption key so it is
// stable across hostname/username changes but is still not embedded in source.
const keyStore = new Conf<{ encryptionKey?: string }>({
  projectName: 'mail-please-keystore',
})

function getOrCreateEncryptionKey(): string {
  const existing = keyStore.get('encryptionKey')
  if (typeof existing === 'string' && existing.length > 0)
    return existing
  const key = randomBytes(32).toString('hex')
  keyStore.set('encryptionKey', key)
  return key
}

const conf = new Conf<{ resendApiKey?: string }>({
  projectName: 'mail-please',
  encryptionKey: getOrCreateEncryptionKey(),
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
