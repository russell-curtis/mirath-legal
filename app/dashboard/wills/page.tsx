/**
 * Wills Management Page
 * Lists and manages wills for law firm
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { WillsView } from "../_components/wills-view";

export default async function WillsPage() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result?.session?.userId) {
    redirect("/sign-in");
  }

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full">
        <div className="flex flex-col items-start justify-center gap-2 mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">
            Wills
          </h1>
          <p className="text-muted-foreground">
            Manage DIFC-compliant wills and estate planning documents.
          </p>
        </div>
        <WillsView userId={result.session.userId} />
      </div>
    </section>
  );
}