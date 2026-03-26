import { Resend } from 'resend'
import { conf } from '../../../src/commands/resend'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    to: string
    subject: string
    html: string
  }>(event)

  if (!body?.to || !body?.subject || !body?.html) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: to, subject, html',
    })
  }

  const apiKey = conf.get('resendApiKey')
  if (!apiKey) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Resend API key not configured. Run: mail-please resend setup',
    })
  }

  const resend = new Resend(apiKey)

  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: body.to,
    subject: body.subject,
    html: body.html,
  })

  if (error) {
    throw createError({
      statusCode: 422,
      statusMessage: error.message,
    })
  }

  return { id: data?.id }
})
