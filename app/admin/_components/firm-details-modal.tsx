/**
 * Firm Details Modal
 * Detailed view of firm application with verification actions
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Users,
  Scale
} from "lucide-react";

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

interface FirmDetailsModalProps {
  firm: Firm;
  isOpen: boolean;
  onClose: () => void;
  onAction: (firmId: string, action: 'approve' | 'reject' | 'request_info', reason?: string) => void;
}

export function FirmDetailsModal({ firm, isOpen, onClose, onAction }: FirmDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [rejectionReason, setRejectionReason] = useState("");
  const [requestInfoReason, setRequestInfoReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleAction = async (action: 'approve' | 'reject' | 'request_info') => {
    setActionLoading(true);
    let reason = '';
    
    if (action === 'reject' && rejectionReason.trim()) {
      reason = rejectionReason;
    } else if (action === 'request_info' && requestInfoReason.trim()) {
      reason = requestInfoReason;
    }
    
    await onAction(firm.id, action, reason);
    setActionLoading(false);
    onClose();
  };

  const formatAddress = () => {
    if (!firm.address) return 'Address not provided';
    const { street, city, emirate, poBox, country } = firm.address;
    return `${street}, ${city}, ${emirate}${poBox ? `, ${poBox}` : ''}, ${country}`;
  };

  const getStatusInfo = () => {
    if (firm.isVerified) {
      return {
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-300",
        icon: CheckCircle,
        label: "Verified"
      };
    } else if (firm.subscriptionStatus === 'pending_verification') {
      return {
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-300",
        icon: Clock,
        label: "Pending Verification"
      };
    } else {
      return {
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-300",
        icon: XCircle,
        label: "Rejected"
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-blue-600" />
              <div>
                <DialogTitle className="text-xl">{firm.name}</DialogTitle>
                <DialogDescription>
                  License: {firm.licenseNumber}
                </DialogDescription>
              </div>
            </div>
            <Badge className={`${statusInfo.color} ${statusInfo.bg} ${statusInfo.border}`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Firm Details</TabsTrigger>
            <TabsTrigger value="legal">Legal Info</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Firm Name</Label>
                  <p className="text-lg font-semibold">{firm.name}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Established Year</Label>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {firm.establishedYear}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Practice Areas</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {firm.practiceAreas.map((area, index) => (
                      <Badge key={index} variant="outline">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Application Date</Label>
                  <p>{new Date(firm.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                  <p>{new Date(firm.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Subscription Status</Label>
                  <p className="capitalize">{firm.subscriptionStatus.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="legal" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">License Number</Label>
                  <p className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-gray-400" />
                    {firm.licenseNumber}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Bar Association</Label>
                  <p>{firm.barAssociation}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Verification Status</Label>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${statusInfo.bg} ${statusInfo.color}`}>
                    <StatusIcon className="h-4 w-4" />
                    {statusInfo.label}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Verification Checklist</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>License number format valid</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Bar association recognized</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <span>Manual verification pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Primary Email</Label>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {firm.email}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone Number</Label>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {firm.phone}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Office Address</Label>
                  <p className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>{formatAddress()}</span>
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            {!firm.isVerified && firm.subscriptionStatus === 'pending_verification' && (
              <div className="space-y-6">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-medium text-amber-800 mb-2">Verification Actions</h4>
                  <p className="text-sm text-amber-700">
                    Review the firm's credentials and take appropriate action.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <h5 className="font-medium text-green-800 mb-2">Approve Application</h5>
                    <p className="text-sm text-green-700 mb-3">
                      Grant full platform access and start trial period.
                    </p>
                    <Button
                      onClick={() => handleAction('approve')}
                      disabled={actionLoading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Firm
                    </Button>
                  </div>

                  <div className="p-4 border border-amber-200 rounded-lg bg-amber-50">
                    <h5 className="font-medium text-amber-800 mb-2">Request Information</h5>
                    <p className="text-sm text-amber-700 mb-3">
                      Ask for additional documentation or clarification.
                    </p>
                    <Textarea
                      placeholder="Specify what information is needed..."
                      value={requestInfoReason}
                      onChange={(e) => setRequestInfoReason(e.target.value)}
                      className="mb-2"
                      rows={3}
                    />
                    <Button
                      onClick={() => handleAction('request_info')}
                      disabled={actionLoading || !requestInfoReason.trim()}
                      variant="outline"
                      className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Request Info
                    </Button>
                  </div>

                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h5 className="font-medium text-red-800 mb-2">Reject Application</h5>
                    <p className="text-sm text-red-700 mb-3">
                      Deny access due to failed verification criteria.
                    </p>
                    <Textarea
                      placeholder="Reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="mb-2"
                      rows={3}
                    />
                    <Button
                      onClick={() => handleAction('reject')}
                      disabled={actionLoading || !rejectionReason.trim()}
                      variant="outline"
                      className="w-full border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Application
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {firm.isVerified && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-green-800">Firm Verified</h4>
                <p className="text-sm text-green-700">
                  This firm has been successfully verified and has full platform access.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}