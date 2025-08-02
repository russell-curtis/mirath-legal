/**
 * Law Firm Dashboard Component
 * Displays key metrics and overview for law firm practice management
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  FileText, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  FolderOpen,
  Plus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalMatters: number;
  activeMatters: number;
  completedWills: number;
  pendingReviews: number;
  monthlyRevenue: number;
  totalClients: number;
  difcRegistrations: number;
  complianceAlerts: number;
}

interface RecentActivity {
  id: string;
  type: 'matter_created' | 'will_completed' | 'document_generated' | 'client_added';
  title: string;
  description: string;
  timestamp: string;
  priority?: 'high' | 'medium' | 'low';
}

interface LawFirmDashboardProps {
  userId: string;
}

export function LawFirmDashboard({ userId }: LawFirmDashboardProps) {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch actual data from API
    // For now, using mock data
    const mockStats: DashboardStats = {
      totalMatters: 42,
      activeMatters: 18,
      completedWills: 24,
      pendingReviews: 6,
      monthlyRevenue: 125000,
      totalClients: 38,
      difcRegistrations: 20,
      complianceAlerts: 2,
    };

    const mockActivity: RecentActivity[] = [
      {
        id: '1',
        type: 'matter_created',
        title: 'New Estate Planning Matter',
        description: 'Created for Ahmed Al-Mansouri - Complex Will',
        timestamp: '2 hours ago',
        priority: 'medium',
      },
      {
        id: '2',
        type: 'will_completed',
        title: 'Will Document Generated',
        description: 'DIFC-compliant will ready for Sarah Johnson',
        timestamp: '4 hours ago',
        priority: 'high',
      },
      {
        id: '3',
        type: 'document_generated',
        title: 'AI Document Analysis',
        description: 'Compliance check completed for Matter #2024-015',
        timestamp: '6 hours ago',
      },
      {
        id: '4',
        type: 'client_added',
        title: 'New Client Onboarded',
        description: 'Michael Chen - Business Succession Planning',
        timestamp: '1 day ago',
      },
    ];

    setStats(mockStats);
    setRecentActivity(mockActivity);
    setLoading(false);
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Matters</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeMatters}</div>
            <p className="text-xs text-muted-foreground">
              of {stats?.totalMatters} total matters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Wills</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedWills}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.difcRegistrations} DIFC registered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Active client base
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {stats?.monthlyRevenue?.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Items and Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Actions
            </CardTitle>
            <CardDescription>
              Items requiring your attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm">Pending Reviews</span>
              </div>
              <Badge variant="outline">{stats?.pendingReviews}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Compliance Alerts</span>
              </div>
              <Badge variant="destructive">{stats?.complianceAlerts}</Badge>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/dashboard/wills')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Review Pending Wills
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/dashboard/wills/new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Will
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates across your practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {activity.type === 'matter_created' && <FolderOpen className="h-4 w-4 text-blue-500" />}
                    {activity.type === 'will_completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {activity.type === 'document_generated' && <FileText className="h-4 w-4 text-purple-500" />}
                    {activity.type === 'client_added' && <Users className="h-4 w-4 text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{activity.title}</p>
                      {activity.priority === 'high' && (
                        <Badge variant="destructive" className="text-xs">High</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Overview</CardTitle>
          <CardDescription>
            Key performance indicators for your estate planning practice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">95%</div>
              <div className="text-sm text-muted-foreground">DIFC Compliance Rate</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">18 days</div>
              <div className="text-sm text-muted-foreground">Avg. Matter Completion</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">4.8/5</div>
              <div className="text-sm text-muted-foreground">Client Satisfaction</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}