ALTER TABLE "issues"
ADD COLUMN "error_name" TEXT,
ADD COLUMN "error_code" TEXT,
ADD COLUMN "error_message" TEXT,
ADD COLUMN "error_stack" TEXT,
ADD COLUMN "api_method" TEXT,
ADD COLUMN "api_url" TEXT,
ADD COLUMN "api_status" INTEGER;
