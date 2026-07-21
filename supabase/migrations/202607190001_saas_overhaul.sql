-- SaaS overhaul: message urgency + show windows, halacha source toggle,
-- and self-serve signup bootstrap (owner synagogue creation).

-- 1. Messages: urgency level and time-of-day display window.
alter table public.messages
  add column if not exists urgency text not null default 'regular'
    check (urgency in ('regular','important','urgent')),
  add column if not exists show_from time,
  add column if not exists show_until time;

-- 2. Halacha source: automatic daily learning (Hebcal) vs the synagogue's own list.
alter table public.board_settings
  add column if not exists halacha_mode text not null default 'auto'
    check (halacha_mode in ('auto','manual'));

-- 3. Signup bootstrap. No insert policies exist on synagogues/admin_users/board_settings,
-- so a fresh user cannot create their synagogue through RLS. This SECURITY DEFINER
-- function is the only creation path. It is idempotent: safe to call on every login.
create or replace function public.ensure_owner_synagogue()
returns table (synagogue_id uuid, board_key text)
language plpgsql
security definer
set search_path = public
as $$
declare
  syn_name text;
  new_key text;
  new_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  -- Invited users must join their inviter's synagogue, not receive an empty one.
  perform public.claim_synagogue_invitations();

  select a.synagogue_id, s.board_key
    into synagogue_id, board_key
  from public.admin_users a
  join public.synagogues s on s.id = a.synagogue_id
  where a.user_id = auth.uid()
  limit 1;
  if found then
    return next;
    return;
  end if;

  syn_name := coalesce(
    nullif(trim(auth.jwt() -> 'user_metadata' ->> 'synagogue_name'), ''),
    'בית הכנסת שלי'
  );
  new_key := 'bk-' || encode(gen_random_bytes(6), 'hex');

  insert into public.synagogues (board_key, name, address, latitude, longitude, elevation)
  values (new_key, syn_name, '', 31.7780, 35.2354, 750)
  returning id into new_id;

  insert into public.board_settings (synagogue_id) values (new_id);

  insert into public.admin_users (user_id, synagogue_id, role)
  values (auth.uid(), new_id, 'owner');

  -- Starter screens so a brand new board is never blank.
  insert into public.screens (synagogue_id, type, title, duration_seconds, sort_order, config) values
    (new_id, 'tfilot', 'זמני תפילות', 16, 10,
      '{"background_variant":"parochet","layout":"feature","content_blocks":["tfilot","zmanei_hayom","clock"],"special_day":"all"}'),
    (new_id, 'messages', 'הודעות הקהילה', 12, 20,
      '{"background_variant":"mosaic","layout":"split","content_blocks":["messages","shiurim"],"special_day":"all"}'),
    (new_id, 'clock', 'שעון', 8, 30,
      '{"background_variant":"stars","layout":"single","content_blocks":["clock"],"special_day":"all"}');

  synagogue_id := new_id;
  board_key := new_key;
  return next;
end;
$$;

revoke all on function public.ensure_owner_synagogue() from public;
grant execute on function public.ensure_owner_synagogue() to authenticated;
