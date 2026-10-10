import { db } from '../config/database.js'
const fields = 'id, email, password_hash, full_name, phone, role, status, last_login_at, created_at, updated_at'
export async function findUserByEmail(email, executor = db) { const [rows] = await executor.execute(`SELECT ${fields} FROM users WHERE email = ? LIMIT 1`, [email]); return rows[0] || null }
export async function findUserById(id, executor = db) { const [rows] = await executor.execute(`SELECT ${fields} FROM users WHERE id = ? LIMIT 1`, [id]); return rows[0] || null }
export function publicUser(user) {
  const safe = { ...user }
  delete safe.password_hash
  return safe
}
