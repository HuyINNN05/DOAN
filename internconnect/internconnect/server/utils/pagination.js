export function pagination(query = {}) {
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const page = Math.max(Number(query.page) || 1, 1)
  return { page, limit, offset: (page - 1) * limit }
}
export function sortClause(value, allowed, fallback) {
  const descending = String(value || '').startsWith('-')
  const key = descending ? String(value).slice(1) : String(value || '')
  return `${allowed[key] || allowed[fallback]} ${descending || !value ? 'DESC' : 'ASC'}`
}
export function pageResult(items, total, page) {
  return { items, total: Number(total), page: page.page, limit: page.limit, pages: Math.ceil(Number(total) / page.limit) }
}
