/**
 * Generation Step
 * AI-powered will generation with real-time progress and results
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  FileText, 
  CheckCircle, 
  Download, 
  Eye, 
  Shield,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { WillData } from "../will-creation-wizard";

interface GenerationStepProps {
  data: WillData;
  isGenerating: boolean;
  onGenerate: () => void;
}

interface GenerationPhase {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  duration?: number;
}

export function GenerationStep({ data, isGenerating, onGenerate }: GenerationStepProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const phases: GenerationPhase[] = [
    {
      id: 'analysis',
      title: 'Legal Analysis',
      description: 'Analyzing your information for DIFC compliance and UAE legal requirements',
      status: 'pending'
    },
    {
      id: 'validation',
      title: 'Data Validation',
      description: 'Validating asset distribution and beneficiary allocations',
      status: 'pending'
    },
    {
      id: 'generation',
      title: 'Document Generation',
      description: 'Creating your DIFC-compliant will document with AI assistance',
      status: 'pending'
    },
    {
      id: 'review',
      title: 'Quality Review',
      description: 'Performing final compliance check and formatting',
      status: 'pending'
    }
  ];

  useEffect(() => {
    if (isGenerating) {
      simulateGeneration();
    }
  }, [isGenerating]);

  const simulateGeneration = async () => {
    const phaseTimings = [2000, 1500, 3000, 1000]; // Duration for each phase
    
    for (let i = 0; i < phases.length; i++) {
      setCurrentPhase(i);
      
      // Simulate progress within phase
      const startProgress = (i / phases.length) * 100;
      const endProgress = ((i + 1) / phases.length) * 100;
      
      for (let p = startProgress; p <= endProgress; p += 2) {
        setProgress(p);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      await new Promise(resolve => setTimeout(resolve, phaseTimings[i]));
    }
    
    // Simulate successful generation
    setGeneratedContent("Your DIFC-compliant will has been successfully generated!");
    setAnalysisResults({
      complianceScore: 98,
      recommendations: [
        "Consider adding alternate executor for additional security",
        "Digital asset provisions are comprehensive",
        "DIFC registration recommended within 30 days"
      ],
      estimatedValue: data.assets.reduce((sum, asset) => sum + asset.value, 0)
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPhaseIcon = (status: GenerationPhase['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  if (!isGenerating && !generatedContent) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bot className="h-8 w-8 text-primary" />
            <h3 className="text-2xl font-semibold">Ready to Generate Your Will</h3>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AI system will analyze your information and generate a comprehensive, 
            DIFC-compliant will document tailored to your specific needs and UAE legal requirements.
          </p>
        </div>

        {/* Pre-generation Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="font-semibold">Assets</div>
              <div className="text-sm text-muted-foreground">
                {data.assets.length} assets worth {formatCurrency(data.assets.reduce((sum, a) => sum + a.value, 0))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="font-semibold">Beneficiaries</div>
              <div className="text-sm text-muted-foreground">
                {data.beneficiaries.length} beneficiaries with 100% allocation
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="font-semibold">DIFC Compliant</div>
              <div className="text-sm text-muted-foreground">
                {data.language === 'ar' ? 'Arabic' : 'English'} version
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generation Process Preview */}
        <Card>
          <CardHeader>
            <CardTitle>AI Generation Process</CardTitle>
            <CardDescription>
              Here's what our AI will do to create your will
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {phases.map((phase, index) => (
                <div key={phase.id} className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 bg-white">
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{phase.title}</h4>
                    <p className="text-sm text-muted-foreground">{phase.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={onGenerate}
            className="px-8 py-3 text-lg"
          >
            <Bot className="h-5 w-5 mr-2" />
            Generate My Will
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Generation typically takes 30-60 seconds
          </p>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bot className="h-8 w-8 text-primary animate-pulse" />
            <h3 className="text-2xl font-semibold">Generating Your Will</h3>
          </div>
          <p className="text-muted-foreground">
            Our AI is creating your DIFC-compliant will document...
          </p>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Generation Phases */}
        <div className="space-y-4">
          {phases.map((phase, index) => {
            let status: GenerationPhase['status'] = 'pending';
            if (index < currentPhase) status = 'completed';
            else if (index === currentPhase) status = 'in_progress';

            return (
              <Card key={phase.id} className={
                status === 'in_progress' ? 'border-blue-200 bg-blue-50' :
                status === 'completed' ? 'border-green-200 bg-green-50' :
                'border-gray-200'
              }>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getPhaseIcon(status)}
                    <div className="flex-1">
                      <h4 className="font-medium">{phase.title}</h4>
                      <p className="text-sm text-muted-foreground">{phase.description}</p>
                      {status === 'in_progress' && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            Processing...
                          </Badge>
                        </div>
                      )}
                      {status === 'completed' && (
                        <div className="mt-2">
                          <Badge variant="default" className="text-xs">
                            ✓ Completed
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Generation completed
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <h3 className="text-2xl font-semibold text-green-800">Will Generated Successfully!</h3>
        </div>
        <p className="text-muted-foreground">
          Your DIFC-compliant will has been created and is ready for review and download.
        </p>
      </div>

      {/* Results Summary */}
      {analysisResults && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Shield className="h-5 w-5" />
              AI Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analysisResults.complianceScore}%
                </div>
                <div className="text-sm text-green-700">DIFC Compliance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(analysisResults.estimatedValue)}
                </div>
                <div className="text-sm text-blue-700">Total Estate Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {data.language === 'ar' ? 'AR' : 'EN'}
                </div>
                <div className="text-sm text-purple-700">Document Language</div>
              </div>
            </div>
            
            {analysisResults.recommendations.length > 0 && (
              <div>
                <h5 className="font-medium text-green-800 mb-2">AI Recommendations:</h5>
                <ul className="text-sm text-green-700 space-y-1">
                  {analysisResults.recommendations.map((rec: string, index: number) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Document Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Generated Will</CardTitle>
            <CardDescription>
              DIFC-compliant will document ready for review
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Will Document</div>
                  <div className="text-sm text-muted-foreground">
                    {data.testatorName} - {data.willType.replace('_', ' ')}
                  </div>
                </div>
              </div>
              <Badge variant="default">Ready</Badge>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Next Steps</CardTitle>
            <CardDescription>
              Complete your will registration process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Will document generated</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>Print and sign the document</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>Notarize at UAE courts or DIFC</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>Register with DIFC (if applicable)</span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Notarization
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Services */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Additional Services</CardTitle>
          <CardDescription>
            Professional services to complete your estate planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <FileText className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="font-medium">Legal Review</div>
              <div className="text-sm text-muted-foreground mb-3">
                Professional lawyer review
              </div>
              <Button size="sm" variant="outline">Book Review</Button>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Shield className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="font-medium">DIFC Registration</div>
              <div className="text-sm text-muted-foreground mb-3">
                Complete registration process
              </div>
              <Button size="sm" variant="outline">Start Registration</Button>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <RefreshCw className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="font-medium">Will Updates</div>
              <div className="text-sm text-muted-foreground mb-3">
                Annual review service
              </div>
              <Button size="sm" variant="outline">Learn More</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}