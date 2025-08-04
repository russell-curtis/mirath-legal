/**
 * Wills Management API
 * Handles listing and searching of wills for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getDevAuth, isDevMode } from '@/lib/dev-auth';
import { db } from '@/db/drizzle';
import { wills, matters, willDocuments } from '@/db/schema';
import { eq, and, desc, asc, ilike, or } from 'drizzle-orm';
import { validateWillCompleteness, getWillTemplate } from '@/lib/will-engine';

// GET: List all wills for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Authenticate user (with development mode support)
    let userId: string;
    
    if (isDevMode()) {
      const devAuth = await getDevAuth();
      userId = devAuth?.user.id || 'dev-user-001';
      console.log('🚀 DEVELOPMENT MODE: Using mock authentication for wills list');
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const willType = searchParams.get('willType');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const includeDocuments = searchParams.get('includeDocuments') === 'true';
    const includeValidation = searchParams.get('includeValidation') === 'true';

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query conditions
    let whereConditions = [eq(wills.testatorId, userId)];

    if (status && status !== 'all') {
      whereConditions.push(eq(wills.status, status as any));
    }

    if (willType && willType !== 'all') {
      whereConditions.push(eq(wills.willType, willType as any));
    }

    if (search) {
      whereConditions.push(
        or(
          ilike(wills.personalInfo, `%${search}%`),
          ilike(wills.specialInstructions, `%${search}%`)
        )
      );
    }

    // Build sort order
    const sortColumn = sortBy === 'createdAt' ? wills.createdAt :
                      sortBy === 'updatedAt' ? wills.updatedAt :
                      sortBy === 'status' ? wills.status :
                      sortBy === 'willType' ? wills.willType :
                      wills.createdAt;

    const orderFn = sortOrder === 'asc' ? asc : desc;

    // Get total count
    const [{ count }] = await db
      .select({ count: wills.id })
      .from(wills)
      .where(and(...whereConditions));

    // Get wills with related data
    const query = db
      .select({
        will: wills,
        matter: matters,
      })
      .from(wills)
      .leftJoin(matters, eq(matters.id, wills.matterId))
      .where(and(...whereConditions))
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset);

    const results = await query;

    // Process results
    const processedWills = await Promise.all(
      results.map(async (row) => {
        const will = row.will;
        const matter = row.matter;

        let processedWill: any = {
          ...will,
          matter: matter ? {
            id: matter.id,
            title: matter.title,
            description: matter.description,
            status: matter.status,
          } : null,
        };

        // Include documents if requested
        if (includeDocuments) {
          const documents = await db
            .select()
            .from(willDocuments)
            .where(eq(willDocuments.willId, will.id))
            .orderBy(desc(willDocuments.version));
          
          processedWill.documents = documents;
        }

        // Include validation if requested
        if (includeValidation) {
          const template = getWillTemplate(will.willType);
          const validation = validateWillCompleteness(will, template);
          processedWill.validation = validation;
        }

        return processedWill;
      })
    );

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      wills: processedWills,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        status,
        willType,
        search,
        sortBy,
        sortOrder,
      },
    });

  } catch (error) {
    console.error('Error fetching wills:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new will (alternative to matter-specific creation)
export async function POST(request: NextRequest) {
  try {
    // Authenticate user (with development mode support)
    let userId: string;
    
    if (isDevMode()) {
      const devAuth = await getDevAuth();
      userId = devAuth?.user.id || 'dev-user-001';
      console.log('🚀 DEVELOPMENT MODE: Using mock authentication for will creation');
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
    const { matterId, redirectToGeneration = false } = body;

    if (!matterId) {
      return NextResponse.json(
        { error: 'Matter ID is required' },
        { status: 400 }
      );
    }

    // Verify matter exists and user has access
    const [matter] = await db
      .select()
      .from(matters)
      .where(eq(matters.id, matterId))
      .limit(1);

    if (!matter) {
      return NextResponse.json(
        { error: 'Matter not found' },
        { status: 404 }
      );
    }

    // Create minimal will record for the wizard
    const [will] = await db.insert(wills).values({
      matterId,
      testatorId: userId,
      willType: 'simple',
      language: 'en',
      personalInfo: {},
      assets: [],
      beneficiaries: [],
      guardians: [],
      executors: [],
      status: 'draft',
      difcCompliant: false,
      version: 1,
    }).returning();

    const response: any = {
      success: true,
      will: {
        id: will.id,
        matterId: will.matterId,
        testatorId: will.testatorId,
        status: will.status,
        createdAt: will.createdAt,
      },
      message: 'Will created successfully',
    };

    if (redirectToGeneration) {
      response.redirectUrl = `/dashboard/wills/${will.id}/edit`;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error creating will:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create will',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}