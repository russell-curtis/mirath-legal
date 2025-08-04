import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  decimal,
  date,
  uuid,
  json,
  index,
} from "drizzle-orm/pg-core";

// Better Auth Tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  // Mirath Legal extensions
  userType: text("userType").default("client"), // 'client', 'lawyer', 'admin'
  emiratesId: text("emiratesId"),
  uaePassId: text("uaePassId"),
  preferredLanguage: text("preferredLanguage").default("en"), // 'en', 'ar', 'hi', 'ur', 'fr'
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Subscription table for Polar webhook data
export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  createdAt: timestamp("createdAt").notNull(),
  modifiedAt: timestamp("modifiedAt"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  recurringInterval: text("recurringInterval").notNull(),
  status: text("status").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").notNull().default(false),
  canceledAt: timestamp("canceledAt"),
  startedAt: timestamp("startedAt").notNull(),
  endsAt: timestamp("endsAt"),
  endedAt: timestamp("endedAt"),
  customerId: text("customerId").notNull(),
  productId: text("productId").notNull(),
  discountId: text("discountId"),
  checkoutId: text("checkoutId").notNull(),
  customerCancellationReason: text("customerCancellationReason"),
  customerCancellationComment: text("customerCancellationComment"),
  metadata: text("metadata"), // JSON string
  customFieldData: text("customFieldData"), // JSON string
  userId: text("userId").references(() => user.id),
});

// ================================
// MIRATH LEGAL SPECIFIC TABLES
// ================================

// Law Firms
export const lawFirms = pgTable("law_firms", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  licenseNumber: text("license_number").notNull().unique(),
  email: text("email").notNull(),
  phone: text("phone"),
  establishedYear: integer("established_year"),
  address: json("address").$type<{
    street: string;
    city: string;
    emirate: string;
    poBox?: string;
    country: string;
  }>(),
  practiceAreas: json("practice_areas").$type<string[]>().default([]),
  logoUrl: text("logo_url"),
  
  // License and verification details
  licenseExpiry: date("license_expiry"),
  barAssociation: text("bar_association"),
  insuranceNumber: text("insurance_number"),
  customDomain: text("custom_domain"),
  isVerified: boolean("is_verified").default(false),
  
  settings: json("settings").$type<{
    branding?: {
      primaryColor?: string;
      secondaryColor?: string;
      customCss?: string;
    };
    billing?: {
      defaultHourlyRate?: number;
      currency?: string;
    };
    notifications?: {
      emailNotifications?: boolean;
      smsNotifications?: boolean;
    };
  }>().default({}),
  subscriptionTier: text("subscription_tier").default("starter"), // 'starter', 'professional', 'enterprise'
  subscriptionStatus: text("subscription_status").default("pending_verification"), // 'pending_verification', 'info_requested', 'rejected', 'trial', 'active', 'suspended', 'cancelled'
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  nameIdx: index("law_firms_name_idx").on(table.name),
  licenseIdx: index("law_firms_license_idx").on(table.licenseNumber),
  verifiedIdx: index("law_firms_verified_idx").on(table.isVerified),
}));

// Law Firm Members
export const lawFirmMembers = pgTable("law_firm_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  lawFirmId: uuid("law_firm_id").notNull().references(() => lawFirms.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'admin', 'senior_lawyer', 'lawyer', 'support'
  permissions: json("permissions").$type<string[]>().default([]),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
}, (table) => ({
  firmUserIdx: index("law_firm_members_firm_user_idx").on(table.lawFirmId, table.userId),
  uniqueFirmUser: index("law_firm_members_unique_firm_user").on(table.lawFirmId, table.userId),
}));

