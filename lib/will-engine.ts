/**
 * Will Creation Engine for Mirath Legal
 * Handles will creation, validation, and AI-powered document generation
 */

import { db } from "@/db/drizzle";
import { wills } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

// Types for will creation
export interface PersonalInfo {
  emiratesId: string;
  passportNumber: string;
  nationality: string;
  visaStatus: 'residence' | 'investor' | 'golden' | 'employment' | 'other';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  address: {
    street: string;
    city: string;
    emirate: string;
    poBox: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
}

export interface Asset {
  id: string;
  type: 'property' | 'bank_account' | 'investment' | 'business' | 'digital';
  name: string;
  description: string;
  estimatedValue: number;
  currency: string;
  jurisdiction: string;
  details: Record<string, unknown>;
}

export interface Beneficiary {
  id: string;
  type: 'individual' | 'charity' | 'organization';
  fullName: string;
  relationship: string;
  dateOfBirth?: string;
  nationality?: string;
  contactInfo?: Record<string, unknown>;
  inheritancePercentage?: number;
  specificAssets?: string[];
  conditions?: string[];
  isContingent: boolean;
}

export interface Guardian {
  id: string;
  fullName: string;
  relationship: string;
  contactInfo: Record<string, unknown>;
  isPrimary: boolean;
  conditions?: string;
}

export interface Executor {
  id: string;
  fullName: string;
  relationship: string;
  contactInfo: Record<string, unknown>;
  isPrimary: boolean;
  powers?: string[];
}

export interface CreateWillData {
  matterId: string;
  testatorId: string;
  willType: 'simple' | 'complex' | 'business_succession' | 'digital_assets';
  language?: 'en' | 'ar';
  personalInfo: PersonalInfo;
  assets?: Asset[];
  beneficiaries?: Beneficiary[];
  guardians?: Guardian[];
  executors?: Executor[];
  specialInstructions?: string;
}

export interface UpdateWillData {
  willType?: 'simple' | 'complex' | 'business_succession' | 'digital_assets';
  language?: 'en' | 'ar';
  personalInfo?: Partial<PersonalInfo>;
  assets?: Asset[];
  beneficiaries?: Beneficiary[];
  guardians?: Guardian[];
  executors?: Executor[];
  specialInstructions?: string;
  status?: 'draft' | 'under_review' | 'client_review' | 'final' | 'registered';
}

// DIFC Will Templates
export const DIFC_WILL_TEMPLATES = {
  SIMPLE: {
    id: 'simple_difc',
    name: 'Simple DIFC Will',
    description: 'Basic will for expatriates with straightforward asset distribution',
    requiredSections: ['testator_details', 'beneficiaries', 'assets', 'executors'],
    optionalSections: ['guardians', 'special_instructions'],
  },
  COMPLEX: {
    id: 'complex_difc',
    name: 'Complex DIFC Will',
    description: 'Advanced will for complex asset structures and multiple jurisdictions',
    requiredSections: ['testator_details', 'beneficiaries', 'assets', 'executors', 'trustees'],
    optionalSections: ['guardians', 'special_instructions', 'charitable_bequests'],
  },
  BUSINESS_SUCCESSION: {
    id: 'business_difc',
    name: 'Business Succession DIFC Will',
    description: 'Specialized will for business owners with succession planning',
    requiredSections: ['testator_details', 'beneficiaries', 'business_assets', 'executors', 'business_continuity'],
    optionalSections: ['guardians', 'buy_sell_agreements', 'key_person_provisions'],
  },
  DIGITAL_ASSETS: {
    id: 'digital_difc',
    name: 'Digital Assets DIFC Will',
    description: 'Modern will including cryptocurrency and digital asset management',
    requiredSections: ['testator_details', 'beneficiaries', 'digital_assets', 'executors', 'digital_access'],
    optionalSections: ['guardians', 'crypto_trustees', 'digital_instructions'],
  },
};

// Create a new will
export async function createWill(data: CreateWillData) {
  return await db.transaction(async (tx) => {
    const [will] = await tx.insert(wills).values({
      matterId: data.matterId,
      testatorId: data.testatorId,
      willType: data.willType,
      language: data.language || 'en',
      personalInfo: data.personalInfo,
      assets: data.assets || [],
      beneficiaries: data.beneficiaries || [],
      guardians: data.guardians || [],
      executors: data.executors || [],
      specialInstructions: data.specialInstructions,
      status: 'draft',
      difcCompliant: false, // Will be set to true after validation
      version: 1,
    }).returning();

    return will;
  });
}

// Get will by ID
export async function getWillById(willId: string) {
  const [will] = await db
    .select()
    .from(wills)
    .where(eq(wills.id, willId))
    .limit(1);
    
  return will;
}

// Get will by matter ID
export async function getWillByMatterId(matterId: string) {
  const [will] = await db
    .select()
    .from(wills)
    .where(eq(wills.matterId, matterId))
    .limit(1);
    
  return will;
}

// Update will
export async function updateWill(willId: string, data: UpdateWillData) {
  const [updatedWill] = await db
    .update(wills)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(wills.id, willId))
    .returning();
    
  return updatedWill;
}

