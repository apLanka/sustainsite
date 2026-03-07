import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      tags: { test_type: 'smoke' },
    },
    // Load test - normal expected load
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 0 },
      ],
      tags: { test_type: 'load' },
    },
    // Stress test - push beyond normal capacity
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 100 },
        { duration: '30s', target: 0 },
      ],
      tags: { test_type: 'stress' },
    },
    // Spike test - sudden increase
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 10 },
        { duration: '30s', target: 100 },
        { duration: '10s', target: 10 },
        { duration: '10s', target: 0 },
      ],
      tags: { test_type: 'spike' },
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    http_reqs: ['rate>10'],

    errors: ['rate<0.05'],
    response_time: ['p(95)<500'],
  },
};

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:5001';
export const API_BASE = `${BASE_URL}/api`;

export function authenticate(email, password) {
  const payload = JSON.stringify({ email, password });
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const response = http.post(`${API_BASE}/auth/login`, payload, params);

  if (response.status === 200) {
    const body = JSON.parse(response.body);
    return body.data?.token || body.token;
  }
  return null;
}

const TEST_USERS = {
  admin: { email: 'admin@example.com', password: 'AdminPass123', role: 'ADMIN' },
  pm: { email: 'pm@example.com', password: 'PMPass123', role: 'PROJECT_MANAGER' },
  viewer: { email: 'viewer@example.com', password: 'ViewerPass123', role: 'VIEWER' },
};

function registerTestUser(email, password, role) {
  const payload = JSON.stringify({
    email,
    password,
    fullName: `Test ${role}`,
    role,
  });
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };
  http.post(`${API_BASE}/auth/register`, payload, params);
}

function ensureTestUser(userType) {
  const user = TEST_USERS[userType];
  const token = authenticate(user.email, user.password);
  if (token) return token;

  registerTestUser(user.email, user.password, user.role);

  return authenticate(user.email, user.password);
}

export function getAuthHeaders(userType = 'pm') {
  const token = ensureTestUser(userType);
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export function authenticatedRequest(method, url, body = null, userType = 'pm') {
  const headers = getAuthHeaders(userType);
  let response;

  switch (method.toUpperCase()) {
    case 'GET':
      response = http.get(url, { headers });
      break;
    case 'POST':
      response = http.post(url, body, { headers });
      break;
    case 'PUT':
      response = http.put(url, body, { headers });
      break;
    case 'DELETE':
      response = http.del(url, { headers });
      break;
  }

  errorRate.add(response.status >= 400);
  responseTime.add(response.timings.duration);

  return response;
}

export function setup() {
  console.log(`Starting performance tests against: ${BASE_URL}`);

  const healthCheck = http.get(`${BASE_URL}/api/health`);
  if (healthCheck.status !== 200 && healthCheck.status !== 404) {
    console.error(`Server not reachable at ${BASE_URL}`);
  }

  const token = authenticate(TEST_USERS.pm.email, TEST_USERS.pm.password);
  return { token };
}

export function teardown(data) {
  console.log('Performance tests completed');
  console.log(`Total requests: ${__ITER}`);
}