// Matters (Cases) - Enhanced for comprehensive estate planning workflow
export const matters = pgTable("matters", {
  id: uuid("id").primaryKey().defaultRandom(),
  lawFirmId: uuid("law_firm_id").notNull().references(() => lawFirms.id, { onDelete: "cascade" }),
  clientId: text("client_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  
  // Lawyer Assignment
  primaryLawyerId: text("primary_lawyer_id").references(() => user.id),
  assignedLawyerId: text("assigned_lawyer_id").references(() => user.id), // Backwards compatibility
  assignedLawyers: json("assigned_lawyers").$type<string[]>().default([]),
  
  // Matter Details
  matterNumber: text("matter_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  matterType: text("matter_type").notNull(), // 'simple_will', 'complex_will', 'business_succession', 'trust_setup', 'digital_assets', 'guardianship_will', 'will_amendment', 'estate_administration'
  
  // Enhanced Status Workflow (11 statuses)
  status: text("status").default("intake"), // 'intake', 'assessment', 'document_generation', 'lawyer_review', 'client_review', 'difc_preparation', 'difc_submitted', 'registered', 'completed', 'on_hold', 'cancelled'
  priority: text("priority").default("normal"), // 'low', 'normal', 'high', 'urgent'
  
  // Timeline Management
  dueDate: date("due_date"),
  targetCompletionDate: date("target_completion_date"),
  actualCompletionDate: date("actual_completion_date"),
  
  // Estate Planning Specific Fields
  estateValue: decimal("estate_value", { precision: 15, scale: 2 }),
  complexityScore: integer("complexity_score").default(1), // 1-10 complexity rating
  difcEligible: boolean("difc_eligible").default(true),
  
  // Client Data Storage
  intakeData: json("intake_data").$type<{
    personalInfo?: {
      fullName: string;
      emiratesId: string;
      visaStatus: 'residence' | 'investor' | 'golden' | 'employment' | 'other';
      nationality: string;
      maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
      contactInfo: any;
    };
    assets?: any[];
    beneficiaries?: any[];
    existingWills?: any[];
    specialCircumstances?: string[];
  }>().default({}),
  
  assessmentData: json("assessment_data").$type<{
    complexityScore?: number;
    estimatedTimeline?: number;
    riskFactors?: string[];
    estimatedFees?: number;
    complianceFlags?: string[];
    aiRecommendations?: string[];
  }>().default({}),
  
  // AI Integration
  aiGenerationJobs: json("ai_generation_jobs").$type<string[]>().default([]),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  firmStatusIdx: index("matters_firm_status_idx").on(table.lawFirmId, table.status),
  clientIdx: index("matters_client_idx").on(table.clientId),
  primaryLawyerIdx: index("matters_primary_lawyer_idx").on(table.primaryLawyerId),
  assignedLawyerIdx: index("matters_assigned_lawyer_idx").on(table.assignedLawyerId), // Backwards compatibility
  complexityIdx: index("matters_complexity_idx").on(table.complexityScore),
  dueDateIdx: index("matters_due_date_idx").on(table.dueDate),
  uniqueMatterNumber: index("matters_unique_matter_number").on(table.lawFirmId, table.matterNumber),
}));

// Wills
export const wills = pgTable("wills", {
  id: uuid("id").primaryKey().defaultRandom(),
  matterId: uuid("matter_id").notNull().references(() => matters.id, { onDelete: "cascade" }),
  testatorId: text("testator_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  willType: text("will_type").notNull(), // 'simple', 'complex', 'business_succession', 'digital_assets'
  status: text("status").default("draft"), // 'draft', 'under_review', 'client_review', 'final', 'registered'
  language: text("language").default("en"), // 'en', 'ar'
  
  // Personal Information
  personalInfo: json("personal_info").$type<{
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
  }>().notNull().default({}),
  
  // Assets
  assets: json("assets").$type<Array<{
    id: string;
    type: 'property' | 'bank_account' | 'investment' | 'business' | 'digital';
    name: string;
    description: string;
    estimatedValue: number;
    currency: string;
    jurisdiction: string;
    details: any;
  }>>().default([]),
  
  // Beneficiaries
  beneficiaries: json("beneficiaries").$type<Array<{
    id: string;
    type: 'individual' | 'charity' | 'organization';
    fullName: string;
    relationship: string;
    dateOfBirth?: string;
    nationality?: string;
    contactInfo?: any;
    inheritancePercentage?: number;
    specificAssets?: string[];
    conditions?: string[];
    isContingent: boolean;
  }>>().default([]),
  
  // Guardians (for minor children)
  guardians: json("guardians").$type<Array<{
    id: string;
    fullName: string;
    relationship: string;
    contactInfo: any;
    isPrimary: boolean;
    conditions?: string;
  }>>().default([]),
  
  // Executors
  executors: json("executors").$type<Array<{
    id: string;
    fullName: string;
    relationship: string;
    contactInfo: any;
    isPrimary: boolean;
    powers?: string[];
  }>>().default([]),
  
  // Special Instructions
  specialInstructions: text("special_instructions"),
  
  // DIFC Specific
  difcCompliant: boolean("difc_compliant").default(false),
  difcRegistrationNumber: text("difc_registration_number"),
  difcRegistrationDate: date("difc_registration_date"),
  
  // AI Analysis
  aiAnalysis: json("ai_analysis").$type<{
    riskLevel?: 'low' | 'medium' | 'high';
    keyRisks?: string[];
    recommendations?: string[];
    crossBorderImplications?: any[];
    confidenceScore?: number;
    lastAnalyzed?: string;
  }>().default({}),
  
  complianceChecks: json("compliance_checks").$type<{
    difcCompliant?: boolean;
    issues?: Array<{
      ruleCode: string;
      severity: 'info' | 'warning' | 'error';
      description: string;
      suggestion: string;
    }>;
    lastChecked?: string;
  }>().default({}),
  
  // Versions
  version: integer("version").default(1),
  parentWillId: uuid("parent_will_id").references(() => wills.id),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  testatorStatusIdx: index("wills_testator_status_idx").on(table.testatorId, table.status),
  matterIdx: index("wills_matter_idx").on(table.matterId),
  difcRegistrationIdx: index("wills_difc_registration_idx").on(table.difcRegistrationNumber),
}));

// Will Documents
export const willDocuments = pgTable("will_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  willId: uuid("will_id").notNull().references(() => wills.id, { onDelete: "cascade" }),
  documentType: text("document_type").notNull(), // 'draft', 'final', 'difc_submission', 'certificate'
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  generatedBy: text("generated_by"), // 'ai', 'lawyer', 'system'
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
}, (table) => ({
  willTypeIdx: index("will_documents_will_type_idx").on(table.willId, table.documentType),
}));

