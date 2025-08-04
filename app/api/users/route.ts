/**
 * Users API
 * Handles fetching users (clients, lawyers) for form dropdowns
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getDevAuth, isDevMode } from '@/lib/dev-auth';
import { db } from '@/db/drizzle';
import { user, lawFirmMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET: List users filtered by type (clients, lawyers)
export async function GET(request: NextRequest) {
  try {
    // Authenticate user (with development mode support)
    let userId: string;
    
    if (isDevMode()) {
      const devAuth = await getDevAuth();
      userId = devAuth?.user.id || 'dev-user-001';
      console.log('🚀 DEVELOPMENT MODE: Using mock authentication for users list');
    } else {
      // Production authentication
      const result = await auth.api.getSession({
        headers: await headers(),
      });

      if (!result?.session?.userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      userId = result.session.userId;
    }

    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('userType'); // 'client' or 'lawyer'
    const limit = parseInt(searchParams.get('limit') || '100');

    // Get user's law firm to ensure we only return relevant users
    const userFirmMembership = await db.select()
      .from(lawFirmMembers)
      .where(eq(lawFirmMembers.userId, userId))
      .limit(1);

    if (userFirmMembership.length === 0) {
      return NextResponse.json(
        { 
          error: 'User is not associated with any law firm',
          users: []
        },
        { status: 200 }
      );
    }

    const lawFirmId = userFirmMembership[0].lawFirmId;

    let users = [];

    if (userType === 'client') {
      // Return all clients (users with userType 'client')
      users = await db.select({
        id: user.id,
        name: user.name,
        email: user.email,
        emiratesId: user.emiratesId,
        userType: user.userType
      })
      .from(user)
      .where(eq(user.userType, 'client'))
      .limit(limit);
    } else if (userType === 'lawyer') {
      // Return lawyers who are members of the same law firm
      users = await db.select({
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType
      })
      .from(user)
      .innerJoin(lawFirmMembers, eq(user.id, lawFirmMembers.userId))
      .where(and(
        eq(user.userType, 'lawyer'),
        eq(lawFirmMembers.lawFirmId, lawFirmId)
      ))
      .limit(limit);
    } else {
      // If no userType specified, return all users (for admin purposes)
      users = await db.select({
        id: user.id,
        name: user.name,
        email: user.email,
        emiratesId: user.emiratesId,
        userType: user.userType
      })
      .from(user)
      .limit(limit);
    }

    return NextResponse.json({
      success: true,
      users,
      filters: {
        userType,
        limit
      }
    });

  } catch (error) {
    console.error('Users list error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}