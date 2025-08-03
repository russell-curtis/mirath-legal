/**
 * Firm Verification Pending Page
 * Shows status while firm credentials are being verified
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { VerificationPendingView } from "./_components/verification-pending-view";

export default async function VerificationPendingPage() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result?.session?.userId) {
    redirect("/sign-in");
  }

  return <VerificationPendingView userId={result.session.userId} />;
}