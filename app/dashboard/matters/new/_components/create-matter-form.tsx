/**
 * Create Matter Form Component
 * Form to create new legal matters with client selection and matter details
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CalendarIcon, 
  Loader2, 
  ArrowLeft, 
  User, 
  FileText, 
  AlertTriangle,
  CheckCircle 
} from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  email: string;
  emiratesId?: string;
}

interface Lawyer {
  id: string;
  name: string;
  email: string;
}

interface CreateMatterFormProps {
  userId: string;
}

export function CreateMatterForm({ userId }: CreateMatterFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    matterType: '',
    priority: 'normal',
    assignedLawyerId: userId,
    dueDate: undefined as Date | undefined,
  });

  // Load clients and lawyers on component mount
  useEffect(() => {
    fetchClientsAndLawyers();
  }, []);

  const fetchClientsAndLawyers = async () => {
    try {
      setLoadingData(true);
      
      // Fetch clients (users with userType 'client')
      const clientsResponse = await fetch('/api/users?userType=client');
      const clientsData = await clientsResponse.json();
      
      // Fetch lawyers (users with userType 'lawyer')
      const lawyersResponse = await fetch('/api/users?userType=lawyer');
      const lawyersData = await lawyersResponse.json();
      
      if (clientsData.success) {
        setClients(clientsData.users || []);
      }
      
      if (lawyersData.success) {
        setLawyers(lawyersData.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load clients and lawyers');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.clientId || !formData.matterType) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/matters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          clientId: formData.clientId,
          matterType: formData.matterType,
          priority: formData.priority,
          assignedLawyerId: formData.assignedLawyerId,
          dueDate: formData.dueDate?.toISOString(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        // Redirect to matter detail page after short delay
        setTimeout(() => {
          router.push(`/dashboard/matters/${result.matter.id}`);
        }, 2000);
      } else {
        setError(result.error || 'Failed to create matter');
      }
    } catch (error) {
      console.error('Error creating matter:', error);
      setError('Failed to create matter. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | Date | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (success) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Matter Created Successfully!
          </h3>
          <p className="text-gray-600 mb-4">
            Redirecting to matter details...
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Matters
      </Button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Matter Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Matter Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Estate Planning for Smith Family"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the matter and key requirements..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="matterType">Matter Type *</Label>
                <Select 
                  value={formData.matterType} 
                  onValueChange={(value) => handleInputChange('matterType', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select matter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple_will">Simple Will</SelectItem>
                    <SelectItem value="complex_will">Complex Will</SelectItem>
                    <SelectItem value="business_succession">Business Succession</SelectItem>
                    <SelectItem value="trust_setup">Trust Setup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => handleInputChange('priority', value)}
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
              </div>

              <div>
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dueDate ? format(formData.dueDate, "PPP") : "Select due date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dueDate}
                      onSelect={(date) => handleInputChange('dueDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Client and Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Client & Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingData ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading clients and lawyers...</span>
                </div>
              ) : (
                <>
                  <div>
                    <Label htmlFor="clientId">Client *</Label>
                    <Select 
                      value={formData.clientId} 
                      onValueChange={(value) => handleInputChange('clientId', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-sm text-gray-500">{client.email}</div>
                              {client.emiratesId && (
                                <div className="text-xs text-gray-400">ID: {client.emiratesId}</div>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="assignedLawyerId">Assigned Lawyer</Label>
                    <Select 
                      value={formData.assignedLawyerId} 
                      onValueChange={(value) => handleInputChange('assignedLawyerId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select lawyer" />
                      </SelectTrigger>
                      <SelectContent>
                        {lawyers.map((lawyer) => (
                          <SelectItem key={lawyer.id} value={lawyer.id}>
                            <div>
                              <div className="font-medium">{lawyer.name}</div>
                              <div className="text-sm text-gray-500">{lawyer.email}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Form Status */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || loadingData}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Matter...
              </>
            ) : (
              'Create Matter'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}