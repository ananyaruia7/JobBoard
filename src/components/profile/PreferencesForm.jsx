import { useState } from 'react'
import { EXPERIENCE_LEVELS, isValidExperienceLevel } from '../../lib/jobs'
import { formatExperienceLevel } from '../../lib/display'

export default function PreferencesForm({ initialValues, onSubmit }) {
  const [preferredLocation, setPreferredLocation] = useState(
    initialValues.preferredLocation ?? '',
  )
  const [minSalary, setMinSalary] = useState(
    initialValues.minSalary === 0 || initialValues.minSalary
      ? String(initialValues.minSalary)
      : '',
  )
  const [experienceLevel, setExperienceLevel] = useState(
    isValidExperienceLevel(initialValues.experienceLevel)
      ? initialValues.experienceLevel
      : '',
  )
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    let salaryValue = null
    if (minSalary !== '') {
      const salaryNumber = Number(minSalary)
      if (!Number.isInteger(salaryNumber) || salaryNumber < 0) {
        setError('Minimum salary must be a whole number of 0 or more.')
        return
      }
      salaryValue = salaryNumber
    }

    if (experienceLevel && !isValidExperienceLevel(experienceLevel)) {
      setError('Please choose a valid experience level.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        preferredLocation: preferredLocation.trim() || null,
        minSalary: salaryValue,
        experienceLevel: experienceLevel || null,
      })
      setMessage('Preferences saved.')
    } catch (submitError) {
      setError(submitError.message || 'Could not save preferences.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <p className="jb-error">{error}</p> : null}
      {message ? <p className="jb-success">{message}</p> : null}

      <label className="jb-label">
        Preferred location
        <input
          type="text"
          value={preferredLocation}
          onChange={(event) => setPreferredLocation(event.target.value)}
          className="jb-input"
        />
      </label>

      <label className="jb-label">
        Minimum salary
        <input
          type="number"
          min="0"
          step="1"
          value={minSalary}
          onChange={(event) => setMinSalary(event.target.value)}
          className="jb-input"
        />
      </label>

      <label className="jb-label">
        Desired experience level
        <select
          value={experienceLevel}
          onChange={(event) => setExperienceLevel(event.target.value)}
          className="jb-input"
        >
          <option value="">Select</option>
          {EXPERIENCE_LEVELS.map((level) => (
            <option key={level} value={level}>
              {formatExperienceLevel(level)}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" disabled={submitting} className="jb-btn-primary">
        {submitting ? 'Saving...' : 'Save preferences'}
      </button>
    </form>
  )
}
