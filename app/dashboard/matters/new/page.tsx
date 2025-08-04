/**
 * Create New Matter Page
 * Form to create new legal matters for law firm clients
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDevAuth, isDevMode } from "@/lib/dev-auth";
import { CreateMatterForm } from "./_components/create-matter-form";

export default async function NewMatterPage() {
  let userId: string;
  
  // Check for development mode first
  if (isDevMode()) {
    const devAuth = await getDevAuth();
    userId = devAuth?.user.id || 'dev-user-001';
    console.log('🚀 DEVELOPMENT MODE: Using mock authentication for new matter page');
  } else {
    // Production authentication
    const result = await auth.api.getSession({
      headers: await headers(),
    });

    if (!result?.session?.userId) {
      redirect("/sign-in");
    }
    
    userId = result.session.userId;
  }

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col items-start justify-center gap-2 mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">
            Create New Matter
          </h1>
          <p className="text-muted-foreground">
            Set up a new estate planning matter for your client.
          </p>
        </div>
        <CreateMatterForm userId={userId} />
      </div>
    </section>
  );
}