# WS8.2 — Release v0.1.0 และ Deploy ผ่าน Pipeline ที่มีผู้อนุมัติ

| | |
|---|---|
| **ตำแหน่ง** | Day 2 · Session 8 |
| **เวลา** | 20 นาที |
| **รูปแบบ** | ผู้สอนหลักเป็น **ผู้เปิด Release** · ผู้สอนร่วม/Maintainer เป็น **ผู้อนุมัติ** · ผู้เรียนดู log และทำ smoke test |
| **สไลด์** | หน้า 127 |
| **ผลลัพธ์** | DMS `v0.1.0` ขึ้นเซิร์ฟเวอร์ผ่าน GitHub Actions โดยมีผู้อนุมัติก่อนรัน |

## 🎯 เป้าหมาย

เห็นวงจรจาก **Release → รออนุมัติ → Deploy → Smoke test** ครบ — และเข้าใจว่า "ขึ้น Production" ต้องมีคนรับรองเสมอ

## 💡 ภาพรวม Pipeline

```text
PR → CI → Review → Merge → Release (tag v0.1.0) → [อนุมัติ: Environment production] → Deploy → Smoke test
```

**3 จุดควบคุม:** (1) ก่อน merge: CI + Review (ประตูที่ 2) (2) ก่อน deploy: การอนุมัติจาก Environment `production` (3) หลัง deploy: smoke test — พังให้ย้อนกลับ

> เอกสารนี้สมมติ Deploy ด้วย **SSH + Docker Compose** — ผู้สอนปรับให้ตรงกับเซิร์ฟเวอร์จริงของมหาวิทยาลัย (ดู [00-instructor-prep.md](../00-instructor-prep.md) หัวข้อ D)

## 📋 ต้องมีก่อนเริ่ม (ผู้สอนเตรียมไว้)

- Environment `production`: **Required reviewers** = `maintainers`, ติ๊ก **Prevent self-review**, จำกัด deploy เฉพาะ tag ที่ตรง `v*`
- Variables: `DEPLOY_HOST`, `DEPLOY_USER` · Environment secret: `DEPLOY_SSH_KEY`
- ไฟล์ใน repo: `.github/workflows/deploy.yml` และ `scripts/deploy-ssh.sh` (ด้านล่าง) · เซิร์ฟเวอร์มี `/opt/dms/deploy.sh`
- `main` เขียว และ WS8.1 เสร็จแล้ว

## 📄 ไฟล์ที่เกี่ยวข้อง (สำหรับผู้สอนเตรียม / ผู้เรียนอ่าน)

### `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  release:
    types: [published]
  workflow_dispatch:
    inputs:
      tag:
        description: "tag ที่จะ deploy (ใช้ตอน rollback)"
        required: true

permissions:
  contents: read

concurrency:
  group: deploy-production
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production        # รอผู้อนุมัติก่อนรัน
    env:
      TAG: ${{ github.event.release.tag_name || inputs.tag }}
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ env.TAG }}
      - name: Deploy over SSH
        env:
          DEPLOY_HOST: ${{ vars.DEPLOY_HOST }}
          DEPLOY_USER: ${{ vars.DEPLOY_USER }}
          DEPLOY_SSH_KEY: ${{ secrets.DEPLOY_SSH_KEY }}
        run: bash ./scripts/deploy-ssh.sh
```

### `scripts/deploy-ssh.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail
: "${TAG:?}" "${DEPLOY_HOST:?}" "${DEPLOY_USER:?}" "${DEPLOY_SSH_KEY:?}"

# ตรวจรูปแบบ tag กันค่าแปลก ๆ
[[ "$TAG" =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-[A-Za-z0-9.]+)?$ ]] || { echo "invalid tag: $TAG" >&2; exit 1; }

install -m 700 -d ~/.ssh
KEY_FILE="$(mktemp)"
trap 'rm -f "$KEY_FILE"' EXIT
printf '%s\n' "$DEPLOY_SSH_KEY" > "$KEY_FILE"
chmod 600 "$KEY_FILE"

