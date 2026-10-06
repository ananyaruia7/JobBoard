import { APPLICATION_STATUSES } from '../../lib/applications'
import { formatDate, formatStatusLabel } from '../../lib/display'
import ExperienceBadge from '../ui/ExperienceBadge'
import { EmptyState } from '../layout/PageShell'
import StatusBadge from './StatusBadge'

export default function ApplicantTable({
  applicants,
  onStatusChange,
  onViewResume,
}) {
  if (applicants.length === 0) {
    return <EmptyState>No applicants yet</EmptyState>
  }

  return (
    <div className="space-y-4">
      {applicants.map((applicant) => (
        <article key={applicant.application.id} className="jb-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {applicant.profile?.full_name || 'Unknown applicant'}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {applicant.seekerProfile?.headline || 'No headline'}
              </p>
            </div>
            <StatusBadge status={applicant.application.status} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
            <span>{applicant.seekerProfile?.location || '—'}</span>
            <ExperienceBadge level={applicant.seekerProfile?.experience_level} />
            <span className="text-xs text-slate-500">
              Applied {formatDate(applicant.application.created_at)}
            </span>
          </div>

          <h3 className="mt-5 text-sm font-semibold text-slate-900">
            Work experience
          </h3>
          {applicant.experiences.length === 0 ? (
            <p className="mt-1 text-sm text-slate-500">No work experience listed.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              {applicant.experiences.map((experience) => (
                <li key={experience.id}>
                  {experience.title} at {experience.company} (
                  {experience.start_date} – {experience.end_date || 'Present'})
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <label className="jb-label min-w-48">
              Update status
              <select
                value={applicant.application.status}
                onChange={(event) =>
                  onStatusChange(applicant.application, event.target.value)
                }
                className="jb-input"
              >
                {APPLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatStatusLabel(status)}
                  </option>
                ))}
              </select>
            </label>

            {applicant.seekerProfile?.resume_path ? (
              <button
                type="button"
                onClick={() => onViewResume(applicant.seekerProfile.resume_path)}
                className="jb-btn-secondary"
              >
                View resume
              </button>
            ) : (
              <span className="pb-2 text-sm text-slate-500">No resume uploaded</span>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
