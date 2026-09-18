const VERSION = '2'
const VERSION_KEY = 'internconnect_demo_version'
export function resetDemo() {
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index)
    if (key?.startsWith('internconnect_')) localStorage.removeItem(key)
  }
  localStorage.setItem(VERSION_KEY, VERSION)
}
export function initializeDemo() {
  if (!localStorage.getItem(VERSION_KEY)) localStorage.setItem(VERSION_KEY, VERSION)
}
