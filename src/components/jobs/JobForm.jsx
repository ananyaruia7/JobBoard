import { useState } from 'react'
import { EXPERIENCE_LEVELS, isValidExperienceLevel } from '../../lib/jobs'
import { formatExperienceLevel } from '../../lib/display'

const emptyJob = {
  title: '',
  company: '',
  salary: '',
  location: '',
  description: '',
  experience_level: 'intern',
}

export default function JobForm({
  initialValues = emptyJob,
  submitLabel,
  onSubmit,
}) {
  const [title, setTitle] = useState(initialValues.title ?? '')
  const [company, setCompany] = useState(initialValues.company ?? '')
  const [salary, setSalary] = useState(
    initialValues.salary === 0 || initialValues.salary
      ? String(initialValues.salary)
      : '',
  )
  const [location, setLocation] = useState(initialValues.location ?? '')
  const [description, setDescription] = useState(initialValues.description ?? '')
  const [experienceLevel, setExperienceLevel] = useState(
    isValidExperienceLevel(initialValues.experience_level)
      ? initialValues.experience_level
      : 'intern',
  )
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const trimmed = {
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      description: description.trim(),
      experience_level: experienceLevel,
    }
    const salaryNumber = Number(salary)

    if (
      !trimmed.title ||
      !trimmed.company ||
      !trimmed.location ||
      !trimmed.description
    ) {
      setError('Please fill in all fields.')
      return
    }
    if (salary === '' || !Number.isInteger(salaryNumber) || salaryNumber < 0) {
      setError('Salary must be a whole number of 0 or more.')
      return
    }
    if (!isValidExperienceLevel(trimmed.experience_level)) {
      setError('Please choose a valid experience level.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        ...trimmed,
        salary: salaryNumber,
      })
    } catch (submitError) {
      setError(submitError.message || 'Could not save the job.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <p className="jb-error">{error}</p> : null}

      <label className="jb-label">
        Job title
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="jb-input"
          required
        />
      </label>

      <label className="jb-label">
        Company
        <input
          type="text"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          className="jb-input"
          required
        />
      </label>

      <label className="jb-label">
        Salary
        <input
          type="number"
          min="0"
          step="1"
          value={salary}
          onChange={(event) => setSalary(event.target.value)}
          className="jb-input"
          required
        />
      </label>

      <label className="jb-label">
        Location
        <input
          type="text"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          className="jb-input"
          required
        />
      </label>

      <label className="jb-label">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="jb-input min-h-32"
          rows={5}
          required
        />
      </label>

      <label className="jb-label">
        Experience level
        <select
          value={experienceLevel}
          onChange={(event) => setExperienceLevel(event.target.value)}
          className="jb-input"
          required
        >
          {EXPERIENCE_LEVELS.map((level) => (
            <option key={level} value={level}>
              {formatExperienceLevel(level)}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="jb-btn-primary"
      >
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}
