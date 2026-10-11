import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:net'
import { createAccountMailer } from '../server/services/accountMailService.js'

test('SMTP transport sends the setup link and reports recipient rejection accurately', async () => {
  const messages = [], sockets = new Set()
  let rejectRecipient = false
  const server = createServer(socket => {
    sockets.add(socket); socket.on('close', () => sockets.delete(socket))
    socket.setEncoding('utf8'); socket.write('220 localhost test SMTP\r\n')
    let buffer = '', data = false
    socket.on('data', chunk => {
      buffer += chunk
      while (true) {
        if (data) {
          const index = buffer.indexOf('\r\n.\r\n')
          if (index < 0) return
          messages.push(buffer.slice(0, index)); buffer = buffer.slice(index + 5); data = false
          socket.write('250 Message accepted\r\n'); continue
        }
        const index = buffer.indexOf('\r\n')
        if (index < 0) return
        const command = buffer.slice(0, index); buffer = buffer.slice(index + 2)
        if (/^(EHLO|HELO)/i.test(command)) socket.write('250-localhost\r\n250 8BITMIME\r\n')
        else if (/^RCPT/i.test(command) && rejectRecipient) socket.write('550 Recipient rejected\r\n')
        else if (/^DATA/i.test(command)) { data = true; socket.write('354 Send data\r\n') }
        else if (/^QUIT/i.test(command)) { socket.end('221 Goodbye\r\n'); return }
        else socket.write('250 OK\r\n')
      }
    })
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  try {
    const mailer = createAccountMailer({ SMTP_HOST: '127.0.0.1', SMTP_PORT: server.address().port, SMTP_SECURE: false, SMTP_REQUIRE_TLS: false, SMTP_FROM: 'admin@school.test', APP_PUBLIC_URL: 'https://school.test', ACCOUNT_ACTIVATION_HOURS: 24 })
    const input = { email: 'student@school.test', fullName: 'Test Student', token: 'e'.repeat(64) }
    assert.equal((await mailer(input)).status, 'sent')
    assert.equal(messages.length, 1)
    assert.match(messages[0], /To: student@school.test/)
    assert.match(messages[0], /activate-account#token/)
    rejectRecipient = true
    const rejected = await mailer(input)
    assert.equal(rejected.status, 'failed'); assert.equal(messages.length, 1)
    assert.ok(!JSON.stringify(rejected).includes(input.token))
  } finally {
    for (const socket of sockets) socket.destroy()
    await new Promise(resolve => server.close(resolve))
  }
})
