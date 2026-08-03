-- Which halachic opinion each shul follows for zmanim with more than one common shitah:
-- dawn (alos), the Shema/Tefila deadline (gra/mga/baal hatanya), and nightfall (tzet).
-- Defaults match the current hardcoded behavior (72-minute alos, GR"A, Geonim tzet).
alter table public.board_settings
  add column if not exists zmanim_opinions jsonb not null default '{"dawn":"72","shema_tefila":"gra","nightfall":"geonim"}'::jsonb;
