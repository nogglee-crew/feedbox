CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'MEMBER');
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO');
CREATE TYPE "BillingStatus" AS ENUM ('UNPAID', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED');
CREATE TYPE "AccessOverride" AS ENUM ('NONE', 'ADMIN', 'TEST');
CREATE TYPE "ReleaseStatus" AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'CLOSED');

CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "billing_status" "BillingStatus" NOT NULL DEFAULT 'UNPAID',
    "access_override" "AccessOverride" NOT NULL DEFAULT 'NONE',
    "billing_provider" TEXT,
    "billing_customer_id" TEXT,
    "billing_subscription_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "organization_members" (
    "id" UUID NOT NULL,
    "org_id" UUID NOT NULL,
    "auth_user_id" UUID,
    "email" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL DEFAULT 'MEMBER',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "org_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "project_key" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "base_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "releases" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "version" TEXT NOT NULL,
    "status" "ReleaseStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "releases_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "qa_sessions" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "project_id" UUID NOT NULL,
    "release_id" UUID NOT NULL,
    "created_by" TEXT,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "qa_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "issues" (
    "id" SERIAL NOT NULL,
    "project_id" UUID NOT NULL,
    "release_id" UUID NOT NULL,
    "session_id" UUID,
    "page_url" TEXT NOT NULL,
    "selector" TEXT NOT NULL,
    "element_text" TEXT,
    "viewport_width" INTEGER,
    "viewport_height" INTEGER,
    "browser" TEXT,
    "memo" TEXT NOT NULL,
    "screenshot_url" TEXT,
    "status" "IssueStatus" NOT NULL DEFAULT 'OPEN',
    "assignee" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subscription_interests" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "org_id" UUID,
    "privacy_agreed_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subscription_interests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "organizations_billing_customer_id_key" ON "organizations"("billing_customer_id");
CREATE UNIQUE INDEX "organizations_billing_subscription_id_key" ON "organizations"("billing_subscription_id");
CREATE INDEX "organization_members_email_idx" ON "organization_members"("email");
CREATE INDEX "organization_members_auth_user_id_idx" ON "organization_members"("auth_user_id");
CREATE UNIQUE INDEX "organization_members_org_id_email_key" ON "organization_members"("org_id", "email");
CREATE UNIQUE INDEX "projects_project_key_key" ON "projects"("project_key");
CREATE INDEX "projects_org_id_created_at_idx" ON "projects"("org_id", "created_at");
CREATE INDEX "releases_project_id_created_at_idx" ON "releases"("project_id", "created_at");
CREATE UNIQUE INDEX "releases_project_id_version_key" ON "releases"("project_id", "version");
CREATE UNIQUE INDEX "qa_sessions_token_key" ON "qa_sessions"("token");
CREATE INDEX "qa_sessions_release_id_created_at_idx" ON "qa_sessions"("release_id", "created_at");
CREATE INDEX "issues_release_id_status_created_at_idx" ON "issues"("release_id", "status", "created_at");
CREATE UNIQUE INDEX "subscription_interests_email_key" ON "subscription_interests"("email");

ALTER TABLE "organization_members"
ADD CONSTRAINT "organization_members_org_id_fkey"
FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "projects"
ADD CONSTRAINT "projects_org_id_fkey"
FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "releases"
ADD CONSTRAINT "releases_project_id_fkey"
FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "qa_sessions"
ADD CONSTRAINT "qa_sessions_project_id_fkey"
FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "qa_sessions"
ADD CONSTRAINT "qa_sessions_release_id_fkey"
FOREIGN KEY ("release_id") REFERENCES "releases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "issues"
ADD CONSTRAINT "issues_project_id_fkey"
FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "issues"
ADD CONSTRAINT "issues_release_id_fkey"
FOREIGN KEY ("release_id") REFERENCES "releases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "issues"
ADD CONSTRAINT "issues_session_id_fkey"
FOREIGN KEY ("session_id") REFERENCES "qa_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "subscription_interests"
ADD CONSTRAINT "subscription_interests_org_id_fkey"
FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Prisma uses the database connection directly. Supabase anon/authenticated clients
-- must not access application tables through PostgREST.
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organization_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "releases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "qa_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "issues" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscription_interests" ENABLE ROW LEVEL SECURITY;
