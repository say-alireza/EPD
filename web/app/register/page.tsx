import { Metadata } from "next";
import { RegistrationForm } from "@/components/register/registration-form";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: strings.form.title,
};

export default function RegisterPage() {
  return (
    <main className="max-w-xl mx-auto py-8 px-4" dir="rtl">
      <h1 className="text-2xl font-bold text-text mb-6">{strings.form.title}</h1>
      <RegistrationForm />
    </main>
  );
}
