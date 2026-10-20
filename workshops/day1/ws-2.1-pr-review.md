# WS2.1 — GitHub Flow รอบแรก: Pull Request + Review

| | |
|---|---|
| **ตำแหน่ง** | Day 1 · Session 2 |
| **เวลา** | 25 นาที |
| **รูปแบบ** | จับคู่ 2 คน (A ผู้เขียน · B ผู้ตรวจ) แล้วสลับบทบาท |
| **สไลด์** | หน้า 27–28 |
| **ผลลัพธ์** | PR ที่มี Comment + Suggested change ถูก Approve และ Squash-merge เข้า `main` แล้ว |

## 🎯 เป้าหมาย

ส่งงานผ่าน **Pull Request** และรีวิวงานเพื่อนอย่างสร้างสรรค์ได้ — ทักษะพื้นฐานที่สุดของการทำงานเป็นทีม และเป็นฐานของ "ประตูมนุษย์" ในวันที่ 2

## 📋 ต้องมีก่อนเริ่ม

- กิ่ง `feat/hello-<ชื่อ>` ที่ push แล้วจาก [WS1.2](ws-1.2-first-commit.md)
- จับคู่กับเพื่อนร่วมทีม 1 คน (ตกลงกันว่าใครเป็น A ก่อน)

## 👉 ขั้นตอน (รอบที่ 1 — A เขียน, B ตรวจ)

### ขั้นที่ 1 — A เปิด Pull Request

เลือกอย่างใดอย่างหนึ่ง:

**ผ่านเว็บ:** เปิด repo → กดแถบเหลือง **Compare & pull request** → ตรวจว่า base = `main` และ compare = `feat/hello-<ชื่อ>`

**ผ่าน Terminal:**

```bash
gh pr create --base main --title "docs: add <ชื่อ> to contributors" --body "เพิ่มชื่อและบทบาทใน CONTRIBUTORS.md"
```

### ขั้นที่ 2 — A กรอกคำอธิบาย PR

ใช้โครงนี้ (ถ้า repo มี PR Template แล้ว ให้กรอกตามนั้น):

```markdown
## ทำอะไร / ทำไม
เพิ่มชื่อและบทบาทของฉันใน CONTRIBUTORS.md เพื่อให้ทีมรู้ว่าใครดูแลส่วนไหน

## ทดสอบอย่างไร
เปิดไฟล์บน GitHub แล้วเห็นบรรทัดใหม่ตามรูปแบบเดิม
```

💡 PR ที่ตรวจง่าย = **เล็ก 1 เรื่อง + อธิบายว่าทำอะไร ทำไม ทดสอบอย่างไร**

### ขั้นที่ 3 — B ตรวจในแท็บ **Files changed**

1. เปิด PR ของ A → แท็บ **Files changed**
2. วางเมาส์ที่เลขบรรทัด → กดปุ่ม **+** → เขียน **Comment 1 อัน** (ถามหรือให้ความเห็น) เช่น
   `บทบาทเขียนว่า "Backend" ใช่ไหม หรืออยากระบุโมดูลให้ชัดเจนกว่านี้?`
3. ที่อีกบรรทัด (หรือเพิ่มบรรทัดใหม่) กดไอคอน **Add a suggestion** ในกล่อง comment → แก้ข้อความเป็นรูปแบบที่ต้องการ → **Start a review / Add review comment**

### ขั้นที่ 4 — A ตอบและรับ suggestion

1. A เปิดแท็บ **Conversation** → ตอบ comment ของ B
2. กด **Commit suggestion** (หรือ Add suggestion to batch → Commit suggestions) เพื่อรับคำแนะนำ

### ขั้นที่ 5 — B ตัดสินใจ

B กด **Review changes** (มุมขวาบนของแท็บ Files changed) → เลือก

- **Approve** — อ่านแล้ว พอใจ พร้อม merge
- **Request changes** — ต้องแก้ก่อน (ใส่เหตุผล)

แล้ว **Submit review**

