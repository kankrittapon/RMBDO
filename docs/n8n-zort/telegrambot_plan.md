# Telegram Bot Plan — Multi-Bot Architecture

> แผนแยกบอท 4 ตัวให้ทำหน้าที่เฉพาะทาง | ปรับปรุง 26 ส.ค. 2026 (ฉบับแทนที่แผน "bot เดียว" เดิม)

---

## 📋 สถานะปัจจุบัน (ตรวจสอบจริง 26 ส.ค.)

### Credentials ใน n8n (4 ตัว)

| Credential ID | ชื่อ | สถานะการใช้งาน |
|---|---|---|
| `H9pAWZOPVuFl4RDl` | @PrivateBot | ✅ **ถูกใช้โดยทุก telegram node ในทั้ง 4 workflows** |
| `w5K60JXnKfB96x3D` | @FoodBot | ⚪ ไม่ถูกใช้ |
| `pOrMnmP9GeckUZIg` | @OCRBot | ⚪ ไม่ถูกใช้ |
| `z3IzK5XgGQg1n6kW` | @GarminBot | ⚪ ไม่ถูกใช้ |

### ปัญหาของโครงสร้างเดิม

- @PrivateBot ทำ**ทุกอย่าง**: รับข้อความทั้งหมด → Detect Telegram Action (88-node main) → Switch 35 branches
- Food/OCR logic ซ้ำซ้อน (inline ใน main + sub-workflow)
- ความผิดพลาดใน branch ใด branch หนึ่งกระทบ entry point เดียวกันทั้งระบบ

> ℹ️ หมายเหตุเทคนิค: n8n Telegram Trigger ใช้ **long-polling** (getUpdates) — บอทหลายตัวอยู่ร่วมกันได้เลย **ไม่มี conflict webhook** แต่อย่างใด

---

## 🎯 เป้าหมายใหม่: 1 bot = 1 โดเมน

```
@FoodBot    ─── อาหารทั้งหมด (log/track/cal/delete + schedule 21:00)
@OCRBot     ─── สลิป/OCR (wait-mode, OCR, ประวัติ, แก้หมวด/ยอด/ลบสลิป)
@GarminBot  ─── สุขภาพ/ฟิตเนส (workout, routine, garmin import, weekly report)
@PrivateBot ─── ศูนย์กลาง (help, today, งบประมาณ, debug, fallback)
```

## 🗺️ Action Mapping (จาก Switch จริง 35 branches)

| Bot | Actions ที่รับผิดชอบ |
|---|---|
| **@FoodBot** | `food_log`, `food_track`, `food_detail`, `food_batch_calculate`, `food_delete` |
| **@OCRBot** | `paddle_wait`, `paddle_ocr`, `slip_ocr`, `slip_history`, `slip_batch`, `slip_category`, `slip_amount`, `slip_delete` |
| **@GarminBot** | `workout_summary`, `workout_start`, `workout_compare`, `routine_summary`, `routine_override`, `garmin_import`, `weekly_report` |
| **@PrivateBot** | `help`, `help_detail`, `today_summary`, `budget_start`, `budget_summary`, `budget_cycle`, `budget_period`, `budget_target(s)`, `budget_categories`, `budget_detail`, `debug_last`, `unauthorized`, `unknown_command` |

---

## 🏗️ Target Architecture

```
@FoodBot  ──► [Private Food]   ← เพิ่ม telegramTrigger(@FoodBot) + Detect/Switch
                                   ย้าย Daily CalEat schedule มาที่เดียว
@OCRBot   ──► [Private OCR]    ← เพิ่ม telegramTrigger(@OCRBot) + Detect/Switch
                                   ย้าย paddle wait-state (staticData) มาที่เดียว
                                   ดูด slip_category/amount/delete จาก Budget มาที่นี่
@GarminBot──► [Private Health] ← ★workflow ใหม่: ตัด workout/routine/garmin/weekly
                                   branches (~30 nodes) ออกจาก main
@PrivateBot─► [Private]        ← เหลือ help/today/budget/debug + Run Budget
                                   ลบ food/ocr/garmin branches ที่ย้ายไปแล้ว
```

