# WS4.1 — สร้าง CI และตั้ง Required Check

| | |
|---|---|
| **ตำแหน่ง** | Day 1 · Session 4 |
| **เวลา** | 20 นาที |
| **รูปแบบ** | ทีม (คนหนึ่งพิมพ์ workflow · คนหนึ่งดู Actions · Module Lead ตั้ง Ruleset) |
| **สไลด์** | หน้า 59 |
| **ผลลัพธ์** | ทุก PR รัน Lint + Test อัตโนมัติ และ merge ไม่ได้ถ้า check ไม่ผ่าน |

## 🎯 เป้าหมาย

ให้ **เครื่องตรวจแทนคน** ก่อนที่คนจะเสียเวลาอ่านโค้ด และผูกผลตรวจเข้ากับกติกา (Required check)

## 📋 ต้องมีก่อนเริ่ม

- Starter Project ใน repo ทีมที่รัน `npm test` ผ่านบนเครื่อง (ตรวจชื่อสคริปต์ใน `package.json`: `lint`, `migrate`, `test`)
- ตรวจ `.env.example` เพื่อดูชื่อตัวแปรเชื่อมฐานข้อมูล (ในตัวอย่างใช้ `DATABASE_URL` — **ปรับให้ตรงกับของจริง**)

## 👉 ขั้นตอน

### ขั้นที่ 1 — สร้างกิ่งและไฟล์ workflow

```bash
git switch main && git pull
git switch -c chore/ci
mkdir -p .github/workflows
```

สร้างไฟล์ **`.github/workflows/ci.yml`**:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: dms_test
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 5s
          --health-timeout 5s
          --health-retries 10
    env:
      DATABASE_URL: postgres://postgres:postgres@localhost:5432/dms_test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run migrate
      - run: npm test
```

💡 **อธิบายสั้น ๆ:** `on` = เมื่อเปิด PR หรือ push เข้า main · `runs-on` = เครื่องใหม่สะอาดทุกครั้ง · `services` = เปิด PostgreSQL ให้ test · `steps` = รันตามลำดับ ขั้นไหนล้มก็หยุด

🔧 **ปรับให้ตรงกับ Starter**

| ถ้า... | ให้... |
|---|---|
| ไม่มีสคริปต์ `lint` | ลบบรรทัด `npm run lint` หรือเพิ่มสคริปต์ที่ตรวจพื้นฐาน |
| ชื่อตัวแปร DB ไม่ใช่ `DATABASE_URL` | แก้ `env:` ให้ตรงกับ `.env.example` |
| Test ไม่ใช้ DB | ลบ `services:` ออก |
| ต้อง seed ข้อมูลก่อน test | เพิ่ม `- run: npm run seed` ก่อน `npm test` |

> เวอร์ชันของ action (`@v4`) ใช้ major version ที่ GitHub แนะนำล่าสุดได้ — ตรวจหน้า Marketplace ของ `actions/checkout` และ `actions/setup-node`

### ขั้นที่ 2 — เปิด PR และดู CI รัน

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add lint and test workflow"
git push -u origin chore/ci
gh pr create --base main --fill
```

เปิดแท็บ **Actions** (หรือดู **Checks** ใน PR) → รอจุดเหลือง 🟡 กลายเป็นเครื่องหมายถูก ✅ (ปกติ 1–2 นาที)

✅ **ต้องเห็น:** workflow `CI` สีเขียว

🔧 **ถ้าแดง** — คลิกเข้า job `test` → คลิกขั้นที่มีเครื่องหมาย ✗ → อ่านข้อความ error:

| ข้อความ | แปลว่า | แก้ |
|---|---|---|
| `Missing script: "lint"` | ไม่มีสคริปต์ | ดูตารางด้านบน |
| `ECONNREFUSED 127.0.0.1:5432` | DB ยังไม่พร้อมหรือตัวแปรผิด | ตรวจ `health-cmd` และชื่อ `DATABASE_URL` |
| `npm ci` ล้ม | `package-lock.json` ไม่ตรง | รัน `npm install` ในเครื่องแล้ว commit lockfile |

Merge PR นี้เข้า `main` (ให้เพื่อน Approve)

### ขั้นที่ 3 — ตั้ง Required status check

1. Settings → Rules → Rulesets → เปิด `protect-main` → **Edit**
2. ติ๊ก **Require status checks to pass** → **Add checks** → เลือก **`test`**
3. **Save changes**

> ชื่อ check จะให้เลือกได้ **หลังจากเคยรันสำเร็จอย่างน้อย 1 ครั้ง** (ถ้าไม่เห็น ให้รอแล้วรีเฟรช)

### ขั้นที่ 4 — พิสูจน์ว่าบล็อกได้จริง

1. สร้างกิ่ง `test/break-ci` แล้วแก้ test ให้ล้ม (เช่น เปลี่ยนค่าที่คาดหวังเป็นค่าผิด)
2. commit → push → เปิด PR
3. รอ CI แดง ✗ → ดูปุ่ม Merge

✅ **ต้องเห็น:** `Merging is blocked — Required statuses must pass`

4. แก้ test กลับให้ผ่าน → push → CI เขียว → ปุ่ม Merge กลับมาใช้ได้ → ปิด PR ทดสอบทิ้ง (ไม่ต้อง merge)

## ✅ Checkpoint (ตรวจตัวเอง)

- [ ] แท็บ Actions แสดงการรันสีเขียวของ `CI`
- [ ] PR ที่ test ล้มมีป้าย **Merging is blocked**
- [ ] ชื่อ check `test` อยู่ในรายการ Required ของ Ruleset

## 🧪 ท้าทายเพิ่ม

- เพิ่ม badge CI ใน README: `![CI](https://github.com/<ORG>/<REPO>/actions/workflows/ci.yml/badge.svg)`
- เพิ่ม `concurrency:` เพื่อยกเลิกการรันเก่าเมื่อ push ซ้ำ

## 🧑‍🏫 หมายเหตุสำหรับผู้สอน/TA

- เตรียม `ci.yml` ที่ **ทดสอบกับ Starter จริงแล้ว** ผู้เรียนปรับแค่ชื่อสคริปต์/ตัวแปร ลดเวลาแก้ปัญหา
- ถ้า Org จำกัด Actions ให้ใช้ได้เฉพาะ action ที่อนุมัติ ตรวจก่อนว่า `actions/checkout` และ `actions/setup-node` อยู่ในรายการ
- ความจริงเรื่องแพ็กเกจ: Required status checks ใน Ruleset ของ repo private ต้องใช้แพ็กเกจที่รองรับ
- รหัสผ่าน `postgres` ใน workflow ใช้เฉพาะ CI ที่ทิ้งได้ — ย้ำว่า **ห้ามใช้ค่าจริง**

**ต่อไป →** [WS4.2 Dependabot และ Security scanning](ws-4.2-dependabot-security.md)
