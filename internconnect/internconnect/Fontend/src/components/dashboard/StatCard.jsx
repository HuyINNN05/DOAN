function StatCard({ label, value, note, tone = 'blue' }) {
  return <article className="dashboard-stat-card"><div className={`dashboard-stat-icon ${tone}`}>◆</div><div><p>{label}</p><strong>{value}</strong><small>{note}</small></div></article>
}

export default StatCard
