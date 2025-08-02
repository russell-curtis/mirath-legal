/**
 * Beneficiaries Step
 * Collects information about will beneficiaries and inheritance distribution
 */

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Heart, 
  Users, 
  Percent,
  Plus,
  Trash2,
  Edit3,
  AlertCircle,
  User,
  Baby
} from "lucide-react";
import { WillData } from "../will-creation-wizard";

interface BeneficiariesStepProps {
  data: WillData;
  updateData: (updates: Partial<WillData>) => void;
  errors: Record<string, string>;
}

interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  percentage: number;
  contingent: boolean;
  specificAssets?: string[];
  conditions?: string;
}

const relationshipOptions = [
  'Spouse',
  'Child',
  'Parent',
  'Sibling',
  'Grandchild',
  'Grandparent',
  'Aunt/Uncle',
  'Cousin',
  'Friend',
  'Charity',
  'Other'
];

export function BeneficiariesStep({ data, updateData, errors }: BeneficiariesStepProps) {
  const [isAddingBeneficiary, setIsAddingBeneficiary] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<string | null>(null);
  const [newBeneficiary, setNewBeneficiary] = useState<Partial<Beneficiary>>({
    name: '',
    relationship: '',
    percentage: 0,
    contingent: false,
    conditions: ''
  });

  const handleAddBeneficiary = () => {
    if (newBeneficiary.name && newBeneficiary.relationship && newBeneficiary.percentage) {
      const beneficiary: Beneficiary = {
        id: Date.now().toString(),
        name: newBeneficiary.name,
        relationship: newBeneficiary.relationship,
        percentage: newBeneficiary.percentage,
        contingent: newBeneficiary.contingent || false,
        conditions: newBeneficiary.conditions
      };
      
      updateData({ beneficiaries: [...data.beneficiaries, beneficiary] });
      setNewBeneficiary({
        name: '',
        relationship: '',
        percentage: 0,
        contingent: false,
        conditions: ''
      });
      setIsAddingBeneficiary(false);
    }
  };

  const handleRemoveBeneficiary = (beneficiaryId: string) => {
    updateData({ beneficiaries: data.beneficiaries.filter(b => b.id !== beneficiaryId) });
  };

  const handleEditBeneficiary = (beneficiaryId: string, updates: Partial<Beneficiary>) => {
    updateData({
      beneficiaries: data.beneficiaries.map(b =>
        b.id === beneficiaryId ? { ...b, ...updates } : b
      )
    });
  };

  const totalPercentage = data.beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
  const remainingPercentage = 100 - totalPercentage;
  const primaryBeneficiaries = data.beneficiaries.filter(b => !b.contingent);
  const contingentBeneficiaries = data.beneficiaries.filter(b => b.contingent);

  const autoDistribute = () => {
    const primaryCount = primaryBeneficiaries.length;
    if (primaryCount > 0) {
      const equalPercentage = Math.floor(100 / primaryCount);
      const remainder = 100 % primaryCount;
      
      const updatedBeneficiaries = data.beneficiaries.map((b, index) => {
        if (!b.contingent) {
          const primaryIndex = primaryBeneficiaries.findIndex(pb => pb.id === b.id);
          return {
            ...b,
            percentage: equalPercentage + (primaryIndex < remainder ? 1 : 0)
          };
        }
        return b;
      });
      
      updateData({ beneficiaries: updatedBeneficiaries });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Beneficiaries</h3>
            <p className="text-sm text-muted-foreground">
              Choose who will inherit your assets and in what proportions
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{totalPercentage}%</div>
          <div className="text-sm text-muted-foreground">Allocated</div>
        </div>
      </div>

      {/* Distribution Overview */}
      <Card className={remainingPercentage !== 0 ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Percent className={`h-5 w-5 ${remainingPercentage !== 0 ? "text-orange-600" : "text-green-600"}`} />
              <span className="font-medium">
                {remainingPercentage !== 0 
                  ? `${remainingPercentage}% remaining to allocate`
                  : "100% allocated - distribution complete"
                }
              </span>
            </div>
            {primaryBeneficiaries.length > 1 && remainingPercentage !== 0 && (
              <Button size="sm" variant="outline" onClick={autoDistribute}>
                Auto-distribute equally
              </Button>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                totalPercentage === 100 ? "bg-green-500" : 
                totalPercentage > 100 ? "bg-red-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(totalPercentage, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Primary Beneficiaries */}
      {primaryBeneficiaries.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <h4 className="font-medium">Primary Beneficiaries ({primaryBeneficiaries.length})</h4>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsAddingBeneficiary(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Beneficiary
            </Button>
          </div>

          <div className="grid gap-4">
            {primaryBeneficiaries.map((beneficiary) => {
              const isEditing = editingBeneficiary === beneficiary.id;

              return (
                <Card key={beneficiary.id}>
                  <CardContent className="p-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                              value={beneficiary.name}
                              onChange={(e) => 
                                handleEditBeneficiary(beneficiary.id, { name: e.target.value })
                              }
                              placeholder="Beneficiary's full name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Relationship</Label>
                            <Select 
                              value={beneficiary.relationship} 
                              onValueChange={(value) => 
                                handleEditBeneficiary(beneficiary.id, { relationship: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {relationshipOptions.map(rel => (
                                  <SelectItem key={rel} value={rel}>
                                    {rel}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Inheritance Percentage</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={beneficiary.percentage}
                                onChange={(e) => 
                                  handleEditBeneficiary(beneficiary.id, { percentage: Number(e.target.value) })
                                }
                                placeholder="0"
                              />
                              <span className="text-sm text-muted-foreground">%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Special Conditions (Optional)</Label>
                          <textarea
                            value={beneficiary.conditions || ''}
                            onChange={(e) => 
                              handleEditBeneficiary(beneficiary.id, { conditions: e.target.value })
                            }
                            placeholder="e.g., 'Only upon reaching age 25', 'For education purposes only'"
                            className="min-h-20 w-full rounded-md border px-3 py-2 text-sm border-input"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`contingent-${beneficiary.id}`}
                            checked={beneficiary.contingent}
                            onCheckedChange={(checked) => 
                              handleEditBeneficiary(beneficiary.id, { contingent: !!checked })
                            }
                          />
                          <Label htmlFor={`contingent-${beneficiary.id}`} className="text-sm">
                            Make this a contingent beneficiary
                          </Label>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => setEditingBeneficiary(null)}
                          >
                            Save Changes
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingBeneficiary(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium">{beneficiary.name}</h5>
                              <Badge variant="secondary" className="text-xs">
                                {beneficiary.relationship}
                              </Badge>
                              <Badge variant="default" className="text-xs font-bold">
                                {beneficiary.percentage}%
                              </Badge>
                            </div>
                            {beneficiary.conditions && (
                              <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded mt-2">
                                <strong>Conditions:</strong> {beneficiary.conditions}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingBeneficiary(beneficiary.id)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveBeneficiary(beneficiary.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Contingent Beneficiaries */}
      {contingentBeneficiaries.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Baby className="h-4 w-4" />
            <h4 className="font-medium">Contingent Beneficiaries ({contingentBeneficiaries.length})</h4>
          </div>

          <div className="grid gap-4">
            {contingentBeneficiaries.map((beneficiary) => (
              <Card key={beneficiary.id} className="border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium">{beneficiary.name}</h5>
                          <Badge variant="outline" className="text-xs">
                            {beneficiary.relationship}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Contingent
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Will inherit if primary beneficiaries cannot
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingBeneficiary(beneficiary.id)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveBeneficiary(beneficiary.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add New Beneficiary Form */}
      {isAddingBeneficiary && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-base">Add New Beneficiary</CardTitle>
            <CardDescription>
              Specify who should inherit your assets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={newBeneficiary.name || ''}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, name: e.target.value })}
                  placeholder="Beneficiary's full legal name"
                />
              </div>
              <div className="space-y-2">
                <Label>Relationship *</Label>
                <Select 
                  value={newBeneficiary.relationship || ''} 
                  onValueChange={(value) => setNewBeneficiary({ ...newBeneficiary, relationship: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipOptions.map(rel => (
                      <SelectItem key={rel} value={rel}>
                        {rel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Inheritance Percentage *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={newBeneficiary.percentage || ''}
                    onChange={(e) => setNewBeneficiary({ ...newBeneficiary, percentage: Number(e.target.value) })}
                    placeholder="0"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                {remainingPercentage > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {remainingPercentage}% remaining
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Special Conditions (Optional)</Label>
              <textarea
                value={newBeneficiary.conditions || ''}
                onChange={(e) => setNewBeneficiary({ ...newBeneficiary, conditions: e.target.value })}
                placeholder="Any special conditions for inheritance (e.g., age requirements, education use)"
                className="min-h-20 w-full rounded-md border px-3 py-2 text-sm border-input"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="contingent-new"
                checked={newBeneficiary.contingent || false}
                onCheckedChange={(checked) => setNewBeneficiary({ ...newBeneficiary, contingent: !!checked })}
              />
              <Label htmlFor="contingent-new" className="text-sm">
                Make this a contingent beneficiary (backup if primary beneficiaries cannot inherit)
              </Label>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleAddBeneficiary}>
                <Plus className="h-4 w-4 mr-2" />
                Add Beneficiary
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsAddingBeneficiary(false);
                  setNewBeneficiary({
                    name: '',
                    relationship: '',
                    percentage: 0,
                    contingent: false,
                    conditions: ''
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Beneficiary Button */}
      {data.beneficiaries.length > 0 && !isAddingBeneficiary && (
        <Button 
          variant="dashed" 
          className="w-full h-12 border-dashed"
          onClick={() => setIsAddingBeneficiary(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Beneficiary
        </Button>
      )}

      {/* Initial State */}
      {data.beneficiaries.length === 0 && !isAddingBeneficiary && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No beneficiaries added yet</h3>
            <p className="text-gray-500 mb-4">
              Add the people or organizations who will inherit your assets.
            </p>
            <Button onClick={() => setIsAddingBeneficiary(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Beneficiary
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Validation Errors */}
      {errors.beneficiaries && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <p className="text-sm text-red-600">{errors.beneficiaries}</p>
          </div>
        </div>
      )}

      {/* Information Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Heart className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Beneficiary Guidelines</h4>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• Primary beneficiaries inherit first; contingent beneficiaries are backups</li>
              <li>• Total percentages must equal 100% for primary beneficiaries</li>
              <li>• Use full legal names as they appear on official documents</li>
              <li>• Consider including contingent beneficiaries for security</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}