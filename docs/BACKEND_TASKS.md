# Backend Task List — Sustainable Construction Management System

**Course:** SE3040 – Application Frameworks  
**Deadline:** Evaluation 02 — 12 April 2026  
**Scope:** `apps/backend` (Express 5 + TypeScript + MongoDB)

> **Goal:** Complete 100% of the backend (Phase 1) before moving to submission packaging (Phase 2).  
> Items are numbered in implementation order. Check off each task as it is done.

---

## Phase 1 — 100% Backend Completion

### T-01 · Fix `fullName` populate bug (all controllers)

**Files:** `document.controller.ts`, `compliance.controller.ts`, `resource.controller.ts`

- [x] Replace every `.populate('...', 'name email')` with `.populate('...', 'fullName email')` — the `User` model stores `fullName`, not `name`.
- [x] Verify populated responses return the correct field in manual or automated tests.

---

### T-02 · Auth rate limiting (stricter limit on login/register)

**File:** `apps/backend/src/app.ts`

- [x] Add a second `express-rate-limit` instance: **5 requests / 15 min per IP**.
- [x] Apply it **only** to `POST /api/auth/login` and `POST /api/auth/register` (before the global limiter).
- [x] Keep the existing global limiter (100 req / 15 min) for all other `/api/` routes.

---

### T-03 · Winston logger

**New file:** `apps/backend/src/utils/logger.ts`

- [x] Create a Winston logger (console + optional file transport in production).
- [x] Replace `console.error` / `console.log` in `errorHandler.ts` with `logger.error`.
- [x] Use `logger.error` for auth failures in `auth.controller.ts`.
- [x] Use `logger.info` for route registration on startup (keep Morgan for HTTP access logs).

---

### T-04 · Swagger / OpenAPI documentation

**New file:** `apps/backend/src/config/swagger.ts`

- [x] Install `swagger-jsdoc` and `swagger-ui-express` (added to `package.json`; install when network available).
- [x] Configure OpenAPI 3 spec covering all existing and new routes (`src/config/swagger.ts`).
- [x] Mount Swagger UI at `GET /api-docs` (guarded: only if packages installed + `DISABLE_SWAGGER` not set).
- [ ] Add `@swagger` JSDoc annotations to routes/controllers (ongoing as new endpoints are added).
- [x] Add `DISABLE_SWAGGER=true` env guard.

---

### T-05 · `GET /api/projects/status/:status`

**File:** `apps/backend/src/routes/project.routes.ts`

- [x] Add an explicit route `GET /status/:status` **before** `GET /:id` that forwards to `getProjects` with `req.query.status` set — prevents "status" being parsed as a project ID.

---

### T-06 · Sustainability — enriched score endpoint

**File:** `apps/backend/src/controllers/sustainability.controller.ts`

`GET /api/sustainability/projects/:projectId/score` (already exists but thin)

- [x] Pull the **latest** `SustainabilityMetric` for the project.
- [x] Return full score breakdown: `carbonEmissions`, `energyEfficiency`, `wasteManagement`, `waterConservation` sub-scores.
- [x] Add `trend` field: `"improving"` / `"declining"` / `"stable"` based on last two metrics.
- [x] Add `benchmarkComparison` block: `{ industryAverage: 65, difference: <score - 65> }`.
- [x] Add rule-based `recommendations` array.

---

### T-07 · Sustainability — aggregated trends endpoint

**File:** `apps/backend/src/controllers/sustainability.controller.ts`

`GET /api/sustainability/projects/:projectId/trends`

- [x] Accept query params: `period` (number of days, default 30) and `interval` (`daily` / `weekly` / `monthly`, default `weekly`).
- [x] Aggregate metrics into time buckets using MongoDB `$group` + `$dateToString`.
- [x] Return `trends[]` array (each bucket: date range, avg score, total carbon, energy, waste, water) plus a `summary` block (average score, score improvement, total carbon reduced, total waste recycled).

---

### T-08 · Sustainability — industry compare endpoint

**File:** `apps/backend/src/controllers/sustainability.controller.ts`  
**Route:** `GET /api/sustainability/projects/:projectId/compare`

- [x] Compare the project's latest sustainability score against documented industry constants (e.g. average = 65, good = 75, excellent = 85).
- [x] Return: `projectScore`, `industryAverage`, `difference`, `percentile` (rough band), `areasAboveAverage[]`, `areasBelowAverage[]`.
- [x] Register route in `sustainability.routes.ts`.

---

### T-09 · Sustainability — `POST /api/sustainability/metrics` alias

**File:** `apps/backend/src/routes/sustainability.routes.ts`

- [x] Add `POST /api/sustainability/metrics` as a duplicate of the existing `POST /api/sustainability` (both call `createMetric`). Do not remove the existing path.

---

### T-10 · Optional — Carbon Interface / OpenWeather integration

**File:** `apps/backend/src/controllers/sustainability.controller.ts`

