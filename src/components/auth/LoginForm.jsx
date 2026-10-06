import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { homePathForRole } from '../../lib/profiles'
import { supabase } from '../../lib/supabase'

export default function LoginForm() {
  const { user, role, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user && role) {
    return <Navigate to={homePathForRole(role)} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter email and password.')
      return
    }

    setSubmitting(true)
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        throw signInError
      }

      const metadataRole = data.user?.user_metadata?.role
      navigate(homePathForRole(metadataRole), { replace: true })
    } catch (signInError) {
      setError(signInError.message || 'Login failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <p className="jb-error">{error}</p> : null}

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
          autoComplete="current-password"
          required
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="jb-btn-primary w-full"
      >
        {submitting ? 'Signing in...' : 'Log in'}
      </button>

      <p className="text-sm text-slate-600">
        Need an account?{' '}
        <Link to="/register" className="jb-link">
          Register
        </Link>
      </p>
    </form>
  )
}
