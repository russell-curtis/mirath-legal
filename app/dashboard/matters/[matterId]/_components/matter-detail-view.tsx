/**
 * Matter Detail View Component
 * Displays complete matter information with editing and status update capabilities
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Edit2, 
  Save, 
  X, 
  User, 
  Calendar, 
  Clock, 
  FileText,
  Building,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Trash2,
  MoreHorizontal,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Matter {
  id: string;
  matterNumber: string;
  title: string;
  description: string;
  clientName: string;
  clientEmail: string;
  clientId: string;
  matterType: 'simple_will' | 'complex_will' | 'business_succession' | 'trust_setup';
  status: 'intake' | 'draft' | 'review' | 'client_review' | 'complete' | 'registered';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedLawyer: string;
  assignedLawyerId: string;
  assignedLawyerEmail: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  lawFirmName: string;
  lawFirmId: string;
  progress: number;
}

interface MatterDetailViewProps {
  matterId: string;
  userId: string;
}

const statusColors = {
  intake: 'bg-blue-100 text-blue-800',
  draft: 'bg-yellow-100 text-yellow-800',
  review: 'bg-purple-100 text-purple-800',
  client_review: 'bg-orange-100 text-orange-800',
  complete: 'bg-green-100 text-green-800',
  registered: 'bg-green-100 text-green-800',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const matterTypeLabels = {
  simple_will: 'Simple Will',
  complex_will: 'Complex Will',
  business_succession: 'Business Succession',
  trust_setup: 'Trust Setup',
};

const statusFlow = [
  'intake',
  'draft', 
  'review',
  'client_review',
  'complete',
  'registered'
];

export function MatterDetailView({ matterId, userId }: MatterDetailViewProps) {
  const router = useRouter();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [editedMatter, setEditedMatter] = useState<Partial<Matter>>({});

  useEffect(() => {
    fetchMatter();
  }, [matterId]);

  const fetchMatter = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/matters/${matterId}`);
      const data = await response.json();

      if (data.success) {
        setMatter(data.matter);
        setEditedMatter(data.matter);
      } else {
        setError(data.error || 'Failed to load matter');
      }
    } catch (error) {
      console.error('Error fetching matter:', error);
      setError('Failed to load matter');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!matter) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/matters/${matterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedMatter),
      });

      const result = await response.json();

      if (result.success) {
        await fetchMatter(); // Refresh data
        setIsEditing(false);
      } else {
        setError(result.error || 'Failed to update matter');
      }
    } catch (error) {
      console.error('Error updating matter:', error);
      setError('Failed to update matter');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/matters/${matterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchMatter(); // Refresh data
      } else {
        setError(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this matter? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/matters/${matterId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        router.push('/dashboard/matters');
      } else {
        setError(result.error || 'Failed to delete matter');
      }
    } catch (error) {
      console.error('Error deleting matter:', error);
      setError('Failed to delete matter');
    } finally {
      setSaving(false);
    }
  };

  const getNextStatus = (currentStatus: string) => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;
  };

  const getPreviousStatus = (currentStatus: string) => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex > 0 ? statusFlow[currentIndex - 1] : null;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
      case 'registered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'review':
      case 'client_review':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!matter) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Matter not found</h3>
        <p className="text-gray-500 mb-4">
          {error || 'The requested matter could not be found or you do not have access to it.'}
        </p>
        <Button onClick={() => router.push('/dashboard/matters')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Matters
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard/matters')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Matters
          </Button>
          <div className="flex items-center gap-3">
            {getStatusIcon(matter.status)}
            <h1 className="text-3xl font-semibold tracking-tight">
              {matter.title}
            </h1>
            <Badge className={priorityColors[matter.priority]}>
              {matter.priority}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(true)}
              disabled={isSaving}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Matter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {/* Status Flow & Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Status & Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{matter.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${matter.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-4">
              <Badge className={statusColors[matter.status]} variant="secondary">
                {matter.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">
                {matterTypeLabels[matter.matterType]}
              </Badge>
            </div>

            {/* Status Action Buttons */}
            <div className="flex gap-2">
              {getPreviousStatus(matter.status) && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleStatusChange(getPreviousStatus(matter.status)!)}
                  disabled={isSaving}
                >
                  ← {getPreviousStatus(matter.status)?.replace('_', ' ')}
                </Button>
              )}
              {getNextStatus(matter.status) && (
                <Button 
                  size="sm"
                  onClick={() => handleStatusChange(getNextStatus(matter.status)!)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" />
                  )}
                  {getNextStatus(matter.status)?.replace('_', ' ')}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matter Details */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Matter Details</CardTitle>
            {isEditing && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedMatter(matter);
                  }}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Matter Number</Label>
              <p className="text-sm text-gray-600 font-mono">{matter.matterNumber}</p>
            </div>

            <div>
              <Label>Title</Label>
              {isEditing ? (
                <Input
                  value={editedMatter.title || ''}
                  onChange={(e) => setEditedMatter(prev => ({ ...prev, title: e.target.value }))}
                />
              ) : (
                <p className="text-sm text-gray-900">{matter.title}</p>
              )}
            </div>

            <div>
              <Label>Description</Label>
              {isEditing ? (
                <Textarea
                  value={editedMatter.description || ''}
                  onChange={(e) => setEditedMatter(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              ) : (
                <p className="text-sm text-gray-600">
                  {matter.description || 'No description provided'}
                </p>
              )}
            </div>

            <div>
              <Label>Priority</Label>
              {isEditing ? (
                <Select 
                  value={editedMatter.priority || matter.priority} 
                  onValueChange={(value) => setEditedMatter(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={priorityColors[matter.priority]} variant="secondary">
                  {matter.priority}
                </Badge>
              )}
            </div>

            <div>
              <Label>Due Date</Label>
              {isEditing ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editedMatter.dueDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {editedMatter.dueDate ? format(new Date(editedMatter.dueDate), "PPP") : "Select due date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={editedMatter.dueDate ? new Date(editedMatter.dueDate) : undefined}
                      onSelect={(date) => setEditedMatter(prev => ({ ...prev, dueDate: date?.toISOString() }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <p className="text-sm text-gray-600">
                  {matter.dueDate ? format(new Date(matter.dueDate), "PPP") : 'No due date set'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Client & Assignment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Client & Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Client</Label>
              <div className="text-sm">
                <p className="font-medium text-gray-900">{matter.clientName}</p>
                <p className="text-gray-600">{matter.clientEmail}</p>
              </div>
            </div>

            <div>
              <Label>Assigned Lawyer</Label>
              <div className="text-sm">
                <p className="font-medium text-gray-900">{matter.assignedLawyer}</p>
                <p className="text-gray-600">{matter.assignedLawyerEmail}</p>
              </div>
            </div>

            <div>
              <Label>Law Firm</Label>
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{matter.lawFirmName}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Created</Label>
                  <p className="text-gray-600">
                    {format(new Date(matter.createdAt), "PPP")}
                  </p>
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <p className="text-gray-600">
                    {format(new Date(matter.updatedAt), "PPP")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Section - Placeholder for future implementation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Associated Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p>Document management coming soon</p>
            <p className="text-sm">Generated wills and documents will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}