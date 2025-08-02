# Mirath Legal - Software Technical Specifications

## 1. System Architecture Overview

### 1.1 High-Level Architecture
Building on the existing Next.js SaaS Starter Kit 2.0, Mirath Legal extends the multi-tenant architecture to support law firm operations and estate planning workflows.

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────┤
│ Web App (Next.js 15) │ Mobile PWA │ Law Firm Portal         │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER                                │
├─────────────────────────────────────────────────────────────┤
│ Next.js API Routes │ tRPC │ Webhooks │ External APIs          │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                 BUSINESS LOGIC LAYER                        │
├─────────────────────────────────────────────────────────────┤
│ Will Engine │ AI Service │ DIFC Compliance │ Billing        │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER                                │
├─────────────────────────────────────────────────────────────┤
│ Neon PostgreSQL │ Cloudflare R2 │ Redis Cache │ Search      │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│               EXTERNAL INTEGRATIONS                         │
├─────────────────────────────────────────────────────────────┤
│ UAE Pass │ DIFC APIs │ Payment Gateways │ AI Services       │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack Extensions

#### Core Platform (Existing)
- **Framework**: Next.js 15.3.1 with App Router
- **Language**: TypeScript with strict mode
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Authentication**: Better Auth v1.2.8
- **Payments**: Polar.sh
- **Storage**: Cloudflare R2
- **Styling**: Tailwind CSS v4 + shadcn/ui

#### Mirath Legal Extensions
- **AI/ML**: OpenAI GPT-4 + custom legal models
- **Document Processing**: PDF-lib, Mammoth.js, React-PDF
- **Legal APIs**: DIFC integration, UAE government services
- **Search**: Elasticsearch/PostgreSQL full-text search
- **Queuing**: BullMQ with Redis
- **Monitoring**: Sentry, DataDog
- **Testing**: Jest, Playwright, Cypress

## 2. Database Schema Design

### 2.1 Core Extensions to Existing Schema