- [ ] Add env-gated call to **Carbon Interface API** (`CARBON_INTERFACE_API_KEY`) inside `calculate-impact` or `createMetric` to enrich CO2 estimates.
- [ ] Fall back to current custom algorithm when key is absent.
- [ ] Document rate limits (200 req/month free tier) in `SETUP.md`.
- [ ] **OR** integrate **OpenWeatherMap** to factor weather data into energy efficiency notes (alternative third-party for this component).

> This satisfies the SE3040 "third-party API per component" requirement for the Sustainability component.

---

### T-11 · Document search endpoint

**File:** `apps/backend/src/controllers/document.controller.ts`  
**Route:** `GET /api/documents/search`

- [x] Add a `searchDocuments` handler that accepts `q` (search term) and runs `$or` across `title`, `description`, `tags`.
- [ ] Support optional filters: `projectId`, `documentType`, `status`.
- [ ] Paginate results (same pattern as `getDocuments`).
- [x] Register route in `document.routes.ts` **before** `GET /:id`.

---

### T-12 · Document status update endpoint

**File:** `apps/backend/src/controllers/document.controller.ts`  
**Route:** `PUT /api/documents/:id/status`

- [x] Add `updateDocumentStatus` handler.
- [x] Allow transitions: `Draft → Under Review`, `Under Review → Approved / Rejected`.
- [x] ADMIN and INSPECTOR may approve/reject; uploader (PROJECT_MANAGER) may move Draft → Under Review.
- [x] Return updated document.
- [x] Register route in `document.routes.ts`.

---

### T-13 · Compliance — granular checklist item update

**File:** `apps/backend/src/controllers/compliance.controller.ts`  
**Route:** `PUT /api/compliance/checklists/:id/items/:itemId`

- [x] Add `updateChecklistItem` handler that updates a **single item** by `itemId` (completion status, notes, attachedDocuments, completedBy, completedDate).
- [x] Recalculate `completedItems` and `complianceScore` on the parent checklist after update (via pre-save hook).
- [x] Register route in `compliance.routes.ts`.

---

### T-14 · Compliance — project compliance score endpoint

**File:** `apps/backend/src/controllers/compliance.controller.ts`  
**Route:** `GET /api/compliance/score/:projectId`

- [x] Aggregate all checklists for a project.
- [x] Return: `overallScore` (average), `totalChecklists`, `completedChecklists`, `totalItems`, `completedItems`, per-checklist breakdown array.
- [x] Register route in `compliance.routes.ts`.

---

### T-15 · Safety inspection — `/api/safety` router

**New file:** `apps/backend/src/routes/safety.routes.ts`

- [x] Create a thin router that reuses the **same controllers** from `compliance.controller.ts`:

| Method | Path | Controller |
|--------|------|------------|
| `POST` | `/api/safety/inspection` | `createInspection` |
| `GET` | `/api/safety/:projectId` | `getInspections` (filter by projectId) |
| `GET` | `/api/safety/inspection/:id` | `getInspectionById` |
| `PUT` | `/api/safety/inspection/:id` | `updateInspection` |
| `GET` | `/api/safety/:projectId/high-risk` | `getHighRiskInspections` |

- [x] Implement `getHighRiskInspections`: filter `riskLevel` in `['High', 'Critical']` and `isResolved: false` for the given project.
- [x] Mount in `app.ts` at `/api/safety`.

---

### T-16 · Resource URL aliases (`/api/materials`, `/api/equipment`, `/api/suppliers`)

**Files:** `apps/backend/src/routes/resource.routes.ts`, `apps/backend/src/app.ts`

- [x] Split `resource.routes.ts` into three composable sub-routers: `material.routes.ts`, `equipment.routes.ts`, `supplier.routes.ts` (same controllers, just reorganised).
- [x] Mount each at **both** `/api/resources/materials` (current) **and** `/api/materials` (spec alias) — same for equipment and suppliers.
- [x] Ensure existing frontend calls to `/api/resources/...` continue to work.

---

### T-17 · Admin user management routes

**New files:** `apps/backend/src/routes/user.routes.ts`, `apps/backend/src/controllers/user.controller.ts`

- [x] `GET /api/users` — paginated list of all users (ADMIN only).
- [x] `GET /api/users/:id` — get user by ID (ADMIN only).
- [x] `PATCH /api/users/:id` — update `role`, `isActive`, `assignedProjects`, optional `supplierId` (ADMIN only).
- [x] `DELETE /api/users/:id` — soft-delete (set `isActive: false`) (ADMIN only).
- [x] Guard all routes with `authenticate` + `requireAdmin()`.
- [x] Register in `app.ts` at `/api/users`.

---

### T-18 · RBAC — SUPPLIER material access restriction

**File:** `apps/backend/src/controllers/resource.controller.ts`

- [x] In `getMaterials`: if `req.user.role === 'SUPPLIER'`, filter results to materials where `supplier` matches `user.supplierId`.
- [x] ADMIN and PROJECT_MANAGER retain full access; INSPECTOR and VIEWER get read-only access (already authenticated, no write routes).
- [x] Linking rule: `user.supplierId` (set by ADMIN via `PATCH /api/users/:id`) matches material's `supplier` field.

