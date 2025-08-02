/**
 * AI-Powered Will Generation for Mirath Legal
 * Integrates with OpenAI to generate DIFC-compliant legal documents
 */

import { openai } from "ai";
import { generateObject } from "ai";
import { z } from "zod";
import { getWillTemplate, type PersonalInfo, type Asset, type Beneficiary } from "./will-engine";

// Schema for AI-generated will content
const GeneratedWillSchema = z.object({
  title: z.string(),
  preamble: z.string(),
  revocation: z.string(),
  beneficiaryProvisions: z.array(z.object({
    beneficiaryName: z.string(),
    provision: z.string(),
    assets: z.array(z.string()).optional(),
    percentage: z.number().optional(),
  })),
  executorProvisions: z.string(),
  guardianProvisions: z.string().optional(),
  residuaryClause: z.string(),
  witnessClause: z.string(),
  signature: z.string(),
  difcCompliance: z.object({
    registrationRequirement: z.string(),
    governingLaw: z.string(),
    jurisdiction: z.string(),
  }),
});

type GeneratedWill = z.infer<typeof GeneratedWillSchema>;

export interface AIGenerationOptions {
  language: 'en' | 'ar';
  includeTechnicalTerms: boolean;
  formalityLevel: 'standard' | 'formal' | 'very_formal';
  includeExplanations: boolean;
}

export interface WillGenerationContext {
  personalInfo: PersonalInfo;
  assets: Asset[];
  beneficiaries: Beneficiary[];
  executors: Record<string, unknown>[];
  guardians?: Record<string, unknown>[];
  specialInstructions?: string;
  willType: string;
}

// Generate DIFC-compliant will using AI
export async function generateDIFCWill(
  context: WillGenerationContext,
  options: AIGenerationOptions = {
    language: 'en',
    includeTechnicalTerms: true,
    formalityLevel: 'formal',
    includeExplanations: false,
  }
): Promise<GeneratedWill> {
  
  const template = getWillTemplate(context.willType);
  
  const systemPrompt = createSystemPrompt(template, options);
  const userPrompt = createUserPrompt(context, options);

  try {
    const result = await generateObject({
      model: openai('gpt-4'),
      schema: GeneratedWillSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.3, // Lower temperature for legal accuracy
    });

    return result.object;
  } catch (error) {
    console.error('AI will generation error:', error);
    throw new Error('Failed to generate will using AI');
  }
}

// Create system prompt for AI will generation
function createSystemPrompt(template: Record<string, unknown>, options: AIGenerationOptions): string {
  const language = options.language === 'ar' ? 'Arabic' : 'English';
  const formality = options.formalityLevel === 'very_formal' ? 'very formal and traditional' : 
                   options.formalityLevel === 'formal' ? 'formal and professional' : 'clear and accessible';

  return `You are an expert UAE legal document drafter specializing in DIFC (Dubai International Financial Centre) wills and estate planning. Your task is to generate a comprehensive, legally compliant will in ${language}.

CRITICAL LEGAL REQUIREMENTS:
1. All wills must comply with DIFC Wills and Probate Registry Law No. 5 of 2012
2. Must include mandatory DIFC registration requirements
3. Must specify DIFC governing law and jurisdiction
4. Use precise legal terminology appropriate for UAE legal system
5. Include all required witness clauses per DIFC requirements
6. Ensure beneficiary provisions are clear and unambiguous
7. Include proper revocation of previous wills
8. Reference Emirates ID and UAE residency status appropriately

TEMPLATE REQUIREMENTS:
- Template: ${template.name}
- Required sections: ${template.requiredSections.join(', ')}
- Optional sections: ${template.optionalSections.join(', ')}

STYLE GUIDELINES:
- Tone: ${formality}
- Technical terms: ${options.includeTechnicalTerms ? 'Include legal terminology' : 'Use plain language where possible'}
- Structure: Follow traditional will format with numbered clauses
- Language: Generate in ${language} with appropriate legal phrasing

COMPLIANCE NOTES:
- Reference DIFC Law and jurisdiction in all provisions
- Include specific language for UAE expatriate considerations
- Address potential conflicts with home country laws
- Ensure proper asset identification and distribution clauses
- Include standard DIFC will execution requirements

Generate a complete, professional will document that would be accepted by the DIFC Wills and Probate Registry.`;
}

