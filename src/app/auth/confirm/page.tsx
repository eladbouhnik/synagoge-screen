import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/server";
import { confirmEmail } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "אישור מייל | לוח בית הכנסת" };

function param(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const next = param(params.next) || "/welcome";

  if (!hasSupabaseEnv()) redirect(next);

  const code = param(params.code);
  const tokenHash = param(params.token_hash);
  const type = param(params.type);

  if (!code && !(tokenHash && type)) redirect("/login?error=confirm");

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-background px-5 py-10">
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-8 text-center shadow-[0_20px_40px_-24px_oklch(0.25_0.04_255/0.35)]">
        <div className="mx-auto h-1 w-12 rounded-full bg-[var(--board-gold)]" />
        <h1 className="mt-4 text-2xl font-black">אישור כתובת המייל</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          לחיצה אחת אחרונה כדי לאשר ולפתוח את הלוח שלכם.
        </p>
        <form action={confirmEmail} className="mt-6">
          <input type="hidden" name="code" value={code} />
          <input type="hidden" name="token_hash" value={tokenHash} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="next" value={next} />
          <Button type="submit" size="lg" className="w-full">
            אישור המייל ופתיחת הלוח
          </Button>
        </form>
      </div>
    </main>
  );
}
