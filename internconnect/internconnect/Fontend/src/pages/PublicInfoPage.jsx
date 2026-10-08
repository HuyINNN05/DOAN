import { useEffect, useState } from 'react'
import { Building2, GraduationCap, School } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'
import NotFoundPage from './NotFoundPage'
import { getCompany, getRegistrations } from '../services/companyService'

function Shell({ title, description, children }) { return <><Header /><main className="public-page min-h-screen bg-[#f4f8fd]"><section className="public-info-hero px-5 py-12"><div className="mx-auto max-w-6xl"><h1 className="text-4xl font-extrabold text-[#123a8b]">{title}</h1><p className="mt-3 text-sm">{description}</p></div></section><div className="mx-auto max-w-6xl px-5 py-10">{children}</div></main><Footer /></> }
const box = 'rounded-xl border border-[#dce9f7] bg-white p-6'
const seed = [{ id: 'welcome', title: 'Quy trình thực tập tại InternConnect', category: 'Hướng dẫn', body: 'Sinh viên đăng ký, nhà trường xác nhận, doanh nghiệp tuyển chọn và giảng viên theo dõi quá trình thực tập.' }, { id: 'report', title: 'Hướng dẫn nộp báo cáo thực tập', category: 'Hướng dẫn', body: 'Sau khi bắt đầu thực tập, sinh viên có thể nộp từng phiên bản báo cáo và xem phản hồi của giảng viên.' }, { id: 'policy', title: 'Quy định xác nhận nơi thực tập', category: 'Quy định', body: 'Nhà trường xác nhận nơi thực tập và phân công giảng viên trước khi kỳ thực tập bắt đầu.' }]
function InformationPage() { const [query, setQuery] = useState(''); const [category, setCategory] = useState('Tất cả'); const [params, setParams] = useSearchParams(); const articles = [...seed, ...(() => { try { return JSON.parse(localStorage.getItem('internconnect_articles')) || [] } catch { return [] } })()]; const current = articles.find((item) => String(item.id) === params.get('article')); const filtered = articles.filter((item) => (category === 'Tất cả' || item.category === category) && `${item.title} ${item.body}`.toLowerCase().includes(query.toLowerCase())); return <Shell title="Thông tin" description="Thông báo, quy định và hướng dẫn thực tập."><div className="mb-5 grid gap-3 sm:grid-cols-[1fr_220px]"><label className="text-sm">Tìm bài viết<input className="mt-2 w-full rounded-md border p-3" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label className="text-sm">Danh mục<select className="mt-2 w-full rounded-md border p-3" value={category} onChange={(event) => setCategory(event.target.value)}>{['Tất cả', 'Tin tức', 'Hướng dẫn', 'Quy định'].map((item) => <option key={item}>{item}</option>)}</select></label></div>{current ? <article className={box}><button className="mb-4 text-sm text-[#0757c9]" onClick={() => setParams({})}>← Danh sách</button><h2 className="text-2xl font-bold">{current.title}</h2><p className="mt-3 text-sm">{current.body}</p></article> : <div className="grid gap-4 sm:grid-cols-2">{filtered.map((item) => <article className={box} key={item.id}><small>{item.category}</small><h2 className="mt-2 font-bold">{item.title}</h2><p className="mt-2 text-sm">{item.body}</p><button className="mt-4 text-sm font-bold text-[#0757c9]" onClick={() => setParams({ article: item.id })}>Xem chi tiết →</button></article>)}</div>}<div className={`${box} mt-5`}><h2 className="font-bold">Tài liệu và hỗ trợ</h2><p className="mt-2 text-sm">Xem <Link className="text-[#0757c9]" to="/guide">hướng dẫn sử dụng</Link> hoặc <Link className="text-[#0757c9]" to="/contact">liên hệ hỗ trợ</Link>.</p></div></Shell> }
function CompaniesPage() { const [params, setParams] = useSearchParams(); const companies = [getCompany(), ...getRegistrations().filter((item) => item.status === 'Đã duyệt')].filter((item) => item?.id && item?.name); const selected = companies.find((item) => String(item.id) === params.get('company')); return <Shell title="Doanh nghiệp đối tác" description="Tìm hiểu doanh nghiệp đã được nhà trường phê duyệt."><div className="mb-6 flex flex-wrap gap-3"><Link className="rounded-md bg-[#0757c9] px-4 py-3 text-sm font-bold text-white" to="/company/register">Đăng ký doanh nghiệp</Link><Link className="rounded-md border px-4 py-3 text-sm" to="/company/lookup">Tra cứu hồ sơ</Link></div>{selected ? <article className={box}><button className="text-sm text-[#0757c9]" onClick={() => setParams({})}>← Danh sách</button><h2 className="mt-3 text-xl font-bold">{selected.name}</h2><p className="mt-2 text-sm">{selected.industry} · {selected.address}</p><p className="mt-2 text-sm">{selected.description}</p></article> : companies.length ? <div className="grid gap-4 sm:grid-cols-2">{companies.map((item) => <article className={box} key={item.id}><h2 className="font-bold">{item.name}</h2><p className="text-sm">{item.industry} · {item.address}</p><button className="mt-3 text-sm text-[#0757c9]" onClick={() => setParams({ company: item.id })}>Xem chi tiết →</button></article>)}</div> : <p className={`${box} text-center text-sm text-[#6684a8]`}>Chưa có dữ liệu doanh nghiệp.</p>}<div className={`${box} mt-6`}><h2 className="font-bold">Quy trình tuyển dụng</h2><p className="mt-2 text-sm">Gửi đăng ký → nhà trường duyệt → tạo tin → xuất bản → xem hồ sơ và mời phỏng vấn.</p></div></Shell> }
const roleGuides = [
  {
    id: 'sinh-vien', title: 'Sinh viên', icon: GraduationCap,
    description: 'Từ tìm kiếm cơ hội đến theo dõi quá trình thực tập.',
    steps: [
      ['Đăng nhập và cập nhật hồ sơ', 'Đăng nhập tài khoản sinh viên. Vào “Hồ sơ & CV” để kiểm tra họ tên, thông tin liên hệ, chuyên ngành và kỹ năng, sau đó chọn “Lưu thay đổi”.'],
      ['Tìm cơ hội và ứng tuyển', 'Vào “Cơ hội thực tập”, tìm vị trí phù hợp và xem chi tiết. Chọn “Ứng tuyển ngay”, sau đó theo dõi hồ sơ trong mục “Ứng tuyển”.'],
      ['Theo dõi và xác nhận phỏng vấn', 'Khi doanh nghiệp gửi lời mời, vào “Lịch phỏng vấn” để xem ngày, giờ và địa điểm. Chọn “Xác nhận lịch”; nếu từ chối, cần nhập lý do.'],
      ['Nhận đề nghị và tạo hồ sơ thực tập', 'Khi trúng tuyển, vào “Ứng tuyển” và chọn “Nhận thực tập”. Tiếp theo, vào “Hồ sơ thực tập”, chọn “Tạo hồ sơ thực tập” và chờ nhà trường xác nhận, phân công giảng viên.'],
      ['Ghi nhật ký và nộp báo cáo', 'Sau khi nhà trường cho bắt đầu thực tập, vào “Nhật ký thực tập” để ghi công việc. Sử dụng “Báo cáo thực tập” để nộp báo cáo và xem phản hồi của giảng viên.'],
      ['Theo dõi kết quả', 'Theo dõi tiến độ tại Dashboard và “Ứng tuyển”. Nhà trường ký xác nhận hoàn thành sau bước đánh giá cuối kỳ.'],
    ],
    note: 'Chỉ có thể ghi nhật ký và nộp báo cáo khi hồ sơ đã chuyển sang giai đoạn đang thực tập.',
    href: '/opportunities', action: 'Khám phá cơ hội thực tập',
  },
  {
    id: 'doanh-nghiep', title: 'Doanh nghiệp', icon: Building2,
    description: 'Đăng ký tham gia, tuyển chọn và đồng hành cùng sinh viên.',
    steps: [
      ['Đăng ký doanh nghiệp', 'Mở “Doanh nghiệp”, chọn “Đăng ký doanh nghiệp” và điền thông tin yêu cầu. Lưu mã hồ sơ để tra cứu kết quả xét duyệt.'],
      ['Tra cứu và đăng nhập', 'Dùng mã hồ sơ, mã số thuế hoặc email tại “Tra cứu hồ sơ”. Khi được nhà trường duyệt, đăng nhập bằng tài khoản đã đăng ký và kiểm tra “Hồ sơ doanh nghiệp”.'],
      ['Tạo và xuất bản tin tuyển dụng', 'Vào “Đăng tin tuyển dụng”, nhập vị trí, địa điểm, kỹ năng, mức hỗ trợ và hạn ứng tuyển. Lưu bản nháp rồi vào “Tin tuyển dụng” để xuất bản.'],
      ['Tiếp nhận hồ sơ và mời phỏng vấn', 'Vào “Quản lý ứng viên” để tiếp nhận hồ sơ nhà trường đã gửi. Chọn “Mời phỏng vấn” và nhập ngày, giờ, hình thức cùng địa điểm hoặc liên kết.'],
      ['Ghi nhận kết quả tuyển chọn', 'Sau khi sinh viên xác nhận lịch, vào “Lịch phỏng vấn” để ghi nhận xét và kết quả. Hồ sơ đạt sẽ được gửi đề nghị thực tập để sinh viên xác nhận.'],
      ['Theo dõi và đánh giá sinh viên', 'Theo dõi người thực tập tại “Sinh viên thực tập”. Khi sinh viên đang thực tập, vào “Đánh giá sinh viên”, nhập điểm từ 0 đến 10 và gửi đánh giá.'],
    ],
    note: 'Đánh giá được khóa sau khi gửi. Hãy kiểm tra kỹ điểm trước khi xác nhận.',
    href: '/company/register', action: 'Đăng ký doanh nghiệp',
  },
  {
    id: 'nha-truong', title: 'Nhà trường', icon: School,
    description: 'Quản lý kỳ thực tập, phê duyệt và phối hợp với giảng viên.',
    steps: [
      ['Quản lý tài khoản và kỳ thực tập', 'Đăng nhập tài khoản nhà trường. Vào “Quản lý tài khoản” để xem, khóa hoặc mở tài khoản; vào “Quản lý kỳ thực tập” để tạo và mở kỳ.'],
      ['Phê duyệt doanh nghiệp', 'Vào “Phê duyệt doanh nghiệp” để xem hồ sơ đăng ký. Chọn duyệt, yêu cầu bổ sung hoặc từ chối; nhập lý do khi yêu cầu bổ sung hoặc từ chối.'],
      ['Xác nhận hồ sơ ứng tuyển', 'Vào “Xác nhận ứng tuyển”, kiểm tra hồ sơ sinh viên rồi chọn “Xác nhận đủ điều kiện”. Tiếp tục chọn “Gửi doanh nghiệp” để chuyển hồ sơ sang bước tuyển chọn.'],
      ['Xác nhận nơi thực tập và phân công', 'Khi sinh viên đã nhận đề nghị và tạo hồ sơ, vào “Phân công giảng viên”. Nhập kỳ thực tập, chọn giảng viên, xác nhận phân công rồi chọn “Bắt đầu thực tập”.'],
      ['Giảng viên theo dõi và đánh giá', 'Giảng viên đăng nhập tài khoản riêng để xem sinh viên được phân công, nhận xét nhật ký, duyệt hoặc yêu cầu sửa báo cáo và gửi đánh giá cuối kỳ.'],
      ['Ký xác nhận và xem thống kê', 'Khi hồ sơ chuyển sang bước đánh giá và ký xác nhận, nhà trường vào “Phân công giảng viên” để ký hoàn thành. Xem kết quả tại “Báo cáo thống kê” và lịch sử tại “Lịch sử thao tác”.'],
    ],
    note: 'Nhà trường và giảng viên dùng tài khoản riêng. Giảng viên thao tác trên các hồ sơ được phân công.',
    href: '/login', action: 'Đăng nhập hệ thống',
  },
]

