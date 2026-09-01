# Implementation & Migration Plan (Telegram Multi-Bot Architecture)

> แผนการปรับปรุงระบบ n8n-zort สู่โครงสร้างแยก 4 Bots — อัปเดตล่าสุด 26 สิงหาคม 2026

---

## 📋 สรุปสถานะจริงปัจจุบัน (Active Workflows ในระบบ)

| Workflow ID | Workflow Name | Active | Trigger / Bots | หน้าที่หลัก |
|---|---|---|---|---|
| `I6NB0SLUJxPVISQ9` | **Private** (Main) | ✅ Active | Telegram (@PrivateBot) | Main Router, Help, Today, Workout, Routine, Garmin Import, Weekly Report, Dispatch Budget |
| `PRIVATE_FOOD_V1` | **Private Food** | ✅ Active | Telegram (@FoodBot) + Schedule 21:00 | บันทึกอาหาร, คำนวณแคลอรี่ (Groq), Track อาหาร, ลบรายการ |
| `PRIVATE_OCR_V1` | **Private OCR** | ✅ Active | Telegram (@OCRBot) + Webhook | รับรูปสลิป, OCR Paddle, ดูประวัติสลิป |
| `PRIVATE_BUDGET_V1`| **Private Budget** | ✅ Active | Sub-workflow (จาก Main) | จัดการรอบงบ, Target หมวดหมู่, สรุปงบ (`/b`), จัดการสลิป |
| `0N5v7wReXEy6vTnq` | **Private Budget Forms** | ✅ Active | Webhook (UI Pages) | Form เปิดรอบใหม่, แก้รอบงบ, แก้/ลบสลิปผ่าน Browser/มือถือ |

---

## 🎯 แผนการย้ายระบบแยกบอท (Multi-Bot Migration Plan: 4 Phases)

เป้าหมาย: **1 Bot = 1 หน้าที่เฉพาะทาง** ลดความซับซ้อนของ Main Router และกระจายโหลดไม่ให้กระทบกัน

```
@FoodBot    (Credential: w5K60JXnKfB96x3D) ──► Private Food
@OCRBot     (Credential: pOrMnmP9GeckUZIg) ──► Private OCR
@PrivateBot (Credential: H9pAWZOPVuFl4RDl) ──► Private Main & Budget
@GarminBot  (Credential: z3IzK5XgGQg1n6kW) ──► Private Health (รอสร้างใน Phase 4)
```

---

### 🚀 Phase Breakdown & สถานะการดำเนินการ

