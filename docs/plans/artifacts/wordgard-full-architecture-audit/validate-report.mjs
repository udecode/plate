import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifactDirectory = dirname(fileURLToPath(import.meta.url));
const repository = join(artifactDirectory, '../../../..');
const planPath = join(
  repository,
  'docs/plans/2026-07-23-wordgard-full-architecture-audit.md'
);
const plan = readFileSync(planPath, 'utf8');
const lines = plan.split('\n');
const failures = [];
const fail = (message) => failures.push(message);
const ledgerRowPattern = /^\| (DOC|STATE|HC|PRODUCT|TABLE|VIEW|META)-\d{3} \|/;
const requirementRowPattern = /^\| R\d{3} \|/;
const requirementRows = lines.filter((line) =>
  requirementRowPattern.test(line)
);

if (requirementRows.length !== 69) {
  fail(`Expected 69 requirement rows, found ${requirementRows.length}`);
}

const ledgerRows = lines
  .filter((line) => ledgerRowPattern.test(line))
  .map((line) => line.slice(2, -2).split(' | '));

if (ledgerRows.length !== 181) {
  fail(`Expected 181 ledger rows, found ${ledgerRows.length}`);
}

const conceptIds = new Set();
const dispositionCounts = {};
const verdictCounts = {};

for (const cells of ledgerRows) {
  if (cells.length !== 24) {
    fail(`${cells[0] ?? 'unknown row'} has ${cells.length} cells`);
    continue;
  }
  if (conceptIds.has(cells[0])) fail(`Duplicate concept ${cells[0]}`);
  conceptIds.add(cells[0]);
  dispositionCounts[cells[18]] = (dispositionCounts[cells[18]] ?? 0) + 1;
  verdictCounts[cells[19]] = (verdictCounts[cells[19]] ?? 0) + 1;

  for (const field of [3, 5, 7, 8, 16]) {
    const score = cells[field];
    const match = score.match(
      /(\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?){7})\s*=\s*(\d+(?:\.\d+)?)/
    );

    if (!match) continue;
    const sum = match[1]
      .split('/')
      .reduce((total, value) => total + Number(value), 0);
    const stated = Number(match[2]);

    if (
      Math.abs(stated - sum) > Number.EPSILON &&
      Math.abs(stated - sum * 2.5) > Number.EPSILON
    ) {
      fail(`${cells[0]} score field ${field} sums to ${sum}, states ${stated}`);
    }
  }
}

const expectedDispositions = {
  Adopt: 48,
  Defer: 1,
  Reject: 40,
  Surpass: 92,
};
const expectedVerdicts = {
  Bridge: 3,
  Cut: 9,
  Gate: 16,
  Keep: 115,
  Move: 6,
  Rearchitect: 31,
  Rename: 1,
};
const normalizedCounts = (counts) =>
  Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) => left.localeCompare(right))
  );

if (
  JSON.stringify(normalizedCounts(dispositionCounts)) !==
  JSON.stringify(normalizedCounts(expectedDispositions))
) {
  fail(`Disposition counts differ: ${JSON.stringify(dispositionCounts)}`);
}
if (
  JSON.stringify(normalizedCounts(verdictCounts)) !==
  JSON.stringify(normalizedCounts(expectedVerdicts))
) {
  fail(`Verdict counts differ: ${JSON.stringify(verdictCounts)}`);
}

if (plan.includes('- [ ]')) fail('Unchecked checklist item remains');
for (const staleCall of [
  'codecs: {',
  'PRODUCT-023` counts as local `rearchitect',
  'inferred feature updates plus inline codec declarations',
  'feature updates and inline codecs',
  '.extendHostCodecs(',
  '"requirements":58',
  '"planCitations":1735',
  '| C24 Structural-list rename | PRODUCT Packet 5 | Execute',
  '| 19 | C24 structural-list rename',
  'C24 structural-list rename may run independently',
  'Replacement: `@platejs/list-structural`',
  '| C24 list rename |',
]) {
  if (plan.includes(staleCall)) fail(`Stale public call shape: ${staleCall}`);
}
for (const requiredCall of [
  'editor.update.bold.toggle()',
  'editor.plugin(BoldPlugin).update.toggle()',
  "editor.update.textAlign.set('center')",
  'editor.api.list.isActive',
  'editor.api.link.validateUrl',
  '.extendCodecs(',
  '.extendHtmlCodec(',
  '**Decision:** Rejected by user.',
  'Keep `@platejs/list-classic`',
]) {
  if (!plan.includes(requiredCall))
    fail(`Missing target call: ${requiredCall}`);
}

