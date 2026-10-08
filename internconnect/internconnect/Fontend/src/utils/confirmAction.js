import Swal from 'sweetalert2'

export async function confirmAction({ title, text, confirmText = 'Xác nhận', danger = true }) {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Hủy',
    confirmButtonColor: danger ? '#dc2626' : '#0757c9',
    focusCancel: true,
    reverseButtons: true,
  })
  return result.isConfirmed
}
