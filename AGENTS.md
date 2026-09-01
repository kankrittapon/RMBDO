# AGENTS.md — Rules for AI Agents

> Central rules and conventions for all AI agents working in this project.
> (Merged from AGENT.md + AGENTS.md on 2026-08-26 — this file is the **single source of truth**)

---

## 🖥️ Server: ai-brain

### Connection Info

| Field       | Value                     |
|-------------|---------------------------|
| Host        | `ai-brain` / `192.168.1.248` |
| User        | `kanfullbuster`           |
| SSH Key     | `~/.ssh/id_ed25519`       |
| SSH Config  | Already configured in `~/.ssh/config` |

### How to SSH

```bash
ssh ai-brain                          # quick connect
ssh ai-brain "<command>"              # single command
ssh ai-brain "cd /path && cmd1 && cmd2"
```

> ⚠️ ถ้า SSH config หาย ให้สร้างใหม่จาก block ด้านบน

---

## 🔌 MCP Servers (Model Context Protocol)

> ⚠️ **IMPORTANT**: AI Agent ทุกตัวต้องใช้ MCP servers เหล่านี้สำหรับทำงานบน server
>
> Config ของ opencode: `D:\Dev\LLM\opencode.json` | Central reference: `mcp-config.json`

### Available MCP Servers

