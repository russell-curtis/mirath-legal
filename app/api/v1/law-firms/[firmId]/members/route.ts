/**
 * Law Firm Members API Routes
 * Handles law firm member management operations
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { 
  getLawFirmMembers,
  addFirmMember,
  removeFirmMember,
  updateMemberRole
} from "@/lib/law-firm";
import { 
  hasPermission, 
  PERMISSIONS, 
  type Role 
} from "@/lib/permissions";
import { z } from "zod";

// Validation schemas
const addMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(['admin', 'senior_lawyer', 'lawyer', 'support']),
  customPermissions: z.array(z.string()).optional(),
});

const updateMemberSchema = z.object({
  role: z.enum(['admin', 'senior_lawyer', 'lawyer', 'support']).optional(),
  customPermissions: z.array(z.string()).optional(),
});

// GET /api/v1/law-firms/[firmId]/members - Get all firm members
export async function GET(
  request: NextRequest,
  { params }: { params: { firmId: string } }
) {
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

    const { firmId } = params;

    // Check permissions - user must be able to view the law firm
    const canView = await hasPermission(
      session.session.userId,
      PERMISSIONS.LAW_FIRM_VIEW,
      { userId: session.session.userId, firmId }
    );

    if (!canView) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get firm members
    const members = await getLawFirmMembers(firmId);

    return NextResponse.json({
      success: true,
      data: members,
    });

  } catch (error) {
    console.error("Get firm members error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve firm members" },
      { status: 500 }
    );
  }
}

// POST /api/v1/law-firms/[firmId]/members - Add new member
export async function POST(
  request: NextRequest,
  { params }: { params: { firmId: string } }
) {
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

    const { firmId } = params;

    // Check permissions - user must be able to manage firm members
    const canManage = await hasPermission(
      session.session.userId,
      PERMISSIONS.LAW_FIRM_UPDATE,
      { userId: session.session.userId, firmId }
    );

    if (!canManage) {
      return NextResponse.json(
        { error: "Insufficient permissions to add members" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = addMemberSchema.parse(body);

    // Add member to firm
    await addFirmMember(
      firmId,
      validatedData.userId,
      validatedData.role as Role,
      validatedData.customPermissions
    );

    return NextResponse.json({
      success: true,
      message: "Member added successfully",
    });

  } catch (error) {
    console.error("Add firm member error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    );
  }
}

// PUT /api/v1/law-firms/[firmId]/members/[userId] - Update member role
export async function PUT(
  request: NextRequest,
  { params }: { params: { firmId: string } }
) {
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

    const { firmId } = params;

    // Extract user ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const userId = pathParts[pathParts.length - 1];

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check permissions
    const canManage = await hasPermission(
      session.session.userId,
      PERMISSIONS.LAW_FIRM_UPDATE,
      { userId: session.session.userId, firmId }
    );

    if (!canManage) {
      return NextResponse.json(
        { error: "Insufficient permissions to update members" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateMemberSchema.parse(body);

    // Update member role
    if (validatedData.role || validatedData.customPermissions) {
      await updateMemberRole(
        firmId,
        userId,
        validatedData.role as Role,
        validatedData.customPermissions
      );
    }

    return NextResponse.json({
      success: true,
      message: "Member updated successfully",
    });

  } catch (error) {
    console.error("Update firm member error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/law-firms/[firmId]/members/[userId] - Remove member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { firmId: string } }
) {
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

    const { firmId } = params;

    // Extract user ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const userId = pathParts[pathParts.length - 1];

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check permissions
    const canManage = await hasPermission(
      session.session.userId,
      PERMISSIONS.LAW_FIRM_UPDATE,
      { userId: session.session.userId, firmId }
    );

    if (!canManage) {
      return NextResponse.json(
        { error: "Insufficient permissions to remove members" },
        { status: 403 }
      );
    }

    // Prevent self-removal if user is the only admin
    if (userId === session.session.userId) {
      // TODO: Add check to ensure there's at least one other admin
      return NextResponse.json(
        { error: "Cannot remove yourself from the firm" },
        { status: 400 }
      );
    }

    // Remove member from firm
    await removeFirmMember(firmId, userId);

    return NextResponse.json({
      success: true,
      message: "Member removed successfully",
    });

  } catch (error) {
    console.error("Remove firm member error:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}