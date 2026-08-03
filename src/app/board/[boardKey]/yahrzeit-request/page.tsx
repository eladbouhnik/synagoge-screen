import type { Metadata } from "next";
import { getBoardPayload } from "@/lib/data/board";
import { YahrzeitRequestForm } from "@/components/public/yahrzeit-request-form";

export const metadata: Metadata = { title: "בקשת עילוי נשמת | לוח בית הכנסת" };

export default async function YahrzeitRequestPage(props: { params: Promise<{ boardKey: string }> }) {
  const { boardKey } = await props.params;
  const payload = await getBoardPayload(boardKey);

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-background px-5 py-10">
      <YahrzeitRequestForm boardKey={boardKey} synagogueName={payload.synagogue.name} />
    </main>
  );
}
