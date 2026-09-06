import { Link, Mail, Send } from 'lucide-react'

const footerGroups = [
  {
    title: 'Về chúng tôi',
    links: ['Giới thiệu', 'Điều khoản sử dụng', 'Chính sách bảo mật', 'Liên hệ'],
  },
  {
    title: 'Dành cho sinh viên',
    links: ['Tìm cơ hội thực tập', 'Hướng dẫn đăng ký', 'Câu hỏi thường gặp', 'Quy định thực tập'],
  },
  {
    title: 'Dành cho doanh nghiệp',
    links: ['Đăng tuyển dụng', 'Hướng dẫn tuyển dụng', 'Bảng giá dịch vụ', 'Liên hệ hợp tác'],
  },
  {
    title: 'Hỗ trợ',
    links: ['Trung tâm hỗ trợ', 'Hướng dẫn sử dụng', 'Câu hỏi thường gặp', 'Hotline: 1900 1234'],
  },
]

function BrandMark() {
  return (
    <svg aria-hidden="true" className="size-9 shrink-0 text-white" fill="none" viewBox="0 0 40 40">
      <path
        d="M20 3.75 6.45 10.5 20 17.25l13.55-6.75L20 3.75Zm-10 12.8v9.7l7.45 3.72v-9.7L10 16.55Zm20 0-7.45 3.72v9.7L30 26.25v-9.7Z"
        fill="currentColor"
      />
      <path d="M6.45 27.4 20 34.15l13.55-6.75v5.1L20 39.25 6.45 32.5v-5.1Z" fill="currentColor" opacity=".8" />
      <path d="M20 17.25v16.9" stroke="#0b4ca5" strokeWidth="1.5" />
      <path d="m6.45 10.5 13.55 6.75 13.55-6.75" stroke="#0b4ca5" strokeWidth="1.5" />
    </svg>
  )
}

function Footer() {
  return (
    <footer className="bg-[#06439a] text-white">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-9 sm:px-8 lg:grid-cols-[1.25fr_repeat(4,1fr)_1.45fr] lg:gap-7 lg:px-9 lg:py-8">
        <div>
          <a className="flex items-center gap-2" href="#trang-chu" aria-label="InternConnect">
            <BrandMark />
            <span className="text-[15px] font-extrabold tracking-[-0.04em]">INTERNCONNECT</span>
          </a>
          <p className="mt-4 max-w-[190px] text-[11px] leading-5 text-blue-100">
            Nền tảng kết nối thực tập giữa sinh viên, nhà trường và doanh nghiệp.
          </p>
          <div className="mt-5 flex gap-2">
            <a className="grid size-7 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25" href="#facebook" aria-label="Facebook">
              <Link size={14} />
            </a>
            <a className="grid size-7 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25" href="#linkedin" aria-label="LinkedIn">
              <Mail size={14} />
            </a>
            <a className="grid size-7 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25" href="#email" aria-label="Email">
              <Mail size={14} />
            </a>
          </div>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-[11px] font-bold text-white">{group.title}</h2>
            <ul className="mt-4 space-y-2">
              {group.links.map((link) => (
                <li key={link}>
                  <a className="text-[10px] leading-4 text-blue-100 transition-colors hover:text-white" href={`#${link}`}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h2 className="text-[11px] font-bold text-white">Đăng ký nhận bản tin</h2>
          <p className="mt-4 max-w-[210px] text-[10px] leading-4 text-blue-100">
            Nhận thông tin mới nhất về cơ hội thực tập và các sự kiện hấp dẫn.
          </p>
          <form className="mt-4 flex max-w-[230px] overflow-hidden rounded-[4px] bg-white" onSubmit={(event) => event.preventDefault()}>
            <input
              className="min-w-0 flex-1 px-3 py-2 text-[10px] text-[#18345e] outline-none placeholder:text-[#8b9ab1]"
              type="email"
              placeholder="Nhập email của bạn..."
              aria-label="Địa chỉ email"
            />
            <button className="grid w-9 shrink-0 place-items-center bg-[#1769d8] text-white transition-colors hover:bg-[#0e58bd]" type="submit" aria-label="Đăng ký nhận bản tin">
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-4 text-[9px] text-blue-100 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-9">
          <p>© 2025 InternConnect. All rights reserved.</p>
          <div className="flex gap-4">
            <a className="transition-colors hover:text-white" href="#dieu-khoan">Điều khoản sử dụng</a>
            <span className="text-white/35">|</span>
            <a className="transition-colors hover:text-white" href="#chinh-sach">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
