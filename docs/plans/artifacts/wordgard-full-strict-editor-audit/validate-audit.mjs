#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateConceptMatrix } from '../../../../.agents/rules/editor-audit/scripts/validate-concept-matrix.mjs';
import { comparisonRows } from './comparison-data.mjs';

const artifactRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(artifactRoot, '../../../..');
const wordgardRoot = '/Users/zbeyens/git/wordgard';
const readArtifact = (name) =>
  readFileSync(resolve(artifactRoot, name), 'utf8');
const manifest = JSON.parse(readArtifact('source-manifest.json'));
const matrix = readArtifact('concept-matrix.md');
const report = readArtifact('audit-report.md');
const dossier = readArtifact('material-dossiers.md');
const issueLane = readArtifact('issue-lane.md');
const livePlite = JSON.parse(readArtifact('live-plite-source-manifest.json'));
const livePlate = JSON.parse(readArtifact('live-plate-coverage-manifest.json'));
const registry = JSON.parse(
  readFileSync(resolve(repoRoot, 'docs/editor-audits/index.json'), 'utf8')
);
const fail = (message) => {
  throw new Error(message);
};
const sha256 = (content) => createHash('sha256').update(content).digest('hex');
const verifyInventoryFiles = (files, root, label) => {
  for (const file of files) {
    const path = resolve(root, file.path);
    if (!existsSync(path)) fail(`${label} file is missing: ${file.path}`);
    const content = readFileSync(path);
    if (sha256(content) !== file.sha256) {
      fail(`${label} file hash drifted: ${file.path}`);
    }
  }
};

const wordgardHead = execFileSync(
  'git',
  ['-C', wordgardRoot, 'rev-parse', 'HEAD'],
  { encoding: 'utf8' }
).trim();
const wordgardDirty = execFileSync(
  'git',
  ['-C', wordgardRoot, 'status', '--porcelain'],
  { encoding: 'utf8' }
).trim();
const localHead = execFileSync('git', ['rev-parse', 'HEAD'], {
  cwd: repoRoot,
  encoding: 'utf8',
}).trim();

if (wordgardDirty) fail(`Wordgard checkout is dirty:\n${wordgardDirty}`);
if (wordgardHead !== manifest.authority.head) {
  fail(
    `Wordgard HEAD drift: current=${wordgardHead} manifest=${manifest.authority.head}`
  );
}
if (
  localHead !== livePlite.provenance.head ||
  localHead !== livePlate.repositoryHead
) {
  fail(
    `local source cursor drift: current=${localHead} Plite=${livePlite.provenance.head} Plate=${livePlate.repositoryHead}`
  );
}
verifyInventoryFiles(manifest.files, wordgardRoot, 'Wordgard manifest');
verifyInventoryFiles(livePlite.entries, repoRoot, 'Plite inventory');
verifyInventoryFiles(livePlate.files, repoRoot, 'Plate inventory');
for (const key of [
  'parseDiagnostics',
  'unexplainedDeclarations',
  'unexplainedFiles',
]) {
  if (manifest.summary[key] !== 0) {
    fail(`source manifest ${key} must be zero`);
  }
}
if (
  manifest.summary.mappedDeclarations +
    manifest.summary.excludedDeclarations !==
    manifest.summary.declarations ||
  manifest.summary.mappedFiles + manifest.summary.excludedFiles !==
    manifest.summary.files
) {
  fail('source manifest accounting does not reconcile');
}

const matrixResult = validateConceptMatrix({ ledger: matrix, manifest });
if (
  matrixResult.concepts !== comparisonRows.length ||
  matrixResult.rows !== comparisonRows.length
) {
  fail('matrix row count does not match comparison data');
}

