import { existsSync } from 'node:fs';
import { basename, resolve } from 'node:path';

import { parsePackageManager, run } from '../shared/repo-compare.mjs';
import { writeBenchmarkArtifact } from '../shared/stats.mjs';

const currentRepo = process.cwd();
const defaultLegacyRepo =
  [
    resolve(currentRepo, '../slate'),
    resolve(currentRepo, '../../../slate'),
  ].find((candidate) => existsSync(resolve(candidate, 'package.json'))) ??
  resolve(currentRepo, '../slate');
const legacyRepo = resolve(
  currentRepo,
  process.env.SLATE_BROWSER_REPLAY_LEGACY_REPO || defaultLegacyRepo
);
const project = process.env.SLATE_BROWSER_REPLAY_PROJECT || 'chromium';
const artifactPath =
  'tmp/slate-browser-rich-text-replay-coverage-benchmark.json';
const listedTestPattern = /^\s+\[([^\]]+)] › (.+)$/;
const fileLocationPattern = /^(.+):(\d+):(\d+)$/;
const testFileSuffixPattern = /\.test\.ts$/;
const htmlTagPattern = /<([^>]+)>/g;
const slugSeparatorPattern = /[^a-z0-9]+/g;
const trimDashPattern = /^-+|-+$/g;

const targetFiles = Object.freeze([
  'integration/examples/richtext.test.ts',
  'integration/examples/tables.test.ts',
  'integration/examples/inlines.test.ts',
  'integration/examples/paste-html.test.ts',
]);

const fixtureFamilies = Object.freeze([
  ['ime', /ime|composition|korean|webkit composition/i],
  [
    'clipboard-paste',
    /paste|clipboard|insert data|html import|google docs|google sheets|quip|lexical/i,
  ],
  ['table-editing', /\btable\b|\btables\b|\bcell\b|\brow\b|table-cell/i],
  ['inline-boundary', /inline|link|url|padded/i],
  ['toolbar-formatting', /toolbar|heading|alignment|list|bold|mark/i],
  [
    'selection-navigation',
    /selection|caret|arrow|word movement|line extension|triple click/i,
  ],
  ['delete-backspace', /delete|backspace|word-delete|removes/i],
  ['undo-history', /undo/i],
  ['kernel-trace', /kernel|command|trace|repair|transition|proof-handle/i],
  ['gauntlet', /gauntlet|generated/i],
  ['native-input', /browser input|native|insert|typed|typing|text entry/i],
  ['focus-scroll', /focus|scroll|visible/i],
  ['rendering', /render|dom shape|strong|code|font-size/i],
]);

const currentPackageManager = await parsePackageManager(currentRepo);
const legacyPackageManager = await parsePackageManager(legacyRepo);

const currentTests = await listReplayTests(currentRepo, currentPackageManager);
const legacyTests = await listReplayTests(legacyRepo, legacyPackageManager);
const currentByKey = new Map(currentTests.map((test) => [test.key, test]));
const legacyByKey = new Map(legacyTests.map((test) => [test.key, test]));
const allKeys = [...new Set([...currentByKey.keys(), ...legacyByKey.keys()])]
  .filter(Boolean)
  .sort();

const rows = [
  ...createTestCoverageRows(allKeys, currentByKey, legacyByKey),
  ...createSuiteCoverageRows(currentTests, legacyTests),
];

const summary = {
  lane: 'browser-rich-text-replay-coverage-local',
  currentRepo,
  legacyRepo,
  generatedAt: new Date().toISOString(),
  config: {
    files: targetFiles,
    project,
  },
  counts: {
    currentTests: currentTests.length,
    legacyTests: legacyTests.length,
    unionTests: allKeys.length,
  },
  rows,
};

await writeBenchmarkArtifact(artifactPath, summary);

console.log(JSON.stringify(summary, null, 2));

async function listReplayTests(repo, packageManager) {
  const { command, args } = listCommandFor(packageManager);
  const result = await run(command, args, repo);

  return result.stdout
    .split('\n')
    .map((line) => parseListedTest(line))
    .filter((test) => test && targetFiles.includes(test.file))
    .map((test) => ({
      ...test,
      family: classifyFamily(`${test.suite} ${test.title}`),
      key: `${fileId(test.file)}/${slug(test.title)}`,
    }))
    .sort((left, right) => left.key.localeCompare(right.key));
}

function listCommandFor(packageManager) {
  if (packageManager === 'bun') {
    return {
      command: 'bunx',
      args: ['playwright', 'test', '--list', `--project=${project}`],
    };
  }

  if (packageManager === 'yarn') {
    return {
      command: 'yarn',
      args: ['playwright', 'test', '--list', `--project=${project}`],
    };
  }

  if (packageManager === 'pnpm') {
    return {
      command: 'pnpm',
      args: ['exec', 'playwright', 'test', '--list', `--project=${project}`],
    };
  }

  return {
    command: 'npx',
    args: ['playwright', 'test', '--list', `--project=${project}`],
  };
}

