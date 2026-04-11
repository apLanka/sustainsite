/**
 * Writes OpenAPI JSON (from swagger-jsdoc) to ../../fern/openapi/openapi.json for Fern Docs.
 * Run: cd apps/backend && npx ts-node scripts/export-openapi-for-fern.ts
 */
import fs from 'fs';
import path from 'path';

const backendRoot = path.join(__dirname, '..');
process.chdir(backendRoot);

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { swaggerSpec } = require('../src/config/swagger');

const outDir = path.join(backendRoot, '..', '..', 'fern', 'openapi');
const outFile = path.join(outDir, 'openapi.json');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(swaggerSpec, null, 2));
console.log('Wrote', outFile);
