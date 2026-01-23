CREATE TABLE "product_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"printful_variant_id" varchar(255) NOT NULL,
	"external_id" varchar(255),
	"name" varchar(500) NOT NULL,
	"size" varchar(100),
	"color" varchar(100),
	"retail_price" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'USD',
	"preview_url" varchar(1000),
	"in_stock" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_printful_variant_id_unique" UNIQUE("printful_variant_id")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"printful_id" varchar(255) NOT NULL,
	"external_id" varchar(255),
	"name" varchar(500) NOT NULL,
	"description" text,
	"thumbnail_url" varchar(1000),
	"synced_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_printful_id_unique" UNIQUE("printful_id")
);
--> statement-breakpoint
CREATE TABLE "sync_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"products_added" integer DEFAULT 0,
	"products_updated" integer DEFAULT 0,
	"error_message" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;