const REGISTRATION_KEY = 'internconnect_school_registrations'

function readRegistrations() {
  try {
    return JSON.parse(localStorage.getItem(REGISTRATION_KEY)) || []
  } catch {
    return []
  }
}

export function registerSchool(input) {
  const name = input.name?.trim()
  const schoolCode = input.schoolCode?.trim()
  const email = input.email?.trim().toLowerCase()
  if (!name || !schoolCode || !email) return { ok: false, error: 'Vui lòng điền tên trường, mã trường và email liên hệ.' }

  const registrations = readRegistrations()
  if (registrations.some((item) => item.schoolCode === schoolCode || item.email === email)) {
    return { ok: false, error: 'Mã trường hoặc email này đã gửi yêu cầu đăng ký.' }
  }

  const registration = {
    ...input,
    name,
    schoolCode,
    email,
    id: Date.now(),
    status: 'Chờ xác minh',
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(REGISTRATION_KEY, JSON.stringify([...registrations, registration]))
  return { ok: true, registration }
}