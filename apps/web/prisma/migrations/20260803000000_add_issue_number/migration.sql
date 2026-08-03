-- 프로젝트 단위 이슈 번호. 전역 id를 그대로 노출하면 다른 고객사의 유입량이 드러난다.

ALTER TABLE "projects" ADD COLUMN "issue_seq" INTEGER NOT NULL DEFAULT 0;

-- 백필 동안에는 값이 없는 행이 존재하므로 우선 nullable로 만든다
ALTER TABLE "issues" ADD COLUMN "number" INTEGER;

-- 기존 이슈에 접수 순서대로 번호를 매긴다. created_at이 같을 때를 대비해 id를 보조 정렬로 둔다
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at, id) AS seq
  FROM "issues"
)
UPDATE "issues" AS i
SET "number" = numbered.seq
FROM numbered
WHERE i.id = numbered.id;

-- 채번기를 백필 결과에 맞춘다. 이슈가 없는 프로젝트는 0으로 남는다
UPDATE "projects" AS p
SET "issue_seq" = COALESCE((SELECT MAX("number") FROM "issues" WHERE "project_id" = p.id), 0);

ALTER TABLE "issues" ALTER COLUMN "number" SET NOT NULL;

CREATE UNIQUE INDEX "issues_project_id_number_key" ON "issues"("project_id", "number");
