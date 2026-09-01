# n8n Workflow Status

> สถานะการใช้งาน n8n workflow ทั้งหมด ณ วันที่ 26 สิงหาคม 2026

## 📊 สรุป Workflow ทั้งหมด

### Active Workflows (7 ตัว)

| # | Workflow | Status | Bot / Trigger | Notes |
|---|----------|--------|---------------|-------|
| 1 | **Private** (`I6NB0SLUJxPVISQ9`) | ✅ Active | @PrivateBot | Main Router, General commands, Dispatch Budget |
| 2 | **Private Food** (`PRIVATE_FOOD_V1`) | ✅ Active | @FoodBot | อาหาร, คำนวณแคลอรี่ (Groq), Schedule 23:00 |
| 3 | **Private OCR** (`PRIVATE_OCR_V1`) | ✅ Active | @OCRBot | OCR สลิป, Paddle OCR, ประวัติสลิป |
| 4 | **Private Budget** (`PRIVATE_BUDGET_V1`) | ✅ Active | Sub-workflow | จัดการงบประมาณ, คำสั่ง `/b` |
| 5 | **Private Forms & UI** (`0N5v7wReXEy6vTnq`) | ✅ Active | Webhook (UI) | Forms เปิดรอบงบ, แก้ไขสลิป, และ **Workout Review** |
| 6 | **Private Health** (`PRIVATE_HEALTH_V1`) | ✅ Active | @GarminBot | Workout, Routine, Auto-Grouping Garmin, AI Progression |
| 7 | **Private Coach** (`PRIVATE_COACH_V1`) | ✅ Active | @CoachBot | AI Cutting & Nutrition Coach (Groq), Weekly Review Schedule 21:00 น. |

### Inactive Workflows (4 ตัว)

| # | Workflow | Status | Notes |
|---|----------|--------|-------|
| 7 | Private Budget Forms (draft เก่า) (`Orr4iJWoKVhqej9c`) | ❌ Inactive | replaced by `0N5v7wReXEy6vTnq` |
| 8 | ConnectExtension | ❌ Inactive | ไม่ใช้แล้ว |
| 9 | MDS | ❌ Inactive | ไม่ใช้แล้ว |
| 10 | My workflow | ❌ Inactive | ไม่ใช้แล้ว |

---


## 🔄 Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Telegram Bot                              │
│                    (Credential @PrivateBot (ID): H9pAWZOPVuFl4RDl)                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Private Workflow (Main Router)                  │
│              ID: I6NB0SLUJxPVISQ9                           │
│              Executions: 74 | Last: 25 ส.ค. 21:00           │
│                                                             │
│  Webhook: e90ae7f3.../webhook                               │
│  Webhook: ocr-pipeline                                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Private Food    │ │ Private OCR     │ │ Private Budget  │
│ Executions: 14  │ │ Executions: 49  │ │ Executions: 0   │
│ Last: 25 ส.ค.   │ │ Last: 16 ส.ค.   │ │ ยังไม่เคยทำงาน  │
│                 │ │                 │ │                 │
│ - /eat          │ │ - /ocr          │ │ - /budget       │
│ - /trackeat     │ │ - /slips        │ │                 │
│ - /fooddelete   │ │ - Slip OCR      │ │                 │
│ - Schedule 21:00│ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## 📋 รายละเอียดแต่ละ Workflow

### 1. Private (Main Router)

**Status**: ✅ Active  
**Executions**: 74  
**Last Run**: 25 ส.ค. 2026 21:00  
**Trigger**: Telegram Webhook

**หน้าที่**:
- รับ message จาก Telegram
- Route ไปยัง sub-workflows ตาม command
- จัดการ profile, workout, ideas

**Commands**:
- `/start` - เริ่มต้นใช้งาน
- `/profile` - จัดการ profile
- `/workout` - บันทึก workout
- `/idea` - บันทึก idea

**Webhooks**:
- `e90ae7f3-b663-426b-acf1-2a0afc6e97a0/webhook` (POST)
- `ocr-pipeline` (POST)

---

### 2. Private Food

**Status**: ✅ Active  
**Executions**: 14  
**Last Run**: 25 ส.ค. 2026 21:00  
**Trigger**: Telegram Webhook + Schedule

**หน้าที่**:
- บันทึกอาหาร
- คำนวณแคลอรี่ (ผ่าน Groq AI)
- ติดตามอาหารรายวัน/รายสัปดาห์/รายเดือน

**Commands**:
- `/eat <อาหาร>` - บันทึกอาหาร
- `/trackeat` - ดูอาหารวันนี้
- `/trackeat week` - ดูอาหาร 7 วันล่าสุด
- `/trackeat month` - ดูอาหารเดือนนี้
- `/fooddelete last` - ลบอาหารล่าสุด
- `/fooddelete id:<id>` - ลบอาหารตาม id

**Schedule**:
- ทุกวัน 21:00 - คำนวณแคลอรี่อาหารวันนี้

---

### 3. Private OCR

