function ConfirmDialog({ open, title, message, confirmLabel = 'Xác nhận', onConfirm, onClose }) {
  if (!open) return null
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#092b58]/45 p-5" role="presentation"><div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true"><h2 className="text-lg font-extrabold text-[#173b83]">{title}</h2><p className="mt-2 text-sm leading-6 text-[#7890ad]">{message}</p><div className="mt-6 flex justify-end gap-2"><button className="rounded-md border border-[#d8e3f0] px-4 py-2 text-sm font-semibold text-[#526f94]" type="button" onClick={onClose}>Hủy</button><button className="rounded-md bg-[#0757c9] px-4 py-2 text-sm font-bold text-white" type="button" onClick={onConfirm}>{confirmLabel}</button></div></div></div>
}

export default ConfirmDialog
