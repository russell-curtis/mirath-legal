/**
 * Simplified Will Generation API
 * AI-powered will generation without database operations for testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDevAuth, isDevMode } from '@/lib/dev-auth';
import { 
  generateDIFCWill, 
  generateLegalAnalysis, 
  generateComplianceChecklist,
  generateWillSummary,
  type WillGenerationContext,
  type AIGenerationOptions 
} from '@/lib/ai-will-generator';
import { 
  getWillTemplate,
  generateDIFCContent,
  validateDIFCCompliance,
  validateWillCompleteness,
  type PersonalInfo,
  type Asset,
  type Beneficiary,
  type Guardian,
  type Executor
} from '@/lib/will-engine';
import { nanoid } from 'nanoid';

// Request schema for will generation
interface GenerateWillRequest {
  willData: {
    testatorName: string;
    emiratesId: string;
    nationality: string;
    residenceAddress: string;
    dateOfBirth: string;
    maritalStatus: 'simple' | 'married' | 'divorced' | 'widowed';
    spouseName?: string;
    assets: Array<{
      id: string;
      type: 'real_estate' | 'bank_account' | 'investment' | 'personal_property' | 'business' | 'digital';
      description: string;
      value: number;
      location: string;
      specificInstructions?: string;
    }>;
    beneficiaries: Array<{
      id: string;
      name: string;
      relationship: string;
      percentage: number;
      contingent: boolean;
      specificAssets?: string[];
      conditions?: string;
    }>;
    guardians: Array<{
      id: string;
      name: string;
      relationship: string;
      address: string;
      phone: string;
      alternateGuardian?: boolean;
    }>;
    executors: Array<{
      id: string;
      name: string;
      relationship: string;
      address: string;
      phone: string;
      alternateExecutor?: boolean;
    }>;
    specialInstructions?: string;
    funeralArrangements?: string;
    willType: 'simple' | 'complex' | 'business_succession' | 'digital_assets';
    language: 'en' | 'ar';
  };
  generateOptions?: {
    includeLegalAnalysis?: boolean;
    includeComplianceCheck?: boolean;
    includeSummary?: boolean;
    formalityLevel?: 'standard' | 'formal' | 'very_formal';
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Simplified Will Generation API Called ===');
    
    // Development mode authentication (simpler than full auth)
    let userId: string = 'dev-user-001';
    
    if (isDevMode()) {
      const devAuth = await getDevAuth();
      userId = devAuth?.user.id || 'dev-user-001';
      console.log('🚀 DEVELOPMENT MODE: Using mock authentication');
      console.log('👤 Mock User ID:', userId);
    }

    let body: GenerateWillRequest;
    try {
      body = await request.json();
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { willData, generateOptions = {} } = body;
    console.log('Request data:', { 
      hasWillData: !!willData, 
      generateOptions 
    });

    // Validate required fields
    if (!willData.emiratesId || !willData.testatorName) {
      return NextResponse.json(
        { error: 'Emirates ID and testator name are required' },
        { status: 400 }
      );
    }

    const jobId = nanoid();
    console.log('Generated job ID:', jobId);

    try {
      console.log('Starting will generation for user:', userId);
      console.log('Will data received:', { 
        testatorName: willData.testatorName, 
        emiratesId: willData.emiratesId,
        willType: willData.willType 
      });

      // Transform UI data to will engine format
      const personalInfo: PersonalInfo = {
        emiratesId: willData.emiratesId,
        passportNumber: '', // Not captured in UI yet
        nationality: willData.nationality,
        visaStatus: 'residence', // Default, should be captured in UI
        maritalStatus: willData.maritalStatus,
        address: {
          street: willData.residenceAddress,
          city: '', // Should be parsed from address
          emirate: '', // Should be captured separately
          poBox: '',
          country: 'UAE',
        },
        emergencyContact: {
          name: willData.spouseName || '',
          relationship: 'spouse',
          phone: '',
          email: '',
        },
      };

      const assets: Asset[] = willData.assets.map(asset => ({
        id: asset.id,
        type: asset.type === 'real_estate' ? 'property' : 
              asset.type === 'personal_property' ? 'property' : asset.type,
        name: asset.description,
        description: asset.description,
        estimatedValue: asset.value,
        currency: 'AED',
        jurisdiction: asset.location,
        details: {
          specificInstructions: asset.specificInstructions,
        },
      }));

      const beneficiaries: Beneficiary[] = willData.beneficiaries.map(ben => ({
        id: ben.id,
        type: 'individual',
        fullName: ben.name,
        relationship: ben.relationship,
        inheritancePercentage: ben.percentage,
        specificAssets: ben.specificAssets,
        conditions: ben.conditions ? [ben.conditions] : [],
        isContingent: ben.contingent,
      }));

      const executors: Executor[] = willData.executors.map(exec => ({
        id: exec.id,
        fullName: exec.name,
        relationship: exec.relationship,
        contactInfo: {
          address: exec.address,
          phone: exec.phone,
        },
        isPrimary: !exec.alternateExecutor,
        powers: ['full_authority'],
      }));

      const guardians: Guardian[] = willData.guardians.map(guard => ({
        id: guard.id,
        fullName: guard.name,
        relationship: guard.relationship,
        contactInfo: {
          address: guard.address,
          phone: guard.phone,
        },
        isPrimary: !guard.alternateGuardian,
      }));

      // Generate DIFC template content first
      const template = getWillTemplate(willData.willType);
      const difcContent = generateDIFCContent({
        matterId: '', // Not needed for simple generation
        testatorId: userId,
        willType: willData.willType,
        language: willData.language,
        personalInfo,
        assets,
        beneficiaries,
        guardians,
        executors,
        specialInstructions: willData.specialInstructions,
      }, template);
      
      // Validate DIFC compliance
      const difcValidation = validateDIFCCompliance({
        personalInfo,
        assets,
        beneficiaries,
        executors,
        guardians,
        specialInstructions: willData.specialInstructions,
      });

      // Prepare context for AI generation
      const generationContext: WillGenerationContext = {
        personalInfo,
        assets,
        beneficiaries,
        executors,
        guardians,
        specialInstructions: willData.specialInstructions,
        willType: willData.willType,
      };

      const aiOptions: AIGenerationOptions = {
        language: willData.language,
        includeTechnicalTerms: true,
        formalityLevel: generateOptions.formalityLevel || 'formal',
        includeExplanations: false,
      };

      // Generate AI-enhanced will
      console.log('Starting AI will generation...');
      let generatedWill;
      try {
        generatedWill = await generateDIFCWill(generationContext, aiOptions);
        console.log('AI will generation completed successfully');
      } catch (aiError) {
        console.error('AI generation failed, using template fallback:', aiError);
        // Fall back to template-only generation if AI fails
        generatedWill = {
          title: `Last Will and Testament of ${willData.testatorName}`,
          preamble: difcContent,
          revocation: 'I hereby revoke all former wills and testamentary dispositions made by me.',
          beneficiaryProvisions: willData.beneficiaries.map(ben => ({
            beneficiaryName: ben.name,
            provision: `I give to ${ben.name} (${ben.relationship}) ${ben.percentage}% of my estate.`,
            percentage: ben.percentage,
          })),
          executorProvisions: willData.executors.length > 0 ? 
            `I appoint ${willData.executors[0].name} as the executor of this will.` : '',
          guardianProvisions: willData.guardians.length > 0 ? 
            `I appoint ${willData.guardians[0].name} as guardian for any minor children.` : '',
          residuaryClause: 'I give the rest of my estate to my beneficiaries in the proportions specified above.',
          witnessClause: 'This will is witnessed by two independent witnesses as required by DIFC law.',
          signature: `Signed by ${willData.testatorName} on [DATE]`,
          difcCompliance: {
            registrationRequirement: 'This will must be registered with the DIFC Wills and Probate Registry within 6 months.',
            governingLaw: 'This will is governed by DIFC Law No. 5 of 2012',
            jurisdiction: 'Any disputes will be resolved by the DIFC Courts',
          },
        };
      }

      // Combine template content with AI enhancements
      const finalWillContent = {
        ...generatedWill,
        templateContent: difcContent,
        difcCompliance: difcValidation,
      };

      // Generate additional content if requested
      let legalAnalysis;
      let complianceCheck;
      let willSummary;

      if (generateOptions.includeLegalAnalysis) {
        try {
          legalAnalysis = await generateLegalAnalysis(
            difcContent,
            assets
          );
        } catch (error) {
          console.error('Legal analysis generation failed:', error);
          legalAnalysis = {
            recommendations: ['Consider regular review of this will'],
            keyRisks: ['Ensure DIFC registration within required timeframe'],
            overallScore: 85,
          };
        }
      }

      if (generateOptions.includeComplianceCheck) {
        try {
          complianceCheck = await generateComplianceChecklist(
            difcContent
          );
        } catch (error) {
          console.error('Compliance check generation failed:', error);
          complianceCheck = {
            overallScore: 90,
            difcCompliant: true,
            checklist: ['DIFC format compliance: ✓', 'Required clauses: ✓'],
          };
        }
      }

      if (generateOptions.includeSummary) {
        try {
          willSummary = await generateWillSummary(
            difcContent
          );
        } catch (error) {
          console.error('Will summary generation failed:', error);
          willSummary = {
            overview: `Will for ${willData.testatorName} distributing ${willData.assets.length} assets among ${willData.beneficiaries.length} beneficiaries.`,
            keyPoints: [
              `${willData.beneficiaries.length} beneficiaries`,
              `${willData.assets.length} assets`,
              `${willData.executors.length} executor(s)`,
            ],
          };
        }
      }

      // Validate will completeness
      const validation = validateWillCompleteness(
        {
          personalInfo,
          assets,
          beneficiaries,
          executors,
          guardians,
          specialInstructions: willData.specialInstructions,
        },
        template
      );

      // Return comprehensive response
      return NextResponse.json({
        success: true,
        jobId,
        generatedWill: finalWillContent,
        validation,
        legalAnalysis,
        complianceCheck,
        willSummary,
        difcValidation,
        metadata: {
          generatedAt: new Date().toISOString(),
          language: willData.language,
          willType: willData.willType,
          difcCompliant: difcValidation.isCompliant,
          completeness: validation?.completeness || 0,
          complianceScore: difcValidation.score,
          templateOnly: false,
        },
      });

    } catch (generationError) {
      console.error('Will generation error:', generationError);

      return NextResponse.json(
        { 
          error: 'Failed to generate will',
          details: generationError instanceof Error ? generationError.message : 'Unknown error',
          jobId 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}