import { Globe2, Mail, MessageCircle, Send } from 'lucide-react'
import { Link } from 'react-router'

function Footer() {
  return <footer className="public-footer"><div className="public-footer-main"><Link to="/" className="public-footer-brand"><span className="public-footer-mark">◆</span><span><b>INTERNCONNECT</b><small>Nền tảng kết nối thực tập giữa sinh viên, nhà trường và doanh nghiệp.</small></span></Link><div className="public-footer-social"><a href="https://facebook.com" aria-label="Facebook"><Globe2 size={13} /></a><a href="https://linkedin.com" aria-label="LinkedIn"><MessageCircle size={13} /></a><a href="https://youtube.com" aria-label="Youtube"><Send size={13} /></a><a href="mailto:support@internconnect.vn" aria-label="Email"><Mail size={13} /></a></div><div className="public-footer-meta"><div><Link to="/information">Điều khoản sử dụng</Link><i /> <Link to="/information">Chính sách bảo mật</Link></div><small>© 2025 InternConnect. All rights reserved.</small></div></div></footer>
}

export default Footer