**Status**: ✅ Active  
**Executions**: 49  
**Last Run**: 16 ส.ค. 2026 12:31  
**Trigger**: Telegram Webhook

**หน้าที่**:
- OCR สลิปการโอนเงิน
- บันทึกรายการโอนเงิน
- ดูประวัติสลิป

**Commands**:
- `/ocr` - เริ่ม OCR
- `/slips` - ดูประวัติสลิป

**Flow**:
1. User ส่งรูปสลิป
2. n8n ส่งรูปไป Paddle OCR API
3. OCR อ่านข้อมูล (ธนาคาร, ยอดเงิน, เลขอ้างอิง)
4. บันทึกลง database
5. ส่งผลลัพธ์กลับ Telegram

---

### 4. Private Budget

**Status**: ✅ Active  
**Executions**: 0  
**Last Run**: -  
**Trigger**: Telegram Webhook

**หน้าที่**:
- จัดการงบประมาณ
- ติดตามรายรับ-รายจ่าย

**Commands**:
- `/budget` - จัดการงบประมาณ

**หมายเหตุ**: ยังไม่เคยทำงาน (0 executions)

---

## 📈 Execution History (ล่าสุด 15 ครั้ง)

| ID | Workflow | Status | Time |
|----|----------|--------|------|
| 1036 | Private Food | ✅ success | 25 ส.ค. 21:00 |
| 1035 | Private | ✅ success | 25 ส.ค. 21:00 |
| 1034 | Private Food | ✅ success | 24 ส.ค. 21:00 |
| 1033 | Private | ✅ success | 24 ส.ค. 21:00 |
| 1032 | Private | ✅ success | 24 ส.ค. 18:47 |
| 1031 | Private | ✅ success | 23 ส.ค. 21:00 |
| 1030 | Private | ✅ success | 23 ส.ค. 21:00 |
| 1029 | Private Food | ✅ success | 23 ส.ค. 21:00 |
| 1028 | Private | ✅ success | 22 ส.ค. 21:00 |
| 1027 | Private Food | ✅ success | 22 ส.ค. 21:00 |
| 1026 | Private | ✅ success | 22 ส.ค. 15:55 |
| 1025 | Private | ✅ success | 22 ส.ค. 15:55 |
| 1024 | Private Food | ✅ success | 21 ส.ค. 21:00 |
| 1023 | Private | ✅ success | 21 ส.ค. 21:00 |
| 1022 | Private Food | ✅ success | 20 ส.ค. 21:00 |

---

## 🔍 Garmin Flow (ปัจจุบัน)

### สถานะปัจจุบัน

**ไม่มี n8n workflow สำหรับ Garmin โดยตรง**

ข้อมูล Garmin อยู่ใน:
- `workout_sets` table ใน n8n_db (122 records)
- Garmin API ทำงานอิสระ (ไม่ได้เชื่อมกับ n8n)

### Flow ปัจจุบัน (ถ้ามี)

```
User ส่ง URL ผ่าน Telegram
    ↓
Private Workflow รับ message
    ↓
(ไม่มี processing สำหรับ Garmin URL)
    ↓
ไม่ทำงาน
```

### แผนปรับปรุง

```
User ส่ง URL ผ่าน Telegram
    ↓
Garmin Bot รับ message
    ↓
HTTP Request: ดึงข้อมูลจาก Garmin API
    ↓
Transform: แปลงข้อมูลเป็น workout
    ↓
PostgreSQL: บันทึกลง workout_sets
    ↓
HTTP Request: บันทึกลง WorkoutLog (private_db)
    ↓
ส่งผลลัพธ์กลับ Telegram
```

---

## 📝 สรุป

### จำนวน Workflow ที่ถูกต้อง

**ใช่ครับ มี 3 workflow หลัก** แต่จริงๆ แล้วมี **4 workflow ที่ active**:

1. **Private** (Main Router) - 74 executions
2. **Private Food** - 14 executions
3. **Private OCR** - 49 executions
4. **Private Budget** - 0 executions (ยังไม่ทำงาน)

### Workflow ที่ไม่ใช้แล้ว (3 ตัว)

1. ConnectExtension
2. MDS
3. My workflow

---

_Last updated: 2026-08-26_

## 🔗 เอกสารเชิงลึกราย workflow (อัปเดต 26 ส.ค.)

- [10-WORKFLOW-PRIVATE.md](10-WORKFLOW-PRIVATE.md) — Main Router 88 nodes / Switch 35 actions
- [11-WORKFLOW-FOOD.md](11-WORKFLOW-FOOD.md) — Food domain + Groq CalEat batch
- [12-WORKFLOW-OCR.md](12-WORKFLOW-OCR.md) — Paddle wait state-machine + slip ops
- [13-WORKFLOW-BUDGET.md](13-WORKFLOW-BUDGET.md) — Budget cycles (**0 execution** ยังไม่เคยทดสอบ)
- [telegrambot_plan.md](telegrambot_plan.md) — แผนแยกบอท 4 ตัว (multi-bot revision)
- workflows/snapshot-all.json — snapshot JSON จริงของทุก workflow
