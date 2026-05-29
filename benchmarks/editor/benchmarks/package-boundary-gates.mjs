import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const args = parseArgs(process.argv.slice(2));
const outPath =
  args.out || 'benchmarks/results/package-boundary-gates-latest.json';
const check = Boolean(args.check);
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const entries = discoverEntries(packageJson);
const rows = [...entries.map(measureEntry), measurePackDryRun()];
const payload = {
  name: 'package-boundary-gates',
  generatedAt: new Date().toISOString(),
  node: process.version,
  rows,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n');
console.log('wrote ' + outPath);
for (const row of rows) {
  console.log(
    `${row.fixture} files=${row.files} bytes=${row.bytes} status=${row.status}`
  );
}

if (check) {
  const failures = rows.filter((row) => row.status !== 'ok');
  if (failures.length > 0) {
    for (const row of failures) console.error(row.fixture + ': ' + row.problem);
    process.exit(1);
  }
}

function discoverEntries(packageJson) {
  const entries = [];
  if (packageJson.exports && typeof packageJson.exports === 'object') {
    for (const exportName of Object.keys(packageJson.exports)) {
      const target = readExportTarget(packageJson.exports[exportName]);
      if (target)
        entries.push({
          fixture:
            exportName === '.'
              ? 'package-root'
              : 'package-' + exportName.replace(/[^a-z0-9]+/gi, '-'),
          target,
        });
    }
  }
  if (entries.length === 0 && packageJson.main)
    entries.push({ fixture: 'package-main', target: packageJson.main });
  if (entries.length === 0 && fs.existsSync('src/index.mjs'))
    entries.push({ fixture: 'source-index', target: 'src/index.mjs' });
  return entries;
}

function readExportTarget(value) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object')
    return value.import || value.default || value.require || null;
  return null;
}

function measureEntry(entry) {
  const target = entry.target.replace(/^\.\//, '');
  const reachable = new Set();
  collectReachable(target, reachable);
  const files = Array.from(reachable).sort();
  const bytes = files.reduce((sum, file) => sum + fs.statSync(file).size, 0);
  const forbidden = readForbiddenPatterns().filter((pattern) =>
    files.some((file) => file.includes(pattern))
  );
  const maxBytes = Number(args.bytes || 250_000);
  const maxFiles = Number(args.files || 32);
  const problems = [];
  if (bytes > maxBytes) problems.push('bytes exceed ' + maxBytes);
  if (files.length > maxFiles) problems.push('files exceed ' + maxFiles);
  if (forbidden.length)
    problems.push('forbidden reachable paths: ' + forbidden.join(', '));
  return {
    category: 'package-boundary',
    fixture: entry.fixture,
    library: 'project',
    status: problems.length ? 'over-budget' : 'ok',
    target,
    files: files.length,
    bytes,
    budgetBytes: maxBytes,
    budgetFiles: maxFiles,
    forbidden,
    problem: problems.join('; '),
  };
}

function measurePackDryRun() {
  const maxBytes = Number(args.packBytes || 500_000);
  const maxFiles = Number(args.packFiles || 128);
  const result = spawnSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: 'pipe',
  });
  if (result.status !== 0) {
    return {
      category: 'package-boundary',
      fixture: 'npm-pack',
      library: 'project',
      status: 'error',
      files: 0,
      bytes: 0,
      budgetBytes: maxBytes,
      budgetFiles: maxFiles,
      problem:
        result.stderr.trim() || result.stdout.trim() || 'npm pack failed',
    };
  }
  let pack;
  try {
    const parsed = JSON.parse(result.stdout.trim());
    pack = Array.isArray(parsed) ? parsed[0] : parsed;
  } catch (error) {
    return {
      category: 'package-boundary',
      fixture: 'npm-pack',
      library: 'project',
      status: 'error',
      files: 0,
      bytes: 0,
      budgetBytes: maxBytes,
      budgetFiles: maxFiles,
      problem: 'could not parse npm pack JSON: ' + String(error),
    };
  }
  const files = Array.isArray(pack.files)
    ? pack.files.length
    : Number(pack.entryCount || 0);
  const bytes = Number(pack.unpackedSize || pack.size || 0);
  const problems = [];
  if (bytes > maxBytes) problems.push('pack bytes exceed ' + maxBytes);
  if (files > maxFiles) problems.push('pack files exceed ' + maxFiles);
  return {
    category: 'package-boundary',
    fixture: 'npm-pack',
    library: 'project',
    status: problems.length ? 'over-budget' : 'ok',
    files,
    bytes,
    budgetBytes: maxBytes,
    budgetFiles: maxFiles,
    tarballBytes: Number(pack.size || 0),
    problem: problems.join('; '),
  };
}

function collectReachable(file, reachable) {
  if (!file || reachable.has(file) || !fs.existsSync(file)) return;
  reachable.add(file);
  const source = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);
  const importRegex =
    /\b(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]|import\(['"]([^'"]+)['"]\)/g;
  let match = importRegex.exec(source);

  while (match !== null) {
    const specifier = match[1] || match[2];
    if (specifier?.startsWith('.')) {
      const resolved = resolveLocalImport(dir, specifier);
      if (resolved) collectReachable(resolved, reachable);
    }
    match = importRegex.exec(source);
  }
}

function resolveLocalImport(dir, specifier) {
  const base = path.resolve(dir, specifier);
  const candidates = [
    base,
    base + '.mjs',
    base + '.js',
    base + '.ts',
    path.join(base, 'index.mjs'),
    path.join(base, 'index.js'),
    path.join(base, 'index.ts'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile())
      return path.relative(process.cwd(), candidate);
  }
  return null;
}

function readForbiddenPatterns() {
  if (!args.forbid) return [];
  return String(args.forbid)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
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
