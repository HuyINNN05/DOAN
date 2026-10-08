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
function PolicyPage({ title, description, summary, sections }) {
  return <Shell title={title} description={description}>
    <div className="mx-auto max-w-6xl">
      <section className="mb-8 grid gap-4 border-l-4 border-[#f0a044] bg-[#fff8ef] p-5 sm:grid-cols-[auto_1fr] sm:items-center sm:p-6" aria-label="Tóm tắt chính sách">
        <span className="grid size-11 place-items-center rounded-full bg-white text-lg font-bold text-[#b45b16]" aria-hidden="true">!</span>
        <div>
          <h2 className="font-bold text-[#713f18]">Tóm tắt dành cho bạn</h2>
          <p className="mt-1 text-sm leading-6 text-[#6f5847]">{summary}</p>
        </div>
      </section>

      <div className="grid items-start gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
        <nav className="border-b border-[#dce9f7] pb-6 lg:sticky lg:top-6 lg:border-b-0" aria-label={`Mục lục ${title.toLowerCase()}`}>
          <h2 className="mb-3 text-sm font-bold uppercase text-[#6684a8]">Trong trang này</h2>
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {sections.map((section, index) => <li key={section.id}>
              <a className="flex min-h-11 items-start gap-2 rounded-md px-2 py-2 text-sm text-[#365579] transition hover:bg-[#eaf4ff] hover:text-[#0757c9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0757c9]" href={`#${section.id}`}>
                <span className="mt-0.5 w-5 shrink-0 font-semibold text-[#0a66c2]">{String(index + 1).padStart(2, '0')}</span>
                <span>{section.title}</span>
              </a>
            </li>)}
          </ol>
        </nav>

        <article className="min-w-0 divide-y divide-[#e4edf6] border-y border-[#dce9f7] bg-white px-5 sm:px-8">
          {sections.map((section, index) => <section className="scroll-mt-6 py-7 sm:py-9" id={section.id} key={section.id}>
            <div className="flex items-start gap-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-[#eaf4ff] text-sm font-bold text-[#0757c9]">{index + 1}</span>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-[#123a8b]">{section.title}</h2>
                <p className="mt-2 text-sm font-medium leading-6 text-[#496886]">{section.summary}</p>
                {section.details?.map((detail) => <p className="mt-3 text-sm leading-7 text-slate-600" key={detail}>{detail}</p>)}
                {section.bullets && <ul className="mt-3 space-y-3">
                  {section.bullets.map((item) => <li className="flex gap-3 text-sm leading-7 text-slate-600" key={item}>
                    <span className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-[#f0a044]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>)}
                </ul>}
              </div>
            </div>
          </section>)}
          <p className="py-5 text-sm text-slate-500">Cần hỗ trợ? <a className="font-semibold text-[#0757c9] underline underline-offset-4" href="mailto:support@internconnect.vn">Liên hệ InternConnect</a></p>
        </article>
      </div>
    </div>
  </Shell>
}

function TermsPage() {
  const sections = [
    {
      id: 'pham-vi',
      title: 'Phạm vi và chấp thuận',
      summary: 'Điều khoản áp dụng cho mọi người dùng khi truy cập hoặc sử dụng các tính năng InternConnect.',
      details: [
        'InternConnect kết nối sinh viên, doanh nghiệp và nhà trường trong các hoạt động tìm kiếm cơ hội, ứng tuyển, tuyển chọn và theo dõi thực tập.',
        'Khi tạo tài khoản hoặc tiếp tục sử dụng nền tảng, bạn xác nhận đã đọc và đồng ý với các điều khoản này. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.',
      ],
    },
    {
      id: 'tai-khoan',
      title: 'Tài khoản và bảo mật',
      summary: 'Mỗi người dùng có trách nhiệm giữ thông tin tài khoản chính xác và an toàn.',
      bullets: [
        'Cung cấp thông tin trung thực, cập nhật khi có thay đổi và không mạo danh cá nhân hoặc tổ chức khác.',
        'Không chia sẻ mật khẩu hoặc để người khác sử dụng tài khoản của bạn. Bạn chịu trách nhiệm với hoạt động thực hiện qua tài khoản, trừ khi đã báo cáo việc truy cập trái phép.',
        'Thông báo cho nhà trường hoặc bộ phận hỗ trợ nếu nghi ngờ tài khoản bị lộ, bị sử dụng trái phép hoặc có thông tin không chính xác.',
      ],
    },
    {
      id: 'trach-nhiem',
      title: 'Trách nhiệm theo vai trò',
      summary: 'Mỗi bên sử dụng nền tảng đúng với vai trò và quy trình được phân quyền.',
      bullets: [
        'Sinh viên: duy trì hồ sơ chính xác, chỉ ứng tuyển vào vị trí phù hợp và cập nhật tiến độ, nhật ký, báo cáo theo hướng dẫn của nhà trường.',
        'Doanh nghiệp: cung cấp thông tin tuyển dụng rõ ràng, cập nhật tình trạng hồ sơ và chỉ sử dụng thông tin ứng viên cho mục đích tuyển dụng, thực tập liên quan.',
        'Nhà trường và giảng viên: xử lý hồ sơ, xác nhận và đánh giá trong phạm vi nhiệm vụ được giao; bảo vệ thông tin mà mình được quyền truy cập.',
      ],
    },
    {
      id: 'noi-dung',
      title: 'Nội dung và thông tin đăng tải',
      summary: 'Người gửi hoặc đăng tải nội dung chịu trách nhiệm về tính chính xác và quyền sử dụng nội dung đó.',
      bullets: [
        'Không đăng thông tin sai lệch, gây nhầm lẫn, vi phạm quyền riêng tư hoặc quyền sở hữu của người khác.',
        'Không đăng nội dung trái pháp luật, xúc phạm, quấy rối, phân biệt đối xử hoặc gây mất an toàn cho người dùng.',
        'InternConnect có thể rà soát, tạm ẩn hoặc gỡ nội dung có dấu hiệu vi phạm điều khoản hoặc ảnh hưởng đến an toàn của nền tảng.',
      ],
    },
    {
      id: 'su-dung-hop-le',
      title: 'Sử dụng nền tảng hợp lệ',
      summary: 'Chỉ sử dụng dịch vụ cho mục đích học tập, thực tập và tuyển dụng hợp pháp.',
      bullets: [
        'Không truy cập trái phép vào tài khoản, dữ liệu hoặc khu vực quản trị của người khác.',
        'Không phát tán mã độc, gây quá tải, can thiệp hoặc tìm cách làm gián đoạn hệ thống.',
        'Không thu thập, sao chép hay chia sẻ dữ liệu người dùng ngoài phạm vi cần thiết và được cho phép.',
      ],
    },
    {
      id: 'quy-trinh',
      title: 'Quy trình thực tập và giới hạn dịch vụ',
      summary: 'Nền tảng hỗ trợ kết nối và theo dõi quy trình; kết quả tuyển chọn và phê duyệt do các bên có thẩm quyền quyết định.',
      details: [
        'Việc hiển thị tin tuyển dụng hoặc gửi hồ sơ không bảo đảm sinh viên sẽ được mời phỏng vấn, tuyển chọn hay nhận vị trí thực tập.',
        'Nhà trường, doanh nghiệp và sinh viên chịu trách nhiệm về quyết định thuộc phạm vi của mình. InternConnect có thể tạm ngừng một số tính năng để bảo trì, bảo đảm an toàn hoặc xử lý sự cố; khi có thể, nền tảng sẽ thông báo trước.',
      ],
    },
    {
      id: 'cap-nhat',
      title: 'Cập nhật điều khoản và liên hệ',
      summary: 'Điều khoản có thể được cập nhật khi quy trình hoặc dịch vụ thay đổi.',
      details: [
        'Phiên bản hiện hành được đăng tại trang này. Việc tiếp tục sử dụng nền tảng sau khi nội dung được cập nhật đồng nghĩa bạn chấp thuận phiên bản mới.',
        'Nếu cần hỗ trợ, muốn báo cáo nội dung hoặc nghi ngờ sự cố tài khoản, hãy liên hệ support@internconnect.vn.',
      ],
    },
  ]

  return <PolicyPage
    title="Điều khoản sử dụng"
    description="Các điều kiện áp dụng khi sử dụng nền tảng InternConnect."
    summary="Cung cấp thông tin chính xác, bảo vệ tài khoản và sử dụng dữ liệu đúng mục đích. Các mục bên dưới giải thích đầy đủ trách nhiệm của từng vai trò."
    sections={sections}
  />
}

function PrivacyPage() {
  const sections = [
    {
      id: 'du-lieu-thu-thap',
      title: 'Thông tin được cung cấp',
      summary: 'Thông tin phụ thuộc vào vai trò và các tính năng bạn sử dụng trên InternConnect.',
      bullets: [
        'Thông tin tài khoản và liên hệ như họ tên, email, đơn vị và vai trò.',
        'Thông tin hồ sơ sinh viên, CV, kỹ năng, hồ sơ doanh nghiệp và nội dung tin tuyển dụng do người dùng nhập.',
        'Thông tin phát sinh trong quy trình như đơn ứng tuyển, lịch phỏng vấn, hồ sơ thực tập, nhật ký, báo cáo và nhận xét đánh giá.',
      ],
    },
    {
      id: 'muc-dich',
      title: 'Mục đích sử dụng',
      summary: 'Dữ liệu được dùng để vận hành các chức năng kết nối, tuyển dụng và theo dõi thực tập.',
      bullets: [
        'Tạo và quản lý tài khoản, xác định quyền truy cập phù hợp với vai trò.',
        'Chuyển hồ sơ ứng tuyển đến doanh nghiệp và hỗ trợ các bên theo dõi trạng thái tuyển chọn.',
        'Hỗ trợ nhà trường, giảng viên và sinh viên quản lý tiến độ, nhật ký, báo cáo và đánh giá thực tập.',
        'Phản hồi yêu cầu hỗ trợ, xử lý sự cố và bảo vệ tính an toàn, toàn vẹn của nền tảng.',
      ],
    },
    {
      id: 'chia-se',
      title: 'Truy cập và chia sẻ thông tin',
      summary: 'Thông tin chỉ nên được hiển thị cho những bên cần thiết để thực hiện quy trình tương ứng.',
      details: [
        'Hồ sơ ứng tuyển được chia sẻ với doanh nghiệp mà sinh viên ứng tuyển. Thông tin tiến độ thực tập có thể được cung cấp cho nhà trường, giảng viên hướng dẫn và doanh nghiệp liên quan.',
        'Người dùng chỉ được truy cập thông tin phù hợp với nhiệm vụ và quyền hạn của mình. InternConnect không chủ đích công khai hồ sơ cá nhân cho người dùng không liên quan đến quy trình.',
      ],
    },
    {
      id: 'luu-tru',
      title: 'Lưu trữ và bảo vệ dữ liệu',
      summary: 'Người dùng cần bảo vệ tài khoản; nền tảng áp dụng phân quyền theo vai trò để giới hạn quyền truy cập.',
      details: [
        'Trong một số môi trường demo, phiên đăng nhập hoặc dữ liệu làm việc có thể được lưu trong bộ nhớ trình duyệt. Hãy đăng xuất và không lưu mật khẩu khi sử dụng thiết bị dùng chung.',
        'Không có phương thức truyền hoặc lưu trữ dữ liệu nào an toàn tuyệt đối. Nếu phát hiện tài khoản hoặc thông tin có dấu hiệu bị truy cập trái phép, hãy báo ngay cho nhà trường hoặc bộ phận hỗ trợ.',
      ],
    },
    {
      id: 'thoi-han',
      title: 'Thời hạn lưu giữ',
      summary: 'Dữ liệu được lưu trong thời gian cần thiết cho hoạt động của tài khoản và quy trình thực tập.',
      details: [
        'Một số hồ sơ có thể cần được lưu để nhà trường quản lý kết quả học tập, đối chiếu quy trình hoặc đáp ứng nghĩa vụ lưu trữ áp dụng. Thời hạn cụ thể phụ thuộc vào quy định của đơn vị vận hành và yêu cầu pháp luật liên quan.',
        'Khi không còn mục đích sử dụng, dữ liệu sẽ được xem xét xóa, ẩn danh hoặc xử lý theo quy trình của đơn vị vận hành.',
      ],
    },
    {
      id: 'quyen-nguoi-dung',
      title: 'Quyền và yêu cầu của bạn',
      summary: 'Bạn có thể đề nghị xem lại hoặc cập nhật thông tin của mình.',
      bullets: [
        'Kiểm tra và cập nhật thông tin hồ sơ trong tài khoản khi tính năng tương ứng được cung cấp.',
        'Gửi yêu cầu chỉnh sửa, hạn chế sử dụng hoặc xóa dữ liệu qua nhà trường hoặc địa chỉ hỗ trợ.',
        'Một số dữ liệu có thể cần được giữ lại để hoàn tất quy trình thực tập hoặc đáp ứng nghĩa vụ lưu trữ; bộ phận phụ trách sẽ phản hồi theo từng trường hợp.',
      ],
    },
    {
      id: 'cap-nhat-bao-mat',
      title: 'Cập nhật chính sách và liên hệ',
      summary: 'Chính sách có thể thay đổi khi tính năng, quy trình hoặc yêu cầu áp dụng thay đổi.',
      details: [
        'Phiên bản hiện hành được đăng tại trang này. Vui lòng xem lại nội dung khi tiếp tục sử dụng nền tảng sau các lần cập nhật.',
        'Để gửi yêu cầu liên quan đến thông tin cá nhân hoặc báo cáo sự cố bảo mật, liên hệ support@internconnect.vn.',
      ],
    },
  ]

  return <PolicyPage
    title="Chính sách bảo mật"
    description="Cách InternConnect sử dụng, chia sẻ và bảo vệ thông tin trong quá trình thực tập."
    summary="Chúng tôi chỉ sử dụng thông tin cần thiết để vận hành tài khoản và phối hợp quy trình thực tập. Bạn có thể yêu cầu kiểm tra hoặc cập nhật dữ liệu của mình."
    sections={sections}
  />
}

function PublicInfoPage({ type }) { if (type === 'companies') return <CompaniesPage />; if (type === 'guide') return <GuidePage />; if (type === 'contact') return <ContactPage />; if (type === 'terms') return <TermsPage />; if (type === 'privacy') return <PrivacyPage />; return <InformationPage /> }
export default PublicInfoPage
