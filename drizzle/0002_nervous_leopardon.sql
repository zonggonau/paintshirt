DROP TABLE "account" CASCADE;--> statement-breakpoint
DROP TABLE "session" CASCADE;--> statement-breakpoint
DROP TABLE "user" CASCADE;--> statement-breakpoint
DROP TABLE "verificationToken" CASCADE;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "variants_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "synced_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_ignored" boolean DEFAULT false;