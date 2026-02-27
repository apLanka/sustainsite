import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, API_BASE } from './k6-config.js';

export const options = {
  scenarios: {
    // Light load - 10 concurrent users
    light_load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '1m',
      tags: { test_type: 'light_load' },
    },
    // Normal load - 25 concurrent users
    normal_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 25 },
        { duration: '1m', target: 25 },
        { duration: '30s', target: 0 },
      ],
      tags: { test_type: 'normal_load' },
    },
    // Heavy load - 50 concurrent users
    heavy_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '2m', target: 50 },
        { duration: '30s', target: 0 },
      ],
      tags: { test_type: 'heavy_load' },
    },
    // Spike test - sudden burst
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 5 },
        { duration: '30s', target: 100 },
        { duration: '10s', target: 5 },
        { duration: '10s', target: 0 },
      ],
      tags: { test_type: 'spike' },
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.05'],
    http_reqs: ['rate>20'],
  },
};

// Get auth token
function getToken() {
  const loginRes = http.post(`${API_BASE}/auth/login`, JSON.stringify({
    email: 'admin@example.com',
    password: 'AdminPass123',
  }), { headers: { 'Content-Type': 'application/json' } });

  if (loginRes.status === 200) {
    try {
      return JSON.parse(loginRes.body).data?.token || JSON.parse(loginRes.body).token;
    } catch (e) {}
  }
  return null;
}

export default function () {
  const token = getToken();
  if (!token) return;

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Test read-heavy endpoints
  const endpoints = [
    '/resources/materials',
    '/resources/equipment',
    '/resources/suppliers',
  ];

  // Random endpoint selection for varied load
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

  const response = http.get(`${API_BASE}${endpoint}?page=1&limit=10`, { headers });

  check(response, {
    'List endpoint - status 200': (r) => r.status === 200,
    'List endpoint - response time < 1s': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}

export function handleSummary(data) {
  const p99 = data.metrics.http_req_duration?.values?.['p(99)'];
  const summary = {
    total_requests: data.metrics.http_reqs?.values?.count || 0,
    failed_requests: data.metrics.http_req_failed?.values?.count || 0,
    error_rate: ((data.metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2) + '%',
    response_times: {
      avg_ms: (data.metrics.http_req_duration?.values?.avg || 0).toFixed(2),
      p95_ms: (data.metrics.http_req_duration?.values?.['p(95)'] || 0).toFixed(2),
      p99_ms: p99 ? p99.toFixed(2) : '0',
      max_ms: (data.metrics.http_req_duration?.values?.max || 0).toFixed(2),
    },
    requests_per_second: (data.metrics.http_reqs?.values?.rate || 0).toFixed(2),
  };

  console.log('\n=== LOAD TEST RESULTS ===');
  console.log(`Total Requests: ${summary.total_requests}`);
  console.log(`Failed Requests: ${summary.failed_requests}`);
  console.log(`Error Rate: ${summary.error_rate}`);
  console.log(`\nResponse Times:`);
  console.log(`  Avg: ${summary.response_times.avg_ms}ms`);
  console.log(`  p95: ${summary.response_times.p95_ms}ms`);
  console.log(`  p99: ${summary.response_times.p99_ms}ms`);
  console.log(`  Max: ${summary.response_times.max_ms}ms`);
  console.log(`\nThroughput: ${summary.requests_per_second} req/s`);

  return {
    'stdout': JSON.stringify(summary, null, 2),
    'load-test-results.json': JSON.stringify(data),
  };
}
