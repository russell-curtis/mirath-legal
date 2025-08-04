/**
 * Matters View Component
 * Displays list of matters with filtering and management capabilities
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search,
  FolderOpen,
  User,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface Matter {
  id: string;
  matterNumber: string;
  title: string;
  clientName: string;
  matterType: 'simple_will' | 'complex_will' | 'business_succession' | 'trust_setup';
  status: 'intake' | 'draft' | 'review' | 'client_review' | 'complete' | 'registered';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedLawyer: string;
  createdAt: string;
  dueDate?: string;
  progress: number;
}

interface MattersViewProps {
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

export function MattersView({ userId }: MattersViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchMatters();
  }, [userId, statusFilter, typeFilter]);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMatters();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchMatters = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (typeFilter !== 'all') params.set('matterType', typeFilter);
      
      const response = await fetch(`/api/matters?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch matters');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setMatters(data.matters || []);
      } else {
        console.error('Failed to fetch matters:', data.error);
        // Fall back to empty array
        setMatters([]);
      }
    } catch (error) {
      console.error('Error fetching matters:', error);
      // Fall back to empty array
      setMatters([]);
    } finally {
      setLoading(false);
    }
  };

  // Since filtering is now handled server-side, we use matters directly
  const filteredMatters = matters;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
      case 'registered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'review':
      case 'client_review':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <FolderOpen className="h-4 w-4 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search matters, clients, or matter numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="intake">Intake</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="client_review">Client Review</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="registered">Registered</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="simple_will">Simple Will</SelectItem>
                <SelectItem value="complex_will">Complex Will</SelectItem>
                <SelectItem value="business_succession">Business Succession</SelectItem>
                <SelectItem value="trust_setup">Trust Setup</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button onClick={() => router.push('/dashboard/matters/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Matter
        </Button>
      </div>

      {/* Matters List */}
      <div className="space-y-4">
        {filteredMatters.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matters found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating your first matter.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                <Button onClick={() => router.push('/dashboard/matters/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Matter
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredMatters.map((matter) => (
            <Card 
              key={matter.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/matters/${matter.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(matter.status)}
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {matter.title}
                      </h3>
                      <Badge className={priorityColors[matter.priority]}>
                        {matter.priority}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Matter:</span>
                        <span>{matter.matterNumber}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{matter.clientName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created: {new Date(matter.createdAt).toLocaleDateString()}</span>
                      </div>
                      {matter.dueDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Due: {new Date(matter.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge className={statusColors[matter.status]}>
                        {matter.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">
                        {matterTypeLabels[matter.matterType]}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Assigned to: {matter.assignedLawyer}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-4 text-right">
                    <div className="text-sm text-gray-600 mb-2">Progress</div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${matter.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{matter.progress}%</span>
                    </div>
                    {matter.priority === 'urgent' && (
                      <div className="flex items-center gap-1 text-red-600 text-sm mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Urgent</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}