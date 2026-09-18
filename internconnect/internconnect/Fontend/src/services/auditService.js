const KEY = 'internconnect_audit_logs'
function read() { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }
export function getAuditLogs() { return read() }
export function addAuditLog(input) { const next = [{ ...input, id: Date.now(), createdAt: new Date().toISOString() }, ...read()]; localStorage.setItem(KEY, JSON.stringify(next)); return next }
