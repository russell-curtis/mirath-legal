/**
 * Personal Information Step
 * Collects basic testator information for will creation
 */

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Calendar, Heart } from "lucide-react";
import { WillData } from "../will-creation-wizard";

interface PersonalInfoStepProps {
  data: WillData;
  updateData: (updates: Partial<WillData>) => void;
  errors: Record<string, string>;
}

export function PersonalInfoStep({ data, updateData, errors }: PersonalInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <p className="text-sm text-muted-foreground">
            Please provide your basic personal details as they appear on official documents.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Details</CardTitle>
            <CardDescription>
              Personal identification information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testatorName">Full Legal Name *</Label>
              <Input
                id="testatorName"
                value={data.testatorName}
                onChange={(e) => updateData({ testatorName: e.target.value })}
                placeholder="As it appears on Emirates ID"
                className={errors.testatorName ? "border-red-500" : ""}
              />
              {errors.testatorName && (
                <p className="text-sm text-red-500">{errors.testatorName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emiratesId">Emirates ID Number *</Label>
              <Input
                id="emiratesId"
                value={data.emiratesId}
                onChange={(e) => updateData({ emiratesId: e.target.value })}
                placeholder="784-XXXX-XXXXXXX-X"
                className={errors.emiratesId ? "border-red-500" : ""}
              />
              {errors.emiratesId && (
                <p className="text-sm text-red-500">{errors.emiratesId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality *</Label>
              <Input
                id="nationality"
                value={data.nationality}
                onChange={(e) => updateData({ nationality: e.target.value })}
                placeholder="e.g., Emirati, British, Indian"
                className={errors.nationality ? "border-red-500" : ""}
              />
              {errors.nationality && (
                <p className="text-sm text-red-500">{errors.nationality}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={data.dateOfBirth}
                onChange={(e) => updateData({ dateOfBirth: e.target.value })}
                className={errors.dateOfBirth ? "border-red-500" : ""}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Address & Family Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Address & Family Status</CardTitle>
            <CardDescription>
              Residence and marital information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="residenceAddress">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  UAE Residence Address *
                </div>
              </Label>
              <textarea
                id="residenceAddress"
                value={data.residenceAddress}
                onChange={(e) => updateData({ residenceAddress: e.target.value })}
                placeholder="Full address including emirate and P.O. Box"
                className={`min-h-20 w-full rounded-md border px-3 py-2 text-sm ${
                  errors.residenceAddress ? "border-red-500" : "border-input"
                }`}
              />
              {errors.residenceAddress && (
                <p className="text-sm text-red-500">{errors.residenceAddress}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Marital Status *
                </div>
              </Label>
              <Select 
                value={data.maritalStatus} 
                onValueChange={(value: 'single' | 'married' | 'divorced' | 'widowed') => 
                  updateData({ maritalStatus: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.maritalStatus === 'married' && (
              <div className="space-y-2">
                <Label htmlFor="spouseName">Spouse's Full Name *</Label>
                <Input
                  id="spouseName"
                  value={data.spouseName || ''}
                  onChange={(e) => updateData({ spouseName: e.target.value })}
                  placeholder="Spouse's full legal name"
                  className={errors.spouseName ? "border-red-500" : ""}
                />
                {errors.spouseName && (
                  <p className="text-sm text-red-500">{errors.spouseName}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Will Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Will Configuration</CardTitle>
          <CardDescription>
            Choose the type and language for your will
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Will Type</Label>
              <Select 
                value={data.willType} 
                onValueChange={(value: 'simple' | 'complex' | 'business_succession' | 'digital_assets') => 
                  updateData({ willType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple Will</SelectItem>
                  <SelectItem value="complex">Complex Will</SelectItem>
                  <SelectItem value="business_succession">Business Succession</SelectItem>
                  <SelectItem value="digital_assets">Digital Assets Will</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select 
                value={data.language} 
                onValueChange={(value: 'en' | 'ar') => updateData({ language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية (Arabic)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>DIFC Compliance</Label>
              <div className="flex items-center gap-2 pt-2">
                <Badge variant={data.difcCompliant ? "default" : "secondary"}>
                  {data.difcCompliant ? "DIFC Compliant" : "Standard UAE"}
                </Badge>
                <button
                  type="button"
                  onClick={() => updateData({ difcCompliant: !data.difcCompliant })}
                  className="text-sm text-primary hover:underline"
                >
                  Change
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Important Notice</h4>
            <p className="text-sm text-blue-700 mt-1">
              All information must match your official UAE documents. DIFC-compliant wills 
              provide enhanced protection for international assets and are recommended for 
              expatriates with complex estate planning needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}