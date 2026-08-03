#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifactRoot = dirname(fileURLToPath(import.meta.url));
const root = resolve(artifactRoot, '../../../..');
const wordgardRoot = resolve(root, '../wordgard');
const harvestRoot = resolve(root, 'docs/editor-test-harvester/wordgard');
const coverage = JSON.parse(
  readFileSync(resolve(artifactRoot, 'wordgard-source-coverage.json'), 'utf8')
);
const inventory = readFileSync(resolve(harvestRoot, 'inventory.md'), 'utf8');
const index = readFileSync(resolve(harvestRoot, 'test-index.md'), 'utf8');
const report = readFileSync(resolve(harvestRoot, 'report.md'), 'utf8');
const requireFromWordgard = createRequire(
  resolve(wordgardRoot, 'package.json')
);
const ts = requireFromWordgard('typescript');
const LINE_PATTERN = /\n/g;
const BEHAVIOR_ID_PATTERN = /^\| (W\d{2}) \|/gm;

const fail = (message) => {
  throw new Error(message);
};
const head = execFileSync('git', ['rev-parse', 'HEAD'], {
  cwd: wordgardRoot,
  encoding: 'utf8',
}).trim();
const dirty = execFileSync('git', ['status', '--porcelain'], {
  cwd: wordgardRoot,
  encoding: 'utf8',
}).trim();
if (head !== coverage.authority.head || dirty !== '') {
  fail(
    `Wordgard harvest authority drift: head=${head} dirty=${Boolean(dirty)}`
  );
}

const files = execFileSync('git', ['ls-files', 'test/*.ts'], {
  cwd: wordgardRoot,
  encoding: 'utf8',
})
  .trim()
  .split('\n')
  .filter(Boolean)
  .sort();
let lines = 0;
let callSites = 0;
for (const file of files) {
  const text = readFileSync(resolve(wordgardRoot, file), 'utf8');
  lines += text.match(LINE_PATTERN)?.length ?? 0;
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'it'
    ) {
      callSites++;
    }
    ts.forEachChild(node, visit);
  };
  visit(source);

  for (const document of [inventory, index]) {
    if (!document.includes(file.slice('test/'.length))) {
      fail(`${file} is absent from a harvest document`);
    }
  }
}
if (files.length !== 27 || lines !== 6039 || callSites !== 644) {
  fail(
    `harvest counts drifted: files=${files.length} lines=${lines} callSites=${callSites}`
  );
}

const behaviorSection = report
  .split('## Behavior Matrix\n')[1]
  ?.split('\n## Coverage Search Evidence')[0];
if (!behaviorSection) fail('behavior matrix section is missing');
const behaviorIds = [...behaviorSection.matchAll(BEHAVIOR_ID_PATTERN)].map(
  ([, id]) => id
);
const expectedIds = Array.from(
  { length: 33 },
  (_, indexValue) => `W${String(indexValue + 1).padStart(2, '0')}`
);
if (JSON.stringify(behaviorIds) !== JSON.stringify(expectedIds)) {
  fail(`behavior IDs drifted: ${behaviorIds.join(',')}`);
}
const currentEvidence = [
  head,
  '27 files, 6,039 lines, 644',
  '572/572 passed against the ignored `dist` snapshot',
  '733/733 passed against the same snapshot',
  'byte-for-byte the build of `01eb2b5`',
  'green counts prove the retained snapshot',
  'current `c715d4d` source behavior',
  'git diff --name-status 01eb2b5..c715d4d -- test` is empty',
];
for (const value of currentEvidence) {
  if (!report.includes(value)) fail(`harvest report lacks: ${value}`);
}
const behaviorHeader = report
  .split('\n')
  .find((line) => line.startsWith('| ID  | Wordgard source'));
const behaviorSeparator = report
  .split('\n')
  .find((line) => line.startsWith('| --- | --------------------------------'));
const cellCount = (line) => line.split('|').length - 2;
if (
  !behaviorHeader ||
  !behaviorSeparator ||
  cellCount(behaviorHeader) !== 7 ||
  cellCount(behaviorSeparator) !== 7
) {
  fail('behavior matrix header/separator parity is invalid');
}

process.stdout.write(
  `${JSON.stringify({ behaviorFamilies: 33, callSites, files: 27, head, lines })}\n`
);
