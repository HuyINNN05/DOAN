import { readFile } from 'node:fs/promises'
import { db } from '../server/config/database.js'
try {
  await db.query(await readFile(new URL('./migrations/001_account_invitations.sql', import.meta.url), 'utf8'))
  console.log('Account invitation schema is ready.')
} finally { await db.end() }
