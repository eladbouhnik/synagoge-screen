insert into public.synagogues (
  id, board_key, name, address, latitude, longitude, elevation, timezone, nusach, candle_lighting_minutes, donor_dedication
) values (
  '11111111-1111-4111-8111-111111111111',
  'demo-board',
  'בית הכנסת אור הגליל',
  'צפת, הגליל העליון',
  32.9646,
  35.496,
  900,
  'Asia/Jerusalem',
  'ספרדי',
  40,
  'הלוח נתרם לעילוי נשמת מייסדי הקהילה'
) on conflict (id) do nothing;

insert into public.board_settings (synagogue_id, show_national_holidays, date_switch_basis, zman_rounding, time_format, default_screen_duration)
values ('11111111-1111-4111-8111-111111111111', true, 'sunset', 'nearest5', '24h', 14)
on conflict (synagogue_id) do nothing;

insert into public.screens (synagogue_id, type, title, duration_seconds, is_visible, sort_order, config)
values
('11111111-1111-4111-8111-111111111111','tfilot','זמני תפילות',16,true,10,'{}'),
('11111111-1111-4111-8111-111111111111','zmanei_hayom','זמני היום',14,true,20,'{}'),
('11111111-1111-4111-8111-111111111111','messages','מודעות הקהילה',12,true,30,'{}'),
('11111111-1111-4111-8111-111111111111','shiurim','שיעורי תורה',12,true,40,'{}'),
('11111111-1111-4111-8111-111111111111','iluy_neshama','לעילוי נשמת',12,true,50,'{"layout":"center"}'),
('11111111-1111-4111-8111-111111111111','halachot','הלכה יומית',12,true,60,'{}'),
('11111111-1111-4111-8111-111111111111','parnasim','פרנסי החודש',10,true,70,'{}'),
('11111111-1111-4111-8111-111111111111','birthdays','ימי הולדת',10,true,80,'{}'),
('11111111-1111-4111-8111-111111111111','clock','שעון',8,true,90,'{}');

insert into public.messages (synagogue_id, title, body, start_date, is_active)
values
('11111111-1111-4111-8111-111111111111','שבת קהילה','קידוש קהילתי לאחר תפילת מוסף. הציבור מוזמן להשתתף ולכבד.','2026-01-01',true),
('11111111-1111-4111-8111-111111111111','הודעה לגבאים','נא לעדכן זמני תפילות מיוחדים דרך הפאנל עד יום חמישי בשעה 18:00.','2026-01-01',true);
