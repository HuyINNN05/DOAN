import { useEffect, useEffectEvent, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Modal({ title, onClose, children }) {
  const dialog = useRef(null)
  const close = useEffectEvent(() => onClose())
  useEffect(() => {
    const previous = document.activeElement, overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.focus()
    function keydown(event) {
      if (event.key === 'Escape') close()
      if (event.key !== 'Tab') return
      const elements = [...dialog.current.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')].filter(x => !x.disabled && x.getClientRects().length)
      const first = elements[0], last = elements.at(-1)
      if (!first) { event.preventDefault(); return }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', keydown)
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keydown); previous?.focus() }
  }, [])
  return createPortal(<div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><section className="modal-panel" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={dialog}><div className="modal-heading"><h2>{title}</h2><button className="icon-button" aria-label="Đóng cửa sổ" onClick={onClose}><X size={20} /></button></div>{children}</section></div>, document.body)
}
