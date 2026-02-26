# Performance Testing with k6

This directory contains k6 performance tests for the Resource Management APIs.

## Prerequisites

Install k6:

```bash
# macOS
brew install k6

# Linux (Debian/Ubuntu)
sudo apt-get install k6

# Windows (using Chocolatey)
choco install k6
```

## Running Tests

### Quick Start

```bash
cd apps/backend
k6 run src/__tests__/performance/materials.test.js
```

### Run All Tests

```bash
# Run all performance tests
for test in materials.test.js equipment.test.js supplier.test.js; do
  k6 run src/__tests__/performance/$test
done
```

### Run Specific Test Type

```bash
# Smoke test only (quick verification)
k6 run -e SCENARIO=smoke src/__tests__/performance/materials.test.js

# Load test
k6 run -e SCENARIO=load src/__tests__/performance/materials.test.js

# Stress test
k6 run -e SCENARIO=stress src/__tests__/performance/materials.test.js
```

### Custom Base URL

```bash
# Test against local server (default)
k6 run -e BASE_URL=http://localhost:5000 src/__tests__/performance/materials.test.js

# Test against production
k6 run -e BASE_URL=https://api.production.com src/__tests__/performance/materials.test.js
```

## Test Scenarios

### 1. Smoke Test
- 1 virtual user for 30 seconds
- Verifies basic functionality
- Fastest execution

### 2. Load Test
- Ramps from 0 to 10 users over 30s
- Maintains 10 users for 1 minute
- Ramps down over 30s
- Simulates normal expected load

### 3. Stress Test
- Ramps from 0 to 100 users
- Identifies breaking point
- Tests system under extreme load

### 4. Spike Test
- Sudden spike to 100 users
- Tests system response to traffic bursts

## Test Metrics

Each test measures:

| Metric | Description | Threshold |
|--------|-------------|-----------|
| http_req_duration | Response time | p(95) < 500ms |
| http_req_failed | Error rate | < 5% |
| http_reqs | Requests per second | > 10 |

## CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  k6:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run k6 tests
        run: |
          brew install k6
          k6 run src/__tests__/performance/materials.test.js
          k6 run src/__tests__/performance/equipment.test.js
          k6 run src/__tests__/performance/supplier.test.js
```

## Output

Tests generate:
- Console summary (stdout)
- JSON summary (summary.json)

Example output:
```
============================================================
Performance Test Summary

Total Requests: 1500
Failed Requests: 5
Error Rate: 0.33%

Response Times:
  - Avg: 125.45ms
  - Max: 450.32ms
  - p95: 185.20ms
  - p99: 290.10ms
```