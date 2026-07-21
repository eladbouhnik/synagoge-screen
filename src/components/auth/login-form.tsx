"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Field, PasswordInput, TextInput } from "@/components/ui/field";

const demoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL;

export function LoginForm({ initialError = null }: { initialError?: string | null }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(initialError);
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      const supabase = createClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
      if (loginError) {
        if (loginError.message.includes("Email not confirmed")) {
          setError("האימייל עדיין לא אומת. בדקו את תיבת המייל ולחצו על קישור האישור ששלחנו.");
        } else if (loginError.message.includes("Invalid login credentials")) {
          setError("האימייל או הסיסמה שגויים. נסו שוב.");
        } else {
          setError(`ההתחברות נכשלה: ${loginError.message}`);
        }
        setPending(false);
        return;
      }
      router.push("/welcome");
    } catch {
      setError("שגיאה בהתחברות. נסו שוב.");
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-xl border border-border bg-background p-8 shadow-[0_20px_40px_-24px_oklch(0.25_0.04_255/0.35)]">
        <div className="h-1 w-12 rounded-full bg-[var(--board-gold)]" />
        <h1 className="mt-4 text-3xl font-black">כניסה לחשבון</h1>
        <p className="mt-1 text-sm text-muted-foreground">ניהול הלוח של בית הכנסת שלכם</p>

        {demoMode ? (
          <div className="mt-6 grid gap-4">
            <p className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
              מצב הדגמה פעיל — אין צורך בהתחברות. אפשר להיכנס ישירות ולנסות את המערכת.
            </p>
            <Button size="lg" onClick={() => router.push("/welcome")}>
              <LogIn className="h-5 w-5" />
              כניסה למצב הדגמה
            </Button>
          </div>
        ) : (
          <form action={submit} className="mt-6 grid gap-4">
            <Field label="אימייל">
              <TextInput name="email" type="email" autoComplete="email" required dir="ltr" />
            </Field>
            <Field label="סיסמה">
              <PasswordInput name="password" autoComplete="current-password" required dir="ltr" />
            </Field>
            {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p> : null}
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "מתחברים..." : "כניסה"}
            </Button>
          </form>
        )}
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        עוד אין לכם חשבון?{" "}
        <Link href="/signup" className="font-bold text-foreground underline decoration-[var(--board-gold)] underline-offset-4">
          פתיחת חשבון חדש
        </Link>
      </p>
    </div>
  );
}
