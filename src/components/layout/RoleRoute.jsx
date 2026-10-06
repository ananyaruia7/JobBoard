import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function LoadingState() {
  return (
    <div className="jb-page">
      <p className="jb-container py-10 text-sm text-slate-500">Loading...</p>
    </div>
  )
}

export default function RoleRoute({ role }) {
  const { user, loading, role: currentRole } = useAuth()

  if (loading || (user && !currentRole)) {
    return <LoadingState />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (currentRole !== role) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
