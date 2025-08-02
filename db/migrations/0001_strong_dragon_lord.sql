CREATE TABLE "ai_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"will_id" uuid,
	"job_type" text NOT NULL,
	"status" text DEFAULT 'pending',
	"input_data" json,
	"output_data" json,
	"error_message" text,
	"processing_time_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"resource" text NOT NULL,
	"resource_id" text NOT NULL,
	"details" json,
	"ip_address" text,
	"user_agent" text,
	"firm_id" uuid,
	"sensitive" boolean DEFAULT false,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "difc_compliance_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_type" text NOT NULL,
	"rule_code" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"validation_logic" json NOT NULL,
	"effective_date" date NOT NULL,
	"expiry_date" date,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "difc_compliance_rules_rule_code_unique" UNIQUE("rule_code")
);
--> statement-breakpoint
CREATE TABLE "law_firm_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"law_firm_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"permissions" json DEFAULT '[]'::json,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "law_firms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"license_number" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"address" json,
	"logo_url" text,
	"settings" json DEFAULT '{}'::json,
	"subscription_tier" text DEFAULT 'starter',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "law_firms_license_number_unique" UNIQUE("license_number")
);
--> statement-breakpoint
CREATE TABLE "matters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"law_firm_id" uuid NOT NULL,
	"client_id" text NOT NULL,
	"assigned_lawyer_id" text,
	"matter_number" text NOT NULL,
	"title" text NOT NULL,
	"matter_type" text NOT NULL,
	"status" text DEFAULT 'intake',
	"priority" text DEFAULT 'normal',
	"due_date" date,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"matter_id" uuid NOT NULL,
	"lawyer_id" text NOT NULL,
	"activity_type" text NOT NULL,
	"description" text NOT NULL,
	"billable_hours" numeric(4, 2) NOT NULL,
	"hourly_rate" numeric(8, 2) NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"entry_date" date NOT NULL,
	"is_billable" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "will_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"will_id" uuid NOT NULL,
	"document_type" text NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"generated_by" text,
	"generated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"matter_id" uuid NOT NULL,
	"testator_id" text NOT NULL,
	"will_type" text NOT NULL,
	"status" text DEFAULT 'draft',
	"language" text DEFAULT 'en',
	"personal_info" json DEFAULT '{}'::json NOT NULL,
	"assets" json DEFAULT '[]'::json,
	"beneficiaries" json DEFAULT '[]'::json,
	"guardians" json DEFAULT '[]'::json,
	"executors" json DEFAULT '[]'::json,
	"special_instructions" text,
	"difc_compliant" boolean DEFAULT false,
	"difc_registration_number" text,
	"difc_registration_date" date,
	"ai_analysis" json DEFAULT '{}'::json,
	"compliance_checks" json DEFAULT '{}'::json,
	"version" integer DEFAULT 1,
	"parent_will_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "userType" text DEFAULT 'client';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "emiratesId" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "uaePassId" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "preferredLanguage" text DEFAULT 'en';--> statement-breakpoint
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_will_id_wills_id_fk" FOREIGN KEY ("will_id") REFERENCES "public"."wills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_firm_id_law_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."law_firms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "law_firm_members" ADD CONSTRAINT "law_firm_members_law_firm_id_law_firms_id_fk" FOREIGN KEY ("law_firm_id") REFERENCES "public"."law_firms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "law_firm_members" ADD CONSTRAINT "law_firm_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matters" ADD CONSTRAINT "matters_law_firm_id_law_firms_id_fk" FOREIGN KEY ("law_firm_id") REFERENCES "public"."law_firms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matters" ADD CONSTRAINT "matters_client_id_user_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matters" ADD CONSTRAINT "matters_assigned_lawyer_id_user_id_fk" FOREIGN KEY ("assigned_lawyer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_matter_id_matters_id_fk" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_lawyer_id_user_id_fk" FOREIGN KEY ("lawyer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "will_documents" ADD CONSTRAINT "will_documents_will_id_wills_id_fk" FOREIGN KEY ("will_id") REFERENCES "public"."wills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wills" ADD CONSTRAINT "wills_matter_id_matters_id_fk" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wills" ADD CONSTRAINT "wills_testator_id_user_id_fk" FOREIGN KEY ("testator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wills" ADD CONSTRAINT "wills_parent_will_id_wills_id_fk" FOREIGN KEY ("parent_will_id") REFERENCES "public"."wills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_jobs_status_idx" ON "ai_jobs" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "ai_jobs_will_idx" ON "ai_jobs" USING btree ("will_id");--> statement-breakpoint
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "audit_logs_user_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs" USING btree ("resource","resource_id");--> statement-breakpoint
CREATE INDEX "audit_logs_firm_idx" ON "audit_logs" USING btree ("firm_id");--> statement-breakpoint
CREATE INDEX "difc_rules_code_idx" ON "difc_compliance_rules" USING btree ("rule_code");--> statement-breakpoint
CREATE INDEX "difc_rules_active_idx" ON "difc_compliance_rules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "law_firm_members_firm_user_idx" ON "law_firm_members" USING btree ("law_firm_id","user_id");--> statement-breakpoint
CREATE INDEX "law_firm_members_unique_firm_user" ON "law_firm_members" USING btree ("law_firm_id","user_id");--> statement-breakpoint
CREATE INDEX "law_firms_name_idx" ON "law_firms" USING btree ("name");--> statement-breakpoint
CREATE INDEX "law_firms_license_idx" ON "law_firms" USING btree ("license_number");--> statement-breakpoint
CREATE INDEX "matters_firm_status_idx" ON "matters" USING btree ("law_firm_id","status");--> statement-breakpoint
CREATE INDEX "matters_client_idx" ON "matters" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "matters_assigned_lawyer_idx" ON "matters" USING btree ("assigned_lawyer_id");--> statement-breakpoint
CREATE INDEX "matters_unique_matter_number" ON "matters" USING btree ("law_firm_id","matter_number");--> statement-breakpoint
CREATE INDEX "time_entries_matter_date_idx" ON "time_entries" USING btree ("matter_id","entry_date");--> statement-breakpoint
CREATE INDEX "time_entries_lawyer_idx" ON "time_entries" USING btree ("lawyer_id");--> statement-breakpoint
CREATE INDEX "will_documents_will_type_idx" ON "will_documents" USING btree ("will_id","document_type");--> statement-breakpoint
CREATE INDEX "wills_testator_status_idx" ON "wills" USING btree ("testator_id","status");--> statement-breakpoint
CREATE INDEX "wills_matter_idx" ON "wills" USING btree ("matter_id");--> statement-breakpoint
CREATE INDEX "wills_difc_registration_idx" ON "wills" USING btree ("difc_registration_number");