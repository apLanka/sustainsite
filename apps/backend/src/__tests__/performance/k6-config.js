import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

// Base configuration
export const options = {
  scenarios: {
    // Smoke test - verify basic functionality
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
        { duration: '30s', target: 10 },  // Ramp up to 10 users
        { duration: '1m', target: 10 },    // Stay at 10 users
        { duration: '30s', target: 0 },     // Ramp down
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
        { duration: '30s', target: 100 }, // Spike to 100
        { duration: '10s', target: 10 },
        { duration: '10s', target: 0 },
      ],
      tags: { test_type: 'spike' },
    },
  },
  thresholds: {
    // HTTP-related thresholds
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% under 500ms, 99% under 1s
    http_req_failed: ['rate<0.01'], // Less than 1% errors
    http_reqs: ['rate>10'], // More than 10 requests per second

    // Custom metrics thresholds
    errors: ['rate<0.05'], // Less than 5% error rate
    response_time: ['p(95)<500'],
  },
};

// Base URL - can be overridden with environment variable
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:5001';
export const API_BASE = `${BASE_URL}/api`;

// Authentication helper - returns token
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

// Default test user credentials
const TEST_USERS = {
  admin: { email: 'admin@example.com', password: 'AdminPass123', role: 'ADMIN' },
  pm: { email: 'pm@example.com', password: 'PMPass123', role: 'PROJECT_MANAGER' },
  viewer: { email: 'viewer@example.com', password: 'ViewerPass123', role: 'VIEWER' },
};

// Register a test user if not exists
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

// Ensure test user exists
function ensureTestUser(userType) {
  const user = TEST_USERS[userType];
  // Try to login first
  const token = authenticate(user.email, user.password);
  if (token) return token;

  // If login fails, try to register
  registerTestUser(user.email, user.password, user.role);

  // Try login again after registration
  return authenticate(user.email, user.password);
}

// Get authenticated headers
export function getAuthHeaders(userType = 'pm') {
  const token = ensureTestUser(userType);
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// Helper to make authenticated requests
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

  // Track errors
  errorRate.add(response.status >= 400);
  responseTime.add(response.timings.duration);

  return response;
}

// Setup function - runs once at the start
export function setup() {
  console.log(`Starting performance tests against: ${BASE_URL}`);

  // Verify server is running
  const healthCheck = http.get(`${BASE_URL}/api/health`);
  if (healthCheck.status !== 200 && healthCheck.status !== 404) {
    console.error(`Server not reachable at ${BASE_URL}`);
  }

  // Get auth token for tests
  const token = authenticate(TEST_USERS.pm.email, TEST_USERS.pm.password);
  return { token };
}

// Teardown function - runs once at the end
export function teardown(data) {
  console.log('Performance tests completed');
  console.log(`Total requests: ${__ITER}`);
}