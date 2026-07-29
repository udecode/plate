#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const initialRefreshedAt = '2026-07-25T22:59:04Z';
const initialHostVerifiedAt = '2026-07-25T23:13:33Z';
const githubIssueFields =
  'number state title updatedAt url labels(first:100){nodes{name}}';
const githubCountCommand = (owner, name) =>
  `gh api graphql -f query='query { repository(owner:"${owner}", name:"${name}") { all: issues { totalCount } open: issues(states:OPEN) { totalCount } closed: issues(states:CLOSED) { totalCount } } }' --jq '.data.repository'`;
const githubOmissionCommand = (owner, name, numbers) =>
  `gh api graphql -f query='query { repository(owner:"${owner}", name:"${name}") { ${numbers
    .map(
      (number) => `i${number}: issue(number:${number}){${githubIssueFields}}`
    )
    .join(' ')} } }' --jq '.data.repository'`;
const configs = [
  {
    hostVerification: {
      closedIssueCount: 2472,
      countCommand: githubCountCommand('facebook', 'lexical'),
      issueCount: 2782,
      omissionCommand: githubOmissionCommand(
        'facebook',
        'lexical',
        [1045, 1046, 1113, 1117, 2194, 2195, 6721]
      ),
      omittedIssues: [
        {
          labels: [],
          number: 1045,
          state: 'CLOSED',
          title: 'Indent logic should merge Sibling ListNodes',
          updatedAt: '2021-12-31T20:31:01Z',
          url: 'https://github.com/facebook/lexical/issues/1045',
        },
        {
          labels: [],
          number: 1046,
          state: 'CLOSED',
          title:
            "Indenting multiple list nodes on different levels of indentation doesn't work correctly",
          updatedAt: '2021-12-31T21:06:49Z',
          url: 'https://github.com/facebook/lexical/issues/1046',
        },
        {
          labels: ['all-platforms-bug'],
          number: 1113,
          state: 'CLOSED',
          title: 'Selection is left behind when moving nodes',
          updatedAt: '2022-06-14T11:31:06Z',
          url: 'https://github.com/facebook/lexical/issues/1113',
        },
        {
          labels: ['copy+paste'],
          number: 1117,
          state: 'CLOSED',
          title:
            'Pasting to google doc/quip needs improvement for quote block and code block.',
          updatedAt: '2022-11-25T12:07:59Z',
          url: 'https://github.com/facebook/lexical/issues/1117',
        },
        {
          labels: ['enhancement'],
          number: 2194,
          state: 'CLOSED',
          title: 'Feature: Support for replace with multiple nodes',
          updatedAt: '2022-11-24T13:23:13Z',
          url: 'https://github.com/facebook/lexical/issues/2194',
        },
        {
          labels: [],
          number: 2195,
          state: 'CLOSED',
          title:
            'Bug: Custom Decorator nodes not rendered after editor state is restored from local storage',
          updatedAt: '2022-05-18T14:40:18Z',
          url: 'https://github.com/facebook/lexical/issues/2195',
        },
        {
          labels: ['enhancement'],
          number: 6721,
          state: 'CLOSED',
          title:
            'Feature: TableNode does not retain the cell width when copying and pasting a table from another spreadsheet',
          updatedAt: '2024-10-10T16:29:57Z',
          url: 'https://github.com/facebook/lexical/issues/6721',
        },
      ],
      openIssueCount: 310,
      provider: 'GitHub GraphQL v4 metadata',
      verifiedAt: initialHostVerifiedAt,
    },
    provider: 'gitcrawl 0.5.0 backed by GitHub REST metadata',
    providerLimit: 10_000,
    refreshedAt: initialRefreshedAt,
    rawCommand:
      'gitcrawl search issues "" -R facebook/lexical --state all --json number,title,state,url,labels,updatedAt --limit 10000',
    repo: 'lexical',
    repository: 'facebook/lexical',
  },
  {
    hostVerification: {
      closedIssueCount: 1309,
      countCommand: githubCountCommand('ProseMirror', 'prosemirror'),
      issueCount: 1420,
      omissionCommand: githubOmissionCommand(
        'ProseMirror',
        'prosemirror',
        [1238, 1271]
      ),
      omittedIssues: [
        {
          labels: [],
          number: 1238,
          state: 'CLOSED',
          title: 'Inline nodes with editable content behave unexpectedly ',
          updatedAt: '2022-02-04T15:06:56Z',
          url: 'https://github.com/ProseMirror/prosemirror/issues/1238',
        },
        {
          labels: [],
          number: 1271,
          state: 'CLOSED',
          title:
            'Backspacing the last character in a paragraph hangs on iOS Safari  ',
          updatedAt: '2022-06-29T14:57:54Z',
          url: 'https://github.com/ProseMirror/prosemirror/issues/1271',
        },
      ],
      openIssueCount: 111,
      provider: 'GitHub GraphQL v4 metadata',
      verifiedAt: initialHostVerifiedAt,
    },
    provider: 'gitcrawl 0.5.0 backed by GitHub REST metadata',
    providerLimit: 10_000,
    refreshedAt: initialRefreshedAt,
    rawCommand:
      'gitcrawl search issues "" -R ProseMirror/prosemirror --state all --json number,title,state,url,labels,updatedAt --limit 10000',
    repo: 'prosemirror',
    repository: 'ProseMirror/prosemirror',
  },
  {
    hostVerification: {
      closedIssueCount: 20,
      countCommand:
        "curl -sS -D - -o /dev/null 'https://code.haverbeke.berlin/api/v1/repos/wordgard/wordgard/issues?state=all&page=1&limit=50'",
      issueCount: 27,
      omissionCommand: null,
      omittedIssues: [],
      openIssueCount: 7,
      provider: 'Forgejo API v1 response headers and repository metadata',
      verifiedAt: '2026-07-27T14:28:47Z',
    },
    provider: 'Forgejo API v1',
    providerLimit: 50,
    refreshedAt: '2026-07-27T14:28:47Z',
    rawCommand:
      "curl -sS 'https://code.haverbeke.berlin/api/v1/repos/wordgard/wordgard/issues?state=all&page=1&limit=50' | jq '[.[] | {labels,number,state,title,updatedAt:.updated_at,url:.html_url}]'",
    repo: 'wordgard',
    repository: 'wordgard/wordgard',
  },
];

