import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "כניסה | לוח בית הכנסת" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <LoginForm
      initialError={
        error === "confirm"
          ? "אישור המייל נכשל או שפג תוקף הקישור. נסו להתחבר, או הירשמו שוב לקבלת קישור חדש."
          : null
      }
    />
  );
}
