import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "פתיחת חשבון | לוח בית הכנסת" };

export default function SignupPage() {
  return <SignupForm />;
}