# ห้องเรียน: ใช้ ssh-keyscan  |  ระบบจริง: เก็บ host key ไว้ใน Variable แล้ว append เข้า known_hosts
ssh-keyscan -H "$DEPLOY_HOST" >> ~/.ssh/known_hosts 2>/dev/null

ssh -i "$KEY_FILE" "$DEPLOY_USER@$DEPLOY_HOST" "cd /opt/dms && ./deploy.sh '$TAG'"
```

### `/opt/dms/deploy.sh` (บนเซิร์ฟเวอร์)

```bash
#!/usr/bin/env bash
set -euo pipefail
TAG="${1:?usage: deploy.sh <tag>}"
[[ "$TAG" =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-[A-Za-z0-9.]+)?$ ]] || { echo "invalid tag" >&2; exit 1; }

cd /opt/dms
PREV="$(git describe --tags --abbrev=0 2>/dev/null || echo none)"
echo "previous: $PREV -> new: $TAG"

git fetch --tags origin
git checkout --detach "$TAG"
docker compose -f docker-compose.prod.yml up -d --build

# Health check (ต้องมี endpoint /health — หรือใช้ endpoint ที่มีอยู่)
for i in $(seq 1 20); do
  if curl -fsS http://localhost:3000/health >/dev/null; then echo "healthy: $TAG"; exit 0; fi
  sleep 3
