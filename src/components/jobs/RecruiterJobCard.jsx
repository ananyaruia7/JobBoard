import { Link } from 'react-router-dom'
import { formatDate, formatSalary } from '../../lib/display'
import ExperienceBadge from '../ui/ExperienceBadge'

export default function RecruiterJobCard({ job, onDelete }) {
  return (
    <article className="jb-card-hover">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{job.title}</h2>
          <p className="mt-1 text-sm font-medium text-slate-700">{job.company}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
            <span>{job.location}</span>
            <span>{formatSalary(job.salary)}</span>
            <ExperienceBadge level={job.experience_level} />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Posted {formatDate(job.created_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/recruiter/jobs/${job.id}/applicants`}
            className="jb-btn-primary py-2"
          >
            View Applicants
          </Link>
          <Link
            to={`/recruiter/jobs/${job.id}/edit`}
            className="jb-btn-secondary py-2"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => onDelete(job)}
            className="jb-btn-danger py-2"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}
