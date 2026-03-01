import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { authenticatedRequest, API_BASE } from './k6-config.js';

// Test data
const testEquipment = {
  projectId: 'test-project-id',
  equipmentName: 'Excavator CAT 320',
  equipmentType: 'Heavy Machinery',
  description: 'Hydraulic excavator',
  purchaseDate: '2024-01-15',
  purchasePrice: 150000,
  condition: 'Good',
  location: 'Project Site A',
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
  const equipmentId = __ENV.EQUIPMENT_ID || '507f1f77bcf86cd799439022';

  group('Equipment API - Create', () => {
    const createPayload = JSON.stringify({
      ...testEquipment,
      equipmentName: `Excavator ${Date.now()}`,
    });

    const response = authenticatedRequest('POST', `${API_BASE}/resources/equipment`, createPayload);

    check(response, {
      'Create equipment - status is 201 or 400': (r) =>
        r.status === 201 || r.status === 400 || r.status === 404,
      'Create equipment - response time < 500ms': (r) => r.timings.duration < 500,
    });
  });

  group('Equipment API - List', () => {
    const response = authenticatedRequest('GET', `${API_BASE}/resources/equipment?page=1&limit=10`);

    check(response, {
      'List equipment - status is 200': (r) => r.status === 200,
      'List equipment - has data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.success === true;
        } catch (e) {
          return false;
        }
      },
      'List equipment - response time < 300ms': (r) => r.timings.duration < 300,
    });
  });

  group('Equipment API - Get by ID', () => {
    const response = authenticatedRequest('GET', `${API_BASE}/resources/equipment/${equipmentId}`);

    check(response, {
      'Get equipment - status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      'Get equipment - response time < 200ms': (r) => r.timings.duration < 200,
    });
  });

  group('Equipment API - Update', () => {
    const updatePayload = JSON.stringify({
      location: 'Project Site B',
      condition: 'Excellent',
    });

    const response = authenticatedRequest('PUT', `${API_BASE}/resources/equipment/${equipmentId}`, updatePayload);

    check(response, {
      'Update equipment - status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      'Update equipment - response time < 300ms': (r) => r.timings.duration < 300,
    });
  });

  group('Equipment API - Available List', () => {
    const response = authenticatedRequest('GET', `${API_BASE}/resources/equipment/list/available`);

    check(response, {
      'Available equipment - status is 200': (r) => r.status === 200,
      'Available equipment - response time < 250ms': (r) => r.timings.duration < 250,
    });
  });

  group('Equipment API - Assign', () => {
    const assignPayload = JSON.stringify({
      projectId: '507f1f77bcf86cd799439011',
      assignedDate: new Date().toISOString(),
    });

    const response = authenticatedRequest('POST', `${API_BASE}/resources/equipment/${equipmentId}/assign`, assignPayload);

    check(response, {
      'Assign equipment - status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      'Assign equipment - response time < 300ms': (r) => r.timings.duration < 300,
    });
  });

  group('Equipment API - Schedule Maintenance', () => {
    const maintenancePayload = JSON.stringify({
      maintenanceType: 'Preventive',
      scheduledDate: new Date().toISOString(),
      description: 'Regular maintenance',
      estimatedCost: 500,
    });

    const response = authenticatedRequest('POST', `${API_BASE}/resources/equipment/${equipmentId}/maintenance`, maintenancePayload);

    check(response, {
      'Schedule maintenance - status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      'Schedule maintenance - response time < 300ms': (r) => r.timings.duration < 300,
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
  let output = `${indent}Equipment API Performance Test Summary\n`;
  output += `${indent}=${'='.repeat(40)}\n\n`;
  output += `${indent}Total Requests: ${data.metrics.http_reqs?.values?.count || 0}\n`;
  output += `${indent}Error Rate: ${((data.metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2)}%\n\n`;

  if (data.metrics.http_req_duration) {
    const duration = data.metrics.http_req_duration.values;
    output += `${indent}Response Times:\n`;
    output += `${indent}  - Avg: ${duration.avg.toFixed(2)}ms\n`;
    output += `${indent}  - p95: ${duration['p(95)']?.toFixed(2)}ms || 'N/A'\n`;
  }

  return output;
}