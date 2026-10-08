import { Navigate, Outlet } from 'react-router'
import { getSession } from '../../services/sessionService'

function ProtectedRoute({ role, children }) {
  const session = getSession()
  if (!session) return <Navigate to="/login" replace />
  if (role && session.role !== role) return <Navigate to={`/${session.role}/dashboard`} replace />
  return children || <Outlet />
}

export default ProtectedRoute
