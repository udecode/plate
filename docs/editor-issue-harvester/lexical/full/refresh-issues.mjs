#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const root = 'docs/editor-issue-harvester/lexical/full';
const classifiedPath = `${root}/classified-issues.json`;
const refreshedAt = new Date().toISOString();
const rows = JSON.parse(readFileSync(classifiedPath, 'utf8'));
const byNumber = new Map(rows.map((row) => [row.number, row]));
const live = [];
let cursor = null;

do {
  const query = `query($cursor:String) {
    repository(owner:"facebook", name:"lexical") {
      issues(first:100, after:$cursor, orderBy:{field:CREATED_AT,direction:ASC}) {
        nodes { number state title updatedAt url labels(first:100) { nodes { name } } }
        pageInfo { endCursor hasNextPage }
      }
    }
  }`;
  const args = ['api', 'graphql', '-f', `query=${query}`];
  if (cursor) args.push('-f', `cursor=${cursor}`);
  const response = JSON.parse(
    execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
  );
  const page = response.data.repository.issues;
  live.push(
    ...page.nodes.map((row) => ({
      ...row,
      labels: row.labels.nodes.map((label) => label.name).sort(),
    }))
  );
  cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
} while (cursor);

const added = [];
const changed = [];
for (const current of live) {
  let row = byNumber.get(current.number);
  if (!row) {
    row = {
      number: current.number,
      state: current.state,
      title: current.title,
      url: current.url,
      labels: current.labels,
      updatedAt: current.updatedAt,
      action: 'review-later',
      cluster: 'unclassified',
      command: 'issue-harvester facebook/lexical --state all --continue',
      disposition: 'unclassified',
      matrixKey: 'Pending issue-harvester classification',
      owner: 'unknown',
      proofKind: 'pending',
      reason: 'Added by refresh-only; not hydrated or classified.',
      refreshStatus: 'added-unchecked',
      lastMetadataRefreshAt: refreshedAt,
    };
    rows.push(row);
    byNumber.set(row.number, row);
    added.push(row.number);
    continue;
  }

  const fields = ['state', 'title', 'url', 'updatedAt', 'labels'].filter(
    (field) => JSON.stringify(row[field]) !== JSON.stringify(current[field])
  );
  Object.assign(row, current);
  if (fields.length > 0) {
    row.refreshStatus = 'metadata-changed-needs-reread';
    row.metadataChangedFields = fields;
    row.lastMetadataRefreshAt = refreshedAt;
    changed.push({ fields, number: row.number });
  }
}

const liveNumbers = new Set(live.map((row) => row.number));
const missing = rows.filter((row) => !liveNumbers.has(row.number));
if (missing.length > 0) {
  throw new Error(
    `GraphQL omitted stored issues: ${missing
      .slice(0, 20)
      .map((row) => row.number)
      .join(', ')}`
  );
}
rows.sort((left, right) => left.number - right.number);
writeFileSync(classifiedPath, `${JSON.stringify(rows, null, 2)}\n`);

const columns = [
  'number',
  'state',
  'disposition',
  'cluster',
  'matrixKey',
  'owner',
  'proofKind',
  'action',
  'command',
  'refreshStatus',
  'metadataChangedFields',
  'title',
  'url',
  'reason',
];
const clean = (value) => String(value ?? '').replace(/\s+/g, ' ');
writeFileSync(
  `${root}/classified-issues.tsv`,
  `${[
    columns.join('\t'),
    ...rows.map((row) =>
      columns
        .map((column) =>
          clean(
            column === 'metadataChangedFields'
              ? row.metadataChangedFields?.join(',')
              : row[column]
          )
        )
        .join('\t')
    ),
  ].join('\n')}\n`
);

const raw = JSON.stringify(live);
const rawSha256 = createHash('sha256').update(raw).digest('hex');
const openIssueCount = live.filter((row) => row.state === 'OPEN').length;
const closedIssueCount = live.length - openIssueCount;
const refresh = {
  schemaVersion: 1,
  repository: 'facebook/lexical',
  provider: 'GitHub GraphQL v4',
  rawCommand:
    'gh api graphql paginated repository.issues(first:100, orderBy:CREATED_AT ASC)',
  stateCoverage: 'all',
  providerLimit: null,
  providerLimitReached: false,
  refreshedAt,
  rawPath: null,
  rawSha256,
  cursorDeltaSemantics:
    'Counts include only rows whose lastMetadataRefreshAt matches refreshedAt.',
  previousLedgerCount: rows.length - added.length,
  providerIssueCount: live.length,
  hostVerification: {
    issueCount: live.length,
    openIssueCount,
    closedIssueCount,
    provider: 'same paginated GitHub GraphQL v4 response',
    verifiedAt: refreshedAt,
    countCommand: 'same paginated query',
    omissionCommand: null,
    omittedIssues: [],
  },
  resultingLedgerCount: rows.length,
  addedUncheckedCount: added.length,
  addedUncheckedIssues: added,
  metadataChangedNeedsRereadCount: changed.length,
  metadataChangedNeedsReread: changed,
  providerMissingLiveVerifiedCount: 0,
  providerMissingLiveVerified: [],
};
writeFileSync(`${root}/issue-refresh.json`, `${JSON.stringify(refresh, null, 2)}\n`);
writeFileSync(
  `${root}/issue-refresh.md`,
  `# Lexical Issue Refresh

status: current at \`${refreshedAt}\`
repository: \`facebook/lexical\`
state coverage: \`all\`
provider: \`GitHub GraphQL v4\`
raw cursor: \`${rawSha256}\`

| Result | Count |
| --- | ---: |
| Provider and host issues | ${live.length} |
| Preserved historical ledger rows | ${rows.length - added.length} |
| Added unchecked | ${added.length} |
| Metadata changed; decision preserved, re-read required | ${changed.length} |
| Provider omissions | 0 |

This is refresh-only. Existing decisions remain intact. New issues are
unchecked and changed metadata is marked for a later issue-harvester pass.
`
);

console.log(
  JSON.stringify(
    {
      added: added.length,
      changed: changed.length,
      closed: closedIssueCount,
      open: openIssueCount,
      total: live.length,
    },
    null,
    2
  )
);
