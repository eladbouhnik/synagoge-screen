"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setError(null);
    try {
      const supabase = createClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
      if (loginError) setError(loginError.message);
      else router.push("/admin");
    } catch {
      router.push("/admin");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <form action={submit} className="w-full max-w-md rounded-lg border border-border bg-muted p-6">
        <p className="text-sm text-muted-foreground">כניסה לגבאים</p>
        <h1 className="mt-1 text-4xl font-black">פאנל ניהול</h1>
        <div className="mt-6 grid gap-4">
          <label className="grid gap-1.5 text-sm font-bold">
            אימייל
            <input name="email" type="email" className="h-11 rounded-md border border-border bg-background px-3 font-normal" />
          </label>
          <label className="grid gap-1.5 text-sm font-bold">
            סיסמה
            <input name="password" type="password" className="h-11 rounded-md border border-border bg-background px-3 font-normal" />
          </label>
          {error ? <p className="text-sm font-bold text-red-700">{error}</p> : null}
          <button className="h-11 rounded-md bg-primary font-bold text-primary-foreground">כניסה</button>
        </div>
      </form>
    </main>
  );
}
