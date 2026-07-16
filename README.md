# לוח בית כנסת דיגיטלי

מערכת Next.js לניהול והצגת לוח דיגיטלי לבית כנסת. המערכת כוללת:

- לוח תצוגה fullscreen בנתיב `/board/[boardKey]`
- פאנל ניהול RTL בנתיב `/admin`
- מנוע זמני היום מבוסס `kosher-zmanim`
- ברירת מחדל מלאה לצפת, כולל קואורדינטות וגובה
- תזמון תפילות ושיעורים לפי יום בשבוע, חג, טווח תאריכים או יחס מתמטי לכל זמן היום
- לימוד הלכה יומי אוטומטי דרך Hebcal, עם גיבוי להלכות שהגבאי בחר
- הזמנת משתמשים עם הרשאות בעלים, עורך או צפייה בלבד
- API לנתוני לוח ו־API ניהולי ל־Supabase
- fallback דמו מקומי כאשר Supabase לא מוגדר
- cache מקומי בלוח, polling כל 15 דקות ונעילת מסך בזמן תפילה/שיעור

## הרצה מקומית

```bash
npm install
npm run dev
```

נתיבי בדיקה:

- `http://localhost:3000/`
- `http://localhost:3000/admin`
- `http://localhost:3000/board/demo-board`

## משתני סביבה

העתק את `.env.example` ל־`.env.local` ומלא:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_DEFAULT_TIMEZONE=Asia/Jerusalem
```

בלי משתני Supabase המערכת עובדת במצב דמו מקומי, כדי לאפשר פיתוח ובדיקות UI.

## Supabase

המיגרציות נמצאות ב־`supabase/migrations`:

1. `202607160001_initial_schema.sql`
2. `202607160002_seed_demo.sql`
3. `202607160003_realtime_publication.sql`
4. `202607160004_safed_scheduling_and_team.sql`

הסכמה כוללת RLS לכל הטבלאות, `board_key` ציבורי לקריאה של הלוח, ו־`admin_users` לשיוך משתמשי Supabase Auth לבית כנסת.
המיגרציה השלישית מוסיפה את טבלאות הלוח ל־`supabase_realtime` כדי שהמסך יתרענן מיד אחרי שינוי בפאנל. המיגרציה הרביעית מוסיפה כללי תזמון חוזרים, מעדכנת את דוגמת הלוח לצפת, ומוסיפה הזמנות והרשאות משתמשים.

## בדיקות ואימות

```bash
npm run typecheck
npm test
npm run lint
npm run test:e2e
npm run build
```

מנוע הזמנים נבדק ב־Vitest עבור:

- זמני צפת יציבים לתאריך ידוע
- עיגול `up5`, `down5`, `nearest5`
- זמן יחסי עם יום עוגן שבועי
- פתרון זמני תפילות קבועים ויחסיים

## מבנה מרכזי

- `src/app/board/[boardKey]` מסך התצוגה
- `src/app/admin` פאנל הניהול
- `src/app/api/board/[boardKey]` API ציבורי ללוח
- `src/app/api/admin/[resource]` API ניהולי מוגבל למשאבים ידועים
- `src/lib/zmanim` מנוע זמני היום ופתרון זמני תפילות
- `src/lib/supabase` לקוחות Supabase server/client
- `src/types/domain.ts` טיפוסי הדומיין
