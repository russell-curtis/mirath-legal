/**
 * Review Step
 * Final review of all will information before AI generation
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  User, 
  Home, 
  Heart, 
  Shield, 
  DollarSign,
  MapPin,
  Phone,
  Calendar,
  Globe,
  Edit,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { WillData } from "../will-creation-wizard";

interface ReviewStepProps {
  data: WillData;
  updateData: (updates: Partial<WillData>) => void;
}

export function ReviewStep({ data }: ReviewStepProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalAssetValue = data.assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalBeneficiaryPercentage = data.beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
  const primaryBeneficiaries = data.beneficiaries.filter(b => !b.contingent);
  const contingentBeneficiaries = data.beneficiaries.filter(b => b.contingent);
  const primaryExecutors = data.executors.filter(e => !e.alternateExecutor);
  const alternateExecutors = data.executors.filter(e => e.alternateExecutor);

  // Validation checks
  const validationIssues: string[] = [];
  
  if (!data.testatorName) validationIssues.push("Missing testator name");
  if (!data.emiratesId) validationIssues.push("Missing Emirates ID");
  if (!data.nationality) validationIssues.push("Missing nationality");
  if (!data.residenceAddress) validationIssues.push("Missing address");
  if (!data.dateOfBirth) validationIssues.push("Missing date of birth");
  if (data.maritalStatus === 'married' && !data.spouseName) validationIssues.push("Missing spouse name");
  if (data.assets.length === 0) validationIssues.push("No assets specified");
  if (data.beneficiaries.length === 0) validationIssues.push("No beneficiaries specified");
  if (Math.abs(totalBeneficiaryPercentage - 100) > 0.01) validationIssues.push("Beneficiary percentages don't total 100%");
  if (data.executors.length === 0) validationIssues.push("No executors specified");

  const isReadyForGeneration = validationIssues.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Review & Finalize</h3>
          <p className="text-sm text-muted-foreground">
            Review all information before generating your DIFC-compliant will
          </p>
        </div>
      </div>

      {/* Validation Status */}
      <Card className={isReadyForGeneration ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            {isReadyForGeneration ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Ready for generation</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-800">
                  {validationIssues.length} issue{validationIssues.length !== 1 ? 's' : ''} need attention
                </span>
              </>
            )}
          </div>
          {!isReadyForGeneration && (
            <ul className="mt-2 text-sm text-orange-700 list-disc list-inside">
              {validationIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Personal Information Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div>
                <Label>Full Name</Label>
                <Value>{data.testatorName || <EmptyValue />}</Value>
              </div>
              <div>
                <Label>Emirates ID</Label>
                <Value>{data.emiratesId || <EmptyValue />}</Value>
              </div>
              <div>
                <Label>Nationality</Label>
                <Value>{data.nationality || <EmptyValue />}</Value>
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Value>
                  {data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : <EmptyValue />}
                </Value>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <Label>Marital Status</Label>
                <Value>
                  <Badge variant="secondary">{data.maritalStatus}</Badge>
                  {data.maritalStatus === 'married' && data.spouseName && (
                    <span className="ml-2">({data.spouseName})</span>
                  )}
                </Value>
              </div>
              <div>
                <Label>Address</Label>
                <Value>{data.residenceAddress || <EmptyValue />}</Value>
              </div>
              <div>
                <Label>Will Configuration</Label>
                <Value>
                  <div className="flex gap-2">
                    <Badge>{data.willType.replace('_', ' ')}</Badge>
                    <Badge variant="outline">{data.language === 'ar' ? 'العربية' : 'English'}</Badge>
                    {data.difcCompliant && <Badge variant="default">DIFC Compliant</Badge>}
                  </div>
                </Value>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Assets ({data.assets.length})
            </div>
            <Badge variant="outline" className="text-lg font-semibold">
              Total: {formatCurrency(totalAssetValue)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.assets.length > 0 ? (
            <div className="space-y-3">
              {data.assets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{asset.description}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <span>Type: {asset.type.replace('_', ' ')}</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {asset.location}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(asset.value)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptySection icon={Home} title="No assets added" />
          )}
        </CardContent>
      </Card>

      {/* Beneficiaries Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Beneficiaries ({data.beneficiaries.length})
            </div>
            <Badge variant={totalBeneficiaryPercentage === 100 ? "default" : "destructive"}>
              {totalBeneficiaryPercentage}% Allocated
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.beneficiaries.length > 0 ? (
            <div className="space-y-4">
              {primaryBeneficiaries.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Primary Beneficiaries</h5>
                  <div className="space-y-2">
                    {primaryBeneficiaries.map((beneficiary) => (
                      <div key={beneficiary.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{beneficiary.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {beneficiary.relationship}
                            {beneficiary.conditions && (
                              <span className="ml-2 text-blue-600">• {beneficiary.conditions}</span>
                            )}
                          </div>
                        </div>
                        <Badge variant="default" className="font-bold">
                          {beneficiary.percentage}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {contingentBeneficiaries.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Contingent Beneficiaries</h5>
                  <div className="space-y-2">
                    {contingentBeneficiaries.map((beneficiary) => (
                      <div key={beneficiary.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-dashed border">
                        <div>
                          <div className="font-medium">{beneficiary.name}</div>
                          <div className="text-sm text-muted-foreground">{beneficiary.relationship}</div>
                        </div>
                        <Badge variant="outline">Contingent</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptySection icon={Heart} title="No beneficiaries added" />
          )}
        </CardContent>
      </Card>

      {/* Executors & Guardians Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Executors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Executors ({data.executors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.executors.length > 0 ? (
              <div className="space-y-3">
                {primaryExecutors.map((executor) => (
                  <div key={executor.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium flex items-center gap-2">
                      {executor.name}
                      <Badge variant="default" className="text-xs">Primary</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>{executor.relationship}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3" />
                        {executor.phone}
                      </div>
                    </div>
                  </div>
                ))}
                {alternateExecutors.map((executor) => (
                  <div key={executor.id} className="p-3 bg-gray-50 rounded-lg border-dashed border">
                    <div className="font-medium flex items-center gap-2">
                      {executor.name}
                      <Badge variant="outline" className="text-xs">Alternate</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{executor.relationship}</div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptySection icon={Shield} title="No executors added" />
            )}
          </CardContent>
        </Card>

        {/* Guardians */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Guardians ({data.guardians.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.guardians.length > 0 ? (
              <div className="space-y-3">
                {data.guardians.map((guardian) => (
                  <div key={guardian.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">{guardian.name}</div>
                    <div className="text-sm text-muted-foreground">
                      <div>{guardian.relationship}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3" />
                        {guardian.phone}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <div className="text-sm">No guardians specified</div>
                <div className="text-xs">Only needed if you have minor children</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Next Steps */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ready for AI Generation
          </CardTitle>
          <CardDescription>
            Your will information is complete and ready for DIFC-compliant document generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="font-medium text-blue-800">AI Analysis</div>
                <div className="text-sm text-blue-600">Legal compliance check</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <FileText className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="font-medium text-green-800">Document Generation</div>
                <div className="text-sm text-green-600">DIFC-compliant will creation</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Globe className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="font-medium text-purple-800">Multi-language</div>
                <div className="text-sm text-purple-600">
                  {data.language === 'ar' ? 'Arabic version' : 'English version'}
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-800 mb-2">What happens next?</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• AI will analyze your information for DIFC compliance</li>
                <li>• A comprehensive will document will be generated</li>
                <li>• Legal review recommendations will be provided</li>
                <li>• You can download, print, and schedule notarization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper components
function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-medium text-muted-foreground">{children}</div>;
}

function Value({ children }: { children: React.ReactNode }) {
  return <div className="text-sm">{children}</div>;
}

function EmptyValue() {
  return <span className="text-red-500 italic">Not provided</span>;
}

function EmptySection({ icon: Icon, title }: { icon: any, title: string }) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <Icon className="h-8 w-8 mx-auto mb-2" />
      <div className="text-sm">{title}</div>
    </div>
  );
}