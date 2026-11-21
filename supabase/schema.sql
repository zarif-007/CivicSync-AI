-- CivicSync AI / DNCC pilot database schema
-- Apply in a new Supabase project after reviewing the policy with the project owner.
create extension if not exists pgcrypto;

create type public.app_role as enum ('citizen', 'staff', 'admin');
create type public.report_status as enum ('submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role public.app_role not null default 'citizen',
  ward_number integer check (ward_number between 1 and 60),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete restrict,
  title text not null check (char_length(title) between 5 and 160),
  description text not null check (char_length(description) between 8 and 3000),
  category text not null check (category in ('Road damage','Waterlogging','Streetlight','Waste accumulation','Other')),
  status public.report_status not null default 'submitted',
  severity integer check (severity between 1 and 100),
  latitude double precision not null check (latitude between 23.60 and 24.10),
  longitude double precision not null check (longitude between 90.25 and 90.65),
  ward_number integer check (ward_number between 1 and 60),
  triage jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reports_created_at_idx on public.reports (created_at desc);
create index reports_status_idx on public.reports (status);
create index reports_ward_idx on public.reports (ward_number);
create index reports_reporter_idx on public.reports (reporter_id);

alter table public.profiles enable row level security;
alter table public.reports enable row level security;

-- A user can read their own profile. Role assignment must be done by a trusted admin process.
create policy "profiles_read_self" on public.profiles for select to authenticated using (id = auth.uid());
-- Profile rows are provisioned by the auth trigger below; users cannot set their own role.
create policy "reports_read_own_or_staff" on public.reports for select to authenticated
using (
  reporter_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_active = true
      and (p.role = 'admin' or (p.role = 'staff' and p.ward_number is not null and p.ward_number = reports.ward_number))
  )
);
create policy "citizens_create_own_reports" on public.reports for insert to authenticated
with check (reporter_id = auth.uid() and status = 'submitted' and severity is null and triage is null);
create policy "staff_update_reports" on public.reports for update to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_active = true and (p.role = 'admin' or (p.role = 'staff' and p.ward_number = reports.ward_number))))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_active = true and (p.role = 'admin' or (p.role = 'staff' and p.ward_number = reports.ward_number))));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Do not expose service-role credentials in client apps. Set staff/admin roles manually
-- through a trusted Supabase SQL editor or a secured administrative workflow.
