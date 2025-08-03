/**
 * License Verification Step
 * Collects legal credentials and verification documents
 */

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Shield, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { FirmOnboardingData } from "../firm-onboarding-wizard";
import { useState } from "react";

interface LicenseVerificationStepProps {
  data: FirmOnboardingData;
  updateData: (updates: Partial<FirmOnboardingData>) => void;
  errors: Record<string, string>;
}

const barAssociationOptions = [
  'UAE Bar Association',
  'Dubai Courts',
  'Abu Dhabi Judicial Department',
  'DIFC Courts',
  'ADGM Courts',
];

export function LicenseVerificationStep({ data, updateData, errors }: LicenseVerificationStepProps) {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      setUploadStatus('error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    
    try {
      // In a real application, you would upload to cloud storage
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateData({ licenseDocument: file });
      setUploadStatus('success');
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Legal Credentials & Verification</h2>
        <p className="text-muted-foreground">
          We need to verify your firm's legal standing and professional credentials.
        </p>
      </div>

      {/* License Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            License Details
          </CardTitle>
          <CardDescription>
            Professional licensing and registration information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="licenseExpiry">License Expiry Date *</Label>
              <Input
                id="licenseExpiry"
                type="date"
                value={data.licenseExpiry}
                onChange={(e) => updateData({ licenseExpiry: e.target.value })}
                className={errors.licenseExpiry ? 'border-red-500' : ''}
              />
              {errors.licenseExpiry && (
                <p className="text-sm text-red-600">{errors.licenseExpiry}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="barAssociation">Bar Association *</Label>
              <select
                id="barAssociation"
                value={data.barAssociation}
                onChange={(e) => updateData({ barAssociation: e.target.value })}
                className={`w-full px-3 py-2 border border-input bg-background rounded-md text-sm ${
                  errors.barAssociation ? 'border-red-500' : ''
                }`}
              >
                <option value="">Select Bar Association</option>
                {barAssociationOptions.map(association => (
                  <option key={association} value={association}>{association}</option>
                ))}
              </select>
              {errors.barAssociation && (
                <p className="text-sm text-red-600">{errors.barAssociation}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="insuranceNumber">Professional Indemnity Insurance Number *</Label>
            <Input
              id="insuranceNumber"
              value={data.insuranceNumber}
              onChange={(e) => updateData({ insuranceNumber: e.target.value })}
              placeholder="Enter insurance policy number"
              className={errors.insuranceNumber ? 'border-red-500' : ''}
            />
            {errors.insuranceNumber && (
              <p className="text-sm text-red-600">{errors.insuranceNumber}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Required for professional liability coverage
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Document Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            License Document Upload
          </CardTitle>
          <CardDescription>
            Upload a copy of your current practicing license
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {!data.licenseDocument ? (
              <div className="space-y-4">
                <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Upload license document
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, PNG, JPG up to 5MB
                  </p>
                </div>
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" disabled={uploadStatus === 'uploading'}>
                    {uploadStatus === 'uploading' ? 'Uploading...' : 'Choose File'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    License document uploaded
                  </p>
                  <p className="text-xs text-green-600">
                    {data.licenseDocument.name}
                  </p>
                </div>
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" size="sm">
                    Replace File
                  </Button>
                </div>
              </div>
            )}
          </div>

          {uploadStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Failed to upload file. Please try again.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Process
          </CardTitle>
          <CardDescription>
            What happens after you submit your information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">Document Review</h4>
                <p className="text-sm text-muted-foreground">
                  Our team will review your license and credentials within 1-2 business days.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">Background Verification</h4>
                <p className="text-sm text-muted-foreground">
                  We'll verify your standing with the relevant bar association.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">Account Activation</h4>
                <p className="text-sm text-muted-foreground">
                  Once verified, your firm account will be fully activated with all features.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Important Note</h4>
                <p className="text-sm text-blue-800">
                  You can continue setting up your firm profile while verification is in progress. 
                  Some features may be limited until verification is complete.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}