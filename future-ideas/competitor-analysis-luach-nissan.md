# Competitor Teardown: לוח ניסן (Luach Nissan) — a.l-n.co.il

Goal: catalog every feature in their admin panel, then beat each one in our platform. Reviewed live via their demo account ("ניסיון-יפה נוף-צפת" trial tenant) on 2026-07-26.

## Top-level structure

Sidebar tabs: תצוגה (Preview) · מסכים (Screens) · הודעות (Announcements) · זמני תפילות (Prayer times) · שיעורים (Lessons) · עילוי נשמת (Yahrzeit) · זמני היום (Daily halachic times) · הלכות (Halacha content) · פרנסים (Sponsors) · כלי/הגדרות כלליות (General settings) · מתפללים (Congregants).

Product is single-tenant per synagogue admin login, RTL Hebrew only, no visible multi-synagogue/org switcher — looks like one account = one shul.

---

## 1. Screens (מסכים) — 13 built-in board types

List of toggleable content boards, each with: enable/disable (green/red status dot), rotation duration override (per-board seconds, or "auto-calculated" for announcements), sort order, and station assignment.

Board types found: הודעות (announcements), עילוי נשמת (yahrzeit), פרנסים (sponsors), תפילות ושיעורים (prayers+lessons combined), זמני היום (daily times), הלכות (halacha), מסך שעון (clock), נץ החמה (sunrise), קריאת שמע (Shema deadline), הילולה (tzadik hillula/anniversary), ימי הולדת (birthdays), מסך שבת וחג (Shabbat/holiday board), מסך משולב (combined/multi-board).

Each board (e.g. the combined board) also has:
- **Visual theme picker** — thumbnail gallery of pre-built skins ("חסידי 1", "חסידי 2", "מלכות"/royal) to reskin that board without custom design work.
- **Multi-station assignment** (שיוך לעמדה) — same content can be routed to specific physical screens ("ראשי"/main and presumably others), implying support for multiple simultaneous physical displays per shul (e.g. main hall vs. entrance).

**Beat it:** ship a theme marketplace (more than 3 skins, community/user-submitted skins), per-board live drag-reorder, and make multi-screen/multi-room support a first-class concept (not a hidden "station" field) — e.g. a visual floor-plan screen manager.

## 2. Announcements (הודעות) — built-in slide designer

Not just a text+image uploader — this is a mini Canva:
- Step 1: pick orientation template (portrait "למסכי אורך" vs landscape "למסכי רוחב").
- Canvas editor with tool rail: add text, choose background, add image, add video, add shape, undo/redo, save as draft or export.
- Text tool: font family presets, bold/italic, alignment, color, size stepper.
- List view: filter by screen, search by name, "show only active" toggle, multi-select, duplicate (שכפול), scheduled publish/take-down dates (תאריך עליה / תאריך הורדה).

**Beat it:** richer editor (more shape/sticker library, animated text/entrance effects, video trim, AI-generated background/copy suggestions), template library by holiday/occasion, approval workflow for multi-admin shuls, and scheduling with recurring rules (not just one start/end date).

## 3. Prayer times (זמני תפילות)

Per-minyan record: name, prayer category (e.g. שבת), free-text description, screen assignment, and time source — either a **fixed clock time** or **relative to a halachic zman** (e.g. "X minutes after sunrise") with a "test time" preview field to sanity-check the calculated result before saving. Table filters by screen/type/name. Export table to Excel.

**Beat it:** same fixed/relative modes, but add relative-to-any-zman (not just sunrise), conflict detection (overlapping minyanim on one screen), and a bulk CSV import (not just export) for shuls migrating in with dozens of existing minyan times.

## 4. Lessons/shiurim (שיעורים)

Day-type based (recurring by day of week or חג), lesson name, מגיד שיעור (rabbi/lecturer, with what looks like a mic/audio-tag icon — possibly linking a recording), time (fixed or relative), per-screen sync toggle.

