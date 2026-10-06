import { EXPERIENCE_LEVELS } from '../../lib/jobs'
import { formatExperienceLevel } from '../../lib/display'

export const emptyJobFilters = {
  keyword: '',
  minSalary: '',
  location: '',
  experienceLevel: '',
}

export default function JobFilters({ filters, onChange, onSubmit }) {
  function updateField(field, value) {
    onChange({ ...filters, [field]: value })
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit()
  }

  function handleClear() {
    onChange(emptyJobFilters)
    onSubmit(emptyJobFilters)
  }

  return (
    <form onSubmit={handleSubmit} className="jb-card mb-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="jb-label">
          Keyword
          <input
            type="text"
            value={filters.keyword}
            onChange={(event) => updateField('keyword', event.target.value)}
            placeholder="Title or company"
            className="jb-input"
          />
        </label>

        <label className="jb-label">
          Minimum salary
          <input
            type="number"
            min="0"
            step="1"
            value={filters.minSalary}
            onChange={(event) => updateField('minSalary', event.target.value)}
            className="jb-input"
          />
        </label>

        <label className="jb-label">
          Location
          <input
            type="text"
            value={filters.location}
            onChange={(event) => updateField('location', event.target.value)}
            className="jb-input"
          />
        </label>

        <label className="jb-label">
          Experience level
          <select
            value={filters.experienceLevel}
            onChange={(event) => updateField('experienceLevel', event.target.value)}
            className="jb-input"
          >
            <option value="">Any</option>
            {EXPERIENCE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {formatExperienceLevel(level)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="submit" className="jb-btn-primary">
          Filter
        </button>
        <button type="button" onClick={handleClear} className="jb-btn-secondary">
          Clear
        </button>
      </div>
    </form>
  )
}
