import { BoardShell } from "@/components/board/board-shell";
import { getBoardPayload } from "@/lib/data/board";

export default async function BoardPage(props: {
  params: Promise<{ boardKey: string }>;
  searchParams: Promise<{ lock?: string }>;
}) {
  const { boardKey } = await props.params;
  const { lock } = await props.searchParams;
  const payload = await getBoardPayload(boardKey);
  const disableLocks = lock === "0" || lock === "false";

  return <BoardShell boardKey={boardKey} initialPayload={payload} disableLocks={disableLocks} />;
}
