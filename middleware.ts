import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /api/payments/webhooks is a webhook endpoint that should be accessible without authentication
  if (pathname.startsWith("/api/payments/webhooks")) {
    return NextResponse.next();
  }

  // Let the dashboard page handle its own authentication
  // Remove automatic redirects that cause loops
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
