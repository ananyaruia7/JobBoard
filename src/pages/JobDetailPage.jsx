import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import StatusBadge from '../components/applications/StatusBadge'
import PageShell, {
  EmptyState,
  LoadingMessage,
} from '../components/layout/PageShell'
import ExperienceBadge from '../components/ui/ExperienceBadge'
import { useAuth } from '../context/AuthContext'
import {
  applyToJob,
  getApplicationForJob,
  isDuplicateApplicationError,
} from '../lib/applications'
import { getJob } from '../lib/jobs'
import { formatSalary } from '../lib/display'

export default function JobDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [application, setApplication] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      setMessage('')
      try {
        const [jobRow, application] = await Promise.all([
          getJob(id),
          getApplicationForJob(id, user.id),
        ])
        if (cancelled) return
        setJob(jobRow)
        setApplication(application)
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'Could not load this job.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [id, user.id])

  async function handleApply() {
    setError('')
    setMessage('')
    setApplying(true)
    try {
      const created = await applyToJob(id, user.id)
      setApplication(created)
      setMessage('Application submitted.')
    } catch (applyError) {
      if (isDuplicateApplicationError(applyError)) {
        const existing = await getApplicationForJob(id, user.id)
        setApplication(existing)
        setMessage('You have already applied to this job.')
      } else {
        setError(applyError.message || 'Could not submit the application.')
      }
    } finally {
      setApplying(false)
    }
  }

  return (
    <PageShell>
      <p className="mb-4">
        <Link to="/jobs" className="jb-link">
          Back to jobs
        </Link>
      </p>

      {loading ? <LoadingMessage /> : null}
      {error ? <p className="jb-error mb-4">{error}</p> : null}

      {!loading && !job ? (
        <EmptyState>This job was not found.</EmptyState>
      ) : null}

      {!loading && job ? (
        <article className="jb-card">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {job.title}
          </h1>
          <p className="mt-1 text-base font-medium text-slate-700">{job.company}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
            <span>{job.location}</span>
            <span>{formatSalary(job.salary)}</span>
            <ExperienceBadge level={job.experience_level} />
          </div>
          <p className="mt-6 whitespace-pre-wrap text-slate-700 leading-relaxed">
            {job.description}
          </p>

          {message ? <p className="jb-success mt-6">{message}</p> : null}

          {application ? (
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="font-medium text-slate-900">Already applied</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                Application status: <StatusBadge status={application.status} />
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleApply}
              disabled={applying}
              className="jb-btn-primary mt-6"
            >
              {applying ? 'Applying...' : 'Apply'}
            </button>
          )}
        </article>
      ) : null}
    </PageShell>
  )
}
