/**
 * Firm Registration Form
 * Simplified standalone registration (no subscription, pre-verification)
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Upload, 
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface FirmRegistrationData {
  // Contact Information
  firmName: string;
  email: string;
  phone: string;
  contactPersonName: string;
  
  // Address
  address: {
    street: string;
    city: string;
    emirate: string;
    poBox: string;
    country: string;
  };
  
  // Legal Information
  licenseNumber: string;
  barAssociation: string;
  establishedYear: string;
  practiceAreas: string[];
  
  // License Document
  licenseDocument?: File;
}

const emirateOptions = [
  'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'
];

const practiceAreaOptions = [
  'Estate Planning', 'Family Law', 'Corporate Law', 'Real Estate Law', 
  'Immigration Law', 'Commercial Litigation', 'Employment Law', 
  'Intellectual Property', 'Tax Law', 'Banking & Finance'
];

const barAssociationOptions = [
  'UAE Bar Association', 'Dubai Courts', 'Abu Dhabi Judicial Department', 
  'DIFC Courts', 'ADGM Courts'
];

export function FirmRegistrationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<FirmRegistrationData>({
    firmName: '',
    email: '',
    phone: '',
    contactPersonName: '',
    address: {
      street: '',
      city: '',
      emirate: '',
      poBox: '',
      country: 'United Arab Emirates',
    },
    licenseNumber: '',
    barAssociation: '',
    establishedYear: '',
    practiceAreas: [],
  });

  const updateFormData = (updates: Partial<FirmRegistrationData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear related errors
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(updates).forEach(key => delete newErrors[key]);
      return newErrors;
    });
  };

  const handlePracticeAreaToggle = (area: string) => {
    const currentAreas = formData.practiceAreas;
    const updatedAreas = currentAreas.includes(area)
      ? currentAreas.filter(a => a !== area)
      : [...currentAreas, area];
    
    updateFormData({ practiceAreas: updatedAreas });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateFormData({ licenseDocument: file });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.firmName.trim()) newErrors.firmName = 'Firm name is required';
      if (!formData.contactPersonName.trim()) newErrors.contactPersonName = 'Contact person name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    }
    
    if (step === 2) {
      if (!formData.address.street.trim()) newErrors.street = 'Street address is required';
      if (!formData.address.city.trim()) newErrors.city = 'City is required';
      if (!formData.address.emirate.trim()) newErrors.emirate = 'Emirate is required';
    }
    
    if (step === 3) {
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
      if (!formData.barAssociation.trim()) newErrors.barAssociation = 'Bar association is required';
      if (!formData.establishedYear.trim()) newErrors.establishedYear = 'Established year is required';
      if (formData.practiceAreas.length === 0) newErrors.practiceAreas = 'At least one practice area is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setIsSubmitting(true);
    try {
      // Step 1: Create user account with Google OAuth
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/register/firm/complete",
      });
      
      // Note: The actual firm registration will happen in the callback
      // We'll store the form data temporarily
      sessionStorage.setItem('firmRegistrationData', JSON.stringify(formData));
      
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'Failed to start registration process. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Firm Information</h3>
        <p className="text-gray-600">Tell us about your law firm</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="firmName">Law Firm Name *</Label>
          <Input
            id="firmName"
            value={formData.firmName}
            onChange={(e) => updateFormData({ firmName: e.target.value })}
            placeholder="Enter your firm's legal name"
            className={errors.firmName ? 'border-red-500' : ''}
          />
          {errors.firmName && <p className="text-sm text-red-600">{errors.firmName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPersonName">Primary Contact Name *</Label>
          <Input
            id="contactPersonName"
            value={formData.contactPersonName}
            onChange={(e) => updateFormData({ contactPersonName: e.target.value })}
            placeholder="Full name of primary contact"
            className={errors.contactPersonName ? 'border-red-500' : ''}
          />
          {errors.contactPersonName && <p className="text-sm text-red-600">{errors.contactPersonName}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Primary Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                placeholder="contact@lawfirm.com"
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                placeholder="+971 4 XXX XXXX"
                className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Office Address</h3>
        <p className="text-gray-600">Your firm's primary business address</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="street">Street Address *</Label>
          <Input
            id="street"
            value={formData.address.street}
            onChange={(e) => updateFormData({ 
              address: { ...formData.address, street: e.target.value } 
            })}
            placeholder="Building name, floor, office number"
            className={errors.street ? 'border-red-500' : ''}
          />
          {errors.street && <p className="text-sm text-red-600">{errors.street}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.address.city}
              onChange={(e) => updateFormData({ 
                address: { ...formData.address, city: e.target.value } 
              })}
              placeholder="Dubai"
              className={errors.city ? 'border-red-500' : ''}
            />
            {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emirate">Emirate *</Label>
            <select
              id="emirate"
              value={formData.address.emirate}
              onChange={(e) => updateFormData({ 
                address: { ...formData.address, emirate: e.target.value } 
              })}
              className={`w-full px-3 py-2 border border-input bg-background rounded-md text-sm ${
                errors.emirate ? 'border-red-500' : ''
              }`}
            >
              <option value="">Select Emirate</option>
              {emirateOptions.map(emirate => (
                <option key={emirate} value={emirate}>{emirate}</option>
              ))}
            </select>
            {errors.emirate && <p className="text-sm text-red-600">{errors.emirate}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="poBox">P.O. Box (Optional)</Label>
          <Input
            id="poBox"
            value={formData.address.poBox}
            onChange={(e) => updateFormData({ 
              address: { ...formData.address, poBox: e.target.value } 
            })}
            placeholder="P.O. Box 12345"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Legal Credentials</h3>
        <p className="text-gray-600">Professional licensing information</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="licenseNumber">License Number *</Label>
            <Input
              id="licenseNumber"
              value={formData.licenseNumber}
              onChange={(e) => updateFormData({ licenseNumber: e.target.value })}
              placeholder="UAE Bar License Number"
              className={errors.licenseNumber ? 'border-red-500' : ''}
            />
            {errors.licenseNumber && <p className="text-sm text-red-600">{errors.licenseNumber}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="establishedYear">Established Year *</Label>
            <Input
              id="establishedYear"
              value={formData.establishedYear}
              onChange={(e) => updateFormData({ establishedYear: e.target.value })}
              placeholder="2020"
              className={errors.establishedYear ? 'border-red-500' : ''}
            />
            {errors.establishedYear && <p className="text-sm text-red-600">{errors.establishedYear}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="barAssociation">Bar Association *</Label>
          <select
            id="barAssociation"
            value={formData.barAssociation}
            onChange={(e) => updateFormData({ barAssociation: e.target.value })}
            className={`w-full px-3 py-2 border border-input bg-background rounded-md text-sm ${
              errors.barAssociation ? 'border-red-500' : ''
            }`}
          >
            <option value="">Select Bar Association</option>
            {barAssociationOptions.map(association => (
              <option key={association} value={association}>{association}</option>
            ))}
          </select>
          {errors.barAssociation && <p className="text-sm text-red-600">{errors.barAssociation}</p>}
        </div>

        <div className="space-y-2">
          <Label>Practice Areas *</Label>
          <div className="grid grid-cols-2 gap-2">
            {practiceAreaOptions.map(area => {
              const isSelected = formData.practiceAreas.includes(area);
              return (
                <div
                  key={area}
                  onClick={() => handlePracticeAreaToggle(area)}
                  className={`cursor-pointer p-2 rounded border text-sm transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{area}</span>
                    {isSelected && <CheckCircle className="h-3 w-3" />}
                  </div>
                </div>
              );
            })}
          </div>
          {errors.practiceAreas && <p className="text-sm text-red-600">{errors.practiceAreas}</p>}
          <p className="text-xs text-gray-500">Selected: {formData.practiceAreas.length} areas</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseDocument">License Document (Optional)</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            {!formData.licenseDocument ? (
              <div className="space-y-2">
                <Upload className="h-6 w-6 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">Upload your practicing license</p>
                <p className="text-xs text-gray-500">PDF, PNG, JPG up to 5MB</p>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" size="sm">Choose File</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto" />
                <p className="text-sm text-green-700">{formData.licenseDocument.name}</p>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" size="sm">Replace File</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const totalSteps = 3;
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Step {currentStep} of {totalSteps}</CardTitle>
          <Badge variant="outline">{Math.round(progressPercentage)}% Complete</Badge>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          {currentStep === totalSteps ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-32"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Registration
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
            </Button>
          )}
        </div>

        {/* Errors */}
        {Object.keys(errors).length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Please fix the following:</h4>
                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}