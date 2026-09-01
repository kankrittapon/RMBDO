# Security Architecture

> Authentication, authorization, and secrets management for n8n-zort system

## 🔐 Security Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
│                                                             │
│  Layer 1: Cloudflare                                        │
│  ├── SSL/TLS termination                                    │
│  ├── DDoS protection                                        │
│  └── WAF (Web Application Firewall)                         │
│                                                             │
│  Layer 2: Network                                           │
│  ├── Docker network isolation                               │
│  ├── Port filtering                                         │
│  └── Firewall rules                                         │
│                                                             │
│  Layer 3: Authentication                                    │
│  ├── n8n Basic Auth                                         │
│  ├── API Bearer Tokens                                      │
│  └── Database passwords                                     │
│                                                             │
│  Layer 4: Application                                       │
│  ├── Input validation                                       │
│  ├── SQL injection protection                               │
│  └── Rate limiting                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔑 Authentication Methods

### 1. n8n Basic Auth

**Purpose**: Protect n8n UI access

**Configuration**:
```bash
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=***
```

**Usage**:
```
Username: admin
Password: (from .env)
```

### 2. API Bearer Tokens

**Purpose**: Protect API endpoints

**Private API Token**:
```bash
PRIVATE_API_TOKEN=***
```

**Player API Token**:
```bash
LYTB_QUEUE_API_TOKEN=***
```

**Usage**:
```bash
curl -H "Authorization: Bearer $PRIVATE_API_TOKEN" http://localhost:3000/profiles
```

### 3. Database Passwords

**Purpose**: Protect PostgreSQL databases

```bash
POSTGRES_PASSWORD=***
PRIVATE_POSTGRES_PASSWORD=***
PLAYER_POSTGRES_PASSWORD=***
```

## 🗝️ Secrets Management

### Environment Variables (.env)

**Location**: `/home/kanfullbuster/n8n-zort/.env`

**Structure**:
```bash
# n8n Core
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

# ZORT API
ZORT_API_KEY=***
ZORT_API_SECRET=***

# Cloudflare
CLOUDFLARED_TOKEN=***
```

### Secrets Directory

**Location**: `/home/kanfullbuster/n8n-zort/.secrets/`

**Contents**:
- SSH keys
- API tokens
- Certificates

### Encryption Key

**Purpose**: Encrypt sensitive data in n8n

```bash
N8N_ENCRYPTION_KEY=***
```

**Generate**:
```bash
openssl rand -hex 32
```

## 🛡️ Security Best Practices

### 1. Never Commit Secrets

```bash
# .gitignore should include:
.env
.secrets/
*.key
*.pem
```

### 2. Use Strong Passwords

```bash
# Generate strong password
openssl rand -base64 32
```

### 3. Rotate Secrets Regularly

```bash
# Rotate n8n encryption key
# 1. Backup n8n data
# 2. Generate new key
# 3. Update .env
# 4. Restart n8n
```

### 4. Limit Network Access

```bash
# Only expose necessary ports
# Use Docker network isolation
# Bind to localhost where possible
```

### 5. Use HTTPS

```bash
# Cloudflare provides SSL termination
# Always use HTTPS for external access
```

## 🔒 API Security

### Authentication Headers

```bash
# Private API
Authorization: Bearer <PRIVATE_API_TOKEN>

# Player API
Authorization: Bearer <LYTB_QUEUE_API_TOKEN>
```

### Rate Limiting

```yaml
# In API server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

### Input Validation

```javascript
// Validate input
const Joi = require('joi');

const schema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  email: Joi.string().email().required()
});

const { error, value } = schema.validate(req.body);
if (error) {
  return res.status(400).json({ error: error.details });
}
```

## 🗃️ Database Security

### Connection Security

```yaml
# Use internal Docker network
services:
  private-api:
    environment:
      DATABASE_URL: postgresql://user:pass@private-postgres:5432/db
    networks:
      - internal

networks:
  internal:
    driver: bridge
```

### User Permissions

```sql
-- Create limited user
CREATE USER api_user WITH PASSWORD '***';
GRANT SELECT, INSERT, UPDATE ON profiles TO api_user;
GRANT SELECT, INSERT, UPDATE ON files TO api_user;
REVOKE DELETE ON profiles FROM api_user;
```

### Backup Encryption

```bash
# Encrypt backup
gpg -c backup.sql

# Decrypt backup
gpg -d backup.sql.gpg > backup.sql
```

## 🌐 Network Security

### Cloudflare Tunnel

**Benefits**:
- No direct internet exposure
- DDoS protection
- SSL termination
- Access control

### Docker Network Isolation

```yaml
services:
  n8n:
    networks:
      - internal
  
  private-api:
    networks:
      - internal

networks:
  internal:
    driver: bridge
```

### Firewall Rules

```bash
# Only allow SSH and n8n
sudo ufw allow 22/tcp
sudo ufw allow 5678/tcp
sudo ufw enable
```

## 📋 Security Checklist

### Before Deployment

- [ ] All secrets in .env (not hardcoded)
- [ ] .env in .gitignore
- [ ] Strong passwords generated
- [ ] SSL enabled via Cloudflare
- [ ] Database users have minimal permissions
- [ ] API rate limiting configured
- [ ] Input validation implemented

### Regular Maintenance

- [ ] Rotate secrets every 90 days
- [ ] Review access logs
- [ ] Update dependencies
- [ ] Check for security patches
- [ ] Backup and test restores

## 🚨 Security Incidents

### Suspected Breach

1. **Immediately**: Rotate all secrets
2. **Check**: Access logs for anomalies
3. **Review**: API call history
4. **Update**: All passwords and tokens
5. **Monitor**: For unusual activity

### Secret Exposure

1. **Immediately**: Revoke exposed secret
2. **Generate**: New secret
3. **Update**: .env file
4. **Restart**: Affected services
5. **Audit**: How exposure occurred

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Docker Security](https://docs.docker.com/engine/security/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/auth.html)

---

_Last updated: 2026-08-26_