// DIFC Compliance Rules
export const difcComplianceRules = pgTable("difc_compliance_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  ruleType: text("rule_type").notNull(), // 'mandatory', 'recommended', 'warning'
  ruleCode: text("rule_code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  validationLogic: json("validation_logic").$type<{
    conditions: any[];
    actions: any[];
    severity: 'info' | 'warning' | 'error';
  }>().notNull(),
  effectiveDate: date("effective_date").notNull(),
  expiryDate: date("expiry_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  ruleCodeIdx: index("difc_rules_code_idx").on(table.ruleCode),
  activeIdx: index("difc_rules_active_idx").on(table.isActive),
}));

// AI Processing Jobs
export const aiJobs = pgTable("ai_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  willId: uuid("will_id").references(() => wills.id, { onDelete: "cascade" }),
  jobType: text("job_type").notNull(), // 'will_generation', 'compliance_check', 'risk_analysis'
  status: text("status").default("pending"), // 'pending', 'in_progress', 'completed', 'failed'
  inputData: json("input_data"),
  outputData: json("output_data"),
  parameters: json("parameters"), // Additional generation parameters
  errorMessage: text("error_message"),
  processingTimeMs: integer("processing_time_ms"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  statusIdx: index("ai_jobs_status_idx").on(table.status, table.createdAt),
  willIdx: index("ai_jobs_will_idx").on(table.willId),
  userIdx: index("ai_jobs_user_idx").on(table.userId),
}));