```sql
-- Extending existing users table
ALTER TABLE users ADD COLUMN user_type VARCHAR(20) DEFAULT 'client';
ALTER TABLE users ADD COLUMN emirates_id VARCHAR(15);
ALTER TABLE users ADD COLUMN uae_pass_id VARCHAR(100);
ALTER TABLE users ADD COLUMN preferred_language VARCHAR(5) DEFAULT 'en';

-- Law Firms
CREATE TABLE law_firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  license_number VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address JSONB,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  subscription_tier VARCHAR(50) DEFAULT 'starter',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Law Firm Members
CREATE TABLE law_firm_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  law_firm_id UUID REFERENCES law_firms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'admin', 'senior_lawyer', 'lawyer', 'support'
  permissions JSONB DEFAULT '[]',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(law_firm_id, user_id)
);

-- Matters (Cases)
CREATE TABLE matters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  law_firm_id UUID REFERENCES law_firms(id) ON DELETE CASCADE,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assigned_lawyer_id UUID REFERENCES users(id),
  matter_number VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  matter_type VARCHAR(50) NOT NULL, -- 'simple_will', 'complex_will', 'business_succession'
  status VARCHAR(50) DEFAULT 'intake', -- 'intake', 'draft', 'review', 'client_review', 'complete', 'registered'
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(law_firm_id, matter_number)
);

-- Wills
CREATE TABLE wills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
  testator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  will_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  language VARCHAR(5) DEFAULT 'en',
  
  -- Personal Information
  personal_info JSONB NOT NULL DEFAULT '{}',
  
  -- Assets
  assets JSONB DEFAULT '[]',
  
  -- Beneficiaries
  beneficiaries JSONB DEFAULT '[]',
  
  -- Guardians (for minor children)
  guardians JSONB DEFAULT '[]',
  
  -- Executors
  executors JSONB DEFAULT '[]',
  
  -- Special Instructions
  special_instructions TEXT,
  
  -- DIFC Specific
  difc_compliant BOOLEAN DEFAULT false,
  difc_registration_number VARCHAR(100),
  difc_registration_date DATE,
  
  -- AI Analysis
  ai_analysis JSONB DEFAULT '{}',
  compliance_checks JSONB DEFAULT '{}',
  risk_assessment JSONB DEFAULT '{}',
  
  -- Versions
  version INTEGER DEFAULT 1,
  parent_will_id UUID REFERENCES wills(id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Will Documents
CREATE TABLE will_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  will_id UUID REFERENCES wills(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'draft', 'final', 'difc_submission'
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  generated_by VARCHAR(50), -- 'ai', 'lawyer', 'system'
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assets
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  will_id UUID REFERENCES wills(id) ON DELETE CASCADE,
  asset_type VARCHAR(50) NOT NULL, -- 'property', 'bank_account', 'investment', 'business', 'digital'
  jurisdiction VARCHAR(50) NOT NULL, -- 'UAE', 'UK', 'US', etc.
  
  -- Asset Details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  estimated_value DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'AED',
  
  -- Property Specific
  property_details JSONB,
  
  -- Business Specific  
  business_details JSONB,
  
  -- Digital Asset Specific
  digital_details JSONB,
  
  -- Beneficiary Allocation
  allocation JSONB DEFAULT '[]',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Beneficiaries
CREATE TABLE beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  will_id UUID REFERENCES wills(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'individual', 'charity', 'organization'
  
  -- Individual Details
  full_name VARCHAR(255) NOT NULL,
  relationship VARCHAR(100), -- 'spouse', 'child', 'sibling', 'friend'
  date_of_birth DATE,
  nationality VARCHAR(100),
  identification_number VARCHAR(100),
  contact_info JSONB,
  
  -- Inheritance Details
  inheritance_percentage DECIMAL(5,2),
  specific_assets JSONB DEFAULT '[]',
  conditions JSONB DEFAULT '[]',
  
  -- Contingency
  is_contingent BOOLEAN DEFAULT false,
  contingent_conditions TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DIFC Compliance Rules
CREATE TABLE difc_compliance_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type VARCHAR(100) NOT NULL,
  rule_code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  validation_logic JSONB NOT NULL,
  severity VARCHAR(20) DEFAULT 'error', -- 'info', 'warning', 'error'
  effective_date DATE NOT NULL,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Processing Jobs
CREATE TABLE ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  will_id UUID REFERENCES wills(id) ON DELETE CASCADE,
  job_type VARCHAR(50) NOT NULL, -- 'document_generation', 'compliance_check', 'risk_analysis'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Billing & Time Tracking
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
  lawyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  billable_hours DECIMAL(4,2) NOT NULL,
  hourly_rate DECIMAL(8,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  entry_date DATE NOT NULL,
  is_billable BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_matters_law_firm_status ON matters(law_firm_id, status);
CREATE INDEX idx_wills_testator_status ON wills(testator_id, status);
CREATE INDEX idx_assets_will_type ON assets(will_id, asset_type);
CREATE INDEX idx_ai_jobs_status ON ai_jobs(status, created_at);
CREATE INDEX idx_time_entries_matter ON time_entries(matter_id, entry_date);
```

### 2.2 JSONB Schema Definitions

#### Personal Information Structure
```typescript
interface PersonalInfo {
  emiratesId: string;
  passportNumber: string;
  nationality: string;
  visaStatus: 'residence' | 'investor' | 'golden' | 'employment' | 'other';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  address: {
    street: string;
    city: string;
    emirate: string;
    poBox: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
}
```

#### Asset Details Structures
```typescript
interface PropertyDetails {
  propertyType: 'apartment' | 'villa' | 'commercial' | 'land';
  ownership: 'freehold' | 'leasehold';
  titleDeedNumber: string;
  location: string;
  area: number;
  developer?: string;
  mortgageDetails?: {
    lender: string;
    outstandingAmount: number;
    monthlyPayment: number;
  };
}

interface BusinessDetails {
  businessType: 'llc' | 'freezone' | 'offshore' | 'partnership';
  registrationNumber: string;
  jurisdiction: string;
  ownershipPercentage: number;
  partners?: Array<{
    name: string;
    percentage: number;
  }>;
  valuation?: {
    method: string;
    value: number;
    date: string;
  };
}

interface DigitalDetails {
  type: 'cryptocurrency' | 'nft' | 'domain' | 'social_media' | 'online_business';
  platform?: string;
  walletAddress?: string;
  accessInstructions: string;
  estimatedValue?: number;
  lastUpdated: string;
}
```

