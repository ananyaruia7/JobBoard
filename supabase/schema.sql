-- JobBoard MVP — Step 2 schema
-- Run this once in the Supabase SQL Editor (see comments at the bottom).
-- Safe to re-run: does not DROP TABLE and does not delete rows.
-- Policies are replaced in place if this file is run again.

-- Keep profiles.role stable after signup (users may still update full_name).
create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'profiles.id cannot be changed';
  end if;
  if new.role is distinct from old.role then
    raise exception 'profiles.role cannot be changed';
  end if;
  return new;
end;
$$;

-- Recruiters may change application status only.
create or replace function public.prevent_application_identity_change()
returns trigger
language plpgsql
as $$
begin
  if new.id is distinct from old.id
     or new.job_id is distinct from old.job_id
     or new.jobseeker_id is distinct from old.jobseeker_id
     or new.created_at is distinct from old.created_at then
    raise exception 'only applications.status can be changed';
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('jobseeker', 'recruiter')),
  full_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.jobseeker_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  headline text,
  location text,
  experience_level text check (experience_level in ('intern', 'early', 'mid', 'senior')),
  resume_path text
);

create table if not exists public.job_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  preferred_location text,
  min_salary integer,
  experience_level text check (experience_level in ('intern', 'early', 'mid', 'senior'))
);

create table if not exists public.work_experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  company text not null,
  start_date date not null,
  end_date date,
  description text
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  company text not null,
  salary integer not null,
  location text not null,
  description text not null,
  experience_level text not null check (experience_level in ('intern', 'early', 'mid', 'senior')),
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  jobseeker_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (
    status in ('pending', 'reviewing', 'interview', 'accepted', 'rejected')
  ),
  created_at timestamptz not null default now(),
  unique (job_id, jobseeker_id)
);

drop trigger if exists trg_prevent_profile_role_change on public.profiles;
create trigger trg_prevent_profile_role_change
  before update on public.profiles
  for each row
  execute function public.prevent_profile_role_change();

drop trigger if exists trg_prevent_application_identity_change on public.applications;
create trigger trg_prevent_application_identity_change
  before update on public.applications
  for each row
  execute function public.prevent_application_identity_change();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists jobs_location_idx on public.jobs (location);
create index if not exists jobs_salary_idx on public.jobs (salary);
create index if not exists jobs_experience_level_idx on public.jobs (experience_level);
create index if not exists jobs_recruiter_id_idx on public.jobs (recruiter_id);
create index if not exists applications_job_id_idx on public.applications (job_id);
create index if not exists applications_jobseeker_id_idx on public.applications (jobseeker_id);

-- ---------------------------------------------------------------------------
-- Helpers: role checks used by RLS policies (after public.profiles exists)
-- ---------------------------------------------------------------------------

create or replace function public.is_jobseeker()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'jobseeker'
  );
$$;

create or replace function public.is_recruiter()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'recruiter'
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.jobseeker_profiles enable row level security;
alter table public.job_preferences enable row level security;
alter table public.work_experiences enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- jobseeker_profiles
drop policy if exists "jobseeker_profiles_select_own" on public.jobseeker_profiles;
create policy "jobseeker_profiles_select_own"
  on public.jobseeker_profiles
  for select
  to authenticated
  using (user_id = auth.uid() and public.is_jobseeker());

drop policy if exists "jobseeker_profiles_insert_own" on public.jobseeker_profiles;
create policy "jobseeker_profiles_insert_own"
  on public.jobseeker_profiles
  for insert
  to authenticated
  with check (user_id = auth.uid() and public.is_jobseeker());

drop policy if exists "jobseeker_profiles_update_own" on public.jobseeker_profiles;
create policy "jobseeker_profiles_update_own"
  on public.jobseeker_profiles
  for update
  to authenticated
  using (user_id = auth.uid() and public.is_jobseeker())
  with check (user_id = auth.uid() and public.is_jobseeker());

drop policy if exists "jobseeker_profiles_delete_own" on public.jobseeker_profiles;
create policy "jobseeker_profiles_delete_own"
  on public.jobseeker_profiles
  for delete
  to authenticated
  using (user_id = auth.uid() and public.is_jobseeker());

-- job_preferences
drop policy if exists "job_preferences_select_own" on public.job_preferences;
create policy "job_preferences_select_own"
  on public.job_preferences
  for select
  to authenticated
  using (user_id = auth.uid() and public.is_jobseeker());

drop policy if exists "job_preferences_insert_own" on public.job_preferences;
create policy "job_preferences_insert_own"
  on public.job_preferences
  for insert
  to authenticated
  with check (user_id = auth.uid() and public.is_jobseeker());

drop policy if exists "job_preferences_update_own" on public.job_preferences;
create policy "job_preferences_update_own"
  on public.job_preferences
  for update
  to authenticated
  using (user_id = auth.uid() and public.is_jobseeker())
  with check (user_id = auth.uid() and public.is_jobseeker());

drop policy if exists "job_preferences_delete_own" on public.job_preferences;
create policy "job_preferences_delete_own"
  on public.job_preferences
  for delete
  to authenticated
  using (user_id = auth.uid() and public.is_jobseeker());

