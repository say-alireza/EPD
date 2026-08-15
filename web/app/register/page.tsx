import { Metadata } from "next";
import { RegistrationForm } from "@/components/register/registration-form";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: strings.form.title,
};

export default function RegisterPage() {
  return (
    <main className="w-full max-w-xl mx-auto py-12 px-4 sm:px-6">
      {/* Header section with brand indicator */}
      <header className="mb-8 space-y-2 text-start">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-border rounded text-xs text-brand-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-cta-500 inline-block" />
          <span>گفت‌وگو و توسعه فردی</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-heading">
          {strings.form.title}
        </h1>
        <p className="text-sm text-muted">
          برای حضور در نشست بعدی، لطفاً اطلاعات زیر را با دقت تکمیل کنید.
        </p>
      </header>

      {/* Registration Card */}
      <section className="epd-card p-6 sm:p-8">
        <RegistrationForm />
      </section>
    </main>
  );
}