> ⚠️ **Approve เมื่ออ่านโค้ดจริงเท่านั้น** — การ Approve คือ "ฉันอ่านแล้วและรับผิดชอบร่วม" ไม่ใช่ "ฉันเกรงใจ"

### ขั้นที่ 6 — A กด Merge

1. กลับไปแท็บ **Conversation** → เลื่อนลงล่างสุด
2. กดลูกศรข้างปุ่ม Merge → เลือก **Squash and merge** → **Confirm squash and merge**
3. กด **Delete branch**

💡 **Squash and merge** รวมทุก commit ใน PR เป็น commit เดียวบน `main` ประวัติจึงอ่านง่าย

✅ **ต้องเห็น:** ป้ายสีม่วง **Merged** ที่หัว PR

### ขั้นที่ 7 — A อัปเดตเครื่องตัวเอง

```bash
git switch main
git pull
git log --oneline -3
```

## 🔁 รอบที่ 2 — สลับบทบาท

B เป็นผู้เขียน (ทำขั้นที่ 1–7 ใหม่ด้วยกิ่งของ B) และ A เป็นผู้ตรวจ

## ✅ Checkpoint (ตรวจตัวเอง)

- [ ] PR ของคุณมีป้าย **Merged**
- [ ] ในประวัติ PR เห็น Comment และ Suggested change อย่างน้อยอย่างละ 1
- [ ] `main` ของคุณมี commit ใหม่ 1 อัน และกิ่ง `feat/hello-<ชื่อ>` ถูกลบแล้ว
- [ ] คุณได้ตรวจ PR ของเพื่อน 1 ใบ (ถามอย่างน้อย 1 คำถาม)

## 🔧 ปัญหาที่พบบ่อย

| อาการ | สาเหตุ | วิธีแก้ |
|---|---|---|
| ปุ่ม Merge ใช้ไม่ได้ ("Review required") | ยังไม่มีคน Approve (ถ้า Ruleset เปิดแล้ว) | ให้เพื่อน Approve — ห้าม Approve ของตัวเอง |
| "Waiting on code owner review" | ผู้ Approve ไม่ใช่ Code Owner | ให้ Code Owner ที่ระบุไว้ Approve (ดู WS2.3) |
| ไม่เห็นปุ่ม Squash and merge | repo ปิดวิธี merge แบบนี้ | Settings → General → Pull Requests → ติ๊ก Allow squash merging |
| `gh pr create` ถามหลายคำถาม | ไม่ได้ใส่ `--title/--body` | ใส่ตามตัวอย่าง หรือใช้ `--fill` |

## 🧪 ท้าทายเพิ่ม

- ลองใช้ `gh pr checkout <N>` ดึงกิ่งของเพื่อนมาดูในเครื่อง แล้วรันคำสั่ง `gh pr diff <N>`
- เขียน Comment ที่ "ถามเหตุผล" แทน "สั่ง" เช่น เปลี่ยน "แก้ตรงนี้" เป็น "ที่เลือกวิธีนี้เพราะอะไร มีทางเลือกอื่นไหม?"

## 🧑‍🏫 หมายเหตุสำหรับผู้สอน/TA

- เดินดูว่าผู้ตรวจใช้แท็บ **Files changed** จริง ไม่ใช่กด Approve ทันที — ตั้งคำถามกับผู้ตรวจ: "ถ้ากด Approve แล้วพังใครรับผิดชอบ?"
- ถ้า Ruleset ยังไม่เปิด (เปิดใน WS2.3) PR จะ merge ได้โดยไม่ต้อง Approve — ให้ย้ำกติกาว่า "ทุกคนต้องมีคน Approve" และใช้ WS2.3 เปลี่ยนเป็นการบังคับด้วยระบบ
- เวลาเหลือ → ให้ทำรอบสอง (สลับบทบาท) ทันที

**ต่อไป →** [WS2.2 จำลอง Merge Conflict](ws-2.2-merge-conflict.md)
