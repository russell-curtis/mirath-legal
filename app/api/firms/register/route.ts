/**
 * Firm Registration API Endpoint
 * Handles the creation of new law firm accounts (post-OAuth)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { eq } from 'drizzle-orm';
import { lawFirms, user } from '@/db/schema';
import { z } from 'zod';

// Input validation schema
const registrationSchema = z.object({
  firmName: z.string().min(1, 'Firm name is required'),
  contactPersonName: z.string().min(1, 'Contact person name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    emirate: z.string().min(1, 'Emirate is required'),
    poBox: z.string().optional(),
    country: z.string().default('United Arab Emirates'),
  }),
  licenseNumber: z.string().min(1, 'License number is required'),
  barAssociation: z.string().min(1, 'Bar association is required'),
  establishedYear: z.string().min(4, 'Valid year is required'),
  practiceAreas: z.array(z.string()).min(1, 'At least one practice area is required'),
  licenseDocument: z.any().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = registrationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const formData = validationResult.data;

    // Check if user already has a firm
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if firm with this license number already exists
    const existingFirm = await db
      .select()
      .from(lawFirms)
      .where(eq(lawFirms.licenseNumber, formData.licenseNumber))
      .limit(1);

    if (existingFirm.length > 0) {
      return NextResponse.json(
        { error: 'A firm with this license number is already registered' },
        { status: 409 }
      );
    }

    // Create the firm record
    const [newFirm] = await db
      .insert(lawFirms)
      .values({
        name: formData.firmName,
        licenseNumber: formData.licenseNumber,
        email: formData.email,
        phone: formData.phone,
        establishedYear: parseInt(formData.establishedYear),
        address: formData.address,
        practiceAreas: formData.practiceAreas,
        barAssociation: formData.barAssociation,
        isVerified: false, // Pending manual verification
        subscriptionTier: 'professional', // Default tier, will be selected after verification
        subscriptionStatus: 'pending_verification', // Not trial until verified
        isActive: false, // Not active until verified
        settings: {
          branding: {
            primaryColor: '#1D4ED8',
            secondaryColor: '#64748B',
          },
          billing: {
            defaultHourlyRate: 500,
            currency: 'AED',
          },
          notifications: {
            emailNotifications: true,
            smsNotifications: false,
          },
        },
      })
      .returning();

    // TODO: In a production environment, you would:
    // 1. Upload license document to cloud storage if provided
    // 2. Send notification email to admin team for verification
    // 3. Send confirmation email to firm contact
    // 4. Create audit log entry
    // 5. Set up verification tracking

    // Return success response
    return NextResponse.json({
      success: true,
      firm: {
        id: newFirm.id,
        name: newFirm.name,
        licenseNumber: newFirm.licenseNumber,
        isVerified: newFirm.isVerified,
        subscriptionStatus: newFirm.subscriptionStatus,
        createdAt: newFirm.createdAt,
      },
      message: 'Firm registration submitted successfully',
      nextSteps: [
        'Your application is under review',
        'Verification typically takes 1-2 business days',
        'You will receive email updates on your status',
        'Demo access is available while we review your application',
      ],
    });

  } catch (error) {
    console.error('Firm registration error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to complete firm registration. Please try again.',
      },
      { status: 500 }
    );
  }
}