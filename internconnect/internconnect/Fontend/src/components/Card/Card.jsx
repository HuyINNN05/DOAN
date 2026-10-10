import { Bookmark, MapPin } from 'lucide-react'

const logoTones = {
  blue: 'bg-primary text-white',
  green: 'bg-[#0d8d55] text-white',
  navy: 'bg-[#102d70] text-white',
  orange: 'bg-[#f26b21] text-white',
  red: 'bg-[#ed1c2e] text-white',
}

function Card({
  company,
  position,
  location,
  tags = [],
  logo,
  logoTone = 'blue',
  onDetailClick,
  isSaved = false,
  onSave,
}) {
  return (
    <article className="flex min-h-[178px] w-full max-w-[230px] flex-col rounded-[7px] border border-line bg-white p-4 shadow-[0_2px_8px_rgba(23,61,110,0.05)] transition-all hover:-translate-y-0.5 hover:border-[#b8d1f4] hover:shadow-[0_7px_18px_rgba(23,61,110,0.1)]">
      <div className="flex items-start gap-3">
        <div className={`grid size-9 shrink-0 place-items-center rounded-md text-xs font-extrabold ${logoTones[logoTone] || logoTones.blue}`}>
          {logo}
        </div>
        <div className="min-w-0 pt-0.5">
          <h2 className="truncate text-sm font-bold text-ink">{company}</h2>
          <p className="mt-1 truncate text-xs font-medium text-[#263e61]">{position}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-muted">
        <MapPin size={12} strokeWidth={2.2} />
        <span>{location}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span className="rounded-[3px] bg-[#edf4ff] px-2 py-1 text-xs font-semibold text-[#4774b3]" key={tag}>
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between pt-4">
        <button
          className="text-xs font-bold text-primary transition-colors hover:text-[#043b8b]"
          type="button"
          onClick={onDetailClick}
        >
          Xem chi tiết
        </button>
        <button
          className={`grid size-6 place-items-center rounded transition-colors hover:bg-[#edf4ff] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0757c9] ${isSaved ? 'text-[#f49b3f]' : 'text-primary'}`}
          type="button"
          aria-label={`Lưu cơ hội ${position} tại ${company}`}
          aria-pressed={isSaved}
          onClick={onSave}
        >
          <Bookmark size={13} strokeWidth={2} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>
    </article>
  )
}

export default Card
