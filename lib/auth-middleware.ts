/**
 * Authentication and authorization middleware for Mirath Legal
 * Handles route protection, permission checking, and law firm context
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { 
  hasPermission, 
  hasMinimumRole, 
  isFirmMember, 
  getUserPrimaryFirm,
  type Permission, 
  type Role,
  ROLES 
} from "@/lib/permissions";

export interface AuthContext {
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
  };
  firmId?: string;
  firmMembership?: Record<string, unknown>;
}

// Middleware options for route protection
export interface RouteProtectionOptions {
  requireAuth?: boolean;
  requireFirmMembership?: boolean;
  requiredPermissions?: Permission[];
  minimumRole?: Role;
  allowedUserTypes?: string[];
  firmIdParam?: string; // URL parameter name for firm ID
}

// Get authentication context from request
export async function getAuthContext(request: NextRequest): Promise<AuthContext | null> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.session?.userId) {
      return null;
    }

    return {
      user: {
        id: session.session.userId,
        email: session.user.email,
        name: session.user.name,
        userType: session.user.userType || ROLES.CLIENT,
      },
    };
  } catch (error) {
    console.error('Auth context error:', error);
    return null;
  }
}

// Extract firm ID from request (URL params, query, or headers)
export function extractFirmId(
  request: NextRequest, 
  options: RouteProtectionOptions
): string | null {
  // Try URL parameters first
  if (options.firmIdParam) {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const paramIndex = pathParts.findIndex(part => part === 'firm');
    if (paramIndex !== -1 && pathParts[paramIndex + 1]) {
      return pathParts[paramIndex + 1];
    }
  }

  // Try query parameters
  const url = new URL(request.url);
  const firmId = url.searchParams.get('firmId') || url.searchParams.get('firm_id');
  if (firmId) {
    return firmId;
  }

  // Try headers
  const firmIdHeader = request.headers.get('x-firm-id');
  if (firmIdHeader) {
    return firmIdHeader;
  }

  return null;
}

// Create protected route middleware
export function createProtectedRoute(options: RouteProtectionOptions = {}) {
  return async function protectedRouteMiddleware(
    request: NextRequest,
    handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse> | NextResponse
  ): Promise<NextResponse> {
    // Get authentication context
    const authContext = await getAuthContext(request);

    // Check if authentication is required
    if (options.requireAuth && !authContext) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!authContext) {
      // If auth not required and no user, proceed without context
      return handler(request, {} as AuthContext);
    }

    // Check allowed user types
    if (options.allowedUserTypes && 
        !options.allowedUserTypes.includes(authContext.user.userType)) {
      return NextResponse.json(
        { error: 'Insufficient user type' },
        { status: 403 }
      );
    }

    // Extract firm context
    const firmId = extractFirmId(request, options);
    if (firmId) {
      authContext.firmId = firmId;
    }

    // Check firm membership requirement
    if (options.requireFirmMembership) {
      if (!firmId) {
        return NextResponse.json(
          { error: 'Firm context required' },
          { status: 400 }
        );
      }

      const isMember = await isFirmMember(authContext.user.id, firmId);
      if (!isMember && authContext.user.userType !== ROLES.SUPER_ADMIN) {
        return NextResponse.json(
          { error: 'Firm membership required' },
          { status: 403 }
        );
      }
    }

    // Check minimum role requirement
    if (options.minimumRole) {
      const hasRole = await hasMinimumRole(
        authContext.user.id,
        options.minimumRole,
        firmId
      );
      
      if (!hasRole) {
        return NextResponse.json(
          { error: 'Insufficient role' },
          { status: 403 }
        );
      }
    }

    // Check required permissions
    if (options.requiredPermissions && options.requiredPermissions.length > 0) {
      for (const permission of options.requiredPermissions) {
        const hasRequiredPermission = await hasPermission(
          authContext.user.id,
          permission,
          { userId: authContext.user.id, firmId }
        );

        if (!hasRequiredPermission) {
          return NextResponse.json(
            { error: `Permission required: ${permission}` },
            { status: 403 }
          );
        }
      }
    }

    // If no firm ID but firm membership exists, set primary firm
    if (!firmId && options.requireFirmMembership) {
      const primaryFirm = await getUserPrimaryFirm(authContext.user.id);
      if (primaryFirm) {
        authContext.firmId = primaryFirm.law_firms.id;
        authContext.firmMembership = primaryFirm.law_firm_members;
      }
    }

    return handler(request, authContext);
  };
}

// Higher-order function for API route protection
export function withAuth(
  handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse> | NextResponse,
  options: RouteProtectionOptions = {}
) {
  const protectedHandler = createProtectedRoute(options);
  return (request: NextRequest) => protectedHandler(request, handler);
}

// Specific middleware functions for common use cases

// Require authentication only
export const requireAuth = (options: Omit<RouteProtectionOptions, 'requireAuth'> = {}) =>
  createProtectedRoute({ ...options, requireAuth: true });

// Require law firm membership
export const requireFirmMembership = (options: Omit<RouteProtectionOptions, 'requireFirmMembership'> = {}) =>
  createProtectedRoute({ 
    ...options, 
    requireAuth: true, 
    requireFirmMembership: true 
  });

// Require specific role
export const requireRole = (
  minimumRole: Role, 
  options: Omit<RouteProtectionOptions, 'minimumRole'> = {}
) =>
  createProtectedRoute({ 
    ...options, 
    requireAuth: true, 
    requireFirmMembership: true,
    minimumRole 
  });

// Require specific permissions
export const requirePermissions = (
  permissions: Permission[], 
  options: Omit<RouteProtectionOptions, 'requiredPermissions'> = {}
) =>
  createProtectedRoute({ 
    ...options, 
    requireAuth: true, 
    requireFirmMembership: true,
    requiredPermissions: permissions 
  });

// Admin only
export const requireAdmin = (options: RouteProtectionOptions = {}) =>
  createProtectedRoute({
    ...options,
    requireAuth: true,
    minimumRole: ROLES.FIRM_ADMIN
  });

// Lawyer or above
export const requireLawyer = (options: RouteProtectionOptions = {}) =>
  createProtectedRoute({
    ...options,
    requireAuth: true,
    requireFirmMembership: true,
    minimumRole: ROLES.LAWYER
  });

// Super admin only
export const requireSuperAdmin = (options: RouteProtectionOptions = {}) =>
  createProtectedRoute({
    ...options,
    requireAuth: true,
    allowedUserTypes: [ROLES.SUPER_ADMIN]
  });

// Helper function to check permissions in React components
export async function checkUserPermission(
  userId: string,
  permission: Permission,
  firmId?: string
): Promise<boolean> {
  try {
    return await hasPermission(userId, permission, { userId, firmId });
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}