# n8n-zort Quick Reference

## 🚀 Commands

### Start/Stop
```bash
# Start all
docker compose up -d

# Stop all
docker compose down

# Restart all
docker compose restart
```

### Status
```bash
# Check status
docker compose ps

# View logs
docker compose logs -f
docker compose logs -f n8n
```

### Backup
```bash
# Backup databases
docker exec n8n_zort_postgres pg_dump -U n8n n8n > backup_n8n.sql
docker exec private_postgres pg_dump -U private_app private > backup_private.sql
docker exec player_postgres pg_dump -U player_queue player_queue > backup_player.sql
```

## 📍 URLs

| Service | URL |
|---------|-----|
| n8n UI | http://192.168.1.248:5678 |
| n8n Public | https://n8n.kankrittapon.online |
| Adminer | http://192.168.1.248:8080 |
| Private API | http://192.168.1.248:3000 |
| Player API | http://192.168.1.248:9733 |
| Garmin API | http://192.168.1.248:8000 |
| Paddle OCR | http://192.168.1.248:8010 |

## 🔑 Environment Variables

```
# Core
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=***
N8N_ENCRYPTION_KEY=***

# Databases
POSTGRES_PASSWORD=***
PRIVATE_POSTGRES_PASSWORD=***
PLAYER_POSTGRES_PASSWORD=***

# APIs
PRIVATE_API_TOKEN=***
LYTB_QUEUE_API_TOKEN=***

# ZORT
ZORT_API_KEY=***
ZORT_API_SECRET=***
ZORT_STORE_NAME=***
```

## 🐳 Containers

```
n8n_zort              # n8n workflow engine
n8n_zort_postgres     # n8n database
private_api           # Private profile API
private_postgres      # Private database
player_api            # Player queue API
player_postgres       # Player database
garmin_api            # Garmin sync API
paddle_ocr            # OCR service
adminer               # DB admin
n8n_zort_cloudflared  # Cloudflare tunnel
```

## 🔧 Common Issues

| Issue | Solution |
|-------|----------|
| Container won't start | `docker compose logs <service>` |
| DB connection error | Check `.env` passwords |
| n8n webhook not working | Check cloudflare tunnel |
| API returns 401 | Check bearer token |

---

_Last updated: 2026-08-26_
