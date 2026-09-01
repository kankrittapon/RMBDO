# Workflow: Private Budget

> เอกสารรายละเอียด | สร้างจาก snapshot จริง 26 ส.ค. 2026

## ℹ️ Meta

| รายการ | ค่า |
|---|---|
| Workflow ID | `PRIVATE_BUDGET_V1` |
| สถานะ | ✅ Active |
| Nodes | 43 |
| Executions | **0** (ยังไม่เคยรัน — ข้อมูลในตารางถูก seed ภายนอก) |
| Trigger | executeWorkflowTrigger (จาก Private main เท่านั้น) |

## 🎛️ Switch (11 actions)

`budget_start`, `budget_summary`, `budget_cycle`, `slip_category`, `budget_period`, `budget_target`, `budget_targets`, `budget_categories`, `budget_detail`, `slip_amount`, `slip_delete`

## 💵 Lifecycle: /budget start

```
Parse Budget Start (code)
  → Close Old Budget Cycle   (UPDATE budget_cycles SET ended_at ...)
  → Create Budget Cycle      (INSERT budget_cycles ใหม่)
  → Link Receipts To New Cycle (UPDATE receipt_logs ผูก cycle_id)
  → Format Budget Start Reply → Send
```

## 📋 Actions ที่เหลือ

| Action | Flow |
|---|---|
| `budget_summary` (bare `/budget`) | Get Budget Summary → reply สรุป cycle ปัจจุบัน |
| `budget_cycle` | Get Budget Cycle → ข้อมูลรอบปัจจุบัน/วันครบ |
| `budget_period` | `/budget day\|week\|month\|วัน\|สัปดาห์\|เดือน` → Get Budget Period Summary |
| `budget_target` | Parse (หมวด+ยอด) → Upsert Budget Target |
| `budget_targets` | Get Budget Targets → list ทั้งหมด |
| `budget_categories` | Get Budget Categories → หมวดทั้งหมด |
| `budget_detail` | Parse → Get Budget Detail (รายการใน cycle) |
| `slip_category` | `slipcat <id> <หมวด>` / `หมวด ...` → Update Slip Category |
| `slip_amount` | `/budget amount` + args → Update Slip Amount |
| `slip_delete` | `slipdelete` / `ลบสลิป X` → Soft Delete Slip |

## 🗄️ Tables

| Table | การใช้ |
|---|---|
| `budget_cycles` | รอบงบ (มี 2 records — seeded) |
| `budget_category_targets` | เป้าหมายรายหมวด |
| `monthly_budgets` | อ้างอิงใน SQL |
| `receipt_logs` | ผูกเข้า cycle / แก้หมวด-ยอด / soft delete |

## ⚠️ ข้อสังเกต & ความเสี่ยง

1. **0 executions** = ยังไม่เคยถูกทดสอบ end-to-end ผ่าน Telegram จริง → ควรทดสอบ `/budget start` ก่อนใช้จริง
2. ทุก postgres node เป็น raw SQL (`executeQuery`) — แก้ schema ต้องตามแก้ SQL ทุก node
3. `Close Old Budget Cycle` ไม่มี guard ถ้ายังไม่มี cycle → ควรทดสอบ first-run

---
_Snapshot: docs/workflows/snapshot-all.json (2026-08-26)_
