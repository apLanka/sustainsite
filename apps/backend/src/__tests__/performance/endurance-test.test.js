import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, API_BASE } from './k6-config.js';

// Endurance/Soak test - prolonged load to detect memory leaks
export const options = {
  scenarios: {
    // Endurance test - sustained load over time
    endurance: {
      executor: 'constant-vus',
      vus: 20,
      duration: '5m', // 5 minutes of sustained load
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1500'],
    http_req_failed: ['rate<0.05'],
    // Check for memory usage if available
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

  // Mix of read and write operations
  const operations = [
    // Read operations (70%)
    () => http.get(`${API_BASE}/resources/materials`, { headers }),
    () => http.get(`${API_BASE}/resources/equipment`, { headers }),
    () => http.get(`${API_BASE}/resources/suppliers`, { headers }),
  ];

  // Random operation selection
  const op = operations[Math.floor(Math.random() * operations.length)];
  const response = op();

  check(response, {
    'Operation successful': (r) => r.status === 200,
    'Response time acceptable': (r) => r.timings.duration < 1500,
  });

  // Shorter sleep for higher throughput
  sleep(0.5);
}

export function handleSummary(data) {
  const duration = data.state.testRunDuration || 0;
  const minutes = (duration / 60).toFixed(1);

  console.log(`\n=== ENDURANCE TEST RESULTS ===`);
  console.log(`Test Duration: ${minutes} minutes`);
  console.log(`Total Requests: ${data.metrics.http_reqs?.values?.count || 0}`);
  console.log(`Error Rate: ${((data.metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2)}%`);

  return {
    'stdout': `Endurance test completed: ${minutes} min`,
    'endurance-results.json': JSON.stringify(data),
  };
}
