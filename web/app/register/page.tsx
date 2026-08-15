import { Metadata } from "next";
import { RegistrationForm } from "@/components/register/registration-form";
import { EpdLogo } from "@/components/ui/logo";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: strings.form.title,
};

export default function RegisterPage() {
  return (
    <main className="w-full max-w-xl mx-auto py-12 px-4 sm:px-6">
      {/* Header section with brand logo */}
      <header className="mb-8 space-y-4 text-start">
        <div className="flex items-center justify-between">
          <EpdLogo className="h-16 w-auto" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            {strings.form.title}
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            {strings.form.subtitle || "برای حضور در نشست بعدی، لطفاً اطلاعات زیر را با دقت تکمیل کنید."}
          </p>
        </div>
      </header>

      {/* Registration Card */}
      <section className="epd-card p-6 sm:p-8">
        <RegistrationForm />
      </section>
    </main>
  );
}

