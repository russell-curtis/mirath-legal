/**
 * Appointments Booking Page
 * Allows users to schedule legal services including notarization and legal reviews
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppointmentBooking } from "./_components/appointment-booking";

export default async function AppointmentsPage() {
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
            Schedule Appointment
          </h1>
          <p className="text-muted-foreground">
            Book legal services including notarization, legal reviews, and DIFC registration assistance.
          </p>
        </div>
        
        <AppointmentBooking userId={result.session.userId} />
      </div>
    </section>
  );
}