**Beat it:** attach actual audio/video recording or livestream link per shiur, series/multi-week course grouping, and rabbi profile pages (bio + full shiur archive) rather than a flat name field.

## 5. Yahrzeit / memorial (עילוי נשמת)

Deceased name, gender (מין: גבר/אישה/all), parent's name for disambiguation, **automatic Hebrew↔Gregorian date conversion** on the death date field, screen assignment, plaque/board name (שם התורם). Filterable list, Excel export.

**Beat it:** family self-service submission portal (request a memorial slot without calling the office), automatic yearly recurrence with a reminder to the family, optional photo, and multi-year history view ("this yahrzeit has appeared N times").

## 6. Daily halachic times (זמני היום) — the deepest feature

By far the most granular section:
- **Community/tradition selector** (עדה: ספרדי, presumably אשכנזי too) changes which calculation conventions apply.
- ~30 individually toggleable zmanim, each with **competing halachic opinions exposed as separate checkboxes**: dawn (72 min / 90 min), visible vs. calculated sunrise/sunset, stars-out (fixed vs. equal-minutes method), latest Shema/Tefilla (מג"א vs. גר"א/בעל התניא), chatzot, mincha gedola/ketana, plag hamincha, Shabbat/chag entry & exit (with Rabbeinu Tam variants), fast-day start/end, chametz eating/burning deadlines (Pesach, both opinions).
- **פרטי היום subsections**: liturgical insertions/changes (ותן טל ומטר, ותן ברכה, תחנון skip days, etc., auto-driven by the Hebrew calendar), day-specific reminders, and a daily-study slot (Daf Yomi–style).
- Per-board sync toggles (clock board, daily-times board).

