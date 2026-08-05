-- 이슈 코멘트. 멤버는 작성 시점 프로필 스냅샷, 익명 테스터는 guest_key로만 식별한다.

CREATE TABLE "issue_comments" (
    "id" SERIAL NOT NULL,
    "issue_id" INTEGER NOT NULL,
    "guest_key" TEXT,
    "author_name" TEXT,
    "author_avatar_url" TEXT,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "issue_comments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "issue_comments_issue_id_created_at_idx" ON "issue_comments"("issue_id", "created_at");

ALTER TABLE "issue_comments" ADD CONSTRAINT "issue_comments_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
