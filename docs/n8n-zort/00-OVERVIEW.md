# n8n-zort System Overview

> Central documentation for the n8n-zort automation system on ai-brain server

## 📍 System Location

- **Server**: ai-brain (192.168.1.248)
- **Path**: `/home/kanfullbuster/n8n-zort/`
- **Docs**: `/home/kanfullbuster/n8n-zort/docs/`

## 📚 Documentation Index

| File | Topic | Description |
|------|-------|-------------|
| [01-NETWORK.md](01-NETWORK.md) | Network | Network architecture, ports, tunnels |
| [02-SQL.md](02-SQL.md) | SQL/Databases | PostgreSQL databases, schemas, connections |
| [03-API.md](03-API.md) | APIs | REST APIs, endpoints, authentication |
| [04-N8N.md](04-N8N.md) | n8n | Workflow engine, webhooks, automation |
| [05-DOCKER.md](05-DOCKER.md) | Docker | Containers, compose, volumes |
| [06-SECURITY.md](06-SECURITY.md) | Security | Auth, tokens, secrets |
| [07-TROUBLESHOOT.md](07-TROUBLESHOOT.md) | Troubleshooting | Common issues and solutions |
| [08-WORKFLOW-STATUS.md](08-WORKFLOW-STATUS.md) | Status | Overall active/inactive workflow status |
| [09-IMPLEMENTATION-PLAN.md](09-IMPLEMENTATION-PLAN.md) | Plan | System improvement & integration plan |
| [10-WORKFLOW-PRIVATE.md](10-WORKFLOW-PRIVATE.md) | Workflow | Main Router Workflow (Private) |
| [11-WORKFLOW-FOOD.md](11-WORKFLOW-FOOD.md) | Workflow | Food logging & calorie workflow |
| [12-WORKFLOW-OCR.md](12-WORKFLOW-OCR.md) | Workflow | Slip OCR & Receipt processing workflow |
| [13-WORKFLOW-BUDGET.md](13-WORKFLOW-BUDGET.md) | Workflow | Private Budget management workflow |
| [14-WORKFLOW-UI-FORMS.md](14-WORKFLOW-UI-FORMS.md) | Webhook / UI | UI Webhook forms & `/links` telegram shortcuts |
| [15-WORKFLOW-HEALTH-GARMIN.md](15-WORKFLOW-HEALTH-GARMIN.md) | Workflow | Health, Workout & Garmin Review workflow (@GarminBot) |
| [16-N8N-FULL-SYSTEM-REFERENCE.md](16-N8N-FULL-SYSTEM-REFERENCE.md) | Complete Reference | Full system architecture, Multi-Bot Telegram, Workflows, Webhooks & Database Schema |
| [17-WORKOUT-EXERCISE-GROUPS-REPORT.md](17-WORKOUT-EXERCISE-GROUPS-REPORT.md) | Workout Report | รายงานประวัติการออกกำลังกายแยกกลุ่มท่า, Sets, Weight, Reps & Est 1RM |
| [18-WORKFLOW-COACH-CUTTING.md](18-WORKFLOW-COACH-CUTTING.md) | Coach & Cutting | สถาปัตยกรรม @CoachBot, แผน Cutting 12 สัปดาห์ & ตารางซ้อมใหม่ |

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERNET                                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              CLOUDFLARE TUNNEL                               │
│              n8n.kankrittapon.online                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              ai-brain SERVER (192.168.1.248)                  │
│              ┌─────────────────────────────────────────┐     │
│              │          n8n-zort SYSTEM                 │     │
│              │                                         │     │
│              │  ┌─────────┐  ┌─────────┐  ┌─────────┐ │     │
│              │  │  n8n    │  │private  │  │ garmin  │ │     │
│              │  │  :5678  │  │api:3000 │  │api:8000 │ │     │
│              │  └────┬────┘  └────┬────┘  └────┬────┘ │     │
│              │       │           │            │       │     │
│              │  ┌────▼───────────▼────────────▼────┐  │     │
│              │  │        PostgreSQL Databases       │  │     │
│              │  │     n8n_db | private_db           │  │     │
│              │  └──────────────────────────────────┘  │     │
│              └─────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## 🔗 Quick Links

- **n8n UI**: http://192.168.1.248:5678
- **n8n Public**: https://n8n.kankrittapon.online
- **Adminer**: http://192.168.1.248:8080
- **Private API**: http://192.168.1.248:3000

---

_Last updated: 2026-08-26_
