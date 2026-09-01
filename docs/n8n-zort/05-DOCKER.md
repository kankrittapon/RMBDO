# Docker Architecture

> Docker containers, compose, and volumes for n8n-zort system

## 🐳 Docker Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Engine                              │
│                    ai-brain:2376                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐     │
│  │              n8n-zort Stack                          │     │
│  │                                                     │     │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │     │
│  │  │  n8n    │ │private  │ │ garmin  │ │ paddle  │  │     │
│  │  │  :5678  │ │api:3000 │ │api:8000 │ │ocr:8010 │  │     │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │     │
│  │                                                     │     │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐              │     │
│  │  │  n8n    │ │private  │ │ adminer │              │     │
│  │  │postgres │ │postgres │ │ :8080   │              │     │
│  │  └─────────┘ └─────────┘ └─────────┘              │     │
│  │                                                     │     │
│  │  ┌─────────┐                                       │     │
│  │  │cloud    │                                       │     │
│  │  │flared   │                                       │     │
│  │  └─────────┘                                       │     │
│  └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Container Inventory

| Container | Image | Port | Status | Purpose |
|-----------|-------|------|--------|---------|
| `n8n_zort` | n8nio/n8n:latest | 5678 | ✅ Running | Workflow engine |
| `n8n_zort_postgres` | postgres:16-alpine | 5432 | ✅ Running | n8n database |
| `private_api` | private-api:latest | 3000 | ✅ Running | Profile API |
| `private_postgres` | postgres:16-alpine | 5432 | ✅ Running | Private database |
| `garmin_api` | garmin-api:latest | 8000 | ✅ Running | Garmin sync |
| `paddle_ocr` | paddle-ocr:latest | 8010 | ✅ Running | OCR service |
| `adminer` | adminer:latest | 8080 | ✅ Running | DB admin |
| `n8n_zort_cloudflared` | cloudflare/cloudflared | - | ✅ Running | Cloudflare tunnel |

## 📁 Docker Compose Structure

```yaml
services:
  # Application Services
  n8n:              # Workflow engine
  private-api:      # Private profile API
  garmin-api:       # Garmin sync API
  paddle-ocr:       # OCR service
  
  # Database Services
  postgres:         # n8n database
  private-postgres: # Private database
  
  # Utility Services
  adminer:          # Database admin
  cloudflared:      # Cloudflare tunnel

volumes:
  n8n_data:
  postgres_data:
  private_postgres_data:
  garmin_tokens:
```

## 🔧 Container Management

### Start All Services

```bash
cd /home/kanfullbuster/n8n-zort
docker compose up -d
```

### Stop All Services

```bash
docker compose down
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart n8n
docker compose restart private-api
docker compose restart garmin-api
```

### View Status

```bash
# Container status
docker compose ps

# Resource usage
docker stats
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f n8n
docker compose logs -f private-api
docker compose logs -f garmin-api

# Last 100 lines
docker compose logs --tail 100 n8n
```

## 🏗️ Building Images

### Build All Services

```bash
docker compose build
```

### Build Specific Service

```bash
docker compose build private-api
docker compose build garmin-api
docker compose build paddle-ocr
```

### Rebuild and Restart

```bash
docker compose up -d --build
```

## 💾 Volumes

### Volume List

| Volume | Container | Mount Point | Purpose |
|--------|-----------|-------------|---------|
| `n8n_data` | n8n_zort | `/home/node/.n8n` | n8n data |
| `postgres_data` | n8n_zort_postgres | `/var/lib/postgresql/data` | n8n database |
| `private_postgres_data` | private_postgres | `/var/lib/postgresql/data` | Private database |
| `garmin_tokens` | garmin_api | `/tokens` | Garmin tokens |

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect n8n-zort_postgres_data

# Backup volume
docker run --rm -v n8n-zort_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_data.tar.gz -C /data .

# Restore volume
docker run --rm -v n8n-zort_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_data.tar.gz -C /data
```

## 🌐 Network

### Network List

```bash
docker network ls
```

### Network Details

```bash
docker network inspect n8n-zort_default
```

### Container Communication

```
n8n_zort ──▶ private-api:3000 (via Docker network)
n8n_zort ──▶ paddle-ocr:8010 (via Docker network)
n8n_zort ──▶ garmin-api:8000 (via Docker network)
```

## 🔐 Security

### Container Isolation

- Each container runs in its own namespace
- Network isolation via Docker networks
- No privileged containers

### Secrets Management

```bash
# Secrets stored in .env file
# Referenced in docker-compose.yml
# Never exposed in logs
```

### Resource Limits

```yaml
# In docker-compose.yml
services:
  n8n:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## 📊 Monitoring

### Container Stats

```bash
# Real-time stats
docker stats

# Specific container
docker stats n8n_zort
```

### Health Checks

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' n8n_zort

# View health check logs
docker inspect --format='{{json .State.Health}}' n8n_zort | jq
```

### Resource Usage

```bash
# Disk usage
docker system df

# Detailed disk usage
docker system df -v
```

## 🧹 Cleanup

### Remove Stopped Containers

```bash
docker container prune
```

### Remove Unused Images

```bash
docker image prune
```

### Remove Unused Volumes

```bash
docker volume prune
```

### Full Cleanup

```bash
docker system prune -a --volumes
```

## 🐛 Docker Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs <container>

# Check container status
docker compose ps

# Inspect container
docker inspect <container>
```

### Port Conflicts

```bash
# Check port usage
netstat -tulpn | grep <port>

# Change port in docker-compose.yml
```

### Permission Issues

```bash
# Fix permissions
docker compose down
sudo chown -R 1000:1000 ./data
docker compose up -d
```

### Database Connection Issues

```bash
# Check database container
docker compose ps postgres

# Test connection
docker exec n8n_zort_postgres psql -U n8n -c "SELECT 1;"

# Check logs
docker compose logs postgres
```

## 📚 Docker Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres/)

---

_Last updated: 2026-08-26_