-- work_experiences
drop policy if exists "work_experiences_select_own" on public.work_experiences;
create policy "work_experiences_select_own"
  on public.work_experiences
  for select
  to authenticated
  using (user_id = auth.uid() and public.is_jobseeker());

drop policy if exists "work_experiences_insert_own" on public.work_experiences;
create policy "work_experiences_insert_own"
  on public.work_experiences
  for insert
  to authenticated
  with check (user_id = auth.uid() and public.is_jobseeker());

drop policy if exists "work_experiences_update_own" on public.work_experiences;
create policy "work_experiences_update_own"
  on public.work_experiences
  for update
  to authenticated
  using (user_id = auth.uid() and public.is_jobseeker())
  with check (user_id = auth.uid() and public.is_jobseeker());

drop policy if exists "work_experiences_delete_own" on public.work_experiences;
create policy "work_experiences_delete_own"
  on public.work_experiences
  for delete
  to authenticated
  using (user_id = auth.uid() and public.is_jobseeker());

-- jobs
drop policy if exists "jobs_select_authenticated" on public.jobs;
create policy "jobs_select_authenticated"
  on public.jobs
  for select
  to authenticated
  using (true);

drop policy if exists "jobs_insert_own_recruiter" on public.jobs;
create policy "jobs_insert_own_recruiter"
  on public.jobs
  for insert
  to authenticated
  with check (recruiter_id = auth.uid() and public.is_recruiter());

drop policy if exists "jobs_update_own_recruiter" on public.jobs;
create policy "jobs_update_own_recruiter"
  on public.jobs
  for update
  to authenticated
  using (recruiter_id = auth.uid() and public.is_recruiter())
  with check (recruiter_id = auth.uid() and public.is_recruiter());

drop policy if exists "jobs_delete_own_recruiter" on public.jobs;
create policy "jobs_delete_own_recruiter"
  on public.jobs
  for delete
  to authenticated
  using (recruiter_id = auth.uid() and public.is_recruiter());

-- applications
drop policy if exists "applications_select_own_jobseeker" on public.applications;
create policy "applications_select_own_jobseeker"
  on public.applications
  for select
  to authenticated
  using (jobseeker_id = auth.uid() and public.is_jobseeker());

drop policy if exists "applications_select_own_jobs_recruiter" on public.applications;
create policy "applications_select_own_jobs_recruiter"
  on public.applications
  for select
  to authenticated
  using (
    public.is_recruiter()
    and exists (
      select 1
      from public.jobs
      where jobs.id = applications.job_id
        and jobs.recruiter_id = auth.uid()
    )
  );

drop policy if exists "applications_insert_own_jobseeker" on public.applications;
create policy "applications_insert_own_jobseeker"
  on public.applications
  for insert
  to authenticated
  with check (
    jobseeker_id = auth.uid()
    and public.is_jobseeker()
    and status = 'pending'
  );

drop policy if exists "applications_update_status_own_jobs_recruiter" on public.applications;
create policy "applications_update_status_own_jobs_recruiter"
  on public.applications
  for update
  to authenticated
  using (
    public.is_recruiter()
    and exists (
      select 1
      from public.jobs
      where jobs.id = applications.job_id
        and jobs.recruiter_id = auth.uid()
    )
  )
  with check (
    public.is_recruiter()
    and exists (
      select 1
      from public.jobs
      where jobs.id = applications.job_id
        and jobs.recruiter_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Grants (anon has no access; authenticated is still constrained by RLS)
-- ---------------------------------------------------------------------------

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.jobseeker_profiles to authenticated;
grant select, insert, update, delete on public.job_preferences to authenticated;
grant select, insert, update, delete on public.work_experiences to authenticated;
grant select, insert, update, delete on public.jobs to authenticated;
grant select, insert, update on public.applications to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: private resumes bucket
-- Object key must be {auth.uid()}/resume.pdf
-- Recruiter downloads are intentionally omitted for this step.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

drop policy if exists "resumes_select_own" on storage.objects;
create policy "resumes_select_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'resumes'
    and name = auth.uid()::text || '/resume.pdf'
    and public.is_jobseeker()
  );

drop policy if exists "resumes_insert_own" on storage.objects;
create policy "resumes_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'resumes'
    and name = auth.uid()::text || '/resume.pdf'
    and public.is_jobseeker()
  );

drop policy if exists "resumes_update_own" on storage.objects;
create policy "resumes_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'resumes'
    and name = auth.uid()::text || '/resume.pdf'
    and public.is_jobseeker()
  )
  with check (
    bucket_id = 'resumes'
    and name = auth.uid()::text || '/resume.pdf'
    and public.is_jobseeker()
  );

drop policy if exists "resumes_delete_own" on storage.objects;
create policy "resumes_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'resumes'
    and name = auth.uid()::text || '/resume.pdf'
    and public.is_jobseeker()
  );

-- How to run (do this yourself in the dashboard; this file is not executed by the app):
-- 1. Open https://supabase.com/dashboard and select your JobBoard project.
-- 2. Go to SQL Editor → New query.
-- 3. Paste the full contents of this file.
-- 4. Click Run.
-- 5. Confirm in Table Editor that the six public tables exist, and in Storage that
--    the private "resumes" bucket exists.
