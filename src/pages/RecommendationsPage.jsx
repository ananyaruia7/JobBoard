import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import JobList from '../components/jobs/JobList'
import PageShell, { LoadingMessage, PageHeader } from '../components/layout/PageShell'
import { useAuth } from '../context/AuthContext'
import { listRecommendedJobs } from '../lib/recommendations'

export default function RecommendationsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [needsPreferences, setNeedsPreferences] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const result = await listRecommendedJobs(user.id)
        if (cancelled) return
        setNeedsPreferences(result.needsPreferences)
        setJobs(result.jobs)
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'Could not load recommendations.')
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
        title="Recommendations"
        subtitle="Roles matched to your saved preferences."
      />
      {error ? <p className="jb-error mb-4">{error}</p> : null}
      {loading ? <LoadingMessage /> : null}

      {!loading && needsPreferences ? (
        <div className="jb-card">
          <p className="text-slate-700">
            Complete your job preferences to see personalized recommendations.
          </p>
          <Link to="/profile" className="jb-btn-primary mt-4 inline-flex">
            Go to profile
          </Link>
        </div>
      ) : null}

      {!loading && !needsPreferences ? (
        <JobList
          jobs={jobs}
          emptyMessage="No jobs match your current preferences"
        />
      ) : null}
    </PageShell>
  )
}