```
```
[Phase 1: @OCRBot]     ✅ เสร็จสมบูรณ์ (เชื่อม Telegram Trigger @OCRBot + Standalone nodes)
[Phase 2: @FoodBot]    ✅ เสร็จสมบูรณ์ (เชื่อม Telegram Trigger @FoodBot + Schedule CalEat)
[Phase 3: @PrivateBot] ✅ เสร็จสมบูรณ์ (เชื่อม Budget /b, /links UI Webhook Forms + ซ่อม Switch connections)
[Phase 4: @GarminBot]  ✅ เสร็จสมบูรณ์ (สร้าง Private Health, Auto-Grouping + Webhook Workout Review Form)
```

---

### 1. Phase 1: แยก @OCRBot (OCR & Slip Domain)
- **สถานะ:** ✅ **เสร็จสมบูรณ์**
- **สิ่งที่ทำแล้ว:**
  - เพิ่มโหนด `Telegram OCR Trigger` เชื่อมกับ `@OCRBot` (`pOrMnmP9GeckUZIg`) ใน Workflow `PRIVATE_OCR_V1`
  - ย้ายโหมด Paddle wait-state (`/ocr`, `porc`) และการตรวจจับรูปภาพมาทำงานที่ `@OCRBot` โดยตรง
  - โหนดส่งข้อความตอบกลับ (`Send OCR Wait Reply`, `Send OCR Result`, `Send Slips Reply`) เปลี่ยนไปใช้ Credential ของ `@OCRBot`

---

### 2. Phase 2: แยก @FoodBot (Food & Nutrition Domain)
- **สถานะ:** ✅ **เสร็จสมบูรณ์**
- **สิ่งที่ทำแล้ว:**
  - เพิ่มโหนด `Telegram Food Trigger` เชื่อมกับ `@FoodBot` (`w5K60JXnKfB96x3D`) ใน Workflow `PRIVATE_FOOD_V1`
  - รองรับคำสั่ง `/eat`, ข้อความชื่ออาหาร (Natural Language Food Regex), `/trackeat`, `/caleat`, `/fooddelete`
  - โหนดส่งข้อความตอบกลับ (`Send Eat Reply`, `Send CalEat Batch Reply`, `Send Food Tracking` ฯลฯ) ตอบผ่าน `@FoodBot` ทั้งหมด

---

### 3. Phase 3: @PrivateBot & Budget System & UI Webhook Forms
- **สถานะ:** ✅ **เสร็จสมบูรณ์**
- **สิ่งที่ทำแล้ว:**
  - **Budget Routing & Telegram `/b`:** 
    - แก้ไขและเชื่อมโยง Switch connection ใน Main Router (`I6NB0SLUJxPVISQ9`) ทั้งหมด 26 paths ให้ส่งต่อ action กลุ่ม `budget_*` และ `slip_*` ไปยัง `PRIVATE_BUDGET_V1` อย่างถูกต้อง
    - รองรับคำสั่ง `/b`, `/budget`, `/b start`, `/b income`, `/b targets`, `/b detail`
  - **Webhook UI Forms:** 
    - สร้าง Workflow `Private Budget Forms` (`0N5v7wReXEy6vTnq`) รองรับหน้าจอเว็บ:
      - `/webhook/budget-start`: เปิดรอบงบใหม่
      - `/webhook/budget-edit`: แก้ไขรอบงบปัจจุบัน
      - `/webhook/receipt-edit`: รายการแก้ไข/ลบสลิป 20 รายการล่าสุด
  - **Telegram Shortcut `/links`:** 
    - เพิ่มคำสั่ง `/links` (พร้อม alias `/link`, `/urls`, `/url`, `/u`) ใน `@PrivateBot` เพื่อพ่นลิงก์ทางลัดเปิดหน้า UI

---

### 4. Phase 4: แยก @GarminBot & Private Health Workflow + Auto-Grouping Review
- **สถานะ:** ✅ **เสร็จสมบูรณ์**
- **สิ่งที่ทำแล้ว:**
  - **สร้าง Workflow ใหม่ `Private Health` (`PRIVATE_HEALTH_V1`)**:
    - ผูกกับ Telegram Trigger ของ `@GarminBot` (`z3IzK5XgGQg1n6kW`)
    - ย้ายคำสั่ง `/workout`, `/workout start`, `/progress`, `/routine`, `/routine use`, `/week` มาตอบผ่าน `@GarminBot`
  - **ระบบ Auto-Grouping & Review สำหรับ Garmin URL**:
    - ดึงข้อมูลจาก Garmin API (`garmin_api:8000/activity/{id}/exercise-sets`)
    - อัลกอริทึมจัดกลุ่มเซ็ตตาม Category Shift และ Rest Interval (> 180s)
    - บันทึกลงตาราง Staging (`workout_staging`) และส่งข้อความสรุปกลุ่มท่า
    - รองรับการแก้ไขชื่อกลุ่มท่าด่วนใน Telegram เช่น `"1 Lat Pulldown"` แล้วพิมพ์ `/confirm`
  - **Webhook Form สำหรับ Workout Review & Fallback พักนาน**:
    - Endpoints: `https://n8n.kankrittapon.online/webhook/workout-review?id={activity_id}`
    - มี Dropdown ดึงชื่อท่าจากตาราง `workout_routines` ประจำวัน
    - รองรับการโยกย้าย Set ข้ามกลุ่มได้อย่างอิสระ (กรณีพักนานจนระบบแยกกลุ่มผิด)
    - เมื่อกด Save จะบันทึกลง `workout_sets` และส่ง Telegram แจ้งเตือนเสร็จสิ้น
  - **Clean Main Router (`I6NB0SLUJxPVISQ9`)**:
    - ลบ Branch ซ้ำซ้อน และเพิ่มระบบแจ้งเตือนแนะนำให้ผู้ใช้ส่งข้อความไปที่ `@GarminBot` โดยตรง


---

_เอกสารอัปเดตตรงตามสถานะจริงของ Database และ Session: 26 ส.ค. 2026_
