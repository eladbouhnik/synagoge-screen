import { ScreenDesigner } from "@/components/admin/screen-designer";
import { getAdminSynagogue } from "@/lib/admin/synagogue";
import { getBoardPayload } from "@/lib/data/board";
import { demoScreens, demoSynagogue } from "@/lib/demo-data";

export default async function ScreensPage() {
  const synagogue = (await getAdminSynagogue()) ?? demoSynagogue;
  const payload = await getBoardPayload(synagogue.board_key);

  return <ScreenDesigner initialRows={payload.screens.length ? payload.screens : demoScreens} payload={payload} />;
}
