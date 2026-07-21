import { getBoardPayload } from "@/lib/data/board";
import { getAdminSynagogue } from "@/lib/admin/synagogue";
import { demoSynagogue } from "@/lib/demo-data";
import { BoardShell } from "@/components/board/board-shell";

export default async function PreviewPage() {
  const synagogue = (await getAdminSynagogue()) ?? demoSynagogue;
  const payload = await getBoardPayload(synagogue.board_key);

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="origin-top-right scale-[0.42] md:scale-50 lg:scale-[0.62]" style={{ width: "161.3%", height: "161.3%" }}>
        <BoardShell boardKey={synagogue.board_key} initialPayload={payload} disableLocks />
      </div>
    </div>
  );
}