## 3. API Architecture

### 3.1 API Route Structure
Building on existing Next.js API routes, organized by feature domains:

```
app/api/
├── auth/                    # Existing authentication
├── subscription/            # Existing billing
├── upload/                  # Existing file uploads
├── v1/
│   ├── law-firms/
│   │   ├── route.ts         # CRUD operations
│   │   ├── [firmId]/
│   │   │   ├── route.ts
│   │   │   ├── members/route.ts
│   │   │   ├── matters/route.ts
│   │   │   └── billing/route.ts
│   ├── matters/
│   │   ├── route.ts
│   │   ├── [matterId]/
│   │   │   ├── route.ts
│   │   │   ├── timeline/route.ts
│   │   │   └── documents/route.ts
│   ├── wills/
│   │   ├── route.ts
│   │   ├── [willId]/
│   │   │   ├── route.ts
│   │   │   ├── generate/route.ts
│   │   │   ├── validate/route.ts
│   │   │   └── difc/route.ts
│   ├── ai/
│   │   ├── generate/route.ts
│   │   ├── analyze/route.ts
│   │   └── compliance/route.ts
│   ├── difc/
│   │   ├── rules/route.ts
│   │   ├── validate/route.ts
│   │   └── register/route.ts
│   └── integrations/
│       ├── uae-pass/route.ts
│       ├── emirates-id/route.ts
│       └── banks/route.ts
```

### 3.2 API Specifications

#### Will Generation API
```typescript
// POST /api/v1/wills/[willId]/generate
interface GenerateWillRequest {
  willId: string;
  template: 'simple' | 'complex' | 'business_succession';
  language: 'en' | 'ar';
  options: {
    includeDIFCClauses: boolean;
    includeDigitalAssets: boolean;
    includeBusinessSuccession: boolean;
  };
}

interface GenerateWillResponse {
  success: boolean;
  jobId: string;
  estimatedCompletionTime: number; // seconds
  documentUrl?: string; // if synchronous
  errors?: Array<{
    field: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
  }>;
}
```

#### DIFC Compliance Validation
```typescript
// POST /api/v1/difc/validate
interface DIFCValidationRequest {
  willData: WillData;
  checkType: 'full' | 'quick' | 'registration_ready';
}

interface DIFCValidationResponse {
  isCompliant: boolean;
  score: number; // 0-100 compliance score
  issues: Array<{
    ruleCode: string;
    severity: 'info' | 'warning' | 'error';
    description: string;
    suggestion: string;
    affectedSection: string;
  }>;
  recommendations: Array<{
    type: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
  }>;
}
```

#### AI Analysis API
```typescript
// POST /api/v1/ai/analyze
interface AIAnalysisRequest {
  willId: string;
  analysisType: 'risk_assessment' | 'recommendations' | 'cross_border';
  context: {
    clientProfile: ClientProfile;
    assets: Asset[];
    jurisdiction: string[];
  };
}

interface AIAnalysisResponse {
  jobId: string;
  analysis: {
    riskLevel: 'low' | 'medium' | 'high';
    keyRisks: string[];
    recommendations: Recommendation[];
    crossBorderImplications: CrossBorderIssue[];
    confidenceScore: number;
  };
  processingTime: number;
}
```

### 3.3 Real-time Features

#### WebSocket Integration
```typescript
// Real-time updates for will creation process
interface WebSocketEvents {
  'will:generation:progress': {
    willId: string;
    progress: number;
    currentStep: string;
  };
  
  'will:validation:complete': {
    willId: string;
    isValid: boolean;
    issues: ValidationIssue[];
  };
  
  'matter:status:changed': {
    matterId: string;
    oldStatus: string;
    newStatus: string;
    changedBy: string;
  };
  
  'difc:rules:updated': {
    ruleId: string;
    affectedWills: string[];
    severity: string;
  };
}
```

## 4. AI Integration Architecture