**Beat it:** this is their moat — we need to at least match halachic opinion coverage (MG"A/GR"A/Baal HaTanya, Rabbeinu Tam), but go further: let the shul rabbi pick a "psak default" once instead of toggling ~30 checkboxes, show a plain-language explanation on hover for each zman (most admins don't know what "פלג המנחה" means), and auto-suggest which opinions matter based on the עדה selected.

## 7. Halacha content library (הלכות)

Pre-loaded rotating content: daily halacha snippets attributed to a named rabbi's books, halacha+aggada snippets by topic (Shabbat, brachot), curated quotes/proverbs. Searchable by name, per-screen sync toggle.

**Beat it:** let shuls plug in their own rabbi's content/audio, versioned content calendar so nothing repeats within a configurable window, and multi-language content packs.

## 8. Sponsors / dedications (פרנסים)

Sponsor type (e.g. "Sponsor of the Day"), name, blessing text (with a mic/voice-input affordance), start/end date shown in **both Hebrew and Gregorian simultaneously**, phone number, and an "advanced settings" drawer with:
- Annual auto-recurrence (חזור בתאריך זה בכל שנה).
- **Show in companion mobile app** toggle — confirms they have a mobile app alongside the display + admin.
- Rotation basis: fixed hour range vs. **sunset-relative** rotation (so the sponsor banner naturally flips at halachic day-change, not clock midnight).

**Beat it:** online payment collection tied directly to a sponsorship slot (turn the board into a fundraising tool, not just a plaque), tiered sponsor packages, and a public "sponsor history" page for donor recognition/retention.

## 9. General settings (כלי → הגדרות כלליות)

The control room for the zmanim engine and branding:
- Fixed left/right content routing for split-screen layouts.
- Clock format (24h, presumably 12h).
- **Language selector** (currently עברית only visible, but the field exists — hints at planned i18n).
- Shabbat/chag entry method (e.g. "20 min before sunset", configurable offset).
- Zmanim calculation method dropdown (named halachic authority/algorithm, e.g. "אור החיים").
- **Country + horizon/location selector** (מדינה: ישראל, אופק: ירושלים) — geo-aware zmanim, not hardcoded to one city.
- Purim variant (walled city/Shushan Purim vs. regular).
- National holiday overlay toggle (Yom HaAtzmaut etc.).
- Day-rollover basis: sunset vs. midnight — determines when "today's" content flips to "tomorrow's."
- **"Distraction prevention" mode** — a mechanism that mutes/pauses screen updates during prayers and during Shabbat/chag, with the Shabbat/chag version's own end condition (מוצש vs. exit-with-Rabbeinu-Tam).
- Synagogue address (geocoded, pin icon) and logo upload (appears on every board).

**Beat it:** this is strong config depth — match geo-aware zmanim + multi-opinion calc, but expose it through a guided setup wizard instead of a flat settings dump, support multiple buildings/campuses under one account, and make "distraction prevention" schedule-aware (auto-detect service times from the prayer-times module instead of a separate manual toggle).

## 10. Congregant CRM (מתפללים)

Full member records: photo, first/last name, phone, birth date (Hebrew/Gregorian toggle), geocoded address, email, role (guest/board/rabbi/member), and two opt-in visibility toggles — show in synagogue **phonebook/directory** and show on the **birthdays board**. Search by name.

**Beat it:** membership dues/billing integration, aliyah (Torah honor) assignment history tied to the member record, seat/seating-chart assignment, family grouping (link spouses/kids under one household), and communication log (who was texted/emailed about what).

## 11. Live preview / time-travel simulator (תצוגה)

Pick a station, then override the **simulated date and time** (Hebrew or Gregorian, with a working converter) to preview exactly how any board will render on a future Shabbat, holiday, or arbitrary moment — without waiting for it to actually arrive. Play/pause/step controls, version counter shown in-corner.

Visual result observed: blue header bar with live clock, Hebrew date, day name, parsha name, Shabbat entry/exit times; warm parchment-and-candlesticks themed body for Shabbat; two-column split for prayers vs. lessons; synagogue name branding top-right; small vendor logo+phone watermark bottom-left (likely removable on a paid/white-label tier).

**Beat it:** this simulator is genuinely excellent and worth cloning outright — add a shareable preview link (send a rabbi "here's what Shabbat will look like" without giving admin access), a diff view (compare two dates side by side), and remove/allow full white-label branding at every tier, not just paid.

---

## Cross-cutting gaps to exploit

1. **No visible multi-tenant/org layer** — looks like one login per shul. Our multi-tenant SaaS foundation (already in our `master` branch history) is a structural advantage if we expose it well (manage multiple shuls/branches from one dashboard).
2. **RTL Hebrew only** — no language toggle actually functions today (field exists but unused). Real i18n (English, French, Spanish-speaking communities) is open ground.
3. **Config depth vs. usability tradeoff** — their zmanim/settings screens are powerful but expert-only (flat checkbox walls, no explanations). A guided setup + sane per-tradition defaults would win non-technical gabbaim.
4. **No self-service for congregants** — yahrzeit submission, sponsorship purchase, and directory opt-in all appear admin-mediated. Turning these into congregant-facing forms (with admin approval) reduces office workload and is a strong differentiator.
5. **Branding/watermark on trial** — suggests white-label is monetized. Decide our own tiering deliberately rather than copying it blind.
6. **Vendor lock via mobile app tie-in** — sponsor "show in app" implies a companion app drives engagement; worth having our own from day one rather than bolting it on later.

## Suggested build priority (for later — not part of this doc's task)

1. Match core content boards (prayer times, zmanim, announcements, yahrzeit, sponsors) — table stakes.
2. Clone the time-travel preview simulator — cheap to build, high perceived value.
3. Build the guided zmanim setup wizard — turns their biggest strength into our biggest UX win.
4. Ship congregant self-service (yahrzeit request, sponsorship purchase with payment) — feature they don't have at all.
5. Real i18n + multi-branch/org management — structural advantages their architecture doesn't easily support.
