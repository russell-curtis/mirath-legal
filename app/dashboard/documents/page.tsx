/**
 * Document Management Page
 * Provides document listing, preview, download, and version control
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DocumentManagement } from "./_components/document-management";

export default async function DocumentsPage() {
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
            Document Management
          </h1>
          <p className="text-muted-foreground">
            Manage all your legal documents, wills, and supporting files with preview and version control.
          </p>
        </div>
        
        <DocumentManagement userId={result.session.userId} />
      </div>
    </section>
  );
}