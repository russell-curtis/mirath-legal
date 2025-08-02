/**
 * Law Firm API Routes
 * Handles law firm registration, management, and member operations
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { 
  createLawFirm, 
  updateLawFirm, 
  getAllLawFirms,
  lawFirmExists 
} from "@/lib/law-firm";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

// Validation schemas
const createLawFirmSchema = z.object({
  name: z.string().min(2, "Firm name must be at least 2 characters"),
  licenseNumber: z.string().min(5, "License number is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    emirate: z.string(),
    poBox: z.string(),
    country: z.string().default("UAE"),
  }).optional(),
  logoUrl: z.string().url().optional(),
});

const updateLawFirmSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    emirate: z.string(),
    poBox: z.string(),
    country: z.string(),
  }).optional(),
  logoUrl: z.string().url().optional(),
  settings: z.object({
    branding: z.object({
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      customCss: z.string().optional(),
    }).optional(),
    billing: z.object({
      defaultHourlyRate: z.number().positive().optional(),
      currency: z.string().optional(),
    }).optional(),
    notifications: z.object({
      emailNotifications: z.boolean().optional(),
      smsNotifications: z.boolean().optional(),
    }).optional(),
  }).optional(),
  subscriptionTier: z.enum(['starter', 'professional', 'enterprise']).optional(),
  isActive: z.boolean().optional(),
});

// POST /api/v1/law-firms - Create new law firm
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
    const validatedData = createLawFirmSchema.parse(body);

    // Check if license number already exists
    const exists = await lawFirmExists(validatedData.licenseNumber);
    if (exists) {
      return NextResponse.json(
        { error: "A law firm with this license number already exists" },
        { status: 409 }
      );
    }

    // Create the law firm
    const lawFirm = await createLawFirm({
      ...validatedData,
      adminUserId: session.session.userId,
    });

    return NextResponse.json({
      success: true,
      data: lawFirm,
      message: "Law firm created successfully",
    });

  } catch (error) {
    console.error("Create law firm error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create law firm" },
      { status: 500 }
    );
  }
}

// GET /api/v1/law-firms - Get all law firms (admin only) or user's firms
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

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Check if user is super admin
    const canViewAll = await hasPermission(
      session.session.userId,
      PERMISSIONS.SYSTEM_ADMIN
    );

    if (canViewAll) {
      // Super admin can see all firms
      const firms = await getAllLawFirms(limit, offset);
      return NextResponse.json({
        success: true,
        data: firms,
        pagination: {
          page,
          limit,
          offset,
        },
      });
    } else {
      // Regular users can only see their own firms
      // TODO: Implement getUserFirms function
      return NextResponse.json({
        success: true,
        data: [],
        message: "User firm listing not yet implemented",
      });
    }

  } catch (error) {
    console.error("Get law firms error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve law firms" },
      { status: 500 }
    );
  }
}

// PUT /api/v1/law-firms/[firmId] - Update law firm
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

    // Extract firm ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const firmId = pathParts[pathParts.length - 1];

    if (!firmId) {
      return NextResponse.json(
        { error: "Firm ID is required" },
        { status: 400 }
      );
    }

    // Check permissions
    const canUpdate = await hasPermission(
      session.session.userId,
      PERMISSIONS.LAW_FIRM_UPDATE,
      { userId: session.session.userId, firmId }
    );

    if (!canUpdate) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateLawFirmSchema.parse(body);

    // Update the law firm
    const updatedFirm = await updateLawFirm(firmId, validatedData);

    if (!updatedFirm) {
      return NextResponse.json(
        { error: "Law firm not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedFirm,
      message: "Law firm updated successfully",
    });

  } catch (error) {
    console.error("Update law firm error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update law firm" },
      { status: 500 }
    );
  }
}