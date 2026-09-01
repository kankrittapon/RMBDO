# Workflow: Private Food

> เอกสารรายละเอียด | สร้างจาก snapshot จริง 26 ส.ค. 2026

## ℹ️ Meta

| รายการ | ค่า |
|---|---|
| Workflow ID | `PRIVATE_FOOD_V1` |
| สถานะ | ✅ Active |
| Nodes | 26 |
| Executions | 14 (error: 0) |
| Execution ล่าสุด | 2026-08-25 21:00 (schedule) |
| Trigger | executeWorkflowTrigger (ถูกเรียกจาก Private main) + scheduleTrigger |

## 🎛️ Switch (5 actions)

`food_log`, `food_track`, `food_batch_calculate`, `food_detail`, `food_delete`

## 📥 /eat — food_log

```
Prepare Food Estimate (code)
  → Insert Food Log (postgres → food_logs)
  → Format Eat Reply (code)
  → Send Eat Reply (@FoodBot-หรือ-@PrivateBot ตาม credential ที่ใช้)
```

## 📊 /trackeat — food_track / food_detail

```
Get Food Tracking (postgres)
  → Format Food Tracking
  → Send Food Tracking
```
- `detail` → `Get Food Detail` แสดงรายการทีละแถว

## 🤖 /caleat — food_batch_calculate (AI)

```
Get Pending Food Logs Today (postgres — แถวที่ calories IS NULL)
  → Build Groq Batch Nutrition Request (code)
  → Estimate Today Food With Groq Chain (chainLlm + Groq Chat Model)
  → Parse Groq Batch Food Estimate (code)
  → Update Today Food Logs (postgres — เขียน kcal/protein กลับ)
  → Format CalEat Batch Reply → Send
```

## ⏰ Schedule ประจำวัน

cron `0 21 * * *` → `Prepare Scheduled CalEat` → เข้า flow CalEat batch เดียวกับ `/caleat`
(= คำนวณแคลอรีค้างของวันนั้นอัตโนมัติ 21:00)

## 🗑️ /fooddelete — food_delete

Parse (`last` หรือ `id:<n>`) → Soft Delete Food Log (`deleted_at` timestamp) → reply

## 🗄️ Tables

| Table | การใช้ |
|---|---|
| `food_logs` | INSERT / SELECT / UPDATE kcal / soft DELETE |

## 🔑 Credentials/Env

- Groq API credential (lmChatGroq)
- PostgreSQL (n8n DB)

## ⚠️ ข้อสังเกต

1. Logic ชุดเดียวกัน**ฝังซ้ำใน Private main** (nodes ชื่อเดียวกัน) — เสี่ยง drift ถ้าแก้ฝั่งเดียว
2. Sub-workflow นี้ไม่มี telegramTrigger เอง → ตอนแยก @FoodBot ต้องเพิ่ม trigger + ย้าย detect logic

---
_Snapshot: docs/workflows/snapshot-all.json (2026-08-26)_
