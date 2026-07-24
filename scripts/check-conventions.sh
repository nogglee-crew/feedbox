#!/usr/bin/env bash
set -u

cd "$(dirname "$0")/.."
fail=0

report_matches() {
  local label="$1"
  local pattern="$2"

  local bad=""
  local file
  while IFS= read -r file; do
    if grep -qE "$pattern" "$file"; then
      bad="${bad}${file}"$'\n'
    fi
  done

  if [ -n "$bad" ]; then
    echo "FAIL: $label"
    printf "%s" "$bad"
    fail=1
  fi
}

report_matches \
  "domain must not import framework or infrastructure modules" \
  "from[[:space:]]+['\"](next|react)(/|['\"])|from[[:space:]]+['\"](@prisma|@supabase)/|from[[:space:]]+['\"]@/lib/(db|supabase|generated/)" \
  < <(find apps/web/features -type f \( -name "*.ts" -o -name "*.tsx" \) -path "*/domain/*" | sort)

report_matches \
  "app must not import Prisma directly; use a feature query/usecase or repository" \
  "from[[:space:]]+['\"](@/lib/db|@/lib/generated/prisma|@prisma/)" \
  < <(find apps/web/app -type f \( -name "*.ts" -o -name "*.tsx" \) | sort)

report_matches \
  "SDK must not import apps/web internals" \
  "from[[:space:]]+['\"](@/|[^'\"]*apps/web)" \
  < <(find packages/sdk/src -type f \( -name "*.ts" -o -name "*.tsx" \) | sort)

while IFS= read -r route; do
  if ! grep -q "authenticateSdk" "$route"; then
    echo "FAIL: SDK route is missing authenticateSdk: $route"
    fail=1
  fi
done < <(find apps/web/app/api/sdk -name "route.ts" | sort)

if [ "$fail" -eq 0 ]; then
  echo "OK: conventions"
fi

exit "$fail"
