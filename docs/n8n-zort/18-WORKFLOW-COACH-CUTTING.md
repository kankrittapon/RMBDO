# 🏆 Private Coach & 12-Week Cutting Architecture (@CoachBot)

> เอกสารบันทึกรายละเอียดสถาปัตยกรรมบอทโค้ชส่วนตัว `@CoachBot` (Workflow: `PRIVATE_COACH_V1`), แผนการฝึกและโภชนาการ 12 สัปดาห์ (1,850 kcal/วัน), และการเชื่อมต่อข้อมูลระหว่าง `workout_sets` + `food_logs` + `cutting_tracking_logs`
> จัดทำ ณ วันที่: 27 สิงหาคม 2026

---

## 🤖 1. Overview & System Placement

- **Telegram Bot**: **`@CoachBot`** (Credential ID: `bX1ldN9X3batRMvk`)
- **Workflow ID**: `PRIVATE_COACH_V1` | **Status**: ✅ Active
- **Database Tables**:
  - `cutting_tracking_logs`: เก็บสถิติ Check-in น้ำหนัก, สัดส่วน, รูป Progress, และ Target แคลอรี่รายสัปดาห์
  - `workout_routines`: ตารางแม่บทโปรแกรมการฝึกประจำวัน (อัปเดตตาม Cutting Plan CSV ใหม่)
  - `workout_sets`: ข้อมูลการฝึกเวทเทรนนิ่งจริง (ดึงมาจาก `@GarminBot`)
  - `food_logs`: ข้อมูลโภชนาการและแคลอรี่จริง (ดึงมาจาก `@FoodBot`)
- **AI Brain**: **Groq LLM (`llama-3.3-70b-versatile`)** รับบทเป็น Head Strength & Nutrition Coach

---

## 🎯 2. The 12-Week Cutting & Recomposition Plan

- **น้ำหนักตั้งต้น**: **83.0 kg** (ลดลงมาจาก 86 kg)
- **เป้าหมายพลังงาน (Daily Target)**: **1,850 kcal / วัน**
- **คาร์ดิโอ (Cardio Target)**: **45 นาที / สัปดาห์** (เดินชัน Zone 2 ในวัน Active Rest)
- **โปรตีนเป้าหมาย**: **150 - 180 g / วัน** (~2g ต่อน้ำหนักตัว 1 kg)

### 🗓️ ตารางโปรแกรมการฝึกใหม่ (New Cutting Routine):

| วัน | Session Type | สถานที่ | ท่าหลักที่ฝึก (Exercises) | เป้าหมายการกระตุ้น (Target Focus) |
|---|---|---|---|---|
| **จันทร์** | **Push Day** | ยิมใหญ่ | Incline Machine Press, Barbell Bench Press, Machine Fly, Overhead Press, JM Press/Pressdown | เน้นสร้างฐานอกบน, รักษาแรงยกอกราบ, โหลดไหล่หน้า-ข้าง, สร้างความหนาหลังแขน |
| **อังคาร** | **Legs & Abs (A)** | ยิมใหญ่ | Barbell Squat, Leg Press, Romanian Deadlift (RDL), Standing Calf Raise, Cable Crunch | โหลดหนัก Quads, อัด Volume ขา, โฟกัสแฮมสตริง & สะโพก, น่อง และแกนกลางลำตัว |
| **พุธ** | **Pull Day** | ยิมใหญ่ | Bent-over / T-Bar Row, Lat Pulldown, Seated Cable Row, Incline DB Curl, Hammer Curl | ท่าหลักสร้างหลังหนา, กางปีกสร้างความกว้าง, หนีบสะบักหลังกลาง, ยืดหน้าแขน & Brachialis |
| **พฤหัสบดี** | **Legs & Abs (B)** | ยิมใหญ่ | Barbell Deadlift / Rack Pull, Goblet Squat / Lunge, Leg Ext & Curl Super-set, Calf Raise, Hanging Leg Raise | โหลดหลังล่าง & โซนหลังทั้งหมด, เก็บรายละเอียดขามิติ, ซูเปอร์เซตปั๊มเลือดเข้าขา, ท้องล่าง |
| **ศุกร์** | **Active Rest** | คอนโด | Cardio 45 นาที (เดินชัน Zone 2) + Stretching | ฟื้นฟูร่างกาย & เร่งการเผาผลาญไขมัน |
| **เสาร์** | **Upper เก็บตก** | คอนโด | Incline DB Press, Low-to-High Fly, One-Arm DB Row, DB Preacher Curl, Overhead DB Triceps Ext | เน้นอกบน & อกชิด, ดึงเข้าเอวเน้นหลังหนา, โฟกัสยอด Bicep Peak & หลังแขนหัวยาว |
| **อาทิตย์** | **Full Rest** | พักผ่อน | Rest Day (พักเต็มที่) | ชาร์จพลังงานและฟื้นฟูกล้ามเนื้อ |

