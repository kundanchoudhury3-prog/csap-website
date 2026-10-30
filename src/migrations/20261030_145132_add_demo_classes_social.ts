import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "demo_classes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"youtube_url" varchar NOT NULL,
  	"title" varchar,
  	"subject" varchar,
  	"thumbnail_id" integer,
  	"video_id" varchar,
  	"show_on_home" boolean DEFAULT true,
  	"active" boolean DEFAULT true,
  	"order" numeric DEFAULT 10,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "site_settings_social" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_settings_social" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "demo_classes_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "phone2" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "follow_facebook" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "follow_instagram" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "follow_youtube" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "follow_telegram" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "follow_x" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "follow_linkedin" varchar;
  ALTER TABLE "demo_classes" ADD CONSTRAINT "demo_classes_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "demo_classes_thumbnail_idx" ON "demo_classes" USING btree ("thumbnail_id");
  CREATE INDEX "demo_classes_updated_at_idx" ON "demo_classes" USING btree ("updated_at");
  CREATE INDEX "demo_classes_created_at_idx" ON "demo_classes" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_demo_classes_fk" FOREIGN KEY ("demo_classes_id") REFERENCES "public"."demo_classes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_demo_classes_id_idx" ON "payload_locked_documents_rels" USING btree ("demo_classes_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_settings_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  ALTER TABLE "demo_classes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "demo_classes" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_demo_classes_fk";
  
  DROP INDEX "payload_locked_documents_rels_demo_classes_id_idx";
  ALTER TABLE "site_settings_social" ADD CONSTRAINT "site_settings_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_social_order_idx" ON "site_settings_social" USING btree ("_order");
  CREATE INDEX "site_settings_social_parent_id_idx" ON "site_settings_social" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "demo_classes_id";
  ALTER TABLE "site_settings" DROP COLUMN "phone2";
  ALTER TABLE "site_settings" DROP COLUMN "follow_facebook";
  ALTER TABLE "site_settings" DROP COLUMN "follow_instagram";
  ALTER TABLE "site_settings" DROP COLUMN "follow_youtube";
  ALTER TABLE "site_settings" DROP COLUMN "follow_telegram";
  ALTER TABLE "site_settings" DROP COLUMN "follow_x";
  ALTER TABLE "site_settings" DROP COLUMN "follow_linkedin";`)
}
