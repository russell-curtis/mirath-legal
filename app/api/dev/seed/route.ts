/**
 * Development Data Seeding API
 * Creates sample data for development testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { isDevMode } from '@/lib/dev-auth';
import { db } from '@/db/drizzle';
import { user, lawFirms, lawFirmMembers, matters } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  // Only allow in development mode
  if (!isDevMode()) {
    return NextResponse.json(
      { error: 'Seeding is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    console.log('🌱 Starting development data seeding...');

    // Check if dev user exists
    const devUser = await db.select()
      .from(user)
      .where(eq(user.id, 'dev-user-001'))
      .limit(1);

    if (devUser.length === 0) {
      console.log('Creating dev user...');
      await db.insert(user).values({
        id: 'dev-user-001',
        name: 'John Developer',
        email: 'dev@mirath.legal',
        emailVerified: true,
        userType: 'lawyer',
        preferredLanguage: 'en',
      });
    }

    // Check if dev law firm exists
    const existingFirm = await db.select()
      .from(lawFirms)
      .where(eq(lawFirms.name, 'Mirath Legal Development Firm'))
      .limit(1);

    let firmId: string;

    if (existingFirm.length === 0) {
      console.log('Creating development law firm...');
      const [newFirm] = await db.insert(lawFirms).values({
        name: 'Mirath Legal Development Firm',
        licenseNumber: 'DEV-2024-001',
        email: 'firm@mirath.legal',
        phone: '+971-4-123-4567',
        establishedYear: 2024,
        address: {
          street: 'Dubai International Financial Centre',
          city: 'Dubai',
          emirate: 'Dubai',
          poBox: 'P.O. Box 123456',
          country: 'UAE',
        },
        practiceAreas: ['Estate Planning', 'Wills & Probate', 'Business Law'],
        isVerified: true,
        subscriptionTier: 'professional',
        subscriptionStatus: 'active',
        isActive: true,
      }).returning();
      
      firmId = newFirm.id;
    } else {
      firmId = existingFirm[0].id;
    }

    // Check if user is already a member of the firm
    const existingMembership = await db.select()
      .from(lawFirmMembers)
      .where(eq(lawFirmMembers.userId, 'dev-user-001'))
      .limit(1);

    if (existingMembership.length === 0) {
      console.log('Adding dev user to law firm...');
      await db.insert(lawFirmMembers).values({
        lawFirmId: firmId,
        userId: 'dev-user-001',
        role: 'admin',
        permissions: ['all'],
      });
    }

    // Create additional test users
    const testUsers = [
      {
        id: 'client-001',
        name: 'Ahmed Hassan Al-Mansouri',
        email: 'ahmed.almansouri@example.com',
        userType: 'client',
        emiratesId: '784-1985-1234567-8',
      },
      {
        id: 'client-002', 
        name: 'Sarah Johnson Smith',
        email: 'sarah.johnson@example.com',
        userType: 'client',
        emiratesId: '784-1990-9876543-2',
      },
      {
        id: 'lawyer-001',
        name: 'Dr. Khalid Rahman Al-Blooshi',
        email: 'khalid.alblooshi@mirath.legal',
        userType: 'lawyer',
      },
    ];

    for (const testUser of testUsers) {
      const existingUser = await db.select()
        .from(user)
        .where(eq(user.id, testUser.id))
        .limit(1);

      if (existingUser.length === 0) {
        console.log(`Creating test user: ${testUser.name}`);
        await db.insert(user).values({
          ...testUser,
          emailVerified: true,
          preferredLanguage: 'en',
        });

        // Add lawyers to the firm
        if (testUser.userType === 'lawyer') {
          await db.insert(lawFirmMembers).values({
            lawFirmId: firmId,
            userId: testUser.id,
            role: 'senior_lawyer',
            permissions: ['matter_create', 'matter_edit', 'will_create', 'will_edit'],
          });
        }
      }
    }

    // Create sample matters
    const sampleMatters = [
      {
        clientId: 'client-001',
        assignedLawyerId: 'dev-user-001',
        title: 'Estate Planning for Al-Mansouri Family',
        description: 'Comprehensive estate planning including complex will, business succession, and DIFC registration for high-net-worth UAE resident.',
        matterType: 'complex_will',
        status: 'review',
        priority: 'high',
        dueDate: new Date('2024-12-15'),
      },
      {
        clientId: 'client-002',
        assignedLawyerId: 'lawyer-001',
        title: 'Simple Will - Johnson Family',
        description: 'Standard will creation for expatriate family with UAE and UK assets.',
        matterType: 'simple_will',
        status: 'complete',
        priority: 'normal',
        dueDate: new Date('2024-10-25'),
      },
      {
        clientId: 'client-001',
        assignedLawyerId: 'dev-user-001',
        title: 'Business Succession Planning',
        description: 'Succession planning for multiple UAE business entities and free zone companies.',
        matterType: 'business_succession',
        status: 'draft',
        priority: 'urgent',
        dueDate: new Date('2024-11-20'),
      },
      {
        clientId: 'client-002',
        assignedLawyerId: 'lawyer-001',
        title: 'Trust Setup for Expatriate Family',
        description: 'UAE Foundation setup with offshore trust structures for international asset protection.',
        matterType: 'trust_setup',
        status: 'intake',
        priority: 'normal',
        dueDate: new Date('2024-12-01'),
      },
    ];

    let matterCount = 1;
    const createdMatters = [];

    for (const matterData of sampleMatters) {
      const matterNumber = `ML-2024-${String(matterCount).padStart(3, '0')}`;
      
      const existingMatter = await db.select()
        .from(matters)
        .where(eq(matters.matterNumber, matterNumber))
        .limit(1);

      if (existingMatter.length === 0) {
        console.log(`Creating sample matter: ${matterData.title}`);
        const [newMatter] = await db.insert(matters).values({
          lawFirmId: firmId,
          matterNumber,
          ...matterData,
        }).returning();
        
        createdMatters.push(newMatter);
      }
      
      matterCount++;
    }

    console.log('✅ Development data seeding completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Development data seeded successfully',
      created: {
        lawFirm: 'Mirath Legal Development Firm',
        users: testUsers.length + 1,
        matters: createdMatters.length,
        memberships: 2,
      },
      details: {
        firmId,
        devUserId: 'dev-user-001',
        testUserIds: testUsers.map(u => u.id),
        matterIds: createdMatters.map(m => m.id),
      }
    });

  } catch (error) {
    console.error('❌ Error seeding development data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to seed development data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Only allow in development mode
  if (!isDevMode()) {
    return NextResponse.json(
      { error: 'Seeding is only available in development mode' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    service: 'Development Data Seeding',
    version: '1.0',
    environment: 'development',
    available: true,
    description: 'Creates sample law firm, users, and matters for development testing',
    usage: 'POST /api/dev/seed to create sample data'
  });
}