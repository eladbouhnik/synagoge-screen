import { BoardShell } from "@/components/board/board-shell";
import { getBoardPayload } from "@/lib/data/board";

export default async function BoardPage(props: { params: Promise<{ boardKey: string }> }) {
  const { boardKey } = await props.params;
  const payload = await getBoardPayload(boardKey);

  return <BoardShell boardKey={boardKey} initialPayload={payload} />;
}
