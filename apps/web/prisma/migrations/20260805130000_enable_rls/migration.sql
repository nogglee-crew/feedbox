-- Supabase는 public 스키마를 PostgREST로 자동 노출한다. RLS가 꺼진 테이블은
-- 공개 anon 키만으로 읽고 쓸 수 있어(api_key, 세션 토큰 포함) 전부 차단한다.
-- 앱은 Prisma(테이블 소유자, RLS 미적용)로만 접근하므로 정책 없이 켜기만 하면 된다.

ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organization_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "releases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "qa_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "issues" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "issue_comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscription_interests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "analytics_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
