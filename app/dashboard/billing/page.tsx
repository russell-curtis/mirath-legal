/**
 * Billing Management Page
 * Manages billing, time tracking, and financial aspects for law firm
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ManageSubscription } from "../payment/_components/manage-subscription";

export default async function BillingPage() {
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
            Billing & Subscription
          </h1>
          <p className="text-muted-foreground">
            Manage your subscription, billing, and time tracking for client matters.
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Subscription Management */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Subscription Management</h2>
            <ManageSubscription />
          </div>

          {/* Time Tracking and Billing - Coming Soon */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Advanced Billing Features Coming Soon</h2>
            <p className="text-gray-600 mb-4">
              Professional billing and time tracking features are being developed:
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600">
              <li>• Time tracking for billable hours</li>
              <li>• Automated invoice generation</li>
              <li>• Client billing and payment processing</li>
              <li>• Matter-based expense tracking</li>
              <li>• Financial reporting and analytics</li>
              <li>• Integration with UAE accounting standards</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}