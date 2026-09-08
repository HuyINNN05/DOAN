import { Menu, Search, X } from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Cơ hội thực tập', href: '/opportunities' },
  { label: 'Doanh nghiệp', href: '/companies' },
  { label: 'Thông tin', href: '/information' },
  { label: 'Hướng dẫn', href: '/guide' },
  { label: 'Liên hệ', href: '/contact' },
]

function BrandMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-9 w-9 shrink-0 text-[#0757c9]"
      fill="none"
      viewBox="0 0 40 40"
    >
      <path
        d="M20 3.75 6.45 10.5 20 17.25l13.55-6.75L20 3.75Zm-10 12.8v9.7l7.45 3.72v-9.7L10 16.55Zm20 0-7.45 3.72v9.7L30 26.25v-9.7Z"
        fill="currentColor"
      />
      <path
        d="M6.45 27.4 20 34.15l13.55-6.75v5.1L20 39.25 6.45 32.5v-5.1Z"
        fill="currentColor"
        opacity=".85"
      />
      <path d="M20 17.25v16.9" stroke="white" strokeWidth="1.5" />
      <path d="m6.45 10.5 13.55 6.75 13.55-6.75" stroke="white" strokeWidth="1.5" />
    </svg>
  )
}

function Header({ activeItem = 'Trang chủ' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="public-header relative z-20">
      <div className="public-header-inner mx-auto flex h-16 max-w-[1440px] items-center px-5 sm:px-8 lg:px-9">
        <a className="flex items-center gap-2" href="/" aria-label="InternConnect">
          <BrandMark />
          <span className="text-[15px] font-extrabold tracking-[-0.04em] text-[#064aa9]">
            INTERNCONNECT
          </span>
        </a>

        <nav className="ml-auto hidden h-full items-stretch xl:flex" aria-label="Điều hướng chính">
          {navigation.map((item) => {
            const isActive = item.label === activeItem

            return (
              <a
                className={`relative flex items-center whitespace-nowrap px-[18px] text-[11px] font-semibold transition-colors hover:text-[#0757c9] ${
                  isActive ? 'text-[#0757c9]' : 'text-[#2b4263]'
                }`}
                href={item.href}
                key={item.label}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-[18px] bottom-0 h-0.5 rounded-t-full bg-[#0757c9]" />
                )}
              </a>
            )
          })}
        </nav>

        <div className="ml-4 hidden items-center gap-2 sm:flex">
          <button
            className="grid size-9 place-items-center rounded-md text-[#0757c9] transition-colors hover:bg-[#eff6ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0757c9]"
            type="button"
            aria-label="Tìm kiếm"
            onClick={() => { window.location.href = '/opportunities' }}
          >
            <Search size={17} strokeWidth={2.25} />
          </button>
          <a
            className="rounded-[5px] border border-[#0d61da] px-4 py-2 text-[11px] font-semibold text-[#0757c9] transition-colors hover:bg-[#eff6ff]"
            href="/login"
          >
            Đăng nhập
          </a>
        </div>

        <button
          className="ml-auto grid size-10 place-items-center rounded-md text-[#0757c9] xl:hidden"
          type="button"
          aria-controls="mobile-navigation"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X size={21} /> : <Menu size={22} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-[#e6ecf4] bg-white px-5 py-3 xl:hidden" id="mobile-navigation">
          <nav className="mx-auto grid max-w-[1440px] gap-1" aria-label="Điều hướng trên di động">
            {navigation.map((item) => {
              const isActive = item.label === activeItem

              return (
                <a
                  className={`rounded-md px-3 py-2.5 text-sm font-semibold ${
                    isActive ? 'bg-[#eff6ff] text-[#0757c9]' : 'text-[#2b4263]'
                  }`}
                  href={item.href}
                  key={item.label}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              )
            })}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#e6ecf4] pt-3 sm:hidden">
              <a
                className="rounded-md border border-[#0d61da] px-3 py-2 text-center text-sm font-semibold text-[#0757c9]"
                href="/login"
              >
                Đăng nhập
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
