import { useRef, useState } from 'react'
import { formatClientError } from '../../lib/profiles'

export default function ResumeUpload({ resumePath, onUpload }) {
  const fileInputRef = useRef(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setError('Choose a PDF file first.')
      return
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Resume must be a PDF file.')
      return
    }

    setSubmitting(true)
    try {
      await onUpload(file)
      setMessage('Resume uploaded')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (uploadError) {
      setError(formatClientError(uploadError) || 'Could not upload the resume.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <p className="jb-error" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="jb-success" role="status">
          {message}
        </p>
      ) : null}

      <p className="text-sm text-slate-600">
        {resumePath
          ? 'A resume is currently uploaded.'
          : 'No resume uploaded yet.'}
      </p>

      <label className="jb-label">
        {resumePath ? 'Replace resume (PDF)' : 'Upload resume (PDF)'}
        <input
          ref={fileInputRef}
          name="resume"
          type="file"
          accept="application/pdf,.pdf"
          className="mt-1.5 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700"
        />
      </label>

      <button type="submit" disabled={submitting} className="jb-btn-primary">
        {submitting ? 'Uploading...' : resumePath ? 'Replace resume' : 'Upload resume'}
      </button>
    </form>
  )
}
