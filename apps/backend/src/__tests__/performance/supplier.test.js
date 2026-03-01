import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { authenticatedRequest, API_BASE } from './k6-config.js';

// Test data
const testSupplier = {
  companyName: 'Green Materials Ltd',
  contactPerson: 'John Doe',
  email: 'john@greenmaterials.com',
  phone: '+94771234567',
  address: '123 Green Street, Colombo',
  materialsSupplied: ['Concrete', 'Steel', 'Sand'],
  certifications: ['ISO 14001'],
  paymentTerms: 'Net 30',
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
  const supplierId = __ENV.SUPPLIER_ID || '507f1f77bcf86cd799439033';

  group('Supplier API - Create', () => {
    const createPayload = JSON.stringify({
      ...testSupplier,
      companyName: `Green Materials ${Date.now()}`,
      email: `john${Date.now()}@greenmaterials.com`,
    });

    const response = authenticatedRequest('POST', `${API_BASE}/resources/suppliers`, createPayload);

    check(response, {
      'Create supplier - status is 201 or 400': (r) =>
        r.status === 201 || r.status === 400,
      'Create supplier - response time < 500ms': (r) => r.timings.duration < 500,
    });
  });

  group('Supplier API - List', () => {
    const response = authenticatedRequest('GET', `${API_BASE}/resources/suppliers?page=1&limit=10`);

    check(response, {
      'List suppliers - status is 200': (r) => r.status === 200,
      'List suppliers - has data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.success === true;
        } catch (e) {
          return false;
        }
      },
      'List suppliers - response time < 300ms': (r) => r.timings.duration < 300,
    });
  });

  group('Supplier API - Get by ID', () => {
    const response = authenticatedRequest('GET', `${API_BASE}/resources/suppliers/${supplierId}`);

    check(response, {
      'Get supplier - status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      'Get supplier - response time < 200ms': (r) => r.timings.duration < 200,
    });
  });

  group('Supplier API - Update', () => {
    const updatePayload = JSON.stringify({
      contactPerson: 'Jane Doe',
      phone: '+94779876543',
    });

    const response = authenticatedRequest('PUT', `${API_BASE}/resources/suppliers/${supplierId}`, updatePayload);

    check(response, {
      'Update supplier - status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      'Update supplier - response time < 300ms': (r) => r.timings.duration < 300,
    });
  });

  group('Supplier API - Rate Supplier', () => {
    const ratingPayload = JSON.stringify({
      rating: 4,
      comment: 'Good quality materials',
    });

    const response = authenticatedRequest('POST', `${API_BASE}/resources/suppliers/${supplierId}/rating`, ratingPayload);

    check(response, {
      'Rate supplier - status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      'Rate supplier - response time < 300ms': (r) => r.timings.duration < 300,
    });
  });

  group('Supplier API - Performance', () => {
    const response = authenticatedRequest('GET', `${API_BASE}/resources/suppliers/${supplierId}/performance`);

    check(response, {
      'Get performance - status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      'Get performance - response time < 300ms': (r) => r.timings.duration < 300,
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
  let output = `${indent}Supplier API Performance Test Summary\n`;
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