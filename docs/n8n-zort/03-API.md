# API Documentation

> REST APIs, endpoints, and authentication for n8n-zort system

## 🌐 API Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                  │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Private    │  │   Garmin    │  │   Paddle    │         │
│  │   API       │  │    API      │  │    OCR      │         │
│  │  :3000      │  │   :8000     │  │   :8010     │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         ▼                ▼                ▼                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  PostgreSQL │  │   Garmin    │  │   Paddle    │         │
│  │   private   │  │  Connect    │  │   OCR       │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📡 Private API

### Overview

- **Purpose**: จัดการ Private Profiles, Files, Media
- **Port**: 3000
- **Framework**: Express.js
- **Database**: PostgreSQL (private)
- **ORM**: Prisma

### Base URL

```
http://192.168.1.248:3000
```

### Authentication

```
Authorization: Bearer <PRIVATE_API_TOKEN>
```

### Endpoints

#### Health Check

```
GET /health
```

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-08-26T10:00:00Z"
}
```

#### Profiles

```
GET    /profiles              # List all profiles
GET    /profiles/:id          # Get profile by ID
POST   /profiles              # Create new profile
PUT    /profiles/:id          # Update profile
DELETE /profiles/:id          # Delete profile
```

**Create Profile**:
```json
POST /profiles
{
  "name": "John Doe",
  "data": {
    "email": "john@example.com",
    "phone": "1234567890"
  }
}
```

**Response**:
```json
{
  "id": "uuid-1234",
  "name": "John Doe",
  "data": {
    "email": "john@example.com",
    "phone": "1234567890"
  },
  "created_at": "2026-08-26T10:00:00Z"
}
```

#### Files

```
POST   /files                 # Upload file
GET    /files/:id             # Get file
DELETE /files/:id             # Delete file
```

**Upload File**:
```bash
POST /files
Content-Type: multipart/form-data

profile_id: uuid-1234
file: [binary data]
```

#### Media

```
POST   /media                 # Upload media
GET    /media/:id             # Get media
DELETE /media/:id             # Delete media
```

### Error Responses

```json
{
  "error": "Not Found",
  "message": "Profile not found",
  "statusCode": 404
}
```

```json
{
  "error": "Unauthorized",
  "message": "Invalid token",
  "statusCode": 401
}
```

---

## 🏃 Garmin API

### Overview

- **Purpose**: Sync Garmin health data
- **Port**: 8000
- **Framework**: FastAPI (Python)
- **External**: Garmin Connect API

### Base URL

```
http://192.168.1.248:8000
```

### Authentication

- **Method**: Garmin Connect Login (email/password + MFA)
- **Token Storage**: `/tokens/garmin_tokens.json`
- **Token Refresh**: Automatic (when token expires, login again)

### Endpoints

#### Health Check

```
GET /health
```

**Response**:
```json
{
  "status": "ok"
}
```

#### Auth Status

```
GET /auth/status
```

**Response**:
```json
{
  "logged_in": true,
  "pending_mfa": false
}
```

#### MFA Authentication

```
POST /auth/mfa
```

**Request**:
```json
{
  "code": "123456"
}
```

**Response**:
```json
{
  "status": "ok",
  "message": "login สำเร็จ ใช้งาน endpoint กิจกรรมได้เลย"
}
```

#### Activities

```
GET /activity/{activity_id}
```

**Response**:
```json
{
  "activityId": 1234567890,
  "activityName": "Morning Run",
  "distance": 5000,
  "duration": 1800,
  "calories": 400
}
```

#### Exercise Sets

```
GET /activity/{activity_id}/exercise-sets
```

**Response**:
```json
{
  "exerciseSets": [
    {
      "exerciseName": "Bench Press",
      "reps": 10,
      "weight": 80
    }
  ]
}
```

---

## 🔍 Paddle OCR

### Overview

- **Purpose**: OCR processing สำหรับภาษาไทย
- **Port**: 8010
- **Framework**: FastAPI (Python)
- **Engine**: PaddleOCR

### Base URL

```
http://192.168.1.248:8010
```

### Endpoints

#### Health Check

```
GET /docs
```

**Response**: FastAPI documentation page

#### OCR Processing

```
POST /ocr
```

**Request**:
```bash
POST /ocr
Content-Type: multipart/form-data

image: [binary data]
language: th
```

**Response**:
```json
{
  "text": "ข้อความที่อ่านได้",
  "confidence": 0.95,
  "bounding_boxes": [
    {
      "text": "ข้อความ",
      "confidence": 0.98,
      "x": 10,
      "y": 20,
      "width": 100,
      "height": 30
    }
  ]
}
```

---

## 🔗 API Integration Guide

### n8n Workflow → Private API

```json
{
  "nodes": [
    {
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "http://private-api:3000/profiles",
        "method": "GET",
        "headers": {
          "Authorization": "Bearer {{$env.PRIVATE_API_TOKEN}}"
        }
      }
    }
  ]
}
```

### cURL Examples

```bash
# Get all profiles
curl http://192.168.1.248:3000/profiles \
  -H "Authorization: Bearer $PRIVATE_API_TOKEN"

# Create profile
curl -X POST http://192.168.1.248:3000/profiles \
  -H "Authorization: Bearer $PRIVATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","data":{"email":"test@example.com"}}'

# Process OCR
curl -X POST http://192.168.1.248:8010/ocr \
  -F "image=@document.jpg" \
  -F "language=th"

# Check Garmin auth status
curl http://192.168.1.248:8000/auth/status
```

---

## 📊 API Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🐛 API Troubleshooting

### API Not Responding

```bash
# Check container status
docker compose ps private-api

# Check logs
docker compose logs private-api

# Test health endpoint
curl http://localhost:3000/health
```

### Authentication Failed

```bash
# Verify token
echo $PRIVATE_API_TOKEN

# Check .env file
grep PRIVATE_API_TOKEN .env
```

### Database Connection Error

```bash
# Check database status
docker compose ps private-postgres

# Test connection
docker exec private_postgres psql -U private_app -d private -c "SELECT 1;"
```

---

_Last updated: 2026-08-26_
