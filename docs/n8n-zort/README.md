# n8n-zort

> N8N Workflow Automation + Private APIs + Player Queue System

## 📋 Overview

ระบบ automation สำหรับจัดการ ZORT POS, Private Profiles, Player Queue, และ Garmin Data Sync

**Server**: ai-brain (192.168.1.248)  
**Location**: `/home/kanfullbuster/n8n-zort/`  
**Access URL**: http://192.168.1.248:5678

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Tunnel                         │
│                    (n8n.kankrittapon.online)                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    n8n (Port 5678)                           │
│                    - Workflow Automation                     │
│                    - Webhook Receiver                        │
└──┬──────────────┬───────────────┬───────────────┬───────────┘
   │              │               │               │
   ▼              ▼               ▼               ▼
┌────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│private │  │ player   │  │ garmin   │  │ paddle   │
│-api    │  │ -api     │  │ -api     │  │ -ocr     │
│:3000   │  │ :9733    │  │ :8000    │  │ :8010    │
└───┬────┘  └────┬─────┘  └──────────┘  └──────────┘
    │            │
    ▼            ▼
┌────────────────────────────────────────────┐
│           PostgreSQL Databases              │
│  - n8n_zort_postgres (n8n workflows)       │
│  - private_postgres (private profiles)     │
│  - player_postgres (player queue)          │
└────────────────────────────────────────────┘
```

---

## 🐳 Docker Services

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| **n8n** | `n8n_zort` | `5678` | Workflow automation engine |
| **postgres** | `n8n_zort_postgres` | `5432` | n8n database |
| **private-api** | `private_api` | `3000` | Private profile management |
| **private-postgres** | `private_postgres` | `5432` | Private profiles database |
| **player-api** | `player_api` | `9733` | Player queue management |
| **player-postgres** | `player_postgres` | `5432` | Player queue database |
| **garmin-api** | `garmin_api` | `8000` | Garmin data sync |
| **paddle-ocr** | `paddle_ocr` | `8010` | OCR processing (Thai) |
| **adminer** | `adminer` | `8080` | Database admin (localhost) |
| **cloudflared** | `n8n_zort_cloudflared` | - | Cloudflare tunnel |

---

## 📁 Project Structure

```
n8n-zort/
├── docker-compose.yml          # Main Docker Compose config
├── .env                        # Environment variables (secrets)
├── .env.example                # Template for .env
│
├── private-api/                # Private Profile API (Node.js)
│   ├── src/
│   │   ├── server.js           # Express server
│   │   └── seed-profile.js     # Seed data
│   ├── prisma/                 # Prisma schema
│   ├── package.json
│   └── Dockerfile
│
├── player-api/                 # Player Queue API (Node.js)
│   ├── src/
│   │   └── server.js           # Express server
│   ├── package.json
│   └── Dockerfile
│
├── garmin-api/                 # Garmin Sync API (Python)
│   ├── main.py                 # FastAPI server
│   ├── requirements.txt
│   └── Dockerfile
│
├── paddle-ocr/                 # OCR Service (Python)
│   ├── app/
│   └── Dockerfile
│
├── postgres/
│   └── init/                   # Database init scripts
│
├── workflows/                  # n8n workflow templates
│   └── zort_daily_sales_template.json
│
├── scripts/                    # Utility scripts
│   └── status-private.sh
│
├── data/                       # Shared data volume
│   ├── exports/
│   └── private/
│
└── backups/                    # Database backups
```

---

## 🔧 API Reference

### Private API (`http://localhost:3000`)

**Purpose**: จัดการ Private Profiles, Files, Media

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/profiles` | GET | List profiles |
| `/profiles/:id` | GET | Get profile by ID |
| `/profiles` | POST | Create profile |
| `/profiles/:id` | PUT | Update profile |
| `/profiles/:id` | DELETE | Delete profile |
| `/files` | POST | Upload file |
| `/files/:id` | GET | Get file |
| `/media` | POST | Upload media |
| `/media/:id` | GET | Get media |

**Auth**: `Authorization: Bearer <PRIVATE_API_TOKEN>`

### Player API (`http://localhost:9733`)

**Purpose**: จัดการ Player Queue

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/queue` | GET | List queue items |
| `/queue` | POST | Add to queue |
| `/queue/:id` | DELETE | Remove from queue |

**Auth**: `Authorization: Bearer <LYTB_QUEUE_API_TOKEN>`

### Garmin API (`http://localhost:8000`)

**Purpose**: Sync Garmin health data

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/docs` | GET | FastAPI docs |
| `/activity` | GET | Get activities |
| `/sleep` | GET | Get sleep data |
| `/heart-rate` | GET | Get heart rate |

### Paddle OCR (`http://localhost:8010`)