---

## 📱 3. Telegram Commands ใน `@CoachBot`

| คำสั่ง (Command) | การทำงาน & หน้าที่ |
|---|---|
| **`/report` หรือ `/summary`** | ดึงข้อมูลย้อนหลัง 7 วันจริงจาก `food_logs` + `workout_sets` ส่งให้ **Groq AI Coach** วิเคราะห์ Deficit, Protein, Training Volume และสร้าง Action Plan สัปดาห์ถัดไป |
| **`/plan`** | แสดงตารางเช็คอิน 12 สัปดาห์ พร้อมโปรแกรมการฝึกประจำวัน |
| **`/checkin <kg> [notes]`** | บันทึกน้ำหนักและฟอร์มประจำสัปดาห์ลงตาราง `cutting_tracking_logs` เช่น `/checkin 82.5 สัปดาห์นี้แรงไม่ตก อกบนชัดขึ้น` |
| **`/advice <คำถาม>` หรือพิมพ์คุยตรงๆ** | ปรึกษาข้อสงสัยด้านโภชนาการ, ปรับมื้ออาหาร, หรือวิธีแก้อาการเมื่อยล้ากับ AI Coach |
| **`/h` หรือ `/help`** | แสดงคู่มือคำสั่งทั้งหมดของ `@CoachBot` |

---

## 🧠 4. Groq API Limits & Dynamic Aggressive Coaching Engine

### ⚡ Groq API Limits (Model: `llama-3.3-70b-versatile` Free Tier):
- **RPM (Requests Per Minute)**: 30 ครั้ง/นาที
- **RPD (Requests Per Day)**: **14,400 ครั้ง/วัน** (เหลือเฟือสำหรับการใช้งานทั้งวัน)
- **Context Window**: **128,000 Tokens** (ต่อ 1 Request)
- **TPM (Tokens Per Minute)**: 6,000 - 30,000 Tokens/นาที
- *สรุป:* การ Call ในระบบของเราถูกบีบอัดข้อมูลแบบ **Minimal Aggregated Tokens (~500 - 800 tokens/call)** ทำให้ใช้งานได้ตลอด 24 ชั่วโมงโดยไม่มีปัญหา Rate Limit

### 🔥 Dynamic Strictness / Aggressive Level Logic:
ระบบจะตรวจเช็คข้อมูลจริงใน Database ก่อนตอบทุกครั้ง:
1. **เช็คว่าวันนี้คือวันอะไร & ตรวจประเภทวัน (Rest Day Intelligence)**:
   - 🟢 **Full Rest Day (วันอาทิตย์)**: วันพักผ่อนชาร์จพลังงานเต็มที่ ➜ โค้ชจะ **ไม่ทวงถามเรื่องการยกเวท** แต่จะเน้นเรื่องการพักผ่อน, นอนหลับให้พอ และคุมอาหาร/โปรตีนให้ถึง
   - 🟡 **Active Rest Day (วันศุกร์)**: วันพักฟื้นฟู ➜ โค้ชจะเน้นเช็คเรื่องการทำ **Cardio 45 นาที (เดินชัน Zone 2) + การยืดเหยียด**
   - 🏋️ **Training Days (จันทร์-พฤหัสบดี, เสาร์)**: วันซ้อมเวท ➜ ตรวจสอบว่าเข้ายิมและส่งประวัติ Garmin เข้ามาหรือยัง
