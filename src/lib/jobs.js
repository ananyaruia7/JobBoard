import { supabase } from './supabase'

export const EXPERIENCE_LEVELS = ['intern', 'early', 'mid', 'senior']

export function isValidExperienceLevel(level) {
  return EXPERIENCE_LEVELS.includes(level)
}

const JOB_COLUMNS =
  'id, recruiter_id, title, company, salary, location, description, experience_level, created_at'

function sanitizeFilterText(value) {
  return value.replace(/[%_,()]/g, ' ').trim()
}

export async function listJobs(filters = {}) {
  let query = supabase
    .from('jobs')
    .select(JOB_COLUMNS)
    .order('created_at', { ascending: false })

  const keyword = filters.keyword ? sanitizeFilterText(filters.keyword) : ''
  if (keyword) {
    query = query.or(`title.ilike.%${keyword}%,company.ilike.%${keyword}%`)
  }

  if (filters.minSalary !== '' && filters.minSalary != null) {
    const minSalary = Number(filters.minSalary)
    if (Number.isFinite(minSalary)) {
      query = query.gte('salary', minSalary)
    }
  }

  const location = filters.location ? sanitizeFilterText(filters.location) : ''
  if (location) {
    query = query.ilike('location', `%${location}%`)
  }

  if (isValidExperienceLevel(filters.experienceLevel)) {
    query = query.eq('experience_level', filters.experienceLevel)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getJob(jobId) {
  const { data, error } = await supabase
    .from('jobs')
    .select(JOB_COLUMNS)
    .eq('id', jobId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function listRecruiterJobs(recruiterId) {
  const { data, error } = await supabase
    .from('jobs')
    .select(JOB_COLUMNS)
    .eq('recruiter_id', recruiterId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getRecruiterJob(jobId, recruiterId) {
  const { data, error } = await supabase
    .from('jobs')
    .select(JOB_COLUMNS)
    .eq('id', jobId)
    .eq('recruiter_id', recruiterId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createJob(recruiterId, job) {
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      recruiter_id: recruiterId,
      title: job.title,
      company: job.company,
      salary: job.salary,
      location: job.location,
      description: job.description,
      experience_level: job.experience_level,
    })
    .select(JOB_COLUMNS)
    .single()

  if (error) throw error
  return data
}

export async function updateJob(jobId, recruiterId, job) {
  const { data, error } = await supabase
    .from('jobs')
    .update({
      title: job.title,
      company: job.company,
      salary: job.salary,
      location: job.location,
      description: job.description,
      experience_level: job.experience_level,
    })
    .eq('id', jobId)
    .eq('recruiter_id', recruiterId)
    .select(JOB_COLUMNS)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function deleteJob(jobId, recruiterId) {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId)
    .eq('recruiter_id', recruiterId)

  if (error) throw error
}
