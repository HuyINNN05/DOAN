import Swal from 'sweetalert2'

export async function confirmAction({ title, text, confirmText = 'Xác nhận', danger = true }) {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Hủy',
    confirmButtonColor: danger ? '#a33333' : '#0d766e',
    focusCancel: true,
    reverseButtons: true,
  })
  return result.isConfirmed
}
