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

// Generate DIFC-compliant will content based on template
export function generateDIFCContent(
  willData: CreateWillData | UpdateWillData,
  template: typeof DIFC_WILL_TEMPLATES.SIMPLE
): string {
  const { personalInfo, assets, beneficiaries, executors, guardians, specialInstructions } = willData;

  let content = `LAST WILL AND TESTAMENT

IN THE NAME OF ALLAH, THE MOST GRACIOUS, THE MOST MERCIFUL

I, ${personalInfo?.emiratesId ? '[Full Name as per Emirates ID]' : 'NAME TO BE FILLED'}, holder of Emirates ID No. ${personalInfo?.emiratesId || '[EMIRATES_ID]'}, of ${personalInfo?.nationality || '[NATIONALITY]'} nationality, ${personalInfo?.visaStatus || 'residence'} visa holder, residing at ${formatPersonalAddress(personalInfo?.address)}, being of sound mind and disposing memory, do hereby make, publish and declare this to be my Last Will and Testament, hereby revoking all former wills and codicils made by me.

PRELIMINARY DECLARATIONS

1. IDENTIFICATION
   I am ${personalInfo?.maritalStatus || 'single'} and ${personalInfo?.maritalStatus === 'married' ? 'my spouse is [SPOUSE_NAME]' : 'have no spouse'}.

2. DIFC JURISDICTION
   This Will is made pursuant to the DIFC Wills and Probate Registry Law and shall be governed by the laws of the Dubai International Financial Centre (DIFC). I hereby submit to the jurisdiction of the DIFC Courts for all matters relating to this Will.

3. REVOCATION
   I hereby revoke all prior wills, codicils, and testamentary dispositions made by me.

`;

  // Add asset provisions
  if (assets && assets.length > 0) {
    content += `DISPOSITION OF ASSETS

4. SPECIFIC BEQUESTS
`;
    assets.forEach((asset, index) => {
      content += `   ${index + 4}.${index + 1} I give, devise and bequeath my ${asset.description} located in ${asset.jurisdiction}, valued at approximately ${asset.currency} ${asset.estimatedValue?.toLocaleString() || 'VALUE_TBD'}, to be distributed as set forth in this Will.\n`;
    });
  }

  // Add beneficiary provisions
  if (beneficiaries && beneficiaries.length > 0) {
    content += `\n5. BENEFICIARY PROVISIONS
`;
    beneficiaries.forEach((beneficiary, index) => {
      const percentage = beneficiary.inheritancePercentage || 0;
      content += `   5.${index + 1} I give ${percentage}% of my residuary estate to ${beneficiary.fullName}, my ${beneficiary.relationship}`;
      
      if (beneficiary.isContingent) {
        content += ` (contingent beneficiary)`;
      }
      
      if (beneficiary.conditions && beneficiary.conditions.length > 0) {
        content += `, subject to the following conditions: ${beneficiary.conditions.join(', ')}`;
      }
      
      content += `.\n`;
    });
  }

  // Add executor provisions
  if (executors && executors.length > 0) {
    content += `\n6. APPOINTMENT OF EXECUTOR(S)
`;
    const primaryExecutors = executors.filter(exec => exec.isPrimary);
    const alternateExecutors = executors.filter(exec => !exec.isPrimary);

    if (primaryExecutors.length > 0) {
      content += `   I hereby nominate and appoint ${primaryExecutors.map(exec => exec.fullName).join(' and ')} as ${primaryExecutors.length > 1 ? 'joint Executors' : 'Executor'} of this my Will.\n`;
    }

    if (alternateExecutors.length > 0) {
      content += `   In the event that ${primaryExecutors.length > 0 ? 'the above-named Executor(s) cannot or will not serve' : 'no primary executor is available'}, I nominate and appoint ${alternateExecutors.map(exec => exec.fullName).join(' and ')} as ${alternateExecutors.length > 1 ? 'joint alternate Executors' : 'alternate Executor'}.\n`;
    }

    content += `\n   I grant to my Executor(s) full power and authority to:\n`;
    content += `   a) Sell, transfer, or otherwise dispose of any of my assets\n`;
    content += `   b) Pay all debts, taxes, and expenses of my estate\n`;
    content += `   c) Distribute assets according to the terms of this Will\n`;
    content += `   d) Take all actions necessary for the proper administration of my estate\n`;
  }

  // Add guardian provisions if applicable
  if (guardians && guardians.length > 0) {
    content += `\n7. APPOINTMENT OF GUARDIAN(S)
`;
    const primaryGuardians = guardians.filter(guard => guard.isPrimary);
    const alternateGuardians = guardians.filter(guard => !guard.isPrimary);

    if (primaryGuardians.length > 0) {
      content += `   In the event I have minor children at the time of my death, I nominate and appoint ${primaryGuardians.map(guard => guard.fullName).join(' and ')} as ${primaryGuardians.length > 1 ? 'joint Guardians' : 'Guardian'} of my minor children.\n`;
    }

    if (alternateGuardians.length > 0) {
      content += `   If the above-named Guardian(s) cannot or will not serve, I nominate ${alternateGuardians.map(guard => guard.fullName).join(' and ')} as ${alternateGuardians.length > 1 ? 'alternate joint Guardians' : 'alternate Guardian'}.\n`;
    }
  }

  // Add special instructions
  if (specialInstructions) {
    content += `\n8. SPECIAL INSTRUCTIONS
   ${specialInstructions}\n`;
  }

  // Add residuary clause
  content += `\n9. RESIDUARY CLAUSE
   All the rest, residue and remainder of my estate, real and personal, of whatsoever nature and wheresoever situated, I give, devise and bequeath to my beneficiaries as set forth above in the proportions specified.

10. MISCELLANEOUS PROVISIONS
   a) If any beneficiary dies before me, their share shall be distributed to the remaining beneficiaries in proportion to their respective shares.
   b) This Will shall be construed according to the laws of the DIFC.
   c) If any provision of this Will is deemed invalid, the remaining provisions shall remain in full force and effect.

11. EXECUTION
   IN WITNESS WHEREOF, I have hereunto set my hand and seal on this _____ day of _____________, 20__.

   
   _________________________________
   [TESTATOR NAME]
   Testator

   
   WITNESSED BY:
   
   _________________________________     _________________________________
   Witness 1 Name                        Witness 1 Signature
   
   _________________________________     _________________________________
   Witness 2 Name                        Witness 2 Signature

DIFC COMPLIANCE CERTIFICATE

This Will has been prepared in accordance with:
- DIFC Law No. 5 of 2012 (DIFC Wills and Probate Registry Law)
- DIFC Courts Law
- DIFC regulatory requirements for expatriate wills

For registration with the DIFC Wills and Probate Registry, this document must be:
1. Signed by the testator in the presence of two witnesses
2. Witnessed by two competent adults
3. Submitted to DIFC with required fees and documentation
4. Accompanied by supporting identification documents

Document prepared on: ${new Date().toLocaleDateString()}
Template: ${template.name}
Language: ${(willData as any).language === 'ar' ? 'Arabic' : 'English'}`;

  return content;
}

