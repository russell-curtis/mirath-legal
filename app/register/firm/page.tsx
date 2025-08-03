/**
 * Firm Registration Page
 * Standalone registration process for law firms (outside dashboard)
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FirmRegistrationForm } from "./_components/firm-registration-form";

export default async function FirmRegistrationPage() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  // If user is already signed in, redirect to their dashboard
  if (result?.session?.userId) {
    redirect("/dashboard");
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">Mirath Legal</h1>
                <p className="text-sm text-gray-600">DIFC Estate Planning Platform</p>
              </div>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Register Your Law Firm
          </h2>
          <p className="text-gray-600 mb-2">
            Join the UAE's leading digital estate planning platform
          </p>
          <p className="text-sm text-blue-600 font-medium">
            ✨ 30-day trial included after verification
          </p>
        </div>
        
        <FirmRegistrationForm />
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <a href="/sign-in" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}