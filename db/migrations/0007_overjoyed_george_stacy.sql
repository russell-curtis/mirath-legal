CREATE TABLE "difc_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"matter_id" uuid NOT NULL,
	"will_id" uuid,
	"submission_id" text,
	"registration_number" text,
	"status" text DEFAULT 'preparing',
	"submission_date" date,
	"review_start_date" date,
	"registration_date" date,
	"certificate_date" date,
	"expiry_date" date,
	"registration_fee" numeric(8, 2),
	"processing_fee" numeric(8, 2),
	"additional_fees" numeric(8, 2),
	"total_fees" numeric(8, 2),
	"fees_paid" boolean DEFAULT false,
	"payment_reference" text,
	"certificate_url" text,
	"submission_package_url" text,
	"difc_contact_person" text,
	"appointment_date" timestamp,
	"appointment_notes" text,
	"compliance_checked" boolean DEFAULT false,
	"compliance_date" timestamp,
	"compliance_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matter_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"matter_id" uuid NOT NULL,
	"will_id" uuid,
	"document_type" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"version" integer DEFAULT 1,
	"parent_document_id" uuid,
	"is_latest_version" boolean DEFAULT true,
	"generated_by" text,
	"generation_job_id" text,
	"status" text DEFAULT 'draft',
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"review_notes" text,
	"client_visible" boolean DEFAULT false,
	"client_downloadable" boolean DEFAULT false,
	"requires_client_signature" boolean DEFAULT false,
	"client_signed_at" timestamp,
	"encrypted" boolean DEFAULT false,
	"access_level" text DEFAULT 'internal',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matter_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"matter_id" uuid NOT NULL,
	"assigned_to" text,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'pending',
	"priority" text DEFAULT 'normal',
	"due_date" date,
	"started_at" timestamp,
	"completed_at" timestamp,
	"ai_assisted" boolean DEFAULT false,
	"ai_confidence" numeric(3, 2),
	"dependencies" json DEFAULT '[]'::json,
	"estimated_hours" numeric(4, 2),
	"actual_hours" numeric(4, 2),
	"billable" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matter_timeline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"matter_id" uuid NOT NULL,
	"user_id" text,
	"event_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"metadata" json DEFAULT '{}'::json,
	"client_visible" boolean DEFAULT false,
	"internal_only" boolean DEFAULT false,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "matters" ADD COLUMN "primary_lawyer_id" text;--> statement-breakpoint
ALTER TABLE "matters" ADD COLUMN "assigned_lawyers" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "matters" ADD COLUMN "target_completion_date" date;--> statement-breakpoint
ALTER TABLE "matters" ADD COLUMN "actual_completion_date" date;--> statement-breakpoint
ALTER TABLE "matters" ADD COLUMN "estate_value" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "matters" ADD COLUMN "complexity_score" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "matters" ADD COLUMN "difc_eligible" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "matters" ADD COLUMN "intake_data" json DEFAULT '{}'::json;--> statement-breakpoint
ALTER TABLE "matters" ADD COLUMN "assessment_data" json DEFAULT '{}'::json;--> statement-breakpoint
ALTER TABLE "matters" ADD COLUMN "ai_generation_jobs" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "difc_registrations" ADD CONSTRAINT "difc_registrations_matter_id_matters_id_fk" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "difc_registrations" ADD CONSTRAINT "difc_registrations_will_id_wills_id_fk" FOREIGN KEY ("will_id") REFERENCES "public"."wills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matter_documents" ADD CONSTRAINT "matter_documents_matter_id_matters_id_fk" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matter_documents" ADD CONSTRAINT "matter_documents_will_id_wills_id_fk" FOREIGN KEY ("will_id") REFERENCES "public"."wills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matter_documents" ADD CONSTRAINT "matter_documents_parent_document_id_matter_documents_id_fk" FOREIGN KEY ("parent_document_id") REFERENCES "public"."matter_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matter_documents" ADD CONSTRAINT "matter_documents_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matter_tasks" ADD CONSTRAINT "matter_tasks_matter_id_matters_id_fk" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matter_tasks" ADD CONSTRAINT "matter_tasks_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matter_timeline" ADD CONSTRAINT "matter_timeline_matter_id_matters_id_fk" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matter_timeline" ADD CONSTRAINT "matter_timeline_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "difc_registrations_matter_status_idx" ON "difc_registrations" USING btree ("matter_id","status");--> statement-breakpoint
CREATE INDEX "difc_registrations_submission_date_idx" ON "difc_registrations" USING btree ("submission_date");--> statement-breakpoint
CREATE INDEX "difc_registrations_registration_number_idx" ON "difc_registrations" USING btree ("registration_number");--> statement-breakpoint
CREATE INDEX "difc_registrations_status_idx" ON "difc_registrations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "matter_documents_matter_type_idx" ON "matter_documents" USING btree ("matter_id","document_type");--> statement-breakpoint
CREATE INDEX "matter_documents_latest_version_idx" ON "matter_documents" USING btree ("is_latest_version");--> statement-breakpoint
CREATE INDEX "matter_documents_client_visible_idx" ON "matter_documents" USING btree ("client_visible");--> statement-breakpoint
CREATE INDEX "matter_documents_status_idx" ON "matter_documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "matter_tasks_matter_status_idx" ON "matter_tasks" USING btree ("matter_id","status");--> statement-breakpoint
CREATE INDEX "matter_tasks_assignee_status_idx" ON "matter_tasks" USING btree ("assigned_to","status");--> statement-breakpoint
CREATE INDEX "matter_tasks_due_date_idx" ON "matter_tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "matter_tasks_priority_idx" ON "matter_tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "matter_timeline_matter_time_idx" ON "matter_timeline" USING btree ("matter_id","timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "matter_timeline_event_type_idx" ON "matter_timeline" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "matter_timeline_client_visible_idx" ON "matter_timeline" USING btree ("client_visible");--> statement-breakpoint
ALTER TABLE "matters" ADD CONSTRAINT "matters_primary_lawyer_id_user_id_fk" FOREIGN KEY ("primary_lawyer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "matters_primary_lawyer_idx" ON "matters" USING btree ("primary_lawyer_id");--> statement-breakpoint
CREATE INDEX "matters_complexity_idx" ON "matters" USING btree ("complexity_score");--> statement-breakpoint
CREATE INDEX "matters_due_date_idx" ON "matters" USING btree ("due_date");