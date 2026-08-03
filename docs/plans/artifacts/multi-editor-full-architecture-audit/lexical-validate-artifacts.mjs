import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

import { validateConceptMatrix } from '../../../../.agents/rules/editor-audit/scripts/validate-concept-matrix.mjs';

const commit = 'dd5c41b13193efa9ab1574234d8593d2c9e4f988';
const priorCommit = 'd52f66e250e031a6c6fd8836d160373b0df557c7';
const lexicalRoot = '../lexical';
const artifactRoot =
  'docs/plans/artifacts/multi-editor-full-architecture-audit';
const harvestRoot = 'docs/editor-test-harvester/lexical';
const paths = {
  architecture: `${artifactRoot}/lexical-architecture-ledger.md`,
  conceptManifest: `${artifactRoot}/lexical-concept-manifest.json`,
  conceptMatrix: `${artifactRoot}/lexical-concept-matrix.md`,
  inventory: `${harvestRoot}/inventory.md`,
  report: `${harvestRoot}/report.md`,
  sourceManifest: `${artifactRoot}/lexical-source-manifest.json`,
  testIndex: `${harvestRoot}/test-index.md`,
};

const invariant = (condition, message) => {
  if (!condition) throw new Error(message);
};
const read = (path) => readFileSync(path, 'utf8');
const git = (...args) =>
  execFileSync('git', ['-C', lexicalRoot, ...args], {
    encoding: 'utf8',
  }).trim();
const lineCount = (path) => read(path).split('\n').length;

invariant(git('rev-parse', 'HEAD') === commit, 'Lexical HEAD drifted');
invariant(git('status', '--porcelain') === '', 'Lexical checkout is dirty');
invariant(git('branch', '--show-current') === 'main', 'Lexical branch drifted');
invariant(
  git('rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}') ===
    'origin/main',
  'Lexical upstream drifted'
);
invariant(
  git('merge-base', '--is-ancestor', priorCommit, commit) === '',
  'Lexical prior cursor is not an ancestor'
);

const source = JSON.parse(read(paths.sourceManifest));
const summary = source.summary;
invariant(
  source.repository.commit === commit,
  'Source manifest cursor drifted'
);
invariant(
  summary.trackedUnits === summary.relevantUnits + summary.excludedUnits,
  'Source unit accounting does not close'
);
invariant(
  summary.declarations ===
    summary.mappedDeclarations + summary.excludedDeclarations,
  'Declaration accounting does not close'
);
invariant(summary.unexplainedUnits === 0, 'Unexplained source units remain');
invariant(
  summary.unexplainedDeclarations === 0,
  'Unexplained declarations remain'
);
invariant(
  Object.keys(source.concepts).length === 59,
  'Source concept count drifted'
);
invariant(
  Object.values(summary.byConcept).every((count) => count > 0),
  'A source concept has no mapped source unit'
);

