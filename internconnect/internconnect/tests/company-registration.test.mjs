import test from 'node:test'
import assert from 'node:assert/strict'
import { companyRegistrationSchema } from '../server/validation/companyRegistration.js'

const input = {fullName:'Tuấn Mai Anh',email:'registration@example.com',password:'Example@123',companyName:'Công ty TNHH 1 thành viên',taxCode:'225534',companyEmail:'company@example.com'}
test('registration explains the six-character tax code rejection',()=>{
  const result=companyRegistrationSchema.safeParse(input)
  assert.equal(result.success,false)
  assert.deepEqual(result.error.flatten().fieldErrors.taxCode,['Mã số thuế phải có ít nhất 8 ký tự'])
})
test('registration accepts supported input and trims non-password fields',()=>{
  const result=companyRegistrationSchema.parse({...input,taxCode:' 0123456789 ',email:' registration@example.com ',companyName:' Công ty thử nghiệm '})
  assert.equal(result.taxCode,'0123456789')
  assert.equal(result.email,'registration@example.com')
  assert.equal(result.companyName,'Công ty thử nghiệm')
  assert.equal(result.password,input.password)
})
test('registration rejects names containing only whitespace',()=>{
  const result=companyRegistrationSchema.safeParse({...input,taxCode:'0123456789',companyName:'  ',fullName:'  '})
  assert.equal(result.success,false)
  assert.ok(result.error.flatten().fieldErrors.companyName)
  assert.ok(result.error.flatten().fieldErrors.fullName)
})
