# n8n-zort Architecture

## System Overview

```mermaid
graph TB
    subgraph "External Access"
        CF[Cloudflare Tunnel]
        User[User/Browser]
    end
    
    subgraph "n8n-zort (192.168.1.248)"
        subgraph "Workflow Layer"
            N8N[n8n<br/>Port 5678]
        end
        
        subgraph "API Layer"
            PVT[private-api<br/>Port 3000]
            PLR[player-api<br/>Port 9733]
            GAR[garmin-api<br/>Port 8000]
            OCR[paddle-ocr<br/>Port 8010]
        end
        
        subgraph "Database Layer"
            N8N_DB[(n8n_zort_postgres<br/>Port 5432)]
            PVT_DB[(private_postgres<br/>Port 5432)]
            PLR_DB[(player_postgres<br/>Port 5432)]
        end
        
        subgraph "Storage"
            DATA[data/<br/>Shared Volume]
        end
    end
    
    User --> CF
    CF --> N8N
    
    N8N --> PVT
    N8N --> PLR
    N8N --> GAR
    N8N --> OCR
    
    PVT --> PVT_DB
    PLR --> PLR_DB
    N8N --> N8N_DB
    
    PVT --> DATA
    PLR --> DATA
```

## Data Flow

### 1. ZORT Sales Sync Flow

```
ZORT API → n8n (Scheduled) → private-api → private_postgres
```

### 2. Private Profile Flow

```
User → n8n Webhook → private-api → private_postgres
                    → private-api → data/files
```

### 3. Player Queue Flow

```
n8n Workflow → player-api → player_postgres
```

### 4. Garmin Sync Flow

```
Garmin API → garmin-api → private-api → private_postgres
```

### 5. OCR Processing Flow

```
Image → paddle-ocr → private-api → private_postgres
```

## Port Reference

| Port | Service | Access |
|------|---------|--------|
| 5678 | n8n | Public (Cloudflare) |
| 3000 | private-api | Internal |
| 9733 | player-api | Internal |
| 8000 | garmin-api | Internal |
| 8010 | paddle-ocr | Internal |
| 8080 | adminer | localhost only |
| 5432 | PostgreSQL | Internal |

## Database Schema

### n8n_zort_postgres
- n8n internal tables (workflows, executions, etc.)

### private_postgres
- profiles - User profiles
- files - File metadata
- media - Media metadata

### player_postgres
- queue - Player queue items

## Security Model

```
┌─────────────────────────────────────────────┐
│              Cloudflare Tunnel               │
│  - SSL termination                          │
│  - DDoS protection                          │
│  - Access control                           │
└─────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────┐
│              n8n Basic Auth                  │
│  - Username: admin                          │
│  - Password: from .env                      │
└─────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────┐
│              API Bearer Tokens               │
│  - PRIVATE_API_TOKEN                        │
│  - LYTB_QUEUE_API_TOKEN                     │
└─────────────────────────────────────────────┘
```

---

_Last updated: 2026-08-26_
