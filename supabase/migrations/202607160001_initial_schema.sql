create extension if not exists "pgcrypto";

create table if not exists public.synagogues (
  id uuid primary key default gen_random_uuid(),
  board_key text not null unique,
  name text not null,
  address text not null default '',
  latitude numeric not null,
  longitude numeric not null,
  elevation numeric not null default 0,
  timezone text not null default 'Asia/Jerusalem',
  nusach text not null default 'ספרדי',
  candle_lighting_minutes int not null default 40,
  logo_url text,
  donor_dedication text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  synagogue_id uuid not null references public.synagogues(id) on delete cascade,
  role text not null check (role in ('owner','editor','viewer')),
  unique (user_id, synagogue_id)
);

create table if not exists public.board_settings (
  synagogue_id uuid primary key references public.synagogues(id) on delete cascade,
  show_national_holidays boolean not null default true,
  date_switch_basis text not null default 'sunset' check (date_switch_basis in ('24h','sunset')),
  zman_rounding text not null default 'nearest5' check (zman_rounding in ('none','up5','down5','nearest5')),
  time_format text not null default '24h',
  default_screen_duration int not null default 12
);

create table if not exists public.screens (
  id uuid primary key default gen_random_uuid(),
  synagogue_id uuid not null references public.synagogues(id) on delete cascade,
  type text not null,
  title text not null,
  duration_seconds int not null default 12,
  is_visible boolean not null default true,
  sort_order int not null default 0,
  config jsonb not null default '{}'
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  synagogue_id uuid not null references public.synagogues(id) on delete cascade,
  title text not null,
  body text not null,
  background_url text,
  style jsonb not null default '{}',
  start_date date,
  end_date date,
  is_active boolean not null default true
);

create table if not exists public.prayer_times (
  id uuid primary key default gen_random_uuid(),
  synagogue_id uuid not null references public.synagogues(id) on delete cascade,
  day_type text not null default 'weekday',
  prayer text not null,
  label text not null,
  time_mode text not null check (time_mode in ('fixed','relative')),
  fixed_time time,
  relative_to text,
  offset_minutes int not null default 0,
  relative_day text,
  rounding text check (rounding in ('none','up5','down5','nearest5')),
  minyan_number int not null default 1
);

create table if not exists public.iluy_neshama (
  id uuid primary key default gen_random_uuid(),
  synagogue_id uuid not null references public.synagogues(id) on delete cascade,
  deceased_name text not null,
  gender text not null,
  parent_name text not null,
  hebrew_death_date text not null,
  donor_name text
);

create table if not exists public.shiurim (
  id uuid primary key default gen_random_uuid(),
  synagogue_id uuid not null references public.synagogues(id) on delete cascade,
  day_type text not null default 'weekday',
  title text not null,
  rabbi_name text not null,
  days text[] not null default '{}',
  time_mode text not null check (time_mode in ('fixed','relative')),
  fixed_time time,
  relative_to text,
  offset_minutes int not null default 0,
  duration_minutes int not null default 45,
  is_active boolean not null default true
);

create table if not exists public.halachot (
  id uuid primary key default gen_random_uuid(),
  synagogue_id uuid not null references public.synagogues(id) on delete cascade,
  category text not null,
  body text not null,
  is_selected boolean not null default false,
  holiday_tag text
);

create table if not exists public.parnasim (
  id uuid primary key default gen_random_uuid(),
  synagogue_id uuid not null references public.synagogues(id) on delete cascade,
  parnas_name text not null,
  blessing text not null,
  start_date date not null,
  end_date date not null,
  period text not null,
  phone text
);

create table if not exists public.congregants (
  id uuid primary key default gen_random_uuid(),
  synagogue_id uuid not null references public.synagogues(id) on delete cascade,
  full_name text not null,
  hebrew_birth_date text,
  gregorian_birth_date date,
  phone text
);

alter table public.synagogues enable row level security;
alter table public.admin_users enable row level security;
alter table public.board_settings enable row level security;
alter table public.screens enable row level security;
alter table public.messages enable row level security;
alter table public.prayer_times enable row level security;
alter table public.iluy_neshama enable row level security;
alter table public.shiurim enable row level security;
alter table public.halachot enable row level security;
alter table public.parnasim enable row level security;
alter table public.congregants enable row level security;

create or replace function public.user_synagogue_ids()
returns setof uuid
language sql
security definer
set search_path = public
as $$
  select synagogue_id from public.admin_users where user_id = auth.uid()
$$;

create or replace function public.can_read_board(target_board_key text)
returns boolean
language sql
stable
as $$
  select exists(select 1 from public.synagogues where board_key = target_board_key)
$$;

create policy "Admins can read own synagogues" on public.synagogues for select using (id in (select public.user_synagogue_ids()));
create policy "Public can read synagogue by board key" on public.synagogues for select using (true);
create policy "Admins can update own synagogues" on public.synagogues for update using (id in (select public.user_synagogue_ids()));

create policy "Admins can read admin users" on public.admin_users for select using (synagogue_id in (select public.user_synagogue_ids()));

create policy "Admins read settings" on public.board_settings for select using (synagogue_id in (select public.user_synagogue_ids()));
create policy "Admins update settings" on public.board_settings for all using (synagogue_id in (select public.user_synagogue_ids()));
create policy "Public read settings" on public.board_settings for select using (true);

create policy "Admins manage screens" on public.screens for all using (synagogue_id in (select public.user_synagogue_ids()));
create policy "Public read visible screens" on public.screens for select using (is_visible = true);

create policy "Admins manage messages" on public.messages for all using (synagogue_id in (select public.user_synagogue_ids()));
create policy "Public read active messages" on public.messages for select using (is_active = true);

create policy "Admins manage prayer times" on public.prayer_times for all using (synagogue_id in (select public.user_synagogue_ids()));
create policy "Public read prayer times" on public.prayer_times for select using (true);

create policy "Admins manage iluy neshama" on public.iluy_neshama for all using (synagogue_id in (select public.user_synagogue_ids()));
create policy "Public read iluy neshama" on public.iluy_neshama for select using (true);

create policy "Admins manage shiurim" on public.shiurim for all using (synagogue_id in (select public.user_synagogue_ids()));
create policy "Public read active shiurim" on public.shiurim for select using (is_active = true);

create policy "Admins manage halachot" on public.halachot for all using (synagogue_id in (select public.user_synagogue_ids()));
create policy "Public read selected halachot" on public.halachot for select using (is_selected = true);

create policy "Admins manage parnasim" on public.parnasim for all using (synagogue_id in (select public.user_synagogue_ids()));
create policy "Public read parnasim" on public.parnasim for select using (true);

create policy "Admins manage congregants" on public.congregants for all using (synagogue_id in (select public.user_synagogue_ids()));
create policy "Public read congregants birthdays" on public.congregants for select using (true);