const assertEvidencePath = (token, root, conceptId) => {
  const match = /^(?<path>.+?)(?::(?<start>\d+)(?:-(?<end>\d+))?)?$/.exec(
    token
  );
  const path = resolve(root, match.groups.path);
  if (!existsSync(path)) {
    fail(`${conceptId} evidence path is missing: ${token}`);
  }
  if (!match.groups.start) return;
  const lineCount = readFileSync(path, 'utf8').split(/\r?\n/).length;
  const start = Number(match.groups.start);
  const end = Number(match.groups.end ?? start);
  if (start < 1 || end < start || end > lineCount) {
    fail(
      `${conceptId} evidence range is invalid: ${token} (file has ${lineCount} lines)`
    );
  }
};

for (const row of comparisonRows) {
  for (const token of row.referenceEvidence.split(/;\s*/)) {
    assertEvidencePath(
      token.replace(/^\.\.\/wordgard\//, ''),
      wordgardRoot,
      row.id
    );
  }
  for (const mapping of [row.plite, row.plate]) {
    for (const match of (mapping.evidence ?? '').matchAll(/`([^`]+)`/g)) {
      assertEvidencePath(match[1], repoRoot, row.id);
    }
  }
}

const classificationOrder = [
  'reference stronger',
  'Plite stronger',
  'Plate stronger',
  'Plite/Plate stack stronger',
  'equivalent',
  'different tradeoff',
  'insufficient evidence',
];
const preferredOrder = [
  'reference',
  'Plite',
  'Plate',
  'Plite/Plate stack',
  'tie',
  'different tradeoff',
  'insufficient evidence',
];
const parseReportLedger = (start, end) => {
  const section = report.split(start)[1]?.split(end)[0];
  if (!section) fail(`report section is missing: ${start.trim()}`);
  const result = new Map();
  for (const match of section.matchAll(
    /^\|\s*(?<name>[^|]+?)\s*\|\s*(?<count>\d+)\s*\|\s*(?<ids>.+?)\s*\|$/gm
  )) {
    result.set(match.groups.name, {
      count: Number(match.groups.count),
      ids: [...match.groups.ids.matchAll(/`([^`]+)`/g)].map(
        (idMatch) => idMatch[1]
      ),
    });
  }

  return result;
};
const reportClassifications = parseReportLedger(
  '## Classification ledger\n',
  '\n## Preferred implementation ledger'
);
const reportPreferred = parseReportLedger(
  '## Preferred implementation ledger\n',
  '\n## Where the local stack is strongest'
);
for (const [key, order, actual] of [
  ['classification', classificationOrder, reportClassifications],
  ['preferred', preferredOrder, reportPreferred],
]) {
  for (const value of order) {
    const expectedIds = comparisonRows
      .filter((row) => row[key] === value)
      .map((row) => row.id);
    const entry = actual.get(value);
    if (
      !entry ||
      entry.count !== expectedIds.length ||
      JSON.stringify(entry.ids) !== JSON.stringify(expectedIds)
    ) {
      fail(`report ${key} ledger mismatch for ${value}`);
    }
  }
}

const materialIds = comparisonRows
  .filter((row) => row.priority !== '—')
  .map((row) => row.id);
for (const id of materialIds) {
  if (!dossier.includes(`\`${id}\``)) {
    fail(`material dossier does not cover ${id}`);
  }
}
for (const heading of [
  '### Current public shape',
  '### Proposed public shape',
  '### Current internal shape',
  '### Proposed internal shape',
  '### Adoption, deletion, and proof impact',
  '### Route',
  '### Exit gate',
]) {
  if (!dossier.includes(heading)) fail(`dossier lacks ${heading}`);
}
for (const [id, anchor] of [
  ['WG-VIEW-011', 'clipboard-benchmark-contract-repair'],
  ['WG-PROOF-004', 'mobile-input-phase-proof'],
  ['WG-VIEW-009', 'mobile-input-phase-proof'],
  ['WG-VIEW-010B', 'mobile-input-phase-proof'],
]) {
  const row = matrix
    .split(/\r?\n/)
    .find((line) => line.startsWith(`| \`${id}\``));
  if (!row?.includes(`material-dossiers.md#${anchor}`)) {
    fail(`${id} does not link its owning material dossier`);
  }
}
if (
  !issueLane.includes('Status: `null`, stale, unsupported provider.') ||
  !issueLane.includes('issueHarvestCheckedAt`: `null') ||
  !issueLane.includes('issueLedger`: `null')
) {
  fail('unsupported issue lane is not recorded honestly');
}

