import { ArrowRight, Search, Sparkles } from 'lucide-react'

function HeroSearch({ query, onQueryChange }) {
  return (
    <section className="relative overflow-hidden bg-[#0b4fa8] px-5 py-14 text-white sm:px-8 lg:px-9 lg:py-20">
      <div className="absolute -right-20 -top-24 size-72 rounded-full border-[36px] border-white/10" />
      <div className="absolute -bottom-32 left-1/3 size-64 rounded-full border-[24px] border-[#48a8ef]/20" />
      <div className="relative mx-auto max-w-[1440px]">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100">
            <Sparkles size={13} /> Kết nối đúng cơ hội
          </div>
          <h1 className="max-w-xl text-4xl font-extrabold leading-[1.08] tracking-[-0.05em] sm:text-5xl">
            Bắt đầu hành trình thực tập của bạn.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-blue-100 sm:text-base">
            Khám phá những vị trí thực tập chất lượng từ các doanh nghiệp đang tìm kiếm tài năng trẻ.
          </p>
          <div className="mt-8 flex max-w-2xl items-center rounded-lg bg-white p-1.5 shadow-[0_18px_35px_rgba(4,35,87,0.25)]">
            <Search className="ml-3 shrink-0 text-[#7290b5]" size={19} />
            <input
              className="min-w-0 flex-1 px-3 py-3 text-sm text-[#172d50] outline-none placeholder:text-[#9aabc1]"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Tìm theo vị trí, công ty hoặc kỹ năng..."
              aria-label="Tìm kiếm cơ hội thực tập"
            />
            <button className="hidden items-center gap-2 rounded-md bg-[#f49b3f] px-5 py-3 text-xs font-bold text-white transition-colors hover:bg-[#e8882b] sm:flex" type="button">
              Tìm kiếm <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSearch