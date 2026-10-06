import { Link } from 'react-router-dom'
import PageShell, { PageHeader } from '../components/layout/PageShell'
import { useAuth } from '../context/AuthContext'
import { homePathForRole } from '../lib/profiles'

export default function UnauthorizedPage() {
  const { user, role } = useAuth()
  const homePath = user ? homePathForRole(role) : '/login'

  return (
    <PageShell withNav={Boolean(user)}>
      <div className="mx-auto max-w-lg">
        <PageHeader title="Unauthorized" />
        <div className="jb-card">
          <p className="text-slate-600">
            You do not have access to that page for your account role.
          </p>
          <Link to={homePath} className="jb-btn-primary mt-5 inline-flex">
            Go back
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
