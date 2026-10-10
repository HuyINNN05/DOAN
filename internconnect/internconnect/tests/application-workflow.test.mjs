import test from 'node:test'
import assert from 'node:assert/strict'
import { assertTransition, resolveTransitionTarget, TRANSITIONS } from '../server/domain/applicationWorkflow.js'

test('workflow 01 đến 15 cho phép đúng vai trò', () => {
  let current = '01'
  for (const from of ['01','02','03','04','05','06','07','08','09','10','11','12','13','14']) {
    const rule = TRANSITIONS[from]
    assert.equal(current, from)
    assert.doesNotThrow(() => assertTransition(from, rule.to, rule.role))
    current = rule.to
  }
  assert.equal(current, '15')
})
test('từ chối nhảy trạng thái', () => assert.throws(() => assertTransition('02', '10', 'admin'), { code: 'INVALID_STATUS_TRANSITION' }))
test('từ chối sai vai trò', () => {
  assert.throws(() => assertTransition('05', '06', 'student'), { code: 'TRANSITION_FORBIDDEN' })
  assert.throws(() => assertTransition('11', '12', 'company'), { code: 'TRANSITION_FORBIDDEN' })
  assert.throws(() => assertTransition('14', '15', 'lecturer'), { code: 'TRANSITION_FORBIDDEN' })
})
test('admin confirm tiến tuần tự 02→03→04', () => {
  assert.equal(resolveTransitionTarget('02', 'admin-confirm', 'admin'), '03')
  assert.equal(resolveTransitionTarget('03', 'admin-confirm', 'admin'), '04')
  assert.throws(() => resolveTransitionTarget('04', 'admin-confirm', 'admin'), { code: 'APPLICATION_NOT_CONFIRMABLE' })
})
