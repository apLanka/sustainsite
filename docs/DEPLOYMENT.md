# Deployment Report — SustainSite

**Related documents:** [README / Setup & API Docs](../README.md) · [SE3040 documentation (Fern)](https://sustain-site-api.docs.buildwithfern.com/) · [Testing Instruction Report](./TESTING.md) · [Test Report](./TEST_REPORT.md)

---

**Module:** SE3040 – Application Frameworks  
**Project:** Sustainable Construction Project Management System  
**Deployment Date:** April 2026  
**Backend Platform:** [Render](https://render.com)  
**Frontend Platform:** [Vercel](https://vercel.com)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Backend Deployment — Render](#2-backend-deployment--render)
3. [Frontend Deployment — Vercel](#3-frontend-deployment--vercel)
4. [Environment Variables Reference](#4-environment-variables-reference)
5. [Post-Deployment Verification](#5-post-deployment-verification)
6. [Production Checklist](#6-production-checklist)
7. [Known Limitations](#7-known-limitations)

---

## 1. Architecture Overview

```
┌─────────────────────┐        HTTPS        ┌──────────────────────┐
│   Vercel (Frontend) │ ──────────────────► │  Render (Backend API) │
│   React + Vite      │                     │  Express + TypeScript │
│   apps/frontend     │                     │  apps/backend         │
└─────────────────────┘                     └──────────┬───────────┘
                                                        │
                                            ┌───────────▼───────────┐
                                            │   MongoDB Atlas        │
                                            │   (Cloud Database)     │
                                            └───────────────────────┘
                                                        │
                                     ┌──────────────────┼──────────────────┐
                                     │                  │                  │
                              ┌──────▼──────┐  ┌────────▼──────┐  ┌───────▼──────┐
                              │  Cloudinary  │  │   SendGrid    │  │  Swagger UI  │
                              │  (File Store)│  │  (Email/SMTP) │  │  /api-docs   │
                              └─────────────┘  └───────────────┘  └──────────────┘
```

| Component | Platform | URL |
|-----------|----------|-----|
| Backend API | Render Web Service | `https://sustainsite-api.onrender.com` |
| Frontend | Vercel | `https://sustainsite.vercel.app` |
| API Docs (Swagger) | Render (served by backend) | `https://sustainsite-api.onrender.com/api-docs` |
| SE3040 docs (Fern) | Fern | [https://sustain-site-api.docs.buildwithfern.com/](https://sustain-site-api.docs.buildwithfern.com/) |
| Database | MongoDB Atlas | Cloud-hosted (M0 Free Tier) |

> Replace the URLs above with your actual deployed URLs once available.

---

## 2. Backend Deployment — Render

### 2.1 Service Configuration

| Setting | Value |
|---------|-------|
| **Service Type** | Web Service |
| **Region** | Singapore (ap-southeast-1) |
| **Branch** | `main` |
| **Root Directory** | `apps/backend` |
| **Runtime** | Node.js |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | Free (Starter for production) |
| **Health Check Path** | `/health` |
| **Auto-Deploy** | Enabled (on push to `main`) |

### 2.2 Step-by-Step Deployment

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repository
3. Set **Root Directory** to `apps/backend`
4. Set **Build Command** to `npm install && npm run build`
5. Set **Start Command** to `npm start`
6. Click **Create Web Service**
7. Navigate to the **Environment** tab and add all variables from [Section 4](#4-environment-variables-reference)
8. Trigger a manual deploy from the **Deploys** tab (or push to `main`)
9. Wait for the build to complete (~2–3 minutes)
10. Verify the health check: `GET https://<your-service>.onrender.com/health`

### 2.3 Build Process

The build command executes:

```bash
npm install          # Install all dependencies (including devDependencies for tsc)
npm run build        # tsc --project tsconfig.json → compiles to dist/
```

The start command executes:

```bash
npm start            # node dist/server.js
```

### 2.4 Health Check Endpoint

```
GET /health
```

**Expected response (200 OK):**

```json
{
  "status": "ok",
  "timestamp": "2026-04-10T12:00:00.000Z",
  "environment": "production"
}
```

Render pings this endpoint every 30 seconds. If it returns non-2xx three times consecutively, Render marks the service as unhealthy and restarts it.

### 2.5 Logs

Access real-time logs from the Render dashboard → **Logs** tab. Winston writes structured JSON logs:

- `info` level: API requests, startup events
- `error` level: Unhandled exceptions, database errors
- File logs (`error.log`, `combined.log`) are written in production but are ephemeral on Render's free tier (lost on restart). Use Render's log streaming or an external log aggregator for persistence.

---

## 3. Frontend Deployment — Vercel

### 3.1 Project Configuration

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `apps/frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Node.js Version** | 18.x |

### 3.2 Step-by-Step Deployment

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**
2. Import your GitHub repository
3. Set **Root Directory** to `apps/frontend`
4. Confirm **Framework Preset** is **Vite**
5. Click **Deploy**
6. After the first deploy, go to **Settings → Environment Variables**
7. Add `VITE_API_URL` with the value of your Render backend URL (see [Section 4](#4-environment-variables-reference))
8. Go to **Deployments → Redeploy** (without clearing cache) to apply the env var

### 3.3 Environment Variable Requirement

The frontend uses a single environment variable:

```
VITE_API_URL=https://sustainsite-api.onrender.com/api
```

> The variable **must** be prefixed with `VITE_` to be exposed to the Vite build. Variables without this prefix are not available in browser code.

### 3.4 Automatic Deployments

Vercel automatically deploys on every push to `main`. Preview deployments are created for every pull request.

---

## 4. Environment Variables Reference

### 4.1 Backend (Render)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | Yes | Runtime environment | `production` |
| `PORT` | Yes | Server port | `5000` |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/sustainsite` |
| `JWT_SECRET` | Yes | Secret for signing JWTs (min 64 chars) | `openssl rand -hex 64` |
| `JWT_EXPIRE` | Yes | JWT expiry duration | `24h` |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret | `abc123...` |
| `SENDGRID_API_KEY` | Yes | SendGrid API key | `SG.xxxx` |
| `FROM_EMAIL` | Yes | Sender email address | `noreply@sustainsite.com` |
| `FRONTEND_URL` | Yes | Vercel frontend URL (for CORS) | `https://sustainsite.vercel.app` |
| `LOG_LEVEL` | No | Winston log level | `info` |
| `DISABLE_SWAGGER` | No | Set to `true` to hide `/api-docs` | `false` |

> **Security:** `JWT_SECRET` must be a cryptographically random string. Generate with:
> ```bash
> openssl rand -hex 64
> ```

### 4.2 Frontend (Vercel)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | Yes | Backend API base URL | `https://sustainsite-api.onrender.com/api` |

### 4.3 Local Development

Copy the example files and fill in your values:

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Frontend
cp apps/frontend/.env.example apps/frontend/.env
```

---

## 5. Post-Deployment Verification

After deploying both services, run through these checks:

### 5.1 Backend API Health

```bash
curl https://sustainsite-api.onrender.com/health
# Expected: {"status":"ok",...}

curl https://sustainsite-api.onrender.com/api
# Expected: {"message":"SustainSite API","version":"1.0.0",...}
```

### 5.2 Swagger UI

Open `https://sustainsite-api.onrender.com/api-docs` in a browser.  
You should see the interactive OpenAPI documentation with all endpoints listed.

**SE3040 submission docs (Fern):** [https://sustain-site-api.docs.buildwithfern.com/](https://sustain-site-api.docs.buildwithfern.com/) — deployment report, testing instructions, test report, and OpenAPI-style API reference (mirrors repo `fern/` content when published).

### 5.3 Authentication Flow

```bash
# Register a user
curl -X POST https://sustainsite-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","password":"TestPass123","role":"VIEWER"}'

# Login
curl -X POST https://sustainsite-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
# Expected: {"success":true,"token":"eyJ..."}
```

### 5.4 CORS Verification

Open the deployed Vercel frontend and check the browser console for CORS errors. The `FRONTEND_URL` on Render must match the Vercel URL exactly (no trailing slash).

### 5.5 File Upload

Test document upload via the frontend or Postman. Verify the file appears in your Cloudinary media library.

### 5.6 Email Notification

Create a project and assign a project manager. Verify the assignment email is received (check SendGrid activity feed if not received).

---

## 6. Production Checklist

| # | Item | Status |
|---|------|--------|
| 1 | `JWT_SECRET` is ≥ 64 random characters | ☐ |
| 2 | `MONGODB_URI` points to Atlas production cluster | ☐ |
| 3 | MongoDB Atlas IP allowlist includes `0.0.0.0/0` (or Render static IP) | ☐ |
| 4 | `FRONTEND_URL` on Render matches Vercel URL exactly (no trailing slash) | ☐ |
| 5 | `VITE_API_URL` on Vercel matches Render URL exactly | ☐ |
| 6 | Cloudinary upload preset is set to **Signed** | ☐ |
| 7 | SendGrid sender identity is verified | ☐ |
| 8 | `GET /health` returns 200 after deploy | ☐ |
| 9 | Swagger UI loads at `/api-docs` | ☐ |
| 10 | Fern docs site opens ([sustain-site-api.docs.buildwithfern.com](https://sustain-site-api.docs.buildwithfern.com/)) | ☐ |
| 11 | Frontend loads and can log in | ☐ |
| 12 | CORS: no errors in browser console | ☐ |
| 13 | File upload works end-to-end | ☐ |

---

## 7. Known Limitations

### Render Free Tier — Cold Start

On the free tier, Render spins down the service after **15 minutes of inactivity**. The first request after a cold start takes **30–60 seconds** to respond. Options to mitigate:

- Upgrade to the **Starter** plan ($7/month) for always-on service
- Use [UptimeRobot](https://uptimerobot.com) (free) to ping `/health` every 14 minutes

### MongoDB Atlas Free Tier (M0)

- 512 MB storage limit
- Shared cluster — no dedicated RAM
- No VPC peering (use IP allowlist)

### Vercel Hobby Plan

- 100 GB bandwidth/month
- Functions timeout at 10 seconds (not applicable — frontend is static)
- Preview deployments expire after 30 days on inactive branches

### File Logs on Render

Winston's file transports (`error.log`, `combined.log`) write to the container filesystem, which is **ephemeral** on Render's free tier. Logs are lost on restart. For persistent logs, integrate a service like [Papertrail](https://www.papertrail.com) or [Logtail](https://betterstack.com/logtail).

---

*This deployment report is part of the SE3040 Application Frameworks assignment submission.*
