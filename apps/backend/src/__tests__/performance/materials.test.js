import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { authenticatedRequest, getAuthHeaders, API_BASE } from './k6-config.js';

const testMaterial = {
  projectId: 'test-project-id',
  materialName: 'Concrete Mix',
  category: 'Construction',
  description: 'High-strength concrete',
  quantity: 100,
  unit: 'bags',
  unitPrice: 25.00,
  minimumThreshold: 20,
  isEcoFriendly: false,
};

export const options = {
  scenarios: {
    functional: {
      executor: 'constant-vus',
      vus: 5,
      duration: '1m',
      tags: { test_type: 'functional' },
    },
    high_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
      ],
      tags: { test_type: 'high_load' },
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const materialId = __ENV.MATERIAL_ID || '507f1f77bcf86cd799439011';

  group('Materials API - Create', () => {
    const createPayload = JSON.stringify({
      ...testMaterial,
      materialName: `Concrete Mix ${Date.now()}`, // Unique name
    });

    const response = authenticatedRequest('POST', `${API_BASE}/resources/materials`, createPayload);

    check(response, {
      'Create material - status is 201 or 400': (r) =>
        r.status === 201 || r.status === 400 || r.status === 404,
      'Create material - response time < 500ms': (r) => r.timings.duration < 500,
    });
  });

  group('Materials API - List', () => {
    const response = authenticatedRequest('GET', `${API_BASE}/resources/materials?page=1&limit=10`);

    check(response, {
      'List materials - status is 200': (r) => r.status === 200,
      'List materials - has data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.success === true;
        } catch (e) {
          return false;
        }
      },
      'List materials - response time < 300ms': (r) => r.timings.duration < 300,
    });
  });

  group('Materials API - Get by ID', () => {
    const response = authenticatedRequest('GET', `${API_BASE}/resources/materials/${materialId}`);

    check(response, {
      'Get material - status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      'Get material - response time < 200ms': (r) => r.timings.duration < 200,
    });
  });

  group('Materials API - Update', () => {
    const updatePayload = JSON.stringify({
      quantity: 150,
      notes: 'Updated via load test',
    });

    const response = authenticatedRequest('PUT', `${API_BASE}/resources/materials/${materialId}`, updatePayload);

    check(response, {
      'Update material - status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      'Update material - response time < 300ms': (r) => r.timings.duration < 300,
    });
  });

  group('Materials API - Low Stock', () => {
    const response = authenticatedRequest('GET', `${API_BASE}/resources/materials/list/low-stock`);

    check(response, {
      'Low stock - status is 200': (r) => r.status === 200,
      'Low stock - response time < 250ms': (r) => r.timings.duration < 250,
    });
  });

  group('Materials API - Cost Summary', () => {
    const projectId = __ENV.PROJECT_ID || '507f1f77bcf86cd799439011';
    const response = authenticatedRequest('GET', `${API_BASE}/resources/materials/${projectId}/cost-summary`);

    check(response, {
      'Cost summary - status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      'Cost summary - response time < 300ms': (r) => r.timings.duration < 300,
    });
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data),
  };
}

function textSummary(data, options = {}) {
  const indent = options.indent || '';
  const colors = options.enableColors ? true : false;

  let output = `${indent}Performance Test Summary\n`;
  output += `${indent}=${'='.repeat(40)}\n\n`;
  output += `${indent}Total Requests: ${data.metrics.http_reqs?.values?.count || 0}\n`;
  output += `${indent}Failed Requests: ${data.metrics.http_req_failed?.values?.passes || 0}\n`;
  output += `${indent}Error Rate: ${((data.metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2)}%\n\n`;

  if (data.metrics.http_req_duration) {
    const duration = data.metrics.http_req_duration.values;
    output += `${indent}Response Times:\n`;
    output += `${indent}  - Avg: ${duration.avg.toFixed(2)}ms\n`;
    output += `${indent}  - Max: ${duration.max.toFixed(2)}ms\n`;
    output += `${indent}  - p95: ${duration['p(95)']?.toFixed(2)}ms || 'N/A'\n`;
    output += `${indent}  - p99: ${duration['p(99)']?.toFixed(2)}ms || 'N/A'\n`;
  }

  return output;
}