# Workflow Specification: Private Health & Garmin Workout Review (Phase 4)

> เอกสารสเปคและขั้นตอนการทำงานสำหรับ Workflow: Private Health & Interactive Workout Review
> จัดทำเมื่อ: 26 สิงหาคม 2026

---

## 🎯 วัตถุประสงค์

1. แยกกลุ่มคำสั่งด้านสุขภาพ, การออกกำลังกาย, และการซิงค์ Garmin ออกจาก Main Router มายัง Workflow เฉพาะ: **`Private Health`**
2. ผูก Trigger เข้ากับบอท Telegram: **`@GarminBot`** (Credential ID: `z3IzK5XgGQg1n6kW`)
3. รองรับการจัดกลุ่มเซ็ตอัจฉริยะ (Auto-Grouping) เมื่อผู้ใช้ส่ง Garmin URL
4. รองรับ Interactive UX 2 ทาง (Hybrid Telegram + Fallback Web UI Form):
   - **ทางเลือกด่วน (Telegram)**: แสดงสรุปกลุ่มท่า และสั่งแก้ชื่อกลุ่ม/กดบันทึกได้ทันที
   - **ทางเลือกยืดหยุ่น (Web UI Form - Fallback)**: แก้ไข/เลือกชื่อท่าจากตาราง Routine ประจำวัน หรือโยกย้าย Set ข้ามกลุ่มได้อิสระในกรณีที่พักนานผิดปกติ

---

## 🏗️ สถาปัตยกรรมและการไหลของข้อมูล (Data Flow)

```
[User] ส่ง Garmin URL เข้า Telegram @GarminBot
   │
   ▼
[Private Health Workflow]
   ├─ 1. ดึง Exercise Sets จาก Garmin API (garmin_api:8000/activity/{id}/exercise-sets)
   ├─ 2. กรองเฉพาะ setType === 'ACTIVE'
   ├─ 3. Auto-Grouping Algorithm:
   │      - จัดกลุ่มตาม Category Shift
   │      - จัดกลุ่มตาม Rest Time Interval (> 180s)
   │      - แนะนำชื่อท่าเบื้องต้นจากตาราง workout_routines ประจำวัน
   ├─ 4. เก็บ Pending State ชั่วคราว (ใน memory / staticData / temp table)
   ├─ 5. ตอบกลับสรุปใน Telegram @GarminBot พร้อมลิงก์ Webhook Form
   │
   ▼
[ทางเลือกการบันทึกของผู้ใช้]
   ├─ ก) พิมพ์แก้ใน Telegram หรือกด Confirm
   │      └─ บันทึกลง workout_sets + แจ้งเตือนเสร็จสิ้น
   │
   └─ ข) เปิด Web UI Form (https://n8n.kankrittapon.online/webhook/workout-review?id=...)
          ├─ ปรับเปลี่ยนชื่อท่า (มี Dropdown ประจำวันให้เลือก)
          ├─ จัดการ Set ข้ามกลุ่ม (Fallback พักนาน / รวมกลุ่ม / แยกกลุ่ม)
          ├─ กดปุ่ม [💾 บันทึก Workout]
          └─ Webhook บันทึกลง PostgreSQL (workout_sets) + สั่ง @GarminBot ส่งสรุปจบลง Telegram
```

---

## 📱 คำสั่งที่ย้ายมาประจำการที่ @GarminBot

| คำสั่ง | รายละเอียด |
|---|---|
| `ส่งลิงก์ Garmin` | นำเข้ากิจกรรมเวทเทรนนิ่ง และเข้าสู่ขั้นตอน Workout Review (มีระบบแจ้งเตือนทันทีหาก Token หมดอายุ/ติด 2FA) |
| **`/mfa <รหัส 6 หลัก>` หรือพิมพ์ตัวเลข `123456`** | **ยืนยันรหัส 2FA (MFA) ของ Garmin Connect ผ่าน Telegram ทันที** ระบบจะบันทึก Session Token ใหม่ลง Volume อัตโนมัติ |
| **`/logworkout <ท่า เซ็ต reps>` หรือ `/log ...`** | **บันทึกการออกกำลังกายด้วยมือ (Manual Log)** กรณีไม่ได้ใส่นาฬิกา Garmin AI (Groq) จะสกัดท่า น้ำหนัก และ reps บันทึกลงฐานข้อมูลทันที |
| `/workout` | สรุปประวัติและตารางออกกำลังกายล่าสุด |
| `/workout start` | แสดงโปรแกรมและน้ำหนักเป้าหมายของวันนี้ |
| `/workout compare` หรือ `/progress` | เปรียบเทียบผลการเล่นวันนี้กับครั้งก่อนหน้า (วิเคราะห์ด้วย Groq AI + Est. 1RM) |
| `/routine` | ดูตารางรูทีนการฝึก |
| `/routine use ...` | สลับโปรแกรมฝึกประจำวัน (Routine Override) |
| `/week` หรือ `ประจำสัปดาห์` | AI Trainer วิเคราะห์สรุปภาพรวมรายสัปดาห์ |

---

## 🗄️ Database Tables ที่เกี่ยวข้อง

- `workout_sets`: ตารางเก็บประวัติเซ็ตที่ออกกำลังกายจริง (activity_id, set_index, exercise_name, weight_kg, reps, duration_seconds, start_time)
- `workout_routines`: ตารางแม่บทโปรแกรมการฝึกประจำวัน (day_of_week, exercise_order, category, exercise_name, instruction)
- `workout_plan_overrides`: บันทึกการสลับโปรแกรมฝึกชั่วคราว

---
_Status: Approved for Implementation_
