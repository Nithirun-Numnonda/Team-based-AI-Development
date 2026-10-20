# WS5.4 — รัน DMS Starter ด้วย Docker

| | |
|---|---|
| **ตำแหน่ง** | Day 2 · Session 5 (งานสุดท้ายของ Session) |
| **เวลา** | 20 นาที |
| **รูปแบบ** | รายบุคคล |
| **สไลด์** | หน้า 87–88 |
| **ผลลัพธ์** | ระบบ DMS + ฐานข้อมูล PostgreSQL ทำงานบนเครื่องคุณ และ `npm test` ผ่านทั้งหมดก่อนแก้อะไร |

## 🎯 เป้าหมาย

ให้ **Builder ของคุณ (Cline) รัน test ได้จริง** — ถ้า `npm test` ไม่ผ่านตั้งแต่ยังไม่แก้อะไร แปลว่าเครื่องยังไม่พร้อม อย่าเพิ่งไปต่อ

## 📋 ต้องมีก่อนเริ่ม

- อยู่ในโฟลเดอร์ `dms-central` (จาก [WS5.1](ws-5.1-setup-agents.md))
- **เปิด Docker Desktop ไว้ก่อน** (สถานะ Engine running)

## 👉 ขั้นตอน

### ขั้นที่ 1 — ตั้งค่า `.env`

**macOS / Git Bash**

```bash
cp .env.example .env
```

**Windows PowerShell**

```powershell
Copy-Item .env.example .env
```

💡 `.env` เก็บค่าตั้งของเครื่องเรา (ห้ามขึ้น repo — ถูก `.gitignore` กันไว้แล้ว) ส่วน `.env.example` เป็นตัวอย่างที่อยู่ใน repo

### ขั้นที่ 2 — เปิดฐานข้อมูลด้วย Docker Compose

```bash
docker compose up -d
docker compose ps
```

✅ **ต้องเห็น:** container ของ PostgreSQL สถานะ `running` (หรือ `Up`)

### ขั้นที่ 3 — ติดตั้ง dependencies

```bash
npm ci
```

### ขั้นที่ 4 — สร้างตารางและข้อมูลตัวอย่าง

```bash
npm run migrate
npm run seed
```

### ขั้นที่ 5 — รัน test (ก่อนแก้อะไรเลย)

```bash
npm test
```

✅ **ต้องเห็น:** test ผ่านทั้งหมด (ไม่มี fail)

🔧 **ถ้าไม่เป็นแบบนี้** — อย่าไปขั้นต่อไป ดูตารางแก้ปัญหาด้านล่าง

### ขั้นที่ 6 — รันระบบและลองเรียก API

เปิด Terminal ใหม่ในโฟลเดอร์เดิม แล้ว:

```bash
npm run dev
```

(ทิ้ง Terminal นี้ไว้) จากนั้นเปิด **Terminal อีกอัน** แล้วเรียก API ด้วย token ตัวอย่างจากไฟล์ `db/seeds/001_demo.sql`:

```bash
curl -s -H "Authorization: Bearer <token>" http://localhost:3000/api/documents
```

> **PowerShell:** ใช้ `curl.exe` แทน `curl` (เพราะ `curl` ใน PowerShell เป็น alias ของคำสั่งอื่น)

✅ **ต้องเห็น:** JSON รายการเอกสารตัวอย่าง

ลองเรียกโดย **ไม่ใส่ token**:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/documents
```

✅ **ต้องเห็น:** `401`  (PowerShell ใช้ `curl.exe -s -o NUL -w "%{http_code}\n" ...`)

หยุดเซิร์ฟเวอร์ด้วย `Ctrl+C`

## ✅ Checkpoint (ตรวจตัวเอง)

- [ ] `docker compose ps` เห็น PostgreSQL ทำงานอยู่
- [ ] `npm run migrate` และ `npm run seed` สำเร็จ
- [ ] `npm test` **ผ่านทั้งหมด**
- [ ] เรียก API ได้ผล JSON เมื่อมี token และ `401` เมื่อไม่มี

## 🔧 ปัญหาที่พบบ่อย

| อาการ | สาเหตุ | วิธีแก้ |
|---|---|---|
| `Cannot connect to the Docker daemon` | Docker Desktop ยังไม่รัน | เปิด Docker Desktop รอจน Engine running แล้วลองใหม่ |
| `npm test` ล้ม: เชื่อมฐานข้อมูลไม่ได้ (`ECONNREFUSED`) | container DB ยังไม่พร้อม | `docker compose up -d` → รอ 10 วินาที → รันใหม่ |
| port `5432` หรือ `3000` ถูกใช้อยู่ | มีโปรแกรมอื่นใช้พอร์ตเดียวกัน | ปิดโปรแกรมนั้น หรือแก้พอร์ตตามไฟล์ `.env` / `docker-compose.yml` แล้วแจ้ง TA |
| `npm ci` ล้ม | Node เวอร์ชันผิด / เน็ตมีปัญหา | `node -v` ต้อง v24 · ตรวจเครือข่าย |
| `.env` ไม่ถูกอ่าน | ไฟล์ไม่ได้อยู่ที่ราก repo | ตรวจว่าอยู่ในโฟลเดอร์ `dms-central` |
| ข้อมูลใน DB เพี้ยนหลังซ้อมหลายรอบ | seed ซ้ำ | `docker compose down -v` แล้วเริ่มใหม่ (ลบข้อมูลฐานข้อมูลทั้งหมด) |

## 🧪 ท้าทายเพิ่ม

- เปิด `openapi.yaml` อ่านว่า API กลางมี endpoint อะไรบ้าง (Designer จะใช้เป็นสัญญากลางใน WS6.1)
- ใช้ `docker compose logs db` ดู log ของฐานข้อมูล

## 🧑‍🏫 หมายเหตุสำหรับผู้สอน/TA

- **ลดความเสี่ยงล่วงหน้า:** ให้ TA ช่วยผู้เรียนรัน `docker compose pull` ตอนลงทะเบียน (08:30–09:00) และตรวจว่า port 5432/3000 ว่างบนเครื่องผู้เรียน
- เครื่องที่ Docker ไม่ขึ้นมักเป็นเรื่อง WSL 2 / Virtualization (Windows) — เตรียมเครื่องสำรอง หรือให้จับคู่กับเพื่อนที่เครื่องพร้อมเพื่อรัน DB ตัวเดียวแล้วต่อกัน (เป็นทางเลือกสุดท้าย)
- เป้าหมายของขั้นนี้คือ "`npm test` เขียวทุกเครื่อง" — เป็นเงื่อนไขก่อนเริ่ม Sprint ใน Session 6
- ถ้า `/health` endpoint ไม่มีใน Starter ให้เพิ่มเป็นการ์ดเล็กใน Backlog (ใช้ใน smoke test ของ WS8.2)

**ต่อไป →** พักเบรก แล้วเข้า [WS6.1 Designer: จากการ์ดสู่ Spec](ws-6.1-designer-spec.md)
