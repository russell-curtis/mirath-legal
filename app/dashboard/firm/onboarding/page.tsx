/**
 * Law Firm Onboarding Page
 * Multi-step registration process for law firms joining the platform
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FirmOnboardingWizard } from "./_components/firm-onboarding-wizard";

export default async function FirmOnboardingPage() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result?.session?.userId) {
    redirect("/sign-in");
  }

  return (
    <section className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Mirath Legal
          </h1>
          <p className="text-lg text-gray-600">
            Let's set up your law firm on our estate planning platform
          </p>
        </div>
        
        <FirmOnboardingWizard userId={result.session.userId} />
      </div>
    </section>
  );
}