# SQL / Database Architecture

> PostgreSQL databases, schemas, and connections for n8n-zort system

## 🗄️ Database Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Cluster                         │
│                    ai-brain:5432                              │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐                           │
│  │  n8n_zort   │  │   private   │                           │
│  │  _postgres  │  │  _postgres  │                           │
│  │             │  │             │                           │
│  │  Database:  │  │  Database:  │                           │
│  │  n8n        │  │  private    │                           │
│  │             │  │             │                           │
│  │  Port: 5432 │  │  Port: 5432 │                           │
│  └─────────────┘  └─────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Database Instances

### 1. n8n_zort_postgres

**Purpose**: เก็บข้อมูล n8n workflow engine

| Property | Value |
|----------|-------|
| Container | `n8n_zort_postgres` |
| Database | `n8n` |
| User | `n8n` |
| Port | `5432` |
| Image | `postgres:16-alpine` |
| Volume | `postgres_data` |

**Tables** (n8n internal):
- `workflow_entity` - Workflows
- `execution_entity` - Execution history
- `credentials_entity` - Stored credentials
- `settings` - n8n settings
- And other n8n internal tables

**Connection String**:
```
postgresql://n8n:${POSTGRES_PASSWORD}@n8n_zort_postgres:5432/n8n
```

### 2. private_postgres

**Purpose**: เก็บข้อมูล Private Profiles, Files, Media

| Property | Value |
|----------|-------|
| Container | `private_postgres` |
| Database | `private` |
| User | `private_app` |
| Port | `5432` |
| Image | `postgres:16-alpine` |
| Volume | `private_postgres_data` |

**Tables**:
```sql
-- Profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Files table
CREATE TABLE files (
    id UUID PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id),
    filename VARCHAR(255),
    path VARCHAR(500),
    mime_type VARCHAR(100),
    size INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Media table
CREATE TABLE media (
    id UUID PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id),
    type VARCHAR(50),
    url VARCHAR(500),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Connection String**:
```
postgresql://private_app:${PRIVATE_POSTGRES_PASSWORD}@private_postgres:5432/private
```

## 🔗 Connection Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│                                                             │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐                │
│   │  n8n    │    │private  │    │ garmin  │                │
│   │         │    │  api    │    │  api    │                │
│   └────┬────┘    └────┬────┘    └────┬────┘                │
│        │              │              │                       │
└────────┼──────────────┼──────────────┼──────────────────────┘
         │              │              │
         ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Layer                          │
│                                                             │
│   ┌─────────────┐  ┌─────────────┐                         │
│   │  n8n_db     │  │ private_db  │                         │
│   │  :5432      │  │  :5432      │                         │
│   └─────────────┘  └─────────────┘                         │
│                                                             │
│                    Port 5432 (shared)                        │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Database Operations

### Connect to Database

```bash
# n8n database
docker exec -it n8n_zort_postgres psql -U n8n -d n8n

# private database
docker exec -it private_postgres psql -U private_app -d private
```

### Backup Databases

```bash
# Backup n8n database
docker exec n8n_zort_postgres pg_dump -U n8n n8n > backup_n8n_$(date +%Y%m%d).sql

# Backup private database
docker exec private_postgres pg_dump -U private_app private > backup_private_$(date +%Y%m%d).sql
```

### Restore Databases

```bash
# Restore n8n database
docker exec -i n8n_zort_postgres psql -U n8n n8n < backup_n8n.sql

# Restore private database
docker exec -i private_postgres psql -U private_app private < backup_private.sql
```

### Run SQL Queries

```bash
# n8n database
docker exec n8n_zort_postgres psql -U n8n -d n8n -c "SELECT * FROM workflow_entity;"

# private database
docker exec private_postgres psql -U private_app -d private -c "SELECT * FROM profiles;"
```

## 📊 Database Schema Visualization

### Private Database Schema

```mermaid
erDiagram
    profiles {
        uuid id PK
        varchar name
        jsonb data
        timestamp created_at
        timestamp updated_at
    }
    
    files {
        uuid id PK
        uuid profile_id FK
        varchar filename
        varchar path
        varchar mime_type
        int size
        timestamp created_at
    }
    
    media {
        uuid id PK
        uuid profile_id FK
        varchar type
        varchar url
        jsonb metadata
        timestamp created_at
    }
    
    profiles ||--o{ files : "has"
    profiles ||--o{ media : "has"
```

## 🔐 Database Security

### Authentication

| Database | User | Auth Method |
|----------|------|-------------|
| n8n | n8n | Password |
| private | private_app | Password |

### Network Isolation

- Databases only accessible within Docker network
- External access requires SSH tunnel
- No direct port exposure to internet

### Backup Security

```bash
# Encrypt backup
gpg -c backup_private.sql

# Decrypt backup
gpg -d backup_private.sql.gpg > backup_private.sql
```

## 📈 Performance Tuning

### Connection Pooling

```yaml
# In docker-compose.yml
postgres:
  environment:
    POSTGRES_MAX_CONNECTIONS: 100
    POSTGRES_SHARED_BUFFERS: 256MB
    POSTGRES_EFFECTIVE_CACHE_SIZE: 1GB
```

### Indexes

```sql
-- Private database indexes
CREATE INDEX idx_profiles_name ON profiles(name);
CREATE INDEX idx_files_profile_id ON files(profile_id);
CREATE INDEX idx_media_profile_id ON media(profile_id);
```

## 🐛 Common Issues

### Connection Refused

```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Check logs
docker compose logs postgres

# Restart PostgreSQL
docker compose restart postgres
```

### Too Many Connections

```bash
# Check current connections
docker exec n8n_zort_postgres psql -U n8n -c "SELECT count(*) FROM pg_stat_activity;"

# Kill idle connections
docker exec n8n_zort_postgres psql -U n8n -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND query_start < now() - interval '10 minutes';"
```

### Database Full

```bash
# Check database size
docker exec n8n_zort_postgres psql -U n8n -c "SELECT pg_size_pretty(pg_database_size('n8n'));"

# Vacuum database
docker exec n8n_zort_postgres psql -U n8n -c "VACUUM FULL;"
```

---

_Last updated: 2026-08-26_
