/**
 * Document Storage Service for Mirath Legal
 * Handles document storage with multiple backends (Cloudflare R2, Local, etc.)
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { nanoid } from 'nanoid';

export interface DocumentMetadata {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  willId?: string;
  documentType: 'will_pdf' | 'supporting_document' | 'client_upload' | 'generated_will';
  uploadedBy: string;
  uploadedAt: Date;
  tags?: Record<string, string>;
}

export interface StorageConfig {
  provider: 'cloudflare-r2' | 'local' | 'aws-s3';
  config: {
    accessKeyId?: string;
    secretAccessKey?: string;
    accountId?: string;
    bucketName?: string;
    region?: string;
    endpoint?: string;
    localPath?: string;
  };
}

export interface DocumentUploadResult {
  success: boolean;
  documentId: string;
  url?: string;
  publicUrl?: string;
  metadata: DocumentMetadata;
  error?: string;
}

export class DocumentStorageService {
  private config: StorageConfig;
  private s3Client?: S3Client;

  constructor(config?: StorageConfig) {
    this.config = config || this.getDefaultConfig();
    this.initializeClient();
  }

  private getDefaultConfig(): StorageConfig {
    // Check for Cloudflare R2 credentials
    const hasR2Creds = !!(
      process.env.R2_UPLOAD_IMAGE_ACCESS_KEY_ID &&
      process.env.R2_UPLOAD_IMAGE_SECRET_ACCESS_KEY &&
      process.env.CLOUDFLARE_ACCOUNT_ID
    );

    if (hasR2Creds) {
      return {
        provider: 'cloudflare-r2',
        config: {
          accessKeyId: process.env.R2_UPLOAD_IMAGE_ACCESS_KEY_ID!,
          secretAccessKey: process.env.R2_UPLOAD_IMAGE_SECRET_ACCESS_KEY!,
          accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
          bucketName: process.env.R2_DOCUMENT_BUCKET_NAME || 'mirath-documents',
          endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          region: 'auto',
        },
      };
    }

    // Fallback to local storage
    return {
      provider: 'local',
      config: {
        localPath: process.env.DOCUMENT_STORAGE_PATH || join(process.cwd(), 'storage', 'documents'),
      },
    };
  }

  private initializeClient() {
    if (this.config.provider === 'cloudflare-r2' || this.config.provider === 'aws-s3') {
      this.s3Client = new S3Client({
        region: this.config.config.region || 'auto',
        endpoint: this.config.config.endpoint,
        credentials: {
          accessKeyId: this.config.config.accessKeyId!,
          secretAccessKey: this.config.config.secretAccessKey!,
        },
      });
    }
  }

  async uploadDocument(
    buffer: Buffer,
    metadata: Omit<DocumentMetadata, 'id' | 'uploadedAt' | 'size'>
  ): Promise<DocumentUploadResult> {
    try {
      const documentId = nanoid();
      const fullMetadata: DocumentMetadata = {
        ...metadata,
        id: documentId,
        size: buffer.length,
        uploadedAt: new Date(),
      };

      const key = this.generateDocumentKey(fullMetadata);

      if (this.config.provider === 'local') {
        return await this.uploadToLocal(buffer, key, fullMetadata);
      } else if (this.s3Client) {
        return await this.uploadToS3(buffer, key, fullMetadata);
      } else {
        throw new Error('No storage backend configured');
      }
    } catch (error) {
      console.error('Document upload error:', error);
      return {
        success: false,
        documentId: '',
        metadata: metadata as DocumentMetadata,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  private async uploadToLocal(
    buffer: Buffer,
    key: string,
    metadata: DocumentMetadata
  ): Promise<DocumentUploadResult> {
    const localPath = this.config.config.localPath!;
    const fullPath = join(localPath, key);
    const dirPath = join(localPath, key.split('/').slice(0, -1).join('/'));

    // Ensure directory exists
    await fs.mkdir(dirPath, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, buffer);

    // Write metadata
    const metadataPath = fullPath + '.metadata.json';
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return {
      success: true,
      documentId: metadata.id,
      url: `/api/documents/${metadata.id}`,
      metadata,
    };
  }

  private async uploadToS3(
    buffer: Buffer,
    key: string,
    metadata: DocumentMetadata
  ): Promise<DocumentUploadResult> {
    if (!this.s3Client) {
      throw new Error('S3 client not initialized');
    }

    const command = new PutObjectCommand({
      Bucket: this.config.config.bucketName!,
      Key: key,
      Body: buffer,
      ContentType: metadata.contentType,
      Metadata: {
        documentId: metadata.id,
        filename: metadata.filename,
        documentType: metadata.documentType,
        uploadedBy: metadata.uploadedBy,
        willId: metadata.willId || '',
        ...metadata.tags,
      },
      // Set appropriate permissions for documents
      ACL: 'private',
    });

    await this.s3Client.send(command);

    // Generate presigned URL for access
    const getCommand = new GetObjectCommand({
      Bucket: this.config.config.bucketName!,
      Key: key,
    });

    const signedUrl = await getSignedUrl(this.s3Client, getCommand, { expiresIn: 3600 });

    return {
      success: true,
      documentId: metadata.id,
      url: signedUrl,
      publicUrl: this.config.provider === 'cloudflare-r2' 
        ? `https://pub-${this.config.config.accountId}.r2.dev/${key}`
        : undefined,
      metadata,
    };
  }

  async getDocument(documentId: string): Promise<{
    success: boolean;
    buffer?: Buffer;
    metadata?: DocumentMetadata;
    error?: string;
  }> {
    try {
      if (this.config.provider === 'local') {
        return await this.getFromLocal(documentId);
      } else if (this.s3Client) {
        return await this.getFromS3(documentId);
      } else {
        throw new Error('No storage backend configured');
      }
    } catch (error) {
      console.error('Document retrieval error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Retrieval failed',
      };
    }
  }

  private async getFromLocal(documentId: string): Promise<{
    success: boolean;
    buffer?: Buffer;
    metadata?: DocumentMetadata;
    error?: string;
  }> {
    // For local storage, we need to find the file by scanning the directory
    // This is a simplified implementation - in production, you'd want an index
    const localPath = this.config.config.localPath!;
    
    try {
      // Read directory structure to find the document
      const findDocument = async (dir: string): Promise<string | null> => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          
          if (entry.isDirectory()) {
            const found = await findDocument(fullPath);
            if (found) return found;
          } else if (entry.name.endsWith('.metadata.json')) {
            const metadataContent = await fs.readFile(fullPath, 'utf-8');
            const metadata = JSON.parse(metadataContent) as DocumentMetadata;
            
            if (metadata.id === documentId) {
              return fullPath.replace('.metadata.json', '');
            }
          }
        }
        
        return null;
      };

      const documentPath = await findDocument(localPath);
      if (!documentPath) {
        return { success: false, error: 'Document not found' };
      }

      const buffer = await fs.readFile(documentPath);
      const metadataContent = await fs.readFile(documentPath + '.metadata.json', 'utf-8');
      const metadata = JSON.parse(metadataContent) as DocumentMetadata;

      return { success: true, buffer, metadata };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read document',
      };
    }
  }

  private async getFromS3(documentId: string): Promise<{
    success: boolean;
    buffer?: Buffer;
    metadata?: DocumentMetadata;
    error?: string;
  }> {
    // For S3/R2, we'd need to implement a way to find documents by ID
    // This could be done by storing the mapping in the database
    throw new Error('S3 document retrieval by ID not implemented - use database mapping');
  }

  async deleteDocument(documentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.config.provider === 'local') {
        return await this.deleteFromLocal(documentId);
      } else if (this.s3Client) {
        return await this.deleteFromS3(documentId);
      } else {
        throw new Error('No storage backend configured');
      }
    } catch (error) {
      console.error('Document deletion error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deletion failed',
      };
    }
  }

  private async deleteFromLocal(documentId: string): Promise<{ success: boolean; error?: string }> {
    // Implementation similar to getFromLocal
    return { success: false, error: 'Local deletion not implemented' };
  }

  private async deleteFromS3(documentId: string): Promise<{ success: boolean; error?: string }> {
    // Implementation requires key lookup
    return { success: false, error: 'S3 deletion by ID not implemented' };
  }

  async generatePresignedUploadUrl(
    filename: string,
    contentType: string,
    willId?: string
  ): Promise<{
    success: boolean;
    uploadUrl?: string;
    documentId?: string;
    error?: string;
  }> {
    if (this.config.provider === 'local') {
      return {
        success: false,
        error: 'Presigned URLs not supported for local storage',
      };
    }

    if (!this.s3Client) {
      return {
        success: false,
        error: 'S3 client not initialized',
      };
    }

    try {
      const documentId = nanoid();
      const key = this.generateDocumentKey({
        id: documentId,
        filename,
        contentType,
        size: 0,
        documentType: 'client_upload',
        uploadedBy: 'pending',
        uploadedAt: new Date(),
        willId,
      });

      const command = new PutObjectCommand({
        Bucket: this.config.config.bucketName!,
        Key: key,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

      return {
        success: true,
        uploadUrl,
        documentId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate upload URL',
      };
    }
  }

  private generateDocumentKey(metadata: DocumentMetadata): string {
    const date = metadata.uploadedAt.toISOString().split('T')[0];
    const sanitizedFilename = metadata.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    if (metadata.willId) {
      return `wills/${metadata.willId}/${metadata.documentType}/${date}/${metadata.id}_${sanitizedFilename}`;
    }
    
    return `documents/${metadata.documentType}/${date}/${metadata.id}_${sanitizedFilename}`;
  }

  getStorageInfo(): {
    provider: string;
    isConfigured: boolean;
    bucketName?: string;
    localPath?: string;
  } {
    return {
      provider: this.config.provider,
      isConfigured: this.config.provider === 'local' || !!this.s3Client,
      bucketName: this.config.config.bucketName,
      localPath: this.config.config.localPath,
    };
  }
}

// Singleton instance
export const documentStorage = new DocumentStorageService();