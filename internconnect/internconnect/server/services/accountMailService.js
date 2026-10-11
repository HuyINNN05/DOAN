import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

export function createAccountMailer(settings = env, transport) {
  let sender = transport
  return async ({ email, fullName, token, purpose = 'activation' }) => {
    if (!settings.SMTP_HOST || !settings.SMTP_FROM || !settings.APP_PUBLIC_URL) return { status: 'not_configured', code: 'SMTP_NOT_CONFIGURED', message: 'Chưa cấu hình SMTP_HOST, SMTP_FROM và APP_PUBLIC_URL. Cấu hình email rồi gửi lại.' }
    try {
      sender ||= nodemailer.createTransport({ host: settings.SMTP_HOST, port: settings.SMTP_PORT, secure: settings.SMTP_SECURE, requireTLS: settings.SMTP_REQUIRE_TLS,
        ...(settings.SMTP_USER ? { auth: { user: settings.SMTP_USER, pass: settings.SMTP_PASSWORD } } : {}),
        connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 5000, dnsTimeout: 5000, logger: false, debug: false, disableFileAccess: true, disableUrlAccess: true })
      const link = new URL(purpose === 'reset' ? '/reset-password' : '/activate-account', settings.APP_PUBLIC_URL)
      link.hash = new URLSearchParams({ token }).toString()
      const result = await sender.sendMail({ from: settings.SMTP_FROM, to: email, subject: purpose === 'reset' ? 'Đặt lại mật khẩu InternConnect' : 'Thiết lập mật khẩu tài khoản InternConnect',
        text: `Xin chào ${fullName},\n\n${purpose === 'reset' ? 'Bạn đã yêu cầu đặt lại mật khẩu.' : 'Nhà trường đã cấp tài khoản InternConnect cho bạn.'} Thiết lập mật khẩu qua liên kết dùng một lần sau:\n${link.href}\n\nLiên kết có hiệu lực ${purpose === 'reset' ? '30 phút' : `${settings.ACCOUNT_ACTIVATION_HOURS} giờ`}. Nếu đã hết hạn, yêu cầu gửi lại liên kết.\n` })
      if (!result.accepted?.some(recipient => String(recipient).toLowerCase() === email.toLowerCase())) throw new Error('RECIPIENT_NOT_ACCEPTED')
      return { status: 'sent', code: null, message: 'Máy chủ email đã chấp nhận thư kích hoạt.' }
    } catch { return { status: 'failed', code: 'SMTP_SEND_FAILED', message: 'Gửi email thất bại. Kiểm tra cấu hình SMTP rồi gửi lại.' } }
  }
}
export const sendAccountEmail = createAccountMailer()