// Time Entries for Billing
export const timeEntries = pgTable("time_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  matterId: uuid("matter_id").notNull().references(() => matters.id, { onDelete: "cascade" }),
  lawyerId: text("lawyer_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  activityType: text("activity_type").notNull(), // 'consultation', 'drafting', 'review', 'research', 'admin'
  description: text("description").notNull(),
  billableHours: decimal("billable_hours", { precision: 4, scale: 2 }).notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  entryDate: date("entry_date").notNull(),
  isBillable: boolean("is_billable").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  matterDateIdx: index("time_entries_matter_date_idx").on(table.matterId, table.entryDate),
  lawyerIdx: index("time_entries_lawyer_idx").on(table.lawyerId),
}));

// Matter Tasks - Task management and workflow automation
export const matterTasks = pgTable("matter_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  matterId: uuid("matter_id").notNull().references(() => matters.id, { onDelete: "cascade" }),
  assignedTo: text("assigned_to").references(() => user.id),
  
  // Task Details
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("pending"), // 'pending', 'in_progress', 'completed', 'cancelled', 'overdue'
  priority: text("priority").default("normal"), // 'low', 'normal', 'high', 'urgent'
  
  // Timeline
  dueDate: date("due_date"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  
  // AI Integration
  aiAssisted: boolean("ai_assisted").default(false),
  aiConfidence: decimal("ai_confidence", { precision: 3, scale: 2 }),
  
  // Dependencies
  dependencies: json("dependencies").$type<string[]>().default([]), // Task IDs this task depends on
  
  // Time Tracking
  estimatedHours: decimal("estimated_hours", { precision: 4, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 4, scale: 2 }),
  billable: boolean("billable").default(true),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  matterStatusIdx: index("matter_tasks_matter_status_idx").on(table.matterId, table.status),
  assigneeStatusIdx: index("matter_tasks_assignee_status_idx").on(table.assignedTo, table.status),
  dueDateIdx: index("matter_tasks_due_date_idx").on(table.dueDate),
  priorityIdx: index("matter_tasks_priority_idx").on(table.priority),
}));

// Matter Timeline - Activity tracking and audit trail
export const matterTimeline = pgTable("matter_timeline", {
  id: uuid("id").primaryKey().defaultRandom(),
  matterId: uuid("matter_id").notNull().references(() => matters.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id), // Null for system events
  
  // Event Details
  eventType: text("event_type").notNull(), // 'status_change', 'task_created', 'task_completed', 'document_generated', 'client_communication', 'difc_submission'
  title: text("title").notNull(),
  description: text("description"),
  
  // Event Metadata
  metadata: json("metadata").$type<{
    previousStatus?: string;
    newStatus?: string;
    taskId?: string;
    documentId?: string;
    emailSent?: boolean;
    difcSubmissionId?: string;
    aiJobId?: string;
    billableTime?: number;
    [key: string]: any;
  }>().default({}),
  
  // Visibility
  clientVisible: boolean("client_visible").default(false), // Should this event be visible to client?
  internalOnly: boolean("internal_only").default(false), // Internal lawyer notes only
  
  timestamp: timestamp("timestamp").notNull().defaultNow(),
}, (table) => ({
  matterTimeIdx: index("matter_timeline_matter_time_idx").on(table.matterId, table.timestamp.desc()),
  eventTypeIdx: index("matter_timeline_event_type_idx").on(table.eventType),
  clientVisibleIdx: index("matter_timeline_client_visible_idx").on(table.clientVisible),
}));

