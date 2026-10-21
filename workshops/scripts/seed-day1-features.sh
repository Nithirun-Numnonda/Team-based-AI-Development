#!/usr/bin/env bash
# สร้าง Label + Issue การ์ดฟีเจอร์ 8 ใบ (A–H) ใน repo ฝึกหัดของทีม
# ใช้: bash workshops/scripts/seed-day1-features.sh <ORG>/<REPO>
# ต้องมี gh (login แล้ว) และรันจากรากของรีโปหลักสูตร
set -euo pipefail

REPO="${1:?ระบุ repo เช่น ubu-central-dev-2569/dms-practice-team1}"
CARDS_DIR="$(dirname "$0")/../day1/feature-cards"

gh label create "type: feature"   -R "$REPO" --color 1D76DB --description "ฟีเจอร์ใหม่" --force
gh label create "priority: high"   -R "$REPO" --color B60205 --description "ทำก่อน" --force
gh label create "priority: medium" -R "$REPO" --color FBCA04 --description "ปกติ" --force
gh label create "priority: low"    -R "$REPO" --color C2E0C6 --description "ทำทีหลัง" --force
gh label create "good first issue" -R "$REPO" --color 7057FF --description "เหมาะกับคนเริ่มต้น" --force
for m in edit search pin category stats ack export theme; do
  gh label create "module: $m" -R "$REPO" --color BFD4F2 --description "ฟีเจอร์ $m" --force
done

for card in "$CARDS_DIR"/*.md; do
  title="$(head -n 1 "$card" | sed 's/^# //')"
  module="$(basename "$card" .md | cut -d- -f2)"
  priority="$(grep -o 'priority: [a-z]*' "$card" | head -n 1)"
  extra=()
  if [ "$module" = "theme" ]; then extra=(--label "good first issue"); fi
  gh issue create -R "$REPO" --title "$title" --body-file "$card" \
    --label "type: feature" --label "module: $module" --label "$priority" "${extra[@]}"
done

echo "สร้างการ์ด 8 ใบใน $REPO แล้ว — อย่าลืมเพิ่มเข้า Board ของทีม (WS3.2)"