// Helper function to format personal address
function formatPersonalAddress(address: any): string {
  if (!address) return '[ADDRESS TO BE PROVIDED]';
  
  const parts = [
    address.street,
    address.city,
    address.emirate,
    address.country || 'UAE'
  ].filter(Boolean);
  
  return parts.join(', ') || '[ADDRESS TO BE PROVIDED]';
}

// Validate DIFC compliance requirements
export function validateDIFCCompliance(will: Record<string, any>): {
  isCompliant: boolean;
  requirements: Array<{
    requirement: string;
    met: boolean;
    description: string;
  }>;
  score: number;
} {
  const requirements = [
    {
      requirement: 'Testator Identification',
      met: !!(will.personalInfo?.emiratesId && will.personalInfo?.nationality),
      description: 'Emirates ID and nationality must be specified'
    },
    {
      requirement: 'DIFC Jurisdiction Clause',
      met: true, // Automatically included in template
      description: 'Must specify DIFC jurisdiction and governing law'
    },
    {
      requirement: 'Revocation Clause',
      met: true, // Automatically included in template
      description: 'Must revoke all previous wills and codicils'
    },
    {
      requirement: 'Asset Identification',
      met: !!(will.assets && will.assets.length > 0),
      description: 'At least one asset must be identified'
    },
    {
      requirement: 'Beneficiary Designation',
      met: !!(will.beneficiaries && will.beneficiaries.length > 0),
      description: 'At least one beneficiary must be named'
    },
    {
      requirement: 'Executor Appointment',
      met: !!(will.executors && will.executors.length > 0),
      description: 'At least one executor must be appointed'
    },
    {
      requirement: 'Witness Provisions',
      met: true, // Included in template
      description: 'Must include proper witness signature sections'
    },
    {
      requirement: 'UAE Residency Status',
      met: !!(will.personalInfo?.visaStatus),
      description: 'UAE visa/residency status must be specified'
    }
  ];

  const metRequirements = requirements.filter(req => req.met).length;
  const score = Math.round((metRequirements / requirements.length) * 100);
  const isCompliant = score >= 85; // 85% compliance threshold

  return {
    isCompliant,
    requirements,
    score
  };
}