/**
 * Documents Management Page
 * Lists and manages documents for law firm
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
            Documents
          </h1>
          <p className="text-muted-foreground">
            Manage legal documents, contracts, and generated files.
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Document Management Coming Soon</h2>
          <p className="text-gray-600 mb-4">
            Advanced document management features are being developed. This will include:
          </p>
          <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600">
            <li>• Secure document storage and organization</li>
            <li>• Version control for legal documents</li>
            <li>• Digital signatures and notarization</li>
            <li>• Client document sharing portal</li>
            <li>• Template management and customization</li>
          </ul>
        </div>
      </div>
    </section>
  );
}