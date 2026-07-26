#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = 'docs/editor-issue-harvester/wordgard/full';
const classified = JSON.parse(
  readFileSync(path.join(root, 'classified-issues.json'), 'utf8')
);

const rows = classified.map((issue) => ({
  checkmark: '[ ]',
  closureKind: 'needs-issue-audit',
  closureState: 'unchecked',
  cluster: issue.cluster,
  command: issue.command,
  disposition: issue.disposition,
  exactTest: '',
  issue: issue.number,
  matrixKey: issue.matrixKey,
  metadataReview: issue.refreshStatus ?? '',
  owner: issue.owner,
  proofKind: issue.proofKind,
  reason: issue.reason,
  relevant: true,
  state: issue.state,
  title: issue.title,
  url: issue.url,
}));

const columns = [
  'check',
  'issue',
  'state',
  'relevant',
  'closureKind',
  'disposition',
  'cluster',
  'matrixKey',
  'owner',
  'proofKind',
  'exactTest',
  'command',
  'metadataReview',
  'title',
  'url',
  'reason',
];
const clean = (value) =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .replace(/\t/g, ' ');
const tsv = [
  columns.join('\t'),
  ...rows.map((row) =>
    [
      row.checkmark,
      row.issue,
      row.state,
      row.relevant ? 'yes' : 'no',
      row.closureKind,
      row.disposition,
      row.cluster,
      row.matrixKey,
      row.owner,
      row.proofKind,
      row.exactTest,
      row.command,
      row.metadataReview,
      row.title,
      row.url,
      row.reason,
    ]
      .map(clean)
      .join('\t')
  ),
];
writeFileSync(
  path.join(root, 'issue-closure-ledger.tsv'),
  `${tsv.join('\n')}\n`
);

const markdown = [
  '# Wordgard Issue Closure Ledger',
  '',
  'status: open',
  'source: `docs/editor-issue-harvester/wordgard/full/classified-issues.tsv`',
  '',
  'This refresh-only ledger preserves all current issue numbers as unchecked.',
  'No issue was hydrated, classified, or used to create a local test.',
  '',
  '## Counts',
  '',
  '| Bucket | Count |',
  '| --- | ---: |',
  `| unclassified | ${rows.length} |`,
  `| unchecked relevant | ${rows.length} |`,
  `| metadata review flagged | ${rows.filter((row) => row.metadataReview).length} |`,
  '',
  '## Next Unchecked Relevant Issues',
  '',
  '| Check | Issue | State | Title |',
  '| --- | ---: | --- | --- |',
  ...rows
    .slice(0, 50)
    .map(
      (row) =>
        `| ${row.checkmark} | #${row.issue} | ${row.state} | ${row.title.replace(/\|/g, '\\|')} |`
    ),
  '',
  'Full ledger: `issue-closure-ledger.tsv`.',
  '',
];
writeFileSync(path.join(root, 'issue-closure-ledger.md'), markdown.join('\n'));

console.log(
  JSON.stringify({ total: rows.length, uncheckedRelevant: rows.length })
);
