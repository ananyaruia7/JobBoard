import { useState } from 'react'
import { EXPERIENCE_LEVELS, isValidExperienceLevel } from '../../lib/jobs'
import { formatExperienceLevel } from '../../lib/display'

export default function ProfileForm({ initialValues, onSubmit }) {
  const [fullName, setFullName] = useState(initialValues.fullName ?? '')
  const [headline, setHeadline] = useState(initialValues.headline ?? '')
  const [location, setLocation] = useState(initialValues.location ?? '')
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

    const trimmedName = fullName.trim()
    if (!trimmedName) {
      setError('Full name is required.')
      return
    }
    if (experienceLevel && !isValidExperienceLevel(experienceLevel)) {
      setError('Please choose a valid experience level.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        fullName: trimmedName,
        headline: headline.trim() || null,
        location: location.trim() || null,
        experienceLevel: experienceLevel || null,
      })
      setMessage('Profile saved.')
    } catch (submitError) {
      setError(submitError.message || 'Could not save the profile.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <p className="jb-error">{error}</p> : null}
      {message ? <p className="jb-success">{message}</p> : null}

      <label className="jb-label">
        Full name
        <input
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="jb-input"
          required
        />
      </label>

      <label className="jb-label">
        Headline
        <input
          type="text"
          value={headline}
          onChange={(event) => setHeadline(event.target.value)}
          className="jb-input"
        />
      </label>

      <label className="jb-label">
        Current location
        <input
          type="text"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          className="jb-input"
        />
      </label>

      <label className="jb-label">
        Experience level
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
        {submitting ? 'Saving...' : 'Save profile'}
      </button>
    </form>
  )
}
