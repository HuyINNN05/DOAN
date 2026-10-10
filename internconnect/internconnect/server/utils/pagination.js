export function pagination(query = {}) {
  const integer = (value, fallback, maximum) => Number.isFinite(Number(value)) ? Math.min(maximum, Math.max(1, Math.floor(Number(value) || fallback))) : fallback
  const limit = integer(query.limit, 20, 100)
  const page = integer(query.page, 1, 1000000)
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
