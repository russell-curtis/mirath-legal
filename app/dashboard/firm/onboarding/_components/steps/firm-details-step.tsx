/**
 * Firm Details Step
 * Collects basic information about the law firm
 */

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Phone, Mail, Calendar } from "lucide-react";
import { FirmOnboardingData } from "../firm-onboarding-wizard";

interface FirmDetailsStepProps {
  data: FirmOnboardingData;
  updateData: (updates: Partial<FirmOnboardingData>) => void;
  errors: Record<string, string>;
}

const practiceAreaOptions = [
  'Estate Planning',
  'Family Law',
  'Corporate Law',
  'Real Estate Law',
  'Immigration Law',
  'Commercial Litigation',
  'Employment Law',
  'Intellectual Property',
  'Tax Law',
  'Banking & Finance',
  'International Law',
  'Criminal Law',
];

const emirateOptions = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain',
];

export function FirmDetailsStep({ data, updateData, errors }: FirmDetailsStepProps) {
  const handlePracticeAreaToggle = (area: string) => {
    const currentAreas = data.practiceAreas || [];
    const updatedAreas = currentAreas.includes(area)
      ? currentAreas.filter(a => a !== area)
      : [...currentAreas, area];
    
    updateData({ practiceAreas: updatedAreas });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Tell us about your law firm</h2>
        <p className="text-muted-foreground">
          We'll use this information to set up your firm's profile and customize your experience.
        </p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Essential details about your law firm
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firmName">Law Firm Name *</Label>
              <Input
                id="firmName"
                value={data.firmName}
                onChange={(e) => updateData({ firmName: e.target.value })}
                placeholder="Enter your firm's legal name"
                className={errors.firmName ? 'border-red-500' : ''}
              />
              {errors.firmName && (
                <p className="text-sm text-red-600">{errors.firmName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number *</Label>
              <Input
                id="licenseNumber"
                value={data.licenseNumber}
                onChange={(e) => updateData({ licenseNumber: e.target.value })}
                placeholder="UAE Bar Association License Number"
                className={errors.licenseNumber ? 'border-red-500' : ''}
              />
              {errors.licenseNumber && (
                <p className="text-sm text-red-600">{errors.licenseNumber}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Primary Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => updateData({ email: e.target.value })}
                  placeholder="contact@lawfirm.com"
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={data.phone}
                  onChange={(e) => updateData({ phone: e.target.value })}
                  placeholder="+971 4 XXX XXXX"
                  className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="establishedYear">Established Year *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="establishedYear"
                value={data.establishedYear}
                onChange={(e) => updateData({ establishedYear: e.target.value })}
                placeholder="2020"
                className={`pl-10 ${errors.establishedYear ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.establishedYear && (
              <p className="text-sm text-red-600">{errors.establishedYear}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Office Address
          </CardTitle>
          <CardDescription>
            Your firm's primary business address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              value={data.address.street}
              onChange={(e) => updateData({ 
                address: { ...data.address, street: e.target.value } 
              })}
              placeholder="Building name, floor, office number"
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && (
              <p className="text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={data.address.city}
                onChange={(e) => updateData({ 
                  address: { ...data.address, city: e.target.value } 
                })}
                placeholder="Dubai"
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emirate">Emirate *</Label>
              <select
                id="emirate"
                value={data.address.emirate}
                onChange={(e) => updateData({ 
                  address: { ...data.address, emirate: e.target.value } 
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
              {errors.emirate && (
                <p className="text-sm text-red-600">{errors.emirate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="poBox">P.O. Box</Label>
              <Input
                id="poBox"
                value={data.address.poBox}
                onChange={(e) => updateData({ 
                  address: { ...data.address, poBox: e.target.value } 
                })}
                placeholder="P.O. Box 12345"
              />
            </div>
          </div>

          <Input
            value={data.address.country}
            onChange={(e) => updateData({ 
              address: { ...data.address, country: e.target.value } 
            })}
            placeholder="United Arab Emirates"
            disabled
            className="bg-gray-50"
          />
        </CardContent>
      </Card>

      {/* Practice Areas */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Areas *</CardTitle>
          <CardDescription>
            Select the areas of law your firm specializes in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {practiceAreaOptions.map(area => {
              const isSelected = data.practiceAreas?.includes(area) || false;
              return (
                <div
                  key={area}
                  onClick={() => handlePracticeAreaToggle(area)}
                  className={`cursor-pointer p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{area}</span>
                    {isSelected && (
                      <Badge variant="default" className="h-5 w-5 rounded-full p-0">
                        ✓
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {errors.practiceAreas && (
            <p className="text-sm text-red-600 mt-2">{errors.practiceAreas}</p>
          )}
          
          <p className="text-xs text-muted-foreground mt-3">
            Selected: {data.practiceAreas?.length || 0} practice areas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}