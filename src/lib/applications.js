import { supabase } from './supabase'

const APPLICATION_COLUMNS = 'id, job_id, jobseeker_id, status, created_at'

export const APPLICATION_STATUSES = [
  'pending',
  'reviewing',
  'interview',
  'accepted',
  'rejected',
]

export function isValidApplicationStatus(status) {
  return APPLICATION_STATUSES.includes(status)
}

export function isDuplicateApplicationError(error) {
  return error?.code === '23505'
}

export async function getApplicationForJob(jobId, jobseekerId) {
  const { data, error } = await supabase
    .from('applications')
    .select(APPLICATION_COLUMNS)
    .eq('job_id', jobId)
    .eq('jobseeker_id', jobseekerId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function applyToJob(jobId, jobseekerId) {
  const { data, error } = await supabase
    .from('applications')
    .insert({
      job_id: jobId,
      jobseeker_id: jobseekerId,
    })
    .select(APPLICATION_COLUMNS)
    .single()

  if (error) throw error
  return data
}

export async function listJobseekerApplications(jobseekerId) {
  const { data, error } = await supabase
    .from('applications')
    .select(
      `
      ${APPLICATION_COLUMNS},
      jobs (
        id,
        title,
        company,
        location,
        salary,
        experience_level
      )
    `,
    )
    .eq('jobseeker_id', jobseekerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function listApplicationsForJob(jobId) {
  const { data, error } = await supabase
    .from('applications')
    .select(APPLICATION_COLUMNS)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function updateApplicationStatus(applicationId, jobId, status) {
  if (!isValidApplicationStatus(status)) {
    throw new Error('Invalid application status.')
  }

  const { data, error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId)
    .eq('job_id', jobId)
    .select(APPLICATION_COLUMNS)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createResumeSignedUrl(resumePath) {
  const { data, error } = await supabase.storage
    .from('resumes')
    .createSignedUrl(resumePath, 120)

  if (error) throw error
  return data?.signedUrl ?? null
}
