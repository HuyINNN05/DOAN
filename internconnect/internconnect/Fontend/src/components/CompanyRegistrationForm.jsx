import { useState } from 'react'
import { Link } from 'react-router'
import { registerCompanyRequest } from '../api/authApi'

const fields = [
  ['companyName','Tên doanh nghiệp',2,200,true],
  ['taxCode','Mã số thuế',8,50,true],
  ['companyEmail','Email doanh nghiệp',undefined,255,true],
  ['companyPhone','Điện thoại doanh nghiệp',undefined,30,false],
  ['fullName','Người đại diện',2,150,true],
  ['email','Email đăng nhập',undefined,255,true],
  ['phone','Điện thoại người đại diện',undefined,30,false],
  ['industry','Lĩnh vực',undefined,150,false],
  ['address','Địa chỉ',undefined,255,false],
  ['password','Mật khẩu',8,128,true],
]

export default function CompanyRegistrationForm() {
  const [message,setMessage] = useState('')
  const [errors,setErrors] = useState({})
  const [code,setCode] = useState('')
  const [busy,setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault()
    if (busy) return
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    for (const key of Object.keys(values)) if (key!=='password') values[key]=values[key].trim()
    const invalid = {}
    for (const [name,label,min,max,required] of fields) {
      if (required && !values[name]) invalid[name]=`${label} không được để trống`
      else if (values[name] && min && values[name].length<min) invalid[name]=`${label} phải có ít nhất ${min} ký tự`
      else if (values[name].length>max) invalid[name]=`${label} không được vượt quá ${max} ký tự`
    }
    if (new TextEncoder().encode(values.password).length>72) invalid.password='Mật khẩu không được vượt quá 72 byte UTF-8'
    setErrors(invalid)
    setMessage('')
    if (Object.keys(invalid).length) {
      form.elements[Object.keys(invalid)[0]]?.focus()
      return
    }
    setBusy(true)
    try {
      const result = await registerCompanyRequest(values)
      setMessage(`Đã gửi hồ sơ. Mã tra cứu: ${result.companyId}. Tài khoản cần được nhà trường phê duyệt trước khi đăng nhập.`)
      setCode(String(result.companyId))
      form.reset()
    } catch (error) {
      const detail = error.response?.data?.error
      const fieldErrors = detail?.details?.fieldErrors || {}
      setErrors(Object.fromEntries(Object.entries(fieldErrors).filter(([,messages])=>messages.length).map(([name,messages])=>[name,messages.join(' ')])))
      setMessage(Object.keys(fieldErrors).length?'Vui lòng kiểm tra các trường được đánh dấu.':detail?.message||'Không thể gửi đăng ký. Vui lòng thử lại.')
    } finally { setBusy(false) }
  }
  return <form className="grid gap-4 rounded-xl border bg-white p-6 sm:grid-cols-2" onSubmit={submit}>
    {fields.map(([name,label,min,max,required])=><label className="text-sm font-semibold" key={name} htmlFor={`register-${name}`}>
      {label}{required?' *':''}
      <input id={`register-${name}`} className="mt-2 w-full rounded-md border border-line px-3 py-3 text-sm" name={name} required={required} minLength={min} maxLength={max} disabled={busy}
        type={name.toLowerCase().includes('email')?'email':name==='password'?'password':name.toLowerCase().includes('phone')?'tel':'text'}
        autoComplete={name==='password'?'new-password':name.toLowerCase().includes('email')?'email':undefined}
        aria-invalid={Boolean(errors[name])} aria-describedby={errors[name]?`register-${name}-error`:['taxCode','password'].includes(name)?`register-${name}-hint`:undefined}/>
      {name==='taxCode'&&<span id="register-taxCode-hint" className="mt-1 block text-xs font-normal text-slate-600">Từ 8 đến 50 ký tự theo điều kiện đăng ký của hệ thống.</span>}
      {name==='password'&&<span id="register-password-hint" className="mt-1 block text-xs font-normal text-slate-600">Ít nhất 8 ký tự, tối đa 72 byte UTF-8.</span>}
      {errors[name]&&<span id={`register-${name}-error`} role="alert" className="mt-1 block text-xs font-normal text-red-700">{errors[name]}</span>}
    </label>)}
    <button disabled={busy} className="rounded-md bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-60 sm:col-span-2">{busy?'Đang gửi…':'Gửi đăng ký'}</button>
    {message&&<p role="status" className="text-sm sm:col-span-2">{message}</p>}
    {code&&<Link className="text-sm text-primary sm:col-span-2" to="/company/lookup">Tra cứu hồ sơ</Link>}
  </form>
}
