/**
 * Document Management Component
 * Comprehensive document management with preview, download, and version control
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Upload, 
  Search,
  Filter,
  History,
  MoreHorizontal,
  Calendar,
  User,
  FileCheck,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  FileIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Document {
  id: string;
  willId?: string;
  documentType: string;
  title: string;
  content?: any;
  metadata?: any;
  version: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  matter?: {
    id: string;
    title: string;
  };
}

interface DocumentManagementProps {
  userId: string;
}

export function DocumentManagement({ userId }: DocumentManagementProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Load documents
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) ||
                         doc.documentType.toLowerCase().includes(search.toLowerCase());
    const matchesType = documentTypeFilter === 'all' || doc.documentType === documentTypeFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Group documents by type
  const documentsByType = filteredDocuments.reduce((acc, doc) => {
    const type = doc.documentType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  const handleDownload = async (document: Document) => {
    try {
      if (document.willId && document.documentType === 'will_pdf') {
        // Download generated will PDF
        window.open(`/api/wills/${document.willId}/pdf?download=true`, '_blank');
      } else {
        // Download other documents
        window.open(`/api/documents/${document.id}?download=true`, '_blank');
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handlePreview = async (document: Document) => {
    setSelectedDocument(document);
    setPreviewOpen(true);
  };

  const handleDelete = async (document: Document) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await fetch(`/api/documents/${document.id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setDocuments(prev => prev.filter(doc => doc.id !== document.id));
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const getDocumentIcon = (documentType: string) => {
    switch (documentType) {
      case 'will_pdf':
      case 'generated_will':
        return <FileCheck className="h-5 w-5 text-green-600" />;
      case 'supporting_document':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'client_upload':
        return <Upload className="h-5 w-5 text-purple-600" />;
      default:
        return <FileIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'generated':
        return <Badge variant="default">Generated</Badge>;
      case 'uploaded':
        return <Badge variant="secondary">Uploaded</Badge>;
      case 'reviewed':
        return <Badge className="bg-green-100 text-green-800">Reviewed</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading documents...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Document Library
          </CardTitle>
          <CardDescription>
            {documents.length} documents • {Object.keys(documentsByType).length} categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="will_pdf">Will PDFs</SelectItem>
                <SelectItem value="generated_will">Generated Wills</SelectItem>
                <SelectItem value="supporting_document">Supporting Documents</SelectItem>
                <SelectItem value="client_upload">Client Uploads</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="generated">Generated</SelectItem>
                <SelectItem value="uploaded">Uploaded</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadDocuments}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Tabs by Type */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Documents ({filteredDocuments.length})</TabsTrigger>
          {Object.entries(documentsByType).map(([type, docs]) => (
            <TabsTrigger key={type} value={type}>
              {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} ({docs.length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <DocumentList 
            documents={filteredDocuments} 
            onDownload={handleDownload}
            onPreview={handlePreview}
            onDelete={handleDelete}
            getDocumentIcon={getDocumentIcon}
            getStatusBadge={getStatusBadge}
            formatFileSize={formatFileSize}
          />
        </TabsContent>

        {Object.entries(documentsByType).map(([type, docs]) => (
          <TabsContent key={type} value={type} className="space-y-4">
            <DocumentList 
              documents={docs} 
              onDownload={handleDownload}
              onPreview={handlePreview}
              onDelete={handleDelete}
              getDocumentIcon={getDocumentIcon}
              getStatusBadge={getStatusBadge}
              formatFileSize={formatFileSize}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Document Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDocument && getDocumentIcon(selectedDocument.documentType)}
              {selectedDocument?.title}
            </DialogTitle>
            <DialogDescription>
              Document preview and details
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <DocumentPreview document={selectedDocument} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Document List Component
function DocumentList({ 
  documents, 
  onDownload, 
  onPreview, 
  onDelete, 
  getDocumentIcon, 
  getStatusBadge, 
  formatFileSize 
}: {
  documents: Document[];
  onDownload: (doc: Document) => void;
  onPreview: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  getDocumentIcon: (type: string) => JSX.Element;
  getStatusBadge: (status: string) => JSX.Element;
  formatFileSize: (bytes: number | undefined) => string;
}) {
  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">No documents match your current filters.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((document) => (
        <Card key={document.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getDocumentIcon(document.documentType)}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{document.title}</h3>
                  <p className="text-sm text-gray-500">
                    {document.documentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onPreview(document)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDownload(document)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(document)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Status</span>
                {getStatusBadge(document.status)}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Size</span>
                <span>{formatFileSize(document.metadata?.size)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Created</span>
                <span>{new Date(document.createdAt).toLocaleDateString()}</span>
              </div>
              {document.matter && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Matter</span>
                  <span className="truncate">{document.matter.title}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onPreview(document)}>
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button size="sm" onClick={() => onDownload(document)}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Document Preview Component
function DocumentPreview({ document }: { document: Document }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Document Type:</span>
          <p>{document.documentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
        </div>
        <div>
          <span className="font-medium">Status:</span>
          <p>{document.status}</p>
        </div>
        <div>
          <span className="font-medium">Version:</span>
          <p>{document.version}</p>
        </div>
        <div>
          <span className="font-medium">Created:</span>
          <p>{new Date(document.createdAt).toLocaleString()}</p>
        </div>
        <div>
          <span className="font-medium">Size:</span>
          <p>{document.metadata?.size ? `${Math.round(document.metadata.size / 1024)} KB` : 'Unknown'}</p>
        </div>
        <div>
          <span className="font-medium">Content Type:</span>
          <p>{document.metadata?.contentType || 'Unknown'}</p>
        </div>
      </div>

      {document.documentType === 'will_pdf' && document.willId && (
        <div className="border rounded-lg p-4">
          <iframe
            src={`/api/wills/${document.willId}/pdf`}
            className="w-full h-96 border-0"
            title="Document Preview"
          />
        </div>
      )}

      {document.content && (
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Document Content</h4>
          <pre className="text-sm bg-gray-50 p-3 rounded overflow-auto max-h-48">
            {typeof document.content === 'string' 
              ? document.content 
              : JSON.stringify(document.content, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}