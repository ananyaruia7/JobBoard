import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function LoadingState() {
  return (
    <div className="jb-page">
      <p className="jb-container py-10 text-sm text-slate-500">Loading...</p>
    </div>
  )
}

export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingState />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
