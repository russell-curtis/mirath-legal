/**
 * Wills View Component
 * Displays list of wills with filtering and management capabilities
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
  FileText,
  User,
  Calendar,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  Bot,
  Download,
  Eye
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Will {
  id: string;
  matterNumber: string;
  testatorName: string;
  willType: 'simple' | 'complex' | 'business_succession' | 'digital_assets';
  status: 'draft' | 'under_review' | 'client_review' | 'final' | 'registered';
  language: 'en' | 'ar';
  difcCompliant: boolean;
  difcRegistrationNumber?: string;
  createdAt: string;
  updatedAt: string;
  assignedLawyer: string;
  completeness: number;
  aiGenerated: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

interface WillsViewProps {
  userId: string;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  client_review: 'bg-blue-100 text-blue-800',
  final: 'bg-green-100 text-green-800',
  registered: 'bg-green-100 text-green-800',
};

const willTypeLabels = {
  simple: 'Simple Will',
  complex: 'Complex Will',
  business_succession: 'Business Succession',
  digital_assets: 'Digital Assets Will',
};

const riskColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

export function WillsView({ userId }: WillsViewProps) {
  const router = useRouter();
  const [wills, setWills] = useState<Will[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    // TODO: Fetch actual data from API
    // For now, using mock data
    const mockWills: Will[] = [
      {
        id: '1',
        matterNumber: 'ML-2024-001',
        testatorName: 'Ahmed Al-Mansouri',
        willType: 'complex',
        status: 'under_review',
        language: 'en',
        difcCompliant: true,
        difcRegistrationNumber: 'DIFC-2024-001',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-25',
        assignedLawyer: 'Sarah Johnson',
        completeness: 95,
        aiGenerated: true,
        riskLevel: 'low',
      },
      {
        id: '2',
        matterNumber: 'ML-2024-002',
        testatorName: 'Michael Johnson',
        willType: 'simple',
        status: 'registered',
        language: 'en',
        difcCompliant: true,
        difcRegistrationNumber: 'DIFC-2024-002',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-20',
        assignedLawyer: 'Ahmed Hassan',
        completeness: 100,
        aiGenerated: true,
        riskLevel: 'low',
      },
      {
        id: '3',
        matterNumber: 'ML-2024-003',
        testatorName: 'Chen Holdings LLC',
        willType: 'business_succession',
        status: 'draft',
        language: 'en',
        difcCompliant: false,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-22',
        assignedLawyer: 'Sarah Johnson',
        completeness: 60,
        aiGenerated: false,
        riskLevel: 'high',
      },
      {
        id: '4',
        matterNumber: 'ML-2024-004',
        testatorName: 'Dr. Fatima Al-Zahra',
        willType: 'complex',
        status: 'client_review',
        language: 'ar',
        difcCompliant: true,
        createdAt: '2024-01-22',
        updatedAt: '2024-01-24',
        assignedLawyer: 'Ahmed Hassan',
        completeness: 85,
        aiGenerated: true,
        riskLevel: 'medium',
      },
      {
        id: '5',
        matterNumber: 'ML-2024-005',
        testatorName: 'Tech Entrepreneur Smith',
        willType: 'digital_assets',
        status: 'final',
        language: 'en',
        difcCompliant: true,
        createdAt: '2024-01-18',
        updatedAt: '2024-01-26',
        assignedLawyer: 'Sarah Johnson',
        completeness: 100,
        aiGenerated: true,
        riskLevel: 'low',
      },
    ];

    setWills(mockWills);
    setLoading(false);
  }, [userId]);

  const filteredWills = wills.filter(will => {
    const matchesSearch = will.testatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         will.matterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         will.difcRegistrationNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || will.status === statusFilter;
    const matchesType = typeFilter === 'all' || will.willType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'registered':
        return <Shield className="h-4 w-4 text-green-600" />;
      case 'final':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'under_review':
      case 'client_review':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
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
              placeholder="Search wills by testator, matter, or DIFC number..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="client_review">Client Review</SelectItem>
                <SelectItem value="final">Final</SelectItem>
                <SelectItem value="registered">Registered</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="simple">Simple Will</SelectItem>
                <SelectItem value="complex">Complex Will</SelectItem>
                <SelectItem value="business_succession">Business Succession</SelectItem>
                <SelectItem value="digital_assets">Digital Assets</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button onClick={() => router.push('/dashboard/wills/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Will
        </Button>
      </div>

      {/* Wills List */}
      <div className="space-y-4">
        {filteredWills.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No wills found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating your first will.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                <Button onClick={() => router.push('/dashboard/wills/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Will
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredWills.map((will) => (
            <Card 
              key={will.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => console.log(`View will ${will.id} - detail page coming soon`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(will.status)}
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {will.testatorName} - {willTypeLabels[will.willType]}
                      </h3>
                      {will.aiGenerated && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Bot className="h-3 w-3" />
                          AI Generated
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Matter:</span>
                        <span>{will.matterNumber}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{will.assignedLawyer}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Updated: {new Date(will.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Language: {will.language === 'ar' ? 'العربية' : 'English'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <Badge className={statusColors[will.status]}>
                        {will.status.replace('_', ' ')}
                      </Badge>
                      
                      {will.difcCompliant ? (
                        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          DIFC Compliant
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Needs Review
                        </Badge>
                      )}
                      
                      <Badge className={riskColors[will.riskLevel]}>
                        {will.riskLevel} risk
                      </Badge>
                      
                      {will.difcRegistrationNumber && (
                        <Badge variant="outline">
                          {will.difcRegistrationNumber}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Completeness:</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${will.completeness}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{will.completeness}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`Preview will ${will.id} - route coming soon`);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement download functionality
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
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