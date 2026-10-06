import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ApplicantTable from '../components/applications/ApplicantTable'
import PageShell, { LoadingMessage, PageHeader } from '../components/layout/PageShell'
import { useAuth } from '../context/AuthContext'
import {
  createResumeSignedUrl,
  listApplicationsForJob,
  updateApplicationStatus,
} from '../lib/applications'
import { getRecruiterJob } from '../lib/jobs'
import {
  fetchJobseekerProfile,
  fetchProfile,
  listWorkExperiences,
} from '../lib/profiles'

export default function RecruiterApplicantsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const ownedJob = await getRecruiterJob(id, user.id)
        if (cancelled) return
        if (!ownedJob) {
          setJob(null)
          setApplicants([])
          setError('Job not found, or you do not own this posting.')
          return
        }

        setJob(ownedJob)
        const applications = await listApplicationsForJob(id)
        const rows = await Promise.all(
          applications.map(async (application) => {
            const [profile, seekerProfile, experiences] = await Promise.all([
              fetchProfile(application.jobseeker_id),
              fetchJobseekerProfile(application.jobseeker_id),
              listWorkExperiences(application.jobseeker_id),
            ])
            return {
              application,
              profile,
              seekerProfile,
              experiences,
            }
          }),
        )
        if (!cancelled) setApplicants(rows)
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'Could not load applicants.')
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

  async function handleStatusChange(application, status) {
    setError('')
    try {
      const updated = await updateApplicationStatus(
        application.id,
        application.job_id,
        status,
      )
      if (!updated) {
        throw new Error('Could not update this application.')
      }
      setApplicants((current) =>
        current.map((row) =>
          row.application.id === application.id
            ? { ...row, application: updated }
            : row,
        ),
      )
    } catch (updateError) {
      setError(updateError.message || 'Could not update status.')
    }
  }

  async function handleViewResume(resumePath) {
    setError('')
    try {
      const url = await createResumeSignedUrl(resumePath)
      if (!url) {
        throw new Error('Could not open this resume.')
      }
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (resumeError) {
      setError(resumeError.message || 'Could not open this resume.')
    }
  }

  return (
    <PageShell>
      <p className="mb-4">
        <Link to="/recruiter/jobs" className="jb-link">
          Back to jobs
        </Link>
      </p>
      <PageHeader
        title="Applicants"
        subtitle={job ? `${job.title} at ${job.company}` : undefined}
      />

      {error ? <p className="jb-error mb-4">{error}</p> : null}
      {loading ? <LoadingMessage /> : null}
      {!loading && job ? (
        <ApplicantTable
          applicants={applicants}
          onStatusChange={handleStatusChange}
          onViewResume={handleViewResume}
        />
      ) : null}
    </PageShell>
  )
}
