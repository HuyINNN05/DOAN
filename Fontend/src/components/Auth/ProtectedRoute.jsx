import { Navigate, Outlet } from 'react-router'
import { getSession } from '../../services/mockAuth'

function ProtectedRoute({ role }) {
  const session = getSession()
  if (!session) return <Navigate to="/login" replace />
  if (role && session.role !== role) return <Navigate to={`/${session.role}/dashboard`} replace />
  return <Outlet />
}

export default ProtectedRoute
