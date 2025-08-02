/**
 * AI Will Generation API Route
 * Handles AI-powered document generation for DIFC-compliant wills
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getWillById, updateWill } from "@/lib/will-engine";
import { 
  generateDIFCWill, 
  generateLegalAnalysis, 
  generateComplianceChecklist,
  generateWillSummary,
  type AIGenerationOptions 
} from "@/lib/ai-will-generator";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

// Validation schema for generation request
const generateWillSchema = z.object({
  options: z.object({
    language: z.enum(['en', 'ar']).default('en'),
    includeTechnicalTerms: z.boolean().default(true),
    formalityLevel: z.enum(['standard', 'formal', 'very_formal']).default('formal'),
    includeExplanations: z.boolean().default(false),
  }).default({}),
  generateAnalysis: z.boolean().default(true),
  generateCompliance: z.boolean().default(true),
  generateSummary: z.boolean().default(true),
});

// POST /api/v1/wills/[willId]/generate - Generate AI will document
export async function POST(
  request: NextRequest,
  { params }: { params: { willId: string } }
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

    const { willId } = params;

    // Check permissions
    const canGenerate = await hasPermission(
      session.session.userId,
      PERMISSIONS.WILL_GENERATE,
      { userId: session.session.userId, willId }
    );

    if (!canGenerate) {
      return NextResponse.json(
        { error: "Insufficient permissions to generate will document" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { options, generateAnalysis, generateCompliance, generateSummary } = 
      generateWillSchema.parse(body);

    // Get the will data
    const will = await getWillById(willId);
    if (!will) {
      return NextResponse.json(
        { error: "Will not found" },
        { status: 404 }
      );
    }

    // Check if will has sufficient data for generation
    if (!will.personalInfo?.emiratesId || !will.beneficiaries?.length) {
      return NextResponse.json(
        { error: "Will must have testator information and at least one beneficiary" },
        { status: 400 }
      );
    }

    // Prepare context for AI generation
    const context = {
      personalInfo: will.personalInfo,
      assets: will.assets || [],
      beneficiaries: will.beneficiaries || [],
      executors: will.executors || [],
      guardians: will.guardians || [],
      specialInstructions: will.specialInstructions,
      willType: will.willType,
    };

    try {
      // Generate the will document
      const generatedWill = await generateDIFCWill(context, options as AIGenerationOptions);

      // Convert to full document text for analysis
      const documentText = formatWillDocument(generatedWill);

      // Generate additional analysis if requested
      const results: Record<string, unknown> = {
        document: generatedWill,
        fullText: documentText,
      };

      if (generateAnalysis) {
        results.analysis = await generateLegalAnalysis(
          documentText, 
          will.assets || []
        );
      }

      if (generateCompliance) {
        results.compliance = await generateComplianceChecklist(documentText);
      }

      if (generateSummary) {
        results.summary = await generateWillSummary(documentText);
      }

      // Update will with AI analysis
      const aiAnalysis = {
        riskLevel: (results.analysis as Record<string, unknown>)?.riskLevel as string || 'medium',
        keyRisks: (results.analysis as Record<string, unknown>)?.keyRisks as string[] || [],
        recommendations: (results.analysis as Record<string, unknown>)?.recommendations as string[] || [],
        crossBorderImplications: (results.analysis as Record<string, unknown>)?.crossBorderImplications as string[] || [],
        confidenceScore: (results.analysis as Record<string, unknown>)?.confidenceScore as number || 75,
        lastAnalyzed: new Date().toISOString(),
      };

      const complianceChecks = {
        difcCompliant: (results.compliance as Record<string, unknown>)?.difcCompliant as boolean || false,
        issues: ((results.compliance as Record<string, unknown>)?.checklist as Array<Record<string, unknown>>)?.filter((item: Record<string, unknown>) => item.status !== 'met') || [],
        lastChecked: new Date().toISOString(),
      };

      await updateWill(willId, {
        aiAnalysis,
        complianceChecks,
        difcCompliant: (results.compliance as Record<string, unknown>)?.difcCompliant as boolean || false,
      });

      return NextResponse.json({
        success: true,
        data: results,
        message: "Will document generated successfully",
      });

    } catch (aiError) {
      console.error("AI generation error:", aiError);
      return NextResponse.json(
        { error: "Failed to generate will document. Please try again." },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Generate will error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate will document" },
      { status: 500 }
    );
  }
}

// Helper function to format the generated will into a complete document
function formatWillDocument(generatedWill: Record<string, unknown>): string {
  return `
LAST WILL AND TESTAMENT

${generatedWill.title}

${generatedWill.preamble}

1. REVOCATION OF PREVIOUS WILLS
${generatedWill.revocation}

2. BENEFICIARY PROVISIONS
${(generatedWill.beneficiaryProvisions as Array<Record<string, unknown>>).map((provision: Record<string, unknown>, index: number) => 
  `2.${index + 1} ${provision.beneficiaryName}: ${provision.provision}`
).join('\n')}

3. EXECUTOR PROVISIONS
${generatedWill.executorProvisions}

${generatedWill.guardianProvisions ? `
4. GUARDIAN PROVISIONS
${generatedWill.guardianProvisions}
` : ''}

${generatedWill.residuaryClause ? `
5. RESIDUARY CLAUSE
${generatedWill.residuaryClause}
` : ''}

6. DIFC COMPLIANCE
Registration Requirement: ${generatedWill.difcCompliance.registrationRequirement}
Governing Law: ${generatedWill.difcCompliance.governingLaw}
Jurisdiction: ${generatedWill.difcCompliance.jurisdiction}

7. WITNESS CLAUSE
${generatedWill.witnessClause}

8. SIGNATURE
${generatedWill.signature}
`.trim();
}

// GET /api/v1/wills/[willId]/generate/status - Check generation status
export async function GET(
  request: NextRequest,
  { params }: { params: { willId: string } }
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

    const { willId } = params;

    // Check permissions
    const canView = await hasPermission(
      session.session.userId,
      PERMISSIONS.WILL_VIEW,
      { userId: session.session.userId, willId }
    );

    if (!canView) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get the will data
    const will = await getWillById(willId);
    if (!will) {
      return NextResponse.json(
        { error: "Will not found" },
        { status: 404 }
      );
    }

    // Return generation status and previous results
    return NextResponse.json({
      success: true,
      data: {
        hasAiAnalysis: !!will.aiAnalysis?.lastAnalyzed,
        hasComplianceCheck: !!will.complianceChecks?.lastChecked,
        difcCompliant: will.difcCompliant,
        lastGenerated: will.aiAnalysis?.lastAnalyzed || null,
        analysis: will.aiAnalysis,
        compliance: will.complianceChecks,
      },
    });

  } catch (error) {
    console.error("Get generation status error:", error);
    return NextResponse.json(
      { error: "Failed to get generation status" },
      { status: 500 }
    );
  }
}