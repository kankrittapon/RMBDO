# Workout Data Sync Plan

> แผนการปรับปรุงระบบ Workout Data - สร้างวันที่ 26 สิงหาคม 2026

---

## 📊 สถานะปัจจุบัน

### Workout Data Flow

```
User ส่ง Garmin URL ผ่าน Telegram
    ↓
Private Workflow รับ message
    ↓
Code in JavaScript (ดึง activity_id จาก URL)
    ↓
HTTP Request → Garmin API → /activity/{id}/exercise-sets
    ↓
Code in JavaScript1 (map ข้อมูล)
    ↓
Insert rows in a table → workout_sets (n8n_db)
    ↓
ส่งข้อความ "บันทึกข้อมูลเรียบร้อย" กลับ Telegram
```

### Database Schema

#### workout_sets (n8n_db)

| Column | Type | Nullable | คำอธิบาย |
|--------|------|----------|---------|
| id | integer | NO | Primary key |
| activity_id | bigint | NO | ID ของกิจกรรมจาก Garmin |
| set_index | integer | YES | ลำดับ set |
| exercise_category | text | YES | หมวดหมู่ท่า (เช่น STRENGTH) |
| exercise_name | text | YES | ชื่อท่า (เช่น BENCH_PRESS) |
| reps | integer | YES | จำนวนครั้ง |
| weight_kg | numeric | YES | น้ำหนัก (กก.) |
| duration_seconds | numeric | YES | เวลา (วินาที) |
| start_time | timestamp | YES | เวลาที่เริ่ม |
| created_at | timestamp | YES | เวลาที่สร้าง |

**Records**: 122 records

#### WorkoutLog (private_db)

| Column | Type | Nullable | คำอธิบาย |
|--------|------|----------|---------|
| id | bigint | NO | Primary key |
| occurredAt | timestamp | NO | เวลาที่เกิดขึ้น |
| userId | text | YES | User ID |
| text | text | NO | ข้อความ |
| detail | text | NO | รายละเอียด |
| replyToken | text | YES | Reply token |
| replyMessage | text | YES | ข้อความตอบกลับ |
| raw | jsonb | NO | ข้อมูลดิบ |
| createdAt | timestamp | NO | เวลาที่สร้าง |

**Records**: 0 records (ว่าง!)

---

## 🔍 ผลการตรวจสอบ

### จุดที่ 1: Flow การ map ข้อมูล Garmin จาก code node ลง DB

**สถานะ**: ✅ ทำงานถูกต้อง

**Code ที่ map ข้อมูล**:
```javascript
return activity.exerciseSets
  .filter(set => set.setType === 'ACTIVE')  // เอาเฉพาะช่วงออกแรงจริง ข้าม REST
  .map(set => ({
    activity_id: activity.activityId,
    set_index: set.messageIndex,
    exercise_category: set.exercises[0]?.category || null,
    exercise_name: set.exercises[0]?.name || null,
    reps: set.repetitionCount,
    weight_kg: set.weight ? set.weight / 1000 : null,
    duration_seconds: set.duration,
    start_time: set.startTime
  }));
```

**ปัญหา**: ข้อมูลอยู่ใน `workout_sets` เท่านั้น ไม่ได้ sync ไปที่ `WorkoutLog`

---

### จุดที่ 2: เพิ่ม Activity อย่างอื่นได้ไหม

**สถานะ**: ❌ ล็อคไว้แค่ Workout

**ปัญหา**:
- Code node map ข้อมูลเฉพาะ `exerciseSets` เท่านั้น
- ไม่ได้ map ข้อมูลกิจกรรมอื่น

**ข้อมูลที่ Garmin มี แต่ไม่ได้ map**:

| Activity Type | ข้อมูลที่มี | สถานะ |
|---------------|------------|-------|
| Strength Training | exerciseSets | ✅ Map แล้ว |
| Running | distance, duration, pace | ❌ ไม่ได้ map |
| Cycling | distance, duration, speed | ❌ ไม่ได้ map |
| Swimming | distance, duration, laps | ❌ ไม่ได้ map |
| Yoga | duration, calories | ❌ ไม่ได้ map |

** excerise_category ที่มีอยู่**:

