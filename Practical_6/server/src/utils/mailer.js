import nodemailer from 'nodemailer'

export function createTransport() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !port || !user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    auth: { user, pass },
  })
}

export async function sendOtpEmail({ to, otp, minutes }) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER
  const transport = createTransport()

  if (!transport) {
    console.log(`OTP for ${to}: ${otp} (valid ${minutes} minutes)`) 
    return
  }

  await transport.sendMail({
    from,
    to,
    subject: 'Your OTP for payment confirmation',
    text: `Your OTP is ${otp}. It is valid for ${minutes} minutes.`,
  })
}