2. **เช็คว่าวันนี้มีการบันทึกอาหารไหม** (`food_logs` วันนี้มีกี่มื้อ)
3. **เช็คว่าดื่มน้ำถึงเกณฑ์ไหม** (`water_logs` วันนี้จิบน้ำถึง 1,500 - 3,000 ml ไหม)
4. **เช็ค Progression แรงยก 2 ครั้งล่าสุด** (`latest_max_w` vs `prev_max_w` ขอแค่แรงยกไม่ตกหรือพัฒนาขึ้น)

```
[ระดับความดุของ AI Coach]:
🔴 HIGH AGGRESSIVE   ➜ เมื่อขาดอาหาร + ขาดซ้อมในวันฝึก + Progression ตก (ดุดัน จี้เตือนสติจริงจัง)
🟡 MODERATE STRICT   ➜ เมื่อหลุดส่งอาหาร หรือ ดื่มน้ำน้อย หรือ ขาดคาร์ดิโอในวัน Active Rest (เข้มงวด เตือนให้กลับเข้าวินัย)
🟢 ENCOURAGING/FIRM  ➜ เมื่อ Progression พัฒนาและแรงยกเพิ่มขึ้น หรือเป็นวัน Rest Day ที่ปฏิบัติตามแผนพักผ่อนอย่างถูกต้อง
```
[ระดับความดุของ AI Coach]:
🔴 HIGH AGGRESSIVE   ➜ เมื่อขาดทั้งอาหาร + ขาดซ้อม + Progression ตก (ดุดัน จี้จุดเตือนสติจริงจัง ชี้ว่าทำไมกล้ามจะหาย)
🟡 MODERATE STRICT   ➜ เมื่อหลุดส่งอาหารหรือขาดซ้อม แต่แรงยกยังประคองได้ (เข้มงวด เตือนให้กลับเข้าวินัย)
🟢 ENCOURAGING/FIRM  ➜ เมื่อ Progression พัฒนาและแรงยกเพิ่มขึ้น (ชื่นชมผลลัพธ์ แต่ยังคงคุมเข้มเรื่องอาหาร)
```

---

## ⏰ 5. Automated Daily Coach Proactive Schedulers (ระบบสะกิดเตือนอัตโนมัติ)

ระบบ `@CoachBot` จะทำหน้าที่เป็นโค้ชส่วนตัวแบบ Proactive ติดตามคุณทุกวัน 2 ช่วงเวลาหลัก:

1. **🔔 รอบบ่าย (14:00 น. ทุกวัน - Midday Coach Checkin)**:
   - **การทำงาน**: ตรวจสอบว่าช่วงเช้าถึงเที่ยงมีการบันทึกอาหารแล้วกี่มื้อ ดื่มน้ำไปเท่าไร และ **เตือนโปรแกรมการซ้อมประจำวันสำหรับช่วงเย็น**
   - **กรณีหลุดวินัย**: โค้ชจะทวงถามมื้อเที่ยงและสั่งให้เตรียมตัวสำหรับการซ้อมทันที
2. **🌙 รอบค่ำ (21:00 น. ทุกวัน - Daily Evening Review & Action Plan)**:
   - **การทำงาน**: สรุปผลภาพรวมทั้งวัน (Calories In vs Deficit, Protein Target, ปริมาณน้ำรวม, และ Session เวทเทรนนิ่ง)
   - **วิเคราะห์ความสม่ำเสมอ**: วิเคราะห์ย้อนหลัง 7 วัน + Progression แรงยก และส่ง Action Item เตรียมพร้อมสำหรับวันถัดไป

---
_เอกสารบันทึกระบบโค้ชส่วนตัว อัปเดตล่าสุด 30 สิงหาคม 2026_
