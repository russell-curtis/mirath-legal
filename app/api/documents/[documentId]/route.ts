/**
 * Document Management API
 * Handles document upload, retrieval, and deletion
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { documentStorage } from '@/lib/document-storage';
import { db } from '@/db/drizzle';
import { willDocuments } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET: Retrieve a document
export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
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

    const { documentId } = params;
    const { searchParams } = new URL(request.url);
    const download = searchParams.get('download') === 'true';

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get document metadata from database
    const [document] = await db
      .select()
      .from(willDocuments)
      .where(eq(willDocuments.id, documentId))
      .limit(1);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if user has access (simplified - should check will ownership)
    // TODO: Add proper access control based on will ownership and law firm membership

    // Get document from storage
    const storageResult = await documentStorage.getDocument(documentId);

    if (!storageResult.success || !storageResult.buffer) {
      return NextResponse.json(
        { error: storageResult.error || 'Failed to retrieve document' },
        { status: 500 }
      );
    }

    // Set response headers
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', document.metadata?.contentType || 'application/octet-stream');
    responseHeaders.set('Content-Length', storageResult.buffer.length.toString());

    if (download) {
      responseHeaders.set(
        'Content-Disposition',
        `attachment; filename="${document.title || 'document'}.pdf"`
      );
    } else {
      responseHeaders.set(
        'Content-Disposition',
        `inline; filename="${document.title || 'document'}.pdf"`
      );
    }

    // Cache control
    responseHeaders.set('Cache-Control', 'private, max-age=3600');

    return new NextResponse(storageResult.buffer, {
      status: 200,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Document retrieval error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
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

    const { documentId } = params;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get document metadata from database
    const [document] = await db
      .select()
      .from(willDocuments)
      .where(eq(willDocuments.id, documentId))
      .limit(1);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if user has access (simplified - should check will ownership)
    // TODO: Add proper access control

    // Delete from storage
    const storageResult = await documentStorage.deleteDocument(documentId);

    if (!storageResult.success) {
      console.error('Storage deletion failed:', storageResult.error);
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    await db.delete(willDocuments).where(eq(willDocuments.id, documentId));

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });

  } catch (error) {
    console.error('Document deletion error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}