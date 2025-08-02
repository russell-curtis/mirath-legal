/**
 * Will PDF Generation API Endpoint
 * Generates PDF documents from will data
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { generateWillPDF, type WillPDFData, type PDFOptions } from '@/lib/pdf-generator';
import { getWillById } from '@/lib/will-engine';
import { documentStorage } from '@/lib/document-storage';
import { db } from '@/db/drizzle';
import { willDocuments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { willId: string } }
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

    const { willId } = params;
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const format = searchParams.get('format') as 'A4' | 'Letter' || 'A4';
    const download = searchParams.get('download') === 'true';
    const documentType = searchParams.get('type') || 'generated_will';

    if (!willId) {
      return NextResponse.json(
        { error: 'Will ID is required' },
        { status: 400 }
      );
    }

    // Get will data
    const will = await getWillById(willId);
    if (!will) {
      return NextResponse.json(
        { error: 'Will not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this will
    if (will.testatorId !== result.session.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get the generated document
    const [document] = await db
      .select()
      .from(willDocuments)
      .where(
        and(
          eq(willDocuments.willId, willId),
          eq(willDocuments.documentType, documentType),
          eq(willDocuments.status, 'generated')
        )
      )
      .orderBy(willDocuments.version)
      .limit(1);

    if (!document) {
      return NextResponse.json(
        { error: 'Generated will document not found' },
        { status: 404 }
      );
    }

    // Parse the document content
    let willContent;
    try {
      willContent = typeof document.content === 'string' 
        ? JSON.parse(document.content) 
        : document.content;
    } catch (error) {
      console.error('Error parsing will content:', error);
      return NextResponse.json(
        { error: 'Invalid document content' },
        { status: 500 }
      );
    }

    // Prepare PDF data
    const pdfData: WillPDFData = {
      title: document.title,
      content: willContent.templateContent || willContent.preamble || 'Content not available',
      metadata: {
        testatorName: will.personalInfo?.name || 'Unknown',
        willType: will.willType,
        generatedAt: document.createdAt?.toISOString(),
        language: will.language || 'en',
        difcCompliant: will.difcCompliant || false,
        documentId: document.id,
      },
    };

    // PDF generation options
    const pdfOptions: PDFOptions = {
      format,
      margin: {
        top: '1in',
        right: '1in',
        bottom: '1.2in',
        left: '1in',
      },
      displayHeaderFooter: true,
      printBackground: true,
    };

    // Generate PDF
    const pdfBuffer = await generateWillPDF(pdfData, pdfOptions);

    // Prepare filename
    const sanitizedTestatorName = (pdfData.metadata.testatorName || 'Will')
      .replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${sanitizedTestatorName}_${will.willType}_will_${new Date().toISOString().split('T')[0]}.pdf`;

    // Store PDF in document storage if it doesn't exist
    let shouldStoreDocument = true;
    const existingPdfDoc = await db
      .select()
      .from(willDocuments)
      .where(
        and(
          eq(willDocuments.willId, willId),
          eq(willDocuments.documentType, 'will_pdf')
        )
      )
      .limit(1);

    if (existingPdfDoc.length === 0) {
      try {
        // Store the PDF in document storage
        const storageResult = await documentStorage.uploadDocument(pdfBuffer, {
          filename,
          contentType: 'application/pdf',
          documentType: 'will_pdf',
          uploadedBy: result.session.userId,
          willId,
          tags: {
            willType: will.willType,
            language: will.language || 'en',
            difcCompliant: will.difcCompliant?.toString() || 'false',
          },
        });

        if (storageResult.success) {
          // Create database record for the PDF
          await db.insert(willDocuments).values({
            willId,
            documentType: 'will_pdf',
            title: `${pdfData.metadata.testatorName} - ${will.willType} Will (PDF)`,
            content: JSON.stringify({
              storageId: storageResult.documentId,
              filename,
              generatedAt: new Date().toISOString(),
            }),
            metadata: {
              contentType: 'application/pdf',
              size: pdfBuffer.length,
              storageProvider: documentStorage.getStorageInfo().provider,
              ...storageResult.metadata,
            },
            version: 1,
            status: 'generated',
          });
        }
      } catch (storageError) {
        console.error('Failed to store PDF in document storage:', storageError);
        // Continue with direct PDF response even if storage fails
      }
    }

    // Set response headers
    const headers_obj = new Headers();
    headers_obj.set('Content-Type', 'application/pdf');
    headers_obj.set('Content-Length', pdfBuffer.length.toString());

    if (download) {
      headers_obj.set('Content-Disposition', `attachment; filename="${filename}"`);
    } else {
      headers_obj.set('Content-Disposition', `inline; filename="${filename}"`);
    }

    // Cache control
    headers_obj.set('Cache-Control', 'private, max-age=3600');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: headers_obj,
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST endpoint for custom PDF generation with options
export async function POST(
  request: NextRequest,
  { params }: { params: { willId: string } }
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

    const { willId } = params;
    const body = await request.json();
    const { 
      options = {}, 
      customContent, 
      includeMetadata = true,
      watermark 
    } = body;

    if (!willId) {
      return NextResponse.json(
        { error: 'Will ID is required' },
        { status: 400 }
      );
    }

    // Get will data
    const will = await getWillById(willId);
    if (!will) {
      return NextResponse.json(
        { error: 'Will not found' },
        { status: 404 }
      );
    }

    // Check access
    if (will.testatorId !== result.session.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Use custom content if provided, otherwise get from database
    let content = customContent;
    if (!content) {
      const [document] = await db
        .select()
        .from(willDocuments)
        .where(
          and(
            eq(willDocuments.willId, willId),
            eq(willDocuments.documentType, 'generated_will'),
            eq(willDocuments.status, 'generated')
          )
        )
        .orderBy(willDocuments.version)
        .limit(1);

      if (!document) {
        return NextResponse.json(
          { error: 'Generated will document not found' },
          { status: 404 }
        );
      }

      const willContent = typeof document.content === 'string' 
        ? JSON.parse(document.content) 
        : document.content;
      content = willContent.templateContent || willContent.preamble || 'Content not available';
    }

    // Prepare PDF data
    const pdfData: WillPDFData = {
      title: `Will of ${will.personalInfo?.name || 'Unknown'}`,
      content,
      metadata: includeMetadata ? {
        testatorName: will.personalInfo?.name || 'Unknown',
        willType: will.willType,
        generatedAt: new Date().toISOString(),
        language: will.language || 'en',
        difcCompliant: will.difcCompliant || false,
        documentId: willId,
      } : {},
    };

    // Apply watermark if specified
    if (watermark) {
      options.headerTemplate = `
        <div style="font-size: 10px; margin: 0 auto; color: #ccc; text-align: center; width: 100%;">
          <span>${watermark} | DIFC-Compliant Will Document</span>
        </div>
      `;
    }

    // Generate PDF with custom options
    const pdfBuffer = await generateWillPDF(pdfData, options);

    // Return PDF as base64 for API consumption
    return NextResponse.json({
      success: true,
      pdf: pdfBuffer.toString('base64'),
      filename: `will_${willId}_${Date.now()}.pdf`,
      size: pdfBuffer.length,
      metadata: pdfData.metadata,
    });

  } catch (error) {
    console.error('Custom PDF generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate custom PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}