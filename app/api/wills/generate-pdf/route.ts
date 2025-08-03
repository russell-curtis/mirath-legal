/**
 * Direct PDF Generation API Endpoint
 * Generates PDF documents from AI generation results without requiring database storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { generateWillPDF, type WillPDFData, type PDFOptions } from '@/lib/pdf-generator';

interface GeneratePDFRequest {
  pdfData: {
    title: string;
    content: string;
    testatorName: string;
    willType: string;
    language: string;
    difcCompliant: boolean;
    jobId?: string;
    metadata?: any;
  };
  options?: {
    format?: 'A4' | 'Letter';
    download?: boolean;
    watermark?: string;
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

    let body: GeneratePDFRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { pdfData, options = {} } = body;

    // Validate required fields
    if (!pdfData.title || !pdfData.content || !pdfData.testatorName) {
      return NextResponse.json(
        { error: 'Missing required PDF data: title, content, and testatorName are required' },
        { status: 400 }
      );
    }

    // Prepare PDF data for generator
    const willPDFData: WillPDFData = {
      title: pdfData.title,
      content: pdfData.content,
      metadata: {
        testatorName: pdfData.testatorName,
        willType: pdfData.willType,
        generatedAt: new Date().toISOString(),
        language: pdfData.language || 'en',
        difcCompliant: pdfData.difcCompliant || false,
        documentId: pdfData.jobId || `temp-${Date.now()}`,
      },
    };

    // Prepare PDF generation options
    const pdfOptions: PDFOptions = {
      format: options.format || 'A4',
      margin: {
        top: '1in',
        right: '1in',
        bottom: '1.2in',
        left: '1in',
      },
      displayHeaderFooter: true,
      printBackground: true,
    };

    // Add watermark if specified
    if (options.watermark) {
      pdfOptions.headerTemplate = `
        <div style="font-size: 10px; margin: 0 auto; color: #ccc; text-align: center; width: 100%;">
          <span>${options.watermark} | DIFC-Compliant Will Document</span>
        </div>
      `;
    }

    // Generate PDF
    const pdfBuffer = await generateWillPDF(willPDFData, pdfOptions);

    // Prepare filename
    const sanitizedTestatorName = pdfData.testatorName
      .replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${sanitizedTestatorName}_${pdfData.willType}_will_${new Date().toISOString().split('T')[0]}.pdf`;

    // Set response headers
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'application/pdf');
    responseHeaders.set('Content-Length', pdfBuffer.length.toString());

    if (options.download) {
      responseHeaders.set('Content-Disposition', `attachment; filename="${filename}"`);
    } else {
      responseHeaders.set('Content-Disposition', `inline; filename="${filename}"`);
    }

    // Cache control for temporary documents
    responseHeaders.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    responseHeaders.set('Expires', '0');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Direct PDF generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for PDF generation status or information
export async function GET(request: NextRequest) {
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

    return NextResponse.json({
      service: 'Direct PDF Generation',
      version: '1.0',
      formats: ['A4', 'Letter'],
      features: [
        'DIFC-compliant formatting',
        'Professional legal document styling',
        'Watermark support',
        'Multi-language support',
        'Compliance footer information'
      ],
      limitations: [
        'Temporary document generation only',
        'No persistent storage',
        'No version control'
      ]
    });

  } catch (error) {
    console.error('PDF service info error:', error);
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 500 }
    );
  }
}