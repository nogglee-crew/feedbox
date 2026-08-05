-- 멤버 코멘트의 본인 수정/삭제 판정용. 기존 코멘트는 소유자를 복원할 수 없어 null로 남는다.

ALTER TABLE "issue_comments" ADD COLUMN "author_user_id" UUID;
