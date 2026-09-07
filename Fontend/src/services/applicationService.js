import defaultApplications from '../data/applications.json'
const KEY = 'internconnect_applications'
const TRANSITIONS = { '04': ['05'], '05': ['06', '08'], '06': ['07'], '07': ['08', '09'], '09': ['10'], '10': ['11'], '11': ['12'], '12': ['13'], '13': ['14'], '14': ['15'] }
function read() { try { return JSON.parse(localStorage.getItem(KEY)) || defaultApplications } catch { return defaultApplications } }
export function getAllApplications() { return read() }
export function canTransition(from, to) { return (TRANSITIONS[from] || []).includes(to) }
export function updateApplication(id, patch) { const current = read(); const target = current.find((item) => item.id === id); if (!target) return current; if (patch.status && !canTransition(target.status, patch.status)) return current; const next = current.map((item) => { if (item.id !== id) return item; const history = patch.status ? [...new Set([...(item.statusHistory || []), patch.status])] : item.statusHistory || []; return { ...item, ...patch, statusHistory: history } }); localStorage.setItem(KEY, JSON.stringify(next)); return next }