**Cross-cutting:** `telegram_command_logs` — แนะนำ extract เป็น sub-workflow "Log Command" ให้ทุก workflow เรียกใช้ร่วมกัน (กัน SQL drift)

**Owner check** (`PRIVATE_OWNER_TELEGRAM_USER_ID`) ต้องมีใน Detect ของทุก workflow

---

## 📅 Migration Plan (4 Phases)

| Phase | งาน | ความเสี่ยง | Rollback |
|---|---|---|---|
| **0** | Backup snapshot ✅ (`docs/workflows/snapshot-all.json`) + export แยกไฟล์ต่อ workflow | ต่ำ | — |
| **1** | **@OCRBot** — เพิ่ม trigger ใน Private OCR + ย้าย wait-state + ดูด slip ops จาก BUDGET switch | ต่ำสุด (OCR ใช้น้อยสุด) | deactivate แล้ว revert main |
| **2** | **@FoodBot** — trigger ใน Private Food + ย้าย schedule + ลบ food branches ออกจาก main | กลาง (ใช้บ่อย) | เปิด branch เดิมใน main กลับ |
| **3** | **@PrivateBot cleanup** — ลบ food/ocr/slip ที่เหลือใน main | กลาง | git-style: restore snapshot |
| **4** | **@GarminBot** — สร้าง Private Health แยก workout/routine/garmin/weekly ออกจาก main | สูงสุด (Gemini+garmin+schedule) | restore snapshot |

**กติกา:** 1 phase ต่อวัน + ทดสอบ command ครบก่อนไป phase ถัดไป

## 🧪 Test Matrix ต่อ Phase

- [ ] Command ทุกตัวใน domain ตอบถูก bot ถูก flow
- [ ] ส่ง command ผิดบอท → unknown_command reply พร้อม hint ชี้บอทที่ถูก
- [ ] Schedule ยังยิงครบ (21:00 CalEat, weekly report)
- [ ] `telegram_command_logs` บันทึกครบ
- [ ] Unauthorized user โดน block ทุกบอท

---

## ⚠️ Risks

| ความเสี่ยง | ผลกระทบ | จัดการโดย |
|---|---|---|
| UX: ผู้ใช้ลืมว่าคำสั่งอยู่บอทไหน | งง/ส่งผิด | unknown_command ตอบแนะนำบอทปลายทาง + `/help` รวมศูนย์ที่ @PrivateBot |
| StaticData wait-state หายตอน redeploy | OCR โหมดรอรูปพัง | ย้าย flag ไป DB (chat_state table) ภายหลัง |
| Logic drift ระหว่าง main ↔ sub-workflow ช่วง transition | ผลลัพธ์ต่างกัน | ลบ branch เก่าทันทีใน phase เดียวกับที่เปิดใหม่ |
| Gemini/Garmin schedule ยิงซ้ำช่วงตัดต่อ | สแปม | deactivate schedule node เก่าก่อนเปิดใหม่ |

---

## 📊 Success Criteria

- [ ] แต่ละบอทรับเฉพาะ domain ตัวเอง (switch ไม่ overlap)
- [ ] Main (Private) เหลือ ≤ ~40 nodes หลัง cleanup
- [ ] ไม่มี logic ซ้ำซ้อนระหว่าง workflows
- [ ] Execution error = 0 หลัง migration 7 วัน

---

## 🔜 Next Actions

1. Phase 1 (@OCRBot) — เริ่มได้ทันที พร้อม rollback plan
2. ✅ **DECIDED (26 ส.ค.)**: slip_category/amount/delete → อยู่กับ **@OCRBot** (owner confirmed)
3. หลังครบ 4 phases → ทบทวน `08-WORKFLOW-STATUS.md` + diagram ใหม่

---
_Last updated: 2026-08-26 (multi-bot revision)_
