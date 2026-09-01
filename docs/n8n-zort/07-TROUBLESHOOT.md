# Troubleshooting Guide

> Common issues and solutions for n8n-zort system

## 🔍 Quick Diagnostics

### Check System Status

```bash
# Check all containers
docker compose ps

# Check resource usage
docker stats --no-stream

# Check disk space
df -h

# Check memory
free -h
```

### Check Service Health

```bash
# n8n
curl http://192.168.1.248:5678/healthz

# Private API
curl http://192.168.1.248:3000/health

# Player API
curl http://192.168.1.248:9733/health

# Cloudflare Tunnel
curl https://n8n.kankrittapon.online/healthz
```

## 🐳 Docker Issues

### Container Won't Start

**Symptoms**: Container shows "Restarting" or "Exited"

**Diagnosis**:
```bash
# Check container logs
docker compose logs <container>

# Check container events
docker events --filter container=<container>

# Inspect container
docker inspect <container>
```

**Solutions**:
```bash
# Rebuild and restart
docker compose up -d --build

# Check for port conflicts
netstat -tulpn | grep <port>

# Check for permission issues
ls -la ./data
```

### Container Stuck in Restart Loop

**Symptoms**: Container keeps restarting

**Diagnosis**:
```bash
# Check logs for errors
docker compose logs --tail 50 <container>

# Check health status
docker inspect --format='{{json .State.Health}}' <container>
```

**Solutions**:
```bash
# Check database connection
docker exec <container> ping postgres

# Check environment variables
docker exec <container> env

# Restart with fresh container
docker compose up -d --force-recreate <container>
```

### Port Already in Use

**Symptoms**: `Bind for 0.0.0.0:5678 failed: port is already allocated`

**Diagnosis**:
```bash
# Find what's using the port
netstat -tulpn | grep 5678
lsof -i :5678
```

**Solutions**:
```bash
# Stop the conflicting service
sudo systemctl stop <service>

# Or change port in docker-compose.yml
ports:
  - "5679:5678"  # Use different host port
```

## 🗄️ Database Issues

### Connection Refused

**Symptoms**: `Connection refused` or `Could not connect to server`

**Diagnosis**:
```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Check PostgreSQL logs
docker compose logs postgres

# Test connection
docker exec n8n_zort_postgres psql -U n8n -c "SELECT 1;"
```

**Solutions**:
```bash
# Restart PostgreSQL
docker compose restart postgres

# Check environment variables
docker exec n8n_zort_postgres env | grep POSTGRES

# Check database exists
docker exec n8n_zort_postgres psql -U n8n -l
```

### Too Many Connections

**Symptoms**: `FATAL: too many connections`

**Diagnosis**:
```bash
# Check current connections
docker exec n8n_zort_postgres psql -U n8n -c "SELECT count(*) FROM pg_stat_activity;"

# Check connection limit
docker exec n8n_zort_postgres psql -U n8n -c "SHOW max_connections;"
```

**Solutions**:
```bash
# Kill idle connections
docker exec n8n_zort_postgres psql -U n8n -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND query_start < now() - interval '10 minutes';"

# Increase max connections (in postgresql.conf)
max_connections = 200
```

### Database Full

**Symptoms**: `ERROR: could not extend file` or `No space left on device`

**Diagnosis**:
```bash
# Check database size
docker exec n8n_zort_postgres psql -U n8n -c "SELECT pg_size_pretty(pg_database_size('n8n'));"

# Check disk space
df -h
```

**Solutions**:
```bash
# Vacuum database
docker exec n8n_zort_postgres psql -U n8n -c "VACUUM FULL;"

# Clean up old data
docker exec n8n_zort_postgres psql -U n8n -c "DELETE FROM execution WHERE created_at < NOW() - INTERVAL '30 days';"

# Expand disk (if using VM)
```

## 🌐 Network Issues

### Cloudflare Tunnel Down

**Symptoms**: External URL not accessible

**Diagnosis**:
```bash
# Check tunnel container
docker compose ps cloudflared

# Check tunnel logs
docker compose logs cloudflared

# Test local access
curl http://192.168.1.248:5678/healthz
```

**Solutions**:
```bash
# Restart tunnel
docker compose restart cloudflared

# Check token
grep CLOUDFLARED_TOKEN .env

# Regenerate token if needed
```

### DNS Resolution Failed

**Symptoms**: `Could not resolve host`

**Diagnosis**:
```bash
# Test DNS resolution
nslookup n8n.kankrittapon.online

# Check DNS settings
cat /etc/resolv.conf
```

**Solutions**:
```bash
# Use Google DNS
sudo echo "nameserver 8.8.8.8" > /etc/resolv.conf

# Check Cloudflare DNS settings
```

## 🔐 Authentication Issues

### n8n Login Failed

**Symptoms**: `Invalid username or password`

**Diagnosis**:
```bash
# Check credentials in .env
grep N8N_BASIC_AUTH .env

# Check n8n logs
docker compose logs n8n | grep auth
```

