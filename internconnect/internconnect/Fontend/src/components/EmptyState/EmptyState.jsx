import { SearchX } from 'lucide-react'

function EmptyState({ onReset }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-[#c9d8eb] bg-white px-6 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-[#edf4ff] text-[#0a66c2]"><SearchX size={22} /></div>
      <h2 className="mt-4 text-base font-bold text-[#172d50]">Không tìm thấy cơ hội phù hợp</h2>
      <p className="mt-1 text-sm text-[#7890ad]">Hãy thử từ khóa khác hoặc bỏ bớt bộ lọc.</p>
      <button className="mt-4 text-xs font-bold text-[#0757c9] hover:underline" type="button" onClick={onReset}>Xóa bộ lọc</button>
    </div>
  )
}

export default EmptyState