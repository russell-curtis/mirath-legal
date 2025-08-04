/**
 * Matters Management API
 * Handles CRUD operations for legal matters
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getDevAuth, isDevMode } from '@/lib/dev-auth';
import { db } from '@/db/drizzle';
import { matters, lawFirms, lawFirmMembers, user } from '@/db/schema';
import { eq, and, desc, asc, ilike, or } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// GET: List all matters for the authenticated user's law firm
export async function GET(request: NextRequest) {
  try {
    // Authenticate user (with development mode support)
    let userId: string;
    
    if (isDevMode()) {
      const devAuth = await getDevAuth();
      userId = devAuth?.user.id || 'dev-user-001';
      console.log('🚀 DEVELOPMENT MODE: Using mock authentication for matters list');
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
    
    // Query parameters
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const matterType = searchParams.get('matterType');
    const priority = searchParams.get('priority');
    const assignedLawyer = searchParams.get('assignedLawyer');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get user's law firm
    const userFirmMembership = await db.select()
      .from(lawFirmMembers)
      .where(eq(lawFirmMembers.userId, userId))
      .limit(1);

    if (userFirmMembership.length === 0) {
      return NextResponse.json(
        { 
          error: 'User is not associated with any law firm',
          matters: [],
          pagination: { total: 0, page, limit, totalPages: 0 }
        },
        { status: 200 }
      );
    }

    const lawFirmId = userFirmMembership[0].lawFirmId;

    // Build query conditions
    let whereConditions = [eq(matters.lawFirmId, lawFirmId)];

    if (status && status !== 'all') {
      whereConditions.push(eq(matters.status, status as any));
    }

    if (matterType && matterType !== 'all') {
      whereConditions.push(eq(matters.matterType, matterType as any));
    }

    if (priority && priority !== 'all') {
      whereConditions.push(eq(matters.priority, priority as any));
    }

    if (assignedLawyer && assignedLawyer !== 'all') {
      whereConditions.push(eq(matters.assignedLawyerId, assignedLawyer));
    }

    // Search functionality
    if (search) {
      const searchConditions = [
        ilike(matters.title, `%${search}%`),
        ilike(matters.matterNumber, `%${search}%`),
        ilike(matters.description, `%${search}%`)
      ];
      whereConditions.push(or(...searchConditions));
    }

    // Get total count for pagination
    const totalCountResult = await db.select({ count: matters.id })
      .from(matters)
      .where(and(...whereConditions));
    
    const totalCount = totalCountResult.length;

    // Determine sort order
    const orderBy = sortOrder === 'asc' ? asc : desc;
    let sortColumn;
    switch (sortBy) {
      case 'title':
        sortColumn = matters.title;
        break;
      case 'status':
        sortColumn = matters.status;
        break;
      case 'priority':
        sortColumn = matters.priority;
        break;
      case 'dueDate':
        sortColumn = matters.dueDate;
        break;
      default:
        sortColumn = matters.createdAt;
    }

    // Execute main query with joins
    const mattersResult = await db.select({
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
      clientName: user.name,
      clientEmail: user.email,
      assignedLawyerId: matters.assignedLawyerId,
      lawFirmName: lawFirms.name
    })
    .from(matters)
    .leftJoin(user, eq(matters.clientId, user.id))
    .leftJoin(lawFirms, eq(matters.lawFirmId, lawFirms.id))
    .where(and(...whereConditions))
    .orderBy(orderBy(sortColumn))
    .limit(limit)
    .offset(offset);

    // Get assigned lawyer names in a separate query to avoid complex joins
    const lawyerIds = [...new Set(mattersResult.map(m => m.assignedLawyerId).filter(Boolean))];
    const lawyers = lawyerIds.length > 0 ? await db.select({
      id: user.id,
      name: user.name
    })
    .from(user)
    .where(or(...lawyerIds.map(id => eq(user.id, id)))) : [];
    
    const lawyerMap = new Map(lawyers.map(l => [l.id, l.name]));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);

    // Transform data for frontend
    const transformedMatters = mattersResult.map(matter => ({
      id: matter.id,
      matterNumber: matter.matterNumber,
      title: matter.title,
      description: matter.description,
      clientName: matter.clientName || 'Unknown Client',
      clientEmail: matter.clientEmail,
      matterType: matter.matterType,
      status: matter.status,
      priority: matter.priority,
      assignedLawyer: lawyerMap.get(matter.assignedLawyerId) || 'Unassigned',
      createdAt: matter.createdAt ? matter.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: matter.updatedAt ? matter.updatedAt.toISOString() : new Date().toISOString(),  
      dueDate: matter.dueDate ? (matter.dueDate instanceof Date ? matter.dueDate.toISOString() : new Date(matter.dueDate).toISOString()) : undefined,
      lawFirmName: matter.lawFirmName,
      // Calculate mock progress based on status
      progress: getProgressForStatus(matter.status),
    }));

    return NextResponse.json({
      success: true,
      matters: transformedMatters,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        search,
        status,
        matterType,
        priority,
        assignedLawyer,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Matters list error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch matters',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST: Create a new matter
export async function POST(request: NextRequest) {
  try {
    // Authenticate user (with development mode support)
    let userId: string;
    
    if (isDevMode()) {
      const devAuth = await getDevAuth();
      userId = devAuth?.user.id || 'dev-user-001';
      console.log('🚀 DEVELOPMENT MODE: Using mock authentication for matter creation');
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

    const body = await request.json();
    const { 
      title, 
      description,
      clientId, 
      matterType, 
      priority = 'normal',
      dueDate,
      assignedLawyerId
    } = body;

    // Validate required fields
    if (!title || !clientId || !matterType) {
      return NextResponse.json(
        { error: 'Missing required fields: title, clientId, and matterType are required' },
        { status: 400 }
      );
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

    // Generate matter number
    const year = new Date().getFullYear();
    const count = await db.select({ count: matters.id })
      .from(matters)
      .where(eq(matters.lawFirmId, lawFirmId));
    
    const matterNumber = `ML-${year}-${String(count.length + 1).padStart(3, '0')}`;

    // Create matter
    const [newMatter] = await db.insert(matters).values({
      lawFirmId,
      clientId,
      assignedLawyerId: assignedLawyerId || userId,
      matterNumber,
      title,
      description,
      matterType,
      status: 'intake',
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
    }).returning();

    return NextResponse.json({
      success: true,
      matter: {
        id: newMatter.id,
        matterNumber: newMatter.matterNumber,
        title: newMatter.title,
        description: newMatter.description,
        matterType: newMatter.matterType,
        status: newMatter.status,
        priority: newMatter.priority,
        createdAt: newMatter.createdAt.toISOString(),
        dueDate: newMatter.dueDate ? (newMatter.dueDate instanceof Date ? newMatter.dueDate.toISOString() : new Date(newMatter.dueDate).toISOString()) : undefined,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Matter creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create matter',
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