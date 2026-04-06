import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, API_BASE } from './k6-config.js';

export const options = {
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '30s', target: 25 },
        { duration: '30s', target: 50 },
        { duration: '1m', target: 75 },
        { duration: '1m', target: 100 },
        { duration: '1m', target: 150 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    http_req_failed: ['rate<0.10'],
  },
};

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

  const endpoints = [
    '/resources/materials',
    '/resources/equipment',
    '/resources/suppliers',
  ];

  for (const endpoint of endpoints) {
    const response = http.get(`${API_BASE}${endpoint}?page=1&limit=10`, { headers });

    check(response, {
      [`${endpoint} - status 200`]: (r) => r.status === 200,
      [`${endpoint} - reasonable response`]: (r) => r.timings.duration < 5000,
    });
  }

  sleep(1);
}
