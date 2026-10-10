import { Navigate, Outlet, useLocation } from 'react-router'
import { getSession } from '../../services/sessionService'

function ProtectedRoute({ role, children }) {
  const session = getSession()
  const location = useLocation()
  if (!session) return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`} replace />
  if (role && session.role !== role) return <Navigate to={`/${session.role}/dashboard`} replace />
  return children || <Outlet />
}

export default ProtectedRoute
