import { Link } from 'react-router-dom'
import { formatDate, formatSalary } from '../../lib/display'
import ExperienceBadge from '../ui/ExperienceBadge'
import { EmptyState } from '../layout/PageShell'
import StatusBadge from './StatusBadge'

export default function ApplicationList({ applications }) {
  if (applications.length === 0) {
    return <EmptyState>You haven’t applied to any jobs yet.</EmptyState>
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => {
        const job = application.jobs
        return (
          <article key={application.id} className="jb-card-hover">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {job?.title || 'Job posting'}
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {job?.company}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                  <span>{job?.location}</span>
                  <span>{formatSalary(job?.salary)}</span>
                  <ExperienceBadge level={job?.experience_level} />
                  <StatusBadge status={application.status} />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Applied {formatDate(application.created_at)}
                </p>
              </div>
              <Link
                to={`/jobs/${application.job_id}`}
                className="jb-btn-primary shrink-0 self-start"
              >
                View Job
              </Link>
            </div>
          </article>
        )
      })}
    </div>
  )
}
