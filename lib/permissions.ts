/**
 * Permission and role management for Mirath Legal
 * Handles law firm multi-tenancy and role-based access control
 */

import { db } from "@/db/drizzle";
import { lawFirmMembers, lawFirms, user } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Define role hierarchy
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  FIRM_ADMIN: 'firm_admin',
  SENIOR_LAWYER: 'senior_lawyer',
  LAWYER: 'lawyer',
  SUPPORT: 'support',
  CLIENT: 'client',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Define permissions
export const PERMISSIONS = {
  // Law firm management
  LAW_FIRM_CREATE: 'law_firm:create',
  LAW_FIRM_UPDATE: 'law_firm:update',
  LAW_FIRM_DELETE: 'law_firm:delete',
  LAW_FIRM_VIEW: 'law_firm:view',
  
  // Matter management
  MATTER_CREATE: 'matter:create',
  MATTER_VIEW: 'matter:view',
  MATTER_UPDATE: 'matter:update',
  MATTER_DELETE: 'matter:delete',
  MATTER_ASSIGN: 'matter:assign',
  
  // Will operations
  WILL_CREATE: 'will:create',
  WILL_VIEW: 'will:view',
  WILL_EDIT: 'will:edit',
  WILL_FINALIZE: 'will:finalize',
  WILL_GENERATE: 'will:generate',
  
  // Document management
  DOCUMENT_VIEW: 'document:view',
  DOCUMENT_UPLOAD: 'document:upload',
  DOCUMENT_DELETE: 'document:delete',
  DOCUMENT_SHARE: 'document:share',
  
  // Client management
  CLIENT_CREATE: 'client:create',
  CLIENT_VIEW: 'client:view',
  CLIENT_UPDATE: 'client:update',
  CLIENT_DELETE: 'client:delete',
  
  // DIFC operations
  DIFC_REGISTER: 'difc:register',
  DIFC_VALIDATE: 'difc:validate',
  
  // Billing and analytics
  BILLING_VIEW: 'billing:view',
  BILLING_MANAGE: 'billing:manage',
  ANALYTICS_VIEW: 'analytics:view',
  
  // System administration
  SYSTEM_ADMIN: 'system:admin',
  AUDIT_VIEW: 'audit:view',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  
  [ROLES.FIRM_ADMIN]: [
    PERMISSIONS.LAW_FIRM_VIEW,
    PERMISSIONS.LAW_FIRM_UPDATE,
    PERMISSIONS.MATTER_CREATE,
    PERMISSIONS.MATTER_VIEW,
    PERMISSIONS.MATTER_UPDATE,
    PERMISSIONS.MATTER_DELETE,
    PERMISSIONS.MATTER_ASSIGN,
    PERMISSIONS.WILL_CREATE,
    PERMISSIONS.WILL_VIEW,
    PERMISSIONS.WILL_EDIT,
    PERMISSIONS.WILL_FINALIZE,
    PERMISSIONS.WILL_GENERATE,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_DELETE,
    PERMISSIONS.DOCUMENT_SHARE,
    PERMISSIONS.CLIENT_CREATE,
    PERMISSIONS.CLIENT_VIEW,
    PERMISSIONS.CLIENT_UPDATE,
    PERMISSIONS.CLIENT_DELETE,
    PERMISSIONS.DIFC_REGISTER,
    PERMISSIONS.DIFC_VALIDATE,
    PERMISSIONS.BILLING_VIEW,
    PERMISSIONS.BILLING_MANAGE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.AUDIT_VIEW,
  ],
  
  [ROLES.SENIOR_LAWYER]: [
    PERMISSIONS.LAW_FIRM_VIEW,
    PERMISSIONS.MATTER_CREATE,
    PERMISSIONS.MATTER_VIEW,
    PERMISSIONS.MATTER_UPDATE,
    PERMISSIONS.MATTER_ASSIGN,
    PERMISSIONS.WILL_CREATE,
    PERMISSIONS.WILL_VIEW,
    PERMISSIONS.WILL_EDIT,
    PERMISSIONS.WILL_FINALIZE,
    PERMISSIONS.WILL_GENERATE,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_SHARE,
    PERMISSIONS.CLIENT_CREATE,
    PERMISSIONS.CLIENT_VIEW,
    PERMISSIONS.CLIENT_UPDATE,
    PERMISSIONS.DIFC_REGISTER,
    PERMISSIONS.DIFC_VALIDATE,
    PERMISSIONS.BILLING_VIEW,
  ],
  
  [ROLES.LAWYER]: [
    PERMISSIONS.LAW_FIRM_VIEW,
    PERMISSIONS.MATTER_CREATE,
    PERMISSIONS.MATTER_VIEW,
    PERMISSIONS.MATTER_UPDATE,
    PERMISSIONS.WILL_CREATE,
    PERMISSIONS.WILL_VIEW,
    PERMISSIONS.WILL_EDIT,
    PERMISSIONS.WILL_GENERATE,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.CLIENT_CREATE,
    PERMISSIONS.CLIENT_VIEW,
    PERMISSIONS.CLIENT_UPDATE,
    PERMISSIONS.DIFC_VALIDATE,
  ],
  
  [ROLES.SUPPORT]: [
    PERMISSIONS.LAW_FIRM_VIEW,
    PERMISSIONS.MATTER_VIEW,
    PERMISSIONS.WILL_VIEW,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.CLIENT_VIEW,
  ],
  
  [ROLES.CLIENT]: [
    PERMISSIONS.WILL_VIEW,
    PERMISSIONS.DOCUMENT_VIEW,
  ],
};