**Solutions**:
```bash
# Reset password
# 1. Stop n8n
docker compose stop n8n

# 2. Reset in database
docker exec -it n8n_zort_postgres psql -U n8n -c "UPDATE user_entity SET password='...' WHERE email='admin@example.com';"

# 3. Start n8n
docker compose start n8n
```

### API Token Invalid

**Symptoms**: `401 Unauthorized`

**Diagnosis**:
```bash
# Check token in .env
grep PRIVATE_API_TOKEN .env

# Check token in request
echo $PRIVATE_API_TOKEN
```

**Solutions**:
```bash
# Generate new token
openssl rand -hex 32

# Update .env
# Restart services
docker compose restart
```

## ⚡ Performance Issues

### High CPU Usage

**Symptoms**: Slow response times, high load average

**Diagnosis**:
```bash
# Check CPU usage
docker stats --no-stream

# Check top processes
top -bn1 | head -20

# Check container resource usage
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

**Solutions**:
```bash
# Limit CPU in docker-compose.yml
services:
  n8n:
    deploy:
      resources:
        limits:
          cpus: '2'

# Restart heavy container
docker compose restart <container>
```

### High Memory Usage

**Symptoms**: Slow performance, OOM kills

**Diagnosis**:
```bash
# Check memory usage
free -h

# Check container memory
docker stats --no-stream

# Check for memory leaks
docker logs <container> | grep -i "memory\|oom"
```

**Solutions**:
```bash
# Limit memory in docker-compose.yml
services:
  n8n:
    deploy:
      resources:
        limits:
          memory: 2G

# Restart container
docker compose restart <container>
```

### Slow Database Queries

**Symptoms**: API timeouts, slow n8n execution

**Diagnosis**:
```bash
# Check slow queries
docker exec n8n_zort_postgres psql -U n8n -c "SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state FROM pg_stat_activity WHERE state != 'idle' ORDER BY duration DESC;"

# Check table sizes
docker exec n8n_zort_postgres psql -U n8n -c "SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) FROM pg_catalog.pg_statio_user_tables ORDER BY pg_total_relation_size(relid) DESC;"
```

**Solutions**:
```bash
# Add indexes
docker exec n8n_zort_postgres psql -U n8n -c "CREATE INDEX idx_execution_workflow ON execution(workflow_id);"

# Vacuum tables
docker exec n8n_zort_postgres psql -U n8n -c "VACUUM ANALYZE;"

# Update statistics
docker exec n8n_zort_postgres psql -U n8n -c "ANALYZE;"
```

## 🔄 n8n Specific Issues

### Workflow Not Triggering

**Symptoms**: Scheduled workflow doesn't run

**Diagnosis**:
```bash
# Check workflow status in n8n UI
# Check execution history
# Check n8n logs
docker compose logs n8n | grep -i "trigger\|cron"
```

**Solutions**:
```bash
# Verify cron expression
# Check timezone setting
# Restart n8n
docker compose restart n8n
```

### Webhook Not Working

**Symptoms**: Webhook returns 404 or timeout

**Diagnosis**:
```bash
# Test webhook locally
curl -X POST http://192.168.1.248:5678/webhook/my-webhook

# Check workflow is active
# Check webhook path
```

**Solutions**:
```bash
# Verify webhook URL
# Check workflow is activated
# Check n8n logs for errors
docker compose logs n8n | grep -i "webhook"
```

### Execution Failed

**Symptoms**: Workflow execution shows error

**Diagnosis**:
```bash
# Check execution details in n8n UI
# Check n8n logs
docker compose logs n8n | grep -i "error\|fail"
```

**Solutions**:
```bash
# Check node configuration
# Verify API endpoints
# Check environment variables
docker exec n8n_zort env | grep ZORT
```

## 📊 Monitoring Commands

### System Health

```bash
# Overall system status
docker compose ps && df -h && free -h

# Container resource usage
docker stats --no-stream

# Network connectivity
ping -c 3 192.168.1.248
```

### Log Analysis

```bash
# Error logs
docker compose logs 2>&1 | grep -i "error\|fail\|fatal"

# Recent logs
docker compose logs --since 1h

# Specific time range
docker compose logs --since "2026-08-26T10:00:00" --until "2026-08-26T11:00:00"
```

## 🆘 Emergency Procedures

### System Down

```bash
# 1. Check status
docker compose ps

# 2. Check logs
docker compose logs --tail 100

# 3. Restart all
docker compose restart

# 4. If still down, rebuild
docker compose up -d --build
```

### Data Loss

```bash
# 1. Stop services
docker compose down

# 2. Restore from backup
docker exec -i n8n_zort_postgres psql -U n8n n8n < backup_n8n.sql

# 3. Start services
docker compose up -d
```

## 📚 Additional Resources

- [Docker Troubleshooting](https://docs.docker.com/engine/reference/commandline/docker/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [n8n Troubleshooting](https://docs.n8n.io/hosting/troubleshooting/)

---

_Last updated: 2026-08-26_
