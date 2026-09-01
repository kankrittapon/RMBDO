# n8n Full System Documentation (Complete Reference)

> เอกสารบันทึกรายละเอียดสถาปัตยกรรม, Workflows, ฐานข้อมูล, Webhooks, Multi-Bot Telegram และ AI Services ของระบบ n8n-zort ทั้งหมด
> จัดทำและตรวจสอบความถูกต้อง ณ วันที่: 26 สิงหาคม 2026

---

## 📍 1. System Topology & Physical Architecture

- **Host Machine**: `ai-brain` (IP ภายใน: `192.168.1.248`, User: `kanfullbuster`)
- **Working Directory**: `/home/kanfullbuster/n8n-zort/`
- **Docker Compose Stack**: `/home/kanfullbuster/n8n-zort/docker-compose.yml`
- **Public Domain**: `https://n8n.kankrittapon.online` (ผ่าน Cloudflare Tunnel Container: `n8n_zort_cloudflared`)
- **n8n Internal Engine**: Port `5678` (Container: `n8n_zort`)
- **PostgreSQL Database**: Port `5432` (Container: `n8n_zort_postgres`, DB: `n8n`, User: `n8n`)

---

## 🤖 2. Telegram Multi-Bot Architecture (1 Bot = 1 Domain)

ระบบได้ทำการแยกการทำงานออกเป็นระบบ **5 Bots เฉพาะทาง** เพื่อความเสถียร ประสิทธิภาพ และการดูแลรักษาที่ง่าย:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           TELEGRAM MESSAGING LAYER                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
       │                                │                          │                │                 │
       ▼                                ▼                          ▼                ▼                 ▼
 🤖 @PrivateBot                   🤖 @GarminBot              🤖 @FoodBot      🤖 @OCRBot        🤖 @CoachBot
 (Credential: H9pAWZOPVuFl4RDl)   (Cred: z3IzK5XgGQg1n6kW)   (w5K60JXnKfB96x) (pOrMnmP9GeckUZ)  (bX1ldN9X3batRMv)
       │                                │                          │                │                 │
       ▼                                ▼                          ▼                ▼                 ▼
 ┌───────────────┐               ┌───────────────┐          ┌──────────────┐ ┌──────────────┐ ┌───────────────┐
 │ Private Main  │               │ Private Health│          │ Private Food │ │ Private OCR  │ │ Private Coach │
 │ (I6NB0SLUJxPV)│               │ (PRIVATE_HLTH)│          │ (PRIV_FOOD)  │ │ (PRIV_OCR)   │ │ (PRIV_COACH)  │
 └───────┬───────┘               └───────┬───────┘          └──────────────┘ └──────────────┘ └───────────────┘
         │                               │
         ▼ (Sub-workflow)                ▼ (Webhook Bridge)
 ┌───────────────┐               ┌──────────────────────────────────────────────────────────┐
 │ Private Budget│               │ Private Forms & UI (`0N5v7wReXEy6vTnq`)                  │
 │ (PRIV_BUDGET) │               │ - /webhook/budget-start   - /webhook/workout-review      │
 └───────────────┘               │ - /webhook/budget-edit    - /webhook/receipt-edit        │
                                 └──────────────────────────────────────────────────────────┘
