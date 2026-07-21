-- Auto halacha mode: pin the board to one daily-learning track instead of rotating.
alter table public.board_settings
  add column if not exists halacha_auto_source text not null default 'kitzurShulchanAruch'
    check (halacha_auto_source in ('dailyRambam1','arukhHaShulchanYomi','kitzurShulchanAruch'));
