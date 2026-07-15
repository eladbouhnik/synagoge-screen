import { getBoardPayload } from "@/lib/data/board";
import { BoardShell } from "@/components/board/board-shell";

export default async function PreviewPage() {
  const payload = await getBoardPayload("demo-board");

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="origin-top-right scale-[0.42] md:scale-50 lg:scale-[0.62]" style={{ width: "161.3%", height: "161.3%" }}>
        <BoardShell boardKey="demo-board" initialPayload={payload} />
      </div>
    </div>
  );
}
