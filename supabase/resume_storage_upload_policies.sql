-- JobBoard — resume upload Storage policies
-- Run this yourself in the Supabase SQL Editor. This file is not executed by the app.
-- Does not drop tables, data, or the recruiter resume SELECT policy.

-- Why this exists:
-- Storage INSERT/UPDATE/SELECT for `{auth.uid()}/resume.pdf` used public.is_jobseeker()
-- with SECURITY INVOKER. That helper reads public.profiles under RLS. From storage.objects
-- policy evaluation that check can fail even for a signed-in jobseeker, which blocks
-- upload (and upsert, which also needs SELECT + UPDATE). This helper is SECURITY DEFINER
-- so the role check can read profiles without that recursion/invoker failure, while still
-- requiring the object key to be exactly {auth.uid()}/resume.pdf and role = jobseeker.

create or replace function public.can_manage_own_resume(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() is not null
    and object_name = auth.uid()::text || '/resume.pdf'
    and exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'jobseeker'
    );
$$;

revoke all on function public.can_manage_own_resume(text) from public;
grant execute on function public.can_manage_own_resume(text) to authenticated;

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do update
set public = excluded.public;

-- If the bucket already restricts MIME types, make sure PDF is included.
-- NULL allowed_mime_types means all types are allowed; leave that unchanged.
update storage.buckets
set allowed_mime_types = array(
  select distinct mime
  from unnest(allowed_mime_types || array['application/pdf']::text[]) as mime
)
where id = 'resumes'
  and allowed_mime_types is not null
  and not ('application/pdf' = any (allowed_mime_types));

drop policy if exists "resumes_select_own" on storage.objects;
create policy "resumes_select_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'resumes'
    and public.can_manage_own_resume(name)
  );

drop policy if exists "resumes_insert_own" on storage.objects;
create policy "resumes_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'resumes'
    and public.can_manage_own_resume(name)
  );

drop policy if exists "resumes_update_own" on storage.objects;
create policy "resumes_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'resumes'
    and public.can_manage_own_resume(name)
  )
  with check (
    bucket_id = 'resumes'
    and public.can_manage_own_resume(name)
  );

drop policy if exists "resumes_delete_own" on storage.objects;
create policy "resumes_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'resumes'
    and public.can_manage_own_resume(name)
  );
