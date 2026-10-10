import test from 'node:test'
import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { calculateEvaluation } from '../server/domain/evaluation.js'
import { pagination } from '../server/utils/pagination.js'
import { createAuthenticate } from '../server/middleware/authMiddleware.js'
import { createAccessToken } from '../server/services/tokenService.js'
import { validateDocumentContent } from '../server/services/fileStorageService.js'
import { validatePeriodDates, validateDiaryDate } from '../server/domain/internshipDates.js'
import { assertPeriodTransition } from '../server/domain/periodWorkflow.js'

const criteria = [{ id: 1, max_score: 20, weight: 2 }, { id: 2, max_score: 10, weight: 1 }]
test('evaluation requires all criteria exactly once', () => {
  for (const details of [[{ criteriaId: 1, score: 20 }], [{ criteriaId: 1, score: 20 }, { criteriaId: 1, score: 20 }], [{ criteriaId: 1, score: 20 }, { criteriaId: 3, score: 10 }]]) {
    assert.throws(() => calculateEvaluation(criteria, details), { code: 'INVALID_EVALUATION_CRITERIA' })
  }
  assert.equal(calculateEvaluation(criteria, [{ criteriaId: 1, score: 10 }, { criteriaId: 2, score: 10 }]), 6.67)
})
test('invalid evaluation scores and configuration are rejected', () => {
  for (const score of [-1, 21, NaN, Infinity]) assert.throws(() => calculateEvaluation(criteria, [{ criteriaId: 1, score }, { criteriaId: 2, score: 10 }]), { code: 'INVALID_EVALUATION_SCORE' })
  assert.throws(() => calculateEvaluation([{ id: 1, max_score: 0, weight: 1 }], [{ criteriaId: 1, score: 0 }]), { code: 'INVALID_EVALUATION_CONFIGURATION' })
})
test('pagination stays finite and integral for hostile input', () => {
  assert.deepEqual(pagination({ page: 'Infinity', limit: 'Infinity' }), { page: 1, limit: 20, offset: 0 })
  assert.deepEqual(pagination({ page: '2.9', limit: '3.5' }), { page: 2, limit: 3, offset: 3 })
  assert.equal(pagination({ page: '1e300' }).page, 1000000)
})
test('issued access token stops working after lock, role change or password reset', async () => {
  const original = { id: 1, role: 'student', status: 'active', password_hash: 'original-password-hash' }
  const token = createAccessToken(original)
  const invoke = user => new Promise(resolve => createAuthenticate(async () => user)({ headers: { authorization: `Bearer ${token}` } }, {}, resolve))
  assert.equal(await invoke(original), undefined)
  assert.equal((await invoke({ ...original, status: 'locked' })).code, 'USER_NOT_ACTIVE')
  assert.equal((await invoke({ ...original, role: 'admin' })).code, 'TOKEN_INVALID')
  assert.equal((await invoke({ ...original, password_hash: 'replacement-password-hash' })).code, 'TOKEN_INVALID')
})
test('document content verification rejects renamed scripts and generic ZIPs', () => {
  const fake = Buffer.from('this is an executable pretending to be a document')
  for (const extension of ['.pdf', '.doc', '.docx']) assert.throws(() => validateDocumentContent(fake, extension), { code: 'INVALID_FILE_CONTENT' })
  assert.doesNotThrow(() => validateDocumentContent(Buffer.from('%PDF-1.7\ntrailer\n%%EOF\n'), '.pdf'))
  assert.throws(() => validateDocumentContent(Buffer.from('%PDF-1.7\ntruncated'), '.pdf'), { code: 'INVALID_FILE_CONTENT' })
})
test('period and diary dates obey the internship calendar', () => {
  assert.throws(() => validatePeriodDates({startDate:'2026-12-01',endDate:'2026-01-01'}),{code:'INVALID_PERIOD_DATES'})
  assert.throws(() => validatePeriodDates({startDate:'2026-01-01',endDate:'2026-12-01',registrationStart:'2026-01-10T00:00:00Z',registrationEnd:'2026-01-01T00:00:00Z'}),{code:'INVALID_PERIOD_DATES'})
  const record = {start_date:new Date(2026,0,1),end_date:new Date(2026,0,31)}
  assert.doesNotThrow(() => validateDiaryDate(record,'2026-01-01'))
  assert.doesNotThrow(() => validateDiaryDate(record,'2026-01-31'))
  assert.throws(() => validateDiaryDate(record,'2026-02-01'),{code:'DIARY_DATE_OUTSIDE_INTERNSHIP'})
})
test('completed periods cannot reopen and drafts cannot close without opening',()=>{
  assert.throws(()=>assertPeriodTransition('completed','open'),{code:'INVALID_PERIOD_TRANSITION'})
  assert.throws(()=>assertPeriodTransition('draft','closed'),{code:'INVALID_PERIOD_TRANSITION'})
  assert.doesNotThrow(()=>assertPeriodTransition('closed','open'))
})
