/**
 * Admin Stats API Endpoint
 * Returns statistics for the admin dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { lawFirms } from '@/db/schema';
import { eq, count, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // TODO: Add proper admin role checking
    // For now, allow any authenticated user

    // Get firm statistics
    const [
      pendingFirms,
      verifiedFirms,
      rejectedFirms,
      totalApplications,
    ] = await Promise.all([
      db
        .select({ count: count() })
        .from(lawFirms)
        .where(eq(lawFirms.isVerified, false)),
      
      db
        .select({ count: count() })
        .from(lawFirms)
        .where(eq(lawFirms.isVerified, true)),
      
      db
        .select({ count: count() })
        .from(lawFirms)
        .where(eq(lawFirms.subscriptionStatus, 'rejected')),
      
      db
        .select({ count: count() })
        .from(lawFirms),
    ]);

    return NextResponse.json({
      pendingFirms: pendingFirms[0]?.count || 0,
      verifiedFirms: verifiedFirms[0]?.count || 0,
      rejectedFirms: rejectedFirms[0]?.count || 0,
      totalApplications: totalApplications[0]?.count || 0,
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to fetch admin statistics',
      },
      { status: 500 }
    );
  }
}