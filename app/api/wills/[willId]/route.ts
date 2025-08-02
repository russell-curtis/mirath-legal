/**
 * Individual Will Management API
 * Handles CRUD operations for specific wills
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db/drizzle';
import { wills, willDocuments, auditLogs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { 
  getWillById, 
  updateWill, 
  createWillVersion,
  getWillVersions,
  validateWillCompleteness,
  getWillTemplate,
  type UpdateWillData
} from '@/lib/will-engine';
import { nanoid } from 'nanoid';

// GET: Retrieve a specific will with all related documents
export async function GET(
  request: NextRequest,
  { params }: { params: { willId: string } }
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

    const { willId } = params;
    const { searchParams } = new URL(request.url);
    const includeVersions = searchParams.get('versions') === 'true';
    const includeDocuments = searchParams.get('documents') === 'true';

    if (!willId) {
      return NextResponse.json(
        { error: 'Will ID is required' },
        { status: 400 }
      );
    }

    // Get the will
    const will = await getWillById(willId);
    if (!will) {
      return NextResponse.json(
        { error: 'Will not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    if (will.testatorId !== result.session.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    let response: any = { will };

    // Include documents if requested
    if (includeDocuments) {
      const documents = await db
        .select()
        .from(willDocuments)
        .where(eq(willDocuments.willId, willId))
        .orderBy(willDocuments.version);
      
      response.documents = documents;
    }

    // Include version history if requested
    if (includeVersions) {
      const versions = await getWillVersions(willId);
      response.versions = versions;
    }

    // Add validation information
    const template = getWillTemplate(will.willType);
    const validation = validateWillCompleteness(will, template);
    response.validation = validation;

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching will:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update a will
export async function PUT(
  request: NextRequest,
  { params }: { params: { willId: string } }
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

    const { willId } = params;
    const body = await request.json();

    if (!willId) {
      return NextResponse.json(
        { error: 'Will ID is required' },
        { status: 400 }
      );
    }

    // Get the existing will
    const existingWill = await getWillById(willId);
    if (!existingWill) {
      return NextResponse.json(
        { error: 'Will not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    if (existingWill.testatorId !== result.session.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Extract update data
    const {
      willType,
      language,
      personalInfo,
      assets,
      beneficiaries,
      guardians,
      executors,
      specialInstructions,
      status,
      createNewVersion = false,
    } = body;

    // Prepare update data
    const updateData: UpdateWillData = {
      ...(willType && { willType }),
      ...(language && { language }),
      ...(personalInfo && { personalInfo }),
      ...(assets && { assets }),
      ...(beneficiaries && { beneficiaries }),
      ...(guardians && { guardians }),
      ...(executors && { executors }),
      ...(specialInstructions !== undefined && { specialInstructions }),
      ...(status && { status }),
    };

    let updatedWill;

    if (createNewVersion) {
      // Create a new version instead of updating the existing one
      updatedWill = await createWillVersion(willId, updateData);
    } else {
      // Update the existing will
      updatedWill = await updateWill(willId, updateData);
    }

    // Create audit log entry
    await db.insert(auditLogs).values({
      id: nanoid(),
      entityType: 'will',
      entityId: willId,
      action: createNewVersion ? 'version_created' : 'updated',
      userId: result.session.userId,
      changes: updateData,
      timestamp: new Date(),
    });

    // Get validation for the updated will
    const template = getWillTemplate(updatedWill.willType);
    const validation = validateWillCompleteness(updatedWill, template);

    return NextResponse.json({
      success: true,
      will: updatedWill,
      validation,
      message: createNewVersion ? 'New will version created' : 'Will updated successfully',
    });

  } catch (error) {
    console.error('Error updating will:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update will',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete or archive a will
export async function DELETE(
  request: NextRequest,
  { params }: { params: { willId: string } }
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

    const { willId } = params;
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    if (!willId) {
      return NextResponse.json(
        { error: 'Will ID is required' },
        { status: 400 }
      );
    }

    // Get the existing will
    const existingWill = await getWillById(willId);
    if (!existingWill) {
      return NextResponse.json(
        { error: 'Will not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    if (existingWill.testatorId !== result.session.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Prevent deletion of registered wills
    if (existingWill.status === 'registered') {
      return NextResponse.json(
        { error: 'Cannot delete a registered will' },
        { status: 400 }
      );
    }

    if (hardDelete) {
      // Hard delete: Remove from database entirely
      await db.transaction(async (tx) => {
        // Delete associated documents
        await tx.delete(willDocuments).where(eq(willDocuments.willId, willId));
        
        // Delete the will
        await tx.delete(wills).where(eq(wills.id, willId));
      });

      // Create audit log entry
      await db.insert(auditLogs).values({
        id: nanoid(),
        entityType: 'will',
        entityId: willId,
        action: 'hard_deleted',
        userId: result.session.userId,
        changes: { reason: 'hard_delete_requested' },
        timestamp: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: 'Will permanently deleted',
      });

    } else {
      // Soft delete: Mark as archived
      const archivedWill = await updateWill(willId, {
        status: 'archived',
      });

      // Create audit log entry
      await db.insert(auditLogs).values({
        id: nanoid(),
        entityType: 'will',
        entityId: willId,
        action: 'archived',
        userId: result.session.userId,
        changes: { status: 'archived' },
        timestamp: new Date(),
      });

      return NextResponse.json({
        success: true,
        will: archivedWill,
        message: 'Will archived successfully',
      });
    }

  } catch (error) {
    console.error('Error deleting will:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete will',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}