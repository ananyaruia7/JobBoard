import { listJobs } from './jobs'
import { fetchJobPreferences } from './profiles'

export function hasAnyPreference(preferences) {
  if (!preferences) return false
  const hasLocation = Boolean(preferences.preferred_location?.trim())
  const hasMinSalary =
    preferences.min_salary !== null && preferences.min_salary !== undefined
  const hasLevel = Boolean(preferences.experience_level)
  return hasLocation || hasMinSalary || hasLevel
}

export function jobMatchesPreferences(job, preferences) {
  if (!preferences) return false

  if (
    preferences.min_salary !== null &&
    preferences.min_salary !== undefined &&
    job.salary < preferences.min_salary
  ) {
    return false
  }

  if (
    preferences.experience_level &&
    job.experience_level !== preferences.experience_level
  ) {
    return false
  }

  const preferredLocation = preferences.preferred_location?.trim()
  if (preferredLocation) {
    const jobLocation = (job.location || '').toLowerCase()
    if (!jobLocation.includes(preferredLocation.toLowerCase())) {
      return false
    }
  }

  return true
}

export async function listRecommendedJobs(userId) {
  const preferences = await fetchJobPreferences(userId)
  if (!hasAnyPreference(preferences)) {
    return { preferences, jobs: [], needsPreferences: true }
  }

  const jobs = await listJobs()
  return {
    preferences,
    jobs: jobs.filter((job) => jobMatchesPreferences(job, preferences)),
    needsPreferences: false,
  }
}
