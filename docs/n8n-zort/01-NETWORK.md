# Network Architecture

> Network configuration, ports, and connectivity for n8n-zort system

## 🌐 Network Topology

```
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL NETWORK                          │
│                                                             │
│   [Internet] ──▶ [Cloudflare] ──▶ [Tunnel] ──▶ [n8n:5678]  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    INTERNAL NETWORK                          │
│                    192.168.1.0/24                            │
│                                                             │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐                │
│   │  n8n    │───▶│private  │───▶│ garmin  │                │
│   │  :5678  │    │api:3000 │    │api:8000 │                │
│   └────┬────┘    └────┬────┘    └────┬────┘                │
│        │              │              │                       │
│        ▼              ▼              ▼                       │
│   ┌─────────────────────────────────────────┐               │
│   │          PostgreSQL Cluster              │               │
│   │  :5432 (n8n | private)                  │               │
│   └─────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

## 🔌 Port Assignments

### External Ports (Accessible from Internet)

| Port | Service | Protocol | Description |
|------|---------|----------|-------------|
| `5678` | n8n | HTTP | Workflow engine (via Cloudflare) |
| `5678` | n8n | HTTP | Workflow engine (direct) |

### Internal Ports (Local Network Only)

| Port | Service | Protocol | Bind Address | Description |
|------|---------|----------|--------------|-------------|
| `3000` | private-api | HTTP | `0.0.0.0` | Private profile API |
| `8000` | garmin-api | HTTP | `0.0.0.0` | Garmin sync API |
| `8010` | paddle-ocr | HTTP | `0.0.0.0` | OCR service |
| `8080` | adminer | HTTP | `127.0.0.1` | Database admin |
| `5432` | PostgreSQL | TCP | Internal | Database cluster |

### Docker Network

```
n8n-zort_default
├── n8n_zort (n8n)
├── private_api
├── garmin_api
├── paddle_ocr
├── n8n_zort_postgres
├── private_postgres
├── adminer
└── n8n_zort_cloudflared
```

## 🌍 Cloudflare Tunnel

### Configuration

- **Tunnel Name**: n8n-zort
- **Public URL**: https://n8n.kankrittapon.online
- **Local URL**: http://localhost:5678
- **Token**: Stored in `.env` as `CLOUDFLARED_TOKEN`

### How It Works

```
1. User visits https://n8n.kankrittapon.online
2. Cloudflare routes request to tunnel
3. Tunnel forwards to localhost:5678
4. n8n processes request
5. Response sent back through tunnel
```

### Benefits

- ✅ SSL termination at Cloudflare edge
- ✅ DDoS protection
- ✅ No need to open ports on router
- ✅ Automatic HTTPS

## 🔗 Service Connections

### n8n → Private API

```
n8n (container) ──▶ http://private-api:3000
```

- **Protocol**: HTTP
- **Authentication**: Bearer Token (`PRIVATE_API_TOKEN`)
- **Use**: Profile management, file storage

### n8n → Paddle OCR

```
n8n (container) ──▶ http://paddle-ocr:8010
```

- **Protocol**: HTTP
- **Authentication**: None
- **Use**: Image OCR processing

### n8n → Garmin API

```
n8n (container) ──▶ http://garmin-api:8000
```

- **Protocol**: HTTP
- **Authentication**: Garmin Connect (via tokens)
- **Use**: Garmin health data sync

### APIs → PostgreSQL

```
private-api ──▶ postgres:5432 (private_db)
n8n         ──▶ postgres:5432 (n8n_db)
```

- **Protocol**: TCP
- **Authentication**: Username/Password
- **Connection Pool**: Configured per service

## 📡 DNS Records

### External (Cloudflare)

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| CNAME | n8n.kankrittapon.online | Tunnel ID | ✅ Proxied |

### Internal (Local DNS)

| Hostname | IP | Description |
|----------|-----|-------------|
| ai-brain | 192.168.1.248 | Main server |

## 🔥 Firewall Rules

### Router/Firewall

```bash
# Open ports (if needed)
# Port 5678: n8n (optional, Cloudflare handles this)
# Port 22: SSH (for remote access)
```

### Docker iptables

```bash
# Docker manages its own iptables rules
# Containers can communicate within Docker network
# External access controlled by port mappings
```

## 📊 Network Monitoring

### Check Connectivity

```bash
# Test n8n
curl http://192.168.1.248:5678/healthz

# Test Private API
curl http://192.168.1.248:3000/health

# Test Cloudflare Tunnel
curl https://n8n.kankrittapon.online/healthz
```

### Check DNS Resolution

```bash
# Internal
nslookup ai-brain

# External
nslookup n8n.kankrittapon.online
```

---

_Last updated: 2026-08-26_
