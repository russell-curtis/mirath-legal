/**
 * Onboarding Success Banner
 * Shows a success message when firm onboarding completes
 */

"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Building2, Users, Calendar, FileText } from "lucide-react";

export function OnboardingSuccessBanner() {
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [firmId, setFirmId] = useState<string | null>(null);

  useEffect(() => {
    const onboardingStatus = searchParams.get('onboarding');
    const firmIdParam = searchParams.get('firmId');
    
    if (onboardingStatus === 'success' && firmIdParam) {
      setIsVisible(true);
      setFirmId(firmIdParam);
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Clean up URL parameters
    const url = new URL(window.location.href);
    url.searchParams.delete('onboarding');
    url.searchParams.delete('firmId');
    window.history.replaceState({}, '', url.toString());
  };

  if (!isVisible) return null;

  return (
    <Card className="mb-6 border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Firm Registration Complete!
              </CardTitle>
              <CardDescription className="text-green-700">
                Welcome to Mirath Legal - Your firm has been successfully registered.
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-green-600 hover:text-green-700 hover:bg-green-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-green-300 text-green-700 bg-green-100">
              <CheckCircle className="h-3 w-3 mr-1" />
              Firm Registered
            </Badge>
            <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
              <FileText className="h-3 w-3 mr-1" />
              Verification Pending
            </Badge>
            <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
              <Users className="h-3 w-3 mr-1" />
              Team Invitations Pending
            </Badge>
          </div>

          {/* Next steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-900">License Review</h4>
                <p className="text-xs text-gray-600">
                  Our team will verify your credentials within 1-2 business days.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-900">Team Access</h4>
                <p className="text-xs text-gray-600">
                  Team members will receive invitation emails to join the platform.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-900">Start Creating</h4>
                <p className="text-xs text-gray-600">
                  Begin creating wills and managing matters for your clients.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Training Call
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              View Setup Guide
            </Button>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Invite Team Members
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}