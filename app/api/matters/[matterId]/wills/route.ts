/**
 * Matter-specific Will Management API
 * Handles will creation and management within law firm matters
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db/drizzle';
import { wills, matters, willDocuments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { 
  createWill, 
  getWillByMatterId,
  type CreateWillData,
  type PersonalInfo,
  type Asset,
  type Beneficiary,
  type Guardian,
  type Executor
} from '@/lib/will-engine';

// GET: Retrieve all wills for a specific matter
export async function GET(
  request: NextRequest,
  { params }: { params: { matterId: string } }
) {
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

    const { matterId } = params;

    if (!matterId) {
      return NextResponse.json(
        { error: 'Matter ID is required' },
        { status: 400 }
      );
    }

    // Verify matter exists and user has access
    const [matter] = await db
      .select()
      .from(matters)
      .where(eq(matters.id, matterId))
      .limit(1);

    if (!matter) {
      return NextResponse.json(
        { error: 'Matter not found' },
        { status: 404 }
      );
    }

    // Get all wills for this matter
    const matterWills = await db
      .select({
        will: wills,
        documents: willDocuments,
      })
      .from(wills)
      .leftJoin(willDocuments, eq(willDocuments.willId, wills.id))
      .where(eq(wills.matterId, matterId))
      .orderBy(wills.createdAt);

    // Group documents by will
    const willsWithDocuments = matterWills.reduce((acc, row) => {
      const willId = row.will.id;
      if (!acc[willId]) {
        acc[willId] = {
          ...row.will,
          documents: [],
        };
      }
      if (row.documents) {
        acc[willId].documents.push(row.documents);
      }
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      matterId,
      wills: Object.values(willsWithDocuments),
      total: Object.keys(willsWithDocuments).length,
    });

  } catch (error) {
    console.error('Error fetching matter wills:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new will for a specific matter
export async function POST(
  request: NextRequest,
  { params }: { params: { matterId: string } }
) {
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

    const { matterId } = params;
    const body = await request.json();

    if (!matterId) {
      return NextResponse.json(
        { error: 'Matter ID is required' },
        { status: 400 }
      );
    }

    // Verify matter exists and user has access
    const [matter] = await db
      .select()
      .from(matters)
      .where(eq(matters.id, matterId))
      .limit(1);

    if (!matter) {
      return NextResponse.json(
        { error: 'Matter not found' },
        { status: 404 }
      );
    }

    // Check if a will already exists for this matter
    const existingWill = await getWillByMatterId(matterId);
    if (existingWill) {
      return NextResponse.json(
        { 
          error: 'A will already exists for this matter',
          existingWillId: existingWill.id 
        },
        { status: 409 }
      );
    }

    // Extract will data from request body
    const {
      willType = 'simple',
      language = 'en',
      personalInfo,
      assets = [],
      beneficiaries = [],
      guardians = [],
      executors = [],
      specialInstructions,
    } = body;

    // Validate required fields
    if (!personalInfo?.emiratesId) {
      return NextResponse.json(
        { error: 'Personal information with Emirates ID is required' },
        { status: 400 }
      );
    }

    // Transform data to will engine format
    const createWillData: CreateWillData = {
      matterId,
      testatorId: result.session.userId,
      willType,
      language,
      personalInfo: {
        emiratesId: personalInfo.emiratesId,
        passportNumber: personalInfo.passportNumber || '',
        nationality: personalInfo.nationality || '',
        visaStatus: personalInfo.visaStatus || 'residence',
        maritalStatus: personalInfo.maritalStatus || 'single',
        address: {
          street: personalInfo.address?.street || '',
          city: personalInfo.address?.city || '',
          emirate: personalInfo.address?.emirate || '',
          poBox: personalInfo.address?.poBox || '',
          country: personalInfo.address?.country || 'UAE',
        },
        emergencyContact: {
          name: personalInfo.emergencyContact?.name || '',
          relationship: personalInfo.emergencyContact?.relationship || '',
          phone: personalInfo.emergencyContact?.phone || '',
          email: personalInfo.emergencyContact?.email || '',
        },
      },
      assets: assets.map((asset: any) => ({
        id: asset.id,
        type: asset.type,
        name: asset.name || asset.description,
        description: asset.description,
        estimatedValue: asset.value || asset.estimatedValue || 0,
        currency: asset.currency || 'AED',
        jurisdiction: asset.jurisdiction || asset.location || 'UAE',
        details: asset.details || {},
      })),
      beneficiaries: beneficiaries.map((ben: any) => ({
        id: ben.id,
        type: ben.type || 'individual',
        fullName: ben.name || ben.fullName,
        relationship: ben.relationship,
        dateOfBirth: ben.dateOfBirth,
        nationality: ben.nationality,
        contactInfo: ben.contactInfo || {},
        inheritancePercentage: ben.percentage || ben.inheritancePercentage,
        specificAssets: ben.specificAssets || [],
        conditions: ben.conditions ? [ben.conditions] : [],
        isContingent: ben.contingent || ben.isContingent || false,
      })),
      guardians: guardians.map((guard: any) => ({
        id: guard.id,
        fullName: guard.name || guard.fullName,
        relationship: guard.relationship,
        contactInfo: {
          address: guard.address,
          phone: guard.phone,
        },
        isPrimary: !guard.alternateGuardian && (guard.isPrimary !== false),
        conditions: guard.conditions,
      })),
      executors: executors.map((exec: any) => ({
        id: exec.id,
        fullName: exec.name || exec.fullName,
        relationship: exec.relationship,
        contactInfo: {
          address: exec.address,
          phone: exec.phone,
        },
        isPrimary: !exec.alternateExecutor && (exec.isPrimary !== false),
        powers: exec.powers || ['full_authority'],
      })),
      specialInstructions,
    };

    // Create the will
    const will = await createWill(createWillData);

    return NextResponse.json({
      success: true,
      will: {
        id: will.id,
        matterId: will.matterId,
        testatorId: will.testatorId,
        willType: will.willType,
        language: will.language,
        status: will.status,
        difcCompliant: will.difcCompliant,
        version: will.version,
        createdAt: will.createdAt,
        updatedAt: will.updatedAt,
      },
      message: 'Will created successfully',
    });

  } catch (error) {
    console.error('Error creating matter will:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create will',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}