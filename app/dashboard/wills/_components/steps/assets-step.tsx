/**
 * Assets Step
 * Collects information about assets to be included in the will
 */

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Building, 
  Landmark, 
  Car, 
  Laptop, 
  DollarSign,
  Plus,
  Trash2,
  Edit3,
  MapPin
} from "lucide-react";
import { WillData } from "../will-creation-wizard";

interface AssetsStepProps {
  data: WillData;
  updateData: (updates: Partial<WillData>) => void;
  errors: Record<string, string>;
}

interface Asset {
  id: string;
  type: 'real_estate' | 'bank_account' | 'investment' | 'personal_property' | 'business' | 'digital';
  description: string;
  value: number;
  location: string;
  specificInstructions?: string;
}

const assetTypes = [
  { 
    value: 'real_estate', 
    label: 'Real Estate', 
    icon: Home,
    description: 'Properties, land, apartments',
    examples: 'Villa in Dubai, Apartment in DIFC, Land in Abu Dhabi'
  },
  { 
    value: 'bank_account', 
    label: 'Bank Accounts', 
    icon: Landmark,
    description: 'Savings, current, fixed deposits',
    examples: 'Emirates NBD Savings, ADCB Current Account'
  },
  { 
    value: 'investment', 
    label: 'Investments', 
    icon: DollarSign,
    description: 'Stocks, bonds, mutual funds',
    examples: 'DFM Shares, Government Bonds, Investment Portfolio'
  },
  { 
    value: 'personal_property', 
    label: 'Personal Property', 
    icon: Car,
    description: 'Vehicles, jewelry, art',
    examples: 'Mercedes S-Class, Rolex Collection, Art Pieces'
  },
  { 
    value: 'business', 
    label: 'Business Assets', 
    icon: Building,
    description: 'Company shares, partnerships',
    examples: 'LLC Ownership, Partnership Share, Business Equipment'
  },
  { 
    value: 'digital', 
    label: 'Digital Assets', 
    icon: Laptop,
    description: 'Cryptocurrency, online accounts',
    examples: 'Bitcoin Wallet, Domain Names, Social Media Accounts'
  },
];

