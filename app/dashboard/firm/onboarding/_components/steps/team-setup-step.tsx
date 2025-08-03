/**
 * Team Setup Step
 * Add team members and configure roles
 */

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, Mail, User, Shield } from "lucide-react";
import { FirmOnboardingData } from "../firm-onboarding-wizard";

interface TeamSetupStepProps {
  data: FirmOnboardingData;
  updateData: (updates: Partial<FirmOnboardingData>) => void;
  errors: Record<string, string>;
}

const roleOptions = [
  {
    value: 'admin' as const,
    label: 'Admin',
    description: 'Full access to all features and firm management',
    color: 'bg-red-100 text-red-700 border-red-300',
  },
  {
    value: 'senior_lawyer' as const,
    label: 'Senior Lawyer',
    description: 'Can manage matters, clients, and junior lawyers',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
  },
  {
    value: 'lawyer' as const,
    label: 'Lawyer',
    description: 'Can handle assigned matters and create wills',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  {
    value: 'support' as const,
    label: 'Support Staff',
    description: 'Limited access for administrative tasks',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
  },
];

export function TeamSetupStep({ data, updateData, errors }: TeamSetupStepProps) {
  const addTeamMember = () => {
    const newMember = {
      id: Date.now().toString(),
      name: '',
      email: '',
      role: 'lawyer' as const,
    };
    
    updateData({
      teamMembers: [...data.teamMembers, newMember]
    });
  };

  const removeTeamMember = (id: string) => {
    updateData({
      teamMembers: data.teamMembers.filter(member => member.id !== id)
    });
  };

  const updateTeamMember = (id: string, updates: Partial<typeof data.teamMembers[0]>) => {
    updateData({
      teamMembers: data.teamMembers.map(member => 
        member.id === id ? { ...member, ...updates } : member
      )
    });
  };

  const getRoleInfo = (role: string) => {
    return roleOptions.find(r => r.value === role) || roleOptions[2];
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Users className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Set Up Your Team</h2>
        <p className="text-muted-foreground">
          Add your team members and assign appropriate roles and permissions.
        </p>
      </div>

      {/* Role Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Roles & Permissions
          </CardTitle>
          <CardDescription>
            Understanding different access levels for your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {roleOptions.map(role => (
              <div key={role.value} className="flex items-start gap-3 p-3 border rounded-lg">
                <Badge className={role.color}>
                  {role.label}
                </Badge>
                <div>
                  <p className="text-sm font-medium">{role.label}</p>
                  <p className="text-xs text-muted-foreground">{role.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Add your colleagues and assign their roles
              </CardDescription>
            </div>
            <Button onClick={addTeamMember} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.teamMembers.map((member, index) => {
            const roleInfo = getRoleInfo(member.role);
            const isFirstMember = index === 0;
            
            return (
              <div key={member.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      Team Member {index + 1}
                      {isFirstMember && (
                        <Badge variant="outline" className="ml-2">Primary Contact</Badge>
                      )}
                    </span>
                  </div>
                  
                  {!isFirstMember && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTeamMember(member.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${member.id}`}>Full Name *</Label>
                    <Input
                      id={`name-${member.id}`}
                      value={member.name}
                      onChange={(e) => updateTeamMember(member.id, { name: e.target.value })}
                      placeholder="Enter full name"
                      className={errors[`member_${index}_name`] ? 'border-red-500' : ''}
                    />
                    {errors[`member_${index}_name`] && (
                      <p className="text-sm text-red-600">{errors[`member_${index}_name`]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`email-${member.id}`}>Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`email-${member.id}`}
                        type="email"
                        value={member.email}
                        onChange={(e) => updateTeamMember(member.id, { email: e.target.value })}
                        placeholder="email@lawfirm.com"
                        className={`pl-10 ${errors[`member_${index}_email`] ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors[`member_${index}_email`] && (
                      <p className="text-sm text-red-600">{errors[`member_${index}_email`]}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`role-${member.id}`}>Role *</Label>
                    <select
                      id={`role-${member.id}`}
                      value={member.role}
                      onChange={(e) => updateTeamMember(member.id, { 
                        role: e.target.value as typeof member.role 
                      })}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                      disabled={isFirstMember} // First member must be admin
                    >
                      {roleOptions.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    {isFirstMember && (
                      <p className="text-xs text-muted-foreground">
                        Primary contact must be an admin
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`barNumber-${member.id}`}>Bar Number (Optional)</Label>
                    <Input
                      id={`barNumber-${member.id}`}
                      value={member.barNumber || ''}
                      onChange={(e) => updateTeamMember(member.id, { barNumber: e.target.value })}
                      placeholder="Professional bar number"
                    />
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={roleInfo.color}>
                      {roleInfo.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {roleInfo.description}
                  </p>
                </div>
              </div>
            );
          })}

          {errors.teamMembers && (
            <p className="text-sm text-red-600">{errors.teamMembers}</p>
          )}
        </CardContent>
      </Card>

      {/* Team Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Team Summary</CardTitle>
          <CardDescription>
            Overview of your team structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {roleOptions.map(role => {
              const count = data.teamMembers.filter(member => member.role === role.value).length;
              return (
                <div key={role.value} className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{count}</div>
                  <div className="text-sm font-medium">{role.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {count === 1 ? 'member' : 'members'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Users className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Team Invitations</h4>
                <p className="text-sm text-blue-800">
                  After completing setup, invitation emails will be sent to all team members 
                  with instructions to access the platform.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}