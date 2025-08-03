/**
 * Appointment Booking Component
 * Interactive scheduling system for legal services
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  Shield,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Building,
  AlertCircle
} from "lucide-react";
import { format, addDays, startOfWeek, isSameDay, isAfter, isBefore } from "date-fns";

interface AppointmentService {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  location: 'office' | 'client' | 'court' | 'online';
  icon: React.ComponentType<any>;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface AppointmentBookingProps {
  userId: string;
}

const services: AppointmentService[] = [
  {
    id: 'notarization',
    name: 'Will Notarization',
    description: 'Notarize your will document at UAE courts or DIFC registry',
    duration: 60,
    price: 500,
    location: 'court',
    icon: Shield,
  },
  {
    id: 'legal_review',
    name: 'Legal Review',
    description: 'Professional lawyer review of your will document',
    duration: 90,
    price: 800,
    location: 'office',
    icon: FileText,
  },
  {
    id: 'difc_registration',
    name: 'DIFC Registration',
    description: 'Complete DIFC will registration process',
    duration: 120,
    price: 1200,
    location: 'court',
    icon: Building,
  },
  {
    id: 'consultation',
    name: 'Estate Planning Consultation',
    description: 'Initial consultation for complex estate planning',
    duration: 60,
    price: 600,
    location: 'office',
    icon: User,
  },
];

const timeSlots: TimeSlot[] = [
  { time: '09:00', available: true },
  { time: '10:00', available: true },
  { time: '11:00', available: false },
  { time: '12:00', available: true },
  { time: '14:00', available: true },
  { time: '15:00', available: true },
  { time: '16:00', available: false },
  { time: '17:00', available: true },
];

export function AppointmentBooking({ userId }: AppointmentBookingProps) {
  const [selectedService, setSelectedService] = useState<AppointmentService | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [currentWeek, setCurrentWeek] = useState<Date>(startOfWeek(new Date()));
  const [step, setStep] = useState<'service' | 'datetime' | 'details' | 'confirmation'>('service');
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  // Get URL parameters to pre-select service
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    if (serviceParam) {
      const service = services.find(s => s.id === serviceParam);
      if (service) {
        setSelectedService(service);
        setStep('datetime');
      }
    }
  }, []);

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentWeek, i));
    }
    return days;
  };

  const goToPreviousWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  const handleServiceSelect = (service: AppointmentService) => {
    setSelectedService(service);
    setStep('datetime');
  };

  const handleDateTimeNext = () => {
    if (selectedDate && selectedTime) {
      setStep('details');
    }
  };

  const handleBookingSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !bookingDetails.name || !bookingDetails.email) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          date: selectedDate.toISOString(),
          time: selectedTime,
          ...bookingDetails,
        }),
      });

      if (response.ok) {
        setStep('confirmation');
      } else {
        console.error('Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
    }).format(price);
  };

  const getLocationBadge = (location: string) => {
    const locations = {
      office: { label: 'Law Office', color: 'bg-blue-100 text-blue-700' },
      court: { label: 'Court/Registry', color: 'bg-green-100 text-green-700' },
      client: { label: 'Client Location', color: 'bg-purple-100 text-purple-700' },
      online: { label: 'Online', color: 'bg-orange-100 text-orange-700' },
    };
    const loc = locations[location as keyof typeof locations] || locations.office;
    return <Badge className={loc.color}>{loc.label}</Badge>;
  };

  if (step === 'service') {
    return (
      <div className="space-y-6">
        {/* Service Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Service</CardTitle>
            <CardDescription>
              Choose the legal service you need to schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {services.map((service) => {
                const IconComponent = service.icon;
                return (
                  <Card 
                    key={service.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                    onClick={() => handleServiceSelect(service)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{service.name}</h3>
                            <span className="font-bold text-primary">{formatPrice(service.price)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{service.duration} min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              {getLocationBadge(service.location)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'datetime') {
    return (
      <div className="space-y-6">
        {/* Selected Service Summary */}
        {selectedService && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <selectedService.icon className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium">{selectedService.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedService.duration} minutes • {formatPrice(selectedService.price)}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep('service')}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Date & Time</CardTitle>
            <CardDescription>
              Choose your preferred appointment date and time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Week Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-medium">
                {format(currentWeek, 'MMMM yyyy')}
              </h3>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Date Grid */}
            <div className="grid grid-cols-7 gap-2">
              {getWeekDays().map((day) => (
                <Button
                  key={day.toISOString()}
                  variant={isSameDay(day, selectedDate) ? "default" : "outline"}
                  className={`p-3 h-auto flex flex-col ${
                    isBefore(day, new Date()) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => !isBefore(day, new Date()) && setSelectedDate(day)}
                  disabled={isBefore(day, new Date())}
                >
                  <span className="text-xs">{format(day, 'EEE')}</span>
                  <span className="text-lg font-semibold">{format(day, 'd')}</span>
                </Button>
              ))}
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <h4 className="font-medium mb-3">Available Times</h4>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={selectedTime === slot.time ? "default" : "outline"}
                      className={`${!slot.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Continue Button */}
            {selectedDate && selectedTime && (
              <div className="pt-4">
                <Button onClick={handleDateTimeNext} className="w-full">
                  Continue to Details
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'details') {
    return (
      <div className="space-y-6">
        {/* Appointment Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Service:</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Date:</span>
                <span className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Time:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Duration:</span>
                <span className="font-medium">{selectedService?.duration} minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price:</span>
                <span className="font-medium">{formatPrice(selectedService?.price || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Details Form */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
            <CardDescription>
              Please provide your contact information for the appointment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={bookingDetails.name}
                  onChange={(e) => setBookingDetails(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={bookingDetails.email}
                  onChange={(e) => setBookingDetails(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={bookingDetails.phone}
                onChange={(e) => setBookingDetails(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={bookingDetails.notes}
                onChange={(e) => setBookingDetails(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special requirements or notes for the appointment"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep('datetime')}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleBookingSubmit} 
                disabled={!bookingDetails.name || !bookingDetails.email || loading}
                className="flex-1"
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'confirmation') {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-green-800 mb-2">
              Appointment Confirmed!
            </h2>
            <p className="text-green-700 mb-6">
              Your appointment has been successfully scheduled. You will receive a confirmation email shortly.
            </p>
            
            <div className="bg-white rounded-lg p-4 text-left max-w-md mx-auto">
              <h3 className="font-semibold mb-3">Appointment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">{format(selectedDate, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{selectedService?.duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-medium">{formatPrice(selectedService?.price || 0)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-center">
              <Button variant="outline" onClick={() => window.close()}>
                Close
              </Button>
              <Button onClick={() => window.location.href = '/dashboard'}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}