```

### 📋 ตารางสรุปหน้าที่ของแต่ละ Telegram Bot:

| Bot Username | Credential ID | Workflow ที่รับผิดชอบ | คำสั่งและหน้าที่หลัก |
|---|---|---|---|
| **`@PrivateBot`** | `H9pAWZOPVuFl4RDl` | `Private` (`I6NB0SLUJxPVISQ9`) | • **`/h` หรือ `/help`** → ดูคู่มือคำสั่งทั้งหมดของ Private Bot<br>• ศูนย์กลางคำสั่งทั่วไป (`/today`)<br>• จัดการงบประมาณ (`/b`, `/budget`, `/b start`, `/b income`, `/b targets`, `/b detail`)<br>• ทางลัดเปิดหน้าเว็บฟอร์ม (`/links`, `/link`, `/urls`, `/url`, `/u`)<br>• ระบบ Forward แจ้งเตือนเมื่อส่งคำสั่งผิดบอท |
| **`@GarminBot`** | `z3IzK5XgGQg1n6kW` | `Private Health` (`PRIVATE_HEALTH_V1`) | • **`/h` หรือ `/help`** → ดูคู่มือคำสั่งด้านสุขภาพและการออกกำลังกาย<br>• รับลิงก์ Garmin Connect URL<br>• Auto-Grouping จัดกลุ่มเซ็ตและตรวจเช็คชื่อท่า<br>• ดูตารางและสถิติ (`/workout`, `/workout start`)<br>• วิเคราะห์พัฒนาการด้วย **Groq AI** (`/progress`, `/workout compare`)<br>• ดูและสลับตารางฝึก (`/routine`, `/routine use <day>`)<br>• สรุปสัปดาห์ (`/week`) |
| **`@FoodBot`** | `w5K60JXnKfB96x3D` | `Private Food` (`PRIVATE_FOOD_V1`) | • **`/h` หรือ `/help`** → ดูคู่มือคำสั่งด้านโภชนาการและอาหาร<br>• **บันทึกการดื่มน้ำ (Regex Direct - No AI)** เช่น `น้ำ 500`, `ดื่มน้ำ 1 แก้ว`, `w 600ml`<br>• **Hourly Water Reminder** เตือนจิบน้ำทุกชั่วโมง (08:00 - 21:00 น.)<br>• ส่งรูปอาหาร (พร้อม Comment กำกับหรือไม่ก็ได้) → Gemini AI คำนวณแคลอรี่และสารอาหารจากรูป+ข้อความ<br>• บันทึกอาหารผ่านคำสั่ง `/eat <อาหาร>` หรือพิมพ์ชื่ออาหารภาษาไทยตรงๆ<br>• ดูประวัติอาหารและน้ำรายวัน (`/trackeat`, `/trackeat detail`)<br>• คำนวณแคลอรี่และสารอาหารด้วย **Groq AI** (`/caleat`)<br>• ลบรายการอาหาร (`/fooddelete`)<br>• Daily Cron Schedule คำนวณสรุปแคลอรี่อัตโนมัติทุกวัน 23:00 น. |
| **`@OCRBot`** | `pOrMnmP9GeckUZIg` | `Private OCR` (`PRIVATE_OCR_V1`) | • **`/h` หรือ `/help`** → ดูคู่มือคำสั่ง OCR สลิป<br>• รับรูปภาพสลิป/ใบเสร็จ เพื่อยิงไปที่ PaddleOCR (`http://paddle_ocr:8010`)<br>• โหมดรอรับรูปภาพ (`/ocr`, `porc`)<br>• ดูประวัติสลิป 5 รายการล่าสุด (`/slips`, `/slips batch`) |
| **`@CoachBot`** | `bX1ldN9X3batRMvk` | `Private Coach` (`PRIVATE_COACH_V1`) | • **`/h` หรือ `/help`** → ดูคู่มือคำสั่งโค้ชส่วนตัว<br>• **`/report`** → ดึงข้อมูลอาหาร + น้ำ + เวท 7 วันล่าสุด ให้ **Groq AI Coach** วิเคราะห์และปรับแผน<br>• **`/plan`** → ดูตารางเป้าหมาย 12 สัปดาห์ (1,850 kcal/วัน) และตารางซ้อม<br>• **`/checkin <kg>`** → บันทึกน้ำหนักและฟอร์มประจำสัปดาห์<br>• **Dynamic Strictness / Aggressive Level** ตรวจจับวินัยรายวันแบบ Realtime<br>• Automated Weekly Schedule สรุปผลทุกวันอาทิตย์ 21:00 น. |

---

## ⚡ 3. รายละเอียด Active Workflows ทั้ง 7 ตัวในระบบ

### 1) Workflow: `Private` (Main Router & Dispatcher)
- **ID**: `I6NB0SLUJxPVISQ9` | **Status**: ✅ Active
- **Triggers**: 
  - `Telegram Trigger1` (รับข้อความจาก `@PrivateBot`)
  - `Schedule Trigger` (รันรายสัปดาห์)
  - `Python OCR Webhook` (`/webhook/ocr-pipeline`)
