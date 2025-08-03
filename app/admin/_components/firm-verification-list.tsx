/**
 * Firm Verification List Component
 * Shows firms based on verification status with action buttons
 */

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone, 
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FirmDetailsModal } from "./firm-details-modal";

interface Firm {
  id: string;
  name: string;
  licenseNumber: string;
  email: string;
  phone: string;
  establishedYear: number;
  address: any;
  practiceAreas: string[];
  barAssociation: string;
  isVerified: boolean;
  subscriptionStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface FirmVerificationListProps {
  status: 'pending' | 'verified' | 'rejected';
}

export function FirmVerificationList({ status }: FirmVerificationListProps) {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchFirms();
  }, [status]);

  const fetchFirms = async () => {
    try {
      const response = await fetch(`/api/admin/firms?status=${status}`);
      if (response.ok) {
        const data = await response.json();
        setFirms(data.firms);
      }
    } catch (error) {
      console.error('Failed to fetch firms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFirmAction = async (firmId: string, action: 'approve' | 'reject' | 'request_info', reason?: string) => {
    setActionLoading(firmId);
    try {
      const response = await fetch('/api/admin/firms/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firmId,
          action,
          reason,
        }),
      });

      if (response.ok) {
        // Refresh the list
        await fetchFirms();
      } else {
        console.error('Failed to update firm status');
      }
    } catch (error) {
      console.error('Error updating firm:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (firm: Firm) => {
    if (status === 'pending') {
      return (
        <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
          <Clock className="h-3 w-3 mr-1" />
          Pending Review
        </Badge>
      );
    } else if (status === 'verified') {
      return (
        <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="border-red-300 text-red-700 bg-red-50">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (firms.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No firms found
        </h3>
        <p className="text-gray-500">
          {status === 'pending' && "No firms are currently waiting for verification."}
          {status === 'verified' && "No firms have been verified yet."}
          {status === 'rejected' && "No firms have been rejected."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {firms.map((firm) => (
          <Card key={firm.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{firm.name}</h3>
                    {getStatusBadge(firm)}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    License: {firm.licenseNumber} • {firm.barAssociation}
                  </p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setSelectedFirm(firm)}>
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {status === 'pending' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleFirmAction(firm.id, 'approve')}
                          disabled={actionLoading === firm.id}
                          className="text-green-600"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Firm
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleFirmAction(firm.id, 'reject', 'Does not meet verification criteria')}
                          disabled={actionLoading === firm.id}
                          className="text-red-600"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Application
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleFirmAction(firm.id, 'request_info', 'Additional documentation required')}
                          disabled={actionLoading === firm.id}
                          className="text-amber-600"
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Request More Info
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    {firm.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    {firm.phone}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {firm.address?.city}, {firm.address?.emirate}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    Est. {firm.establishedYear}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-gray-600">
                    <span className="font-medium">Practice Areas:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {firm.practiceAreas.slice(0, 3).map((area, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                    {firm.practiceAreas.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{firm.practiceAreas.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-gray-500">
                <span>Applied: {formatDate(firm.createdAt)}</span>
                <span>Updated: {formatDate(firm.updatedAt)}</span>
              </div>

              {status === 'pending' && (
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={() => handleFirmAction(firm.id, 'approve')}
                    disabled={actionLoading === firm.id}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading === firm.id ? (
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleFirmAction(firm.id, 'reject', 'Does not meet verification criteria')}
                    disabled={actionLoading === firm.id}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => setSelectedFirm(firm)}
                    variant="outline"
                    size="sm"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedFirm && (
        <FirmDetailsModal
          firm={selectedFirm}
          isOpen={!!selectedFirm}
          onClose={() => setSelectedFirm(null)}
          onAction={handleFirmAction}
        />
      )}
    </>
  );
}