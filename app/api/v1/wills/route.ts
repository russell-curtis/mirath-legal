/**
 * Wills API Routes
 * Handles will creation, management, and AI-powered generation
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { 
  createWill, 
  getWillById, 
  updateWill, 
  validateWillCompleteness,
  getWillTemplate,
  type CreateWillData 
} from "@/lib/will-engine";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

// Validation schemas
const createWillSchema = z.object({
  matterId: z.string().uuid("Valid matter ID is required"),
  testatorId: z.string().min(1, "Testator ID is required"),
  willType: z.enum(['simple', 'complex', 'business_succession', 'digital_assets']),
  language: z.enum(['en', 'ar']).default('en'),
  personalInfo: z.object({
    emiratesId: z.string().min(1, "Emirates ID is required"),
    passportNumber: z.string(),
    nationality: z.string(),
    visaStatus: z.enum(['residence', 'investor', 'golden', 'employment', 'other']),
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
    address: z.object({
      street: z.string(),
      city: z.string(),
      emirate: z.string(),
      poBox: z.string(),
      country: z.string().default("UAE"),
    }),
    emergencyContact: z.object({
      name: z.string(),
      relationship: z.string(),
      phone: z.string(),
      email: z.string().email(),
    }),
  }),
  assets: z.array(z.object({
    id: z.string().optional(),
    type: z.enum(['property', 'bank_account', 'investment', 'business', 'digital']),
    name: z.string(),
    description: z.string(),
    estimatedValue: z.number().positive(),
    currency: z.string().default("AED"),
    jurisdiction: z.string(),
    details: z.any().optional(),
  })).default([]),
  beneficiaries: z.array(z.object({
    id: z.string().optional(),
    type: z.enum(['individual', 'charity', 'organization']),
    fullName: z.string(),
    relationship: z.string(),
    dateOfBirth: z.string().optional(),
    nationality: z.string().optional(),
    contactInfo: z.any().optional(),
    inheritancePercentage: z.number().min(0).max(100).optional(),
    specificAssets: z.array(z.string()).optional(),
    conditions: z.array(z.string()).optional(),
    isContingent: z.boolean().default(false),
  })).default([]),
  guardians: z.array(z.object({
    id: z.string().optional(),
    fullName: z.string(),
    relationship: z.string(),
    contactInfo: z.any(),
    isPrimary: z.boolean().default(false),
    conditions: z.string().optional(),
  })).default([]),
  executors: z.array(z.object({
    id: z.string().optional(),
    fullName: z.string(),
    relationship: z.string(),
    contactInfo: z.any(),
    isPrimary: z.boolean().default(false),
    powers: z.array(z.string()).optional(),
  })).default([]),
  specialInstructions: z.string().optional(),
});

const updateWillSchema = createWillSchema.partial().omit(['matterId', 'testatorId']);

// POST /api/v1/wills - Create new will
export async function POST(request: NextRequest) {
  try {
    // Get current user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.session?.userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createWillSchema.parse(body);

    // Check permissions - user must be able to create wills
    const canCreate = await hasPermission(
      session.session.userId,
      PERMISSIONS.WILL_CREATE,
      { userId: session.session.userId }
    );

    if (!canCreate) {
      return NextResponse.json(
        { error: "Insufficient permissions to create wills" },
        { status: 403 }
      );
    }

    // Create the will
    const will = await createWill(validatedData as CreateWillData);

    // Validate completeness
    const template = getWillTemplate(will.willType);
    const validation = validateWillCompleteness(will, template);

    return NextResponse.json({
      success: true,
      data: {
        will,
        validation: {
          isValid: validation.isValid,
          completeness: validation.completeness,
          errors: validation.errors,
          warnings: validation.warnings,
        },
      },
      message: "Will created successfully",
    });

  } catch (error) {
    console.error("Create will error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create will" },
      { status: 500 }
    );
  }
}

// GET /api/v1/wills/[willId] - Get will by ID
export async function GET(request: NextRequest) {
  try {
    // Get current user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.session?.userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Extract will ID from URL
    const url = new URL(request.url);
    const willId = url.searchParams.get('id');

    if (!willId) {
      return NextResponse.json(
        { error: "Will ID is required" },
        { status: 400 }
      );
    }

    // Check permissions
    const canView = await hasPermission(
      session.session.userId,
      PERMISSIONS.WILL_VIEW,
      { userId: session.session.userId, willId }
    );

    if (!canView) {
      return NextResponse.json(
        { error: "Insufficient permissions to view this will" },
        { status: 403 }
      );
    }

    // Get the will
    const will = await getWillById(willId);

    if (!will) {
      return NextResponse.json(
        { error: "Will not found" },
        { status: 404 }
      );
    }

    // Validate completeness
    const template = getWillTemplate(will.willType);
    const validation = validateWillCompleteness(will, template);

    return NextResponse.json({
      success: true,
      data: {
        will,
        validation: {
          isValid: validation.isValid,
          completeness: validation.completeness,
          errors: validation.errors,
          warnings: validation.warnings,
        },
      },
    });

  } catch (error) {
    console.error("Get will error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve will" },
      { status: 500 }
    );
  }
}

// PUT /api/v1/wills/[willId] - Update will
export async function PUT(request: NextRequest) {
  try {
    // Get current user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.session?.userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Extract will ID from URL
    const url = new URL(request.url);
    const willId = url.searchParams.get('id');

    if (!willId) {
      return NextResponse.json(
        { error: "Will ID is required" },
        { status: 400 }
      );
    }

    // Check permissions
    const canEdit = await hasPermission(
      session.session.userId,
      PERMISSIONS.WILL_EDIT,
      { userId: session.session.userId, willId }
    );

    if (!canEdit) {
      return NextResponse.json(
        { error: "Insufficient permissions to edit this will" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateWillSchema.parse(body);

    // Update the will
    const updatedWill = await updateWill(willId, validatedData);

    if (!updatedWill) {
      return NextResponse.json(
        { error: "Will not found" },
        { status: 404 }
      );
    }

    // Validate completeness
    const template = getWillTemplate(updatedWill.willType);
    const validation = validateWillCompleteness(updatedWill, template);

    return NextResponse.json({
      success: true,
      data: {
        will: updatedWill,
        validation: {
          isValid: validation.isValid,
          completeness: validation.completeness,
          errors: validation.errors,
          warnings: validation.warnings,
        },
      },
      message: "Will updated successfully",
    });

  } catch (error) {
    console.error("Update will error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update will" },
      { status: 500 }
    );
  }
}