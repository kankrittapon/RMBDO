# Workflow: Private OCR

> เอกสารรายละเอียด | สร้างจาก snapshot จริง 26 ส.ค. 2026

## ℹ️ Meta

| รายการ | ค่า |
|---|---|
| Workflow ID | `PRIVATE_OCR_V1` |
| สถานะ | ✅ Active |
| Nodes | 11 |
| Executions | 49 (error: 0) |
| Execution ล่าสุด | 2026-08-16 12:31 |
| Trigger | executeWorkflowTrigger (จาก Private main) |

## 🎛️ Switch (4 actions)

`paddle_wait`, `slip_ocr`, `paddle_ocr`, `slip_history`

## 🔁 State Machine "โหมดรอรูป" (Paddle Wait)

```
/ocr หรือ porc (text)          → paddle_wait: set flag per-chat → reply "ส่งรูปมาได้เลย"
ส่งรูปขณะ flag ตั้งอยู่          → paddle_ocr: clear flag → OCR
ส่งรูปโดยไม่มี flag             → slip_ocr: OCR ทันทีเหมือนกัน
```
Flag เก็บใน `$getWorkflowStaticData('global').paddleWaitByChat[chatId]`

## 📡 การเรียก Paddle OCR

```
OCR Slip (httpRequest)
  POST {{$env.PADDLE_OCR_URL}}/ocr/slip
  multipart/form-data: file = binary รูป
  Header: Authorization: Bearer {{$env.PRIVATE_API_TOKEN}}
  Timeout: 180,000 ms
→ Format OCR Result (code)
→ Insert OCR Receipt Log (postgres → receipt_logs)
→ Send OCR Result (telegram reply)
```

## 📜 /slips — slip_history

Get Recent OCR Receipts → Format Slips Reply → Send Slips Reply
(batch variant `slip_batch` อยู่ฝั่ง main — group ด้วย `media_group_id`)

## 🗄️ Tables

| Table | การใช้ |
|---|---|
| `receipt_logs` | INSERT ผล OCR / SELECT ประวัติ (69 records ปัจจุบัน) |

## 🔑 Env

- `PADDLE_OCR_URL`, `PRIVATE_API_TOKEN`

## ⚠️ ข้อสังเกต

1. Sub-workflow **ไม่มี staticData wait-state เอง** — flag จริงอยู่ใน main; ตอนแยก @OCRBot ต้องย้าย logic นี้มาด้วย
2. OCR branch ใน main ยังทำงานคู่กัน (ซ้ำซ้อนแบบเดียวกับ Food)

---
_Snapshot: docs/workflows/snapshot-all.json (2026-08-26)_
