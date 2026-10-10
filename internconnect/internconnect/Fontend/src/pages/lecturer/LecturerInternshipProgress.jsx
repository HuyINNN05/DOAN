import { useCallback,useState } from 'react'
import { Link } from 'react-router'
import useApiResource from '../../hooks/useApiResource'
import { ResourceState } from '../../components/ui/PageUI'
import StatusBadge from '../../components/ui/StatusBadge'
import { getInternships,startEvaluation } from '../../api/lecturerApi'
import { formatDate } from '../../utils/display'

export default function LecturerInternshipProgress() {
  const loader=useCallback(()=>getInternships(),[]),resource=useApiResource(loader,[])
  const [message,setMessage]=useState(''),[busy,setBusy]=useState(null)
  async function start(id) {
    if(busy!==null)return
    setBusy(id)
    try { await startEvaluation(id);setMessage('Đã mở đánh giá cuối kỳ cho sinh viên và doanh nghiệp.');resource.reload() }
    catch(error){setMessage(error.response?.data?.error?.message||'Không thể mở đánh giá.')}
    finally{setBusy(null)}
  }
  return <section><div className="dashboard-page-heading"><div><p className="dashboard-eyebrow">KHU VỰC GIẢNG VIÊN</p><h1>Tiến độ thực tập</h1><p>Mở đánh giá cuối kỳ khi sinh viên đã sẵn sàng.</p></div></div>
    {message&&<p role="status" className="notice mb-4">{message}</p>}
    <ResourceState resource={resource}><div className="space-y-3">{resource.data.map(record=><article className="rounded-xl border border-line bg-white p-5" key={record.id}>
      <b>{record.student_name} · {record.job_title}</b><p className="text-sm">{record.company_name} · <StatusBadge status={record.status}/></p>
      <p className="mt-2 text-xs">{formatDate(record.start_date)} – {formatDate(record.end_date)}</p>
      {record.status==='active'&&<button disabled={busy!==null} className="button button-primary mt-3" onClick={()=>start(record.id)}>{busy===record.id?'Đang mở…':'Mở đánh giá cuối kỳ'}</button>}
      {record.status==='evaluating'&&<Link className="text-link mt-3 block" to="/lecturer/evaluations">Chấm điểm thực tập</Link>}
    </article>)}</div></ResourceState>
  </section>
}
