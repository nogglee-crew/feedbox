ALTER TABLE "organizations" ADD COLUMN "slug" TEXT;

UPDATE "organizations"
SET "slug" = substring("id"::text from 1 for 8)
WHERE "slug" IS NULL;

ALTER TABLE "organizations" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

ALTER TABLE "organizations"
ADD CONSTRAINT "organizations_slug_format_check"
CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
