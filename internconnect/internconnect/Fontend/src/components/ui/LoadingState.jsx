function LoadingState({ label = 'Đang tải dữ liệu...' }) {
  return <div className="state-card"><span className="loading-dot" />{label}</div>
}

export default LoadingState