| MCP Server | Package | Description | Status |
|------------|---------|-------------|--------|
| `ssh-remote` | `@zachflint/ssh-mcp-server` | SSH remote execution | ✅ ใช้งานได้ |
| `docker` | `@0xshariq/docker-mcp-server` | Docker management | ✅ ใช้งานได้ (24 tools, DOCKER_HOST=ssh://) |
| `postgres` | `@modelcontextprotocol/server-postgres` | PostgreSQL access | ✅ ผ่าน SSH tunnel (`pg-tunnel.ps1` → 127.0.0.1:15432) |
| `n8n` | `n8n-mcp` | n8n workflow management | ✅ Full mode (API key ใน User env `N8N_API_KEY`) |
| `cloudflare` | `@cloudflare/mcp-server-cloudflare` | Cloudflare API | ⏸️ Disabled — npm package deprecated (Cloudflare ย้ายไป hosted remote MCP แยกตามบริการ) + เครื่องนี้ไม่มี `CLOUDFLARE_API_TOKEN` |

> ℹ️ `sqlite` MCP ถูกถอดออก — ไม่ได้ใช้งาน
>
> ℹ️ Cloudflare ถ้าจะเปิดใช้ภายหลัง: ตั้ง env `CLOUDFLARE_API_TOKEN` แล้วเลือกใช้ remote MCP ของ Cloudflare (docs / observability / radar) — package local ตัวเดิมใช้ไม่ได้แล้ว

### Working Config Notes (พิสูจน์แล้ว 26 ส.ค. 2026)

- **ssh-remote**: ต้องใช้ env `SSH_HOST`, `SSH_USERNAME`, `SSH_PRIVATE_KEY` (full path) — *ชื่อ `SSH_USER`/`SSH_KEY` ไม่ทำงาน*
- **docker**: package นี้ bin ชี้ CLI wrapper ผิด → ต้องรัน `node ...dist/index.js` ตรง (installed global) + ตั้ง `"timeout": 60000`
- **postgres**: DB บน server ไม่ expose port → ใช้ wrapper `C:\Users\telep\.config\opencode\pg-tunnel.ps1` (auto tunnel ไป container IP ปลายทาง 5432)
- ทุก local server ควรตั้ง `"timeout": 60000` (default 5s ไม่พอสำหรับ npx cold start)

#### ✅ Postgres connection ที่ใช้ได้จริง

```json
"postgres": {
  "type": "local",
  "command": ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass",
              "-File", "C:\\Users\\telep\\.config\\opencode\\pg-tunnel.ps1"],
  "timeout": 60000
}
```

- Wrapper จะเปิด SSH tunnel เอง: `ssh -N -L 127.0.0.1:15432:<container_ip>:5432` → connect ด้วย `postgresql://n8n@127.0.0.1:15432/n8n`
- ❌ **ห้ามใช้** `postgresql://...@192.168.1.248:5432/...` (direct) — `ECONNREFUSED` เพราะ port ไม่ expose ออกนอก host

#### 📌 Raw SSH — ขอบเขตที่อนุญาต

- "Raw SSH" = สั่ง `ssh`/`scp` จาก local terminal โดยตรง (ไม่ผ่าน `ssh-remote` MCP)
- ✅ **อนุญาต**: scp โอนไฟล์, กรณี MCP ไม่รองรับ feature นั้น, คำสั่งตัวอย่างใน section *Common Remote Tasks*
- ❌ **ไม่อนุญาต**: รัน command ประจำวัน (docker/psql/logs) ผ่าน raw ssh ทั้งที่ MCP พร้อม

---

## 🚨 STRICT RULES FOR AI AGENTS

> ⛔ **RULES เหล่านี้มีผลบังคับใช้กับ AI Agent ทุกตัว — ห้ามฝ่าฝืนเด็ดขาด**

### Rule 1: ต้องใช้ MCP Servers เท่านั้น

- ✅ **MUST** ใช้ MCP servers สำหรับทุก operation บน server
- ✅ **MUST** ใช้ `ssh-remote` MCP สำหรับ remote commands
- ✅ **MUST** ใช้ `docker` MCP สำหรับ Docker operations
- ✅ **MUST** ใช้ `postgres` MCP สำหรับ database queries
- ✅ **MUST** ใช้ `n8n` MCP สำหรับ workflow management
- ⏸️ `cloudflare` MCP: **disabled** จนกว่าจะตั้ง token — ห้ามเรียก
- ❌ **NEVER** ใช้ raw SSH commands เมื่อ MCP server พร้อมใช้งาน *(ยกเว้น: file transfer ผ่าน scp และกรณี MCP ไม่รองรับ feature นั้น)*
- ❌ **NEVER** hardcoded IP addresses ในโค้ด

### Rule 2: ทำงานเฉพาะใน server_workspace folder เท่านั้น

- ✅ **MUST** อ่านค่า `server_workspace` จากไฟล์ `.env` เพื่อกำหนด folder ที่ทำงานบน server
  - **รูปแบบที่ owner ตั้ง (canonical)**: `server_workspace = n8n-zort` — มีช่องว่างรอบ `=` ได้, ค่าเป็นชื่อ folder relative ภายใต้ `/home/kanfullbuster/` → resolve เป็น `/home/kanfullbuster/n8n-zort`
- ✅ **MUST** ทำงานเฉพาะใน folder ที่กำหนดใน `server_workspace` เท่านั้น
- ✅ **MUST** ใช้ `cd $server_workspace` ก่อนทำงาน
- ❌ **NEVER** ทำงาน/แก้ไข/สร้างไฟล์นอก server_workspace folder
- ❌ **NEVER** เขียน Python files (.py) ลง server_workspace หรือสร้าง Python scripts บน server
- ✅ **MUST** ใช้ MCP servers สำหรับ operations ทั้งหมดบน server

**`.env` จริงปัจจุบัน (ห้ามแก้รูปแบบ)**:
```bash
server_workspace = n8n-zort
```

### Rule 3: การทำงานกับไฟล์

**Local Machine**:
- ✅ **MAY** เขียน docs ลง local machine ใน path `D:\Dev\LLM\`
  - ตัวอย่าง: `D:\Dev\LLM\docs\n8n-zort\`, `D:\Dev\LLM\docs\adms\`
  - เขียนลง folder ไหนก็ได้ภายใต้ `D:\Dev\LLM\` ที่เหมาะสมกับ project
- ✅ **MAY** เขียน Python files ลง local machine
- ✅ **MAY** download files จาก server ลง local machine ถ้าจำเป็น

**Server**:
- ✅ **MUST** ทำงานผ่าน MCP servers เท่านั้น สำหรับ operations บน server
- ✅ **MUST** อ่าน/แก้ไขไฟล์บน server ผ่าน SSH MCP
- ❌ **NEVER** แก้ไขไฟล์บน server โดยไม่ผ่าน MCP
- ❌ **NEVER** เขียน Python files (.py) ลง server_workspace
- ❌ **NEVER** สร้าง Python scripts บน server
- ❌ **NEVER** hardcode passwords/secrets ในไฟล์ที่ download

### Rule 4: Safety & Security

- ✅ **MUST** confirm กับ user ก่อนรัน destructive commands
- ✅ **MUST** ตรวจสอบ disk space (`df -h`) ก่อน deploy
- ✅ **MUST** backup ก่อนแก้ไข database schema
- ❌ **NEVER** hardcode passwords/secrets ในโค้ด
- ❌ **NEVER** share SSH keys/credentials
- ❌ **NEVER** run `git push` directly to production

### Rule 5: Documentation

- ✅ **MUST** บันทึก command สำคัญที่รันลง commit message
- ✅ **MUST** update **AGENTS.md** (ไฟล์นี้) เมื่อมีการเปลี่ยนแปลง MCP config
- ✅ **MUST** report errors กลับมาที่ user ทันที

### Rule 6: อ่าน Documentation ก่อนทำงาน

> ⚠️ **MUST READ DOCS BEFORE ANY OPERATION**

- ✅ **MUST** อ่าน docs ก่อนทำงานทุกครั้ง
- ✅ **MUST** อ่าน `docs/00-OVERVIEW.md` เพื่อเข้าใจ system
- ✅ **MUST** อ่าน `docs/01-NETWORK.md` ก่อนทำงาน network
- ✅ **MUST** อ่าน `docs/02-SQL.md` ก่อนทำงาน database
- ✅ **MUST** อ่าน `docs/03-API.md` ก่อนเรียก API
- ✅ **MUST** อ่าน `docs/04-N8N.md` ก่อนทำงาน n8n
- ✅ **MUST** อ่าน `docs/05-DOCKER.md` ก่อนทำงาน Docker
- ✅ **MUST** อ่าน `docs/06-SECURITY.md` ก่อนทำงาน security
- ✅ **MUST** อ่าน `docs/07-TROUBLESHOOT.md` เมื่อมีปัญหา
- ❌ **NEVER** ทำงานโดยไม่อ่าน docs
- ❌ **NEVER** เดา configuration โดยไม่อ่าน documentation

**Documentation Locations**:
- Local: `D:\Dev\LLM\docs\n8n-zort\`
- Server: ไม่จำเป็นต้องเขียน docs บน server

---

## 📋 General Rules for AI Agents

### Do

- ✅ ใช้ MCP servers สำหรับทุก operation บน server
- ✅ ทำงานเฉพาะใน server_workspace folder บน server
- ✅ เขียน docs ลง local machine ใน path `D:\Dev\LLM\`
- ✅ เขียน Python files ลง local machine
- ✅ ทดสอบ MCP connection ก่อนทำงาน
- ✅ บันทึก command สำคัญลง commit message
- ✅ ตรวจสอบ disk space ก่อน deploy

### Don't

- ❌ ห้ามใช้ raw SSH commands เมื่อ MCP พร้อม (ยกเว้นตาม Rule 1)
- ❌ ห้ามทำงานนอก server_workspace folder
- ❌ ห้ามเขียน Python files ลง server_workspace
- ❌ ห้ามรัน destructive commands โดยไม่ confirm
- ❌ ห้าม share key หรือ password

---

## 🧭 System Map (ai-brain)

- Compose stack: `/home/kanfullbuster/n8n-zort/docker-compose.yml` (project: `n8n-zort`)
- n8n: container `n8n_zort` (v2.25.x) -> https://n8n.kankrittapon.online via cloudflared (`n8n_zort_cloudflared`)
- Database: container `n8n_zort_postgres` (user/db: `n8n`, port NOT exposed)
  - Query ผ่าน `postgres` MCP (auto SSH tunnel 127.0.0.1:15432) หรือ `docker exec n8n_zort_postgres psql -U n8n -d n8n`
- Workflow JSON lives in DB table `workflow_entity`; prefer n8n API/MCP over direct DB writes

### Running Docker Containers (ตรวจ 26 ส.ค. 2026)

| Container | Status | Ports |
|-----------|--------|-------|
| `adms_api` | ✅ Healthy | `8081` |
| `adms_web` | ✅ Healthy | `8082` |
| `adms_zkteco_listener` | ✅ Healthy | - |
| `adms_mqtt` | ✅ Running | `1883` (localhost) |
| `adms_postgres` | ✅ Healthy | `5432` (internal) |
| `n8n_zort` | ✅ Healthy | `5678` |
| `n8n_zort_postgres` | ✅ Healthy | `5432` (internal) |
| `private_api` | ✅ Healthy | `3000` (internal) |
| `private_postgres` | ✅ Healthy | `5432` (internal) |
| `garmin_api` | ✅ Healthy | `8000` (internal) |
| `paddle_ocr` | ✅ Healthy | `8010` (internal) |
| `sailfish_collector` | ✅ Healthy | - |
| `sailfish_archive_postgres` | ✅ Running | `5433` (localhost) |
| `adminer` | ✅ Healthy | `8080` (localhost) |
| `mcmod-mcp-server` | ✅ Healthy | `3001` |
| `minecraft-console` | ✅ Running | - |
| `audioreader-next` | ✅ Running | `3000` |
| `notebooklm-mcp` / `notebooklm-tunnel` | ✅ Running | - |
| ~~`player_api` / `player_postgres`~~ | ❌ **ไม่ได้รัน** (compose defines แต่ down) | - |

### Quick Reference Ports

| Port | Service |
|------|---------|
| `5678` | N8N Workflow UI/API |
| `8081` / `8082` | ADMS API / Web |
| `8080` | Adminer (localhost only) |
| `3001` | MCMod MCP Server |
| `1883` | MQTT Broker (localhost only) |
| `15432` | **local** SSH tunnel → n8n_zort_postgres |
| `5433` | Sailfish Archive DB (localhost only) |

---

## 📁 Project Structure (ai-brain)

Home: `/home/kanfullbuster/`

```
ai-brain
├── adms-server/             # Attendance Management System (Compose)
├── n8n-zort/                # ★ N8N Workflow Automation + Private APIs (server_workspace)
├── hermes-research/         # Hermes Research Platform
├── sailfish-race-intelligence/
├── dglp-api/
├── SpeechyByKrittapon/
├── track_acdc/
├── Garmin-sync/
├── overlay-system-for-steaming/
├── notebooklm-mcp-deploy/
└── yratthailand/
```

---

## 🔧 Common Remote Tasks

> ตัวอย่าง shell ด้านล่างใช้เมื่อ ssh-remote MCP ไม่ครอบคลุม (เช่น scp); ปกติให้ผ่าน MCP ก่อนเสมอ

```bash
ssh ai-brain "hostname && uptime && df -h && free -h"   # server status
ssh ai-brain "docker ps -a"                              # containers
ssh ai-brain "docker logs <name> --tail 50"              # logs
scp <local-file> ai-brain:/home/kanfullbuster/<dest>     # upload
scp ai-brain:/home/kanfullbuster/<file> <local-dest>     # download
```

---
_Last updated: 2026-08-26 (merged single source of truth)_
