import { useEffect, useState } from 'react'
import ApplicationList from '../components/applications/ApplicationList'
import PageShell, { LoadingMessage, PageHeader } from '../components/layout/PageShell'
import { useAuth } from '../context/AuthContext'
import { listJobseekerApplications } from '../lib/applications'

export default function ApplicationsPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const rows = await listJobseekerApplications(user.id)
        if (!cancelled) setApplications(rows)
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'Could not load your applications.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [user.id])

  return (
    <PageShell>
      <PageHeader
        title="Applications"
        subtitle="Track the status of roles you have applied to."
      />
      {error ? <p className="jb-error mb-4">{error}</p> : null}
      {loading ? (
        <LoadingMessage />
      ) : (
        <ApplicationList applications={applications} />
      )}
    </PageShell>
  )
}
