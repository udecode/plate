import fs from 'node:fs';
import path from 'node:path';

import {
  createSlateLegacyCompareRows,
  normalizeBenchmarkResult,
} from '../src/index.mjs';

const args = parseArgs(process.argv.slice(2));
const outPath = args.out || 'benchmarks/results/slate-v2-legacy-latest.json';
const rows = createSlateLegacyCompareRows({
  artifactPath: args.artifact,
  rootDir: process.cwd(),
});
const payload = {
  name: 'slate-v2-legacy-compare',
  generatedAt: new Date().toISOString(),
  node: process.version,
  rows,
};

normalizeBenchmarkResult(payload);

if (args.check) {
  const slateRows = rows.filter(
    (row) => row.status === 'ok' && row.library.startsWith('slate-v2:')
  );
  const legacyRows = rows.filter(
    (row) =>
      row.status === 'ok' &&
      (row.library === 'slate' || row.library.startsWith('slate:'))
  );

  if (slateRows.length === 0 || legacyRows.length === 0) {
    throw new Error(
      'expected Slate v2 and Slate benchmark rows from compare artifact'
    );
  }
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n');
console.log(JSON.stringify(payload, null, 2));

function parseArgs(argv) {
  const out = {};
  let i = 0;

  while (i < argv.length) {
    const arg = argv[i];
    i++;
    if (!arg.startsWith('--')) continue;

    const key = arg.slice(2);
    if (key === 'check') {
      out.check = true;
      continue;
    }

    out[key] = argv[i] || true;
    i++;
  }

  return out;
}
