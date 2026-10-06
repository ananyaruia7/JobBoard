import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ensureProfile, fetchProfile } from '../lib/profiles'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      setSession(data.session ?? null)
      setUser(data.session?.user ?? null)
      setSessionLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (sessionLoading) return undefined

    let cancelled = false

    async function loadProfile() {
      if (!user) {
        setProfile(null)
        setProfileLoading(false)
        return
      }

      setProfileLoading(true)
      try {
        const nextProfile = await ensureProfile(user)
        if (!cancelled) {
          setProfile(nextProfile)
        }
      } catch (error) {
        console.error('Failed to load profile', error)
        if (!cancelled) {
          setProfile(null)
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [user, sessionLoading])

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function refreshProfile() {
    if (!user) return
    const nextProfile = await fetchProfile(user.id)
    setProfile(nextProfile)
  }

  const loading = sessionLoading || profileLoading

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      role: profile?.role ?? null,
      loading,
      signOut,
      refreshProfile,
    }),
    [user, session, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
