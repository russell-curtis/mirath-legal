/**
 * Clients View Component
 * Displays list of clients with filtering and management capabilities
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  Search, 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Globe
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  emiratesId?: string;
  nationality: string;
  visaStatus: 'residence' | 'investor' | 'golden' | 'employment' | 'visitor';
  address: {
    city: string;
    emirate: string;
    country: string;
  };
  joinedDate: string;
  totalMatters: number;
  activeMatters: number;
  lastActivity: string;
  avatar?: string;
  preferredLanguage: string;
}

interface ClientsViewProps {
  userId: string;
}

const visaStatusColors = {
  residence: 'bg-blue-100 text-blue-800',
  investor: 'bg-green-100 text-green-800',
  golden: 'bg-yellow-100 text-yellow-800',
  employment: 'bg-purple-100 text-purple-800',
  visitor: 'bg-gray-100 text-gray-800',
};

const visaStatusLabels = {
  residence: 'UAE Residence',
  investor: 'Investor Visa',
  golden: 'Golden Visa',
  employment: 'Employment Visa',
  visitor: 'Visitor Visa',
};

export function ClientsView({ userId }: ClientsViewProps) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: Fetch actual data from API
    // For now, using mock data
    const mockClients: Client[] = [
      {
        id: '1',
        name: 'Ahmed Al-Mansouri',
        email: 'ahmed.almansouri@email.com',
        phone: '+971 50 123 4567',
        emiratesId: '784-1234-5678901-2',
        nationality: 'Emirati',
        visaStatus: 'residence',
        address: {
          city: 'Dubai',
          emirate: 'Dubai',
          country: 'UAE',
        },
        joinedDate: '2024-01-15',
        totalMatters: 2,
        activeMatters: 1,
        lastActivity: '2024-01-25',
        preferredLanguage: 'en',
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+971 55 987 6543',
        emiratesId: '784-9876-5432109-8',
        nationality: 'British',
        visaStatus: 'golden',
        address: {
          city: 'Abu Dhabi',
          emirate: 'Abu Dhabi',
          country: 'UAE',
        },
        joinedDate: '2024-01-10',
        totalMatters: 1,
        activeMatters: 0,
        lastActivity: '2024-01-20',
        preferredLanguage: 'en',
      },
      {
        id: '3',
        name: 'Dr. Fatima Al-Zahra',
        email: 'fatima.alzahra@email.com',
        phone: '+971 50 555 7777',
        emiratesId: '784-5555-7777123-4',
        nationality: 'Lebanese',
        visaStatus: 'employment',
        address: {
          city: 'Sharjah',
          emirate: 'Sharjah',
          country: 'UAE',
        },
        joinedDate: '2024-01-22',
        totalMatters: 1,
        activeMatters: 1,
        lastActivity: '2024-01-26',
        preferredLanguage: 'ar',
      },
      {
        id: '4',
        name: 'Michael Chen',
        email: 'michael.chen@techcompany.com',
        phone: '+971 56 888 9999',
        emiratesId: '784-8888-9999000-1',
        nationality: 'Canadian',
        visaStatus: 'investor',
        address: {
          city: 'Dubai',
          emirate: 'Dubai',
          country: 'UAE',
        },
        joinedDate: '2024-01-18',
        totalMatters: 1,
        activeMatters: 1,
        lastActivity: '2024-01-24',
        preferredLanguage: 'en',
      },
      {
        id: '5',
        name: 'Priya Sharma',
        email: 'priya.sharma@email.com',
        phone: '+971 52 333 4444',
        emiratesId: '784-3333-4444555-6',
        nationality: 'Indian',
        visaStatus: 'residence',
        address: {
          city: 'Dubai',
          emirate: 'Dubai',
          country: 'UAE',
        },
        joinedDate: '2024-01-20',
        totalMatters: 1,
        activeMatters: 1,
        lastActivity: '2024-01-25',
        preferredLanguage: 'en',
      },
    ];

    setClients(mockClients);
    setLoading(false);
  }, [userId]);

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.emiratesId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search clients by name, email, or Emirates ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button onClick={() => router.push('/dashboard/clients/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Try adjusting your search term.'
                : 'Get started by adding your first client.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => router.push('/dashboard/clients/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Client
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card 
              key={client.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/clients/${client.id}`)}
            >
              <CardContent className="p-6">
                {/* Client Header */}
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={client.avatar} alt={client.name} />
                    <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {client.name}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {client.nationality}
                    </p>
                  </div>
                </div>

                {/* Client Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{client.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{client.address.city}, {client.address.emirate}</span>
                  </div>

                  {client.emiratesId && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Emirates ID:</span> {client.emiratesId}
                    </div>
                  )}
                </div>

                {/* Status and Stats */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={visaStatusColors[client.visaStatus]}>
                      {visaStatusLabels[client.visaStatus]}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {client.preferredLanguage === 'ar' ? 'العربية' : 'English'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">{client.totalMatters}</div>
                      <div className="text-gray-600">Total Matters</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">{client.activeMatters}</div>
                      <div className="text-gray-600">Active</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>Joined: {new Date(client.joinedDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FileText className="h-3 w-3" />
                    <span>Last activity: {new Date(client.lastActivity).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}