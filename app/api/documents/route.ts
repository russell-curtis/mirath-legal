/**
 * Documents API
 * Lists and manages documents for authenticated users
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db/drizzle';
import { willDocuments, wills, matters } from '@/db/schema';
import { eq, desc, and, or, ilike } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const result = await auth.api.getSession({
      headers: await headers(),
    });

    if (!result?.session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const documentType = searchParams.get('documentType');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const willId = searchParams.get('willId');

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query conditions
    let whereConditions = [];

    // Only get documents for wills owned by the current user
    const userWillsSubquery = db
      .select({ id: wills.id })
      .from(wills)
      .where(eq(wills.testatorId, result.session.userId));

    if (willId) {
      whereConditions.push(eq(willDocuments.willId, willId));
    }

    if (documentType && documentType !== 'all') {
      whereConditions.push(eq(willDocuments.documentType, documentType as any));
    }

    if (status && status !== 'all') {
      whereConditions.push(eq(willDocuments.status, status as any));
    }

    if (search) {
      whereConditions.push(
        or(
          ilike(willDocuments.title, `%${search}%`),
          ilike(willDocuments.documentType, `%${search}%`)
        )
      );
    }

    // Get documents with related data
    const query = db
      .select({
        document: willDocuments,
        will: wills,
        matter: matters,
      })
      .from(willDocuments)
      .leftJoin(wills, eq(wills.id, willDocuments.willId))
      .leftJoin(matters, eq(matters.id, wills.matterId))
      .where(
        and(
          eq(wills.testatorId, result.session.userId),
          ...whereConditions
        )
      )
      .orderBy(desc(willDocuments.createdAt))
      .limit(limit)
      .offset(offset);

    const results = await query;

    // Format results
    const documents = results.map(row => ({
      id: row.document.id,
      willId: row.document.willId,
      documentType: row.document.documentType,
      title: row.document.title,
      content: row.document.content,
      metadata: row.document.metadata,
      version: row.document.version,
      status: row.document.status,
      createdAt: row.document.createdAt,
      updatedAt: row.document.updatedAt,
      will: row.will ? {
        id: row.will.id,
        willType: row.will.willType,
        language: row.will.language,
        status: row.will.status,
      } : null,
      matter: row.matter ? {
        id: row.matter.id,
        title: row.matter.title,
        description: row.matter.description,
      } : null,
    }));

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: willDocuments.id })
      .from(willDocuments)
      .leftJoin(wills, eq(wills.id, willDocuments.willId))
      .where(
        and(
          eq(wills.testatorId, result.session.userId),
          ...whereConditions
        )
      );

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get document statistics
    const stats = await getDocumentStats(result.session.userId);

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      stats,
      filters: {
        documentType,
        status,
        search,
        willId,
      },
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get document statistics
async function getDocumentStats(userId: string) {
  try {
    const statsQuery = await db
      .select({
        documentType: willDocuments.documentType,
        status: willDocuments.status,
        count: willDocuments.id,
      })
      .from(willDocuments)
      .leftJoin(wills, eq(wills.id, willDocuments.willId))
      .where(eq(wills.testatorId, userId));

    const stats = {
      total: 0,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    };

    for (const row of statsQuery) {
      stats.total++;
      
      const type = row.documentType;
      const status = row.status;
      
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    }

    return stats;
  } catch (error) {
    console.error('Error getting document stats:', error);
    return {
      total: 0,
      byType: {},
      byStatus: {},
    };
  }
}

// POST: Upload a new document
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const result = await auth.api.getSession({
      headers: await headers(),
    });

    if (!result?.session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const willId = formData.get('willId') as string;
    const documentType = formData.get('documentType') as string || 'supporting_document';
    const title = formData.get('title') as string || file.name;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!willId) {
      return NextResponse.json(
        { error: 'Will ID is required' },
        { status: 400 }
      );
    }

    // Verify will ownership
    const [will] = await db
      .select()
      .from(wills)
      .where(eq(wills.id, willId))
      .limit(1);

    if (!will || will.testatorId !== result.session.userId) {
      return NextResponse.json(
        { error: 'Will not found or access denied' },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Store document
    const { documentStorage } = await import('@/lib/document-storage');
    const storageResult = await documentStorage.uploadDocument(buffer, {
      filename: file.name,
      contentType: file.type,
      documentType: documentType as any,
      uploadedBy: result.session.userId,
      willId,
    });

    if (!storageResult.success) {
      return NextResponse.json(
        { error: storageResult.error || 'Failed to store document' },
        { status: 500 }
      );
    }

    // Create database record
    const [document] = await db.insert(willDocuments).values({
      willId,
      documentType: documentType as any,
      title,
      content: JSON.stringify({
        storageId: storageResult.documentId,
        filename: file.name,
        uploadedAt: new Date().toISOString(),
      }),
      metadata: {
        contentType: file.type,
        size: file.size,
        originalName: file.name,
        storageProvider: documentStorage.getStorageInfo().provider,
        ...storageResult.metadata,
      },
      version: 1,
      status: 'uploaded',
    }).returning();

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        willId: document.willId,
        documentType: document.documentType,
        title: document.title,
        status: document.status,
        createdAt: document.createdAt,
      },
      storageInfo: storageResult,
    });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}