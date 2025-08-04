/**
 * Will Creation Page
 * Multi-step wizard for creating DIFC-compliant wills with AI assistance
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { WillCreationWizard } from "../_components/will-creation-wizard";
import { getDevAuth, isDevMode } from "@/lib/dev-auth";

export default async function NewWillPage() {
  let userId: string;
  
  // Check for development mode first
  if (isDevMode()) {
    const devAuth = await getDevAuth();
    userId = devAuth?.user.id || 'dev-user-001';
    console.log('🚀 DEVELOPMENT MODE: Using mock authentication for will creation');
    console.log('👤 Mock User ID:', userId);
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
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex flex-col items-start justify-center gap-2 mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">
            Create New Will
          </h1>
          <p className="text-muted-foreground">
            Guided wizard to create a DIFC-compliant will with AI assistance.
          </p>
        </div>
        <WillCreationWizard userId={userId} />
      </div>
    </section>
  );
}