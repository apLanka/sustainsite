const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const roots = [
  path.join(__dirname, '../apps/frontend/src'),
  path.join(__dirname, '../apps/frontend/vite.config.ts'),
  path.join(__dirname, '../apps/backend/src'),
  path.join(__dirname, '../apps/backend/scripts'),
];

function* walkFiles(filePath) {
  if (!fs.existsSync(filePath)) return;
  const st = fs.statSync(filePath);
  if (st.isFile()) {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) yield filePath;
    return;
  }
  if (!st.isDirectory()) return;
  const base = path.basename(filePath);
  if (base === 'node_modules' || base === 'dist' || base === 'coverage') return;
  for (const ent of fs.readdirSync(filePath, { withFileTypes: true })) {
    const p = path.join(filePath, ent.name);
    if (ent.isDirectory()) yield* walkFiles(p);
    else if (ent.isFile() && (p.endsWith('.ts') || p.endsWith('.tsx'))) yield p;
  }
}

let changed = 0;
let total = 0;

for (const root of roots) {
  if (root.endsWith('.ts') || root.endsWith('.tsx')) {
    for (const f of [root]) processFile(f);
    continue;
  }
  for (const f of walkFiles(root)) processFile(f);
}

function processFile(fullPath) {
  total += 1;
  const sourceText = fs.readFileSync(fullPath, 'utf8');
  const kind = fullPath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(fullPath, sourceText, ts.ScriptTarget.Latest, true, kind);
  const nl = sourceText.includes('\r\n')
    ? ts.NewLineKind.CarriageReturnLineFeed
    : ts.NewLineKind.LineFeed;
  const printer = ts.createPrinter({ removeComments: true, newLine: nl });
  const out = printer.printFile(sf);
  if (out !== sourceText) {
    fs.writeFileSync(fullPath, out, 'utf8');
    changed += 1;
    console.log('stripped:', path.relative(process.cwd(), fullPath));
  }
}

console.log(`Done. ${changed}/${total} files modified.`);
