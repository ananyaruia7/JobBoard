import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { homePathForRole, isValidRole } from '../../lib/profiles'
import { supabase } from '../../lib/supabase'

export default function RegisterForm() {
  const { user, role, loading } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('jobseeker')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user && role) {
    return <Navigate to={homePathForRole(role)} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setInfo('')

    const trimmedName = fullName.trim()
    if (!trimmedName || !email.trim() || !password) {
      setError('Please fill in all fields.')
      return
    }
    if (!isValidRole(selectedRole)) {
      setError('Please choose a valid role.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setSubmitting(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: trimmedName,
            role: selectedRole,
          },
        },
      })

      if (signUpError) {
        throw signUpError
      }

      // Email confirmation: signUp can return a user with no session.
      // RLS needs auth.uid(), so do not insert profiles until a session exists.
      if (!data.session) {
        setInfo(
          'Account created. Check your email to confirm, then log in. Your profile will be created after you sign in.',
        )
        return
      }

      navigate(homePathForRole(selectedRole), { replace: true })
    } catch (signUpError) {
      setError(signUpError.message || 'Registration failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <p className="jb-error">{error}</p> : null}
      {info ? <p className="jb-success">{info}</p> : null}

      <label className="jb-label">
        Full name
        <input
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="jb-input"
          autoComplete="name"
          required
        />
      </label>

      <label className="jb-label">
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="jb-input"
          autoComplete="email"
          required
        />
      </label>

      <label className="jb-label">
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="jb-input"
          autoComplete="new-password"
          required
          minLength={6}
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="jb-label">Role</legend>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="radio"
            name="role"
            value="jobseeker"
            checked={selectedRole === 'jobseeker'}
            onChange={() => setSelectedRole('jobseeker')}
            className="text-indigo-600"
          />
          Jobseeker
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="radio"
            name="role"
            value="recruiter"
            checked={selectedRole === 'recruiter'}
            onChange={() => setSelectedRole('recruiter')}
            className="text-indigo-600"
          />
          Recruiter
        </label>
      </fieldset>

      <button
        type="submit"
        disabled={submitting}
        className="jb-btn-primary w-full"
      >
        {submitting ? 'Creating account...' : 'Create account'}
      </button>

      <p className="text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="jb-link">
          Log in
        </Link>
      </p>
    </form>
  )
}
