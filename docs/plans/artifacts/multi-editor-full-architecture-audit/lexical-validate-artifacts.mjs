import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const expectedCommit = 'd52f66e250e031a6c6fd8836d160373b0df557c7';
const lexicalRoot = '../lexical';
const artifactRoot =
  'docs/plans/artifacts/multi-editor-full-architecture-audit';
const harvestRoot = 'docs/editor-test-harvester/lexical';
const architecturePath = `${artifactRoot}/lexical-architecture-ledger.md`;
const manifestPath = `${artifactRoot}/lexical-source-manifest.json`;
const inventoryPath = `${harvestRoot}/inventory.md`;
const reportPath = `${harvestRoot}/report.md`;
const indexPath = `${harvestRoot}/test-index.md`;

function invariant(value, message) {
  if (!value) throw new Error(message);
}

function git(...args) {
  return execFileSync('git', ['-C', lexicalRoot, ...args], {
    encoding: 'utf8',
  }).trim();
}

function lineCount(path) {
  return readFileSync(path, 'utf8').split('\n').length;
}

const head = git('rev-parse', 'HEAD');
invariant(head === expectedCommit, `Lexical HEAD drifted: ${head}`);
invariant(git('status', '--porcelain') === '', 'Lexical checkout is dirty');
invariant(
  git('diff', '--name-status', `${expectedCommit}..HEAD`) === '',
  'Lexical architecture cursor is not an exact full-commit snapshot'
);

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const summary = manifest.summary;
const expectedSummary = {
  codeUnits: 881,
  declarations: 5132,
  excludedDeclarations: 862,
  excludedParseDiagnostics: 5,
  excludedUnits: 219,
  exportedDeclarations: 2385,
  mappedDeclarations: 4270,
  packageDirectories: 35,
  packageExportRecords: 130,
  packageRecords: 58,
  parseDiagnostics: 5,
  proofDeclarations: 401,
  relevantParseDiagnostics: 0,
  relevantUnits: 1424,
  runtimeDeclarations: 3009,
  trackedUnits: 1643,
  unexplainedDeclarations: 0,
  unexplainedUnits: 0,
};
for (const [key, expected] of Object.entries(expectedSummary)) {
  invariant(
    summary[key] === expected,
    `Manifest ${key}: expected ${expected}, received ${summary[key]}`
  );
}
invariant(
  Object.keys(manifest.concepts).length === 48,
  'Manifest must contain 48 atomic concepts'
);

const architecture = readFileSync(architecturePath, 'utf8');
const conceptRows = architecture.match(/^\|\s*`LX-[^`]+`\s*\|/gm) ?? [];
invariant(
  conceptRows.length === 48,
  `Ledger has ${conceptRows.length} concepts`
);
invariant(
  (architecture.match(/^## Material candidate:/gm) ?? []).length === 1,
  'Lexical lane must contain exactly one material candidate'
);

const citationFiles = [architecturePath, reportPath, inventoryPath, indexPath];
let lexicalCitations = 0;
let localCitations = 0;
let localPathReferences = 0;
for (const artifactPath of citationFiles) {
  const text = readFileSync(artifactPath, 'utf8');
  for (const match of text.matchAll(/`\.\.\/lexical\/([^`:\n]+):(\d+)`/g)) {
    const path = `${lexicalRoot}/${match[1]}`;
    const line = Number(match[2]);
    invariant(existsSync(path), `Missing Lexical citation: ${match[0]}`);
    invariant(
      line >= 1 && line <= lineCount(path),
      `Out-of-range Lexical citation: ${match[0]}`
    );
    lexicalCitations++;
  }
  for (const match of text.matchAll(
    /`((?:apps|docs|packages|playwright)\/[^`:\n]+):(\d+)`/g
  )) {
    const path = match[1];
    const line = Number(match[2]);
    invariant(existsSync(path), `Missing local citation: ${match[0]}`);
    invariant(
      line >= 1 && line <= lineCount(path),
      `Out-of-range local citation: ${match[0]}`
    );
    localCitations++;
  }
  for (const match of text.matchAll(
    /`((?:apps|docs|packages|playwright)\/[^`\n]+\.(?:md|mjs|ts|tsx))`/g
  )) {
    const path = match[1];
    invariant(existsSync(path), `Missing local path reference: ${match[0]}`);
    localPathReferences++;
  }
}

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

