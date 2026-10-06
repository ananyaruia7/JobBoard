import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import RecruiterJobCard from '../components/jobs/RecruiterJobCard'
import PageShell, {
  EmptyState,
  LoadingMessage,
  PageHeader,
} from '../components/layout/PageShell'
import { useAuth } from '../context/AuthContext'
import { deleteJob, listRecruiterJobs } from '../lib/jobs'

export default function RecruiterJobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadJobs() {
      setLoading(true)
      setError('')
      try {
        const rows = await listRecruiterJobs(user.id)
        if (!cancelled) setJobs(rows)
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'Could not load jobs.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadJobs()

    return () => {
      cancelled = true
    }
  }, [user.id])

  async function handleDelete(job) {
    const confirmed = window.confirm(
      `Delete "${job.title}" at ${job.company}? This cannot be undone.`,
    )
    if (!confirmed) return

    try {
      await deleteJob(job.id, user.id)
      setJobs((current) => current.filter((row) => row.id !== job.id))
    } catch (deleteError) {
      setError(deleteError.message || 'Could not delete the job.')
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="My Jobs"
        subtitle="Create and manage your technical job postings."
        actions={
          <Link to="/recruiter/jobs/new" className="jb-btn-primary">
            Create job
          </Link>
        }
      />

      {error ? <p className="jb-error mb-4">{error}</p> : null}
      {loading ? <LoadingMessage>Loading jobs...</LoadingMessage> : null}
      {!loading && jobs.length === 0 ? (
        <EmptyState>You haven’t posted any jobs yet.</EmptyState>
      ) : null}

      <div className="space-y-4">
        {jobs.map((job) => (
          <RecruiterJobCard key={job.id} job={job} onDelete={handleDelete} />
        ))}
      </div>
    </PageShell>
  )
}
