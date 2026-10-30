import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_downloads_action" AS ENUM('download', 'view');
  CREATE TABLE "students_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "students" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "downloads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"student_id" integer NOT NULL,
  	"resource_id" integer,
  	"title" varchar,
  	"resource_type" varchar,
  	"action" "enum_downloads_action" DEFAULT 'download',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "students_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "downloads_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "students_id" integer;
  ALTER TABLE "students_sessions" ADD CONSTRAINT "students_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "downloads" ADD CONSTRAINT "downloads_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "downloads" ADD CONSTRAINT "downloads_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "students_sessions_order_idx" ON "students_sessions" USING btree ("_order");
  CREATE INDEX "students_sessions_parent_id_idx" ON "students_sessions" USING btree ("_parent_id");
  CREATE INDEX "students_phone_idx" ON "students" USING btree ("phone");
  CREATE INDEX "students_updated_at_idx" ON "students" USING btree ("updated_at");
  CREATE INDEX "students_created_at_idx" ON "students" USING btree ("created_at");
  CREATE UNIQUE INDEX "students_email_idx" ON "students" USING btree ("email");
  CREATE INDEX "downloads_student_idx" ON "downloads" USING btree ("student_id");
  CREATE INDEX "downloads_resource_idx" ON "downloads" USING btree ("resource_id");
  CREATE INDEX "downloads_updated_at_idx" ON "downloads" USING btree ("updated_at");
  CREATE INDEX "downloads_created_at_idx" ON "downloads" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_students_fk" FOREIGN KEY ("students_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_downloads_fk" FOREIGN KEY ("downloads_id") REFERENCES "public"."downloads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_students_fk" FOREIGN KEY ("students_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_students_id_idx" ON "payload_locked_documents_rels" USING btree ("students_id");
  CREATE INDEX "payload_locked_documents_rels_downloads_id_idx" ON "payload_locked_documents_rels" USING btree ("downloads_id");
  CREATE INDEX "payload_preferences_rels_students_id_idx" ON "payload_preferences_rels" USING btree ("students_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "students_sessions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "students" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "downloads" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "students_sessions" CASCADE;
  DROP TABLE "students" CASCADE;
  DROP TABLE "downloads" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_students_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_downloads_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_students_fk";
  
  DROP INDEX "payload_locked_documents_rels_students_id_idx";
  DROP INDEX "payload_locked_documents_rels_downloads_id_idx";
  DROP INDEX "payload_preferences_rels_students_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "students_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "downloads_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "students_id";
  DROP TYPE "public"."enum_downloads_action";`)
}
