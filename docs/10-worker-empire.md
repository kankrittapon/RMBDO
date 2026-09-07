# 10. Worker Empire — Node yields, ranking, craft↔node loop

> อัปเดต 2026-09-08 — Phase 0-4 (yields/ranking/UI/reverse-lookup) เสร็จและ verify แล้วทั้งหมด
> ตัวเลขในไฟล์นี้ verify จริงกับ live DB/API/DOM ทั้งหมด ไม่ได้ก็อปรายงานมาเฉยๆ

## สถานะรวบ (สิ่งที่ทำเสร็จแล้ว)

| Phase | เนื้อหา | Commit | Verify |
|---|---|---|---|
| 0 | Audit + แผน (repo table ด้านล่าง) | `c9118b5` | - |
| — | Vendor workerman yield data (plantzone_drops.json ฯลฯ) | `5f18a3e` | **ลิขสิทธิ์ยังไม่ชัด** — upstream ไม่มี LICENSE, push ไปแล้วโดยยอมรับความเสี่ยง ผู้ใช้จะเปิด issue ขออนุญาต shrddr เอง (ยังไม่ได้เปิด ณ เวลาเขียนไฟล์นี้) |
| 1 | `node_meta` (370 nodes) + `node_resources` (2433 rows: unlucky 846 / unlucky_gi 846 / lucky 741) | `b610893` | เช็คตรง DB จริงแล้ว - count ตรง, Wheat Farming #852 → Wheat×18 (normal) ตรง |
| 2 | `GET /api/nodes?resource=X` + `GET /api/nodes/[id]` — normal/giant แยกเด็ดขาด, ราคา null ไม่เดา | `322171e` | เช็คกับ live server จริง - node #852: normal 21×2,800=58,800 / giant 34.845×2,800=97,567.34 ตรงเป๊ะ, unpricedCount ทำงานถูก |
| 3 | `NodeYieldsDrawer.tsx` บน Worker Empire (toggle normal/giant, ปุ่มส่ง solver ผูก waypointKey) | `042c4c4` | อ่านโค้ดตรวจแล้ว - null-safe ทุกฟิลด์, ปุ่มไม่สับสนกับ itemId |
| 4 | `NodeSourceLookup.tsx` ใต้แถว ingredient (เฉพาะ 🌾 Worker Node) — exact-match ชื่อเท่านั้น, toggle normal/giant แยก sort key | `bf8b0c6` | verify live: "Powder" เจอ node จาก server แต่ exact-match กรองออกหมด (ถูกต้อง - ไม่จับผิดตัว), "Wheat&kind=giant" เรียง #852 ก่อน #435/#439 ถูก |
| — | bdocodex supplemental recipe source (สูตรที่ bdolytics ไม่มี เช่น Sweet Honey Wine) | `d91e21a` | verify live DOM ตรงกับ DB: item IDs 7704/9279/9002/7313, quantity 2/4/10/2, is_base ตรงกับ tiptype recipekey/recipe |

**ทั้งหมด push ขึ้น `origin/main` แล้ว** (ล่าสุด `d91e21a`)

## Repo อ้างอิง (กันสับสน — ชื่อคล้ายกัน 3 ตัว)

| Repo | คืออะไร | สถานะในโปรเจ็คเรา |
|---|---|---|
| `Thell/bdo-noderouter` (Unlicense) | **Solver อย่างเดียว** — รับ graph + คู่ terminal/root → คืนชุด node ที่ CP น้อยสุด (Steiner-forest approx) | vendored แล้ว: `src/lib/noderouter/noderouter.mjs` + `.d.ts` + `LICENSE-noderouter-unlicense.txt`, WASM ที่ `public/wasm/noderouter_bg.wasm`, graph ที่ `public/data/bdo-node-graph.json` (1025 nodes) |
| `shrddr/workermanjs` (เว็บ `shrddr.github.io/workerman/`) | **แหล่ง yields data** — `plantzone_drops.json` (370 nodes) ที่ vendor เข้ามาใช้จริงแล้ว | vendored ที่ `vendor/workerman/` — **license ยังไม่ชัด** ดูแถวด้านบน |
| `Thell/bdo-empire` (MIP optimizer) | optimize ทั้ง empire ภายใต้ CP cap — หนักกว่า solver มาก | **ไม่เอา** — overkill, รันบน Vercel ไม่ได้ |
| Fallback: `iDevelopThings/bdo-data-extractor` (Go CLI) | สกัดจากไฟล์เกมตรงๆ | ไม่ต้องใช้แล้ว - workerman data ใช้งานได้ |
| `bdocodex.com` | สูตรคราฟที่ bdolytics ไม่มี (gap-fill) | vendored/scrape แบบ on-demand แล้ว, ตาราง `bdocodex_recipes` แยกจาก `crafting_recipes` |

## ยังไม่ได้ทำ / ค้างอยู่

1. **ขออนุญาต shrddr อย่างเป็นทางการ** — ผู้ใช้ (kan) จะเปิด issue เองบน `shrddr/workermanjs` (ไม่ใช่ agent เปิดแทน) - ยังไม่ยืนยันว่าเปิดแล้วหรือยัง
2. **`worker_types` ตัวเลขดิบ 0-5** ยังไม่ map เป็นชื่อจริง (Giant/Human/Goblin ฯลฯ) แบบสมบูรณ์ — `species.ts` ที่ Phase 1 เพิ่มทำ best-effort ไว้ giant flag ตรง แต่ชื่อ regional อื่นยัง approximate
3. **ไม่มี lodging/worker-assignment/skill-level scaling** ในการคำนวณ silver/CP — ตั้งใจ scope ไว้แบบนี้ตั้งแต่ Phase 2 (v1 ไม่ทำ) ไม่ใช่ gap ที่ลืม
4. **bdocodex ราคา live** — ไม่ได้ reverse-engineer AJAX price endpoint ของ bdocodex ตามที่ตกลง (เสี่ยงเกินความจำเป็นสำหรับ feature เสริม) แนะนำแทน: join ชื่อวัตถุดิบ bdocodex กับ `market_items` ที่มีราคาสดอยู่แล้วแทน — **ยังไม่ได้ทำจุดนี้**
5. เอกสาร docs อื่นในชุด 01-15 (ดู `README.md`) ส่วนใหญ่ยังไม่เขียน

## ข้อควรระวังตอนใช้ตัวเลข yields (ย้ำจาก Phase 0)

1. **Yield rate → silver/day เป็นสมมติฐานบางส่วน** (worker level/skill/lodging กระทบตัวเลขจริง) — API/UI นี้แสดง "ราคาต่อรอบ (cycle value)" ดิบๆ จากปริมาณ drop จริง ไม่ได้คำนวณ silver/day เต็มรูปแบบที่ผูกกับ worker setup ใดๆ
2. **normal/giant ต้องแยกกันเสมอ** ไม่เฉลี่ยข้าม kind — บังคับใช้ตลอดทั้ง 4 phase แล้ว
3. ของไม่มีราคาตลาด (`price: null`) แสดงตรงๆ ไม่เดา ไม่นับเข้า cycle value