const roots = [
  ['../wordgard-v0/', join(repository, '../wordgard-v0')],
  ['../wordgard/', join(repository, '../wordgard')],
  ['packages/', repository],
  ['apps/', repository],
  ['content/', repository],
  ['docs/', repository],
  ['benchmarks/', repository],
  ['.agents/', repository],
];
const references = [];
const referencePattern =
  /`((?:\.\.\/wordgard(?:-v0)?\/|packages\/|apps\/|content\/|docs\/|benchmarks\/|\.agents\/)[^`\n]+?)`/g;

for (const match of plan.matchAll(referencePattern)) {
  const raw = match[1];

  if (/[*{}]/.test(raw)) continue;
  const range = raw.match(/^(.*?):(\d+)(?:-(\d+))?$/);
  const rawPath = range ? range[1] : raw;
  const root = roots.find(([prefix]) => rawPath.startsWith(prefix));

  if (!root) continue;
  const absolutePath = rawPath.startsWith('../wordgard')
    ? join(root[1], rawPath.slice(root[0].length))
    : join(repository, rawPath);
  const start = range ? Number(range[2]) : null;
  const end = range ? Number(range[3] ?? range[2]) : null;

  references.push({ absolutePath, end, raw, start });
}

for (const reference of references) {
  if (!existsSync(reference.absolutePath)) {
    if (reference.start === null) continue;

    fail(`Missing citation path: ${reference.raw}`);
    continue;
  }
  if (reference.end !== null) {
    const lineCount = readFileSync(reference.absolutePath, 'utf8').split(
      '\n'
    ).length;

    if (
      reference.start < 1 ||
      reference.end < reference.start ||
      reference.end > lineCount
    ) {
      fail(`Citation range outside ${lineCount} lines: ${reference.raw}`);
    }
  }
}

const baselineManifest = JSON.parse(
  readFileSync(join(artifactDirectory, 'coverage-manifest.json'), 'utf8')
);
const latestManifest = JSON.parse(
  readFileSync(join(artifactDirectory, 'latest-delta-manifest.json'), 'utf8')
);
const checkoutManifest = JSON.parse(
  readFileSync(join(artifactDirectory, 'current-checkout-refresh.json'), 'utf8')
);

if (baselineManifest.files.length !== 119) {
  fail(`Baseline manifest has ${baselineManifest.files.length} files`);
}
if (latestManifest.summary?.changedFiles !== 52) {
  fail(
    `Latest delta manifest has ${latestManifest.summary?.changedFiles} changed files`
  );
}
if (
  checkoutManifest.census.changedPaths !==
    checkoutManifest.census.sourcePaths +
      checkoutManifest.census.excludedPaths ||
  checkoutManifest.census.mappedSourcePaths !==
    checkoutManifest.census.sourcePaths ||
  checkoutManifest.census.unclassifiedPaths !== 0 ||
  checkoutManifest.census.unmappedSourcePaths !== 0
) {
  fail(`Checkout census differs: ${JSON.stringify(checkoutManifest.census)}`);
}

const runGitBuffer = (...args) =>
  execFileSync('git', ['-C', repository, ...args], {
    encoding: 'buffer',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
const nulList = (...args) =>
  runGitBuffer(...args)
    .toString()
    .split('\0')
    .filter(Boolean);
const currentPaths = [
  ...new Set([
    ...nulList('diff', '--cached', '--name-only', '-z'),
    ...nulList('diff', '--name-only', '-z'),
    ...nulList('ls-files', '--others', '--exclude-standard', '-z'),
  ]),
].sort();
const manifestPaths = checkoutManifest.files.map((file) => file.path).sort();

if (JSON.stringify(currentPaths) !== JSON.stringify(manifestPaths)) {
  fail('Current changed-path set differs from current-checkout-refresh.json');
}

for (const file of checkoutManifest.files) {
  if (file.exclusionReason || file.sha256 === null) continue;
  const absolutePath = join(repository, file.path);

  if (!existsSync(absolutePath)) {
    fail(`Checkout manifest path is missing: ${file.path}`);
    continue;
  }

  const hash = createHash('sha256')
    .update(readFileSync(absolutePath))
    .digest('hex');

  if (hash !== file.sha256) {
    fail(`Current bytes differ from checkout manifest: ${file.path}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

process.stdout.write(
  `${JSON.stringify({
    citations: references.length,
    concepts: ledgerRows.length,
    dispositionCounts,
    manifests: 3,
    requirements: requirementRows.length,
    sourcePaths: checkoutManifest.census.sourcePaths,
    verdictCounts,
  })}\n`
);
