/**
 * Verification Pending View
 * Dashboard for firms awaiting verification with limited demo access
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Scale, 
  FileText, 
  Users, 
  BookOpen,
  Mail,
  Phone,
  Calendar,
  Shield,
  Building2
} from "lucide-react";

interface VerificationPendingViewProps {
  userId: string;
}

export function VerificationPendingView({ userId }: VerificationPendingViewProps) {
  const [firmData, setFirmData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch firm data from API
    // For now, we'll simulate loading
    setTimeout(() => {
      setFirmData({
        name: "Sample Law Firm",
        licenseNumber: "UAE-LAW-2024-001",
        submittedAt: new Date().toISOString(),
        estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setLoading(false);
    }, 1000);
  }, [userId]);

  const verificationSteps = [
    {
      id: 1,
      title: "Application Submitted",
      description: "Your firm registration has been received",
      status: "completed" as const,
      icon: CheckCircle,
    },
    {
      id: 2,
      title: "Document Review",
      description: "Our team is reviewing your credentials",
      status: "in_progress" as const,
      icon: FileText,
    },
    {
      id: 3,
      title: "License Verification",
      description: "Verifying with UAE Bar Association",
      status: "pending" as const,
      icon: Shield,
    },
    {
      id: 4,
      title: "Account Activation",
      description: "Full platform access will be granted",
      status: "pending" as const,
      icon: Building2,
    },
  ];

  const demoFeatures = [
    {
      title: "Platform Tour",
      description: "Explore the Mirath Legal interface",
      icon: BookOpen,
      action: () => console.log("Start tour"),
    },
    {
      title: "Sample Will Templates",
      description: "View DIFC-compliant will examples",
      icon: FileText,
      action: () => console.log("View templates"),
    },
    {
      title: "Training Materials",
      description: "Learn about estate planning best practices",
      icon: Users,
      action: () => console.log("Access training"),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mirath Legal</h1>
                <p className="text-sm text-gray-600">Verification Pending</p>
              </div>
            </div>
            
            <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
              <Clock className="h-3 w-3 mr-1" />
              Under Review
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Message */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Welcome to Mirath Legal!
                </CardTitle>
                <CardDescription>
                  Your firm registration for <strong>{firmData?.name}</strong> has been submitted successfully.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">What's happening now?</h3>
                  <p className="text-sm text-blue-700">
                    Our verification team is reviewing your credentials and license documentation. 
                    This process typically takes 1-2 business days.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">License Number:</span>
                    <p className="font-medium">{firmData?.licenseNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Submitted:</span>
                    <p className="font-medium">
                      {new Date(firmData?.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Progress</CardTitle>
                <CardDescription>
                  Track the status of your firm verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {verificationSteps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isCompleted = step.status === 'completed';
                    const isInProgress = step.status === 'in_progress';
                    const isPending = step.status === 'pending';
                    
                    return (
                      <div key={step.id} className="flex items-start gap-4">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                          isCompleted 
                            ? 'bg-green-100 border-green-500 text-green-600'
                            : isInProgress
                            ? 'bg-blue-100 border-blue-500 text-blue-600 animate-pulse'
                            : 'bg-gray-100 border-gray-300 text-gray-400'
                        }`}>
                          <StepIcon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className={`font-medium ${
                            isCompleted ? 'text-green-800' :
                            isInProgress ? 'text-blue-800' :
                            'text-gray-600'
                          }`}>
                            {step.title}
                          </h4>
                          <p className="text-sm text-gray-600">{step.description}</p>
                          {isInProgress && (
                            <div className="mt-2">
                              <Progress value={75} className="w-full h-2" />
                              <p className="text-xs text-blue-600 mt-1">In progress...</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Demo Access */}
            <Card>
              <CardHeader>
                <CardTitle>Explore While You Wait</CardTitle>
                <CardDescription>
                  Get familiar with the platform while we verify your credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {demoFeatures.map((feature, index) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={feature.action}>
                        <div className="flex items-center gap-3 mb-2">
                          <FeatureIcon className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium">{feature.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
                <CardDescription>
                  Our team is here to assist you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
                <Button className="w-full" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Request Call Back
                </Button>
                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Training
                </Button>
              </CardContent>
            </Card>

            {/* Expected Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expected Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Document Review</span>
                  <span className="font-medium">24 hours</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">License Verification</span>
                  <span className="font-medium">1-2 days</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Account Activation</span>
                  <span className="font-medium">Immediate</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between font-medium">
                    <span>Total Estimated Time</span>
                    <span className="text-blue-600">1-2 Business Days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Email notifications for status updates</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>30-day professional trial after approval</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Team invitation setup</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Platform training session</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}