---

### T-19 · Optional `supplierId` on User schema

**Files:** `apps/backend/src/models/User.ts`, `apps/backend/src/validation/auth.validation.ts`

- [x] Add optional `supplierId: ObjectId (ref: 'Supplier')` field to the User schema.
- [x] Allow ADMIN to set/clear it via the `PATCH /api/users/:id` endpoint (T-17).
- [x] Do **not** expose it in the public register endpoint.

---

### T-20 · Email notifications — wire SendGrid

**File:** `apps/backend/src/controllers/` (project, resource, compliance)

All calls guarded: if `SENDGRID_API_KEY` is missing, log a warning and skip — do not crash.

- [x] **New project created** → email assigned `projectManager` using `emailTemplates.projectCreated`.
- [x] **New material order** → email supplier contact using a new `emailTemplates.purchaseOrder` template.
- [x] **Low stock triggered** (after `recordMaterialUsage` when `currentStock < minimumThreshold`) → email project manager using `emailTemplates.lowStockAlert`.
- [x] **High/Critical risk inspection created** → email project manager using `emailTemplates.safetyInspection`.
- [x] Add `purchaseOrder` template to `apps/backend/src/config/email.ts`.

---

### T-21 · Integration tests for new endpoints

**Directory:** `apps/backend/src/__tests__/integration/`

- [x] `sustainability.test.ts` — add tests for compare, enriched score, aggregated trends, `/metrics` alias.
- [x] `compliance.test.ts` — add tests for item update, project score.
- [x] `safety.test.ts` — new file: test all `/api/safety` routes including high-risk filter.
- [x] `document.test.ts` — add tests for search and status update.
- [x] `user.test.ts` — new file: test ADMIN user CRUD.
- [x] `material.test.ts` — add test for SUPPLIER-scoped material list.

---

## Phase 2 — Submission Packaging (after Phase 1 is done)

### D-01 · Root README — API documentation

**File:** `README.md`

- [x] Setup instructions (clone, install, env vars, run dev).
- [x] Complete API endpoint catalog: HTTP method, path, auth required, request body, response shape, example — all new Phase 1 endpoints added.
- [x] Link to Swagger UI (`/api-docs`) added to Additional Resources.

---

### D-02 · Root README — Deployment section

**File:** `README.md`

- [x] Backend deployment platform (Render) + step-by-step setup with env var table.
- [x] Frontend deployment platform (Vercel) + step-by-step setup.
- [x] All environment variables listed (no secret values) — `apps/backend/.env.example` and `apps/frontend/.env.example` created.
- [ ] Live URLs for deployed backend API and frontend — add after actual deployment.
- [ ] Screenshots / evidence of successful deployment — add after actual deployment.

---

### D-03 · Testing Instruction Report

**File:** `README.md` (or `docs/TESTING.md` linked from README)

- [x] How to run unit tests: `npm test`.
- [x] Integration testing setup and execution — `docs/TESTING.md` created.
- [x] Performance testing: how to run k6 scripts (`npm run perf:smoke`, `npm run perf:load`, etc.).
- [x] Testing environment configuration (env vars, in-memory MongoDB, etc.).

---

### D-04 · Optional — Service layer refactor

**Directory:** `apps/backend/src/services/`

- [ ] Extract business logic from heavy controllers (e.g. `sustainability.service.ts`, `resource.service.ts`) into a `services/` layer.
- [ ] Controllers become thin: validate → call service → return response.
- [ ] Improves "service layer architecture" rubric mark in Eval 02.

---

## Out of Scope

| Item | Reason |
|------|--------|
| Google Maps / Geocoding | Removed by team decision |
| User `phoneNumber` field | Removed by team decision |
| Malware scanning on upload | Spec mention only; not required |
| Redis caching | Future enhancement |
| Replacing existing `/api/resources/...` URLs | Additive aliases only (T-16) |

---

## Quick Reference — Existing Route Map

| Domain | Current base path | Spec base path |
|--------|------------------|----------------|
| Auth | `/api/auth` | `/api/auth` |
| Projects | `/api/projects` | `/api/projects` |
| Sustainability | `/api/sustainability` | `/api/sustainability` |
| Documents | `/api/documents` | `/api/documents` |
| Compliance | `/api/compliance` | `/api/compliance` |
| Safety | `/api/compliance/inspections` | `/api/safety` ← **add alias (T-15)** |
| Materials | `/api/resources/materials` | `/api/materials` ← **add alias (T-16)** |
| Equipment | `/api/resources/equipment` | `/api/equipment` ← **add alias (T-16)** |
| Suppliers | `/api/resources/suppliers` | `/api/suppliers` ← **add alias (T-16)** |
| Users | _(missing)_ | `/api/users` ← **add (T-17)** |
| Swagger | _(missing)_ | `/api-docs` ← **add (T-04)** |
