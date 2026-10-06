import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import JobForm from '../components/jobs/JobForm'
import PageShell, { LoadingMessage, PageHeader } from '../components/layout/PageShell'
import { useAuth } from '../context/AuthContext'
import { createJob, getRecruiterJob, updateJob } from '../lib/jobs'

export default function RecruiterJobFormPage() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(isEditing)

  useEffect(() => {
    if (!isEditing) return undefined

    let cancelled = false

    async function loadJob() {
      setLoading(true)
      setError('')
      try {
        const row = await getRecruiterJob(id, user.id)
        if (cancelled) return
        if (!row) {
          setError('Job not found, or you do not own this posting.')
          setJob(null)
        } else {
          setJob(row)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'Could not load this job.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadJob()

    return () => {
      cancelled = true
    }
  }, [id, isEditing, user.id])

  async function handleSubmit(values) {
    if (isEditing) {
      const updated = await updateJob(id, user.id, values)
      if (!updated) {
        throw new Error('Job not found, or you do not own this posting.')
      }
    } else {
      await createJob(user.id, values)
    }
    navigate('/recruiter/jobs', { replace: true })
  }

  return (
    <PageShell>
      <p className="mb-4">
        <Link to="/recruiter/jobs" className="jb-link">
          Back to jobs
        </Link>
      </p>
      <PageHeader title={isEditing ? 'Edit job' : 'Create job'} />

      {error ? <p className="jb-error mb-4">{error}</p> : null}
      {loading ? <LoadingMessage /> : null}

      {!isEditing && !loading ? (
        <div className="jb-card">
          <JobForm submitLabel="Create job" onSubmit={handleSubmit} />
        </div>
      ) : null}

      {isEditing && !loading && job ? (
        <div className="jb-card">
          <JobForm
            key={job.id}
            initialValues={job}
            submitLabel="Save changes"
            onSubmit={handleSubmit}
          />
        </div>
      ) : null}
    </PageShell>
  )
}
