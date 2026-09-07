# 10. Worker Empire — Audit + แผนระบบแนะนำโหนด (node yields)

> เขียน 2026-09-08 แบบ read-only — ไม่รัน backfill/collector/build ใดๆ
> (backfill 90 สูตรกำลังรันเบื้องหลังอยู่) ตัวเลขข้างล่างมาจากการอ่าน source + ไฟล์ data จริง

## 1. Repo อ้างอิง (กันสับสน — ชื่อคล้ายกัน 3 ตัว)

| Repo | คืออะไร | สถานะในโปรเจ็คเรา |
|---|---|---|
| `Thell/bdo-noderouter` (Unlicense) | **Solver อย่างเดียว** — รับ graph + คู่ terminal/root → คืนชุด node ที่ CP น้อยสุด (Steiner-forest approx) | vendored แล้ว: `src/lib/noderouter/noderouter.mjs` + `.d.ts` + `LICENSE-noderouter-unlicense.txt`, WASM ที่ `public/wasm/noderouter_bg.wasm`, graph ที่ `public/data/bdo-node-graph.json` (1025 nodes) |
| `shrddr/workermanjs` (เว็บ `shrddr.github.io/workerman/`) | **Planner UI ตัวจริง** — มี node → products, M$/day, efficiency (M$/day/CP), price list, import/export | **ยังไม่เอามาเลย** — ตัวนี้คือแหล่ง yields อันดับ 1 ที่จะไปเอา (ดู Phase 0) |
| `Thell/bdo-empire` (MIP optimizer, ต้องมี HiGHS + Python ≥3.12) | optimize ทั้ง empire ภายใต้ CP cap — หนักกว่า solver มาก รันหลายสิบนาที | **ไม่เอา** — overkill, รันบน Vercel ไม่ได้ |
| Fallback: `iDevelopThings/bdo-data-extractor` (Go CLI) | สกัดจากไฟล์เกมตรงๆ ได้ `world.json` ที่มี worker-production refs ใน `products` ต่อ node — authoritative สุด | ทางเลือกถ้า workerman ใช้ไม่ได้ (ต้องมีตัวเกม + Go toolchain) |

## 2. วันนี้ทำอะไรได้แล้ว (verified จาก source)

- **Solver ต่อ terminal→root ให้ CP น้อยสุด** — `src/components/workerempire/WorkerEmpireView.tsx:235-272` เรียก `router.solveForTerminalPairs(pairArrays)` รันใน browser ล้วน ไม่ส่งข้อมูลออกเซิร์ฟเวอร์ (`:295-307`)
- **โหมดแนะนำ (มีแล้ว แต่ยังไม่ใช่ yields)** — `runSuggest` (`:201-216`) + `src/lib/workerEmpire/suggestNodes.ts` (Dijkstra เต็ม graph ~1000 nodes) — แต่เรียงแค่ **CP cost + hops + workerTypeCount** ไม่รู้ว่าแต่ละโหนดขุดได้อะไร
- **Map canvas คลิกเลือก node** — `WorkerMapCanvas.tsx` (transform verify ด้วย Playwright แล้ว, `:10-16`) + ดึงคู่เข้า solver ผ่าน `applySuggestion` (`WorkerEmpireView.tsx:218-226`)
- **ชื่อ node จริง 1025 nodes** — merge จาก `explore.csv` ของ repo เดียวกัน (`WorkerEmpireView.tsx:32-37`), verify sample แล้ว (`1=Velia`)
- **pairs เก็บใน `localStorage rmbdo_worker_empire_pairs_v1`** (`:80-120`)

## 3. ช่องโหว่ — ทำไมยังตอบไม่ได้ว่า "โหนดไหนคุ้มสุด"

ยืนยันจากไฟล์จริง 3 ข้อ:

1. **`bdo-node-graph.json` ไม่มี yields เลย** — key ต่อ node มีแค่ `link_list / need_exploration_point / is_plantzone / is_base_town / worker_types (ตัวเลขดิบ 0–5, ยังไม่ map ว่าเป็น Giant/Goblin/Human ฯลฯ) / name / position` — ไม่มี field `products` ใดๆ (เช็ค keys ครบทั้ง 1025 nodes แล้ว) มีแค่ flag `is_workerman_plantzone` (sample ที่เจอเป็น `false` หมด)
2. **ฝั่งคราฟต์รู้แค่ว่า "ไปหาที่ node" แต่ชี้โหนดไม่ได้** — `PROCUREMENT_MAP` ใน `src/components/lifeskillhub/LifeSkillHubView.tsx:15-35` เขียนมือแค่ ~20 ชื่อ (`Wheat→Worker Node (Velia, Heidel)` ฯลฯ) นอกนั้นเดาด้วย regex (`meat|blood|trace → Gather`, `:40-47`) — นี่คือปลายสายที่ต้องมาเสียบ reverse lookup (ดู Phase 4)
3. **ไม่มีตาราง/API ราคา join กัน** — ไม่มี `node_resources` ใน `schema.sql`, ไม่มี API โหนด, ทั้งที่ `market_items` มีราคา live พร้อมอยู่แล้ว (~1486 rows, 5 categories) — ของครบแต่ยังไม่ต่อกัน

## 4. แผน (สโคปที่ตกลง: yields + ranking + link คราฟต์, เอา workerman ก่อน)

**Phase 0 — Data feasibility (no code, ทำก่อนเสมอ):**
เปิด `shrddr/workermanjs` หา data bundle (node→products + workload) เช็ค 3 อย่าง —
(a) license เอามาใช้ได้ไหม (b) สดพอไหม (graph เราขาดโซนใหม่อย่าง LoML ~40 nodes ที่ map image ไม่ครอบ — note ใน `WorkerMapCanvas.tsx:10-11`) (c) ต่อ product มี field อะไรบ้าง (แค่ชื่อ หรือมี workload/rate ด้วย) —
แล้วเช็คว่า node IDs ตรงกับ graph 1025 nodes ของเราไหม (ถ้าไม่ตรงต้องทำ ID reconciliation ก่อนทุกอย่าง)
ตกไป fallback `bdo-data-extractor` หรือ hand-seed top-30 nodes ตามลำดับ

**Phase 1 — Data + schema:**
`public/data/bdo-node-resources.json` (versioned + ระบุ patch/date) +
ตาราง `node_resources (waypoint_key, resource_name, workload, is_primary)` +
importer แบบรันซ้ำได้ (`ON CONFLICT DO UPDATE` — ไม่เอาแบบ `migrate.mjs` ที่รันซ้ำพัง) +
map `worker_types` ตัวเลข → ชื่อจริง

**Phase 2 — Pricing + ranking API:**
`GET /api/nodes?resource=X` (ของนี้ขุดที่โหนดไหนบ้าง) +
`GET /api/nodes/[id]` (โหนดนี้ได้อะไรบ้าง + ราคา live จาก `market_items`) +
ranking `silver/day ÷ CP` พร้อมประกาศ assumption ตรงๆ (worker lv40 กลางๆ, ไม่รวม lodging/skill) —
**v1 ไม่ทำ lodging/worker-assignment** (out of scope ตาม handoff เดิม)

**Phase 3 — UI:**
drawer "โหนดนี้ขุดได้อะไร" บน Worker Empire (click node → yields + ราคา + CP efficiency) +
ตาราง ranking (sort profit/CP/hops) + ปุ่ม `ใส่ในคู่` ต่อเข้า solver เดิม

**Phase 4 — Link คราฟต์ (ปิด loop):**
ingredient ที่เป็น `Worker Node` ใน drawer สูตรคราฟได้ปุ่ม "ดูโหนดที่ขุดได้" → reverse lookup → top-3 โหนดพร้อมราคา/CP —
เปลี่ยน `PROCUREMENT_MAP` เขียนมือให้เป็น data-driven

## 5. ความเห็น — อันไหนยาก

1. **Phase 0 ยากสุด** — ไม่ใช่โค้ด แต่คือคำถามว่า workerman data สด/ใช้ได้/IDs ตรงไหม — งานน่าเบื่อแต่ข้ามไม่ได้
2. **Yield rate → silver/day** เป็นสมมติฐานล้วน (level/skill/lodging เปลี่ยนตัวเลขหมด) — ต้องโชว์ที่มาทุกครั้ง ไม่งั้นเป็น "ตัวเลขแม่นๆ ที่ผิด" แบบที่โปรเจ็คนี้เคย undo กับสูตร mastery
3. **Patch drift** — ทุก row ต้องมี `data_version + collected_at`, UI โชว์วันที่ ไม่ซ่อน
4. ง่ายสุด: UI drawer + reverse lookup — แค่ join ของที่มีอยู่แล้ว
