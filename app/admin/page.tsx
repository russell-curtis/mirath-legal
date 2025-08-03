/**
 * Admin Dashboard
 * For Mirath Legal staff to manage firm verifications
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminDashboard } from "./_components/admin-dashboard";

export default async function AdminPage() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result?.session?.userId) {
    redirect("/sign-in");
  }

  // TODO: Add proper admin role checking
  // For now, we'll allow any authenticated user to access admin
  // In production, check if user has admin role

  return <AdminDashboard userId={result.session.userId} />;
}