import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "featured_banners" ALTER COLUMN "link" DROP DEFAULT;
  ALTER TABLE "featured_banners" ALTER COLUMN "link" DROP NOT NULL;
  ALTER TABLE "featured_banners" ALTER COLUMN "new_tab" SET DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "featured_banners" ALTER COLUMN "link" SET DEFAULT '/#courses';
  ALTER TABLE "featured_banners" ALTER COLUMN "link" SET NOT NULL;
  ALTER TABLE "featured_banners" ALTER COLUMN "new_tab" SET DEFAULT false;`)
}
