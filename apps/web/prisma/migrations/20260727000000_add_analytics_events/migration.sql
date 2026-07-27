-- CreateTable
CREATE TABLE "analytics_events" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "anon_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "auth_user_id" UUID,
    "org_id" UUID,
    "path" TEXT,
    "referrer" TEXT,
    "country" TEXT,
    "params" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_events_name_created_at_idx" ON "analytics_events"("name", "created_at");

-- CreateIndex
CREATE INDEX "analytics_events_org_id_created_at_idx" ON "analytics_events"("org_id", "created_at");

-- CreateIndex
CREATE INDEX "analytics_events_auth_user_id_created_at_idx" ON "analytics_events"("auth_user_id", "created_at");
