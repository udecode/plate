#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../..');
const transplantDir = path.join(repoRoot, 'docs/transplant/slate-v2');
const manifestPath = path.join(transplantDir, 'donor-manifest.jsonl');
const ledgerPath = path.join(transplantDir, 'source-switch-ledger.jsonl');

const readJsonl = (filePath) =>
  readFileSync(filePath, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));

const sha256 = (content) =>
  createHash('sha256').update(content).digest('hex');

const countBy = (rows, key) => {
  const counts = new Map();

  for (const row of rows) {
    const value = row[key];
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return counts;
};

const nestedCountBy = (rows, outerKey, innerKey) => {
  const counts = new Map();

  for (const row of rows) {
    const outer = row[outerKey];
    const inner = row[innerKey];
    const innerCounts = counts.get(outer) ?? new Map();
    innerCounts.set(inner, (innerCounts.get(inner) ?? 0) + 1);
    counts.set(outer, innerCounts);
  }

  return counts;
};

const formatCountMap = (counts) =>
  [...counts.entries()]
    .sort(([a], [b]) => String(a).localeCompare(String(b)))
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

const rowsForCategories = (rows, categories) =>
  rows.filter((row) => categories.includes(row.category));

const pathExists = (repoRelativePath) =>
  existsSync(path.join(repoRoot, repoRelativePath));

const fail = (message, details = []) => {
  console.error(`Slate source-switch parity failed: ${message}`);

  for (const detail of details.slice(0, 20)) {
    console.error(`- ${detail}`);
  }

  if (details.length > 20) {
    console.error(`- ... ${details.length - 20} more`);
  }

  process.exit(1);
};

const manifest = readJsonl(manifestPath);
const ledger = readJsonl(ledgerPath);

const manifestPaths = new Set(manifest.map((row) => row.path));
const ledgerPaths = new Set(ledger.map((row) => row.donorPath));
const missingLedgerRows = [...manifestPaths].filter((donorPath) => {
  return !ledgerPaths.has(donorPath);
});
const extraLedgerRows = [...ledgerPaths].filter((donorPath) => {
  return !manifestPaths.has(donorPath);
});

if (manifest.length !== ledger.length) {
  fail(`row count mismatch, manifest=${manifest.length}, ledger=${ledger.length}`);
}

if (missingLedgerRows.length > 0 || extraLedgerRows.length > 0) {
  fail('manifest and ledger donor paths differ', [
    ...missingLedgerRows.map((row) => `missing ledger row: ${row}`),
    ...extraLedgerRows.map((row) => `extra ledger row: ${row}`),
  ]);
}

const manifestCategoryCounts = countBy(manifest, 'category');
const ledgerCategoryCounts = countBy(ledger, 'category');

for (const [category, count] of manifestCategoryCounts) {
  if (ledgerCategoryCounts.get(category) !== count) {
    fail(
      `category count mismatch for ${category}, manifest=${count}, ledger=${
        ledgerCategoryCounts.get(category) ?? 0
      }`
    );
  }
}

const missingRows = ledger.filter(
  (row) =>
    row.status === 'missing' ||
    row.status === 'unaccounted' ||
    !Array.isArray(row.destinations) ||
    row.destinations.length === 0
);

if (missingRows.length > 0) {
  fail(
    'ledger contains unaccounted rows',
    missingRows.map((row) => `${row.donorPath} (${row.status})`)
  );
}

const missingDestinations = [];

for (const row of ledger) {
  for (const destination of row.destinations) {
    if (!pathExists(destination)) {
      missingDestinations.push(`${row.donorPath} -> ${destination}`);
    }
  }
}

if (missingDestinations.length > 0) {
  fail('ledger destinations are missing from the current checkout', missingDestinations);
}

const staleArchives = [];

for (const row of ledger) {
  if (row.status !== 'archived-exact') continue;

  for (const destination of row.destinations) {
    const destinationPath = path.join(repoRoot, destination);
    const destinationSha = sha256(readFileSync(destinationPath));

    if (destinationSha !== row.donorSha256) {
      staleArchives.push(`${row.donorPath} -> ${destination}`);
    }
  }
}

if (staleArchives.length > 0) {
  fail('archived-exact rows no longer match donor hashes', staleArchives);
}

const requiredCoverage = [
  {
    categories: ['package-test'],
    label: 'package tests',
    requiredStatuses: new Map([['active-package', 1280]]),
  },
  {
    categories: ['package-source'],
    label: 'package source',
    requiredStatuses: new Map([['active-package', 446]]),
  },
  {
    categories: ['package-doc'],
    label: 'package docs',
    requiredStatuses: new Map([['active-package', 13]]),
  },
  {
    categories: ['docs'],
    label: 'public docs',
    requiredStatuses: new Map([
      ['active-fumadocs-doc', 88],
      ['archived-exact', 46],
    ]),
  },
  {
    categories: ['site-example'],
    label: 'examples',
    requiredStatuses: new Map([
      ['active-app-example', 42],
      ['archived-exact', 1],
    ]),
  },
  {
    categories: ['site-example-route'],
    label: 'example routes',
    requiredStatuses: new Map([['archived-exact', 2]]),
  },
  {
    categories: ['playwright-integration', 'playwright-stress', 'playwright'],
    label: 'browser proof',
    requiredStatuses: new Map([['active-browser-proof', 41]]),
  },
  {
    categories: ['benchmark-script', 'script', 'proof-script', 'stress-script'],
    label: 'benchmark/proof scripts',
    requiredStatuses: new Map([['active-benchmark-or-proof-script', 49]]),
  },
  {
    categories: ['research-artifact'],
    label: 'raw research artifacts',
    requiredStatuses: new Map([['active-research-raw', 21]]),
  },
];

const statusByCategory = nestedCountBy(ledger, 'category', 'status');

for (const coverage of requiredCoverage) {
  const rows = rowsForCategories(ledger, coverage.categories);
  const actual = countBy(rows, 'status');

  for (const [status, expected] of coverage.requiredStatuses) {
    if (actual.get(status) !== expected) {
      fail(
        `${coverage.label} coverage mismatch for ${status}, expected=${expected}, actual=${
          actual.get(status) ?? 0
        }`
      );
    }
  }

  const expectedTotal = [...coverage.requiredStatuses.values()].reduce(
    (sum, count) => sum + count,
    0
  );

  if (rows.length !== expectedTotal) {
    fail(
      `${coverage.label} total mismatch, expected=${expectedTotal}, actual=${rows.length}`
    );
  }
}

console.log('Slate source-switch parity OK');
console.log(`- donor rows accounted: ${ledger.length}/${manifest.length}`);
console.log(`- donor categories: ${formatCountMap(ledgerCategoryCounts)}`);
console.log(
  `- package tests: ${
    statusByCategory.get('package-test')?.get('active-package') ?? 0
  } active-package rows`
);
console.log(
  `- docs: ${
    statusByCategory.get('docs')?.get('active-fumadocs-doc') ?? 0
  } active Fumadocs rows, ${
    statusByCategory.get('docs')?.get('archived-exact') ?? 0
  } archived exact rows`
);
console.log(
  `- examples: ${
    statusByCategory.get('site-example')?.get('active-app-example') ?? 0
  } active app rows, ${
    statusByCategory.get('site-example')?.get('archived-exact') ?? 0
  } archived exact rows`
);
console.log(
  `- browser proof rows: ${rowsForCategories(ledger, [
    'playwright-integration',
    'playwright-stress',
    'playwright',
  ]).length}`
);
console.log(
  `- raw research rows: ${
    statusByCategory.get('research-artifact')?.get('active-research-raw') ?? 0
  }`
);
