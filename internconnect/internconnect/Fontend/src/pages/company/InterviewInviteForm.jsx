import { useState } from 'react'
import { scheduleInterview } from '../../api/companyApi'

export default function InterviewInviteForm({application,onSuccess,onClose}) {
  const [type,setType]=useState('online'),[error,setError]=useState(''),[busy,setBusy]=useState(false)
  async function submit(event) {
    event.preventDefault()
    if(busy)return
    const values=Object.fromEntries(new FormData(event.currentTarget)),date=new Date(values.scheduledAt)
    if(!Number.isFinite(date.getTime())||date<=new Date()){setError('Chọn thời gian phỏng vấn trong tương lai.');return}
    setError('');setBusy(true)
    try {
      await scheduleInterview(application.id,{scheduledAt:date.toISOString(),durationMinutes:Number(values.durationMinutes),type,location:values.location?.trim()||'',meetingUrl:values.meetingUrl?.trim()||'',note:values.note?.trim()||''})
      onSuccess()
    } catch(exception) {
      const detail=exception.response?.data?.error
      const messages=Object.values(detail?.details?.fieldErrors||{}).flat()
      setError(messages.length?messages.join(' '):detail?.message||'Không gửi được lịch phỏng vấn. Vui lòng thử lại.')
    } finally {setBusy(false)}
  }
  return <form className="modal-form" onSubmit={submit}><h2 className="font-bold">Mời phỏng vấn: {application.student_name}</h2>
    <p className="mt-2 text-sm text-slate-600">Lời mời chỉ xuất hiện ở tài khoản sinh viên sau khi gửi lịch thành công.</p>
    {error&&<p role="alert" className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <label className="mt-3 block text-sm">Thời gian<input className="mt-2 w-full rounded-md border p-3" name="scheduledAt" type="datetime-local" required disabled={busy}/></label>
    <label className="mt-3 block text-sm">Thời lượng (phút)<input className="mt-2 w-full rounded-md border p-3" name="durationMinutes" type="number" defaultValue="60" min="15" max="480" step="1" required disabled={busy}/></label>
    <label className="mt-3 block text-sm">Hình thức<select className="mt-2 w-full rounded-md border p-3" value={type} onChange={event=>setType(event.target.value)} disabled={busy}><option value="online">Trực tuyến</option><option value="offline">Tại doanh nghiệp</option></select></label>
    {type==='online'?<label className="mt-3 block text-sm">Link họp (bắt buộc)<input className="mt-2 w-full rounded-md border p-3" name="meetingUrl" type="url" placeholder="https://meet.google.com/…" required disabled={busy}/></label>:<label className="mt-3 block text-sm">Địa điểm (bắt buộc)<input className="mt-2 w-full rounded-md border p-3" name="location" required disabled={busy}/></label>}
    <label className="mt-3 block text-sm">Ghi chú<textarea className="mt-2 w-full rounded-md border p-3" name="note" maxLength="2000" disabled={busy}/></label>
    <div className="mt-4 flex gap-2"><button className="button button-primary" disabled={busy}>{busy?'Đang gửi…':'Gửi lời mời'}</button><button className="button button-secondary" type="button" disabled={busy} onClick={onClose}>Hủy</button></div>
  </form>
}
