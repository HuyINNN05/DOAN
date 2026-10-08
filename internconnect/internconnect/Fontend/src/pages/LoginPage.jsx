import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { login } from '../services/mockAuth'

function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  })
  const [showRegisterPassword, setShowRegisterPassword] = useState({
    password: false,
    confirmPassword: false,
  })

  const handleLoginSubmit = (event) => {
    event.preventDefault()
    const session = login(email, password)
    if (!session) {
      setError('Email hoặc mật khẩu không đúng.')
      return
    }
    const returnUrl = params.get('returnUrl')
    navigate(
      session.role === 'student' && returnUrl?.startsWith('/') && !returnUrl.startsWith('//')
        ? returnUrl
        : `/${session.role}/dashboard`,
    )
  }

  const handleRegisterSubmit = (event) => {
    event.preventDefault()
    if (!registerForm.name.trim() || !registerForm.email.trim() || !registerForm.otp.trim()) {
      setError('Vui lòng điền đầy đủ thông tin đăng ký.')
      return
    }
    if (registerForm.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Xác nhận mật khẩu không khớp.')
      return
    }
    setError('')
    setMode('login')
    setEmail(registerForm.email)
    setPassword(registerForm.password)
  }

  const updateRegisterField = (field, value) => {
    setRegisterForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const inputClass = 'w-full rounded-xl border border-[#dfe6ef] bg-[#f7f9fc] px-4 py-3 text-[15px] text-[#172d50] outline-none transition duration-200 placeholder:text-[#a3b2c6] focus:border-[#f4a261] focus:bg-white focus:ring-2 focus:ring-[#f8d7bb]'

  return (
    <main className="min-h-screen bg-[#f3f7fb] px-4 py-6 sm:px-8 lg:px-10">
      <div className="relative mx-auto max-w-[1100px] rounded-[18px] border border-[#dbe7f3] bg-white shadow-[0_22px_60px_rgba(18,47,90,0.12)]">
        <button
          type="button"
          aria-label="Đóng"
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full text-[#2b4263] transition hover:bg-[#f3f7fb] hover:text-[#0a66c2]"
          onClick={() => navigate('/')}
        >
          <X size={22} strokeWidth={2.2} />
        </button>

        <div className="grid lg:grid-cols-[1.04fr_0.96fr]">
          <section className="relative hidden overflow-hidden bg-[#0757c9] p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link to="/" className="text-lg font-extrabold tracking-tight">INTERNCONNECT</Link>
              <div className="mt-24 max-w-md">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-100">
                  <Sparkles size={14} /> Kết nối đúng cơ hội
                </div>
                <h1 className="mt-5 text-5xl font-extrabold leading-[1.08] tracking-[-0.05em]">
                  Bắt đầu hành trình thực tập của bạn.
                </h1>
                <p className="mt-5 text-sm leading-6 text-blue-100">
                  Một không gian tập trung để sinh viên, doanh nghiệp và nhà trường cùng quản lý toàn bộ quá trình thực tập.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-blue-100">
              <ShieldCheck size={18} /> Nền tảng quản lý thực tập minh bạch và an toàn
            </div>
          </section>

          <section className="flex items-center justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
            <div className="w-full max-w-[560px]">
              {mode === 'register' ? (
                <form onSubmit={handleRegisterSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-[15px] font-bold text-[#1f2d3d]">
                      Họ và tên <span className="text-[#f15b5b]">*</span>
                    </label>
                    <input
                      className={`${inputClass} border-[#f4a261] bg-white focus:ring-[#f6d3b7]`}
                      type="text"
                      placeholder="Nhập họ và tên của bạn"
                      value={registerForm.name}
                      onChange={(event) => updateRegisterField('name', event.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[15px] font-bold text-[#1f2d3d]">
                      Email cá nhân <span className="text-[#f15b5b]">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a7b7c9]" size={18} />
                        <input
                          className={`${inputClass} pl-10`}
                          type="email"
                          placeholder="example@gmail.com"
                          value={registerForm.email}
                          onChange={(event) => updateRegisterField('email', event.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        className="h-[48px] rounded-xl bg-[#e7ebf1] px-5 text-[15px] font-semibold text-[#2f3f56] transition hover:bg-[#dfe5ee]"
                        onClick={() => setError('Mã OTP demo đã được gửi đến email của bạn.')}
                      >
                        Lấy OTP
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[15px] font-bold text-[#1f2d3d]">
                      Mã xác thực <span className="text-[#f15b5b]">*</span>
                    </label>
                    <input
                      className={inputClass}
                      type="text"
                      placeholder="Nhập mã 6 chữ số"
                      value={registerForm.otp}
                      onChange={(event) => updateRegisterField('otp', event.target.value)}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[15px] font-bold text-[#1f2d3d]">
                        Mật khẩu <span className="text-[#f15b5b]">*</span>
                      </label>
                      <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a7b7c9]" size={18} />
                        <input
                          className={`${inputClass} pl-10 pr-10`}
                          type={showRegisterPassword.password ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={registerForm.password}
                          onChange={(event) => updateRegisterField('password', event.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8ba0b5]"
                          onClick={() =>
                            setShowRegisterPassword((prev) => ({
                              ...prev,
                              password: !prev.password,
                            }))
                          }
                        >
                          {showRegisterPassword.password ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-[15px] font-bold text-[#1f2d3d]">
                        Xác nhận mật khẩu <span className="text-[#f15b5b]">*</span>
                      </label>
                      <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a7b7c9]" size={18} />
                        <input
                          className={`${inputClass} pl-10 pr-10`}
                          type={showRegisterPassword.confirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={registerForm.confirmPassword}
                          onChange={(event) => updateRegisterField('confirmPassword', event.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8ba0b5]"
                          onClick={() =>
                            setShowRegisterPassword((prev) => ({
                              ...prev,
                              confirmPassword: !prev.confirmPassword,
                            }))
                          }
                        >
                          {showRegisterPassword.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="mt-2 w-full rounded-xl bg-[#f0a044] py-4 text-center text-[18px] font-extrabold uppercase tracking-[0.02em] text-white shadow-[0_12px_20px_rgba(240,160,68,0.26)] transition hover:bg-[#df8b2d]"
                  >
                    Đăng ký tài khoản
                  </button>

                  <p className="pt-1 text-center text-[15px] font-medium text-[#253b59]">
                    Bạn đã có tài khoản?{' '}
                    <button type="button" className="font-bold text-[#0757c9] underline-offset-2 hover:underline" onClick={() => setMode('login')}>
                      Đăng nhập ngay
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="w-full max-w-md">
                  <div className="lg:hidden">
                    <Link to="/" className="text-lg font-extrabold text-[#0757c9]">INTERNCONNECT</Link>
                  </div>
                  <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-[#0a66c2]">Chào mừng trở lại</p>
                  <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#172d50]">Đăng nhập tài khoản</h1>
                  <p className="mt-2 text-sm leading-6 text-[#7890ad]">
                    Sinh viên sử dụng tài khoản do nhà trường cấp. Nếu chưa có tài khoản, vui lòng liên hệ phòng quản lý đào tạo.
                  </p>

                  <label className="mt-8 block text-sm font-bold text-[#2b4263]">
                    Email
                    <div className="mt-2 flex items-center rounded-md border border-[#d8e3f0] bg-white px-3">
                      <Mail size={17} className="text-[#8aa1bb]" />
                      <input
                        className="min-w-0 flex-1 px-3 py-3 text-sm font-normal outline-none"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setError('')
                        }}
                      />
                    </div>
                  </label>

                  <label className="mt-4 block text-sm font-bold text-[#2b4263]">
                    Mật khẩu
                    <div className="mt-2 flex items-center rounded-md border border-[#d8e3f0] bg-white px-3">
                      <LockKeyhole size={17} className="text-[#8aa1bb]" />
                      <input
                        className="min-w-0 flex-1 px-3 py-3 text-sm font-normal outline-none"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          setError('')
                        }}
                      />
                      <button type="button" className="text-[#8aa1bb]" onClick={() => setShowPassword((value) => !value)}>
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </label>

                  <div className="mt-3 flex justify-end">
                    <button type="button" className="text-xs font-bold text-[#0757c9] hover:underline" onClick={() => navigate('/forgot-password')}>
                      Quên mật khẩu?
                    </button>
                  </div>

                  {error && (
                    <p className="mt-4 rounded-md bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600">{error}</p>
                  )}

                  <button className="mt-6 w-full rounded-md bg-[#34204f] py-3.5 text-sm font-bold text-white shadow-[0_10px_20px_rgba(52,32,79,0.2)] transition hover:bg-[#4d4754]" type="submit">
                    Đăng nhập
                  </button>

                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default LoginPage
