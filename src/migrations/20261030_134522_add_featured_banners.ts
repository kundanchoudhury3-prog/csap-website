import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "featured_banners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"link" varchar DEFAULT '/#courses' NOT NULL,
  	"new_tab" boolean DEFAULT false,
  	"active" boolean DEFAULT true,
  	"order" numeric DEFAULT 10,
  	"source_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "featured_banners_id" integer;
  ALTER TABLE "featured_banners" ADD CONSTRAINT "featured_banners_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "featured_banners_image_idx" ON "featured_banners" USING btree ("image_id");
  CREATE INDEX "featured_banners_source_url_idx" ON "featured_banners" USING btree ("source_url");
  CREATE INDEX "featured_banners_updated_at_idx" ON "featured_banners" USING btree ("updated_at");
  CREATE INDEX "featured_banners_created_at_idx" ON "featured_banners" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_featured_banners_fk" FOREIGN KEY ("featured_banners_id") REFERENCES "public"."featured_banners"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_featured_banners_id_idx" ON "payload_locked_documents_rels" USING btree ("featured_banners_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "featured_banners" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "featured_banners" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_featured_banners_fk";
  
  DROP INDEX "payload_locked_documents_rels_featured_banners_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "featured_banners_id";`)
}
