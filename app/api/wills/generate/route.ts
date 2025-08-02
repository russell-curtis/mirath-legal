/**
 * Will Generation API Endpoint
 * Handles AI-powered DIFC-compliant will generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { 
  generateDIFCWill, 
  generateLegalAnalysis, 
  generateComplianceChecklist,
  generateWillSummary,
  type WillGenerationContext,
  type AIGenerationOptions 
} from '@/lib/ai-will-generator';
import { 
  createWill, 
  updateWill, 
  getWillById,
  validateWillCompleteness,
  getWillTemplate,
  generateDIFCContent,
  validateDIFCCompliance,
  type CreateWillData,
  type PersonalInfo,
  type Asset,
  type Beneficiary,
  type Guardian,
  type Executor
} from '@/lib/will-engine';
import { db } from '@/db/drizzle';
import { willDocuments, aiJobs } from '@/db/schema';
import { nanoid } from 'nanoid';

// Request schema for will generation
interface GenerateWillRequest {
  willData: {
    testatorName: string;
    emiratesId: string;
    nationality: string;
    residenceAddress: string;
    dateOfBirth: string;
    maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
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
  matterId?: string;
  generateOptions?: {
    includeLegalAnalysis?: boolean;
    includeComplianceCheck?: boolean;
    includeSummary?: boolean;
    formalityLevel?: 'standard' | 'formal' | 'very_formal';
  };
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const result = await auth.api.getSession({
      headers: await headers(),
    });

    if (!result?.session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = result.session.userId;
    const body: GenerateWillRequest = await request.json();
    const { willData, matterId, generateOptions = {} } = body;

    // Validate required fields
    if (!willData.emiratesId || !willData.testatorName) {
      return NextResponse.json(
        { error: 'Emirates ID and testator name are required' },
        { status: 400 }
      );
    }

    // Create AI job record for tracking
    const jobId = nanoid();
    const [aiJob] = await db.insert(aiJobs).values({
      id: jobId,
      userId,
      jobType: 'will_generation',
      status: 'in_progress',
      inputData: willData,
      parameters: generateOptions,
    }).returning();

    try {
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

      // Create will in database if matterId provided
      let willId: string | undefined;
      if (matterId) {
        const createWillData: CreateWillData = {
          matterId,
          testatorId: userId,
          willType: willData.willType,
          language: willData.language,
          personalInfo,
          assets,
          beneficiaries,
          guardians,
          executors,
          specialInstructions: willData.specialInstructions,
        };

        const createdWill = await createWill(createWillData);
        willId = createdWill.id;
      }

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

      // Generate DIFC template content first
      const template = getWillTemplate(willData.willType);
      const difcContent = generateDIFCContent(createWillData, template);
      
      // Validate DIFC compliance
      const difcValidation = validateDIFCCompliance({
        personalInfo,
        assets,
        beneficiaries,
        executors,
        guardians,
        specialInstructions: willData.specialInstructions,
      });

      // Generate AI-enhanced will using both template and AI
      const generatedWill = await generateDIFCWill(generationContext, aiOptions);

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
        legalAnalysis = await generateLegalAnalysis(
          difcContent,
          assets
        );
      }

      if (generateOptions.includeComplianceCheck) {
        complianceCheck = await generateComplianceChecklist(
          difcContent
        );
      }

      if (generateOptions.includeSummary) {
        willSummary = await generateWillSummary(
          difcContent
        );
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

      // Store generated document
      let documentId: string | undefined;
      if (willId) {
        const [document] = await db.insert(willDocuments).values({
          willId,
          documentType: 'generated_will',
          title: `${willData.willType.charAt(0).toUpperCase() + willData.willType.slice(1)} Will - ${willData.testatorName}`,
          content: JSON.stringify(finalWillContent),
          metadata: {
            legalAnalysis,
            complianceCheck,
            willSummary,
            validation,
            difcValidation,
            generatedBy: 'ai',
            jobId,
          },
          version: 1,
          status: 'generated',
        }).returning();

        documentId = document.id;

        // Update will status
        await updateWill(willId, {
          status: 'under_review',
          difcCompliant: difcValidation.isCompliant,
        });
      }

      // Update AI job status
      await db.update(aiJobs)
        .set({
          status: 'completed',
          outputData: {
            finalWillContent,
            legalAnalysis,
            complianceCheck,
            willSummary,
            validation,
            difcValidation,
          },
          completedAt: new Date(),
        })
        .where({ id: jobId });

      // Return comprehensive response
      return NextResponse.json({
        success: true,
        jobId,
        willId,
        documentId,
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
          completeness: validation.completeness,
          complianceScore: difcValidation.score,
        },
      });

    } catch (generationError) {
      console.error('Will generation error:', generationError);

      // Update AI job status to failed
      await db.update(aiJobs)
        .set({
          status: 'failed',
          errorMessage: generationError instanceof Error ? generationError.message : 'Unknown error',
          completedAt: new Date(),
        })
        .where({ id: jobId });

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

// GET endpoint to check generation status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const result = await auth.api.getSession({
      headers: await headers(),
    });

    if (!result?.session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get job status
    const [job] = await db.select()
      .from(aiJobs)
      .where({ id: jobId, userId: result.session.userId })
      .limit(1);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      progress: job.status === 'completed' ? 100 : 
                job.status === 'failed' ? 0 : 50,
      outputData: job.outputData,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}