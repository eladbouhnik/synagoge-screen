import { getBoardPayload } from "@/lib/data/board";
import { getAdminSynagogue } from "@/lib/admin/synagogue";
import { demoSynagogue } from "@/lib/demo-data";
import { TimeTravelSimulator } from "@/components/admin/time-travel-simulator";

export default async function PreviewPage() {
  const synagogue = (await getAdminSynagogue()) ?? demoSynagogue;
  const payload = await getBoardPayload(synagogue.board_key);

  return (
    <TimeTravelSimulator
      boardKey={synagogue.board_key}
      initialPayload={payload}
      timezone={synagogue.timezone}
    />
  );
}
