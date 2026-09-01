# Workflow & Webhook: UI Forms & Quick Links (Budget / Receipts)

> เอกสารรายละเอียด UI Webhook Endpoints & Telegram Links | สร้างเมื่อ 26 ส.ค. 2026

## ℹ️ ภาพรวม

ระบบ UI Forms บน Webhook ของ n8n ถูกสร้างขึ้นเพื่อให้ผู้ใช้งานสามารถเปิดกรอกข้อมูล Budget และแก้ไขใบเสร็จ/สลิป (Receipts) ผ่านมือถือหรือ Browser ได้สะดวกรวดเร็ว โดยมีการเพิ่มคำสั่ง `/links` (พร้อม alias `/link`, `/urls`, `/url`, `/u`) บน Telegram Bot (`@PrivateBot`) ใน Main Router Workflow (`I6NB0SLUJxPVISQ9`) เพื่อส่งลิงก์ลัดเหล่านี้กลับมาให้อัตโนมัติ

---

## 🔗 Endpoints รายละเอียด

Base URL: `https://n8n.kankrittapon.online/webhook/` (หรือ `http://localhost:5678/webhook/` เมื่อทดสอบภายใน)

| Endpoint | Method | รายละเอียด & วัตถุประสงค์ |
|---|---|---|
| `/webhook/budget-start` | GET / POST | **เปิดรอบ Budget ใหม่** — ฟอร์มกรอก Income 2 คน, วันเงินเดือนออก (Payday Calendar), Target งบประมาณรายหมวด และรายการบิลประจำรอบ |
| `/webhook/budget-edit` | GET / POST | **แก้ไขรอบ Budget ปัจจุบัน** — โหลดข้อมูลเดิม (Pre-fill) ของรอบปัจจุบัน (เช่น รอบ 2026-09) มาแก้ไข Income, Targets หรือเพิ่มบิล |
| `/webhook/receipt-edit` | GET / POST | **จัดการรายการสลิป/รายจ่ายล่าสุด** — ตารางแสดงรายการสลิป 20 รายการล่าสุดจาก `receipt_logs` สามารถแก้ยอดเงิน, หมวดหมู่, วันที่ หรือกดลบรายการได้ |
| `/webhook/receipt-save` | POST | API สำหรับรับ Form payload จาก `receipt-edit` เพื่อบันทึกการแก้ไขลง PostgreSQL table `receipt_logs` |

---

## 🤖 Telegram Bot Integration (`/links`)

- **Trigger Bot**: `@PrivateBot` (Credential ID: `H9pAWZOPVuFl4RDl`)
- **Workflow**: `Private` (ID: `I6NB0SLUJxPVISQ9`)
- **Commands & Aliases**: `/links`, `/link`, `/urls`, `/url`, `/u`
- **Output ตอบกลับ**:
```text
🔗 UI Shortcuts

💰 เปิดรอบใหม่ (income/payday/targets)
https://n8n.kankrittapon.online/webhook/budget-start

✏️ แก้รอบปัจจุบัน (incomes/targets/เพิ่มบิล)
https://n8n.kankrittapon.online/webhook/budget-edit

🧾 แก้รายจ่ายล่าสุด (dropdown+calendar+ลบ)
https://n8n.kankrittapon.online/webhook/receipt-edit

📱 เปิดบนมือถือ • ใส่ user/pass n8n ครั้งแรก
```

---

## 🗄️ Database Tables ที่เกี่ยวข้อง

1. `budget_cycles`: บันทึกรอบงบประมาณ (Start/End date, สถานะ active)
2. `budget_category_targets`: เก็บเพดานงบประมาณแยกตามหมวดหมู่
3. `receipt_logs`: เก็บข้อมูลสลิปที่ได้จาก OCR / การกรอกมือ (amount, category, receipt_date, budget_cycle_id, deleted_at)

---

## ⚠️ ข้อควรระวัง & การดูแลรักษา

1. **Authentication**: เมื่อเปิดผ่าน Browser หรือมือถือจากภายนอกครั้งแรก n8n อาจขอ Login User/Pass ของระบบ n8n
2. **Postgres Sync**: การอัปเดตสถานะ Workflow หรือ Direct Database Updates ควรทำผ่าน Tunnel / MCP ตามที่กำหนดใน [AGENTS.md](file:///D:/Dev/LLM/AGENTS.md)

---
_Snapshot & Document Created: 2026-08-26_