// Context for permission checking
export interface PermissionContext {
  userId: string;
  firmId?: string;
  matterId?: string;
  willId?: string;
  clientId?: string;
}

// Get user's law firm membership
export async function getUserFirmMembership(userId: string, firmId?: string) {
  if (!firmId) {
    // Get all firm memberships for user
    return await db
      .select()
      .from(lawFirmMembers)
      .innerJoin(lawFirms, eq(lawFirmMembers.lawFirmId, lawFirms.id))
      .where(eq(lawFirmMembers.userId, userId));
  }
  
  // Get specific firm membership
  const membership = await db
    .select()
    .from(lawFirmMembers)
    .innerJoin(lawFirms, eq(lawFirmMembers.lawFirmId, lawFirms.id))
    .where(
      and(
        eq(lawFirmMembers.userId, userId),
        eq(lawFirmMembers.lawFirmId, firmId)
      )
    )
    .limit(1);
    
  return membership[0] || null;
}

// Get user's permissions for a specific firm
export async function getUserPermissions(
  userId: string, 
  firmId?: string
): Promise<Permission[]> {
  // Check if user is super admin
  const userData = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
    
  if (userData[0]?.userType === ROLES.SUPER_ADMIN) {
    return ROLE_PERMISSIONS[ROLES.SUPER_ADMIN];
  }
  
  // If no firmId provided, return client permissions
  if (!firmId) {
    return ROLE_PERMISSIONS[ROLES.CLIENT];
  }
  
  // Get firm membership
  const membership = await getUserFirmMembership(userId, firmId);
  
  if (!membership) {
    return ROLE_PERMISSIONS[ROLES.CLIENT];
  }
  
  const role = membership.law_firm_members.role as Role;
  const basePermissions = ROLE_PERMISSIONS[role] || [];
  
  // Add any custom permissions from the membership
  const customPermissions = membership.law_firm_members.permissions || [];
  
  return [...basePermissions, ...customPermissions];
}

// Check if user has specific permission
export async function hasPermission(
  userId: string,
  permission: Permission,
  context?: PermissionContext
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, context?.firmId);
  return permissions.includes(permission);
}

// Check if user has any of the specified permissions
export async function hasAnyPermission(
  userId: string,
  permissions: Permission[],
  context?: PermissionContext
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId, context?.firmId);
  return permissions.some(permission => userPermissions.includes(permission));
}

// Check if user has all of the specified permissions
export async function hasAllPermissions(
  userId: string,
  permissions: Permission[],
  context?: PermissionContext
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId, context?.firmId);
  return permissions.every(permission => userPermissions.includes(permission));
}

// Role hierarchy check - check if user role is at least the required level
const ROLE_HIERARCHY = {
  [ROLES.CLIENT]: 0,
  [ROLES.SUPPORT]: 1,
  [ROLES.LAWYER]: 2,
  [ROLES.SENIOR_LAWYER]: 3,
  [ROLES.FIRM_ADMIN]: 4,
  [ROLES.SUPER_ADMIN]: 5,
};

export async function hasMinimumRole(
  userId: string,
  minimumRole: Role,
  firmId?: string
): Promise<boolean> {
  const userData = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
    
  if (userData[0]?.userType === ROLES.SUPER_ADMIN) {
    return true;
  }
  
  if (!firmId) {
    return ROLE_HIERARCHY[ROLES.CLIENT] >= ROLE_HIERARCHY[minimumRole];
  }
  
  const membership = await getUserFirmMembership(userId, firmId);
  
  if (!membership) {
    return ROLE_HIERARCHY[ROLES.CLIENT] >= ROLE_HIERARCHY[minimumRole];
  }
  
  const userRole = membership.law_firm_members.role as Role;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

// Check if user is member of specific law firm
export async function isFirmMember(userId: string, firmId: string): Promise<boolean> {
  const membership = await getUserFirmMembership(userId, firmId);
  return !!membership;
}

// Get user's primary law firm (first one they joined)
export async function getUserPrimaryFirm(userId: string) {
  const memberships = await db
    .select()
    .from(lawFirmMembers)
    .innerJoin(lawFirms, eq(lawFirmMembers.lawFirmId, lawFirms.id))
    .where(eq(lawFirmMembers.userId, userId))
    .orderBy(lawFirmMembers.joinedAt)
    .limit(1);
    
  return memberships[0] || null;
}

// Create law firm membership
export async function createFirmMembership(
  userId: string,
  firmId: string,
  role: Role,
  customPermissions?: Permission[]
) {
  return await db.insert(lawFirmMembers).values({
    userId,
    lawFirmId: firmId,
    role,
    permissions: customPermissions || [],
  });
}

// Update user role in firm
export async function updateFirmMemberRole(
  userId: string,
  firmId: string,
  newRole: Role,
  customPermissions?: Permission[]
) {
  return await db
    .update(lawFirmMembers)
    .set({
      role: newRole,
      permissions: customPermissions || [],
    })
    .where(
      and(
        eq(lawFirmMembers.userId, userId),
        eq(lawFirmMembers.lawFirmId, firmId)
      )
    );
}

// Remove user from firm
export async function removeFirmMembership(userId: string, firmId: string) {
  return await db
    .delete(lawFirmMembers)
    .where(
      and(
        eq(lawFirmMembers.userId, userId),
        eq(lawFirmMembers.lawFirmId, firmId)
      )
    );
}