### 4.1 AI Service Layer

```typescript
// lib/ai/will-generator.ts
export class WillGenerator {
  private openai: OpenAI;
  private legalTemplate: LegalTemplateEngine;
  
  async generateWill(
    testatorInfo: TestatorInfo,
    assets: Asset[],
    beneficiaries: Beneficiary[],
    options: GenerationOptions
  ): Promise<GeneratedWill> {
    // Multi-step generation process
    const context = await this.buildLegalContext(testatorInfo, assets);
    const structure = await this.generateWillStructure(context);
    const content = await this.generateWillContent(structure, options);
    const validated = await this.validateLegalCompliance(content);
    
    return validated;
  }
  
  private async buildLegalContext(
    testatorInfo: TestatorInfo,
    assets: Asset[]
  ): Promise<LegalContext> {
    // Analyze jurisdiction requirements
    // Identify potential legal conflicts
    // Build context for AI generation
  }
}

// lib/ai/compliance-checker.ts
export class ComplianceChecker {
  async validateDIFCCompliance(will: Will): Promise<ComplianceResult> {
    const rules = await this.getDIFCRules();
    const violations: ComplianceIssue[] = [];
    
    for (const rule of rules) {
      const result = await this.checkRule(will, rule);
      if (!result.passed) {
        violations.push(result.issue);
      }
    }
    
    return {
      isCompliant: violations.length === 0,
      issues: violations,
      score: this.calculateComplianceScore(violations)
    };
  }
}

// lib/ai/risk-analyzer.ts
export class RiskAnalyzer {
  async analyzeEstatePlanRisks(
    will: Will,
    assets: Asset[],
    beneficiaries: Beneficiary[]
  ): Promise<RiskAnalysis> {
    // Analyze cross-border tax implications
    // Identify succession planning gaps
    // Flag potential family disputes
    // Assess asset protection strategies
  }
}
```

### 4.2 Queue Management

```typescript
// lib/queue/ai-queue.ts
import { Queue, Worker } from 'bullmq';

export const aiQueue = new Queue('ai-processing', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Workers for different AI tasks
export const willGenerationWorker = new Worker(
  'ai-processing',
  async (job) => {
    const { type, data } = job.data;
    
    switch (type) {
      case 'generate_will':
        return await willGenerator.generateWill(data);
      case 'compliance_check':
        return await complianceChecker.validateDIFCCompliance(data);
      case 'risk_analysis':
        return await riskAnalyzer.analyzeEstatePlanRisks(data);
      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  },
  { connection: redisConnection }
);
```

## 5. Security Implementation

### 5.1 Authentication & Authorization
Building on existing Better Auth v1.2.8:

```typescript
// lib/auth/permissions.ts
export const permissions = {
  // Law firm management
  'law_firm:create': ['admin'],
  'law_firm:update': ['admin', 'firm_admin'],
  'law_firm:delete': ['admin'],
  
  // Matter management
  'matter:create': ['firm_admin', 'senior_lawyer', 'lawyer'],
  'matter:view': ['firm_admin', 'senior_lawyer', 'lawyer', 'assigned_lawyer'],
  'matter:update': ['firm_admin', 'senior_lawyer', 'assigned_lawyer'],
  'matter:delete': ['firm_admin', 'senior_lawyer'],
  
  // Will operations
  'will:create': ['firm_admin', 'senior_lawyer', 'lawyer'],
  'will:view': ['firm_admin', 'senior_lawyer', 'lawyer', 'client'],
  'will:edit': ['firm_admin', 'senior_lawyer', 'assigned_lawyer'],
  'will:finalize': ['firm_admin', 'senior_lawyer'],
  
  // Sensitive operations
  'difc:register': ['firm_admin', 'senior_lawyer'],
  'billing:view': ['firm_admin', 'senior_lawyer'],
  'analytics:view': ['firm_admin'],
} as const;

export function hasPermission(
  user: User,
  permission: keyof typeof permissions,
  context?: { firmId?: string; matterId?: string }
): boolean {
  // Check user role and context-specific permissions
}
```

### 5.2 Data Encryption

