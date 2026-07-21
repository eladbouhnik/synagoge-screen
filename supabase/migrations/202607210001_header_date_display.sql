-- Configurable date line shown under the shul name in the persistent board header.
alter table public.board_settings
  add column if not exists header_date_display text[] not null default array['gregorian','hebrew'];