export function AssetsStep({ data, updateData, errors }: AssetsStepProps) {
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    type: 'real_estate',
    description: '',
    value: 0,
    location: '',
    specificInstructions: ''
  });

  const handleAddAsset = () => {
    if (newAsset.description && newAsset.value && newAsset.location) {
      const asset: Asset = {
        id: Date.now().toString(),
        type: newAsset.type as Asset['type'],
        description: newAsset.description,
        value: newAsset.value,
        location: newAsset.location,
        specificInstructions: newAsset.specificInstructions
      };
      
      updateData({ assets: [...data.assets, asset] });
      setNewAsset({
        type: 'real_estate',
        description: '',
        value: 0,
        location: '',
        specificInstructions: ''
      });
      setIsAddingAsset(false);
    }
  };

  const handleRemoveAsset = (assetId: string) => {
    updateData({ assets: data.assets.filter(asset => asset.id !== assetId) });
  };

  const handleEditAsset = (assetId: string, updates: Partial<Asset>) => {
    updateData({
      assets: data.assets.map(asset =>
        asset.id === assetId ? { ...asset, ...updates } : asset
      )
    });
  };

  const getAssetIcon = (type: Asset['type']) => {
    const assetType = assetTypes.find(t => t.value === type);
    return assetType?.icon || Home;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalAssetValue = data.assets.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Assets & Property</h3>
            <p className="text-sm text-muted-foreground">
              List all assets you want to include in your will
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-lg font-semibold px-3 py-1">
          Total: {formatCurrency(totalAssetValue)}
        </Badge>
      </div>

      {/* Asset Type Selection Guide */}
      {data.assets.length === 0 && !isAddingAsset && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {assetTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card 
                key={type.value}
                className="cursor-pointer border-dashed hover:border-solid hover:border-primary transition-colors"
                onClick={() => {
                  setNewAsset({ ...newAsset, type: type.value as Asset['type'] });
                  setIsAddingAsset(true);
                }}
              >
                <CardContent className="p-4 text-center">
                  <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">{type.label}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Existing Assets */}
      {data.assets.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Your Assets ({data.assets.length})</h4>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsAddingAsset(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </div>

          <div className="grid gap-4">
            {data.assets.map((asset) => {
              const Icon = getAssetIcon(asset.type);
              const assetType = assetTypes.find(t => t.value === asset.type);
              const isEditing = editingAsset === asset.id;

              return (
                <Card key={asset.id}>
                  <CardContent className="p-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Asset Type</Label>
                            <Select 
                              value={asset.type} 
                              onValueChange={(value: Asset['type']) => 
                                handleEditAsset(asset.id, { type: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {assetTypes.map(type => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Estimated Value (AED)</Label>
                            <Input
                              type="number"
                              value={asset.value}
                              onChange={(e) => 
                                handleEditAsset(asset.id, { value: Number(e.target.value) })
                              }
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={asset.description}
                            onChange={(e) => 
                              handleEditAsset(asset.id, { description: e.target.value })
                            }
                            placeholder="Detailed description of the asset"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Location/Institution</Label>
                          <Input
                            value={asset.location}
                            onChange={(e) => 
                              handleEditAsset(asset.id, { location: e.target.value })
                            }
                            placeholder="Where the asset is located or held"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Special Instructions (Optional)</Label>
                          <textarea
                            value={asset.specificInstructions || ''}
                            onChange={(e) => 
                              handleEditAsset(asset.id, { specificInstructions: e.target.value })
                            }
                            placeholder="Any specific instructions for this asset"
                            className="min-h-20 w-full rounded-md border px-3 py-2 text-sm border-input"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => setEditingAsset(null)}
                          >
                            Save Changes
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingAsset(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium">{asset.description}</h5>
                              <Badge variant="secondary" className="text-xs">
                                {assetType?.label}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                <span className="font-medium text-foreground">
                                  {formatCurrency(asset.value)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{asset.location}</span>
                              </div>
                              {asset.specificInstructions && (
                                <p className="text-xs bg-gray-50 p-2 rounded">
                                  {asset.specificInstructions}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingAsset(asset.id)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveAsset(asset.id)}
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

      {/* Add New Asset Form */}
      {isAddingAsset && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-base">Add New Asset</CardTitle>
            <CardDescription>
              Provide details about the asset you want to include
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Asset Type *</Label>
                <Select 
                  value={newAsset.type} 
                  onValueChange={(value: Asset['type']) => 
                    setNewAsset({ ...newAsset, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estimated Value (AED) *</Label>
                <Input
                  type="number"
                  value={newAsset.value || ''}
                  onChange={(e) => setNewAsset({ ...newAsset, value: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Description *</Label>
              <Input
                value={newAsset.description || ''}
                onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                placeholder={assetTypes.find(t => t.value === newAsset.type)?.examples || 'Detailed description'}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Location/Institution *</Label>
              <Input
                value={newAsset.location || ''}
                onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                placeholder="e.g., Emirates NBD - Dubai Mall Branch, Jumeirah Village Circle"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Special Instructions (Optional)</Label>
              <textarea
                value={newAsset.specificInstructions || ''}
                onChange={(e) => setNewAsset({ ...newAsset, specificInstructions: e.target.value })}
                placeholder="Any specific instructions for handling this asset"
                className="min-h-20 w-full rounded-md border px-3 py-2 text-sm border-input"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleAddAsset}>
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsAddingAsset(false);
                  setNewAsset({
                    type: 'real_estate',
                    description: '',
                    value: 0,
                    location: '',
                    specificInstructions: ''
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Asset Button for Existing Assets */}
      {data.assets.length > 0 && !isAddingAsset && (
        <Button 
          variant="dashed" 
          className="w-full h-12 border-dashed"
          onClick={() => setIsAddingAsset(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Asset
        </Button>
      )}

      {/* Validation Error */}
      {errors.assets && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{errors.assets}</p>
        </div>
      )}

      {/* Information Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Asset Valuation Tips</h4>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• Use current market values for real estate</li>
              <li>• Include account numbers for bank accounts</li>
              <li>• Specify cryptocurrency wallet addresses</li>
              <li>• Update values annually or after major changes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}