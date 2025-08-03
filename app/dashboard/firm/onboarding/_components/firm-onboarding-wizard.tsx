/**
 * Firm Onboarding Wizard
 * Multi-step registration process for law firms
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  FileText, 
  Users, 
  Palette, 
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Step components
import { FirmDetailsStep } from "./steps/firm-details-step";
import { LicenseVerificationStep } from "./steps/license-verification-step";
import { TeamSetupStep } from "./steps/team-setup-step";
import { BrandingSetupStep } from "./steps/branding-setup-step";
import { ReviewStep } from "./steps/review-step";

export interface FirmOnboardingData {
  // Firm Details
  firmName: string;
  licenseNumber: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    emirate: string;
    poBox: string;
    country: string;
  };
  establishedYear: string;
  practiceAreas: string[];
  
  // License & Legal
  licenseDocument?: File;
  licenseExpiry: string;
  barAssociation: string;
  insuranceNumber: string;
  
  // Team Setup
  teamMembers: Array<{
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'senior_lawyer' | 'lawyer' | 'support';
    barNumber?: string;
  }>;
  
  // Branding
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  customDomain?: string;
  
  // Subscription
  subscriptionTier: 'starter' | 'professional' | 'enterprise';
}

const steps = [
  {
    id: 'details',
    title: 'Firm Details',
    description: 'Basic information about your law firm',
    icon: Building2,
  },
  {
    id: 'license',
    title: 'License Verification',
    description: 'Legal credentials and documentation',
    icon: FileText,
  },
  {
    id: 'team',
    title: 'Team Setup',
    description: 'Add your team members and roles',
    icon: Users,
  },
  {
    id: 'branding',
    title: 'Branding & Customization',
    description: 'Customize your firm\'s appearance',
    icon: Palette,
  },
  {
    id: 'review',
    title: 'Review & Complete',
    description: 'Review and finalize your setup',
    icon: CheckCircle,
  },
];

interface FirmOnboardingWizardProps {
  userId: string;
}

export function FirmOnboardingWizard({ userId }: FirmOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<FirmOnboardingData>({
    firmName: '',
    licenseNumber: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      emirate: '',
      poBox: '',
      country: 'UAE',
    },
    establishedYear: '',
    practiceAreas: [],
    licenseExpiry: '',
    barAssociation: '',
    insuranceNumber: '',
    teamMembers: [{
      id: '1',
      name: '',
      email: '',
      role: 'admin',
    }],
    primaryColor: '#1D4ED8',
    secondaryColor: '#64748B',
    subscriptionTier: 'professional',
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateOnboardingData = (updates: Partial<FirmOnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
    
    // Clear validation errors for updated fields
    const newErrors = { ...validationErrors };
    Object.keys(updates).forEach(key => {
      delete newErrors[key];
    });
    setValidationErrors(newErrors);
  };

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};
    
    switch (currentStep) {
      case 0: // Firm Details
        if (!onboardingData.firmName.trim()) errors.firmName = 'Firm name is required';
        if (!onboardingData.licenseNumber.trim()) errors.licenseNumber = 'License number is required';
        if (!onboardingData.email.trim()) errors.email = 'Email is required';
        if (!onboardingData.phone.trim()) errors.phone = 'Phone number is required';
        if (!onboardingData.address.street.trim()) errors.address = 'Address is required';
        if (!onboardingData.address.city.trim()) errors.city = 'City is required';
        if (!onboardingData.address.emirate.trim()) errors.emirate = 'Emirate is required';
        if (!onboardingData.establishedYear.trim()) errors.establishedYear = 'Established year is required';
        if (onboardingData.practiceAreas.length === 0) errors.practiceAreas = 'At least one practice area is required';
        break;
        
      case 1: // License Verification
        if (!onboardingData.licenseExpiry) errors.licenseExpiry = 'License expiry date is required';
        if (!onboardingData.barAssociation.trim()) errors.barAssociation = 'Bar association is required';
        if (!onboardingData.insuranceNumber.trim()) errors.insuranceNumber = 'Insurance number is required';
        break;
        
      case 2: // Team Setup
        const adminMembers = onboardingData.teamMembers.filter(member => member.role === 'admin');
        if (adminMembers.length === 0) {
          errors.teamMembers = 'At least one admin member is required';
        }
        onboardingData.teamMembers.forEach((member, index) => {
          if (!member.name.trim()) errors[`member_${index}_name`] = 'Member name is required';
          if (!member.email.trim()) errors[`member_${index}_email`] = 'Member email is required';
        });
        break;
        
      case 3: // Branding
        // Branding is optional, minimal validation
        if (onboardingData.primaryColor && !/^#[0-9A-F]{6}$/i.test(onboardingData.primaryColor)) {
          errors.primaryColor = 'Invalid color format';
        }
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/firms/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          firmData: onboardingData,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Redirect to main dashboard with success message
        window.location.href = `/dashboard?onboarding=success&firmId=${result.firm.id}`;
      } else {
        const errorData = await response.json();
        setValidationErrors({ submit: errorData.error || 'Failed to complete onboarding' });
      }
    } catch (error) {
      console.error('Onboarding submission error:', error);
      setValidationErrors({ submit: 'An error occurred during submission' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <FirmDetailsStep 
            data={onboardingData} 
            updateData={updateOnboardingData}
            errors={validationErrors}
          />
        );
      case 1:
        return (
          <LicenseVerificationStep 
            data={onboardingData} 
            updateData={updateOnboardingData}
            errors={validationErrors}
          />
        );
      case 2:
        return (
          <TeamSetupStep 
            data={onboardingData} 
            updateData={updateOnboardingData}
            errors={validationErrors}
          />
        );
      case 3:
        return (
          <BrandingSetupStep 
            data={onboardingData} 
            updateData={updateOnboardingData}
            errors={validationErrors}
          />
        );
      case 4:
        return (
          <ReviewStep 
            data={onboardingData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const IconComponent = steps[currentStep].icon;
                  return <IconComponent className="h-5 w-5" />;
                })()}
                {steps[currentStep].title}
              </CardTitle>
              <CardDescription>
                {steps[currentStep].description}
              </CardDescription>
            </div>
            <Badge variant="outline">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Step Navigation */}
      <div className="grid grid-cols-5 gap-2">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={step.id}
              className={`relative flex flex-col items-center p-3 rounded-lg border transition-colors ${
                isCurrent
                  ? 'border-primary bg-primary/5'
                  : isCompleted
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                isCurrent
                  ? 'border-primary bg-primary text-white'
                  : isCompleted
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-gray-300 bg-white text-gray-500'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <StepIcon className="h-4 w-4" />
                )}
              </div>
              <span className={`text-xs font-medium mt-1 text-center ${
                isCurrent
                  ? 'text-primary'
                  : isCompleted
                  ? 'text-green-700'
                  : 'text-gray-500'
              }`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(validationErrors).length > 0}
              className="min-w-32"
            >
              {isSubmitting ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Setup
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Validation Errors */}
      {Object.keys(validationErrors).length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Please fix the following errors:</h4>
                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                  {Object.values(validationErrors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}