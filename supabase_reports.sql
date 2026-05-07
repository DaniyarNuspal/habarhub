alter table public.posts
add column if not exists hidden boolean default false;

create table if not exists public.reports (
  id bigint generated always as identity primary key,
  post_id bigint,
  post_title text,
  post_phone text,
  reason text,
  created_at timestamptz default now()
);

alter table public.reports enable row level security;

drop policy if exists "anonymous can insert reports" on public.reports;
create policy "anonymous can insert reports"
on public.reports
for insert
to anon
with check (true);

drop policy if exists "anonymous cannot read reports" on public.reports;
drop policy if exists "Anyone can read reports" on public.reports;
create policy "Anyone can read reports"
on public.reports
for select
to anon
using (true);
