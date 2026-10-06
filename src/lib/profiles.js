import { supabase } from './supabase'

export const ROLES = {
  jobseeker: 'jobseeker',
  recruiter: 'recruiter',
}

export function isValidRole(role) {
  return role === ROLES.jobseeker || role === ROLES.recruiter
}

export function homePathForRole(role) {
  return role === ROLES.recruiter ? '/recruiter/jobs' : '/jobs'
}

function metadataFromUser(user) {
  const meta = user?.user_metadata ?? {}
  const fullName = typeof meta.full_name === 'string' ? meta.full_name.trim() : ''
  const role = typeof meta.role === 'string' ? meta.role : ''
  return { fullName, role }
}

async function ensureJobseekerRows(userId) {
  const { data: seekerRow, error: seekerReadError } = await supabase
    .from('jobseeker_profiles')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (seekerReadError) {
    throw seekerReadError
  }

  if (!seekerRow) {
    const { error } = await supabase
      .from('jobseeker_profiles')
      .insert({ user_id: userId })
    if (error) throw error
  }

  const { data: prefsRow, error: prefsReadError } = await supabase
    .from('job_preferences')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (prefsReadError) {
    throw prefsReadError
  }

  if (!prefsRow) {
    const { error } = await supabase
      .from('job_preferences')
      .insert({ user_id: userId })
    if (error) throw error
  }
}

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, full_name, created_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function ensureProfile(user) {
  if (!user?.id) {
    throw new Error('Cannot create a profile without a signed-in user.')
  }

  const existing = await fetchProfile(user.id)
  if (existing) {
    if (existing.role === ROLES.jobseeker) {
      await ensureJobseekerRows(user.id)
    }
    return existing
  }

  const { fullName, role } = metadataFromUser(user)
  if (!fullName) {
    throw new Error('Missing full name. Please register again.')
  }
  if (!isValidRole(role)) {
    throw new Error('Missing or invalid role. Please register again.')
  }

  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      full_name: fullName,
      role,
    })
    .select('id, role, full_name, created_at')
    .single()

  if (insertError) throw insertError

  if (created.role === ROLES.jobseeker) {
    await ensureJobseekerRows(user.id)
  }

  return created
}

export async function fetchJobseekerProfile(userId) {
  const { data, error } = await supabase
    .from('jobseeker_profiles')
    .select('user_id, headline, location, experience_level, resume_path')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function updateProfileName(userId, fullName) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', userId)
    .select('id, role, full_name, created_at')
    .single()

  if (error) throw error
  return data
}

export async function updateJobseekerProfile(userId, fields) {
  const { data, error } = await supabase
    .from('jobseeker_profiles')
    .update({
      headline: fields.headline,
      location: fields.location,
      experience_level: fields.experience_level,
    })
    .eq('user_id', userId)
    .select('user_id, headline, location, experience_level, resume_path')
    .single()

  if (error) throw error
  return data
}

