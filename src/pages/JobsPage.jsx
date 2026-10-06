import { useEffect, useState } from 'react'
import JobFilters, { emptyJobFilters } from '../components/jobs/JobFilters'
import JobList from '../components/jobs/JobList'
import PageShell, { LoadingMessage, PageHeader } from '../components/layout/PageShell'
import { listJobs } from '../lib/jobs'

export default function JobsPage() {
  const [filters, setFilters] = useState(emptyJobFilters)
  const [jobs, setJobs] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadJobs(nextFilters = filters) {
    setLoading(true)
    setError('')
    try {
      const rows = await listJobs(nextFilters)
      setJobs(rows)
    } catch (loadError) {
      setError(loadError.message || 'Could not load jobs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function loadInitialJobs() {
      setLoading(true)
      setError('')
      try {
        const rows = await listJobs(emptyJobFilters)
        if (!cancelled) setJobs(rows)
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'Could not load jobs.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadInitialJobs()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <PageShell>
      <PageHeader
        title="Jobs"
        subtitle="Browse technical roles and apply in a few clicks."
      />
      <JobFilters
        filters={filters}
        onChange={setFilters}
        onSubmit={(override) => loadJobs(override ?? filters)}
      />
      {error ? <p className="jb-error mb-4">{error}</p> : null}
      {loading ? <LoadingMessage>Loading jobs...</LoadingMessage> : <JobList jobs={jobs} />}
    </PageShell>
  )
}