| Category | Records |
|----------|---------|
| DEADLIFT | 21 |
| BENCH_PRESS | 18 |
| CURL | 18 |
| TRICEPS_EXTENSION | 18 |
| PULL_UP | 14 |
| SQUAT | 14 |
| LATERAL_RAISE | 13 |
| SHOULDER_PRESS | 11 |
| CRUNCH | 6 |
| ROW | 5 |
| CALF_RAISE | 3 |
| SIT_UP | 3 |

---

### จุดที่ 3: flow /weekly /month

**สถานะ**: ❌ ยังไม่สำเร็จ

**ผลการตรวจสอบ**:

| Command | Action | Status | Executions |
|---------|--------|--------|------------|
| `/workout` | `workout_summary` | routed | 8 ครั้ง |
| `/budget week` | `budget_period` | routed | 1 ครั้ง |
| `/budget month` | `budget_period` | routed | 2 ครั้ง |
| `/week` | `weekly_report` | - | 0 ครั้ง ❌ |
| `/month` | - | - | ไม่มี action |

**ปัญหา**:
1. **`/week`** - ไม่มี action `weekly_report` ที่ถูก trigger
2. **`/month`** - ไม่มี action สำหรับ monthly report
3. **`/workout`** - ทำงานได้ แต่แสดงข้อมูลไม่ครบ

---

## 🎯 แผนการแก้ไข

### Phase 1: Workout Data Sync (1-2 วัน)

#### เป้าหมาย
- รวมข้อมูล workout ไว้ที่ศูนย์กลาง
- แสดง workout summary ได้
- Weekly report อัตโนมัติ

#### แผนงาน

| Step | งาน | รายละเอียด | เวลา | Priority |
|------|-----|------------|------|----------|
| 1.1 | ตรวจสอบ schema ของ WorkoutLog | ดู fields ที่มี | 30 นาที | High |
| 1.2 | สร้าง sync script | ย้ายข้อมูล workout_sets → WorkoutLog | 1 ชม. | High |
| 1.3 | ทดสอบ sync script | ทดสอบว่าข้อมูลถูกต้อง | 30 นาที | High |
| 1.4 | สร้าง n8n workflow ใหม่ | สำหรับ auto-sync | 2 ชม. | High |
| 1.5 | ทดสอบ workflow ใหม่ | ทดสอบว่าทำงานได้ | 1 ชม. | High |
| 1.6 | อัปเดต docs | เขียน documentation | 30 นาที | Medium |

#### Flow ที่ต้องการ

```
User ส่ง Garmin URL ผ่าน Telegram
    ↓
Garmin Bot รับ message
    ↓
HTTP Request: Garmin API → /activity/{id}/exercise-sets
    ↓
Transform: แปลงข้อมูลเป็น workout
    ↓
PostgreSQL: บันทึกลง workout_sets (n8n_db)
    ↓
HTTP Request: Private API → /workout
    ↓
PostgreSQL: บันทึกลง WorkoutLog (private_db)
    ↓
ส่งผลลัพธ์กลับ Telegram
```

---

### Phase 2: เพิ่ม Activity Types (2-3 วัน)

#### เป้าหมาย
- เพิ่มข้อมูลกิจกรรมอื่นๆ
- รองรับ Running, Cycling, Swimming, etc.

#### แผนงาน

| Step | งาน | รายละเอียด | เวลา | Priority |
|------|-----|------------|------|----------|
| 2.1 | แก้ไข Code node | map ข้อมูลกิจกรรมอื่น | 2 ชม. | High |
| 2.2 | เพิ่ม columns ใน DB | เพิ่ม fields สำหรับ activity อื่น | 1 ชม. | High |
| 2.3 | สร้าง new commands | /run, /cycle, /swim, etc. | 2 ชม. | Medium |
| 2.4 | ทดสอบ | ทดสอบว่าทำงานได้ | 1 ชม. | High |
| 2.5 | อัปเดต docs | เขียน documentation | 30 นาที | Medium |

#### Flow ที่ต้องการ

