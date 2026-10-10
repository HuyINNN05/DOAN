import { readFile } from 'node:fs/promises'
import { db } from '../server/config/database.js'

try {
  const [columns] = await db.execute("SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='report_reviews' AND column_name='score'")
  if (!columns.length) {
    const sql = await readFile(new URL('../database/migrations/001_report_review_score.sql', import.meta.url), 'utf8')
    await db.query(sql)
    console.log('Applied migration 001_report_review_score')
  } else console.log('Migration 001 already applied')
} finally { await db.end() }
