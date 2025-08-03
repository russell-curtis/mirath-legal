ALTER TABLE "ai_jobs" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_jobs" ADD COLUMN "parameters" json;--> statement-breakpoint
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_jobs_user_idx" ON "ai_jobs" USING btree ("user_id");