import JobCard from './JobCard'
import { EmptyState } from '../layout/PageShell'

export default function JobList({ jobs, emptyMessage = 'No jobs found' }) {
  if (jobs.length === 0) {
    return <EmptyState>{emptyMessage}</EmptyState>
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}
