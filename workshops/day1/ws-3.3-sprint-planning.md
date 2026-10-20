# WS3.3 — Sprint Planning จำลอง

| | |
|---|---|
| **ตำแหน่ง** | Day 1 · Session 3 |
| **เวลา** | 30 นาที |
| **รูปแบบ** | ทีม — แต่ละคนหยิบ 1 การ์ดต่อรอบ |
| **สไลด์** | หน้า 48 |
| **ผลลัพธ์** | การ์ดของทีมเดินครบ Backlog → Done ผ่าน Branch + PR และ Milestone `v0.0.1` แสดงความคืบหน้า |

## 🎯 เป้าหมาย

ฝึก **วงจรงานเต็มรอบ**: หยิบการ์ด → เปิดกิ่ง → ส่ง PR (`Closes #เลข`) → Review → Merge → การ์ดเป็น Done

## 📋 ต้องมีก่อนเริ่ม

- Board จาก [WS3.2](ws-3.2-kanban-board.md)
- Backlog ตัวอย่าง 12 การ์ด (ผู้สอนสร้างไว้ให้ใน repo ทีม — ดูรายการด้านล่าง)

## 👉 ขั้นตอน

### ขั้นที่ 1 — Planning (ทีมคุยกัน 5 นาที)

1. อ่านการ์ดใน Backlog ด้วยกัน — การ์ดไหน AC ชัดพอ ย้ายเป็น **Ready**
2. เลือก **5–6 การ์ด** สำหรับรอบนี้ ติด Milestone `v0.0.1` (Issue → Milestone → New milestone → ตั้งชื่อ `v0.0.1`)
3. ตั้ง Priority / Size ให้การ์ดที่เลือก

### ขั้นที่ 2 — หยิบการ์ด

ทุกคนหยิบ **1 การ์ด** ที่ยังไม่มีเจ้าของ:

1. เปิด Issue → **Assignees → assign yourself**
2. ย้ายการ์ดเป็น **In Progress**

> 💡 ในวันจริง ผู้เรียน 20–30 คนหยิบการ์ดจาก Board เดียว ถ้าไม่ Assign จะมีคนทำซ้ำกัน

### ขั้นที่ 3 — เปิดกิ่งและทำงานเล็ก ๆ

```bash
git switch main && git pull
git switch -c feat/<N>-<ชื่อสั้น>
```

ทำงานตามการ์ด (งานเล็ก เช่น เอกสาร / test / ไฟล์ config) แล้ว commit โดยอ้างเลข Issue:

```bash
git add -A
git commit -m "docs: add test instructions to README (#<N>)"
git push -u origin feat/<N>-<ชื่อสั้น>
```

### ขั้นที่ 4 — เปิด PR ผูกกับ Issue

```bash
gh pr create --base main --title "docs: add test instructions (#<N>)" --body "Closes #<N>"
```

- ตรวจว่าหน้า PR ขึ้นลิงก์ไปที่ Issue ที่ด้านขวา (Development)
- ย้ายการ์ดเป็น **In Review**

### ขั้นที่ 5 — เพื่อน Review และ Merge

เพื่อนในทีม (คนละคนกับเจ้าของ PR) อ่าน → ถาม 1 คำถาม → Approve → **Squash and merge**

✅ **ต้องเห็น:** Issue ปิดเอง และการ์ดไป **Done**

### ขั้นที่ 6 — Stand-up 2 นาที (GitHub Discussions)

เปิดแท็บ **Discussions** (ถ้ายังไม่เปิด: Settings → General → Features → ติ๊ก Discussions) แล้วโพสต์ 1 หัวข้อ:

```markdown
**Stand-up ทีม <N>**
- เสร็จแล้ว: ...
- กำลังทำ: ...
- ติดอะไร: ...
```

## 📋 Backlog ตัวอย่าง 12 การ์ด (สำหรับผู้สอนสร้างล่วงหน้า)

การ์ดเล็กที่ทำได้ในเวลาสั้น และไม่ขึ้นกับรายละเอียดของ Starter:

| # | Title | type |
|---|---|---|
| 1 | เพิ่มหัวข้อ "วิธีรัน test" ใน README | task |
| 2 | เพิ่ม badge สถานะ CI ใน README | task |
| 3 | เพิ่มคำศัพท์ 5 คำใน `docs/memory/glossary.md` | task |
| 4 | เพิ่มหัวข้อ "รูปแบบ commit message" ใน CONTRIBUTING | task |
| 5 | ตรวจ `.env.example` ว่าค่าครบทุกตัว | task |
| 6 | เพิ่ม test กรณีไม่พบข้อมูล (404) | feature |
| 7 | เพิ่ม endpoint `GET /health` (ถ้ายังไม่มี) | feature |
| 8 | แก้ข้อความ error ภาษาไทยให้สม่ำเสมอ | task |
| 9 | เพิ่ม `npm run lint:fix` | task |
| 10 | เพิ่มตัวอย่างการเรียก API ใน README | task |
| 11 | จัดหมวดไฟล์ใน `docs/` ให้ตรงกับโครงสร้างโมดูล | task |
| 12 | เพิ่ม Issue Template ลิงก์ไป Discussions | task |

สคริปต์สร้าง Issue (ตัวอย่าง 2 ใบ ทำซ้ำตามรายการ):

```bash
gh issue create -R <ORG>/<REPO> --title "[Task]: เพิ่มหัวข้อ \"วิธีรัน test\" ใน README" \
  --label "type: task" --label "priority: low" \
  --body "เสร็จเมื่อ
- [ ] README มีหัวข้อ วิธีรัน test พร้อมคำสั่ง npm test
- [ ] คำสั่งในเอกสารรันได้จริง"
```

## ✅ Checkpoint (ตรวจตัวเอง)

- [ ] ทุกคนในทีมมีการ์ดที่ไปถึง **Done** อย่างน้อย 1 ใบ ผ่าน PR ที่ผูก `Closes #เลข`
- [ ] Milestone `v0.0.1` แสดงเปอร์เซ็นต์ความคืบหน้า
- [ ] ไม่มีสองคนทำการ์ดใบเดียวกัน (ทุกใบมี Assignee 1 คน)
- [ ] โพสต์ Stand-up ใน Discussions แล้ว

## 🔧 ปัญหาที่พบบ่อย

| อาการ | สาเหตุ | วิธีแก้ |
|---|---|---|
| Issue ไม่ปิดหลัง merge | ไม่ได้เขียน `Closes #เลข` ใน PR หรือ merge เข้ากิ่งที่ไม่ใช่ default | แก้คำอธิบาย PR ก่อน merge / ปิด Issue เอง |
| การ์ดไม่เลื่อนเป็น Done | Workflow ยังไม่เปิด | WS3.2 ขั้นที่ 4 |
| สองคนทำการ์ดเดียวกัน | ไม่ได้ Assign | ใช้ `gh issue edit <N> --add-assignee @me` ก่อนเริ่ม |
| PR conflict | แก้ไฟล์เดียวกัน (เช่น README) | ใช้ทักษะจาก WS2.2 |

## 🧪 ท้าทายเพิ่ม

- แตกการ์ดใหญ่เป็น **Sub-issues** (เปิด Issue แม่ แล้วกด Create sub-issue) และดูว่า Board แสดงความคืบหน้าอย่างไร
- ใช้ `gh pr list --state merged` ดูงานที่ merge แล้วของทีม

## 🧑‍🏫 หมายเหตุสำหรับผู้สอน/TA

- ถ้าห้องมี 5 ทีม ให้แต่ละทีมเริ่มจาก Backlog ที่ไม่เหมือนกัน ลดการชนไฟล์เดียวกัน
- จุดสังเกต: ใครลืม Assign, ใครลืม `Closes #เลข` — ยกเป็นกรณีศึกษาหลัง Workshop (ไม่ประจาน)
- เวลาเหลือ → ให้ทำรอบที่สอง หรือให้ทีมที่เสร็จก่อนสร้าง Sub-issues

**ต่อไป →** พักเบรก แล้วเข้า [WS4.1 สร้าง CI และตั้ง Required Check](ws-4.1-ci-required-check.md)