const normalizeLabels = (labels = []) =>
  labels
    .map((label) => (typeof label === 'string' ? label : label.name))
    .filter(Boolean)
    .sort();

const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const cleanTsv = (value) =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .replace(/\t/g, ' ');

for (const config of configs) {
  const { refreshedAt } = config;
  const root = path.join('docs/editor-issue-harvester', config.repo, 'full');
  const rawPath = path.join(
    '.tmp/editor-issue-harvester',
    config.repo,
    'raw/issues-refresh-2026-07-26.json'
  );
  const classifiedPath = path.join(root, 'classified-issues.json');
  const oldRows = existsSync(classifiedPath)
    ? JSON.parse(readFileSync(classifiedPath, 'utf8'))
    : [];
  const providerRows = JSON.parse(readFileSync(rawPath, 'utf8'));
  const oldByNumber = new Map(oldRows.map((row) => [row.number, row]));
  const providerByNumber = new Map(
    providerRows.map((row) => [row.number, row])
  );
  const liveVerifiedProviderMisses = new Set(
    config.hostVerification.omittedIssues.map((issue) => issue.number)
  );
  const changed = [];
  const added = [];
  const providerMissing = [];

  if (providerByNumber.size !== providerRows.length) {
    throw new Error(
      `${config.repo}: duplicate issue numbers in raw provider data`
    );
  }
  if (providerRows.length >= config.providerLimit) {
    throw new Error(
      `${config.repo}: provider limit reached; all-state coverage is unproved`
    );
  }

  for (const current of providerRows) {
    const previous = oldByNumber.get(current.number);

    if (!previous) {
      const next = {
        number: current.number,
        state: current.state.toUpperCase(),
        title: current.title,
        url: current.url,
        labels: normalizeLabels(current.labels),
        updatedAt: current.updatedAt,
        action: 'review-later',
        cluster: 'unclassified',
        command: `issue-harvester ${config.repository} --state all --continue`,
        disposition: 'unclassified',
        matrixKey: 'Pending issue-harvester classification',
        owner: 'unknown',
        proofKind: 'pending',
        reason: 'Added by refresh-only; not hydrated or classified.',
        refreshStatus: 'added-unchecked',
        lastMetadataRefreshAt: refreshedAt,
      };

      oldRows.push(next);
      oldByNumber.set(next.number, next);
      added.push(next.number);
      continue;
    }

    if (
      previous.refreshStatus === 'added-unchecked' &&
      previous.disposition === 'unclassified' &&
      previous.owner === 'issue-harvester'
    ) {
      previous.owner = 'unknown';
    }

    const fields = [];
    const nextState = current.state.toUpperCase();
    const nextLabels = normalizeLabels(current.labels);

    if (previous.state !== nextState) fields.push('state');
    if (previous.title !== current.title) fields.push('title');
    if (previous.url !== current.url) fields.push('url');
    if (previous.updatedAt !== current.updatedAt) fields.push('updatedAt');
    if (!same(normalizeLabels(previous.labels), nextLabels))
      fields.push('labels');

    previous.state = nextState;
    previous.title = current.title;
    previous.url = current.url;
    previous.labels = nextLabels;
    previous.updatedAt = current.updatedAt;

    if (fields.length > 0) {
      previous.refreshStatus = 'metadata-changed-needs-reread';
      previous.metadataChangedFields = fields;
      previous.lastMetadataRefreshAt = refreshedAt;
      changed.push({ fields, number: previous.number });
    }
  }

  for (const previous of oldRows) {
    if (providerByNumber.has(previous.number)) continue;

    if (!liveVerifiedProviderMisses.has(previous.number)) {
      throw new Error(
        `${config.repo}: provider omitted #${previous.number} without live verification`
      );
    }

    previous.refreshStatus = 'provider-missing-live-verified';
    previous.lastMetadataRefreshAt = refreshedAt;
    providerMissing.push(previous.number);
  }

  for (const issue of config.hostVerification.omittedIssues) {
    if (providerByNumber.has(issue.number)) {
      throw new Error(
        `${config.repo}: host-verified omission #${issue.number} is present in provider data`
      );
    }

    const row = oldByNumber.get(issue.number);
    const fields = ['labels', 'number', 'state', 'title', 'updatedAt', 'url'];

    for (const field of fields) {
      const actual =
        field === 'labels' ? normalizeLabels(row?.[field]) : row?.[field];
      const expected =
        field === 'labels' ? normalizeLabels(issue[field]) : issue[field];

      if (!same(actual, expected)) {
        throw new Error(
          `${config.repo}: live omission evidence mismatch for #${issue.number} ${field}`
        );
      }
    }
  }

  oldRows.sort((left, right) => left.number - right.number);
  const stateCounts = oldRows.reduce((counts, row) => {
    counts[row.state] = (counts[row.state] ?? 0) + 1;

    return counts;
  }, {});

  if (oldRows.length !== config.hostVerification.issueCount) {
    throw new Error(
      `${config.repo}: ledger count ${oldRows.length} does not match host count ${config.hostVerification.issueCount}`
    );
  }
  if (
    stateCounts.OPEN !== config.hostVerification.openIssueCount ||
    stateCounts.CLOSED !== config.hostVerification.closedIssueCount
  ) {
    throw new Error(
      `${config.repo}: ledger state counts do not match host counts`
    );
  }

  writeFileSync(classifiedPath, `${JSON.stringify(oldRows, null, 2)}\n`);

  const isCurrentCursor = (row) => row.lastMetadataRefreshAt === refreshedAt;
  const addedFlagged = oldRows
    .filter(
      (row) => row.refreshStatus === 'added-unchecked' && isCurrentCursor(row)
    )
    .map((row) => row.number);
  const changedFlagged = oldRows
    .filter(
      (row) =>
        row.refreshStatus === 'metadata-changed-needs-reread' &&
        isCurrentCursor(row)
    )
    .map((row) => ({
      fields: row.metadataChangedFields ?? [],
      number: row.number,
    }));
  const missingFlagged = oldRows
    .filter(
      (row) =>
        row.refreshStatus === 'provider-missing-live-verified' &&
        isCurrentCursor(row)
    )
    .map((row) => row.number);

  const classifiedColumns = [
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
  const classifiedTsv = [
    classifiedColumns.join('\t'),
    ...oldRows.map((row) =>
      classifiedColumns
        .map((column) =>
          cleanTsv(
            column === 'metadataChangedFields'
              ? row.metadataChangedFields?.join(',')
              : row[column]
          )
        )
        .join('\t')
    ),
  ];
  writeFileSync(
    path.join(root, 'classified-issues.tsv'),
    `${classifiedTsv.join('\n')}\n`
  );

  const sha256 = createHash('sha256')
    .update(readFileSync(rawPath))
    .digest('hex');
  const refresh = {
    schemaVersion: 1,
    repository: config.repository,
    provider: config.provider,
    rawCommand: config.rawCommand,
    stateCoverage: 'all',
    providerLimit: config.providerLimit,
    providerLimitReached: false,
    refreshedAt,
    rawPath,
    rawSha256: sha256,
    cursorDeltaSemantics:
      'Counts include only rows whose lastMetadataRefreshAt matches refreshedAt.',
    previousLedgerCount: oldRows.length - addedFlagged.length,
    providerIssueCount: providerRows.length,
    hostVerification: config.hostVerification,
    resultingLedgerCount: oldRows.length,
    addedUncheckedCount: addedFlagged.length,
    addedUncheckedIssues: addedFlagged,
    metadataChangedNeedsRereadCount: changedFlagged.length,
    metadataChangedNeedsReread: changedFlagged,
    providerMissingLiveVerifiedCount: missingFlagged.length,
    providerMissingLiveVerified: missingFlagged,
  };
  writeFileSync(
    path.join(root, 'issue-refresh.json'),
    `${JSON.stringify(refresh, null, 2)}\n`
  );

  const name =
    config.repo === 'lexical'
      ? 'Lexical'
      : config.repo === 'prosemirror'
        ? 'ProseMirror'
        : 'Wordgard';
  const markdown = [
    `# ${name} Issue Refresh`,
    '',
    `status: current at \`${refreshedAt}\``,
    `repository: \`${config.repository}\``,
    'state coverage: `all`',
    `provider: \`${config.provider}\``,
    `limit: \`${config.providerLimit}\` (not reached)`,
    `raw cursor: \`${sha256}\``,
    `host verification: \`${config.hostVerification.provider}\` at \`${config.hostVerification.verifiedAt}\``,
    '',
    '| Result | Count |',
    '| --- | ---: |',
    `| Provider issues | ${providerRows.length} |`,
    `| Host all-state issues | ${config.hostVerification.issueCount} |`,
    `| Preserved historical ledger rows | ${
      oldRows.length - addedFlagged.length
    } |`,
    `| Added unchecked | ${addedFlagged.length} |`,
    `| Metadata changed; decision preserved, re-read required | ${changedFlagged.length} |`,
    `| Provider omissions verified directly with source host | ${missingFlagged.length} |`,
    '',
    'This is refresh-only. No issue was hydrated, reclassified, closed, or used',
    'to create a local test. Existing decisions remain intact; new issues are',
    'unchecked and changed metadata is marked for a later issue-harvester pass.',
    '',
  ];
  writeFileSync(path.join(root, 'issue-refresh.md'), markdown.join('\n'));
}
