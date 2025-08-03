/**
 * Admin Stats Component
 * Analytics and metrics for the admin dashboard
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  Building2,
  Calendar,
  Users,
  FileText
} from "lucide-react";

export function AdminStats() {
  const [stats, setStats] = useState({
    registrationTrend: {
      thisWeek: 0,
      lastWeek: 0,
      change: 0,
    },
    averageVerificationTime: "1.2 days",
    verificationRate: 85,
    activeTrials: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      setStats({
        registrationTrend: {
          thisWeek: 12,
          lastWeek: 8,
          change: 50,
        },
        averageVerificationTime: "1.2 days",
        verificationRate: 85,
        activeTrials: 7,
        recentActivity: [
          {
            id: 1,
            type: "registration",
            firmName: "Dubai Legal Associates",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 2,
            type: "verification",
            firmName: "Emirates Law Firm",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            action: "approved",
          },
          {
            id: 3,
            type: "registration",
            firmName: "Abu Dhabi Legal Group",
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 4,
            type: "verification",
            firmName: "Sharjah Law Center",
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            action: "rejected",
          },
        ],
      });
      setLoading(false);
    }, 1000);
  }, []);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registration Trend</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.registrationTrend.thisWeek}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.registrationTrend.change > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={stats.registrationTrend.change > 0 ? "text-green-600" : "text-red-600"}>
                {stats.registrationTrend.change > 0 ? "+" : ""}{stats.registrationTrend.change}%
              </span>
              <span className="ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Verification Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageVerificationTime}</div>
            <p className="text-xs text-muted-foreground">
              Target: &lt; 2 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verification Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verificationRate}%</div>
            <p className="text-xs text-muted-foreground">
              Approval rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trials</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTrials}</div>
            <p className="text-xs text-muted-foreground">
              30-day trial period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest firm registrations and verification actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {activity.type === "registration" ? (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                      <Building2 className="h-4 w-4 text-blue-600" />
                    </div>
                  ) : (
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      activity.action === "approved" ? "bg-green-100" : "bg-red-100"
                    }`}>
                      {activity.action === "approved" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  )}
                  
                  <div>
                    <p className="font-medium">{activity.firmName}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.type === "registration" 
                        ? "New firm registration" 
                        : `Verification ${activity.action}`
                      }
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                  {activity.type === "verification" && (
                    <Badge 
                      variant="outline" 
                      className={activity.action === "approved" 
                        ? "border-green-300 text-green-700" 
                        : "border-red-300 text-red-700"
                      }
                    >
                      {activity.action}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Verification Performance</CardTitle>
            <CardDescription>
              Key metrics for the verification process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Applications this month</span>
              <span className="text-lg font-bold">24</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Approved</span>
              <span className="text-lg font-bold text-green-600">20</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Rejected</span>
              <span className="text-lg font-bold text-red-600">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pending</span>
              <span className="text-lg font-bold text-amber-600">1</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Practice Area Distribution</CardTitle>
            <CardDescription>
              Most common practice areas among registered firms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Estate Planning</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 rounded">
                  <div className="w-4/5 h-2 bg-blue-600 rounded"></div>
                </div>
                <span className="text-sm font-medium">80%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Corporate Law</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 rounded">
                  <div className="w-3/5 h-2 bg-green-600 rounded"></div>
                </div>
                <span className="text-sm font-medium">60%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Family Law</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 rounded">
                  <div className="w-2/5 h-2 bg-purple-600 rounded"></div>
                </div>
                <span className="text-sm font-medium">40%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Real Estate</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 rounded">
                  <div className="w-1/5 h-2 bg-amber-600 rounded"></div>
                </div>
                <span className="text-sm font-medium">20%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}