/**
 * Admin Firms API Endpoint
 * Returns firms based on verification status
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { lawFirms } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

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
    
    // Get status filter from query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let whereCondition;
    switch (status) {
      case 'pending':
        whereCondition = eq(lawFirms.isVerified, false);
        break;
      case 'verified':
        whereCondition = eq(lawFirms.isVerified, true);
        break;
      case 'rejected':
        whereCondition = eq(lawFirms.subscriptionStatus, 'rejected');
        break;
      default:
        whereCondition = undefined;
    }

    // Fetch firms
    const firms = await db
      .select()
      .from(lawFirms)
      .where(whereCondition)
      .orderBy(desc(lawFirms.createdAt));

    return NextResponse.json({
      firms: firms,
      total: firms.length,
    });

  } catch (error) {
    console.error('Admin firms fetch error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to fetch firms',
      },
      { status: 500 }
    );
  }
}