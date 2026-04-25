import fs from 'fs';
import path from 'path';
import { swaggerSpec } from '../src/config/swagger';

const backendRoot = path.join(__dirname, '..');
process.chdir(backendRoot);
const outDir = path.join(backendRoot, '..', '..', 'fern', 'openapi');
const outFile = path.join(outDir, 'openapi.json');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(swaggerSpec, null, 2));
console.log('Wrote', outFile);
