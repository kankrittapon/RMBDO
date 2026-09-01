# Workflow: Private (Main Router)

> เอกสารรายละเอียด workflow หลัก | สร้างจาก snapshot จริง 26 ส.ค. 2026

## ℹ️ Meta

| รายการ | ค่า |
|---|---|
| Workflow ID | `I6NB0SLUJxPVISQ9` |
| ชื่อ | Private |
| สถานะ | ✅ Active |
| จำนวน Nodes | 88 |
| Executions | 75 (error: 0) |
| Execution ล่าสุด | 2026-08-26 13:34 |
| Telegram Credential | @PrivateBot (`H9pAWZOPVuFl4RDl`) |

## 🔌 Triggers (4 ตัว)

| Trigger | Type | รายละเอียด |
|---|---|---|
| Telegram Trigger1 | telegramTrigger | updates=`message`, credential @PrivateBot — entry point หลัก |
| Schedule Trigger | scheduleTrigger | **รายสัปดาห์** เวลา 21:00 → weekly report (Gemini) |
| Daily Food Calorie Schedule | scheduleTrigger | cron `0 21 * * *` ทุกวัน 21:00 → CalEat batch (Groq) |
| Python OCR Webhook | webhook | POST `/webhook/ocr-pipeline` (responseMode=responseNode) — internal endpoint |

## 🧠 Logic กลาง: Detect Telegram Action (Code)

1. **Owner check**: เทียบ `message.from.id` กับ `$env.PRIVATE_OWNER_TELEGRAM_USER_ID` (default `8205529862`) — ไม่ตรง → `unauthorized`
2. Parse command: lowercase, ตัด `/`, ตัด `@botname`
3. ตรวจรูปภาพ (`photo[]` / `document.mime_type=image/*`)
4. **Food-like detection**: regex ไทย+อังกฤษ (ข้าว, กาแฟ, chicken, kcal ฯลฯ) — ข้อความธรรมดาที่เหมือนอาหาร → `food_log` อัตโนมัติ
5. **Paddle wait state**: เก็บใน `$getWorkflowStaticData('global').paddleWaitByChat[chatId]` (per-chat, ไม่ persist ข้าม restart)
6. Output เพิ่ม: `action, text, command, chatId, telegramUserId, messageId, mediaGroupId/batchId, isOwner`

## 🎛️ Switch (35 branches)

### 💪 Health & Fitness
| Action | คำสั่ง/เงื่อนไข | Flow ปลายทาง |
|---|---|---|
| `workout_summary` | `/workout` | Get Workout Summary → Format → Send |
| `workout_start` | `/workout start\|เริ่ม` | Get Workout Start Plan → ... |
| `workout_compare` | `/workout compare\|เทียบ`, `/progress` | Get Workout Compare → ... |
| `routine_summary` | `/routine` | Get Routine Plan → ... |
| `routine_override` | `/routine use\|แทน`, `วันนี้เล่น` | Save Routine Override → ... |
| `garmin_import` | ข้อความมี `garmin.com` หรือ `/garmin` | HTTP `garmin_api:8000/activity/{id}/exercise-sets` → Code → Insert `workout_sets` |
| `weekly_report` | `ประจำสัปดาห์` / `/week` (+schedule รายสัปดาห์) | Build `ai_prompt_data` → **Google Gemini** (prompt เทรนเนอร์ส่วนตัว) → Send |

### 🍽️ Food (ฝังใน main ด้วย + dispatch ไป sub-workflow)
| Action | คำสั่ง | หมายเหตุ |
|---|---|---|
| `food_log` | `/eat X` หรือข้อความ food-like | Prepare → Insert `food_logs` |
| `food_track` / `food_detail` | `/trackeat [detail]` | SELECT `food_logs` |
| `food_batch_calculate` | `/caleat` | Groq chainLlm batch estimate |
| `food_delete` | `/fooddelete`, `ลบอาหาร X` | soft delete |
| `food_estimate` | (internal) | — |

> มีทั้ง branch ในตัว **และ** `Run Private Food` (executeWorkflow → PRIVATE_FOOD_V1) — dispatch ตามโครงสร้างปัจจุบัน

### 🧾 Slip / OCR
| Action | คำสั่ง | Flow |
|---|---|---|
| `slip_ocr` | ส่งรูป (โดยไม่ได้อยู่โหมด wait) | OCR Slip HTTP → Paddle → Insert `receipt_logs` |
| `paddle_wait` | `/ocr` หรือ `porc` (text) | ตั้ง wait flag → reply รอรูป |
| `paddle_ocr` | ส่งรูปขณะ wait | เคลียร์ flag → OCR เหมือน slip_ocr |
| `slip_history` | `/slips` | Get Recent OCR Receipts |
| `slip_batch` | `/slips batch\|ชุด` | Get Slip Batch Summary (group ตาม media_group_id) |

### 💰 Budget → dispatch ไป `Run Private Budget`
`budget_summary`, `budget_start`, `budget_cycle`, `budget_period`, `budget_target(s)`, `budget_categories`, `budget_detail`, `slip_category`, `slip_amount`, `slip_delete`

### 🔧 Utility
| Action | คำสั่ง |
|---|---|
| `help` / `help_detail` | `/help`, `/help <topic>` |
| `today_summary` | `/today` — Get Today Summary |
| `debug_last` | `/debug last` — Get Debug Last Commands |
| `unknown_command` | fallback |

## 🗄️ Database Tables ที่แตะ

`workout_sets` (insert direct), `daily_transactions` (insert direct), `workout_routines`, `workout_plan_overrides`, `receipt_logs`, `food_logs`, `telegram_command_logs` (log ทุก command + mark replied), budget_* (ผ่าน sub-workflow)

## 🔐 Env & Credentials

- `PRIVATE_OWNER_TELEGRAM_USER_ID` — whitelist owner
- `PADDLE_OCR_URL` — base URL ของ paddle_ocr service
- `PRIVATE_API_TOKEN` — Bearer token ยิง paddle
- Credentials: @PrivateBot, PostgreSQL (n8n), Groq API, Google Gemini (PaLM API)

## ⚠️ ข้อสังเกต

1. **Food logic ซ้ำซ้อน** — มีทั้ง inline ใน main และ sub-workflow Private Food (ควร consolidate ตอนแยก bot)
2. `weekly_report` schedule trigger ("weeks" field) ไม่ระบุวัน — n8n default อาจรันทุกจันทร์ ควรยืนยัน intent
3. StaticData paddle-wait หายถ้า workflow deactivate/reactivate

---
_Snapshot: docs/workflows/snapshot-all.json (2026-08-26)_
