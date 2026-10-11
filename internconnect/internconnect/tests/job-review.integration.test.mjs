import { companyTables } from '../server/config/companyTables.js'
import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import process from 'node:process'
import { db } from '../server/config/database.js'
import * as company from '../server/services/companyService.js'
import * as review from '../server/services/jobReviewService.js'

const enabled = process.env.RUN_DB_TESTS === '1'
after(async () => { await db.end() })

test('public job payload omits the unapproved revision and internal review information', () => {
  const job = { id: 1, title: 'Approved title', pending_revision: { title: 'Unapproved title' }, review_status: 'pending', review_note: 'Internal note', reviewed_by: 2, reviewed_at: '2026-10-11' }
  assert.deepEqual(review.publicJob(job), { id: 1, title: 'Approved title' })
  assert.equal(review.editableJob(job).title, 'Unapproved title')
})

test('MySQL job review publishes only approved content and preserves the published version during revisions', { skip: !enabled }, async () => {
  const [accounts] = await db.query(`SELECT ca.user_id FROM ${companyTables.company_accounts} ca JOIN ${companyTables.companies} c ON c.id=ca.company_id JOIN users u ON u.id=ca.user_id WHERE c.status='approved' AND u.status='active' LIMIT 2`)
  const [admins] = await db.query("SELECT id FROM users WHERE role='admin' AND status='active' LIMIT 1")
  assert.ok(accounts[0] && admins[0], 'Requires an approved company and school admin')
  const userId = accounts[0].user_id, actor = { sub: admins[0].id, role: 'admin' }
  const input = { title: 'Job review regression fixture', description: 'Original approved description', workMode: 'remote', quantity: 1, skills: ['JavaScript'], deadline: '2099-12-31' }
  let id
  const stored = async () => (await db.execute(`SELECT * FROM ${companyTables.jobs} WHERE id=?`, [id]))[0][0]
  try {
    const created = await company.createJob(userId, input)
    id = created.id
    assert.equal((await stored()).status, 'draft')
    await company.setJobStatus(userId, id, 'published') // Compatibility endpoint also submits for review.
    assert.equal((await stored()).status, 'draft')
    assert.equal((await stored()).review_status, 'pending')
    await assert.rejects(company.updateJob(userId, id, input), { code: 'JOB_NOT_EDITABLE' })
    await assert.rejects(company.setJobStatus(userId, id, 'published'), { code: 'INVALID_JOB_TRANSITION' })
    await assert.rejects(review.reviewJob(actor, id, { decision: 'rejected', note: '   ' }), { code: 'REVIEW_NOTE_REQUIRED' })
    await review.reviewJob(actor, id, { decision: 'changes_requested', note: 'Please clarify requirements' })
    assert.equal((await stored()).status, 'draft')
    assert.equal((await company.getJob(userId, id)).review_note, 'Please clarify requirements')
    await company.updateJob(userId, id, input)
    await company.setJobStatus(userId, id, 'published')
    await review.reviewJob(actor, id, { decision: 'approved', note: 'Ready to publish' })
    assert.equal((await stored()).status, 'published')
    await assert.rejects(review.reviewJob(actor, id, { decision: 'approved' }), { code: 'JOB_ALREADY_REVIEWED' })
    if (accounts[1]) await assert.rejects(company.updateJob(accounts[1].user_id, id, input), { code: 'JOB_NOT_FOUND' })
    const modified = { ...input, title: 'Revised title', description: 'Revised description awaiting review' }
    await company.updateJob(userId, id, modified)
    assert.equal((await stored()).title, input.title)
    assert.equal((await stored()).status, 'published')
    assert.equal((await stored()).review_status, 'pending')
    assert.equal((await company.getJob(userId, id)).title, modified.title)
    await review.reviewJob(actor, id, { decision: 'rejected', note: 'Revise the description' })
    assert.equal((await stored()).description, input.description)
    await company.updateJob(userId, id, modified)
    await review.reviewJob(actor, id, { decision: 'approved' })
    assert.equal((await stored()).title, modified.title)
    assert.equal((await stored()).pending_revision, null)
    await company.updateJob(userId, id, { ...modified, deadline: '2000-01-01' })
    await assert.rejects(review.reviewJob(actor, id, { decision: 'approved' }), { code: 'JOB_EXPIRED' })
    assert.equal((await stored()).deadline, input.deadline, 'Failed approval rolls back the content replacement')
    await company.setJobStatus(userId, id, 'closed')
    await assert.rejects(review.reviewJob(actor, id, { decision: 'approved' }), { code: 'JOB_ALREADY_REVIEWED' })
    await assert.rejects(company.updateJob(userId, id, input), { code: 'JOB_NOT_EDITABLE' })
  } finally {
    if (id) {
      await db.execute("DELETE FROM notifications WHERE entity_type='job' AND entity_id=?", [id])
      await db.execute("DELETE FROM audit_logs WHERE entity_type='job' AND entity_id=?", [id])
      await db.execute(`DELETE FROM ${companyTables.jobs} WHERE id=?`, [id])
    }
  }
})
