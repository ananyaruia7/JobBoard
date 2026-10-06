import { EmptyState } from '../layout/PageShell'

function formatRange(value) {
  if (!value) return 'Present'
  return value
}

export default function ExperienceList({ experiences, onEdit, onDelete }) {
  if (experiences.length === 0) {
    return <EmptyState>No work experience added yet.</EmptyState>
  }

  return (
    <div className="space-y-3">
      {experiences.map((experience) => (
        <article key={experience.id} className="jb-card">
          <h3 className="font-semibold text-slate-900">{experience.title}</h3>
          <p className="text-sm text-slate-700">{experience.company}</p>
          <p className="mt-1 text-sm text-slate-500">
            {formatRange(experience.start_date)} – {formatRange(experience.end_date)}
          </p>
          {experience.description ? (
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
              {experience.description}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onEdit(experience)}
              className="jb-btn-secondary py-1.5"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(experience)}
              className="jb-btn-danger py-1.5"
            >
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
