/**
 * Branding Setup Step
 * Customize firm's visual identity and branding
 */

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Upload, Monitor, Smartphone, FileImage, Link } from "lucide-react";
import { FirmOnboardingData } from "../firm-onboarding-wizard";
import { useState } from "react";

interface BrandingSetupStepProps {
  data: FirmOnboardingData;
  updateData: (updates: Partial<FirmOnboardingData>) => void;
  errors: Record<string, string>;
}

const predefinedColors = [
  { name: 'Professional Blue', primary: '#1D4ED8', secondary: '#64748B' },
  { name: 'Legal Green', primary: '#059669', secondary: '#6B7280' },
  { name: 'Corporate Gray', primary: '#374151', secondary: '#9CA3AF' },
  { name: 'Elegant Purple', primary: '#7C3AED', secondary: '#64748B' },
  { name: 'Modern Teal', primary: '#0D9488', secondary: '#6B7280' },
  { name: 'Classic Navy', primary: '#1E3A8A', secondary: '#64748B' },
];

const subscriptionTiers = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: 'AED 1,999',
    description: 'Perfect for small firms getting started',
    features: [
      'Up to 50 wills per month',
      'Basic templates',
      'Email support',
      'Standard branding',
    ],
    popular: false,
  },
  {
    id: 'professional' as const,
    name: 'Professional',
    price: 'AED 3,999',
    description: 'Most popular for growing law firms',
    features: [
      'Up to 200 wills per month',
      'Premium templates',
      'Priority support',
      'Full branding customization',
      'Client portal',
      'Analytics dashboard',
    ],
    popular: true,
  },
  {
    id: 'enterprise' as const,
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large firms with custom needs',
    features: [
      'Unlimited wills',
      'Custom templates',
      'Dedicated support',
      'White-label solution',
      'API access',
      'Custom integrations',
    ],
    popular: false,
  },
];

export function BrandingSetupStep({ data, updateData, errors }: BrandingSetupStepProps) {
  const [logoUploadStatus, setLogoUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const handleColorSelect = (colors: { primary: string; secondary: string }) => {
    updateData({
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
    });
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('image')) {
      setLogoUploadStatus('error');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setLogoUploadStatus('error');
      return;
    }

    setLogoUploadStatus('uploading');
    
    try {
      // In a real application, you would upload to cloud storage
      // For now, we'll simulate the upload and create a local URL
      const logoUrl = URL.createObjectURL(file);
      updateData({ logoUrl });
      setLogoUploadStatus('success');
    } catch (error) {
      console.error('Logo upload error:', error);
      setLogoUploadStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Palette className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Customize Your Brand</h2>
        <p className="text-muted-foreground">
          Personalize your firm's appearance on the platform and client-facing documents.
        </p>
      </div>

      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Firm Logo
          </CardTitle>
          <CardDescription>
            Upload your firm's logo for branding and documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {!data.logoUrl ? (
                  <div className="space-y-4">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Upload logo</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                      <p className="text-xs text-gray-500">Recommended: 300x100px</p>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button variant="outline" disabled={logoUploadStatus === 'uploading'}>
                        {logoUploadStatus === 'uploading' ? 'Uploading...' : 'Choose File'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <img
                      src={data.logoUrl}
                      alt="Firm logo"
                      className="max-h-20 mx-auto"
                    />
                    <div>
                      <p className="text-sm font-medium text-green-900">Logo uploaded</p>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button variant="outline" size="sm">
                        Replace Logo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Logo Guidelines</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use high-resolution images (300 DPI minimum)</li>
                <li>• Maintain aspect ratio around 3:1 (width:height)</li>
                <li>• Ensure good contrast on light backgrounds</li>
                <li>• Avoid complex designs that don't scale well</li>
                <li>• Test readability at different sizes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Scheme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Scheme
          </CardTitle>
          <CardDescription>
            Choose colors that represent your firm's brand
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Predefined Color Schemes */}
          <div>
            <h4 className="font-medium mb-3">Predefined Schemes</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {predefinedColors.map((scheme, index) => (
                <div
                  key={index}
                  onClick={() => handleColorSelect(scheme)}
                  className={`cursor-pointer p-3 rounded-lg border transition-colors ${
                    data.primaryColor === scheme.primary
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: scheme.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: scheme.secondary }}
                    />
                  </div>
                  <div className="text-sm font-medium">{scheme.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="primaryColor"
                  value={data.primaryColor}
                  onChange={(e) => updateData({ primaryColor: e.target.value })}
                  className="w-12 h-10 border border-input rounded"
                />
                <Input
                  value={data.primaryColor}
                  onChange={(e) => updateData({ primaryColor: e.target.value })}
                  placeholder="#1D4ED8"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="secondaryColor"
                  value={data.secondaryColor}
                  onChange={(e) => updateData({ secondaryColor: e.target.value })}
                  className="w-12 h-10 border border-input rounded"
                />
                <Input
                  value={data.secondaryColor}
                  onChange={(e) => updateData({ secondaryColor: e.target.value })}
                  placeholder="#64748B"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3">Preview</h4>
            <div className="space-y-3">
              <div 
                className="p-4 rounded text-white"
                style={{ backgroundColor: data.primaryColor }}
              >
                <div className="font-semibold">Primary Color Usage</div>
                <div className="text-sm opacity-90">Headers, buttons, and key elements</div>
              </div>
              <div 
                className="p-4 rounded text-white"
                style={{ backgroundColor: data.secondaryColor }}
              >
                <div className="font-medium">Secondary Color Usage</div>
                <div className="text-sm opacity-90">Supporting elements and text</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Domain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Custom Domain (Optional)
          </CardTitle>
          <CardDescription>
            Use your own domain for the client portal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customDomain">Custom Domain</Label>
            <Input
              id="customDomain"
              value={data.customDomain || ''}
              onChange={(e) => updateData({ customDomain: e.target.value })}
              placeholder="portal.yourfirm.com"
            />
            <p className="text-xs text-muted-foreground">
              Available for Professional and Enterprise plans. DNS configuration required.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Plan</CardTitle>
          <CardDescription>
            Select the plan that best fits your firm's needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {subscriptionTiers.map((tier) => (
              <div
                key={tier.id}
                onClick={() => updateData({ subscriptionTier: tier.id })}
                className={`cursor-pointer p-4 rounded-lg border transition-colors relative ${
                  data.subscriptionTier === tier.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-2 left-4 bg-primary">
                    Most Popular
                  </Badge>
                )}
                
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-lg">{tier.name}</h3>
                  <div className="text-2xl font-bold text-primary">{tier.price}</div>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>

                <ul className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}