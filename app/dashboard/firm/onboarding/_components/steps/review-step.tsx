/**
 * Review Step
 * Final review and confirmation of firm onboarding data
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Building2, 
  Shield, 
  Users, 
  Palette,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Loader2
} from "lucide-react";
import { FirmOnboardingData } from "../firm-onboarding-wizard";

interface ReviewStepProps {
  data: FirmOnboardingData;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ReviewStep({ data, onSubmit, isSubmitting }: ReviewStepProps) {
  const formatAddress = () => {
    const { street, city, emirate, poBox, country } = data.address;
    return `${street}, ${city}, ${emirate}${poBox ? `, ${poBox}` : ''}, ${country}`;
  };

  const getRoleLabel = (role: string) => {
    const roleMap = {
      admin: 'Admin',
      senior_lawyer: 'Senior Lawyer',
      lawyer: 'Lawyer',
      support: 'Support Staff',
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  const getPlanPrice = () => {
    const priceMap = {
      starter: 'AED 1,999/month',
      professional: 'AED 3,999/month',
      enterprise: 'Custom pricing',
    };
    return priceMap[data.subscriptionTier];
  };

  const completedSections = [
    { name: 'Firm Details', icon: Building2, completed: true },
    { name: 'License Verification', icon: Shield, completed: true },
    { name: 'Team Setup', icon: Users, completed: true },
    { name: 'Branding', icon: Palette, completed: true },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Review & Complete Setup</h2>
        <p className="text-muted-foreground">
          Please review all information before completing your firm registration.
        </p>
      </div>

      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Progress</CardTitle>
          <CardDescription>
            All sections completed successfully
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {completedSections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <IconComponent className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">{section.name}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Firm Information Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Firm Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Firm Name</h4>
                <p className="font-semibold">{data.firmName}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">License Number</h4>
                <p>{data.licenseNumber}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Contact Information</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {data.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {data.phone}
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{formatAddress()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Established</h4>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {data.establishedYear}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Practice Areas</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.practiceAreas.map((area, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Bar Association</h4>
                <p>{data.barAssociation}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({data.teamMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.teamMembers.map((member, index) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">{member.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{getRoleLabel(member.role)}</Badge>
                  {index === 0 && (
                    <div className="text-xs text-muted-foreground mt-1">Primary Contact</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Branding & Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.logoUrl && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Logo</h4>
                <img
                  src={data.logoUrl}
                  alt="Firm logo"
                  className="max-h-12 border rounded"
                />
              </div>
            )}
            
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Color Scheme</h4>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: data.primaryColor }}
                />
                <span className="text-sm font-mono">{data.primaryColor}</span>
                <div
                  className="w-6 h-6 rounded border ml-2"
                  style={{ backgroundColor: data.secondaryColor }}
                />
                <span className="text-sm font-mono">{data.secondaryColor}</span>
              </div>
            </div>

            {data.customDomain && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Custom Domain</h4>
                <p className="text-sm">{data.customDomain}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg capitalize">{data.subscriptionTier}</h3>
                <p className="text-primary font-semibold">{getPlanPrice()}</p>
              </div>
              
              <div className="text-sm text-muted-foreground">
                You can change your plan anytime from your firm dashboard.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>What Happens Next?</CardTitle>
          <CardDescription>
            Here's what you can expect after completing setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">Account Activation</h4>
                <p className="text-sm text-muted-foreground">
                  Your firm account will be created and activated immediately.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">Team Invitations</h4>
                <p className="text-sm text-muted-foreground">
                  Invitation emails will be sent to all team members to join the platform.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">License Verification</h4>
                <p className="text-sm text-muted-foreground">
                  Our team will review your credentials within 1-2 business days.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                4
              </div>
              <div>
                <h4 className="font-medium">Platform Training</h4>
                <p className="text-sm text-muted-foreground">
                  Access our comprehensive training materials and setup guidance.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Confirmation */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Ready to Get Started?</h3>
            <p className="text-muted-foreground">
              By completing setup, you agree to our Terms of Service and Privacy Policy. 
              Your firm will be registered on the Mirath Legal platform.
            </p>
            
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              size="lg"
              className="min-w-48"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up your firm...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Firm Setup
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}