const testHarvest = JSON.parse(
  execFileSync(
    process.execPath,
    [resolve(artifactRoot, 'validate-test-harvest.mjs')],
    { cwd: repoRoot, encoding: 'utf8' }
  ).trim()
);
if (
  testHarvest.files !== 27 ||
  testHarvest.lines !== 6039 ||
  testHarvest.indexedCallSites !== 644 ||
  testHarvest.behaviorFamilies !== 33
) {
  fail('test-harvest accounting mismatch');
}

const audit = registry.audits.find(
  (candidate) => candidate.id === 'wordgard-full-strict'
);
if (!audit) fail('registry lacks wordgard-full-strict');
const reference = audit.references?.[0];
const expectedRegistry = {
  artifact:
    'docs/plans/artifacts/wordgard-full-strict-editor-audit/audit-report.md',
  auditedCommit: manifest.authority.head,
  conceptManifest:
    'docs/plans/artifacts/wordgard-full-strict-editor-audit/source-manifest.json',
  conceptMatrix:
    'docs/plans/artifacts/wordgard-full-strict-editor-audit/concept-matrix.md',
  issueHarvestCheckedAt: null,
  issueLedger: null,
  testHarvestCommit: manifest.authority.head,
};
for (const [key, value] of Object.entries(expectedRegistry)) {
  const actual = key === 'artifact' ? audit.artifact : reference?.[key];
  if (actual !== value) {
    fail(`registry ${key} mismatch: actual=${actual} expected=${value}`);
  }
}
if (!reference.conceptMatrixValidatedAt) {
  fail('registry conceptMatrixValidatedAt is missing');
}
for (const path of [
  audit.artifact,
  reference.conceptManifest,
  reference.conceptMatrix,
]) {
  if (!existsSync(resolve(repoRoot, path))) {
    fail(`registry artifact is missing: ${path}`);
  }
}

const rootScripts = JSON.parse(
  readFileSync(resolve(repoRoot, 'package.json'), 'utf8')
).scripts;
if (
  rootScripts?.['test:mobile-device-proof'] ||
  rootScripts?.['test:mobile-device-proof:raw']
) {
  fail(
    'dossier proof-runner finding is stale: a root mobile proof script exists'
  );
}
if (
  existsSync(
    resolve(
      repoRoot,
      'tooling/plite/packages/browser/src/core/release-proof.ts'
    )
  )
) {
  fail(
    'dossier proof-runner finding is stale: broken donor import now resolves'
  );
}
for (const [label, pattern] of [
  ['Strict Plite handoff: not green', /Strict Plite handoff: not green/],
  ['getOptions()', /getOptions\(\)/],
  ['Chromium closure did not run', /Chromium closure\s+did not run/],
]) {
  if (!pattern.test(report)) {
    fail(`report omits strict-gate evidence: ${label}`);
  }
}

process.stdout.write(
  `${JSON.stringify({
    classificationCounts: Object.fromEntries(
      classificationOrder.map((key) => [
        key,
        matrixResult.classifications[key].count,
      ])
    ),
    concepts: matrixResult.concepts,
    issueLane: 'null-stale-unsupported',
    localHead,
    localPreferred: comparisonRows.filter((row) =>
      ['Plite', 'Plate', 'Plite/Plate stack'].includes(row.preferred)
    ).length,
    materialIds,
    matrixIntegrity: matrixResult.integrity,
    registry: audit.id,
    testHarvest,
    wordgardHead,
  })}\n`
);
