/**
 * Firm Registration Completion Page
 * Handles OAuth callback and completes firm registration
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, AlertCircle, Scale, Building2 } from "lucide-react";

export default function FirmRegistrationCompletePage() {
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string>('');
  const [firmData, setFirmData] = useState<any>(null);

  useEffect(() => {
    const completeFirmRegistration = async () => {
      try {
        // Get stored registration data from session storage
        const storedData = sessionStorage.getItem('firmRegistrationData');
        if (!storedData) {
          setError('Registration data not found. Please start the registration process again.');
          setStatus('error');
          return;
        }

        const registrationData = JSON.parse(storedData);
        setFirmData(registrationData);

        // Submit firm registration
        const response = await fetch('/api/firms/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationData),
        });

        if (response.ok) {
          const result = await response.json();
          
          // Clear stored data
          sessionStorage.removeItem('firmRegistrationData');
          
          setStatus('success');
          
          // Redirect to verification pending page after 3 seconds
          setTimeout(() => {
            router.push('/firm/verification-pending');
          }, 3000);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to complete registration');
          setStatus('error');
        }
      } catch (error) {
        console.error('Registration completion error:', error);
        setError('An unexpected error occurred during registration');
        setStatus('error');
      }
    };

    completeFirmRegistration();
  }, [router]);

  const handleRetry = () => {
    router.push('/register/firm');
  };

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                  <Scale className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-bold text-gray-900">Mirath Legal</h1>
                  <p className="text-xs text-gray-600">DIFC Estate Planning Platform</p>
                </div>
              </div>
            </div>
            <CardTitle>Completing Registration</CardTitle>
            <CardDescription>
              Please wait while we process your firm registration...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-sm text-gray-600">
              Setting up your firm profile and submitting for verification
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-bold text-gray-900">Mirath Legal</h1>
                  <p className="text-xs text-gray-600">DIFC Estate Planning Platform</p>
                </div>
              </div>
            </div>
            <CardTitle className="text-green-800">Registration Complete!</CardTitle>
            <CardDescription>
              {firmData?.firmName} has been successfully registered
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">What happens next?</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Your application is now under review</li>
                <li>• We'll verify your credentials within 1-2 business days</li>
                <li>• You'll receive email updates on your status</li>
                <li>• Demo access is available while we review</li>
              </ul>
            </div>
            
            <p className="text-sm text-gray-600 text-center">
              Redirecting to verification status page...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-bold text-gray-900">Mirath Legal</h1>
                  <p className="text-xs text-gray-600">DIFC Estate Planning Platform</p>
                </div>
              </div>
            </div>
            <CardTitle className="text-red-800">Registration Error</CardTitle>
            <CardDescription>
              There was an issue completing your registration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button onClick={handleRetry} className="w-full">
                <Building2 className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push('/')} className="w-full">
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}