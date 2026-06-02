import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = parseArgs(process.argv.slice(2));
const runs = readInt(args.runs, 7);
const outPath = args.out || 'benchmarks/results/startup-import-latest.json';
const check = Boolean(args.check);
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const entries = discoverEntries(packageJson);
const rows = entries.map((entry) => measureEntry(entry, runs));
const payload = {
  name: 'startup-import',
  generatedAt: new Date().toISOString(),
  node: process.version,
  runs,
  rows,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n');
console.log('wrote ' + outPath);
for (const row of rows) {
  console.log(
    `${row.fixture} median=${row.medianMs.toFixed(3)}ms p95=${row.p95Ms.toFixed(3)}ms exports=${row.exportCount} status=${row.status}`
  );
}

if (check) {
  const failures = rows.filter(
    (row) =>
      row.status !== 'ok' ||
      row.p95Ms > row.budgetP95Ms ||
      row.exportCount > row.budgetExports
  );
  if (failures.length > 0) {
    for (const row of failures) console.error(row.fixture + ': ' + row.problem);
    process.exit(1);
  }
}

function discoverEntries(packageJson) {
  const entries = [];
  if (packageJson.exports && typeof packageJson.exports === 'object') {
    for (const exportName of Object.keys(packageJson.exports)) {
      const specifier =
        exportName === '.'
          ? packageJson.name
          : packageJson.name + '/' + exportName.replace(/^\.\//, '');
      entries.push({
        fixture:
          exportName === '.'
            ? 'package-root'
            : 'package-' + exportName.replace(/[^a-z0-9]+/gi, '-'),
        specifier,
      });
    }
  } else if (packageJson.main) {
    entries.push({
      fixture: 'package-main',
      specifier: pathToFileURL(path.resolve(packageJson.main)).href,
    });
  }
  if (entries.length === 0 && fs.existsSync('src/index.mjs')) {
    entries.push({
      fixture: 'source-index',
      specifier: pathToFileURL(path.resolve('src/index.mjs')).href,
    });
  }
  return entries.map((entry) => ({
    ...entry,
    budgetP95Ms: Number(args.p95Ms || 75),
    budgetExports: Number(args.exports || 100),
  }));
}

function measureEntry(entry, runs) {
  const samples = [];
  for (let i = 0; i < runs; i++) {
    const child = spawnSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        [
          'const start = performance.now();',
          `const mod = await import(${JSON.stringify(entry.specifier)});`,
          'const end = performance.now();',
          'console.log(JSON.stringify({ ms: end - start, exports: Object.keys(mod).length }));',
        ].join('\n'),
      ],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
      }
    );
    if (child.status !== 0) {
      return {
        category: 'startup',
        fixture: entry.fixture,
        library: 'project',
        status: 'error',
        medianMs: 0,
        p95Ms: 0,
        exportCount: 0,
        budgetP95Ms: entry.budgetP95Ms,
        budgetExports: entry.budgetExports,
        problem: child.stderr.trim() || child.stdout.trim() || 'import failed',
      };
    }
    samples.push(JSON.parse(child.stdout.trim()));
  }
  const ms = samples.map((sample) => sample.ms).sort((a, b) => a - b);
  const exportCount = Math.max(...samples.map((sample) => sample.exports));
  const medianMs = percentile(ms, 0.5);
  const p95Ms = percentile(ms, 0.95);
  const problems = [];
  if (p95Ms > entry.budgetP95Ms)
    problems.push('p95 exceeds ' + entry.budgetP95Ms + 'ms');
  if (exportCount > entry.budgetExports)
    problems.push('exports exceed ' + entry.budgetExports);
  return {
    category: 'startup',
    fixture: entry.fixture,
    library: 'project',
    status: problems.length ? 'over-budget' : 'ok',
    medianMs,
    p95Ms,
    exportCount,
    budgetP95Ms: entry.budgetP95Ms,
    budgetExports: entry.budgetExports,
    problem: problems.join('; '),
  };
}

function percentile(sorted, p) {
  return (
    sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] || 0
  );
}

function parseArgs(argv) {
  const out = {};
  let i = 0;

  while (i < argv.length) {
    const arg = argv[i];
    i++;
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    if (key === 'check') out.check = true;
    else {
      out[key] = argv[i] || true;
      i++;
    }
  }
  return out;
}

function readInt(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}
