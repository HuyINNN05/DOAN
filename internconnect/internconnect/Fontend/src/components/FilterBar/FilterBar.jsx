import { SlidersHorizontal } from 'lucide-react'

function FilterBar({ locations, location, sortBy, onLocationChange, onSortChange }) {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-line bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-xs font-bold text-ink">
        <SlidersHorizontal size={15} className="text-primary" />
        Bộ lọc cơ hội
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <label className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-xs text-[#5b7190]">
          <span className="sr-only">Địa điểm</span>
          <select className="bg-transparent font-semibold outline-none" value={location} onChange={(event) => onLocationChange(event.target.value)}>
            {locations.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-xs text-[#5b7190]">
          <span className="sr-only">Sắp xếp</span>
          <select className="bg-transparent font-semibold outline-none" value={sortBy} onChange={(event) => onSortChange(event.target.value)}>
            <option>Mới nhất</option>
            <option>A-Z</option>
          </select>
        </label>
      </div>
    </div>
  )
}

export default FilterBar