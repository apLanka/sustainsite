import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, API_BASE } from './k6-config.js';

// Simple smoke test - just verify basic connectivity
export const options = {
  vus: 1,
  duration: '10s',
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.5'],
  },
};

export default function () {
  // Test 1: Login endpoint
  const loginRes = http.post(`${API_BASE}/auth/login`, JSON.stringify({
    email: 'admin@example.com',
    password: 'AdminPass123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'Login - status is 200': (r) => r.status === 200,
  });

  let token = null;
  if (loginRes.status === 200) {
    try {
      const body = JSON.parse(loginRes.body);
      token = body.data?.token || body.token;
    } catch (e) {}
  }

  // If no token, try register
  if (!token) {
    const regRes = http.post(`${API_BASE}/auth/register`, JSON.stringify({
      email: 'admin@example.com',
      password: 'AdminPass123',
      fullName: 'Test Admin',
      role: 'ADMIN',
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

    if (regRes.status === 201 || regRes.status === 200) {
      const loginRes2 = http.post(`${API_BASE}/auth/login`, JSON.stringify({
        email: 'admin@example.com',
        password: 'AdminPass123',
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
      if (loginRes2.status === 200) {
        const body = JSON.parse(loginRes2.body);
        token = body.data?.token || body.token;
      }
    }
  }

  if (!token) {
    console.log('Could not get token');
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Test 2: List materials
  const materialsRes = http.get(`${API_BASE}/resources/materials`, { headers });
  check(materialsRes, {
    'List materials - status 200 or 404': (r) => r.status === 200 || r.status === 404,
  });

  // Test 3: List equipment
  const equipmentRes = http.get(`${API_BASE}/resources/equipment`, { headers });
  check(equipmentRes, {
    'List equipment - status 200 or 404': (r) => r.status === 200 || r.status === 404,
  });

  // Test 4: List suppliers
  const suppliersRes = http.get(`${API_BASE}/resources/suppliers`, { headers });
  check(suppliersRes, {
    'List suppliers - status 200 or 404': (r) => r.status === 200 || r.status === 404,
  });

  sleep(1);
}
