import { conf } from '../../../src/commands/resend'

export default defineEventHandler(() => {
  const apiKey = conf.get('resendApiKey')
  return {
    configured: typeof apiKey === 'string' && apiKey.length > 0,
  }
})
