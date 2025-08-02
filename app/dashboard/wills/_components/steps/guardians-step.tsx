/**
 * Guardians & Executors Step
 * Collects information about guardians for minors and will executors
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
  Shield, 
  Baby, 
  Gavel,
  Plus,
  Trash2,
  Edit3,
  Phone,
  MapPin,
  User
} from "lucide-react";
import { WillData } from "../will-creation-wizard";

interface GuardiansStepProps {
  data: WillData;
  updateData: (updates: Partial<WillData>) => void;
  errors: Record<string, string>;
}

interface Guardian {
  id: string;
  name: string;
  relationship: string;
  address: string;
  phone: string;
  alternateGuardian?: boolean;
}

interface Executor {
  id: string;
  name: string;
  relationship: string;
  address: string;
  phone: string;
  alternateExecutor?: boolean;
}

const relationshipOptions = [
  'Spouse',
  'Parent',
  'Sibling',
  'Grandparent',
  'Aunt/Uncle',
  'Close Friend',
  'Legal Professional',
  'Other Family Member'
];

export function GuardiansStep({ data, updateData, errors }: GuardiansStepProps) {
  const [activeTab, setActiveTab] = useState<'executors' | 'guardians'>('executors');
  const [isAddingExecutor, setIsAddingExecutor] = useState(false);
  const [isAddingGuardian, setIsAddingGuardian] = useState(false);
  const [editingExecutor, setEditingExecutor] = useState<string | null>(null);
  const [editingGuardian, setEditingGuardian] = useState<string | null>(null);
  
  const [newExecutor, setNewExecutor] = useState<Partial<Executor>>({
    name: '',
    relationship: '',
    address: '',
    phone: '',
    alternateExecutor: false
  });
  
  const [newGuardian, setNewGuardian] = useState<Partial<Guardian>>({
    name: '',
    relationship: '',
    address: '',
    phone: '',
    alternateGuardian: false
  });

  const handleAddExecutor = () => {
    if (newExecutor.name && newExecutor.relationship && newExecutor.address && newExecutor.phone) {
      const executor: Executor = {
        id: Date.now().toString(),
        name: newExecutor.name,
        relationship: newExecutor.relationship,
        address: newExecutor.address,
        phone: newExecutor.phone,
        alternateExecutor: newExecutor.alternateExecutor || false
      };
      
      updateData({ executors: [...data.executors, executor] });
      setNewExecutor({
        name: '',
        relationship: '',
        address: '',
        phone: '',
        alternateExecutor: false
      });
      setIsAddingExecutor(false);
    }
  };

  const handleAddGuardian = () => {
    if (newGuardian.name && newGuardian.relationship && newGuardian.address && newGuardian.phone) {
      const guardian: Guardian = {
        id: Date.now().toString(),
        name: newGuardian.name,
        relationship: newGuardian.relationship,
        address: newGuardian.address,
        phone: newGuardian.phone,
        alternateGuardian: newGuardian.alternateGuardian || false
      };
      
      updateData({ guardians: [...data.guardians, guardian] });
      setNewGuardian({
        name: '',
        relationship: '',
        address: '',
        phone: '',
        alternateGuardian: false
      });
      setIsAddingGuardian(false);
    }
  };

  const handleRemoveExecutor = (executorId: string) => {
    updateData({ executors: data.executors.filter(e => e.id !== executorId) });
  };

  const handleRemoveGuardian = (guardianId: string) => {
    updateData({ guardians: data.guardians.filter(g => g.id !== guardianId) });
  };

  const handleEditExecutor = (executorId: string, updates: Partial<Executor>) => {
    updateData({
      executors: data.executors.map(e =>
        e.id === executorId ? { ...e, ...updates } : e
      )
    });
  };

  const handleEditGuardian = (guardianId: string, updates: Partial<Guardian>) => {
    updateData({
      guardians: data.guardians.map(g =>
        g.id === guardianId ? { ...g, ...updates } : g
      )
    });
  };

  const primaryExecutors = data.executors.filter(e => !e.alternateExecutor);
  const alternateExecutors = data.executors.filter(e => e.alternateExecutor);
  const primaryGuardians = data.guardians.filter(g => !g.alternateGuardian);
  const alternateGuardians = data.guardians.filter(g => g.alternateGuardian);

  const renderExecutorForm = (executor: Partial<Executor>, isNew: boolean) => {
    const updateFunction = isNew ? setNewExecutor : 
      (updates: Partial<Executor>) => handleEditExecutor(executor.id!, updates);

    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input
              value={executor.name || ''}
              onChange={(e) => updateFunction({ ...executor, name: e.target.value })}
              placeholder="Executor's full legal name"
            />
          </div>
          <div className="space-y-2">
            <Label>Relationship *</Label>
            <Select 
              value={executor.relationship || ''} 
              onValueChange={(value) => updateFunction({ ...executor, relationship: value })}
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
        </div>
        
        <div className="space-y-2">
          <Label>Address *</Label>
          <textarea
            value={executor.address || ''}
            onChange={(e) => updateFunction({ ...executor, address: e.target.value })}
            placeholder="Full residential address"
            className="min-h-20 w-full rounded-md border px-3 py-2 text-sm border-input"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Phone Number *</Label>
          <Input
            value={executor.phone || ''}
            onChange={(e) => updateFunction({ ...executor, phone: e.target.value })}
            placeholder="+971 50 123 4567"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Checkbox
            id={`alternate-executor-${isNew ? 'new' : executor.id}`}
            checked={executor.alternateExecutor || false}
            onCheckedChange={(checked) => updateFunction({ ...executor, alternateExecutor: !!checked })}
          />
          <Label htmlFor={`alternate-executor-${isNew ? 'new' : executor.id}`} className="text-sm">
            Make this an alternate executor
          </Label>
        </div>
      </div>
    );
  };

  const renderGuardianForm = (guardian: Partial<Guardian>, isNew: boolean) => {
    const updateFunction = isNew ? setNewGuardian : 
      (updates: Partial<Guardian>) => handleEditGuardian(guardian.id!, updates);

    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input
              value={guardian.name || ''}
              onChange={(e) => updateFunction({ ...guardian, name: e.target.value })}
              placeholder="Guardian's full legal name"
            />
          </div>
          <div className="space-y-2">
            <Label>Relationship *</Label>
            <Select 
              value={guardian.relationship || ''} 
              onValueChange={(value) => updateFunction({ ...guardian, relationship: value })}
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
        </div>
        
        <div className="space-y-2">
          <Label>Address *</Label>
          <textarea
            value={guardian.address || ''}
            onChange={(e) => updateFunction({ ...guardian, address: e.target.value })}
            placeholder="Full residential address"
            className="min-h-20 w-full rounded-md border px-3 py-2 text-sm border-input"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Phone Number *</Label>
          <Input
            value={guardian.phone || ''}
            onChange={(e) => updateFunction({ ...guardian, phone: e.target.value })}
            placeholder="+971 50 123 4567"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Checkbox
            id={`alternate-guardian-${isNew ? 'new' : guardian.id}`}
            checked={guardian.alternateGuardian || false}
            onCheckedChange={(checked) => updateFunction({ ...guardian, alternateGuardian: !!checked })}
          />
          <Label htmlFor={`alternate-guardian-${isNew ? 'new' : guardian.id}`} className="text-sm">
            Make this an alternate guardian
          </Label>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Guardians & Executors</h3>
          <p className="text-sm text-muted-foreground">
            Choose who will execute your will and care for minor children
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('executors')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'executors'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Gavel className="h-4 w-4" />
              Executors ({data.executors.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('guardians')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'guardians'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Baby className="h-4 w-4" />
              Guardians ({data.guardians.length})
            </div>
          </button>
        </div>
      </div>

      {/* Executors Tab */}
      {activeTab === 'executors' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-1">What is an Executor?</h4>
            <p className="text-sm text-blue-700">
              An executor is responsible for administering your will, distributing assets, 
              paying debts, and ensuring your wishes are carried out according to UAE law.
            </p>
          </div>

          {/* Primary Executors */}
          {primaryExecutors.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Primary Executors ({primaryExecutors.length})</h4>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsAddingExecutor(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Executor
                </Button>
              </div>

              <div className="grid gap-4">
                {primaryExecutors.map((executor) => {
                  const isEditing = editingExecutor === executor.id;

                  return (
                    <Card key={executor.id}>
                      <CardContent className="p-4">
                        {isEditing ? (
                          <div className="space-y-4">
                            {renderExecutorForm(executor, false)}
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => setEditingExecutor(null)}
                              >
                                Save Changes
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setEditingExecutor(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Gavel className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-medium">{executor.name}</h5>
                                  <Badge variant="secondary" className="text-xs">
                                    {executor.relationship}
                                  </Badge>
                                  <Badge variant="default" className="text-xs">
                                    Primary
                                  </Badge>
                                </div>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{executor.address}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    <span>{executor.phone}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingExecutor(executor.id)}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveExecutor(executor.id)}
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

          {/* Alternate Executors */}
          {alternateExecutors.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Alternate Executors ({alternateExecutors.length})</h4>
              <div className="grid gap-4">
                {alternateExecutors.map((executor) => (
                  <Card key={executor.id} className="border-dashed">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-gray-100">
                            <Gavel className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium">{executor.name}</h5>
                              <Badge variant="outline" className="text-xs">
                                {executor.relationship}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Alternate
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Will serve if primary executor cannot
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingExecutor(executor.id)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveExecutor(executor.id)}
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

          {/* Add Executor Form */}
          {isAddingExecutor && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-base">Add New Executor</CardTitle>
                <CardDescription>
                  Choose someone responsible to execute your will
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderExecutorForm(newExecutor, true)}
                <div className="flex gap-2">
                  <Button onClick={handleAddExecutor}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Executor
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsAddingExecutor(false);
                      setNewExecutor({
                        name: '',
                        relationship: '',
                        address: '',
                        phone: '',
                        alternateExecutor: false
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Initial State for Executors */}
          {data.executors.length === 0 && !isAddingExecutor && (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Gavel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No executors added yet</h3>
                <p className="text-gray-500 mb-4">
                  Add at least one executor to administer your will.
                </p>
                <Button onClick={() => setIsAddingExecutor(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Executor
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Add Executor Button */}
          {data.executors.length > 0 && !isAddingExecutor && (
            <Button 
              variant="dashed" 
              className="w-full h-12 border-dashed"
              onClick={() => setIsAddingExecutor(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Executor
            </Button>
          )}

          {/* Executor Validation Error */}
          {errors.executors && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{errors.executors}</p>
            </div>
          )}
        </div>
      )}

      {/* Guardians Tab */}
      {activeTab === 'guardians' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-amber-800 mb-1">About Guardians</h4>
            <p className="text-sm text-amber-700">
              Guardians are only needed if you have minor children (under 18). They will be 
              responsible for the care and upbringing of your children if both parents pass away.
            </p>
          </div>

          {/* Guardian content similar to executors */}
          {data.guardians.length === 0 && !isAddingGuardian ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Baby className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No guardians needed?</h3>
                <p className="text-gray-500 mb-4">
                  Only add guardians if you have minor children who need care.
                </p>
                <Button onClick={() => setIsAddingGuardian(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Guardian
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Render guardians similar to executors */}
              {data.guardians.map((guardian) => (
                <Card key={guardian.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Baby className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium">{guardian.name}</h5>
                            <Badge variant="secondary" className="text-xs">
                              {guardian.relationship}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{guardian.address}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{guardian.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingGuardian(guardian.id)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveGuardian(guardian.id)}
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
          )}

          {/* Add Guardian Form */}
          {isAddingGuardian && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-base">Add New Guardian</CardTitle>
                <CardDescription>
                  Choose someone to care for your minor children
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderGuardianForm(newGuardian, true)}
                <div className="flex gap-2">
                  <Button onClick={handleAddGuardian}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Guardian
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsAddingGuardian(false);
                      setNewGuardian({
                        name: '',
                        relationship: '',
                        address: '',
                        phone: '',
                        alternateGuardian: false
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}