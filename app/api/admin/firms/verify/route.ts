/**
 * Firm Verification API Endpoint
 * Handles approve/reject/request-info actions for firms
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { lawFirms } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Input validation schema
const verificationSchema = z.object({
  firmId: z.string().min(1, 'Firm ID is required'),
  action: z.enum(['approve', 'reject', 'request_info']),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
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
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = verificationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { firmId, action, reason } = validationResult.data;

    // Find the firm
    const [firm] = await db
      .select()
      .from(lawFirms)
      .where(eq(lawFirms.id, firmId))
      .limit(1);

    if (!firm) {
      return NextResponse.json(
        { error: 'Firm not found' },
        { status: 404 }
      );
    }

    // Prepare update data based on action
    let updateData: any = {
      updatedAt: new Date(),
    };

    switch (action) {
      case 'approve':
        updateData = {
          ...updateData,
          isVerified: true,
          subscriptionStatus: 'trial', // Start 30-day trial
          isActive: true,
        };
        break;
        
      case 'reject':
        updateData = {
          ...updateData,
          isVerified: false,
          subscriptionStatus: 'rejected',
          isActive: false,
        };
        break;
        
      case 'request_info':
        updateData = {
          ...updateData,
          subscriptionStatus: 'info_requested',
        };
        break;
    }

    // Update the firm
    const [updatedFirm] = await db
      .update(lawFirms)
      .set(updateData)
      .where(eq(lawFirms.id, firmId))
      .returning();

    // TODO: In a production environment, you would:
    // 1. Send email notification to firm about status change
    // 2. Create audit log entry
    // 3. If approved, send trial activation email
    // 4. If rejected, send rejection reason email
    // 5. If info requested, send specific request email

    let message = '';
    switch (action) {
      case 'approve':
        message = `${firm.name} has been approved and granted 30-day trial access`;
        break;
      case 'reject':
        message = `${firm.name} application has been rejected`;
        break;
      case 'request_info':
        message = `Additional information requested from ${firm.name}`;
        break;
    }

    return NextResponse.json({
      success: true,
      message,
      firm: {
        id: updatedFirm.id,
        name: updatedFirm.name,
        isVerified: updatedFirm.isVerified,
        subscriptionStatus: updatedFirm.subscriptionStatus,
        isActive: updatedFirm.isActive,
        updatedAt: updatedFirm.updatedAt,
      },
    });

  } catch (error) {
    console.error('Firm verification error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to update firm verification status',
      },
      { status: 500 }
    );
  }
}