ALTER TABLE "law_firms" ADD COLUMN "established_year" integer;--> statement-breakpoint
ALTER TABLE "law_firms" ADD COLUMN "practice_areas" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "law_firms" ADD COLUMN "license_expiry" date;--> statement-breakpoint
ALTER TABLE "law_firms" ADD COLUMN "bar_association" text;--> statement-breakpoint
ALTER TABLE "law_firms" ADD COLUMN "insurance_number" text;--> statement-breakpoint
ALTER TABLE "law_firms" ADD COLUMN "custom_domain" text;--> statement-breakpoint
ALTER TABLE "law_firms" ADD COLUMN "is_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "law_firms" ADD COLUMN "subscription_status" text DEFAULT 'trial';--> statement-breakpoint
CREATE INDEX "law_firms_verified_idx" ON "law_firms" USING btree ("is_verified");