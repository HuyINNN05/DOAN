import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Router from './router/index.jsx'

class AppErrorBoundary extends React.Component {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) return <main className="grid min-h-screen place-items-center bg-[#f4f8fd] p-6"><section className="max-w-md rounded-xl border border-[#dce9f7] bg-white p-8 text-center shadow-sm"><h1 className="text-xl font-extrabold text-[#173b83]">Có lỗi xảy ra</h1><p className="mt-2 text-sm text-[#7890ad]">Trang gặp lỗi tạm thời. Hãy tải lại để tiếp tục.</p><button className="mt-5 rounded-md bg-[#0757c9] px-5 py-3 text-sm font-bold text-white" type="button" onClick={() => window.location.reload()}>Tải lại trang</button></section></main>
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary><Router /></AppErrorBoundary>
  </StrictMode>,
)
