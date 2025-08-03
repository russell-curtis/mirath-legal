/**
 * Firm Onboarding API Endpoint
 * Handles the creation of new law firm accounts and team setup
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { eq } from 'drizzle-orm';
import { lawFirms, user } from '@/db/schema';
import { nanoid } from 'nanoid';
import { z } from 'zod';

// Input validation schema
const onboardingSchema = z.object({
  userId: z.string(),
  firmData: z.object({
    firmName: z.string().min(1, 'Firm name is required'),
    licenseNumber: z.string().min(1, 'License number is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(1, 'Phone number is required'),
    establishedYear: z.string().min(4, 'Valid year is required'),
    address: z.object({
      street: z.string().min(1, 'Street address is required'),
      city: z.string().min(1, 'City is required'),
      emirate: z.string().min(1, 'Emirate is required'),
      poBox: z.string().optional(),
      country: z.string().default('United Arab Emirates'),
    }),
    practiceAreas: z.array(z.string()).min(1, 'At least one practice area is required'),
    licenseExpiry: z.string().min(1, 'License expiry date is required'),
    barAssociation: z.string().min(1, 'Bar association is required'),
    insuranceNumber: z.string().min(1, 'Insurance number is required'),
    licenseDocument: z.any().optional(),
    teamMembers: z.array(z.object({
      id: z.string(),
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Valid email is required'),
      role: z.enum(['admin', 'senior_lawyer', 'lawyer', 'support']),
      barNumber: z.string().optional(),
    })).min(1, 'At least one team member is required'),
    logoUrl: z.string().optional(),
    primaryColor: z.string().default('#1D4ED8'),
    secondaryColor: z.string().default('#64748B'),
    customDomain: z.string().optional(),
    subscriptionTier: z.enum(['starter', 'professional', 'enterprise']),
  }),
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
    const validationResult = onboardingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { userId, firmData } = validationResult.data;

    // Verify user ID matches authenticated user
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'User ID mismatch' },
        { status: 403 }
      );
    }

    // Check if user already has a firm
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Note: For now we'll allow multiple firm registrations until we add firmId to user table

    // Create the firm record
    const [newFirm] = await db
      .insert(lawFirms)
      .values({
        name: firmData.firmName,
        licenseNumber: firmData.licenseNumber,
        email: firmData.email,
        phone: firmData.phone,
        establishedYear: parseInt(firmData.establishedYear),
        address: firmData.address,
        practiceAreas: firmData.practiceAreas,
        logoUrl: firmData.logoUrl,
        licenseExpiry: new Date(firmData.licenseExpiry),
        barAssociation: firmData.barAssociation,
        insuranceNumber: firmData.insuranceNumber,
        customDomain: firmData.customDomain,
        isVerified: false, // Pending manual verification
        settings: {
          branding: {
            primaryColor: firmData.primaryColor,
            secondaryColor: firmData.secondaryColor,
          },
          billing: {
            defaultHourlyRate: 500, // Default AED 500/hour
            currency: 'AED',
          },
          notifications: {
            emailNotifications: true,
            smsNotifications: false,
          },
        },
        subscriptionTier: firmData.subscriptionTier,
        subscriptionStatus: 'trial', // Start with trial period
        isActive: true,
      })
      .returning();

    // TODO: In a production environment, you would:
    // 1. Send invitation emails to team members
    // 2. Upload license document to cloud storage
    // 3. Trigger verification workflow
    // 4. Set up subscription billing
    // 5. Create audit log entry

    // Return success response with firm details
    return NextResponse.json({
      success: true,
      firm: {
        id: newFirm.id,
        name: newFirm.name,
        subscriptionTier: newFirm.subscriptionTier,
        subscriptionStatus: newFirm.subscriptionStatus,
        isVerified: newFirm.isVerified,
        isActive: newFirm.isActive,
        createdAt: newFirm.createdAt,
      },
      message: 'Firm registration completed successfully',
      nextSteps: [
        'License verification is in progress',
        'Team invitation emails will be sent',
        'Access your firm dashboard to continue setup',
      ],
    });

  } catch (error) {
    console.error('Firm onboarding error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to complete firm registration. Please try again.',
      },
      { status: 500 }
    );
  }
}