done
echo "health check failed for $TAG (previous: $PREV)" >&2
exit 1
```

> ไฟล์ `docker-compose.prod.yml` และ `.env` ของ production อยู่บนเซิร์ฟเวอร์/เตรียมโดยผู้ดูแลระบบ — **ไม่เก็บ secret ใน repo**

## 👉 ขั้นตอน

### ขั้นที่ 1 — ตรวจความพร้อมก่อน Release (Maintainer)

- [ ] `main` เขียว และ PR ของ Sprint merge แล้ว
- [ ] Release Notes (จาก PR/Label) ครอบคลุมงานของทุกทีม
- [ ] เลขเวอร์ชัน: **`v0.1.0`** (เพิ่มฟีเจอร์ใหม่จาก `v0.0.x`)

### ขั้นที่ 2 — สร้าง Release (ผู้สอนหลัก)

```bash
git switch main && git pull
gh release create v0.1.0 --target main --title "v0.1.0" --generate-notes
```

### ขั้นที่ 3 — ดู Workflow รอผู้อนุมัติ (ทุกคนดูจอ)

แท็บ **Actions** → workflow **Deploy** → สถานะ **Waiting** (สีเหลือง) ข้อความ *"Waiting for review"* — **Job ยังไม่เริ่ม** จนกว่าจะมีคนอนุมัติ

### ขั้นที่ 4 — ผู้อนุมัติตรวจแล้วกด Approve (ผู้สอนร่วม/Maintainer)

1. คลิกเข้า run → **Review deployments**
2. ติ๊ก **production** → ใส่ความเห็น เช่น "ตรวจ Release Notes และ CI แล้ว" → **Approve and deploy** (หรือ **Reject**)

💡 ผู้เปิด Release กับผู้อนุมัติ **ควรเป็นคนละคน** (Prevent self-review) — เหมือนกับกติกาที่ผู้เขียน PR Approve งานตัวเองไม่ได้

### ขั้นที่ 5 — ดู log ของ Job

คลิก job `deploy` → ดูขั้น **Deploy over SSH** ให้เห็น `previous: … -> new: v0.1.0` และ `healthy: v0.1.0`

### ขั้นที่ 6 — Smoke test บนเซิร์ฟเวอร์

เปิดระบบบนเซิร์ฟเวอร์ (URL ที่ผู้สอนแจ้ง) แล้ว:

- [ ] เปิดหน้าแรก / `/health`
- [ ] ล็อกอินด้วยบัญชีทดสอบ
- [ ] อัปโหลด 1 ไฟล์
- [ ] ค้นหาไฟล์นั้นเจอ

✅ **ต้องเห็น:** ครบทุกข้อ

## 🔁 ถ้า Deploy พัง — Rollback

1. ดู log: ขั้นไหนล้ม (SSH / build / health check)
2. **Deploy tag ก่อนหน้าอีกครั้ง:** Actions → **Deploy** → **Run workflow** → ใส่ `tag` ก่อนหน้า (เช่น `v0.0.0-baseline` ที่ผู้สอนเตรียมไว้ หรือ tag ที่ deploy สำเร็จล่าสุด) → รออนุมัติ → Approve
3. ตรวจ migration ที่ต้องย้อน (ถ้าเปลี่ยนโครงสร้างฐานข้อมูล ต้องมีแผนย้อนก่อน)
4. แจ้งทีม เปิด Issue `type: bug` และบันทึกบทเรียนลง `docs/memory/lessons.md` ผ่าน PR

## ✅ Checkpoint

- [ ] Release `v0.1.0` ปรากฏในหน้า Releases พร้อม Release Notes
- [ ] Workflow Deploy **รอผู้อนุมัติ** ก่อนรัน และผ่านหลังอนุมัติ
- [ ] ระบบ v0.1.0 เปิดได้บนเซิร์ฟเวอร์ และ smoke test ผ่าน
- [ ] อธิบายได้ว่าทำไมผู้เปิด Release กับผู้อนุมัติควรเป็นคนละคน และจะ rollback อย่างไร

## 🔧 ปัญหาที่พบบ่อย

| อาการ | สาเหตุ | วิธีแก้ |
|---|---|---|
| Deploy ไม่เริ่มเลย | Workflow ยังไม่อยู่ใน `main` / event ไม่ตรง | ตรวจ `on: release: types: [published]` และว่า Release ถูก **Publish** (ไม่ใช่ draft) |
| ค้าง Waiting ไม่มีใครเห็นปุ่มอนุมัติ | ไม่ได้เป็น Required reviewer | เพิ่มผู้อนุมัติใน Environment `production` |
| ผู้เปิด Release อนุมัติเองไม่ได้ | ติ๊ก Prevent self-review (ถูกต้อง) | ให้ผู้อนุมัติอีกคนกด |
| SSH `Permission denied (publickey)` | Key ไม่ตรง / user ผิด | ตรวจ `DEPLOY_SSH_KEY`, `DEPLOY_USER` และ public key บนเซิร์ฟเวอร์ |
| Health check ล้ม | Endpoint ไม่มี / บริการยังไม่ขึ้น | เพิ่ม `/health` หรือปรับ URL ตรวจ; ดู `docker compose logs` บนเซิร์ฟเวอร์ |
| ไม่เห็น Required reviewers ของ Environment | แพ็กเกจ repo ไม่รองรับ | ใช้ repo สาธารณะ / แพ็กเกจที่รองรับ หรือสาธิตด้วยภาพหน้าจอ |

## 🧪 ท้าทายเพิ่ม

- เพิ่มขั้น smoke test อัตโนมัติท้าย workflow (`curl` URL สาธารณะ แล้ว fail ถ้าไม่ 200)
- เก็บ host key ไว้เป็น Variable แล้วเลิกใช้ `ssh-keyscan`

## 🧑‍🏫 หมายเหตุสำหรับผู้สอน/TA

- **ซ้อมจริงอย่างน้อย 1 รอบ** ด้วย tag ทดลอง (เช่น `v0.0.0-test`) ก่อนวันอบรม รวมถึง rollback
- ผู้สอนหลักเป็นผู้เปิด Release และผู้สอนร่วมเป็นผู้อนุมัติ เพื่อสาธิต Prevent self-review
- เตรียมแผนสำรอง: ถ้าเซิร์ฟเวอร์ไม่พร้อม ใช้ `docker compose` บนเครื่องผู้สอนเป็นเป้าหมาย deploy จำลอง หรือฉาย log จากการซ้อมที่บันทึกไว้
- **ความปลอดภัย:** private key เก็บเป็น Environment secret เท่านั้น, ผู้ใช้ `deploy` ไม่มีสิทธิ์ root, ตรวจรูปแบบ tag ในสคริปต์ทั้งสองฝั่ง, อย่าพิมพ์ secret ลง log

**ต่อไป →** [WS8.3 Sprint Review + Memory hub สด](ws-8.3-sprint-review-memory.md)
