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
import { eq } from 'drizzle-orm';
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
    console.log('=== Will Generation API Called ===');
    
    // Authenticate user
    const result = await auth.api.getSession({
      headers: await headers(),
    });

    if (!result?.session?.userId) {
      console.log('Authentication failed - no user session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = result.session.userId;
    console.log('User authenticated:', userId);

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

    const { willData, matterId, generateOptions = {} } = body;
    console.log('Request data:', { 
      hasWillData: !!willData, 
      matterId, 
      generateOptions 
    });

    // Validate required fields
    if (!willData.emiratesId || !willData.testatorName) {
      return NextResponse.json(
        { error: 'Emirates ID and testator name are required' },
        { status: 400 }
      );
    }

    // For now, skip database operations if no matterId is provided
    // This allows the API to work for will generation without requiring a matter
    if (!matterId) {
      console.log('No matterId provided, skipping database operations');
    }

    // Create AI job record for tracking (let database generate UUID)
    console.log('Creating AI job record...');
    
    let aiJob;
    try {
      [aiJob] = await db.insert(aiJobs).values({
        // Remove manual ID - let database generate UUID
        userId,
        jobType: 'will_generation',
        status: 'in_progress',
        inputData: willData,
        parameters: generateOptions,
      }).returning();
      
      const jobId = aiJob.id;
      console.log('AI job created successfully with ID:', jobId);
    } catch (dbError) {
      console.error('Failed to create AI job:', dbError);
      return NextResponse.json(
        { error: 'Database error: Failed to create job record' },
        { status: 500 }
      );
    }

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

      // Prepare will data structure
      const createWillData: CreateWillData = {
        matterId: matterId || '', // Use empty string if no matterId
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

      // Create will in database if matterId provided
      let willId: string | undefined;
      if (matterId) {
        console.log('Creating will in database with matterId:', matterId);
        const createdWill = await createWill(createWillData);
        willId = createdWill.id;
        console.log('Will created successfully with ID:', willId);
      } else {
        console.log('Skipping will creation - no matterId provided');
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
      console.log('Starting AI will generation...');
      let generatedWill;
      try {
        generatedWill = await generateDIFCWill(generationContext, aiOptions);
        console.log('AI will generation completed successfully');
      } catch (aiError) {
        console.error('AI generation failed:', aiError);
        // Fall back to template-only generation if AI fails
        generatedWill = {
          title: `Last Will and Testament of ${willData.testatorName}`,
          preamble: difcContent,
          beneficiaryProvisions: [],
          executorProvisions: '',
          residuaryClause: '',
          witnessClause: '',
          signature: '',
          difcCompliance: {
            registrationRequirement: 'DIFC registration required',
            governingLaw: 'DIFC Law',
            jurisdiction: 'DIFC Courts',
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
          legalAnalysis = null;
        }
      }

      if (generateOptions.includeComplianceCheck) {
        try {
          complianceCheck = await generateComplianceChecklist(
            difcContent
          );
        } catch (error) {
          console.error('Compliance check generation failed:', error);
          complianceCheck = null;
        }
      }

      if (generateOptions.includeSummary) {
        try {
          willSummary = await generateWillSummary(
            difcContent
          );
        } catch (error) {
          console.error('Will summary generation failed:', error);
          willSummary = null;
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

      // Store generated document
      let documentId: string | undefined;
      if (willId && matterId) {
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
            jobId: aiJob.id,
          },
          version: 1,
          status: 'generated',
        }).returning();

        documentId = document.id;

        // Update will status
        if (willId) {
          await updateWill(willId, {
            status: 'under_review',
            difcCompliant: difcValidation.isCompliant,
          });
        }
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
        .where(eq(aiJobs.id, aiJob.id));

      // Return comprehensive response
      return NextResponse.json({
        success: true,
        jobId: aiJob.id,
        willId: willId || null,
        documentId: documentId || null,
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
          templateOnly: !matterId, // Indicate if this was template-only generation
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
        .where(eq(aiJobs.id, aiJob.id));

      return NextResponse.json(
        { 
          error: 'Failed to generate will',
          details: generationError instanceof Error ? generationError.message : 'Unknown error',
          jobId: aiJob.id 
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