**Purpose**: OCR processing สำหรับภาษาไทย

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/docs` | GET | FastAPI docs |
| `/ocr` | POST | Process image |

---

## 🚀 Quick Start

### 1. Start All Services

```bash
cd /home/kanfullbuster/n8n-zort
docker compose up -d
```

### 2. Check Status

```bash
docker compose ps
```

### 3. View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f n8n
docker compose logs -f private-api
```

### 4. Stop Services

```bash
docker compose down
```

---

## 📊 Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `N8N_BASIC_AUTH_PASSWORD` | n8n admin password | `StrongPassword123` |
| `N8N_ENCRYPTION_KEY` | n8n encryption key | `随机生成的字符串` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `StrongDBPassword` |
| `PRIVATE_POSTGRES_PASSWORD` | Private DB password | `StrongDBPassword` |
| `PLAYER_POSTGRES_PASSWORD` | Player DB password | `StrongDBPassword` |
| `PRIVATE_API_TOKEN` | Private API auth token | `Bearer token` |
| `LYTB_QUEUE_API_TOKEN` | Player API auth token | `Bearer token` |

### ZORT API

| Variable | Description | Example |
|----------|-------------|---------|
| `ZORT_API_KEY` | ZORT API key | `your_api_key` |
| `ZORT_API_SECRET` | ZORT API secret | `your_api_secret` |
| `ZORT_STORE_NAME` | ZORT store name | `your_store` |

### Cloudflare

| Variable | Description | Example |
|----------|-------------|---------|
| `CLOUDFLARED_TOKEN` | Cloudflare tunnel token | `eyJ...` |

---

## 🔐 Security

### Secrets Location

```
.secrets/           # SSH keys, API tokens
.env                # Environment variables (gitignored)
```

### Authentication

- **n8n**: Basic Auth (`N8N_BASIC_AUTH_USER` / `N8N_BASIC_AUTH_PASSWORD`)
- **Private API**: Bearer Token (`PRIVATE_API_TOKEN`)
- **Player API**: Bearer Token (`LYTB_QUEUE_API_TOKEN`)
- **Databases**: Username/Password in `.env`

---

## 🛠️ Common Tasks

### Backup Databases

```bash
# n8n database
docker exec n8n_zort_postgres pg_dump -U n8n n8n > backups/n8n_backup.sql

# private database
docker exec private_postgres pg_dump -U private_app private > backups/private_backup.sql

# player database
docker exec player_postgres pg_dump -U player_queue player_queue > backups/player_backup.sql
```

### Restore Database

```bash
# n8n database
docker exec -i n8n_zort_postgres psql -U n8n n8n < backups/n8n_backup.sql
```

### View Container Logs

```bash
# Last 100 lines
docker logs --tail 100 n8n_zort

# Follow logs
docker logs -f n8n_zort
```

### Restart Single Service

```bash
docker compose restart n8n
docker compose restart private-api
```

### Update Services

```bash
# Pull latest images
docker compose pull

# Recreate containers
docker compose up -d
```

---

## 🔗 Webhooks

n8n webhooks สามารถเข้าถึงได้ผ่าน:

- **Local**: `http://192.168.1.248:5678/webhook/...`
- **Public**: `https://n8n.kankrittapon.online/webhook/...`

---

## 📝 Workflow Templates

### ZORT Daily Sales Template

位于 `workflows/zort_daily_sales_template.json`

**Trigger**: Scheduled (daily at 23:30)  
**Action**:
1. Fetch sales data from ZORT API
2. Transform data
3. Send to private-api for storage

---

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs <service-name>

# Check container status
docker compose ps

# Rebuild and restart
docker compose up -d --build
```

### Database Connection Issues

```bash
# Test PostgreSQL connection
docker exec -it n8n_zort_postgres psql -U n8n -d n8n

# Check database exists
docker exec n8n_zort_postgres psql -U n8n -l
```

### API Not Responding

```bash
# Check API health
curl http://localhost:3000/health -H "Authorization: Bearer <token>"
curl http://localhost:9733/health

# Check container status
docker compose ps
```

### n8n Webhook Not Working

1. Check webhook URL in n8n UI
2. Verify cloudflare tunnel is running
3. Check `CLOUDFLARED_TOKEN` is valid

---

## 📚 Additional Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [ZORT API Documentation](https://open-api.zortout.com/)

---

## 📞 Support

- **Owner**: kanfullbuster
- **Server**: ai-brain (192.168.1.248)
- **Local Access**: `ssh ai-brain`

---

_Last updated: 2026-08-26_