const inventory = readFileSync(inventoryPath, 'utf8');
const inventoryRows = [];
for (const line of inventory.split('\n')) {
  const match = line.match(
    /^\| `([^`]+)`\s+\| (yes|no)\s+\| (portable(?:-mixed)?|product-shell|harness|skip|uncertain)\s+\|/
  );
  if (match) {
    inventoryRows.push({
      category: match[3],
      path: match[1],
      runnable: match[2] === 'yes',
    });
  }
}
const storedTests = inventoryRows.map((row) => row.path).sort();
invariant(liveTests.length === 271, `Live test inventory: ${liveTests.length}`);
invariant(
  JSON.stringify(liveTests) === JSON.stringify(storedTests),
  'Stable inventory differs from live Lexical test inventory'
);

const counts = Object.fromEntries(
  [
    'portable',
    'portable-mixed',
    'product-shell',
    'harness',
    'skip',
    'uncertain',
  ].map((category) => [
    category,
    inventoryRows.filter((row) => row.category === category).length,
  ])
);
const runnable = inventoryRows.filter((row) => row.runnable).length;
const selected = inventoryRows.filter(
  (row) =>
    row.runnable &&
    (row.category === 'portable' || row.category === 'portable-mixed')
);
invariant(runnable === 196, `Runnable inventory: ${runnable}`);
invariant(
  inventoryRows.length - runnable === 75,
  'Fixture/support count drifted'
);
invariant(counts.portable === 124, 'Portable count drifted');
invariant(counts['portable-mixed'] === 13, 'Portable-mixed count drifted');
invariant(counts['product-shell'] === 33, 'Product-shell count drifted');
invariant(counts.harness === 12, 'Harness count drifted');
invariant(counts.skip === 89, 'Skip count drifted');
invariant(counts.uncertain === 0, 'Uncertain rows remain');

const index = readFileSync(indexPath, 'utf8');
const indexedFiles = [...index.matchAll(/^## `([^`]+)`$/gm)].map(
  (match) => match[1]
);
const indexedCalls =
  index.match(/^- `\.\.\/lexical\/[^`]+:\d+` (?:describe|it|test):/gm) ?? [];
invariant(indexedFiles.length === 137, `Indexed files: ${indexedFiles.length}`);
invariant(
  JSON.stringify(indexedFiles.sort()) ===
    JSON.stringify(selected.map((row) => row.path).sort()),
  'Portable test-name index differs from selected inventory'
);
invariant(
  indexedCalls.length === 2095,
  `Indexed test call sites: ${indexedCalls.length}`
);

const report = readFileSync(reportPath, 'utf8');
for (const heading of [
  '## License Gate',
  '## Confidence Score',
  '## Pass-State Ledger',
  '## Matrix',
  '## Skips',
  '## Next Slice',
  '## Full Inventory Appendix',
]) {
  invariant(report.includes(heading), `Report missing ${heading}`);
}
for (const path of [reportPath, inventoryPath, indexPath]) {
  invariant(
    readFileSync(path, 'utf8').includes(`source_commit: \`${expectedCommit}\``),
    `${path} lacks pinned source commit`
  );
}

console.log(
  JSON.stringify(
    {
      architectureConcepts: conceptRows.length,
      indexedCallSites: indexedCalls.length,
      indexedFiles: indexedFiles.length,
      lexicalCitations,
      localCitations,
      localPathReferences,
      manifest: expectedSummary,
      testInventory: {
        fixtureSupport: inventoryRows.length - runnable,
        ...counts,
        runnable,
        total: inventoryRows.length,
      },
    },
    null,
    2
  )
);
