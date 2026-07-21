"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailCheck, Sparkles } from "lucide-react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { ensureSynagogue } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Field, PasswordInput, TextInput } from "@/components/ui/field";

const demoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL;

const signupSchema = z.object({
  synagogueName: z.string().trim().min(2, "הזינו את שם בית הכנסת"),
  email: z.string().trim().email("כתובת אימייל לא תקינה"),
  password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים"),
});

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [awaitingEmail, setAwaitingEmail] = useState(false);

  async function submit(formData: FormData) {
    setError(null);
    const parsed = signupSchema.safeParse({
      synagogueName: formData.get("synagogueName"),
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "בדקו את הפרטים שהוזנו");
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      const { data, error: signupError } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: { synagogue_name: parsed.data.synagogueName },
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/welcome`,
        },
      });
      if (signupError) {
        setError(
          signupError.message.includes("already registered")
            ? "כתובת האימייל כבר רשומה. נסו להתחבר."
            : "ההרשמה נכשלה. נסו שוב.",
        );
        setPending(false);
        return;
      }
      if (data.session) {
        // Email confirmation disabled: bootstrap the synagogue now.
        await ensureSynagogue();
        router.push("/welcome");
        return;
      }
      // Email confirmation required: synagogue is created lazily on first login.
      setAwaitingEmail(true);
      setPending(false);
    } catch {
      setError("שגיאה בהרשמה. נסו שוב.");
      setPending(false);
    }
  }

  if (awaitingEmail) {
    return (
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-8 text-center shadow-[0_20px_40px_-24px_oklch(0.25_0.04_255/0.35)]">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted text-[var(--accent)]">
          <MailCheck className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-2xl font-black">בדקו את תיבת המייל</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          שלחנו קישור אישור לכתובת שהזנתם. אחרי האישור, התחברו והלוח שלכם יחכה מוכן.
        </p>
        <Button className="mt-6 w-full" variant="outline" onClick={() => router.push("/login")}>
          לעמוד ההתחברות
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-xl border border-border bg-background p-8 shadow-[0_20px_40px_-24px_oklch(0.25_0.04_255/0.35)]">
        <div className="h-1 w-12 rounded-full bg-[var(--board-gold)]" />
        <h1 className="mt-4 text-3xl font-black">פתיחת חשבון</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          תוך דקות: לוח דיגיטלי חדש עם זמני תפילות, הודעות והלכה יומית
        </p>

        {demoMode ? (
          <div className="mt-6 grid gap-4">
            <p className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
              מצב הדגמה פעיל — הרשמה אינה נדרשת. אפשר לנסות את המערכת מיד.
            </p>
            <Button size="lg" onClick={() => router.push("/welcome")}>
              <Sparkles className="h-5 w-5" />
              כניסה למצב הדגמה
            </Button>
          </div>
        ) : (
          <form action={submit} className="mt-6 grid gap-4">
            <Field label="שם בית הכנסת" hint="יופיע בראש הלוח, ואפשר לשנות בהמשך">
              <TextInput name="synagogueName" placeholder='לדוגמה: בית הכנסת "אור החיים"' required />
            </Field>
            <Field label="אימייל">
              <TextInput name="email" type="email" autoComplete="email" required dir="ltr" />
            </Field>
            <Field label="סיסמה" hint="לפחות 8 תווים">
              <PasswordInput name="password" autoComplete="new-password" required dir="ltr" />
            </Field>
            {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p> : null}
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "יוצרים חשבון..." : "יצירת חשבון ולוח חדש"}
            </Button>
          </form>
        )}
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        כבר יש לכם חשבון?{" "}
        <Link href="/login" className="font-bold text-foreground underline decoration-[var(--board-gold)] underline-offset-4">
          התחברות
        </Link>
      </p>
    </div>
  );
}
