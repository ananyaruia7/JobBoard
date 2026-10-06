import { useState } from 'react'

function emptyExperience() {
  return {
    title: '',
    company: '',
    start_date: '',
    end_date: '',
    description: '',
    currentlyWorking: false,
  }
}

export default function ExperienceForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const starting = initialValues ?? emptyExperience()
  const [title, setTitle] = useState(starting.title ?? '')
  const [company, setCompany] = useState(starting.company ?? '')
  const [startDate, setStartDate] = useState(starting.start_date ?? '')
  const [currentlyWorking, setCurrentlyWorking] = useState(
    Boolean(starting.currentlyWorking) || starting.end_date == null,
  )
  const [endDate, setEndDate] = useState(starting.end_date ?? '')
  const [description, setDescription] = useState(starting.description ?? '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const trimmed = {
      title: title.trim(),
      company: company.trim(),
      start_date: startDate,
      description: description.trim() || null,
    }

    if (!trimmed.title || !trimmed.company || !trimmed.start_date) {
      setError('Title, company, and start date are required.')
      return
    }

    if (!currentlyWorking && !endDate) {
      setError('Enter an end date, or mark this as your current job.')
      return
    }

    if (!currentlyWorking && endDate && endDate < trimmed.start_date) {
      setError('End date cannot be before the start date.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        ...trimmed,
        end_date: currentlyWorking ? null : endDate,
      })
    } catch (submitError) {
      setError(submitError.message || 'Could not save this experience.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="jb-card space-y-4">
      {error ? <p className="jb-error">{error}</p> : null}

      <label className="jb-label">
        Title
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
        Start date
        <input
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          className="jb-input"
          required
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={currentlyWorking}
          onChange={(event) => {
            const checked = event.target.checked
            setCurrentlyWorking(checked)
            if (checked) setEndDate('')
          }}
        />
        Currently working here
      </label>

      {currentlyWorking ? null : (
        <label className="jb-label">
          End date
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="jb-input"
            required
          />
        </label>
      )}

      <label className="jb-label">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="jb-input"
          rows={3}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={submitting} className="jb-btn-primary">
          {submitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="jb-btn-secondary">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}
