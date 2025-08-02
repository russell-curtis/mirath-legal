/**
 * Clients Management Page
 * Lists and manages clients for law firm
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ClientsView } from "../_components/clients-view";

export default async function ClientsPage() {
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
            Clients
          </h1>
          <p className="text-muted-foreground">
            Manage your client relationships and contact information.
          </p>
        </div>
        <ClientsView userId={result.session.userId} />
      </div>
    </section>
  );
}