// DIFC Registrations - UAE-specific registration workflow
export const difcRegistrations = pgTable("difc_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  matterId: uuid("matter_id").notNull().references(() => matters.id, { onDelete: "cascade" }),
  willId: uuid("will_id").references(() => wills.id),
  
  // DIFC Submission Details
  submissionId: text("submission_id"), // DIFC internal reference
  registrationNumber: text("registration_number"), // Final DIFC registration number
  status: text("status").default("preparing"), // 'preparing', 'ready_to_submit', 'submitted', 'under_review', 'approved', 'registered', 'rejected'
  
  // Timeline
  submissionDate: date("submission_date"),
  reviewStartDate: date("review_start_date"),
  registrationDate: date("registration_date"),
  certificateDate: date("certificate_date"),
  expiryDate: date("expiry_date"),
  
  // Fees and Payments
  registrationFee: decimal("registration_fee", { precision: 8, scale: 2 }),
  processingFee: decimal("processing_fee", { precision: 8, scale: 2 }),
  additionalFees: decimal("additional_fees", { precision: 8, scale: 2 }),
  totalFees: decimal("total_fees", { precision: 8, scale: 2 }),
  feesPaid: boolean("fees_paid").default(false),
  paymentReference: text("payment_reference"),
  
  // Documents
  certificateUrl: text("certificate_url"),
  submissionPackageUrl: text("submission_package_url"),
  
  // DIFC Contact Information
  difcContactPerson: text("difc_contact_person"),
  appointmentDate: timestamp("appointment_date"),
  appointmentNotes: text("appointment_notes"),
  
  // Compliance
  complianceChecked: boolean("compliance_checked").default(false),
  complianceDate: timestamp("compliance_date"),
  complianceNotes: text("compliance_notes"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  matterStatusIdx: index("difc_registrations_matter_status_idx").on(table.matterId, table.status),
  submissionDateIdx: index("difc_registrations_submission_date_idx").on(table.submissionDate),
  registrationNumberIdx: index("difc_registrations_registration_number_idx").on(table.registrationNumber),
  statusIdx: index("difc_registrations_status_idx").on(table.status),
}));

// Matter Documents - Extended document management for matters
export const matterDocuments = pgTable("matter_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  matterId: uuid("matter_id").notNull().references(() => matters.id, { onDelete: "cascade" }),
  willId: uuid("will_id").references(() => wills.id), // Link to will if applicable
  
  // Document Details
  documentType: text("document_type").notNull(), // 'intake_form', 'assessment_report', 'ai_generated_will', 'revised_will', 'client_review', 'final_will', 'difc_submission', 'certificate', 'supporting_document'
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  
  // Version Control
  version: integer("version").default(1),
  parentDocumentId: uuid("parent_document_id").references(() => matterDocuments.id),
  isLatestVersion: boolean("is_latest_version").default(true),
  
  // Generation Info
  generatedBy: text("generated_by"), // 'ai', 'lawyer', 'client', 'system'
  generationJobId: text("generation_job_id"), // Reference to AI job if AI-generated
  
  // Approval Workflow
  status: text("status").default("draft"), // 'draft', 'pending_review', 'approved', 'rejected', 'final'
  reviewedBy: text("reviewed_by").references(() => user.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  
  // Client Access
  clientVisible: boolean("client_visible").default(false),
  clientDownloadable: boolean("client_downloadable").default(false),
  requiresClientSignature: boolean("requires_client_signature").default(false),
  clientSignedAt: timestamp("client_signed_at"),
  
  // Security
  encrypted: boolean("encrypted").default(false),
  accessLevel: text("access_level").default("internal"), // 'public', 'client', 'internal', 'admin'
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  matterTypeIdx: index("matter_documents_matter_type_idx").on(table.matterId, table.documentType),
  latestVersionIdx: index("matter_documents_latest_version_idx").on(table.isLatestVersion),
  clientVisibleIdx: index("matter_documents_client_visible_idx").on(table.clientVisible),
  statusIdx: index("matter_documents_status_idx").on(table.status),
}));

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id),
  action: text("action").notNull(), // 'create', 'update', 'delete', 'view', 'generate', 'submit'
  resource: text("resource").notNull(), // 'will', 'matter', 'document', 'client'
  resourceId: text("resource_id").notNull(),
  details: json("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  firmId: uuid("firm_id").references(() => lawFirms.id),
  sensitive: boolean("sensitive").default(false),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
}, (table) => ({
  timestampIdx: index("audit_logs_timestamp_idx").on(table.timestamp),
  userIdx: index("audit_logs_user_idx").on(table.userId),
  resourceIdx: index("audit_logs_resource_idx").on(table.resource, table.resourceId),
  firmIdx: index("audit_logs_firm_idx").on(table.firmId),
}));