```typescript
// lib/security/encryption.ts
import crypto from 'crypto';

export class DocumentEncryption {
  private static algorithm = 'aes-256-gcm';
  
  static async encryptDocument(
    content: string,
    willId: string
  ): Promise<EncryptedDocument> {
    const key = await this.getOrCreateEncryptionKey(willId);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, key);
    
    cipher.setAAD(Buffer.from(willId));
    
    let encrypted = cipher.update(content, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      content: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: this.algorithm
    };
  }
  
  static async decryptDocument(
    encryptedDoc: EncryptedDocument,
    willId: string
  ): Promise<string> {
    const key = await this.getEncryptionKey(willId);
    const decipher = crypto.createDecipher(
      encryptedDoc.algorithm,
      key
    );
    
    decipher.setAAD(Buffer.from(willId));
    decipher.setAuthTag(Buffer.from(encryptedDoc.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedDoc.content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### 5.3 Audit Logging

```typescript
// lib/audit/audit-logger.ts
export class AuditLogger {
  static async log(event: AuditEvent): Promise<void> {
    const auditRecord = {
      timestamp: new Date(),
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      resourceId: event.resourceId,
      details: event.details,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      firmId: event.firmId,
      sensitive: event.sensitive || false
    };
    
    // Log to database
    await db.insert(auditLogs).values(auditRecord);
    
    // Send to external monitoring if sensitive
    if (auditRecord.sensitive) {
      await this.sendToSecurityMonitoring(auditRecord);
    }
  }
}

// Usage throughout the application
await AuditLogger.log({
  userId: session.userId,
  action: 'will:generate',
  resource: 'will',
  resourceId: willId,
  details: { template: 'complex', language: 'en' },
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
  firmId: userFirmId,
  sensitive: true
});
```

## 6. Performance Optimization

### 6.1 Database Optimization

```sql
-- Partitioning for large tables
CREATE TABLE audit_logs_2024 PARTITION OF audit_logs
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Materialized views for analytics
CREATE MATERIALIZED VIEW matter_statistics AS
SELECT 
  law_firm_id,
  matter_type,
  status,
  COUNT(*) as matter_count,
  AVG(EXTRACT(DAY FROM (updated_at - created_at))) as avg_completion_days
FROM matters
GROUP BY law_firm_id, matter_type, status;

-- Indexes for common queries
CREATE INDEX CONCURRENTLY idx_matters_law_firm_created 
ON matters(law_firm_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_wills_difc_registration 
ON wills(difc_registration_number) 
WHERE difc_registration_number IS NOT NULL;
```

### 6.2 Caching Strategy

```typescript
// lib/cache/redis-cache.ts
export class CacheManager {
  private redis: Redis;
  
  // Cache DIFC rules (1 hour TTL)
  async getDIFCRules(): Promise<DIFCRule[]> {
    const cacheKey = 'difc:rules:active';
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const rules = await db.select().from(difcComplianceRules)
      .where(eq(difcComplianceRules.isActive, true));
      
    await this.redis.setex(cacheKey, 3600, JSON.stringify(rules));
    return rules;
  }
  
  // Cache user permissions (15 minutes TTL)
  async getUserPermissions(userId: string): Promise<string[]> {
    const cacheKey = `user:permissions:${userId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const permissions = await this.calculateUserPermissions(userId);
    await this.redis.setex(cacheKey, 900, JSON.stringify(permissions));
    return permissions;
  }
}
```

### 6.3 File Processing Optimization

```typescript
// lib/documents/pdf-generator.ts
export class PDFGenerator {
  async generateWillPDF(
    will: Will,
    options: PDFOptions = {}
  ): Promise<Buffer> {
    // Use worker threads for CPU-intensive PDF generation
    return new Promise((resolve, reject) => {
      const worker = new Worker('./pdf-worker.js', {
        workerData: { will, options }
      });
      
      worker.on('message', (pdfBuffer) => {
        resolve(pdfBuffer);
      });
      
      worker.on('error', reject);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        worker.terminate();
        reject(new Error('PDF generation timeout'));
      }, 30000);
    });
  }
}
```

## 7. External Integrations

### 7.1 UAE Government Services

```typescript
// lib/integrations/uae-pass.ts
export class UAEPassIntegration {
  private baseURL = process.env.UAE_PASS_API_URL;
  private clientId = process.env.UAE_PASS_CLIENT_ID;
  private clientSecret = process.env.UAE_PASS_CLIENT_SECRET;
  
  async verifyIdentity(uaePassToken: string): Promise<UAEPassProfile> {
    const response = await fetch(`${this.baseURL}/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${uaePassToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ client_id: this.clientId })
    });
    
    if (!response.ok) {
      throw new Error('UAE Pass verification failed');
    }
    
    return response.json();
  }
  
  async getEmiratesIDData(emiratesId: string): Promise<EmiratesIDData> {
    // Integration with Emirates ID authority
    // Verify Emirates ID number and extract basic info
  }
}