export async function fetchJobPreferences(userId) {
  const { data, error } = await supabase
    .from('job_preferences')
    .select('user_id, preferred_location, min_salary, experience_level')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function updateJobPreferences(userId, fields) {
  const { data, error } = await supabase
    .from('job_preferences')
    .update({
      preferred_location: fields.preferred_location,
      min_salary: fields.min_salary,
      experience_level: fields.experience_level,
    })
    .eq('user_id', userId)
    .select('user_id, preferred_location, min_salary, experience_level')
    .single()

  if (error) throw error
  return data
}

const EXPERIENCE_COLUMNS =
  'id, user_id, title, company, start_date, end_date, description'

export async function listWorkExperiences(userId) {
  const { data, error } = await supabase
    .from('work_experiences')
    .select(EXPERIENCE_COLUMNS)
    .eq('user_id', userId)
    .order('start_date', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createWorkExperience(userId, experience) {
  const { data, error } = await supabase
    .from('work_experiences')
    .insert({
      user_id: userId,
      title: experience.title,
      company: experience.company,
      start_date: experience.start_date,
      end_date: experience.end_date,
      description: experience.description,
    })
    .select(EXPERIENCE_COLUMNS)
    .single()

  if (error) throw error
  return data
}

export async function updateWorkExperience(experienceId, userId, experience) {
  const { data, error } = await supabase
    .from('work_experiences')
    .update({
      title: experience.title,
      company: experience.company,
      start_date: experience.start_date,
      end_date: experience.end_date,
      description: experience.description,
    })
    .eq('id', experienceId)
    .eq('user_id', userId)
    .select(EXPERIENCE_COLUMNS)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function deleteWorkExperience(experienceId, userId) {
  const { error } = await supabase
    .from('work_experiences')
    .delete()
    .eq('id', experienceId)
    .eq('user_id', userId)

  if (error) throw error
}

export function resumeObjectPath(userId) {
  return `${userId}/resume.pdf`
}

export function formatClientError(err) {
  if (err == null) return 'Unknown error'
  if (typeof err === 'string' && err.trim()) return err.trim()

  const parts = []
  if (typeof err.message === 'string' && err.message.trim()) {
    parts.push(err.message.trim())
  }
  if (typeof err.error === 'string' && err.error.trim() && err.error !== err.message) {
    parts.push(err.error.trim())
  }
  if (err.originalError && err.originalError !== err) {
    const nested = formatClientError(err.originalError)
    if (nested && nested !== 'Unknown error' && !parts.includes(nested)) {
      parts.push(nested)
    }
  }
  if (err.code != null && String(err.code).trim()) {
    parts.push(`code ${err.code}`)
  }
  if (err.statusCode != null && String(err.statusCode).trim()) {
    parts.push(`status ${err.statusCode}`)
  } else if (err.status != null && String(err.status).trim()) {
    parts.push(`HTTP ${err.status}`)
  }
  if (typeof err.details === 'string' && err.details.trim()) {
    parts.push(err.details.trim())
  }
  if (typeof err.hint === 'string' && err.hint.trim()) {
    parts.push(err.hint.trim())
  }

  if (parts.length > 0) return parts.join(' · ')

  try {
    const serialized = JSON.stringify(err)
    if (serialized && serialized !== '{}') return serialized
  } catch {
    // ignore
  }

  return 'Unknown error'
}

function pdfFileForUpload(file) {
  if (typeof File !== 'undefined' && file instanceof File) {
    return new File([file], 'resume.pdf', { type: 'application/pdf' })
  }
  if (typeof Blob !== 'undefined' && file instanceof Blob) {
    return new File([file], 'resume.pdf', { type: 'application/pdf' })
  }
  return file
}

export async function uploadResume(userId, file) {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) {
    throw new Error(`Could not confirm your session: ${formatClientError(authError)}`)
  }

  const uid = authData.user?.id
  if (!uid) {
    throw new Error('You must be signed in to upload a resume.')
  }
  if (userId && userId !== uid) {
    throw new Error('Signed-in user does not match this profile.')
  }

  const path = resumeObjectPath(uid)
  const pdf = pdfFileForUpload(file)

  const { error: uploadError } = await supabase.storage.from('resumes').upload(path, pdf, {
    upsert: true,
    contentType: 'application/pdf',
    cacheControl: '3600',
  })

  if (uploadError) {
    throw new Error(`Storage upload failed: ${formatClientError(uploadError)}`)
  }

  const { data, error } = await supabase
    .from('jobseeker_profiles')
    .update({ resume_path: path })
    .eq('user_id', uid)
    .select('user_id, headline, location, experience_level, resume_path')
    .single()

  if (error) {
    throw new Error(
      `Resume file was uploaded, but saving resume_path failed: ${formatClientError(error)}`,
    )
  }
  if (!data?.resume_path) {
    throw new Error('Resume file was uploaded, but resume_path was not saved on your profile.')
  }

  return data
}
