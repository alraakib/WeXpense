import { getEnv } from '../env'
import logger from './utils/logger'

type MailMessage = {
  to: string
  subject: string
  html: string
}

export interface Mailer {
  send(message: MailMessage): Promise<void>
}

class ConsoleMailer implements Mailer {
  async send(message: MailMessage): Promise<void> {
    logger.info({ to: message.to, subject: message.subject }, 'email (console)')
  }
}

class ResendMailer implements Mailer {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async send(message: MailMessage): Promise<void> {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `WeXpense <noreply@${getEnv().BETTER_AUTH_URL.replace(/^https?:\/\//, '').split(':')[0]}>`,
        to: message.to,
        subject: message.subject,
        html: message.html
      })
    })
    if (!res.ok) {
      logger.error({ status: res.status }, 'resend failed')
      throw new Error('Email send failed')
    }
  }
}

let mailer: Mailer | null = null

export function getMailer(): Mailer {
  if (!mailer) {
    mailer = process.env.RESEND_API_KEY ? new ResendMailer(process.env.RESEND_API_KEY) : new ConsoleMailer()
  }
  return mailer
}