// lib/integrations/difc-api.ts
export class DIFCIntegration {
  async registerWill(will: Will): Promise<DIFCRegistrationResult> {
    // Submit will to DIFC registry
    // Handle registration process
    // Return registration number and status
  }
  
  async checkRegistrationStatus(
    registrationNumber: string
  ): Promise<RegistrationStatus> {
    // Query DIFC registration status
    // Return current status and any updates
  }
  
  async downloadRegistrationCertificate(
    registrationNumber: string
  ): Promise<Buffer> {
    // Download official DIFC registration certificate
  }
}
```

### 7.2 Banking and Financial Integrations

```typescript
// lib/integrations/banking.ts
export class BankingIntegration {
  async verifyBankAccount(
    accountNumber: string,
    bankCode: string,
    ownerEmiratesId: string
  ): Promise<BankAccountVerification> {
    // Verify bank account ownership
    // Return account status and balance range
  }
  
  async getAccountBalance(
    accountNumber: string,
    authorization: BankAuthorization
  ): Promise<AccountBalance> {
    // Get current account balance
    // Used for asset valuation
  }
}
```

## 8. Testing Strategy

### 8.1 Unit Testing

```typescript
// __tests__/lib/will-generator.test.ts
import { WillGenerator } from '@/lib/ai/will-generator';

describe('WillGenerator', () => {
  let generator: WillGenerator;
  
  beforeEach(() => {
    generator = new WillGenerator();
  });
  
  test('generates simple will for single expatriate', async () => {
    const testatorInfo = createMockTestator('expatriate', 'single');
    const assets = [createMockProperty('dubai_apartment')];
    const beneficiaries = [createMockBeneficiary('sibling')];
    
    const result = await generator.generateWill(
      testatorInfo,
      assets,
      beneficiaries,
      { template: 'simple', language: 'en' }
    );
    
    expect(result.isValid).toBe(true);
    expect(result.content).toContain('DIFC Wills');
    expect(result.compliance.score).toBeGreaterThan(90);
  });
  
  test('identifies cross-border compliance issues', async () => {
    const testatorInfo = createMockTestator('expatriate', 'married');
    const assets = [
      createMockProperty('uk_property'),
      createMockProperty('dubai_apartment')
    ];
    
    const result = await generator.generateWill(testatorInfo, assets, []);
    
    expect(result.warnings).toContainEqual(
      expect.objectContaining({
        type: 'cross_border_conflict',
        jurisdiction: 'UK'
      })
    );
  });
});
```

### 8.2 Integration Testing

```typescript
// __tests__/api/wills.test.ts
import { testApiHandler } from 'next-test-api-route-handler';
import handler from '@/app/api/v1/wills/[willId]/generate/route';

describe('/api/v1/wills/[willId]/generate', () => {
  test('generates will with valid data', async () => {
    await testApiHandler({
      handler,
      params: { willId: 'test-will-id' },
      test: async ({ fetch }) => {
        const response = await fetch({
          method: 'POST',
          body: JSON.stringify({
            template: 'simple',
            language: 'en',
            options: { includeDIFCClauses: true }
          }),
        });
        
        expect(response.status).toBe(200);
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.jobId).toBeDefined();
      },
    });
  });
});
```

### 8.3 End-to-End Testing

```typescript
// e2e/will-creation.spec.ts
import { test, expect } from '@playwright/test';

