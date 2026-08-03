import type { ReactNode } from "react";
import { Clock3 } from "lucide-react";
import { pickDailyLearning, type DailyLearningItem } from "@/lib/halacha/daily-learning";
import { AutoScrollText } from "./auto-scroll-text";
import { matchesSchedule } from "@/lib/schedule/rules";
import { addMinutes, formatDate, formatTime, isActiveDateRange, parseLocalTime } from "@/lib/utils";
import { isMessageVisible, sortMessagesByUrgency } from "@/lib/messages/visibility";
import { getScreenDesignConfig, type ScreenContentBlock } from "@/lib/board/screen-config";
import type { BoardPayload, Screen } from "@/types/domain";
import { getZmanByKey, type DailyZmanim } from "@/lib/zmanim/engine";
import { getZmanDisplayEntries } from "@/lib/zmanim/displayEntries";
import { resolvePrayerTimes } from "@/lib/zmanim/resolvePrayerTime";

interface ComposedScreenProps {
  payload: BoardPayload;
  screen: Screen;
  now: Date;
  hebrewDate: string;
  yomTov: string | null;
  zmanim: DailyZmanim;
  dailyLearning: DailyLearningItem[];
  showDate?: boolean;
}

const blockTitles: Record<ScreenContentBlock, string> = {
  tfilot: "פרטי תפילות",
  zmanei_hayom: "זמני היום",
  messages: "הודעות",
  shiurim: "שיעורים",
  iluy_neshama: "לעילוי נשמה",
  halachot: "הלכה יומית",
  parnasim: "פרנסים",
  birthdays: "ימי הולדת",
  clock: "היום",
};

export function ComposedScreen({ payload, screen, now, hebrewDate, yomTov, zmanim, dailyLearning, showDate = true }: ComposedScreenProps) {
  const design = getScreenDesignConfig(screen);
  const singleBlockClass = design.content_blocks.length === 1 ? "composed-single-block" : "";
  return (
    <section className={`composed-screen composed-layout-${design.layout} ${singleBlockClass}`} data-block-count={design.content_blocks.length}>
      <div className="composed-screen-heading">
        {showDate ? <p>{[formatDate(now, payload.synagogue.timezone), hebrewDate].filter(Boolean).join(" · ")}</p> : null}
        <h2>{screen.title}</h2>
      </div>
      <div className="composed-screen-grid">
        {design.content_blocks.map((block) => (
          <ContentBlock key={block} block={block} payload={payload} now={now} yomTov={yomTov} zmanim={zmanim} dailyLearning={dailyLearning} />
        ))}
      </div>
    </section>
  );
}

function ContentBlock({ block, payload, now, yomTov, zmanim, dailyLearning }: Omit<ComposedScreenProps, "screen" | "hebrewDate"> & { block: ScreenContentBlock }) {
  let content: ReactNode;

  if (block === "tfilot") {
    const prayers = resolvePrayerTimes(payload.prayerTimes, payload.synagogue, now, payload.settings.zman_rounding, payload.settings.zmanim_opinions).slice(0, 4);
    content = <Rows rows={prayers.map((item) => [item.label, formatTime(item.resolvedAt, payload.synagogue.timezone)])} empty="אין זמני תפילה להצגה" />;
  } else if (block === "zmanei_hayom") {
    const entries = getZmanDisplayEntries(zmanim, now).slice(0, 5);
    content = <Rows rows={entries.map((entry) => [entry.label, formatTime(entry.value, payload.synagogue.timezone)])} empty="אין זמני יום להצגה" />;
  } else if (block === "messages") {
    const messages = sortMessagesByUrgency(payload.messages.filter((message) => isMessageVisible(message, now, payload.synagogue.timezone))).slice(0, 2);
    content = messages.length ? <div className="composed-stack">{messages.map((message) => <div key={message.id} className={message.urgency === "urgent" ? "composed-message-urgent" : undefined}><strong>{message.urgency === "urgent" ? "דחוף · " : ""}{message.title}</strong><p>{message.body}</p></div>)}</div> : <Empty />;
  } else if (block === "shiurim") {
    const shiurim = payload.shiurim.filter((shiur) => matchesSchedule(shiur, now, payload.synagogue.timezone)).slice(0, 3);
    content = <Rows rows={shiurim.map((shiur) => {
      const startsAt = shiur.time_mode === "fixed" && shiur.fixed_time ? parseLocalTime(now, shiur.fixed_time, payload.synagogue.timezone) : addMinutes(getZmanByKey(zmanim, shiur.relative_to) ?? now, shiur.offset_minutes);
      return [shiur.title, `${formatTime(startsAt, payload.synagogue.timezone)} · ${shiur.rabbi_name}`];
    })} empty="אין שיעורים להצגה" />;
  } else if (block === "iluy_neshama") {
    content = <Rows rows={payload.iluyNeshama.slice(0, 3).map((item) => [item.deceased_name, item.hebrew_death_date])} empty="אין הקדשות להצגה" />;
  } else if (block === "halachot") {
    const halachot = payload.halachot.filter((item) => item.is_selected && (!item.holiday_tag || item.holiday_tag === yomTov));
    const halachaMode = payload.settings.halacha_mode ?? "auto";
    const automatic = halachaMode === "auto" ? pickDailyLearning(dailyLearning, payload.settings.halacha_auto_source) : undefined;
    const item = halachot[Math.floor(now.getDate() % Math.max(halachot.length, 1))];
    const body = automatic ? automatic.body ?? automatic.source : item?.body;
    content = <div className="composed-prose"><strong>{automatic?.title ?? item?.category ?? "הלכה"}</strong>{body ? <AutoScrollText text={body} className="composed-halacha-scroll" /> : <p>אין הלכה להצגה</p>}</div>;
  } else if (block === "parnasim") {
    content = <Rows rows={payload.parnasim.filter((item) => isActiveDateRange(item.start_date, item.end_date, now)).slice(0, 3).map((item) => [item.parnas_name, item.blessing])} empty="אין פרנסים להצגה" />;
  } else if (block === "birthdays") {
    content = <Rows rows={payload.congregants.slice(0, 3).map((item) => [item.full_name, item.hebrew_birth_date ?? item.gregorian_birth_date ?? ""])} empty="אין ימי הולדת להצגה" />;
  } else {
    content = <div className="composed-clock"><Clock3 aria-hidden="true" /><strong>{now.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}</strong><p>{formatDate(now, payload.synagogue.timezone)}</p></div>;
  }

  return <article className="composed-content-block">{block === "halachot" ? null : <h3>{blockTitles[block]}</h3>}{content}</article>;
}

function Rows({ rows, empty }: { rows: [string, string][]; empty: string }) {
  return rows.length ? <div className="composed-rows">{rows.map(([title, detail], index) => <div key={`${title}-${index}`}><strong>{title}</strong><span>{detail}</span></div>)}</div> : <Empty text={empty} />;
}

function Empty({ text = "אין נתונים להצגה" }: { text?: string }) {
  return <p className="composed-empty">{text}</p>;
}
