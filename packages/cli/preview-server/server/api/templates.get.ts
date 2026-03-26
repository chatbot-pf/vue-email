import process from 'node:process'
import { getEmailsDirectoryMetadata } from '../../src/utils/discovery'

export default defineEventHandler(async () => {
  const emailsDir = process.env.MAIL_PLEASE_EMAILS_DIR

  if (!emailsDir) {
    throw createError({
      statusCode: 500,
      message: 'MAIL_PLEASE_EMAILS_DIR environment variable is not set',
    })
  }

  const metadata = await getEmailsDirectoryMetadata(emailsDir)

  if (!metadata) {
    throw createError({
      statusCode: 404,
      message: `Emails directory not found: ${emailsDir}`,
    })
  }

  return metadata
})
