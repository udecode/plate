#!/usr/bin/env node

import { readFileSync } from 'node:fs';

const paths = {
  coverage: 'docs/plite/ledgers/issue-coverage-matrix.md',
  live: 'docs/slate-issues/gitcrawl-live-open-ledger.md',
  overlay: 'docs/slate-issues/gitcrawl-v2-sync-ledger.md',
  pr: 'docs/plite/references/pr-description.md',
};

const allowedBuckets = new Set([
  'already-accounted',
  'docs-examples',
  'ecosystem-boundary',
  'needs-repro',
  'skip-duplicate',
  'skip-invalid',
  'skip-maintainer-noise',
  'skip-stale',
  'v2-api-dx',
  'v2-clipboard-serialization',
  'v2-core-engine',
  'v2-dom-selection',
  'v2-input-runtime',
  'v2-performance-benchmark',
  'v2-react-runtime',
]);

const allowedStatuses = new Set([
  'cluster-synced',
  'fixes-claimed',
  'improves-claimed',
  'issue-reviewed',
  'not-claimed',
  'not-started',
  'triage-closed',
]);

const edgeLeadingPipePattern = /^\|\s*/;
const edgeTrailingPipePattern = /\s*\|$/;
const fixedClaimPattern = /^- Fixes #(\d+):/gm;
const issueNumberPattern = /#?(\d+)/;
const manualSyncColumnPattern = /V2 sync status|Action bucket|Proof owner/;
const markdownTableSplitPattern = /\s+\|\s+/;
const relatedIssueRowPattern = /^\| #\d+ \|/;
const rowsPattern = /^Rows:\s*(\d+)\s+open issues\./m;

const read = (path) => readFileSync(path, 'utf8');

const issueNumber = (value) => value.match(issueNumberPattern)?.[1];

const splitRow = (line) =>
  line
    .trim()
    .replace(edgeLeadingPipePattern, '')
    .replace(edgeTrailingPipePattern, '')
    .split(markdownTableSplitPattern);

const tableIssueRows = (text) =>
  text.split('\n').filter((line) => line.startsWith('| [#'));

const fixedClaims = (text) =>
  [...text.matchAll(fixedClaimPattern)].map((match) => match[1]);

const hardCount = (text, label) => {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`${escapedLabel}:\\s*\`?(\\d+)\`?`, 'i'));

  return match ? Number(match[1]) : undefined;
};

const fail = (message) => {
  failures.push(message);
};

const live = read(paths.live);
const overlay = read(paths.overlay);
const coverage = read(paths.coverage);
const pr = read(paths.pr);
const failures = [];

const liveDeclaredRows = Number(live.match(rowsPattern)?.[1]);
const liveRows = tableIssueRows(live);
const overlayRows = tableIssueRows(overlay);
const liveIssues = new Set(
  liveRows.map((line) => issueNumber(line)).filter(Boolean)
);
const overlayIssues = new Set(
  overlayRows.map((line) => issueNumber(line)).filter(Boolean)
);

if (liveRows.length !== liveDeclaredRows) {
  fail(
    `${paths.live}: declared ${liveDeclaredRows} rows but found ${liveRows.length}`
  );
}

if (overlayRows.length !== liveRows.length) {
  fail(
    `${paths.overlay}: found ${overlayRows.length} rows but live ledger has ${liveRows.length}`
  );
}

for (const issue of overlayIssues) {
  if (!liveIssues.has(issue)) {
    fail(
      `${paths.overlay}: #${issue} is not present in the generated live ledger`
    );
  }
}

if (manualSyncColumnPattern.test(live)) {
  fail(`${paths.live}: generated live ledger contains manual sync columns`);
}

for (const row of overlayRows) {
  const cells = splitRow(row);
  const issue = issueNumber(cells[0]);
  const bucket = cells[3];
  const status = cells[4];

  if (!allowedBuckets.has(bucket)) {
    fail(`${paths.overlay}: #${issue} has invalid action bucket '${bucket}'`);
  }

  if (!allowedStatuses.has(status)) {
    fail(`${paths.overlay}: #${issue} has invalid sync status '${status}'`);
  }
}

const coverageFixes = fixedClaims(coverage);
const prFixes = fixedClaims(pr);
const coverageFixSet = new Set(coverageFixes);
const prFixSet = new Set(prFixes);
const overlayStatusByIssue = new Map();

for (const row of overlayRows) {
  const cells = splitRow(row);
  const issue = issueNumber(cells[0]);
  const status = cells[4];
  overlayStatusByIssue.set(issue, status);

  if (status === 'fixes-claimed' && !coverageFixSet.has(issue)) {
    fail(
      `${paths.overlay}: #${issue} is fixes-claimed but missing from coverage`
    );
  }
}

for (const issue of coverageFixSet) {
  if (!overlayStatusByIssue.has(issue)) {
    fail(`${paths.coverage}: Fixes #${issue} is missing from ${paths.overlay}`);
    continue;
  }

  if (overlayStatusByIssue.get(issue) !== 'fixes-claimed') {
    fail(
      `${paths.coverage}: Fixes #${issue} maps to overlay status '${overlayStatusByIssue.get(
        issue
      )}', expected 'fixes-claimed'`
    );
  }
}

for (const issue of prFixSet) {
  if (!coverageFixSet.has(issue)) {
    fail(`${paths.pr}: Fixes #${issue} is missing from ${paths.coverage}`);
  }
}

for (const issue of coverageFixSet) {
  if (!prFixSet.has(issue)) {
    fail(`${paths.coverage}: Fixes #${issue} is missing from ${paths.pr}`);
  }
}

const prFixedCount = hardCount(pr, 'Fixed issue claims');

if (prFixedCount !== undefined && prFixedCount !== coverageFixes.length) {
  fail(
    `${paths.pr}: fixed count says ${prFixedCount}, coverage has ${coverageFixes.length}`
  );
}

const coverageRelatedRows = coverage
  .split('\n')
  .filter((line) => relatedIssueRowPattern.test(line)).length;
const prRelatedCount = hardCount(pr, 'Related issue matrix rows');

if (prRelatedCount !== undefined && prRelatedCount !== coverageRelatedRows) {
  fail(
    `${paths.pr}: related count says ${prRelatedCount}, coverage has ${coverageRelatedRows}`
  );
}

if (failures.length > 0) {
  console.error('[slate-issues-ledger-check] failed');

  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  process.exit(1);
}

console.log(
  `[slate-issues-ledger-check] ok: ${liveRows.length} live rows, ${overlayRows.length} sync rows, ${coverageFixes.length} fixed claims, ${coverageRelatedRows} related rows`
);
