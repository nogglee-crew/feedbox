-- 체인지로그 마지막 확인 시각. 최신 항목 날짜와 비교해 미확인 뱃지를 만든다.

ALTER TABLE "organization_members" ADD COLUMN "changelog_seen_at" TIMESTAMPTZ(6);