function parseListedTest(line) {
  const match = line.match(listedTestPattern);
  if (!match) return null;

  const projectName = match[1];
  const parts = match[2].split(' › ');
  const fileMatch = parts[0]?.match(fileLocationPattern);
  if (!fileMatch || parts.length < 3) return null;

  return {
    column: Number(fileMatch[3]),
    file: fileMatch[1],
    line: Number(fileMatch[2]),
    project: projectName,
    suite: parts.slice(1, -1).join(' / '),
    title: parts.at(-1) ?? '',
  };
}

function createTestCoverageRows(keys, currentByKey, legacyByKey) {
  const rows = [];

  for (const key of keys) {
    const current = currentByKey.get(key);
    const legacy = legacyByKey.get(key);
    const reference = current ?? legacy;

    rows.push(
      createReplayRow({
        fixture: key,
        library: 'slate-v2:browser-replay',
        note: current
          ? testNote(
              current,
              'listed in Slate v2 Chromium browser replay corpus'
            )
          : missingNote(reference, 'Slate v2'),
        status: current ? 'ok' : 'coverage-gap',
      })
    );
    rows.push(
      createReplayRow({
        fixture: key,
        library: 'slate:browser-replay',
        note: legacy
          ? testNote(legacy, 'listed in Slate Chromium browser replay corpus')
          : missingNote(reference, 'Slate'),
        status: legacy ? 'ok' : 'coverage-gap',
      })
    );
  }

  return rows;
}

function createSuiteCoverageRows(currentTests, legacyTests) {
  const currentSuites = summarizeSuites(currentTests);
  const legacySuites = summarizeSuites(legacyTests);
  const suiteIds = [
    ...new Set([...currentSuites.keys(), ...legacySuites.keys()]),
  ]
    .filter(Boolean)
    .sort();
  const rows = [];

  for (const suiteId of suiteIds) {
    const current = currentSuites.get(suiteId);
    const legacy = legacySuites.get(suiteId);

    rows.push(
      createReplayRow({
        category: 'slate-browser-rich-text-replay-suite-coverage',
        fixture: suiteId,
        library: 'slate-v2:browser-replay',
        note: suiteNote(current, 'Slate v2'),
        ops: current?.count ?? 0,
        status: current ? 'ok' : 'coverage-gap',
      })
    );
    rows.push(
      createReplayRow({
        category: 'slate-browser-rich-text-replay-suite-coverage',
        fixture: suiteId,
        library: 'slate:browser-replay',
        note: suiteNote(legacy, 'Slate'),
        ops: legacy?.count ?? 0,
        status: legacy ? 'ok' : 'coverage-gap',
      })
    );
  }

  return rows;
}

function createReplayRow({
  category = 'slate-browser-rich-text-replay-coverage',
  fixture,
  library,
  note,
  ops,
  status,
}) {
  return {
    category,
    fixture,
    library,
    note,
    ops: ops ?? (status === 'ok' ? 1 : 0),
    status,
  };
}

function summarizeSuites(tests) {
  const suites = new Map();

  for (const test of tests) {
    const suiteId = fileId(test.file);
    const suite = suites.get(suiteId) ?? {
      count: 0,
      families: new Set(),
      examples: [],
      file: test.file,
    };

    suite.count += 1;
    suite.families.add(test.family);
    if (suite.examples.length < 3) {
      suite.examples.push(test.title);
    }
    suites.set(suiteId, suite);
  }

  return suites;
}

function suiteNote(suite, library) {
  if (!suite) {
    return `${library} has no listed Chromium tests for this rich-text replay suite`;
  }

  return [
    `file=${suite.file}`,
    `tests=${suite.count}`,
    `families=${[...suite.families].sort().join(',')}`,
    `examples=${suite.examples.join(' | ')}`,
  ].join('; ');
}

function testNote(test, prefix) {
  return [
    prefix,
    `project=${test.project}`,
    `file=${test.file}`,
    `line=${test.line}`,
    `suite=${test.suite}`,
    `family=${test.family}`,
  ].join('; ');
}

function missingNote(reference, library) {
  if (!reference) {
    return `${library} does not list this Chromium browser replay fixture`;
  }

  return [
    `${library} does not list this Chromium browser replay fixture`,
    `referenceFile=${reference.file}`,
    `referenceLine=${reference.line}`,
    `suite=${reference.suite}`,
    `family=${reference.family}`,
  ].join('; ');
}

function classifyFamily(text) {
  for (const [family, pattern] of fixtureFamilies) {
    if (pattern.test(text)) {
      return family;
    }
  }

  return 'general-browser-editing';
}

function fileId(file) {
  return basename(file).replace(testFileSuffixPattern, '');
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(htmlTagPattern, '$1')
    .replace(slugSeparatorPattern, '-')
    .replace(trimDashPattern, '')
    .slice(0, 120);
}