```
User ส่ง Garmin URL ผ่าน Telegram
    ↓
Detect Activity Type
    ↓
┌─────────────────────────────────────────────────────────────┐
│  Strength Training                                          │
│  - exerciseSets → workout_sets                              │
│  - exercise_name, reps, weight_kg                           │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  Running                                                    │
│  - distance, duration, pace → run_logs                      │
│  - distance_km, duration_min, pace_min_km                   │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  Cycling                                                    │
│  - distance, duration, speed → cycle_logs                   │
│  - distance_km, duration_min, speed_kmh                     │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  Swimming                                                   │
│  - distance, duration, laps → swim_logs                     │
│  - distance_m, duration_min, laps                           │
└─────────────────────────────────────────────────────────────┘
```

---

### Phase 3: Weekly/Monthly Reports (1-2 วัน)

#### เป้าหมาย
- สร้าง weekly report อัตโนมัติ
- สร้าง monthly report
- แสดงข้อมูลสรุป

#### แผนงาน

| Step | งาน | รายละเอียด | เวลา | Priority |
|------|-----|------------|------|----------|
| 3.1 | สร้าง action weekly_report | รายงานสัปดาห์ | 1 ชม. | High |
| 3.2 | สร้าง action monthly_report | รายงานเดือน | 1 ชม. | High |
| 3.3 | สร้าง workflow ใหม่ | สำหรับ reports | 2 ชม. | Medium |
| 3.4 | ทดสอบ | ทดสอบว่าทำงานได้ | 1 ชม. | High |
| 3.5 | อัปเดต docs | เขียน documentation | 30 นาที | Medium |

#### Flow ที่ต้องการ

```
/week command
    ↓
weekly_report action
    ↓
PostgreSQL: Query workout_sets (7 วันล่าสุด)
    ↓
Aggregate: รวมข้อมูลตามวัน/ท่า
    ↓
Format: จัดรูปแบบรายงาน
    ↓
Telegram: ส่งรายงานกลับ
```

```
/month command
    ↓
monthly_report action
    ↓
PostgreSQL: Query workout_sets (30 วันล่าสุด)
    ↓
Aggregate: รวมข้อมูลตามสัปดาห์/ท่า
    ↓
Format: จัดรูปแบบรายงาน
    ↓
Telegram: ส่งรายงานกลับ
```

---

## 📅 Timeline รวม

| Phase | งาน | เวลา | Start | End |
|-------|-----|------|-------|-----|
| **Phase 1** | Workout Data Sync | 1-2 วัน | 26 ส.ค. | 27 ส.ค. |
| **Phase 2** | เพิ่ม Activity Types | 2-3 วัน | 27 ส.ค. | 29 ส.ค. |
| **Phase 3** | Weekly/Monthly Reports | 1-2 วัน | 29 ส.ค. | 30 ส.ค. |

**รวม**: ประมาณ 5-7 วัน

---

## ⚠️ ความเสี่ยง

| ความเสี่ยง | ผลกระทบ | วิธีจัดการ |
|-----------|---------|-----------|
| Schema mismatch | ข้อมูลไม่ตรง | ตรวจสอบ schema ก่อน sync |
| Data loss | ข้อมูลหาย | Backup ก่อนเปลี่ยนแปลง |
| API error | ข้อมูลไม่ sync | ตรวจสอบ logs |
| Performance | ช้า | Optimize queries |

---

## 📊 Success Criteria

### Phase 1: Workout Data Sync
- [ ] `WorkoutLog` มีข้อมูลจาก `workout_sets`
- [ ] `/workout` แสดง workout summary ครบถ้วน
- [ ] Auto-sync ทำงานได้

### Phase 2: เพิ่ม Activity Types
- [ ] รองรับ Running, Cycling, Swimming
- [ ] เพิ่ม commands ใหม่ได้
- [ ] ข้อมูลถูกต้อง

### Phase 3: Weekly/Monthly Reports
- [ ] `/week` ทำงานได้
- [ ] `/month` ทำงานได้
- [ ] รายงานครบถ้วน

---

## 📝 Notes

- **Priority**: Phase 1 ควรทำก่อน เพราะเป็นปัญหาหลัก
- **Dependency**: Phase 2 ขึ้นอยู่กับ Phase 1
- **Testing**: ทดสอบทุก phase ก่อนไป phase ถัดไป
- **Backup**: backup database ก่อนเปลี่ยนแปลง

---

_Last updated: 2026-08-26_