test('complete will creation flow', async ({ page }) => {
  // Login as lawyer
  await page.goto('/dashboard');
  await page.fill('[data-testid=email]', 'lawyer@testfirm.com');
  await page.fill('[data-testid=password]', 'testpassword');
  await page.click('[data-testid=login-button]');
  
  // Create new matter
  await page.click('[data-testid=new-matter-button]');
  await page.selectOption('[data-testid=matter-type]', 'simple_will');
  await page.fill('[data-testid=client-name]', 'John Smith');
  await page.click('[data-testid=create-matter]');
  
  // Fill will creation form
  await page.fill('[data-testid=testator-name]', 'John Smith');
  await page.fill('[data-testid=emirates-id]', '784-1234-1234567-1');
  await page.selectOption('[data-testid=visa-status]', 'residence');
  
  // Add assets
  await page.click('[data-testid=add-property]');
  await page.fill('[data-testid=property-location]', 'Downtown Dubai');
  await page.selectOption('[data-testid=property-type]', 'apartment');
  
  // Generate will
  await page.click('[data-testid=generate-will]');
  
  // Wait for AI generation
  await expect(page.locator('[data-testid=generation-progress]')).toBeVisible();
  await expect(page.locator('[data-testid=will-preview]')).toBeVisible({
    timeout: 30000
  });
  
  // Verify generated content
  const willContent = await page.textContent('[data-testid=will-content]');
  expect(willContent).toContain('DIFC Wills and Probate Registry');
  expect(willContent).toContain('John Smith');
  expect(willContent).toContain('Downtown Dubai');
});
```

## 9. Deployment & Infrastructure

### 9.1 Environment Configuration

```typescript
// lib/config.ts
export const config = {
  app: {
    name: 'Mirath Legal',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
  
  database: {
    url: process.env.DATABASE_URL!,
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
  },
  
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY!,
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '4000'),
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.3'),
  },
  
  integrations: {
    uaePass: {
      clientId: process.env.UAE_PASS_CLIENT_ID!,
      clientSecret: process.env.UAE_PASS_CLIENT_SECRET!,
      baseUrl: process.env.UAE_PASS_API_URL!,
    },
    
    difc: {
      apiKey: process.env.DIFC_API_KEY!,
      baseUrl: process.env.DIFC_API_URL!,
      environment: process.env.DIFC_ENVIRONMENT || 'sandbox',
    },
  },
  
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY!,
    jwtSecret: process.env.JWT_SECRET!,
    sessionSecret: process.env.SESSION_SECRET!,
  },
} as const;
```

### 9.2 Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### 9.3 Production Considerations

#### Database Migration Strategy
```typescript
// scripts/migrate.ts
export async function runMigrations() {
  const migrations = await fs.readdir('./drizzle/migrations');
  
  for (const migration of migrations.sort()) {
    console.log(`Running migration: ${migration}`);
    await runMigrationFile(migration);
    await logMigration(migration);
  }
}
```

#### Monitoring & Alerting
```typescript
// lib/monitoring/alerts.ts
export class AlertManager {
  static async criticalError(error: Error, context: AlertContext) {
    // Send to multiple channels
    await Promise.all([
      this.sendToSlack(error, context),
      this.sendToEmail(error, context),
      this.sendToSentry(error, context),
    ]);
  }
  
  static async performanceAlert(metric: string, value: number, threshold: number) {
    if (value > threshold) {
      await this.sendPerformanceAlert(metric, value, threshold);
    }
  }
}
```

## 10. Conclusion

This technical specification provides a comprehensive foundation for building Mirath Legal on top of the existing Next.js SaaS Starter Kit. The architecture emphasizes:

- **Scalability**: Multi-tenant design supporting thousands of law firms
- **Security**: End-to-end encryption and comprehensive audit logging
- **Compliance**: Built-in DIFC compliance checking and legal validation
- **Performance**: Optimized database design and caching strategies
- **Extensibility**: Modular architecture for future enhancements

The implementation leverages the starter kit's robust foundation while adding sophisticated legal-specific functionality, AI-powered document generation, and UAE-specific integrations to create a market-leading estate planning platform.