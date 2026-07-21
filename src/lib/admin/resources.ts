import {
  demoCongregants,
  demoHalachot,
  demoIluyNeshama,
  demoMessages,
  demoParnasim,
  demoPrayerTimes,
  demoScreens,
  demoSettings,
  demoShiurim,
  demoSynagogue,
} from "@/lib/demo-data";

export type AdminResourceKey =
  | "screens"
  | "messages"
  | "prayer-times"
  | "shiurim"
  | "iluy-neshama"
  | "halachot"
  | "parnasim"
  | "congregants"
  | "team-invitations"
  | "settings"
  | "board-settings";

interface ResourceConfig {
  table: string;
  demoRows: unknown[];
  orderBy?: string;
  singleton?: boolean;
}

export const adminResources: Record<AdminResourceKey, ResourceConfig> = {
  screens: { table: "screens", demoRows: demoScreens, orderBy: "sort_order" },
  messages: { table: "messages", demoRows: demoMessages, orderBy: "start_date" },
  "prayer-times": { table: "prayer_times", demoRows: demoPrayerTimes, orderBy: "minyan_number" },
  shiurim: { table: "shiurim", demoRows: demoShiurim, orderBy: "title" },
  "iluy-neshama": { table: "iluy_neshama", demoRows: demoIluyNeshama, orderBy: "deceased_name" },
  halachot: { table: "halachot", demoRows: demoHalachot, orderBy: "category" },
  parnasim: { table: "parnasim", demoRows: demoParnasim, orderBy: "start_date" },
  congregants: { table: "congregants", demoRows: demoCongregants, orderBy: "full_name" },
  "team-invitations": { table: "synagogue_invitations", demoRows: [], orderBy: "created_at" },
  settings: { table: "synagogues", demoRows: [demoSynagogue], singleton: true },
  "board-settings": { table: "board_settings", demoRows: [demoSettings], singleton: true },
};

export function isAdminResourceKey(value: string): value is AdminResourceKey {
  return value in adminResources;
}
