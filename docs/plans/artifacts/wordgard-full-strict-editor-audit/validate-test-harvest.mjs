#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifactRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(artifactRoot, '../../../..');
const wordgardRoot = '/Users/zbeyens/git/wordgard';
const harvestRoot = resolve(repoRoot, 'docs/editor-test-harvester/wordgard');
const manifest = JSON.parse(
  readFileSync(resolve(artifactRoot, 'source-manifest.json'), 'utf8')
);
const inventoryDocument = readFileSync(
  resolve(harvestRoot, 'inventory.md'),
  'utf8'
);
const indexDocument = readFileSync(
  resolve(harvestRoot, 'test-index.md'),
  'utf8'
);
const reportDocument = readFileSync(resolve(harvestRoot, 'report.md'), 'utf8');
const requireFromWordgard = createRequire(
  resolve(wordgardRoot, 'package.json')
);
const ts = requireFromWordgard('typescript');

const trackedTestFiles = execFileSync(
  'git',
  ['-C', wordgardRoot, 'ls-files', 'test/*.ts'],
  { encoding: 'utf8' }
)
  .trim()
  .split('\n')
  .filter(Boolean)
  .sort();
const head = execFileSync('git', ['-C', wordgardRoot, 'rev-parse', 'HEAD'], {
  encoding: 'utf8',
}).trim();
const dirty = execFileSync(
  'git',
  ['-C', wordgardRoot, 'status', '--porcelain'],
  { encoding: 'utf8' }
).trim();

const fail = (message) => {
  throw new Error(message);
};
const equalLists = (actual, expected, label) => {
  if (
    actual.length !== expected.length ||
    actual.some((value, index) => value !== expected[index])
  ) {
    fail(
      `${label} mismatch\nactual=${JSON.stringify(
        actual
      )}\nexpected=${JSON.stringify(expected)}`
    );
  }
};
const sourceFacts = new Map(
  trackedTestFiles.map((file) => {
    const text = readFileSync(resolve(wordgardRoot, file), 'utf8');
    const sourceFile = ts.createSourceFile(
      file,
      text,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS
    );
    const callLines = [];
    const visit = (node) => {
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === 'it'
      ) {
        callLines.push(
          sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
            .line + 1
        );
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);

    return [
      file,
      {
        callLines,
        lines: text.match(/\n/g)?.length ?? 0,
      },
    ];
  })
);

if (head !== manifest.authority.head) {
  fail(
    `Wordgard HEAD drifted: manifest=${manifest.authority.head} current=${head}`
  );
}
if (dirty) fail(`Wordgard checkout is dirty:\n${dirty}`);

const inventoryRows = new Map();
for (const line of inventoryDocument.split(/\r?\n/)) {
  const match =
    /^\| `(?<file>test\/[^`]+)`\s+\|\s+(?<lines>\d+)\s+\|\s+(?<category>[a-z-]+)\s+\|/.exec(
      line
    );
  if (!match?.groups) continue;
  inventoryRows.set(match.groups.file, {
    category: match.groups.category,
    lines: Number(match.groups.lines),
  });
}
equalLists(
  [...inventoryRows.keys()].sort(),
  trackedTestFiles,
  'inventory file set'
);
for (const file of trackedTestFiles) {
  const row = inventoryRows.get(file);
  const fact = sourceFacts.get(file);
  if (row.lines !== fact.lines) {
    fail(
      `${file} line count mismatch: inventory=${row.lines} source=${fact.lines}`
    );
  }
}

const indexSections = new Map();
const lines = indexDocument.split(/\r?\n/);
let currentSection = null;
for (const line of lines) {
  const heading =
    /^## `(?<file>[^`]+)` — (?<category>[a-z-]+) — (?<count>\d+) call sites$/.exec(
      line
    );
  if (heading?.groups) {
    currentSection = {
      callLines: [],
      category: heading.groups.category,
      count: Number(heading.groups.count),
    };
    indexSections.set(`test/${heading.groups.file}`, currentSection);
    continue;
  }
  const call = /^- L(?<line>\d+):/.exec(line);
  if (call?.groups && currentSection) {
    currentSection.callLines.push(Number(call.groups.line));
  }
}
equalLists(
  [...indexSections.keys()].sort(),
  trackedTestFiles,
  'test-index file set'
);
for (const file of trackedTestFiles) {
  const section = indexSections.get(file);
  const inventory = inventoryRows.get(file);
  const fact = sourceFacts.get(file);
  if (section.category !== inventory.category) {
    fail(
      `${file} category mismatch: index=${section.category} inventory=${inventory.category}`
    );
  }
  if (section.count !== section.callLines.length) {
    fail(
      `${file} indexed count mismatch: heading=${section.count} rows=${section.callLines.length}`
    );
  }
  equalLists(section.callLines, fact.callLines, `${file} call-site lines`);
}

const categories = {};
for (const { category } of inventoryRows.values()) {
  categories[category] = (categories[category] ?? 0) + 1;
}
const expectedCategories = {
  harness: 3,
  'plate-owned': 3,
  portable: 15,
  'portable-mixed': 6,
};
for (const [category, count] of Object.entries(expectedCategories)) {
  if (categories[category] !== count) {
    fail(
      `category count mismatch for ${category}: actual=${categories[category]} expected=${count}`
    );
  }
}
if (Object.keys(categories).length !== Object.keys(expectedCategories).length) {
  fail(
    `unexpected categories: actual=${JSON.stringify(
      categories
    )} expected=${JSON.stringify(expectedCategories)}`
  );
}

const behaviorSection = reportDocument
  .split('## Behavior Matrix\n')[1]
  ?.split('\n## Coverage Search Evidence')[0];
if (!behaviorSection) fail('behavior matrix section is missing');
const behaviorIds = [...behaviorSection.matchAll(/^\| (W\d{2}) \|/gm)].map(
  (match) => match[1]
);
equalLists(
  behaviorIds,
  Array.from(
    { length: 33 },
    (_, index) => `W${String(index + 1).padStart(2, '0')}`
  ),
  'behavior matrix IDs'
);

for (const forbidden of [
  'Incremental provenance',
  'Incremental sync',
  'previous_source_commit=',
  'delta-complete=',
  'report-only refresh did not rerun',
]) {
  if (
    inventoryDocument.includes(forbidden) ||
    indexDocument.includes(forbidden) ||
    reportDocument.includes(forbidden)
  ) {
    fail(`stale incremental wording remains: ${forbidden}`);
  }
}
for (const required of [
  manifest.authority.head,
  '572/572',
  '733/733',
  'Full current-source rebuild',
]) {
  if (!reportDocument.includes(required)) {
    fail(`report lacks required full-audit evidence: ${required}`);
  }
}

const localEvidence = [
  ...reportDocument.matchAll(/`((?:packages|apps|benchmarks)\/[^`]+)`/g),
].map((match) => match[1]);
for (const token of localEvidence) {
  if (/[*{}]/.test(token)) {
    fail(`local evidence must name exact files, not globs: ${token}`);
  }
  const path = token.replace(/:\d+(?:-\d+)?$/, '');
  readFileSync(resolve(repoRoot, path));
}

const summary = {
  behaviorFamilies: behaviorIds.length,
  categories,
  files: trackedTestFiles.length,
  head,
  indexedCallSites: [...sourceFacts.values()].reduce(
    (count, fact) => count + fact.callLines.length,
    0
  ),
  lines: [...sourceFacts.values()].reduce(
    (count, fact) => count + fact.lines,
    0
  ),
  localEvidenceReferences: new Set(localEvidence).size,
};
process.stdout.write(`${JSON.stringify(summary)}\n`);
