-- Safed defaults, reusable schedule rules, and an invitation-based team model.
alter table public.prayer_times
  add column if not exists days text[] not null default '{}',
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists holiday_tags text[] not null default '{}',
  add column if not exists is_active boolean not null default true;

alter table public.shiurim
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists holiday_tags text[] not null default '{}';

create table if not exists public.synagogue_invitations (
  id uuid primary key default gen_random_uuid(),
  synagogue_id uuid not null references public.synagogues(id) on delete cascade,
  email text not null check (email = lower(email)),
  role text not null check (role in ('owner','editor','viewer')) default 'editor',
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  unique (synagogue_id, email)
);

alter table public.synagogue_invitations enable row level security;

create or replace function public.current_synagogue_role(target_synagogue_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.admin_users
  where synagogue_id = target_synagogue_id and user_id = auth.uid()
  limit 1
$$;

create or replace function public.claim_synagogue_invitations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed_count integer;
begin
  insert into public.admin_users (user_id, synagogue_id, role)
  select auth.uid(), invitation.synagogue_id, invitation.role
  from public.synagogue_invitations invitation
  where invitation.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  on conflict (user_id, synagogue_id) do update set role = excluded.role;

  get diagnostics claimed_count = row_count;
  delete from public.synagogue_invitations
  where email = lower(coalesce(auth.jwt() ->> 'email', ''));
  return claimed_count;
end;
$$;

grant execute on function public.claim_synagogue_invitations() to authenticated;

drop policy if exists "Owners manage invitations" on public.synagogue_invitations;
create policy "Owners manage invitations" on public.synagogue_invitations
  for all using (public.current_synagogue_role(synagogue_id) = 'owner')
  with check (public.current_synagogue_role(synagogue_id) = 'owner');

-- Replace broad manager policies with owner/editor permissions. Public board reads stay intact.
drop policy if exists "Admins manage screens" on public.screens;
drop policy if exists "Admins manage messages" on public.messages;
drop policy if exists "Admins manage prayer times" on public.prayer_times;
drop policy if exists "Admins manage iluy neshama" on public.iluy_neshama;
drop policy if exists "Admins manage shiurim" on public.shiurim;
drop policy if exists "Admins manage halachot" on public.halachot;
drop policy if exists "Admins manage parnasim" on public.parnasim;
drop policy if exists "Admins manage congregants" on public.congregants;
drop policy if exists "Admins update own synagogues" on public.synagogues;
drop policy if exists "Admins update settings" on public.board_settings;

create policy "Editors manage screens" on public.screens for all using (public.current_synagogue_role(synagogue_id) in ('owner','editor')) with check (public.current_synagogue_role(synagogue_id) in ('owner','editor'));
create policy "Editors manage messages" on public.messages for all using (public.current_synagogue_role(synagogue_id) in ('owner','editor')) with check (public.current_synagogue_role(synagogue_id) in ('owner','editor'));
create policy "Editors manage prayer times" on public.prayer_times for all using (public.current_synagogue_role(synagogue_id) in ('owner','editor')) with check (public.current_synagogue_role(synagogue_id) in ('owner','editor'));
create policy "Editors manage iluy neshama" on public.iluy_neshama for all using (public.current_synagogue_role(synagogue_id) in ('owner','editor')) with check (public.current_synagogue_role(synagogue_id) in ('owner','editor'));
create policy "Editors manage shiurim" on public.shiurim for all using (public.current_synagogue_role(synagogue_id) in ('owner','editor')) with check (public.current_synagogue_role(synagogue_id) in ('owner','editor'));
create policy "Editors manage halachot" on public.halachot for all using (public.current_synagogue_role(synagogue_id) in ('owner','editor')) with check (public.current_synagogue_role(synagogue_id) in ('owner','editor'));
create policy "Editors manage parnasim" on public.parnasim for all using (public.current_synagogue_role(synagogue_id) in ('owner','editor')) with check (public.current_synagogue_role(synagogue_id) in ('owner','editor'));
create policy "Editors manage congregants" on public.congregants for all using (public.current_synagogue_role(synagogue_id) in ('owner','editor')) with check (public.current_synagogue_role(synagogue_id) in ('owner','editor'));
create policy "Owner updates synagogue profile" on public.synagogues for update using (public.current_synagogue_role(id) = 'owner') with check (public.current_synagogue_role(id) = 'owner');
create policy "Editors manage board settings" on public.board_settings for all using (public.current_synagogue_role(synagogue_id) in ('owner','editor')) with check (public.current_synagogue_role(synagogue_id) in ('owner','editor'));

update public.synagogues
set name = 'בית הכנסת אור הגליל', address = 'צפת, הגליל העליון', latitude = 32.9646, longitude = 35.496, elevation = 900, timezone = 'Asia/Jerusalem'
where board_key = 'demo-board';
