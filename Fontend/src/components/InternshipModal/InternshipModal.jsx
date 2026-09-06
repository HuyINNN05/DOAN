import { BriefcaseBusiness, CalendarDays, MapPin, X } from 'lucide-react'

function InternshipModal({ internship, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#102d50]/55 p-5" role="presentation" onMouseDown={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="internship-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-lg bg-[#eaf3ff] text-sm font-extrabold text-[#0757c9]">{internship.logo}</div>
            <div>
              <p className="text-xs font-semibold text-[#7890ad]">{internship.company}</p>
              <h2 id="internship-modal-title" className="mt-1 text-lg font-extrabold text-[#172d50]">{internship.position}</h2>
            </div>
          </div>
          <button className="grid size-8 place-items-center rounded-md text-[#7890ad] hover:bg-[#f1f5fa]" type="button" onClick={onClose} aria-label="Đóng chi tiết"><X size={18} /></button>
        </div>
        <div className="mt-6 grid gap-3 text-sm text-[#526b8d] sm:grid-cols-2">
          <p className="flex items-center gap-2"><MapPin size={16} className="text-[#0a66c2]" /> {internship.location}</p>
          <p className="flex items-center gap-2"><BriefcaseBusiness size={16} className="text-[#0a66c2]" /> Thực tập toàn thời gian</p>
          <p className="flex items-center gap-2"><CalendarDays size={16} className="text-[#0a66c2]" /> Hạn ứng tuyển: 30/09/2026</p>
        </div>
        <div className="mt-6 border-t border-[#e8eef6] pt-5">
          <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#7890ad]">Kỹ năng phù hợp</h3>
          <div className="mt-3 flex flex-wrap gap-2">{internship.tags.map((tag) => <span className="rounded-full bg-[#edf4ff] px-3 py-1.5 text-xs font-semibold text-[#4774b3]" key={tag}>{tag}</span>)}</div>
        </div>
        <button className="mt-7 w-full rounded-md bg-[#0757c9] py-3 text-sm font-bold text-white transition-colors hover:bg-[#064aa9]" type="button" onClick={onClose}>Ứng tuyển ngay</button>
      </div>
    </div>
  )
}

export default InternshipModal