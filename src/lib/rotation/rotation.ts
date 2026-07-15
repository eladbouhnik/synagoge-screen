import type { Screen } from "@/types/domain";

export function getVisibleScreens(screens: Screen[]) {
  return screens.filter((screen) => screen.is_visible).sort((a, b) => a.sort_order - b.sort_order);
}

export function getNextScreenIndex(currentIndex: number, screens: Screen[]) {
  if (screens.length === 0) return 0;
  return (currentIndex + 1) % screens.length;
}
