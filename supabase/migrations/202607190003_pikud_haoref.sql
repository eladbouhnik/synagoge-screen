-- Pikud HaOref (Home Front Command) real-time alarm integration.
-- Stores the Hebrew city/area name used to filter incoming alert data.

alter table public.board_settings
  add column if not exists alert_city text;
