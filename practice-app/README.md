# practice-app — บอร์ดประกาศหน่วยงาน (แอปฝึกหัด Day 1)

แอปเล็กที่สุดที่ยังเดินครบลูปของทีมได้: **Issue → Branch → PR → CI → Merge → Release → Deploy (Docker / PM2)**
ใช้ stack เดียวกับ backend ของ UBU BioLink (Node.js 20 + Express) เพื่อให้ความรู้วันแรกใช้ต่อในวันที่ 2 ได้ทันที

| ส่วน | ไฟล์ |
|---|---|
| API (Express) | `src/app.js` — route ทั้งหมด · `src/store.js` — เก็บข้อมูล · `src/config.js` — อ่านค่า env |
| หน้าเว็บ | `public/index.html` (HTML + JS ล้วน ไม่ต้อง build) |
| Test | `test/app.test.js` (`node --test` ไม่ต้องติดตั้งเพิ่ม) |
| Deploy | `Dockerfile` + `docker-compose.yml` (พอร์ต 8080) · `ecosystem.config.cjs` สำหรับ PM2 (พอร์ต 3000) |

## รันในเครื่อง

ต้องมี Node.js 20.12 ขึ้นไป

```bash
npm install
cp .env.example .env     # (ไม่บังคับ) ปรับชื่อบอร์ดหรือพอร์ต
npm run dev              # http://localhost:3000 — แก้โค้ดแล้วรีสตาร์ทเอง
npm run lint             # ตรวจ syntax
npm test                 # รัน test
```

## API

| Method | Path | หน้าที่ |
|---|---|---|
| GET | `/api/health` | สถานะ + `version` (จาก package.json) + `runtime` (local / docker / pm2) |
| GET | `/api/config` | ชื่อบอร์ด เวอร์ชัน และ runtime สำหรับหน้าเว็บ |
| GET | `/api/announcements` | รายการประกาศ (ใหม่สุดก่อน) |
| GET | `/api/announcements/:id` | ประกาศ 1 รายการ |
| POST | `/api/announcements` | สร้างประกาศ `{ "title": "...", "body": "..." }` — title 1–120 ตัวอักษร |
| DELETE | `/api/announcements/:id` | ลบประกาศ |

## ตัวแปรสภาพแวดล้อม

| ตัวแปร | ค่าเริ่มต้น | ความหมาย |
|---|---|---|
| `PORT` | `3000` | พอร์ตที่แอปฟัง |
| `APP_TITLE` | `บอร์ดประกาศหน่วยงาน` | ชื่อบนหัวเว็บ |
| `DEPLOY_TARGET` | `local` | แสดงที่ `/api/health` เพื่อบอกว่ากำลังดูแอปที่รันด้วยอะไร |
| `DATA_FILE` | (ว่าง) | ว่าง = เก็บใน memory (หายเมื่อรีสตาร์ท) · ใส่ path = บันทึกลงไฟล์ JSON |

ค่าใน environment จริง (Docker / PM2) มีผลเหนือไฟล์ `.env` เสมอ

## Deploy

```bash
# แบบที่ 1: Docker → http://localhost:8080
docker compose up -d --build

# แบบที่ 2: PM2 → http://localhost:3000
npm ci --omit=dev
pm2 start ecosystem.config.cjs
```

ขั้นตอนเต็มอยู่ใน Workshop [WS4.5 Deploy ด้วย Docker](../workshops/day1/ws-4.5-deploy-docker.md) และ [WS4.6 Deploy ด้วย PM2](../workshops/day1/ws-4.6-deploy-pm2.md)

## ไอเดียการ์ดงานสำหรับ Sprint (ยังไม่ได้ทำ — ตั้งใจเว้นไว้)

- `PATCH /api/announcements/:id` แก้ไขประกาศ + ปุ่มแก้ไขในหน้าเว็บ
- ฟิลด์ `category` (ทั่วไป / ด่วน / กิจกรรม) และตัวกรองในหน้าเว็บ
- ปักหมุดประกาศ (`pinned: true` แสดงบนสุด)
- ค้นหาประกาศด้วยคำค้น `GET /api/announcements?q=`
- วันหมดอายุของประกาศ (`expiresAt`) ซ่อนเมื่อเลยกำหนด
- ป้องกันการลบด้วย header `x-admin-token` ที่อ่านจาก `.env` (ฝึกเรื่องความลับ)