// Validate will completeness based on template requirements
export function validateWillCompleteness(will: Record<string, unknown>, template: typeof DIFC_WILL_TEMPLATES.SIMPLE) {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required sections
  if (template.requiredSections.includes('testator_details') && 
      (!will.personalInfo || !will.personalInfo.emiratesId)) {
    errors.push('Testator Emirates ID is required');
  }

  if (template.requiredSections.includes('beneficiaries') && 
      (!will.beneficiaries || will.beneficiaries.length === 0)) {
    errors.push('At least one beneficiary is required');
  }

  if (template.requiredSections.includes('assets') && 
      (!will.assets || will.assets.length === 0)) {
    warnings.push('No assets specified - will may be incomplete');
  }

  if (template.requiredSections.includes('executors') && 
      (!will.executors || will.executors.length === 0)) {
    errors.push('At least one executor is required');
  }

  // Validate beneficiary percentages add up to 100%
  if (will.beneficiaries && will.beneficiaries.length > 0) {
    const totalPercentage = will.beneficiaries.reduce(
      (sum: number, ben: Beneficiary) => sum + (ben.inheritancePercentage || 0),
      0
    );
    
    if (totalPercentage !== 100 && totalPercentage !== 0) {
      warnings.push(`Beneficiary percentages total ${totalPercentage}% instead of 100%`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    completeness: calculateCompleteness(will, template),
  };
}

// Calculate will completeness percentage
function calculateCompleteness(will: Record<string, unknown>, template: typeof DIFC_WILL_TEMPLATES.SIMPLE): number {
  const totalSections = template.requiredSections.length + template.optionalSections.length;
  let completedSections = 0;

  // Check required sections
  template.requiredSections.forEach(section => {
    switch (section) {
      case 'testator_details':
        if (will.personalInfo && will.personalInfo.emiratesId) completedSections++;
        break;
      case 'beneficiaries':
        if (will.beneficiaries && will.beneficiaries.length > 0) completedSections++;
        break;
      case 'assets':
        if (will.assets && will.assets.length > 0) completedSections++;
        break;
      case 'executors':
        if (will.executors && will.executors.length > 0) completedSections++;
        break;
    }
  });

  // Check optional sections
  template.optionalSections.forEach(section => {
    switch (section) {
      case 'guardians':
        if (will.guardians && will.guardians.length > 0) completedSections++;
        break;
      case 'special_instructions':
        if (will.specialInstructions) completedSections++;
        break;
    }
  });

  return Math.round((completedSections / totalSections) * 100);
}

// Add asset to will
export async function addAssetToWill(willId: string, asset: Asset) {
  const will = await getWillById(willId);
  if (!will) throw new Error('Will not found');

  const currentAssets = will.assets || [];
  const newAsset = { ...asset, id: asset.id || nanoid() };
  const updatedAssets = [...currentAssets, newAsset];

  return await updateWill(willId, { assets: updatedAssets });
}

// Remove asset from will
export async function removeAssetFromWill(willId: string, assetId: string) {
  const will = await getWillById(willId);
  if (!will) throw new Error('Will not found');

  const currentAssets = will.assets || [];
  const updatedAssets = currentAssets.filter((asset: Asset) => asset.id !== assetId);

  return await updateWill(willId, { assets: updatedAssets });
}

// Add beneficiary to will
export async function addBeneficiaryToWill(willId: string, beneficiary: Beneficiary) {
  const will = await getWillById(willId);
  if (!will) throw new Error('Will not found');

  const currentBeneficiaries = will.beneficiaries || [];
  const newBeneficiary = { ...beneficiary, id: beneficiary.id || nanoid() };
  const updatedBeneficiaries = [...currentBeneficiaries, newBeneficiary];

  return await updateWill(willId, { beneficiaries: updatedBeneficiaries });
}

// Remove beneficiary from will
export async function removeBeneficiaryFromWill(willId: string, beneficiaryId: string) {
  const will = await getWillById(willId);
  if (!will) throw new Error('Will not found');

  const currentBeneficiaries = will.beneficiaries || [];
  const updatedBeneficiaries = currentBeneficiaries.filter(
    (beneficiary: Beneficiary) => beneficiary.id !== beneficiaryId
  );

  return await updateWill(willId, { beneficiaries: updatedBeneficiaries });
}

// Get will template by type
export function getWillTemplate(willType: string) {
  switch (willType) {
    case 'simple':
      return DIFC_WILL_TEMPLATES.SIMPLE;
    case 'complex':
      return DIFC_WILL_TEMPLATES.COMPLEX;
    case 'business_succession':
      return DIFC_WILL_TEMPLATES.BUSINESS_SUCCESSION;
    case 'digital_assets':
      return DIFC_WILL_TEMPLATES.DIGITAL_ASSETS;
    default:
      return DIFC_WILL_TEMPLATES.SIMPLE;
  }
}

// Create new will version
export async function createWillVersion(willId: string, changes: UpdateWillData) {
  return await db.transaction(async (tx) => {
    const originalWill = await getWillById(willId);
    if (!originalWill) throw new Error('Original will not found');

    // Create new version
    const [newVersion] = await tx.insert(wills).values({
      matterId: originalWill.matterId,
      testatorId: originalWill.testatorId,
      willType: changes.willType || originalWill.willType,
      language: changes.language || originalWill.language,
      personalInfo: { ...originalWill.personalInfo, ...changes.personalInfo },
      assets: changes.assets || originalWill.assets,
      beneficiaries: changes.beneficiaries || originalWill.beneficiaries,
      guardians: changes.guardians || originalWill.guardians,
      executors: changes.executors || originalWill.executors,
      specialInstructions: changes.specialInstructions || originalWill.specialInstructions,
      status: 'draft',
      version: originalWill.version + 1,
      parentWillId: willId,
    }).returning();

    return newVersion;
  });
}

// Get will versions history
export async function getWillVersions(willId: string) {
  return await db
    .select()
    .from(wills)
    .where(eq(wills.parentWillId, willId))
    .orderBy(wills.version);
}