- **Key Logic**: 
  - ตรวจสอบสิทธิ์ผู้ใช้ (`isOwner` เทียบกับ `$env.PRIVATE_OWNER_TELEGRAM_USER_ID`)
  - `Switch` แยก 26 Actions
  - ส่งต่อคำสั่งกลุ่มงบประมาณไปยัง Sub-workflow `Private Budget` ผ่านโหนด `Run Private Budget`
  - มีโหนด `Build UI Links` และ `Send UI Links` ตอบกลับลิงก์เว็บฟอร์ม

### 2) Workflow: `Private Budget` (Budget Engine)
- **ID**: `PRIVATE_BUDGET_V1` | **Status**: ✅ Active
- **Trigger**: `executeWorkflowTrigger` (รับการเรียกจาก Main Workflow)
- **Key Logic**:
  - `budget_start`: ปิดรอบเก่า (`Close Old Budget Cycle`) และเปิดรอบใหม่ (`Create Budget Cycle`) พร้อมผูกสลิป
  - `budget_summary`: สรุปสถานะรอบปัจจุบัน ยอดตั้งต้น ยอดที่ใช้ไป ยอดคงเหลือ และหมวดที่ใช้สูงสุด
  - `budget_income`: ตั้งยอดรายรับประจำรอบ
  - `budget_targets` / `budget_target`: ตั้งและดูเป้าหมายงบประมาณรายหมวดหมู่
  - `budget_detail`: ดูรายการสลิปทั้งหมดในรอบ
  - `slip_category`, `slip_amount`, `slip_delete`: ปรับแต่งและล้างสลิปออกจากงบ

### 3) Workflow: `Private Health` (Workout & Garmin Intelligence)
- **ID**: `PRIVATE_HEALTH_V1` | **Status**: ✅ Active
- **Trigger**: `Telegram Health Trigger` (รับข้อความจาก `@GarminBot`)
- **Key Logic**:
  - **Garmin Ingestion**: ดึง Sets จาก `http://garmin_api:8000/activity/{id}/exercise-sets`
  - **Auto-Grouping Algorithm**: จัดกลุ่มเซ็ตตาม Category Shift และ Rest Interval (> 180s)
  - **Staging**: บันทึกลงตาราง `workout_staging` ชั่วคราวเพื่อให้ผู้ใช้ตรวจเช็ค
  - **Quick Rename & Confirm**: พิมพ์แก้ชื่อกลุ่ม เช่น `"1 Lat Pulldown"` หรือพิมพ์ `/confirm` เพื่อบันทึกจริงลง `workout_sets`
  - **AI Progression Engine**: โหนด `Groq Progression AI` (Model: `llama-3.3-70b-versatile`) บีบอัดข้อมูลแบบ Minimal Context แล้ววิเคราะห์เปรียบเทียบพัฒนาการ 2 ครั้งล่าสุด

### 4) Workflow: `Private Forms & UI` (Web UI & Review Webhooks)
- **ID**: `0N5v7wReXEy6vTnq` | **Status**: ✅ Active
- **Endpoints ให้บริการ**:
  - `GET /webhook/budget-start` & `POST /webhook/budget-start-save` (ฟอร์มเปิดรอบงบ)
  - `GET /webhook/budget-edit` & `POST /webhook/budget-edit-save` (ฟอร์มแก้ไขรอบงบและเพิ่มบิล)
  - `GET /webhook/receipt-edit` & `POST /webhook/receipt-save` (ตารางแก้ไข/ลบสลิป 20 รายการล่าสุด)
  - `GET /webhook/workout-review` & `POST /webhook/workout-review-save` (**หน้าจอ Interactive Workout Review**: เลือกชื่อท่าจาก Dropdown และโยกย้าย Set ข้ามกลุ่มกรณีพักนาน)

### 5) Workflow: `Private Food` (Nutrition & Calorie Tracker)
- **ID**: `PRIVATE_FOOD_V1` | **Status**: ✅ Active
- **Triggers**: `Telegram Food Trigger` (@FoodBot) + Cron Schedule `0 21 * * *`
- **Key Logic**:
  - ตัดคำและตรวจจับชื่ออาหารด้วย Regex ภาษาไทย
  - บันทึกลงตาราง `food_logs`
  - วิเคราะห์แคลอรี่และสารอาหาร Macro (Protein, Carbs, Fat) ผ่าน Groq AI

