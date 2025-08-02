/**
 * Law firm management utilities for Mirath Legal
 * Handles law firm CRUD operations, member management, and settings
 */

import { db } from "@/db/drizzle";
import { lawFirms, lawFirmMembers, user } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { ROLES, type Role } from "@/lib/permissions";

export interface CreateLawFirmData {
  name: string;
  licenseNumber: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    emirate: string;
    poBox: string;
    country: string;
  };
  logoUrl?: string;
  adminUserId: string; // User who will be the firm admin
}

export interface UpdateLawFirmData {
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    emirate: string;
    poBox: string;
    country: string;
  };
  logoUrl?: string;
  settings?: {
    branding?: {
      primaryColor?: string;
      secondaryColor?: string;
      customCss?: string;
    };
    billing?: {
      defaultHourlyRate?: number;
      currency?: string;
    };
    notifications?: {
      emailNotifications?: boolean;
      smsNotifications?: boolean;
    };
  };
  subscriptionTier?: 'starter' | 'professional' | 'enterprise';
  isActive?: boolean;
}

export interface LawFirmStats {
  totalMembers: number;
  totalMatters: number;
  activeMatters: number;
  completedWills: number;
  monthlyRevenue: number;
  averageCompletionTime: number;
}

// Create a new law firm
export async function createLawFirm(data: CreateLawFirmData) {
  return await db.transaction(async (tx) => {
    // Create the law firm
    const [firm] = await tx.insert(lawFirms).values({
      name: data.name,
      licenseNumber: data.licenseNumber,
      email: data.email,
      phone: data.phone,
      address: data.address,
      logoUrl: data.logoUrl,
      subscriptionTier: 'starter',
      isActive: true,
    }).returning();

    // Add the admin user as a firm member
    await tx.insert(lawFirmMembers).values({
      lawFirmId: firm.id,
      userId: data.adminUserId,
      role: ROLES.FIRM_ADMIN,
      permissions: [],
    });

    // Update user type to lawyer if they're a client
    await tx.update(user)
      .set({ userType: ROLES.FIRM_ADMIN })
      .where(eq(user.id, data.adminUserId));

    return firm;
  });
}

// Get law firm by ID
export async function getLawFirmById(firmId: string) {
  const [firm] = await db
    .select()
    .from(lawFirms)
    .where(eq(lawFirms.id, firmId))
    .limit(1);
    
  return firm;
}

// Get law firm by license number
export async function getLawFirmByLicense(licenseNumber: string) {
  const [firm] = await db
    .select()
    .from(lawFirms)
    .where(eq(lawFirms.licenseNumber, licenseNumber))
    .limit(1);
    
  return firm;
}

// Update law firm
export async function updateLawFirm(firmId: string, data: UpdateLawFirmData) {
  const [updatedFirm] = await db
    .update(lawFirms)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(lawFirms.id, firmId))
    .returning();
    
  return updatedFirm;
}

// Delete law firm (soft delete by setting inactive)
export async function deleteLawFirm(firmId: string) {
  return await db
    .update(lawFirms)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(lawFirms.id, firmId));
}

// Get all law firm members
export async function getLawFirmMembers(firmId: string) {
  return await db
    .select({
      id: lawFirmMembers.id,
      userId: lawFirmMembers.userId,
      role: lawFirmMembers.role,
      permissions: lawFirmMembers.permissions,
      joinedAt: lawFirmMembers.joinedAt,
      userName: user.name,
      userEmail: user.email,
      userType: user.userType,
    })
    .from(lawFirmMembers)
    .innerJoin(user, eq(lawFirmMembers.userId, user.id))
    .where(eq(lawFirmMembers.lawFirmId, firmId));
}

// Add member to law firm
export async function addFirmMember(
  firmId: string,
  userId: string,
  role: Role,
  customPermissions?: string[]
) {
  return await db.transaction(async (tx) => {
    // Create membership
    await tx.insert(lawFirmMembers).values({
      lawFirmId: firmId,
      userId,
      role,
      permissions: customPermissions || [],
    });

    // Update user type if they're a client
    const [currentUser] = await tx
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (currentUser?.userType === ROLES.CLIENT) {
      await tx.update(user)
        .set({ userType: role })
        .where(eq(user.id, userId));
    }
  });
}

// Remove member from law firm
export async function removeFirmMember(firmId: string, userId: string) {
  return await db
    .delete(lawFirmMembers)
    .where(
      and(
        eq(lawFirmMembers.lawFirmId, firmId),
        eq(lawFirmMembers.userId, userId)
      )
    );
}

// Update member role
export async function updateMemberRole(
  firmId: string,
  userId: string,
  newRole: Role,
  customPermissions?: string[]
) {
  return await db
    .update(lawFirmMembers)
    .set({
      role: newRole,
      permissions: customPermissions || [],
    })
    .where(
      and(
        eq(lawFirmMembers.lawFirmId, firmId),
        eq(lawFirmMembers.userId, userId)
      )
    );
}

// Get law firm statistics
export async function getLawFirmStats(firmId: string): Promise<LawFirmStats> {
  // Get member count
  const [memberCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(lawFirmMembers)
    .where(eq(lawFirmMembers.lawFirmId, firmId));

  // TODO: Add queries for matters, wills, revenue when those tables are populated
  // For now, return basic stats
  return {
    totalMembers: memberCount?.count || 0,
    totalMatters: 0,
    activeMatters: 0,
    completedWills: 0,
    monthlyRevenue: 0,
    averageCompletionTime: 0,
  };
}

// Search law firms (for admin use)
export async function searchLawFirms(query: string, limit = 10) {
  return await db
    .select()
    .from(lawFirms)
    .where(
      sql`${lawFirms.name} ILIKE ${`%${query}%`} OR ${lawFirms.licenseNumber} ILIKE ${`%${query}%`}`
    )
    .limit(limit);
}

// Get all law firms (for admin use)
export async function getAllLawFirms(limit = 50, offset = 0) {
  return await db
    .select()
    .from(lawFirms)
    .limit(limit)
    .offset(offset);
}

// Check if law firm exists
export async function lawFirmExists(licenseNumber: string): Promise<boolean> {
  const [firm] = await db
    .select({ id: lawFirms.id })
    .from(lawFirms)
    .where(eq(lawFirms.licenseNumber, licenseNumber))
    .limit(1);
    
  return !!firm;
}

// Get firm subscription info
export async function getFirmSubscription(firmId: string) {
  const [firm] = await db
    .select({
      id: lawFirms.id,
      name: lawFirms.name,
      subscriptionTier: lawFirms.subscriptionTier,
      isActive: lawFirms.isActive,
    })
    .from(lawFirms)
    .where(eq(lawFirms.id, firmId))
    .limit(1);
    
  return firm;
}

// Update firm subscription
export async function updateFirmSubscription(
  firmId: string,
  tier: 'starter' | 'professional' | 'enterprise'
) {
  return await db
    .update(lawFirms)
    .set({
      subscriptionTier: tier,
      updatedAt: new Date(),
    })
    .where(eq(lawFirms.id, firmId));
}

// Get firm settings
export async function getFirmSettings(firmId: string) {
  const [firm] = await db
    .select({ settings: lawFirms.settings })
    .from(lawFirms)
    .where(eq(lawFirms.id, firmId))
    .limit(1);
    
  return firm?.settings || {};
}

// Update firm settings
export async function updateFirmSettings(firmId: string, settings: Record<string, unknown>) {
  return await db
    .update(lawFirms)
    .set({
      settings,
      updatedAt: new Date(),
    })
    .where(eq(lawFirms.id, firmId));
}