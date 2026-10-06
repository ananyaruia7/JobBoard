-- JobBoard Step 7 — recruiter SELECT access for applicants only
-- Additive: no table drops, no data deletion, no schema changes.
-- Run this yourself in the Supabase SQL Editor. This file is not executed by the app.

create or replace function public.recruiter_can_access_jobseeker(target_jobseeker_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() is not null
    and exists (
      select 1
      from public.applications
      join public.jobs on jobs.id = applications.job_id
      where applications.jobseeker_id = target_jobseeker_id
        and jobs.recruiter_id = auth.uid()
    );
$$;

revoke all on function public.recruiter_can_access_jobseeker(uuid) from public;
grant execute on function public.recruiter_can_access_jobseeker(uuid) to authenticated;

drop policy if exists "profiles_select_applicants_for_own_jobs" on public.profiles;
create policy "profiles_select_applicants_for_own_jobs"
  on public.profiles
  for select
  to authenticated
  using (public.recruiter_can_access_jobseeker(id));

drop policy if exists "jobseeker_profiles_select_applicants_for_own_jobs"
  on public.jobseeker_profiles;
create policy "jobseeker_profiles_select_applicants_for_own_jobs"
  on public.jobseeker_profiles
  for select
  to authenticated
  using (public.recruiter_can_access_jobseeker(user_id));

drop policy if exists "work_experiences_select_applicants_for_own_jobs"
  on public.work_experiences;
create policy "work_experiences_select_applicants_for_own_jobs"
  on public.work_experiences
  for select
  to authenticated
  using (public.recruiter_can_access_jobseeker(user_id));

drop policy if exists "resumes_select_applicants_for_own_jobs" on storage.objects;
create policy "resumes_select_applicants_for_own_jobs"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'resumes'
    and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/resume\.pdf$'
    and public.recruiter_can_access_jobseeker(split_part(name, '/', 1)::uuid)
  );
