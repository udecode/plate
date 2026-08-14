#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const target = '../slate-audit';
const reportDir = 'docs/editor-test-harvester/slate';
const sourceCommit = execFileSync('git', ['-C', target, 'rev-parse', 'HEAD'], {
  encoding: 'utf8',
}).trim();

const inventoryPattern =
  /(^|\/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(\/|$)|\.(test|spec)\.[cm]?[jt]sx?$/;
const excludedPattern =
  /(^|\/)(dist|build|coverage|node_modules|vendor|fixtures\/generated|__snapshots__)(\/|$)/;

const files = execFileSync('rg', ['--files', target], { encoding: 'utf8' })
  .trim()
  .split('\n')
  .map((file) => file.replace(/^\.\.\/slate-audit\//, ''))
  .filter((file) => inventoryPattern.test(file) && !excludedPattern.test(file))
  .sort();

const familyFor = (file) => {
  if (file.startsWith('playwright/integration/examples/')) {
    return `browser-example/${path.basename(file, '.test.ts')}`;
  }
  if (file.startsWith('packages/slate-react/test/')) {
    return `react-runtime/${path.basename(file).replace(/\.(spec|test)\.[^.]+$/, '')}`;
  }
  if (file.startsWith('packages/slate-history/test/'))
    return 'history-undo-redo';
  if (file.startsWith('packages/slate-hyperscript/test/'))
    return 'test-harness/hyperscript';

  const relative = file.replace(/^packages\/slate\/test\//, '');
  const [first, second] = relative.split('/');

  if (first === 'normalization') return `normalization/${second ?? 'root'}`;
  if (first === 'transforms') return `transform/${second ?? 'root'}`;
  if (first === 'operations') return `operation/${second ?? 'root'}`;
  if (first === 'interfaces') return `interface/${second ?? 'root'}`;
  if (first === 'utils') return `utility/${second ?? 'root'}`;

  return 'test-harness/config';
};

const classify = (file) => {
  const harness =
    file.startsWith('packages/slate-hyperscript/test/') ||
    file.startsWith('playwright/docker/') ||
    file === 'playwright/tsconfig.json' ||
    file === 'packages/slate/test/index.js' ||
    file === 'packages/slate/test/jsx.d.ts' ||
    file === 'packages/slate-history/test/index.js' ||
    file === 'packages/slate-react/test/tsconfig.json';

  if (harness) {
    return {
      category: 'harness',
      reason:
        'Runner, fixture DSL, declaration, or browser infrastructure; it supports behavior proof but is not itself a portable editor invariant.',
      runnable: false,
    };
  }

  if (
    file.startsWith('packages/slate-react/test/') ||
    file.startsWith('playwright/integration/examples/')
  ) {
    return {
      category: 'portable-mixed',
      reason:
        'Portable editor behavior coupled to React or browser/example transport; split substrate law from host/product policy before adoption.',
      runnable: true,
    };
  }

  return {
    category: 'portable',
    reason:
      'Fixture or unit proof of editor model, transform, normalization, history, or utility behavior.',
    runnable: true,
  };
};

const rows = files.map((file) => ({
  file,
  family: familyFor(file),
  ...classify(file),
}));

const counts = rows.reduce(
  (result, row) => {
    result[row.category] += 1;
    if (row.runnable) result.runnable += 1;
    return result;
  },
  {
    harness: 0,
    portable: 0,
    'portable-mixed': 0,
    runnable: 0,
  }
);

const escapeCell = (value) => String(value).replaceAll('|', '\\|');
const inventory = [
  '# Slate Test Inventory',
  '',
  'source report: [report.md](./report.md)',
  `target: \`${target}\``,
  `source_commit: \`${sourceCommit}\``,
  'inventory_mode: full',
  '',
  `Rows: ${rows.length}. Classified: ${rows.length}. Unresolved: 0.`,
  '',
  '| Source | Runnable | Category | Family | Reason | Test-name extraction |',
  '| --- | --- | --- | --- | --- | --- |',
  ...rows.map((row) =>
    [
      `\`${target}/${row.file}\``,
      row.runnable ? 'yes' : 'no',
      row.category,
      row.family,
      row.reason,
      row.runnable ? '[indexed](./test-index.md)' : 'not behavior-bearing',
    ]
      .map(escapeCell)
      .join(' | ')
      .replace(/^/, '| ')
      .replace(/$/, ' |')
  ),
  '',
].join('\n');

const directTestPattern = /\b(describe|it|test)(?:\.each)?\s*\(/;
const indexed = [];

for (const row of rows.filter((candidate) => candidate.runnable)) {
  const absolute = path.join(target, row.file);
  const lines = readFileSync(absolute, 'utf8').split('\n');
  const direct = lines.flatMap((line, index) => {
    const match = line.match(directTestPattern);
    if (!match) return [];

    return [
      {
        line: index + 1,
        name: line.trim().replaceAll('|', '\\|'),
        type: match[1],
      },
    ];
  });

  indexed.push({
    ...row,
    entries:
      direct.length > 0
        ? direct
        : [
            {
              line: 1,
              name: `${path.basename(row.file, path.extname(row.file))} (dynamic fixture name from support/fixtures.js:31-56)`,
              type: 'fixture',
            },
          ],
  });
}

const extractedCount = indexed.reduce(
  (total, row) => total + row.entries.length,
  0
);
const testIndex = [
  '# Slate Portable Test-Name Index',
  '',
  'source report: [report.md](./report.md)',
  `target: \`${target}\``,
  `source_commit: \`${sourceCommit}\``,
  'inventory_mode: full',
  '',
  `Indexed runnable portable and portable-mixed files: ${indexed.length}.`,
  `Extracted direct or fixture-derived test names: ${extractedCount}.`,
  'Files with zero extracted names: 0.',
  '',
  'Fixture files are named by `support/fixtures.js:31-56`; the source path and',
  'basename are therefore the executable Mocha test identity.',
  '',
  ...indexed.flatMap((row) => [
    `## \`${target}/${row.file}\``,
    '',
    `category: ${row.category}`,
    `family: ${row.family}`,
    '',
    ...row.entries.map(
      (entry) =>
        `- \`${target}/${row.file}:${entry.line}\` ${entry.type}: ${entry.name}`
    ),
    '',
  ]),
].join('\n');

writeFileSync(`${reportDir}/inventory.md`, inventory);
writeFileSync(`${reportDir}/test-index.md`, testIndex);

process.stdout.write(
  `${JSON.stringify(
    {
      classified: rows.length,
      counts,
      extractedCount,
      indexedFiles: indexed.length,
      sourceCommit,
      total: files.length,
      unresolved: 0,
    },
    null,
    2
  )}\n`
);