const architecture = read(paths.architecture);
for (const id of Object.keys(source.concepts)) {
  invariant(architecture.includes(`\`${id}\``), `Ledger misses ${id}`);
}
invariant(
  (architecture.match(/^## Material candidate /gm) ?? []).length === 2,
  'Lexical lane must contain exactly two material candidates'
);

const conceptManifest = JSON.parse(read(paths.conceptManifest));
const conceptMatrixResult = validateConceptMatrix({
  ledger: read(paths.conceptMatrix),
  manifest: conceptManifest,
});
invariant(
  conceptMatrixResult.concepts === 73,
  'Canonical concept count drifted'
);
invariant(
  conceptMatrixResult.priorities.P1.count === 1 &&
    conceptMatrixResult.priorities.P2.count === 1,
  'Canonical material set must be one P1 and one P2'
);

const testPattern =
  /(^|\/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(\/|$)|\.(test|spec)\.[cm]?[jt]sx?$/;
const ignoredTestPattern =
  /(^|\/)(dist|build|coverage|node_modules|vendor|fixtures\/generated|__snapshots__)(\/|$)/;
const liveTests = execFileSync('rg', ['--files', lexicalRoot], {
  encoding: 'utf8',
})
  .trim()
  .split('\n')
  .filter((path) => testPattern.test(path) && !ignoredTestPattern.test(path))
  .sort();
const inventory = read(paths.inventory);
const inventoryRows = [
  ...inventory.matchAll(
    /^\| `([^`]+)`\s+\| (yes|no)\s+\| (portable(?:-mixed)?|product-shell|harness|skip|uncertain)\s+\|/gm
  ),
].map((match) => ({
  category: match[3],
  path: match[1],
  runnable: match[2] === 'yes',
}));
invariant(
  JSON.stringify(inventoryRows.map((row) => row.path).sort()) ===
    JSON.stringify(liveTests),
  'Stable inventory differs from live Lexical tests'
);
invariant(
  inventoryRows.every((row) => row.category !== 'uncertain'),
  'Uncertain test rows remain'
);
const selected = inventoryRows.filter(
  (row) =>
    row.runnable &&
    (row.category === 'portable' || row.category === 'portable-mixed')
);
const index = read(paths.testIndex);
const indexedFiles = [...index.matchAll(/^## `([^`]+)`$/gm)].map(
  (match) => match[1]
);
const indexedCalls =
  index.match(/^- `\.\.\/lexical\/[^`]+:\d+` (?:describe|it|test):/gm) ?? [];
invariant(
  JSON.stringify(indexedFiles.sort()) ===
    JSON.stringify(selected.map((row) => row.path).sort()),
  'Portable test index differs from selected inventory'
);
invariant(indexedCalls.length === 4212, 'Indexed call-site count drifted');
for (const path of [paths.report, paths.inventory, paths.testIndex]) {
  invariant(read(path).includes(commit), `${path} lacks current test cursor`);
}

const issue = JSON.parse(
  read('docs/editor-issue-harvester/lexical/full/issue-refresh.json')
);
const classified = JSON.parse(
  read('docs/editor-issue-harvester/lexical/full/classified-issues.json')
);
invariant(
  classified.length === issue.resultingLedgerCount,
  'Issue ledger total drifted'
);
invariant(
  issue.providerIssueCount === issue.resultingLedgerCount,
  'Issue provider coverage is incomplete'
);
invariant(
  issue.hostVerification.openIssueCount +
    issue.hostVerification.closedIssueCount ===
    issue.resultingLedgerCount,
  'Issue state counts do not close'
);

const registry = JSON.parse(read('docs/editor-audits/index.json'));
const registered = registry.audits
  .find((audit) => audit.id === 'wordgard-lexical-prosemirror-full')
  ?.references.find(
    (reference) => reference.repoKey === 'github.com/facebook/lexical'
  );
invariant(registered?.auditedCommit === commit, 'Registry cursor drifted');
invariant(registered?.testHarvestCommit === commit, 'Test cursor drifted');
invariant(
  registered?.conceptManifest === paths.conceptManifest,
  'Concept manifest is not registered'
);
invariant(
  registered?.conceptMatrix === paths.conceptMatrix,
  'Concept matrix is not registered'
);
invariant(
  registered?.issueHarvestCheckedAt === issue.refreshedAt,
  'Issue cursor drifted'
);

let _lexicalCitations = 0;
let _localCitations = 0;
for (const artifactPath of [
  paths.architecture,
  paths.conceptMatrix,
  paths.testIndex,
]) {
  const text = read(artifactPath);
  for (const match of text.matchAll(/`\.\.\/lexical\/([^`:\n]+):(\d+)`/g)) {
    const path = `${lexicalRoot}/${match[1]}`;
    const line = Number(match[2]);
    invariant(existsSync(path), `Missing Lexical citation ${match[0]}`);
    invariant(
      line >= 1 && line <= lineCount(path),
      `Out-of-range Lexical citation ${match[0]}`
    );
    _lexicalCitations++;
  }
  for (const match of text.matchAll(
    /`((?:apps|docs|packages)\/[^`:\n]+):(\d+)`/g
  )) {
    const path = match[1];
    const line = Number(match[2]);
    invariant(existsSync(path), `Missing local citation ${match[0]}`);
    invariant(
      line >= 1 && line <= lineCount(path),
      `Out-of-range local citation ${match[0]}`
    );
    _localCitations++;
  }
}
