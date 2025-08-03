/**
 * Appointments API
 * Handles appointment booking for legal services
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db/drizzle';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface AppointmentRequest {
  serviceId: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

const services = {
  notarization: {
    name: 'Will Notarization',
    duration: 60,
    price: 500,
    location: 'court',
  },
  legal_review: {
    name: 'Legal Review',
    duration: 90,
    price: 800,
    location: 'office',
  },
  difc_registration: {
    name: 'DIFC Registration',
    duration: 120,
    price: 1200,
    location: 'court',
  },
  consultation: {
    name: 'Estate Planning Consultation',
    duration: 60,
    price: 600,
    location: 'office',
  },
};

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

    let body: AppointmentRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { serviceId, date, time, name, email, phone, notes } = body;

    // Validate required fields
    if (!serviceId || !date || !time || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: serviceId, date, time, name, and email are required' },
        { status: 400 }
      );
    }

    // Validate service exists
    const service = services[serviceId as keyof typeof services];
    if (!service) {
      return NextResponse.json(
        { error: 'Invalid service ID' },
        { status: 400 }
      );
    }

    // Validate date format
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Check if date is in the future
    if (appointmentDate < new Date()) {
      return NextResponse.json(
        { error: 'Appointment date must be in the future' },
        { status: 400 }
      );
    }

    // Get user information
    const [userInfo] = await db
      .select()
      .from(user)
      .where(eq(user.id, result.session.userId))
      .limit(1);

    // Create appointment record
    const appointmentId = generateAppointmentId();
    const appointment = {
      id: appointmentId,
      userId: result.session.userId,
      serviceId,
      serviceName: service.name,
      appointmentDate: appointmentDate.toISOString(),
      appointmentTime: time,
      duration: service.duration,
      price: service.price,
      location: service.location,
      status: 'pending',
      clientName: name,
      clientEmail: email,
      clientPhone: phone || '',
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    // In a real application, you would store this in a database
    // For now, we'll simulate the booking process
    console.log('Appointment booked:', appointment);

    // Send confirmation email (simulated)
    await sendConfirmationEmail(appointment);

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointmentId,
        serviceId,
        serviceName: service.name,
        date: appointmentDate.toISOString(),
        time,
        duration: service.duration,
        price: service.price,
        status: 'pending',
        confirmationNumber: appointmentId,
      },
      message: 'Appointment booked successfully. A confirmation email has been sent.',
    });

  } catch (error) {
    console.error('Appointment booking error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to book appointment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

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

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const date = searchParams.get('date');

    // Return available time slots for a given date and service
    if (date) {
      const availableSlots = getAvailableTimeSlots(date, serviceId);
      return NextResponse.json({
        date,
        serviceId,
        availableSlots,
      });
    }

    // Return user's appointments
    // In a real application, this would query the database
    const appointments = []; // Would be fetched from database

    return NextResponse.json({
      appointments,
      services: Object.entries(services).map(([id, service]) => ({
        id,
        ...service,
      })),
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateAppointmentId(): string {
  return 'APT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

function getAvailableTimeSlots(date: string, serviceId?: string | null): string[] {
  // In a real application, this would check the database for existing appointments
  const allSlots = [
    '09:00', '10:00', '11:00', '12:00', 
    '14:00', '15:00', '16:00', '17:00'
  ];
  
  // Mock some unavailable slots
  const unavailableSlots = ['11:00', '16:00'];
  
  return allSlots.filter(slot => !unavailableSlots.includes(slot));
}

async function sendConfirmationEmail(appointment: any): Promise<void> {
  // In a real application, this would send an actual email
  console.log('Sending confirmation email for appointment:', appointment.id);
  console.log('Email details:', {
    to: appointment.clientEmail,
    subject: `Appointment Confirmation - ${appointment.serviceName}`,
    appointmentDetails: {
      service: appointment.serviceName,
      date: new Date(appointment.appointmentDate).toLocaleDateString(),
      time: appointment.appointmentTime,
      confirmationNumber: appointment.id,
    },
  });
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 100));
}