// Create user prompt with specific will details
function createUserPrompt(context: WillGenerationContext, options: AIGenerationOptions): string {
  return `Please generate a DIFC-compliant will with the following details:

TESTATOR INFORMATION:
- Full Name: ${context.personalInfo.emiratesId ? 'As per Emirates ID' : 'To be filled'}
- Emirates ID: ${context.personalInfo.emiratesId}
- Nationality: ${context.personalInfo.nationality}
- Visa Status: ${context.personalInfo.visaStatus}
- Marital Status: ${context.personalInfo.maritalStatus}
- Address: ${formatAddress(context.personalInfo.address)}

ASSETS TO BE DISTRIBUTED:
${context.assets.map(asset => `- ${asset.name}: ${asset.description} (${asset.currency} ${asset.estimatedValue.toLocaleString()}) in ${asset.jurisdiction}`).join('\n')}

BENEFICIARIES:
${context.beneficiaries.map(beneficiary => 
  `- ${beneficiary.fullName} (${beneficiary.relationship}): ${beneficiary.inheritancePercentage || 'Specific assets'}%`
).join('\n')}

EXECUTORS:
${context.executors.map(executor => `- ${executor.fullName} (${executor.relationship})`).join('\n')}

${context.guardians && context.guardians.length > 0 ? `
GUARDIANS FOR MINOR CHILDREN:
${context.guardians.map(guardian => `- ${guardian.fullName} (${guardian.relationship})`).join('\n')}
` : ''}

${context.specialInstructions ? `
SPECIAL INSTRUCTIONS:
${context.specialInstructions}
` : ''}

ADDITIONAL REQUIREMENTS:
- Will Type: ${context.willType}
- Language: ${options.language === 'ar' ? 'Arabic' : 'English'}
- Must be DIFC-compliant and registrable
- Include all mandatory clauses for UAE expatriate wills
- Address potential cross-border legal issues
- Include proper witness and signature requirements

Please ensure the generated will is comprehensive, legally sound, and ready for legal review and DIFC registration.`;
}

// Format address for AI prompt
function formatAddress(address: Record<string, unknown>): string {
  if (!address) return 'Address to be provided';
  return `${address.street}, ${address.city}, ${address.emirate}, ${address.country} ${address.poBox}`;
}

// Generate AI-powered legal analysis
export async function generateLegalAnalysis(willContent: string, assets: Asset[]): Promise<{
  riskLevel: 'low' | 'medium' | 'high';
  keyRisks: string[];
  recommendations: string[];
  crossBorderImplications: string[];
  confidenceScore: number;
}> {
  
  const analysisPrompt = `As a UAE legal expert specializing in estate planning, analyze this will and provide:

1. Risk assessment (low/medium/high)
2. Key legal risks or concerns
3. Recommendations for improvement
4. Cross-border legal implications
5. Confidence score (0-100) in the will's legal effectiveness

WILL CONTENT:
${willContent}

ASSETS INVOLVED:
${assets.map(asset => `${asset.name} (${asset.jurisdiction})`).join(', ')}

Focus on:
- DIFC compliance issues
- Potential conflicts with other jurisdictions
- Asset distribution clarity
- Execution risks
- Registration requirements`;

  try {
    const result = await generateObject({
      model: openai('gpt-4'),
      schema: z.object({
        riskLevel: z.enum(['low', 'medium', 'high']),
        keyRisks: z.array(z.string()),
        recommendations: z.array(z.string()),
        crossBorderImplications: z.array(z.string()),
        confidenceScore: z.number().min(0).max(100),
      }),
      prompt: analysisPrompt,
      temperature: 0.2,
    });

    return result.object;
  } catch (error) {
    console.error('AI legal analysis error:', error);
    throw new Error('Failed to generate legal analysis');
  }
}

// Generate compliance checklist
export async function generateComplianceChecklist(willContent: string): Promise<{
  difcCompliant: boolean;
  checklist: Array<{
    requirement: string;
    status: 'met' | 'not_met' | 'unclear';
    notes: string;
  }>;
  overallScore: number;
}> {
  
  const compliancePrompt = `Review this will for DIFC compliance and generate a detailed checklist:

WILL CONTENT:
${willContent}

Check against DIFC Wills and Probate Registry requirements:
1. Proper testator identification
2. Clear revocation of previous wills
3. Proper beneficiary identification
4. Asset distribution clarity
5. Executor appointment
6. Witness requirements
7. DIFC jurisdiction clauses
8. Registration requirements
9. Legal language compliance
10. Signature provisions

For each requirement, indicate if it's met, not met, or unclear, with explanatory notes.`;

  try {
    const result = await generateObject({
      model: openai('gpt-4'),
      schema: z.object({
        difcCompliant: z.boolean(),
        checklist: z.array(z.object({
          requirement: z.string(),
          status: z.enum(['met', 'not_met', 'unclear']),
          notes: z.string(),
        })),
        overallScore: z.number().min(0).max(100),
      }),
      prompt: compliancePrompt,
      temperature: 0.1,
    });

    return result.object;
  } catch (error) {
    console.error('AI compliance check error:', error);
    throw new Error('Failed to generate compliance checklist');
  }
}

// Generate will summary for client review
export async function generateWillSummary(willContent: string): Promise<{
  summary: string;
  keyPoints: string[];
  assetDistribution: string[];
  importantNotes: string[];
}> {
  
  const summaryPrompt = `Create a clear, client-friendly summary of this will in plain English:

WILL CONTENT:
${willContent}

Provide:
1. Overall summary of the will
2. Key points the client should understand
3. How assets will be distributed
4. Important notes or considerations

Use simple language that a non-lawyer can understand while maintaining accuracy.`;

  try {
    const result = await generateObject({
      model: openai('gpt-4'),
      schema: z.object({
        summary: z.string(),
        keyPoints: z.array(z.string()),
        assetDistribution: z.array(z.string()),
        importantNotes: z.array(z.string()),
      }),
      prompt: summaryPrompt,
      temperature: 0.3,
    });

    return result.object;
  } catch (error) {
    console.error('AI summary generation error:', error);
    throw new Error('Failed to generate will summary');
  }
}