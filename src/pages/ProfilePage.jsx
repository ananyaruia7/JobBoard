import { useEffect, useState } from 'react'
import ExperienceForm from '../components/profile/ExperienceForm'
import ExperienceList from '../components/profile/ExperienceList'
import PreferencesForm from '../components/profile/PreferencesForm'
import ProfileForm from '../components/profile/ProfileForm'
import ResumeUpload from '../components/profile/ResumeUpload'
import PageShell, { LoadingMessage, PageHeader } from '../components/layout/PageShell'
import { useAuth } from '../context/AuthContext'
import {
  createWorkExperience,
  deleteWorkExperience,
  fetchJobPreferences,
  fetchJobseekerProfile,
  listWorkExperiences,
  updateJobPreferences,
  updateJobseekerProfile,
  updateProfileName,
  updateWorkExperience,
  uploadResume,
} from '../lib/profiles'

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const [seekerProfile, setSeekerProfile] = useState(null)
  const [preferences, setPreferences] = useState(null)
  const [experiences, setExperiences] = useState([])
  const [editingExperience, setEditingExperience] = useState(null)
  const [addingExperience, setAddingExperience] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadPage() {
    const [seeker, prefs, experienceRows] = await Promise.all([
      fetchJobseekerProfile(user.id),
      fetchJobPreferences(user.id),
      listWorkExperiences(user.id),
    ])
    setSeekerProfile(seeker)
    setPreferences(prefs)
    setExperiences(experienceRows)
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        await loadPage()
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'Could not load your profile.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [user.id])

  async function handleProfileSave(values) {
    const nextProfile = await updateProfileName(user.id, values.fullName)
    const nextSeeker = await updateJobseekerProfile(user.id, {
      headline: values.headline,
      location: values.location,
      experience_level: values.experienceLevel,
    })
    setSeekerProfile(nextSeeker)
    await refreshProfile()
    return nextProfile
  }

  async function handlePreferencesSave(values) {
    const nextPrefs = await updateJobPreferences(user.id, {
      preferred_location: values.preferredLocation,
      min_salary: values.minSalary,
      experience_level: values.experienceLevel,
    })
    setPreferences(nextPrefs)
  }

  async function handleCreateExperience(values) {
    await createWorkExperience(user.id, values)
    setAddingExperience(false)
    setExperiences(await listWorkExperiences(user.id))
  }

  async function handleUpdateExperience(values) {
    await updateWorkExperience(editingExperience.id, user.id, values)
    setEditingExperience(null)
    setExperiences(await listWorkExperiences(user.id))
  }

  async function handleDeleteExperience(experience) {
    const confirmed = window.confirm(
      `Delete "${experience.title}" at ${experience.company}?`,
    )
    if (!confirmed) return
    await deleteWorkExperience(experience.id, user.id)
    if (editingExperience?.id === experience.id) {
      setEditingExperience(null)
    }
    setExperiences((current) =>
      current.filter((row) => row.id !== experience.id),
    )
  }

  async function handleResumeUpload(file) {
    const nextSeeker = await uploadResume(user.id, file)
    setSeekerProfile(nextSeeker)
  }

  return (
    <PageShell>
      <PageHeader
        title="Profile"
        subtitle="Keep your details, preferences, and resume up to date."
      />
      {error ? <p className="jb-error mb-4">{error}</p> : null}
      {loading ? <LoadingMessage /> : null}

      {!loading && profile && seekerProfile ? (
        <section className="jb-card mb-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">About you</h2>
          <ProfileForm
            key={`${profile.full_name}-${seekerProfile.headline}-${seekerProfile.location}-${seekerProfile.experience_level}`}
            initialValues={{
              fullName: profile.full_name,
              headline: seekerProfile.headline ?? '',
              location: seekerProfile.location ?? '',
              experienceLevel: seekerProfile.experience_level ?? '',
            }}
            onSubmit={handleProfileSave}
          />
        </section>
      ) : null}

      {!loading && preferences ? (
        <section className="jb-card mb-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Job preferences
          </h2>
          <PreferencesForm
            key={`${preferences.preferred_location}-${preferences.min_salary}-${preferences.experience_level}`}
            initialValues={{
              preferredLocation: preferences.preferred_location ?? '',
              minSalary: preferences.min_salary,
              experienceLevel: preferences.experience_level ?? '',
            }}
            onSubmit={handlePreferencesSave}
          />
        </section>
      ) : null}

      {!loading ? (
        <section className="mb-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Work experience
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditingExperience(null)
                setAddingExperience(true)
              }}
              className="jb-btn-secondary py-1.5"
            >
              Add experience
            </button>
          </div>

          <ExperienceList
            experiences={experiences}
            onEdit={(experience) => {
              setAddingExperience(false)
              setEditingExperience(experience)
            }}
            onDelete={handleDeleteExperience}
          />

          {addingExperience ? (
            <div className="mt-4">
              <ExperienceForm
                key="new-experience"
                submitLabel="Add experience"
                onSubmit={handleCreateExperience}
                onCancel={() => setAddingExperience(false)}
              />
            </div>
          ) : null}

          {editingExperience ? (
            <div className="mt-4">
              <ExperienceForm
                key={editingExperience.id}
                initialValues={{
                  ...editingExperience,
                  currentlyWorking: editingExperience.end_date == null,
                }}
                submitLabel="Save experience"
                onSubmit={handleUpdateExperience}
                onCancel={() => setEditingExperience(null)}
              />
            </div>
          ) : null}
        </section>
      ) : null}

      {!loading && seekerProfile ? (
        <section className="jb-card">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Resume</h2>
          <ResumeUpload
            resumePath={seekerProfile.resume_path}
            onUpload={handleResumeUpload}
          />
        </section>
      ) : null}
    </PageShell>
  )
}
