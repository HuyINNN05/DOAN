import { Link } from 'react-router'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'

const content = {
  companies: { title: 'Doanh nghiệp', intro: 'Kết nối với nguồn nhân lực trẻ và quản lý tuyển dụng thực tập tập trung.', cards: [['Đăng tuyển nhanh', 'Tạo vị trí thực tập, mô tả yêu cầu và tiếp nhận hồ sơ trực tuyến.'], ['Quản lý ứng viên', 'Theo dõi hồ sơ, mời phỏng vấn và cập nhật kết quả tuyển chọn.'], ['Đồng hành thực tập', 'Nhận xét và đánh giá sinh viên trong suốt quá trình thực tập.']] },
  information: { title: 'Thông tin', intro: 'Thông tin, quy định và hướng dẫn liên quan đến chương trình thực tập.', cards: [['Tin tức', 'Cập nhật hoạt động kết nối nhà trường, sinh viên và doanh nghiệp.'], ['Quy định thực tập', 'Các mốc và yêu cầu sinh viên cần hoàn thành trong kỳ thực tập.'], ['FAQ', 'Giải đáp các câu hỏi thường gặp về hồ sơ và quy trình ứng tuyển.']] },
  guide: { title: 'Hướng dẫn', intro: 'Các bước sử dụng InternConnect cho từng nhóm người dùng.', cards: [['Sinh viên', 'Hoàn thiện hồ sơ, tải CV, tìm cơ hội và theo dõi ứng tuyển.'], ['Doanh nghiệp', 'Đăng ký, đăng tin, xử lý hồ sơ và đánh giá sinh viên.'], ['Nhà trường', 'Quản lý kỳ thực tập, phân công giảng viên và theo dõi báo cáo.']] },
  contact: { title: 'Liên hệ', intro: 'Đội ngũ InternConnect sẵn sàng hỗ trợ các vấn đề trong quá trình sử dụng.', cards: [['Email', 'support@internconnect.vn'], ['Hotline', '1900 1234'], ['Địa chỉ', 'Khoa Công nghệ thông tin, Hà Nội']] },
}

function PublicInfoPage({ type }) {
  const page = content[type]
  return <><Header activeItem={page.title} /><main className="min-h-screen bg-[#f7faff] px-5 py-12 sm:px-8 lg:px-12"><div className="mx-auto max-w-6xl"><Link to="/" className="text-sm font-bold text-[#0757c9]">← Trang chủ</Link><h1 className="mt-5 text-4xl font-extrabold text-[#172d50]">{page.title}</h1><p className="mt-3 max-w-2xl text-base leading-7 text-[#7890ad]">{page.intro}</p><div className="mt-10 grid gap-5 md:grid-cols-3">{page.cards.map(([title, text]) => <article className="rounded-xl border border-[#e1eaf5] bg-white p-6 shadow-sm" key={title}><h2 className="font-bold text-[#172d50]">{title}</h2><p className="mt-3 text-sm leading-6 text-[#7890ad]">{text}</p></article>)}</div></div></main><Footer /></>
}

export default PublicInfoPage
