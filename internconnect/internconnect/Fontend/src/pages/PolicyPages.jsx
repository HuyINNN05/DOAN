import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'

function Shell({ title, description, children }) { return <><Header /><main className="public-page min-h-screen bg-canvas"><section className="public-info-hero px-5 py-12"><div className="mx-auto max-w-6xl"><h1 className="text-4xl font-extrabold text-ink">{title}</h1><p className="mt-3 text-sm">{description}</p></div></section><div className="mx-auto max-w-6xl px-5 py-10">{children}</div></main><Footer /></> }
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
        <nav className="border-b border-line pb-6 lg:sticky lg:top-6 lg:border-b-0" aria-label={`Mục lục ${title.toLowerCase()}`}>
          <h2 className="mb-3 text-sm font-bold uppercase text-muted">Trong trang này</h2>
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {sections.map((section, index) => <li key={section.id}>
              <a className="flex min-h-11 items-start gap-2 rounded-md px-2 py-2 text-sm text-[#365579] transition hover:bg-[#eaf4ff] hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0757c9]" href={`#${section.id}`}>
                <span className="mt-0.5 w-5 shrink-0 font-semibold text-primary">{String(index + 1).padStart(2, '0')}</span>
                <span>{section.title}</span>
              </a>
            </li>)}
          </ol>
        </nav>

        <article className="min-w-0 divide-y divide-[#e4edf6] border-y border-line bg-white px-5 sm:px-8">
          {sections.map((section, index) => <section className="scroll-mt-6 py-7 sm:py-9" id={section.id} key={section.id}>
            <div className="flex items-start gap-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-[#eaf4ff] text-sm font-bold text-primary">{index + 1}</span>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-ink">{section.title}</h2>
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
          <p className="py-5 text-sm text-slate-500">Cần hỗ trợ? <a className="font-semibold text-primary underline underline-offset-4" href="mailto:support@internconnect.vn">Liên hệ InternConnect</a></p>
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


export { TermsPage, PrivacyPage }
