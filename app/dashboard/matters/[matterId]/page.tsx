/**
 * Matter Detail Page
 * View and manage individual matter details with status updates
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDevAuth, isDevMode } from "@/lib/dev-auth";
import { MatterDetailView } from "./_components/matter-detail-view";

export default async function MatterDetailPage({
  params,
}: {
  params: { matterId: string };
}) {
  let userId: string;
  
  // Check for development mode first
  if (isDevMode()) {
    const devAuth = await getDevAuth();
    userId = devAuth?.user.id || 'dev-user-001';
    console.log('🚀 DEVELOPMENT MODE: Using mock authentication for matter detail page');
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
      <div className="w-full max-w-6xl">
        <MatterDetailView matterId={params.matterId} userId={userId} />
      </div>
    </section>
  );
}