function GuidePage() {
  const { guideId } = useParams()
  const guide = roleGuides.find((item) => item.id === guideId)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [guideId])

  if (guideId && !guide) return <NotFoundPage />

  return (
    <Shell title={guide ? `Hướng dẫn dành cho ${guide.title.toLowerCase()}` : 'Hướng dẫn sử dụng'} description={guide ? guide.description : 'Chọn vai trò của bạn để xem các bước thao tác trên InternConnect.'}>
      {guide ? <Link className="mb-6 inline-flex text-sm font-semibold text-[var(--primary)] hover:underline" to="/guide">← Quay lại hướng dẫn sử dụng</Link> : (
        <nav className="grid gap-4 md:grid-cols-3" aria-label="Chọn phần hướng dẫn">
        {roleGuides.map(({ id, title, description, icon: Icon }) => (
          <Link className="rounded-xl border border-[var(--line)] bg-white p-6 transition-colors hover:border-[#f0a044] hover:bg-[#fff8ef]" to={`/guide/${id}`} key={id}>
            <Icon className="mb-3 text-[var(--primary)]" size={28} aria-hidden="true" />
            <span className="block text-lg font-bold text-[var(--primary)]">Dành cho {title.toLowerCase()}</span>
            <p className="mt-2 text-sm text-[var(--muted)]">{description}</p>
            <span className="mt-4 block text-sm font-semibold text-[var(--primary)]">Xem hướng dẫn →</span>
          </Link>
        ))}
      </nav>
      )}

      {guide && <div>
        {[guide].map(({ id, title, description, icon: Icon, steps, note, href, action }) => (
          <section aria-labelledby={`${id}-title`} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white" key={id}>
            <div className="flex items-start gap-4 border-b border-[var(--line)] bg-[var(--bg-1)] p-6 sm:p-8">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--primary)] text-white"><Icon size={24} aria-hidden="true" /></span>
              <div><h2 id={`${id}-title`} className="text-2xl font-bold text-[var(--primary)]">Dành cho {title.toLowerCase()}</h2><p className="mt-2 text-sm text-[var(--muted)]">{description}</p></div>
            </div>
            <div className="p-6 sm:p-8">
              <ol className="grid gap-6 lg:grid-cols-2">
                {steps.map(([heading, detail], index) => (
                  <li className="flex items-start gap-3" key={heading}>
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#fff0dd] text-sm font-bold text-[var(--primary)]" aria-hidden="true">{index + 1}</span>
                    <div><h3 className="font-semibold text-[var(--primary)]">{heading}</h3><p className="mt-2 text-sm leading-7 text-[var(--muted)]">{detail}</p></div>
                  </li>
                ))}
              </ol>
              <p className="mt-8 rounded-lg border-l-4 border-[#f0a044] bg-[#fff8ef] p-4 text-sm text-[var(--text)]"><strong>Lưu ý: </strong>{note}</p>
              <Link className="mt-6 inline-flex rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--primary-strong)]" to={href}>{action} →</Link>
            </div>
          </section>
        ))}
      </div>}
      <p className="mt-8 text-center text-sm text-[var(--muted)]">Cần thêm trợ giúp? <Link className="font-semibold text-[var(--primary)] underline underline-offset-4" to="/contact">Liên hệ hỗ trợ</Link></p>
    </Shell>
  )
}
function ContactPage() { return <Shell title="Liên hệ" description="Hỗ trợ sử dụng InternConnect."><div className="public-contact-info"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#e3e0e8]">HỖ TRỢ NGƯỜI DÙNG</p><h2 className="mt-3">Cần hỗ trợ trong quá trình thực tập?</h2><p>Vui lòng mô tả rõ tài khoản và vấn đề cần hỗ trợ để đội ngũ InternConnect phản hồi nhanh hơn.</p><div><span>Email hỗ trợ</span><a className="font-bold text-[#f0a044]" href="mailto:support@internconnect.vn">support@internconnect.vn</a></div></div></Shell> }
function TermsPage() {
  const sections = [
    ['1. Phạm vi áp dụng', 'Điều khoản này áp dụng khi bạn truy cập hoặc sử dụng InternConnect để tìm kiếm cơ hội thực tập, quản lý hồ sơ, tuyển dụng, theo dõi và hỗ trợ quá trình thực tập.'],
    ['2. Tài khoản và thông tin', 'Bạn cần cung cấp thông tin chính xác, cập nhật thông tin khi có thay đổi và bảo vệ thông tin đăng nhập của mình. Bạn chịu trách nhiệm đối với hoạt động phát sinh từ tài khoản, trừ trường hợp có dấu hiệu truy cập trái phép cần báo ngay cho bộ phận hỗ trợ.'],
    ['3. Sử dụng dịch vụ', 'Bạn chỉ sử dụng nền tảng cho mục đích học tập, thực tập và tuyển dụng hợp pháp. Không đăng tải thông tin sai lệch, xâm phạm quyền của người khác, gây gián đoạn hệ thống hoặc sử dụng dữ liệu trên nền tảng ngoài mục đích được phép.'],
    ['4. Nội dung và tương tác', 'Người đăng tải chịu trách nhiệm về tính chính xác và quyền sử dụng đối với nội dung mình cung cấp. InternConnect có thể rà soát, ẩn hoặc gỡ nội dung vi phạm điều khoản hoặc ảnh hưởng đến hoạt động an toàn của nền tảng.'],
    ['5. Quy trình thực tập', 'Các thông tin tuyển dụng và hồ sơ trên nền tảng hỗ trợ việc kết nối giữa sinh viên, doanh nghiệp và nhà trường; việc ứng tuyển không bảo đảm chắc chắn được tuyển chọn. Quyết định xác nhận, phê duyệt và đánh giá thuộc về bên có thẩm quyền trong quy trình thực tập.'],
    ['6. Thay đổi và hỗ trợ', 'InternConnect có thể cập nhật điều khoản hoặc điều chỉnh dịch vụ khi cần thiết. Phiên bản mới sẽ được đăng trên trang này. Nếu cần hỗ trợ hoặc muốn báo cáo vấn đề, vui lòng liên hệ support@internconnect.vn.'],
  ]

  return <Shell title="Điều khoản sử dụng" description="Các điều kiện áp dụng khi sử dụng nền tảng InternConnect.">
    <article className="mx-auto max-w-4xl rounded-xl border border-[#dce9f7] bg-white p-6 sm:p-9">
      <p className="mb-8 text-sm leading-7 text-slate-600">Bằng việc truy cập hoặc sử dụng InternConnect, bạn xác nhận đã đọc và đồng ý tuân thủ các điều khoản dưới đây.</p>
      <div className="space-y-7">
        {sections.map(([heading, body]) => <section key={heading}>
          <h2 className="text-lg font-bold text-[#123a8b]">{heading}</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p>
        </section>)}
      </div>
    </article>
  </Shell>
}

function PublicInfoPage({ type }) { if (type === 'companies') return <CompaniesPage />; if (type === 'guide') return <GuidePage />; if (type === 'contact') return <ContactPage />; if (type === 'terms') return <TermsPage />; return <InformationPage /> }
export default PublicInfoPage
