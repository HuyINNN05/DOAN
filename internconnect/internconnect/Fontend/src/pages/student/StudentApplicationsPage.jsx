import { useCallback, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, CheckCircle2, Clock3, Search } from 'lucide-react'
import useApiResource from '../../hooks/useApiResource'
import { ResourceState, EmptyState } from '../../components/ui/PageUI'
import Modal from '../../components/ui/Modal'
import StatusBadge from '../../components/ui/StatusBadge'
import { getApplications, respondOffer } from '../../api/studentApi'
import { foldText } from '../../utils/display'
import { STATUS_LABELS } from '../../constants/internshipStatuses'
const milestones = [['02','Gửi hồ sơ'],['04','Nhà trường duyệt'],['06','Phỏng vấn'],['11','Nhận thực tập'],['13','Thực tập'],['15','Hoàn thành']]
function nextStep(status) {
  if (Number(status) <= 3) return 'Nhà trường đang kiểm tra hồ sơ. Bạn có thể theo dõi cập nhật tại đây.'
  if (Number(status) <= 5) return 'Doanh nghiệp đang xem xét hồ sơ ứng tuyển của bạn.'
  if (Number(status) <= 8) return 'Kiểm tra mục Lịch phỏng vấn để xem lời mời và phản hồi với doanh nghiệp.'
  if (status === '09') return 'Doanh nghiệp đang chuẩn bị đề nghị thực tập.'
  if (status === '10') return 'Bạn cần phản hồi đề nghị thực tập bên dưới.'
  if (Number(status) <= 12) return 'Nhà trường sẽ xác nhận nơi thực tập và phân công người hướng dẫn.'
  if (status === '13') return 'Cập nhật nhật ký công việc và nộp báo cáo theo yêu cầu của giảng viên.'
  if (status === '14') return 'Giảng viên và doanh nghiệp đang đánh giá kết quả thực tập.'
  return 'Kỳ thực tập đã hoàn thành.'
}
export default function StudentApplicationsPage() {
  const loader = useCallback(() => getApplications(), []), resource = useApiResource(loader, [], {refreshOnFocus:true})
  const [query,setQuery] = useState(''), [choice,setChoice] = useState(null), [notice,setNotice] = useState(''), [busy,setBusy] = useState(false)
  const close = useCallback(() => setChoice(null), [])
  const filtered = resource.data.filter(x => foldText(`${x.title} ${x.company_name}`).includes(foldText(query)))
  async function respond(e) { e.preventDefault(); if (busy) return; setBusy(true); try { await respondOffer(choice.id,{accepted:choice.accepted,note:new FormData(e.currentTarget).get('note')}); setNotice('Đã gửi phản hồi cho doanh nghiệp.'); close(); resource.reload() } catch (err) { setNotice(err.response?.data?.error?.message || 'Không thể gửi phản hồi.') } finally { setBusy(false) } }
  return <section><div className="dashboard-page-heading"><div><p className="eyebrow">HÀNH TRÌNH ỨNG TUYỂN</p><h1>Hồ sơ của bạn</h1><p>Biết hồ sơ đang ở đâu và cần làm gì tiếp theo.</p></div><Link className="button button-primary" to="/student/opportunities">Tìm cơ hội <ArrowRight size={16} /></Link></div>{notice && <p role="status" className="notice mb-5">{notice}</p>}<div className="search-field mb-6"><Search size={18} /><input aria-label="Tìm hồ sơ ứng tuyển" placeholder="Tìm theo vị trí hoặc doanh nghiệp…" value={query} onChange={e => setQuery(e.target.value)} /></div><ResourceState resource={resource} emptyTitle="Bạn chưa gửi hồ sơ ứng tuyển" emptyDescription="Hoàn thiện CV và tìm một vị trí phù hợp để bắt đầu.">{filtered.length ? <div className="application-list">{filtered.map(app => <article className="application-card" key={app.id}><div className="application-card-heading"><div><p className="text-xs muted mb-2">HỒ SƠ #{app.id} · {app.company_name}</p><h2>{app.title}</h2></div><StatusBadge status={app.status} /></div><ol className="application-progress" aria-label="Các mốc ứng tuyển">{milestones.map(([status,label]) => <li className={Number(app.status) >= Number(status) ? 'done' : ''} key={status}>{Number(app.status) >= Number(status) ? <CheckCircle2 size={19} /> : <Clock3 size={19} />}<span>{label}</span></li>)}</ol><div className="application-next"><div><span className="eyebrow">BƯỚC TIẾP THEO</span><p>{app.interview_result === 'failed' ? 'Bạn chưa đạt phỏng vấn cho vị trí này. Hãy tìm cơ hội khác phù hợp.' : app.offer_decision === 'declined' ? 'Bạn đã từ chối đề nghị thực tập này.' : nextStep(app.status)}</p></div>{['06','07','08'].includes(app.status) && <Link className="text-link" to="/student/interviews">Xem lịch <ArrowRight size={15} /></Link>}{app.status === '13' && <Link className="text-link" to="/student/diary">Ghi nhật ký <ArrowRight size={15} /></Link>}</div>{app.status === '10' && app.offer_decision !== 'declined' && <div className="flex flex-wrap gap-3 mt-5"><button className="button button-primary" onClick={() => setChoice({id:app.id,accepted:true})}>Nhận thực tập</button><button className="button button-secondary" onClick={() => setChoice({id:app.id,accepted:false})}>Từ chối đề nghị</button></div>}<small className="muted block mt-4">Trạng thái hiện tại: {STATUS_LABELS[app.status]}</small></article>)}</div> : <EmptyState title="Không tìm thấy hồ sơ phù hợp" description="Thử từ khóa khác." />}</ResourceState>{choice && <Modal title={choice.accepted ? 'Xác nhận nhận thực tập' : 'Từ chối đề nghị thực tập'} onClose={close}><p className="muted text-sm">{choice.accepted ? 'Xác nhận để nhà trường tiếp tục xử lý hồ sơ thực tập của bạn.' : 'Vui lòng cho doanh nghiệp biết lý do bạn không nhận đề nghị.'}</p>{notice && <p role="status" className="notice mt-4">{notice}</p>}<form className="application-form" onSubmit={respond}><label>{choice.accepted ? 'Ghi chú (không bắt buộc)' : 'Lý do từ chối'}<textarea name="note" rows={4} required={!choice.accepted} /></label><div className="flex gap-3"><button disabled={busy} className="button button-primary">{busy ? 'Đang gửi…' : 'Gửi phản hồi'}</button><button disabled={busy} type="button" className="button button-secondary" onClick={close}>Hủy</button></div></form></Modal>}</section>
}
