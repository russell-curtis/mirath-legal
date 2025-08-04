/**
 * Individual Matter API
 * Handles GET, PUT, DELETE operations for specific matters
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getDevAuth, isDevMode } from '@/lib/dev-auth';
import { db } from '@/db/drizzle';
import { matters, lawFirms, lawFirmMembers, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET: Get individual matter details
export async function GET(
  request: NextRequest,
  { params }: { params: { matterId: string } }
) {
  try {
    const { matterId } = params;

    // Authenticate user (with development mode support)
    let userId: string;
    
    if (isDevMode()) {
      const devAuth = await getDevAuth();
      userId = devAuth?.user.id || 'dev-user-001';
      console.log('🚀 DEVELOPMENT MODE: Using mock authentication for matter detail');
    } else {
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

    // Get user's law firm
    const userFirmMembership = await db.select()
      .from(lawFirmMembers)
      .where(eq(lawFirmMembers.userId, userId))
      .limit(1);

    if (userFirmMembership.length === 0) {
      return NextResponse.json(
        { error: 'User is not associated with any law firm' },
        { status: 400 }
      );
    }

    const lawFirmId = userFirmMembership[0].lawFirmId;

    // Get matter with joins
    const matterResult = await db.select({
      id: matters.id,
      matterNumber: matters.matterNumber,
      title: matters.title,
      description: matters.description,
      matterType: matters.matterType,
      status: matters.status,
      priority: matters.priority,
      dueDate: matters.dueDate,
      createdAt: matters.createdAt,
      updatedAt: matters.updatedAt,
      clientId: matters.clientId,
      assignedLawyerId: matters.assignedLawyerId,
      lawFirmId: matters.lawFirmId,
      clientName: user.name,
      clientEmail: user.email,
      lawFirmName: lawFirms.name
    })
    .from(matters)
    .leftJoin(user, eq(matters.clientId, user.id))
    .leftJoin(lawFirms, eq(matters.lawFirmId, lawFirms.id))
    .where(and(
      eq(matters.id, matterId),
      eq(matters.lawFirmId, lawFirmId) // Ensure user can only access matters from their firm
    ))
    .limit(1);

    if (matterResult.length === 0) {
      return NextResponse.json(
        { error: 'Matter not found or access denied' },
        { status: 404 }
      );
    }

    const matter = matterResult[0];

    // Get assigned lawyer name
    const assignedLawyer = await db.select({
      id: user.id,
      name: user.name,
      email: user.email
    })
    .from(user)
    .where(eq(user.id, matter.assignedLawyerId))
    .limit(1);

    // Transform data for frontend
    const transformedMatter = {
      id: matter.id,
      matterNumber: matter.matterNumber,
      title: matter.title,
      description: matter.description,
      clientName: matter.clientName || 'Unknown Client',
      clientEmail: matter.clientEmail,
      clientId: matter.clientId,
      matterType: matter.matterType,
      status: matter.status,
      priority: matter.priority,
      assignedLawyer: assignedLawyer[0]?.name || 'Unassigned',
      assignedLawyerId: matter.assignedLawyerId,
      assignedLawyerEmail: assignedLawyer[0]?.email,
      createdAt: matter.createdAt ? matter.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: matter.updatedAt ? matter.updatedAt.toISOString() : new Date().toISOString(),
      dueDate: matter.dueDate ? (matter.dueDate instanceof Date ? matter.dueDate.toISOString() : new Date(matter.dueDate).toISOString()) : undefined,
      lawFirmName: matter.lawFirmName,
      lawFirmId: matter.lawFirmId,
      progress: getProgressForStatus(matter.status),
    };

    return NextResponse.json({
      success: true,
      matter: transformedMatter
    });

  } catch (error) {
    console.error('Matter detail error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch matter',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT: Update matter details
export async function PUT(
  request: NextRequest,
  { params }: { params: { matterId: string } }
) {
  try {
    const { matterId } = params;

    // Authenticate user (with development mode support)
    let userId: string;
    
    if (isDevMode()) {
      const devAuth = await getDevAuth();
      userId = devAuth?.user.id || 'dev-user-001';
      console.log('🚀 DEVELOPMENT MODE: Using mock authentication for matter update');
    } else {
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

    const body = await request.json();
    const { 
      title, 
      description,
      status,
      priority,
      dueDate,
      assignedLawyerId
    } = body;

    // Get user's law firm
    const userFirmMembership = await db.select()
      .from(lawFirmMembers)
      .where(eq(lawFirmMembers.userId, userId))
      .limit(1);

    if (userFirmMembership.length === 0) {
      return NextResponse.json(
        { error: 'User is not associated with any law firm' },
        { status: 400 }
      );
    }

    const lawFirmId = userFirmMembership[0].lawFirmId;

    // Verify matter exists and belongs to user's firm
    const existingMatter = await db.select()
      .from(matters)
      .where(and(
        eq(matters.id, matterId),
        eq(matters.lawFirmId, lawFirmId)
      ))
      .limit(1);

    if (existingMatter.length === 0) {
      return NextResponse.json(
        { error: 'Matter not found or access denied' },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assignedLawyerId !== undefined) updateData.assignedLawyerId = assignedLawyerId;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    // Update matter
    const [updatedMatter] = await db.update(matters)
      .set(updateData)
      .where(eq(matters.id, matterId))
      .returning();

    return NextResponse.json({
      success: true,
      matter: {
        id: updatedMatter.id,
        matterNumber: updatedMatter.matterNumber,
        title: updatedMatter.title,
        description: updatedMatter.description,
        matterType: updatedMatter.matterType,
        status: updatedMatter.status,
        priority: updatedMatter.priority,
        updatedAt: updatedMatter.updatedAt.toISOString(),
        dueDate: updatedMatter.dueDate ? (updatedMatter.dueDate instanceof Date ? updatedMatter.dueDate.toISOString() : new Date(updatedMatter.dueDate).toISOString()) : undefined,
      }
    });

  } catch (error) {
    console.error('Matter update error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update matter',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete matter (soft delete by marking inactive)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { matterId: string } }
) {
  try {
    const { matterId } = params;

    // Authenticate user (with development mode support)
    let userId: string;
    
    if (isDevMode()) {
      const devAuth = await getDevAuth();
      userId = devAuth?.user.id || 'dev-user-001';
      console.log('🚀 DEVELOPMENT MODE: Using mock authentication for matter deletion');
    } else {
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

    // Get user's law firm
    const userFirmMembership = await db.select()
      .from(lawFirmMembers)
      .where(eq(lawFirmMembers.userId, userId))
      .limit(1);

    if (userFirmMembership.length === 0) {
      return NextResponse.json(
        { error: 'User is not associated with any law firm' },
        { status: 400 }
      );
    }

    const lawFirmId = userFirmMembership[0].lawFirmId;

    // Verify matter exists and belongs to user's firm
    const existingMatter = await db.select()
      .from(matters)
      .where(and(
        eq(matters.id, matterId),
        eq(matters.lawFirmId, lawFirmId)
      ))
      .limit(1);

    if (existingMatter.length === 0) {
      return NextResponse.json(
        { error: 'Matter not found or access denied' },
        { status: 404 }
      );
    }

    // For now, we'll do a hard delete. In production, consider soft delete
    await db.delete(matters)
      .where(eq(matters.id, matterId));

    return NextResponse.json({
      success: true,
      message: 'Matter deleted successfully'
    });

  } catch (error) {
    console.error('Matter deletion error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete matter',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate progress based on status
function getProgressForStatus(status: string): number {
  switch (status) {
    case 'intake':
      return 10;
    case 'draft':
      return 40;
    case 'review':
      return 70;
    case 'client_review':
      return 85;
    case 'complete':
      return 100;
    case 'registered':
      return 100;
    default:
      return 0;
  }
}