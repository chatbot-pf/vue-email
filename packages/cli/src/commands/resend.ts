import * as nodeUtil from 'node:util'
import Conf from 'conf'
import prompts from 'prompts'

type StyleTextFunction = typeof nodeUtil.styleText
const styleText: StyleTextFunction = (nodeUtil as any).styleText
  ? (nodeUtil as any).styleText
  : (_: string, text: string) => text

const conf = new Conf<{ resendApiKey?: string }>({
  projectName: 'mail-please',
  encryptionKey: 'h2#x658}1#qY(@!:7,BD1J)q12$[tM25',
})

export { conf }

export async function resendSetup(): Promise<void> {
  const previousValue = conf.get('resendApiKey')
  if (typeof previousValue === 'string' && previousValue.length > 0) {
    console.info(
      `You already have a Resend API Key configured (${styleText('grey', previousValue.slice(0, 11))}...), continuing will replace it.`,
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
