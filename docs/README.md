# RMBDO docs — สารบัญ

> ภาษา: ผสม ไทย+อังกฤษ (อธิบายเป็นไทย, ชื่อไฟล์/env/error คงอังกฤษ)
> กฎ: ทุกเลข verified ต้องมีที่มา (ไฟล์:บรรทัด หรือคำสั่งที่รัน), assumption ต้องเขียนไว้ตรงๆ ไม่ซ่อน

## Docs ชุดใหม่ (01–15)

| ไฟล์ | เรื่อง | สถานะ |
|---|---|---|
| `01-architecture.md` | App vs Collector vs Sheets vs WASM, data flow | ยังไม่เขียน |
| `02-deploy-vercel-supabase.md` | ขั้นตอน deploy: env, build, RLS, WASM check | ยังไม่เขียน |
| `03-environment.md` | `.env` ทุกตัว | ยังไม่เขียน |
| `04-database.md` | `schema.sql` ทีละตาราง + index + ทำไม crafting ใช้ slug | ยังไม่เขียน |
| `05-auth-profiles.md` | Supabase Auth + `user_profiles` + `RequireAuthGate` + อะไรยังไม่มี RLS | ยังไม่เขียน |
| `06-api-reference.md` | 7 routes + ตัวอย่าง | ยังไม่เขียน |
| `07-collector.md` | 4 scrapers + stealth + Cloudflare policy | ยังไม่เขียน |
| `08-crafting-personalization.md` | Mastery 2-step + `personalized` flag + detail-batch | **รอ backfill 90 สูตร + commit ก่อน** |
| `09-sheets-sync.md` | `Code.gs` + proxy route + localStorage keys | ยังไม่เขียน |
| `10-worker-empire.md` | Worker audit + node-yields gap + แผน Phase 0–4 | **เขียนแล้ว (audit เท่าที่ได้, ยังไม่รวมผล backfill)** |
| `11-frontend-views.md` | 18 views: live DB / static / gated login | ยังไม่เขียน |
| `12-data-trust.md` | อันไหนเชื่อได้/ไม่ได้ (รวมจาก audit-2026-09-02) | ยังไม่เขียน |
| `13-operations.md` | cron local vs Vercel Cron, normalize, backfill-icons, runbook | ยังไม่เขียน |
| `14-troubleshooting.md` | Cloudflare, IPv6, 404 ingredient, Sheets 502, WASM MIME | ยังไม่เขียน |
| `15-roadmap-gaps.md` | Known gaps + ไม่มี player_state/goals + market 5 categories | ยังไม่เขียน |

## ไฟล์เก่า (ยังไม่ย้าย — รอหลัง backfill commit ของคุณเสร็จ)

| ไฟล์ | จะทำอะไร |
|---|---|
| `audit-and-plan-2026-09-02.md` | archive → ตัวเลข verified รวบเข้า `12-data-trust.md` |
| `data-collection-checklist.md` | archive → สรุปเป็นตารางใน `12-data-trust.md` |
| `handoff-2026-09-03.md` | archive → recipe-tree ที่เคย "ยังไม่ทำ" ตอนนี้ทำแล้ว อัปเดตใน `08` |
| `handoff-worker-empire-optimizer-2026-09-05.md` | archive บางส่วน + ต่อยอดใน `10-worker-empire.md` |
| `sync/Code.gs` | คงที่ ไม่ย้าย — เนื้อหาเข้า `09-sheets-sync.md` |

## สิ่งที่รออยู่ตอนนี้ (2026-09-08)

1. backfill 90 สูตร (รันเบื้องหลังอยู่) → commit + push อัตโนมัติ (`craftingDetail.ts` rewrite + `_backfillZeroIngredientRecipes.ts`)
2. หลัง push: re-check diff → `build`/`typecheck` → เขียน `07/08` + ย้ายไฟล์เก่าเข้า `archive/`
