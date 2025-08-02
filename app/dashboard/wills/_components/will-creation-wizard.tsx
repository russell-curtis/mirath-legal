/**
 * Will Creation Wizard Component
 * Multi-step form for creating DIFC-compliant wills with AI integration
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Home, 
  Heart, 
  Shield, 
  FileText, 
  Bot,
  CheckCircle,
  AlertCircle,
  Save,
  Check
} from "lucide-react";

// Step components
import { PersonalInfoStep } from "./steps/personal-info-step";
import { AssetsStep } from "./steps/assets-step";
import { BeneficiariesStep } from "./steps/beneficiaries-step";
import { GuardiansStep } from "./steps/guardians-step";
import { ReviewStep } from "./steps/review-step";
import { GenerationStep } from "./steps/generation-step";

export interface WillData {
  // Personal Information
  testatorName: string;
  emiratesId: string;
  nationality: string;
  residenceAddress: string;
  dateOfBirth: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  spouseName?: string;
  
  // Assets
  assets: Array<{
    id: string;
    type: 'real_estate' | 'bank_account' | 'investment' | 'personal_property' | 'business' | 'digital';
    description: string;
    value: number;
    location: string;
    specificInstructions?: string;
  }>;
  
  // Beneficiaries
  beneficiaries: Array<{
    id: string;
    name: string;
    relationship: string;
    percentage: number;
    contingent: boolean;
    specificAssets?: string[];
    conditions?: string;
  }>;
  
  // Guardians (for minors)
  guardians: Array<{
    id: string;
    name: string;
    relationship: string;
    address: string;
    phone: string;
    alternateGuardian?: boolean;
  }>;
  
  // Executors
  executors: Array<{
    id: string;
    name: string;
    relationship: string;
    address: string;
    phone: string;
    alternateExecutor?: boolean;
  }>;
  
  // Special Instructions
  specialInstructions?: string;
  funeralArrangements?: string;
  charitableBequests?: Array<{
    organization: string;
    amount: number;
    purpose?: string;
  }>;
  
  // DIFC Specific
  difcCompliant: boolean;
  willType: 'simple' | 'complex' | 'business_succession' | 'digital_assets';
  language: 'en' | 'ar';
}

const steps = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Basic details about the testator',
    icon: User,
  },
  {
    id: 'assets',
    title: 'Assets & Property',
    description: 'Assets to be distributed',
    icon: Home,
  },
  {
    id: 'beneficiaries',
    title: 'Beneficiaries',
    description: 'Who will inherit your assets',
    icon: Heart,
  },
  {
    id: 'guardians',
    title: 'Guardians & Executors',
    description: 'Guardians for minors and will executors',
    icon: Shield,
  },
  {
    id: 'review',
    title: 'Review & Finalize',
    description: 'Review all information',
    icon: FileText,
  },
  {
    id: 'generation',
    title: 'AI Generation',
    description: 'Generate DIFC-compliant will',
    icon: Bot,
  },
];

interface WillCreationWizardProps {
  userId: string;
  willId?: string;
  matterId?: string;
  autoSave?: boolean;
}

export function WillCreationWizard({ userId, willId, matterId, autoSave = true }: WillCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [willData, setWillData] = useState<WillData>({
    testatorName: '',
    emiratesId: '',
    nationality: '',
    residenceAddress: '',
    dateOfBirth: '',
    maritalStatus: 'single',
    assets: [],
    beneficiaries: [],
    guardians: [],
    executors: [],
    difcCompliant: true,
    willType: 'simple',
    language: 'en',
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const debounceTimer = useRef<NodeJS.Timeout | undefined>();

  const updateWillData = (updates: Partial<WillData>) => {
    setWillData(prev => ({ ...prev, ...updates }));
    // Clear validation errors for updated fields
    const newErrors = { ...validationErrors };
    Object.keys(updates).forEach(key => {
      delete newErrors[key];
    });
    setValidationErrors(newErrors);
    
    // Trigger auto-save if enabled
    if (autoSave && willId) {
      setSaveStatus('saving');
      // Debounce save calls
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        saveWillData({ ...willData, ...updates });
      }, 1000);
    }
  };

  // Auto-save function
  const saveWillData = useCallback(async (dataToSave: WillData) => {
    if (!willId || !autoSave) return;

    try {
      setIsSaving(true);
      setSaveStatus('saving');

      const response = await fetch(`/api/wills/${willId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalInfo: {
            name: dataToSave.testatorName,
            emiratesId: dataToSave.emiratesId,
            nationality: dataToSave.nationality,
            address: { street: dataToSave.residenceAddress },
            dateOfBirth: dataToSave.dateOfBirth,
            maritalStatus: dataToSave.maritalStatus,
            spouseName: dataToSave.spouseName,
          },
          assets: dataToSave.assets.map(asset => ({
            id: asset.id,
            type: asset.type,
            description: asset.description,
            value: asset.value,
            location: asset.location,
            specificInstructions: asset.specificInstructions,
          })),
          beneficiaries: dataToSave.beneficiaries.map(ben => ({
            id: ben.id,
            name: ben.name,
            relationship: ben.relationship,
            percentage: ben.percentage,
            contingent: ben.contingent,
            specificAssets: ben.specificAssets,
            conditions: ben.conditions,
          })),
          guardians: dataToSave.guardians,
          executors: dataToSave.executors,
          specialInstructions: dataToSave.specialInstructions,
          willType: dataToSave.willType,
          language: dataToSave.language,
        }),
      });

      if (response.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [willId, autoSave]);

  // Load existing will data if willId is provided
  useEffect(() => {
    if (willId) {
      const loadWillData = async () => {
        try {
          const response = await fetch(`/api/wills/${willId}`);
          if (response.ok) {
            const { will } = await response.json();
            // Transform database format to UI format
            setWillData({
              testatorName: will.personalInfo?.name || '',
              emiratesId: will.personalInfo?.emiratesId || '',
              nationality: will.personalInfo?.nationality || '',
              residenceAddress: will.personalInfo?.address?.street || '',
              dateOfBirth: will.personalInfo?.dateOfBirth || '',
              maritalStatus: will.personalInfo?.maritalStatus || 'single',
              spouseName: will.personalInfo?.spouseName || '',
              assets: will.assets || [],
              beneficiaries: will.beneficiaries || [],
              guardians: will.guardians || [],
              executors: will.executors || [],
              specialInstructions: will.specialInstructions || '',
              willType: will.willType || 'simple',
              language: will.language || 'en',
              difcCompliant: will.difcCompliant || false,
            });
          }
        } catch (error) {
          console.error('Error loading will data:', error);
        }
      };

      loadWillData();
    }
  }, [willId]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};
    
    switch (currentStep) {
      case 0: // Personal Information
        if (!willData.testatorName.trim()) errors.testatorName = 'Name is required';
        if (!willData.emiratesId.trim()) errors.emiratesId = 'Emirates ID is required';
        if (!willData.nationality.trim()) errors.nationality = 'Nationality is required';
        if (!willData.residenceAddress.trim()) errors.residenceAddress = 'Address is required';
        if (!willData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
        if (willData.maritalStatus === 'married' && !willData.spouseName?.trim()) {
          errors.spouseName = 'Spouse name is required for married status';
        }
        break;
        
      case 1: // Assets
        if (willData.assets.length === 0) {
          errors.assets = 'At least one asset must be specified';
        }
        break;
        
      case 2: // Beneficiaries
        if (willData.beneficiaries.length === 0) {
          errors.beneficiaries = 'At least one beneficiary must be specified';
        }
        const totalPercentage = willData.beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
          errors.beneficiaries = 'Beneficiary percentages must total 100%';
        }
        break;
        
      case 3: // Guardians & Executors
        if (willData.executors.length === 0) {
          errors.executors = 'At least one executor must be specified';
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

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // First save the latest data
      if (willId && autoSave) {
        await saveWillData(willData);
      }
      
      // Generate the will
      const response = await fetch('/api/wills/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          willData,
          matterId,
          generateOptions: {
            includeLegalAnalysis: true,
            includeComplianceCheck: true,
            includeSummary: true,
            formalityLevel: 'formal',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate will');
      }

      const result = await response.json();
      
      if (result.success) {
        // Show success and enable download/preview
        console.log('Will generated successfully:', result);
        // The generation step component will handle showing the results
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      console.error('Will generation error:', error);
      // Error will be handled by the GenerationStep component
    } finally {
      setIsGenerating(false);
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalInfoStep 
            data={willData} 
            updateData={updateWillData}
            errors={validationErrors}
          />
        );
      case 1:
        return (
          <AssetsStep 
            data={willData} 
            updateData={updateWillData}
            errors={validationErrors}
          />
        );
      case 2:
        return (
          <BeneficiariesStep 
            data={willData} 
            updateData={updateWillData}
            errors={validationErrors}
          />
        );
      case 3:
        return (
          <GuardiansStep 
            data={willData} 
            updateData={updateWillData}
            errors={validationErrors}
          />
        );
      case 4:
        return (
          <ReviewStep 
            data={willData} 
            updateData={updateWillData}
          />
        );
      case 5:
        return (
          <GenerationStep 
            data={willData}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
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
            <div className="flex items-center gap-2">
              {autoSave && willId && (
                <div className="flex items-center gap-1 text-sm">
                  {saveStatus === 'saving' && (
                    <>
                      <Save className="h-4 w-4 animate-pulse text-blue-600" />
                      <span className="text-blue-600">Saving...</span>
                    </>
                  )}
                  {saveStatus === 'saved' && (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Saved</span>
                    </>
                  )}
                  {saveStatus === 'error' && (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">Save failed</span>
                    </>
                  )}
                </div>
              )}
              <Badge variant="outline">
                Step {currentStep + 1} of {steps.length}
              </Badge>
            </div>
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
      <div className="grid grid-cols-6 gap-2">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

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
              onClick={handleGenerate}
              disabled={isGenerating || Object.keys(validationErrors).length > 0}
              className="min-w-32"
            >
              {isGenerating ? (
                <>
                  <Bot className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  Generate Will
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