### 6) Workflow: `Private OCR` (Receipt & Slip Processing)
- **ID**: `PRIVATE_OCR_V1` | **Status**: ✅ Active
- **Triggers**: `Telegram OCR Trigger` (@OCRBot)
- **Key Logic**:
  - รับรูปภาพ ส่งต่อไปยัง PaddleOCR Service (`paddle_ocr:8010`)
  - สกัดยอดเงิน, ธนาคาร, วันที่, และเลขอ้างอิง บันทึกลงตาราง `receipt_logs`

---

## 🗄️ 4. โครงสร้าง Database & Tables ที่ใช้งานจริง (`n8n_zort_postgres`)

| ชื่อตาราง (Table) | หน้าที่และรายละเอียดข้อมูล |
|---|---|
| `budget_cycles` | เก็บประวัติรอบงบประมาณ (`cycle_name`, `start_date`, `end_date`, `income_amount`, `is_active`) |
| `budget_category_targets` | เพดานงบประมาณแยกตามหมวดหมู่ในแต่ละรอบ (`budget_cycle_id`, `category`, `target_amount`) |
| `receipt_logs` | รายการสลิปและใบเสร็จที่บันทึกจาก OCR หรือกรอกมือ (`amount`, `category`, `bank_name`, `receipt_date`, `budget_cycle_id`, `direction`) |
| `workout_sets` | ประวัติการยกน้ำหนักรายเซ็ต (`activity_id`, `set_index`, `exercise_category`, `exercise_name`, `weight_kg`, `reps`, `duration_seconds`, `start_time`) |
| `workout_staging` | ข้อมูลเซ็ตของ Garmin ที่รอผู้ใช้ตรวจสอบ/แก้ไขชื่อท่าก่อนบันทึกจริง (`activity_id`, `chat_id`, `payload`) |
| `workout_routines` | ตารางแม่บทโปรแกรมการฝึกประจำวัน (`day_of_week`, `exercise_order`, `category`, `exercise_name`, `instruction`) |
| `workout_plan_overrides` | ตารางบันทึกการสลับโปรแกรมฝึกประจำวันชั่วคราว (`override_date`, `target_day_of_week`) |
| `food_logs` | ประวัติการรับประทานอาหารและแคลอรี่ (`meal_name`, `calories`, `protein`, `carbs`, `fat`, `eaten_at`) |
| `telegram_command_logs` | บันทึก Audit Log ทุกข้อความและคำสั่งที่ส่งเข้าบอท Telegram |

---

## 🔗 5. สรุป Webhook URL Index (ใช้งานผ่าน Browser / Mobile)

Base URL: `https://n8n.kankrittapon.online/webhook/`

1. **`https://n8n.kankrittapon.online/webhook/budget-start`** ──► เปิดรอบงบประมาณใหม่
2. **`https://n8n.kankrittapon.online/webhook/budget-edit`** ──► แก้ไขรายรับ/เป้าหมายของรอบปัจจุบัน
3. **`https://n8n.kankrittapon.online/webhook/receipt-edit`** ──► แก้ไขยอด/หมวดหมู่/วันที่ หรือลบสลิป 20 รายการล่าสุด
4. **`https://n8n.kankrittapon.online/webhook/workout-review?id={activity_id}`** ──► ตรวจสอบ จัดกลุ่ม และเปลี่ยนชื่อท่า Workout จาก Garmin

---

## 🔒 6. Service & Credentials Inventory

- **Telegram Accounts**:
  - `@PrivateBot`: `H9pAWZOPVuFl4RDl`
  - `@GarminBot`: `z3IzK5XgGQg1n6kW`
  - `@FoodBot`: `w5K60JXnKfB96x3D`
  - `@OCRBot`: `pOrMnmP9GeckUZIg`
- **Database Account**: `Postgres account` (`Ii5kDI1oMCxDaDoe`)
- **AI Accounts**:
  - `Groq account`: `Ju4ej9HwlpydSO5s` (ใช้โมเดล `llama-3.3-70b-versatile` สำหรับ Calorie & Progression Analysis)
  - `Google Gemini account`: `NcpKsXngkOoLgLyD` (ใช้สำหรับ Weekly Deep Analysis)

---
_เอกสารครอบคลุมระบบทั้งหมด อัปเดตล่าสุด 26 สิงหาคม 2026_
