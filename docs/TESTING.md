# Testing Guide — SustainSite

> **SE3040 – Application Frameworks**  
> This document covers unit tests, integration tests, and performance (k6) tests for the backend API.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Unit Tests](#unit-tests)
4. [Integration Tests](#integration-tests)
5. [Performance Tests (k6)](#performance-tests-k6)
6. [Test Coverage](#test-coverage)
7. [CI Mode](#ci-mode)

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| npm | ≥ 9 | bundled with Node |
| k6 | latest | `brew install k6` (macOS) or [k6.io/docs](https://k6.io/docs/get-started/installation/) |

> **No external database needed for unit/integration tests** — they use `mongodb-memory-server` (an in-memory MongoDB instance that starts automatically).

---

## Environment Setup

```bash
# From the repo root
cd apps/backend

# Install dependencies (if not already done)
npm install
```

No `.env` file is required for running tests. The test setup (`src/__tests__/setup.ts`) configures the in-memory MongoDB automatically.

---

## Unit Tests

Unit tests cover individual models and validation logic without any HTTP layer.

### Run

```bash
cd apps/backend
npx jest --testPathPatterns="unit" --runInBand
```

### What is tested

| File | Coverage |
|------|----------|
| `unit/models/User.test.ts` | Password hashing, `comparePassword`, role enum |
| `unit/validation/auth.validation.test.ts` | Joi schema — register and login payloads |

---

## Integration Tests

Integration tests spin up the full Express app against an in-memory MongoDB and make real HTTP requests via `supertest`.

### Run all integration tests

```bash
cd apps/backend
npx jest --testPathPatterns="integration" --runInBand --forceExit
```

> `--runInBand` is required — it runs tests serially to prevent race conditions on the shared in-memory database.

### Run a single test suite

```bash
npx jest src/__tests__/integration/sustainability.test.ts --runInBand --forceExit
```

### Run with coverage

```bash
npm test
# or
npx jest --coverage --runInBand --forceExit
```

Coverage report is written to `coverage/lcov-report/index.html`.

### Test suites and coverage

| Suite | Tests | What is covered |
|-------|-------|-----------------|
| `auth.test.ts` | 20 | Register, login, JWT, roles, edge cases |
| `project.test.ts` | ~25 | CRUD, milestones, status filter, RBAC |
| `sustainability.test.ts` | ~20 | Metrics CRUD, enriched score, aggregated trends, industry compare, `/metrics` alias |
| `document.test.ts` | ~25 | Upload, approve/reject, search, status transitions, versioning, download |
| `compliance.test.ts` | ~30 | Checklists, item update, project score, safety inspections |
| `safety.test.ts` | ~10 | `/api/safety` router, high-risk filter, RBAC |
| `material.test.ts` | 22 | CRUD, low stock, cost summary, SUPPLIER scoping |
| `equipment.test.ts` | ~15 | CRUD, assign, maintenance scheduling |
| `supplier.test.ts` | ~15 | CRUD, rating, performance report |
| `user.test.ts` | ~10 | ADMIN user management, soft-delete, role guard |

**Current result: 222 / 222 tests passing across 10 suites.**

### Watch mode (re-runs on file save)

```bash
npm run test:watch
```

---

## Performance Tests (k6)

Performance tests require a **running backend server** and a seeded database. They are **not** run against the in-memory test database.

### Setup

1. Install k6:

```bash
# macOS
brew install k6

# Linux
sudo apt install k6

# Windows — download from https://k6.io/docs/get-started/installation/
```

2. Start the backend server:

```bash
cd apps/backend
npm run dev
```

3. Seed test users (the k6 scripts auto-register them on first run, or seed manually):

```bash
# The k6 config auto-creates these users if they don't exist:
# admin@example.com   / AdminPass123
# pm@example.com      / PMPass123
# viewer@example.com  / ViewerPass123
```

### Run performance tests

```bash
cd apps/backend

# Smoke test — 1 VU, 10 seconds, verifies basic functionality
npm run perf:smoke

# Load test — ramps to 10 VUs over 2 minutes
npm run perf:load

# Stress test — ramps to 100 VUs, finds breaking point
npm run perf:stress

# Endurance test — sustained load over longer period
npm run perf:endurance

# Run smoke + load together (rate limiting disabled)
npm run perf:all
```

### Custom base URL (e.g. against Render deployment)

```bash
BASE_URL=https://sustainsite-api.onrender.com k6 run src/__tests__/performance/smoke.test.js
```

### Performance thresholds

The k6 config enforces these pass/fail thresholds:

| Metric | Threshold |
|--------|-----------|
| `http_req_duration` p(95) | < 500 ms |
| `http_req_duration` p(99) | < 1000 ms |
| `http_req_failed` rate | < 1% |
| `http_reqs` rate | > 10 req/s |
| Custom `errors` rate | < 5% |

### Available k6 test files

| File | Scenario |
|------|----------|
| `smoke.test.js` | 1 VU × 10s — basic health check |
| `load-scenarios.test.js` | Ramp 0→10→0 VUs over 2 min |
| `stress-test.test.js` | Ramp 0→100 VUs — stress |
| `endurance-test.test.js` | Sustained load over time |
| `materials.test.js` | Material API specific load |
| `equipment.test.js` | Equipment API specific load |
| `supplier.test.js` | Supplier API specific load |

---

## Test Coverage

Generate a full HTML coverage report:

```bash
cd apps/backend
npm test -- --coverage
open coverage/lcov-report/index.html
```

---

## CI Mode

For GitHub Actions or other CI pipelines:

```bash
cd apps/backend
npm run test:ci
```

This runs `jest --ci --coverage --maxWorkers=2` — suitable for resource-constrained CI environments.

### Example GitHub Actions step

```yaml
- name: Run backend tests
  working-directory: apps/backend
  run: npm run test:ci
  env:
    NODE_ENV: test
    JWT_SECRET: test-secret-for-ci-only
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `MongoMemoryServer` fails to start | Run `npm install` — the binary downloads on first install |
| Tests hang after completion | Use `--forceExit` flag |
| `429 Too Many Requests` in tests | Rate limiting is auto-disabled when `NODE_ENV=test` |
| k6 `connection refused` | Make sure `npm run dev` is running before k6 tests |
| k6 `401 Unauthorized` | The k6 config auto-registers test users — check server logs |
