// A `*-contract.ts` file runs only when a `*.spec` or `*.test` file imports
// it, because the package test runners select spec and test files alone.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const SOURCE_RE = /\.[cm]?[jt]sx?$/u;
const RUNNER_RE = /\.(?:spec|test)\.[cm]?[jt]sx?$/u;
const CONTRACT_RE = /-contract\.[cm]?[jt]sx?$/u;
const RUNTIME_TEST_RE =
  /^\s*(?:describe|it|test)(?:\.(?:each|only|skip|todo)\b[^(]*)?\s*\(/mu;
const RELATIVE_IMPORT_RE =
  /(?:import|export)\s[^'"]*?from\s*['"](\.[^'"]+)['"]|import\s*['"](\.[^'"]+)['"]/gu;

const walk = (dir) => {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === 'dist' || entry.name === 'node_modules') return [];
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(file);
    return SOURCE_RE.test(entry.name) ? [file] : [];
  });
};

const resolveImport = (from, specifier) => {
  const base = path.resolve(path.dirname(from), specifier);
  const candidates = [
    base,
    ...['.ts', '.tsx', '.js', '.mjs', '.cjs'].map((ext) => base + ext),
    ...['index.ts', 'index.tsx', 'index.js'].map((name) =>
      path.join(base, name)
    ),
  ];
  return candidates.find((file) => existsSync(file) && statSync(file).isFile());
};

const importsOf = (file) =>
  [...readFileSync(file, 'utf-8').matchAll(RELATIVE_IMPORT_RE)]
    .map((match) => resolveImport(file, match[1] ?? match[2]))
    .filter(Boolean);

const findUnreachableContracts = (roots) => {
  const files = roots.flatMap(walk);
  const reached = new Set();
  const queue = files.filter((file) => RUNNER_RE.test(file));
  while (queue.length > 0) {
    const file = queue.pop();
    if (reached.has(file)) continue;
    reached.add(file);
    queue.push(...importsOf(file));
  }
  return files
    .filter((file) => CONTRACT_RE.test(file) && !reached.has(file))
    .filter((file) => RUNTIME_TEST_RE.test(readFileSync(file, 'utf-8')))
    .map((file) => path.relative(repoRoot, file))
    .sort();
};

const packagesDir = path.join(repoRoot, 'packages');
const roots = readdirSync(packagesDir).flatMap((name) => [
  path.join(packagesDir, name, 'src'),
  path.join(packagesDir, name, 'test'),
]);
const unreachable = findUnreachableContracts(roots);

if (unreachable.length > 0) {
  console.error(unreachable.join('\n'));
  console.error(
    'These contract files declare runtime tests that no *.spec or *.test file imports, so they never run. Import each one from its runner.'
  );
  process.exit(1);
}
console.info('Every contract file with runtime tests is reached by a runner.');
