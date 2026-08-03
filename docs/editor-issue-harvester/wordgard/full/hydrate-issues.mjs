#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { issueDecisions } from './issue-decisions.mjs';

const repository = 'wordgard/wordgard';
const apiRoot = `https://code.haverbeke.berlin/api/v1/repos/${repository}`;
const providerLimit = 50;
const timelineLimit = 100;
const commitPattern = /^[0-9a-f]{40}$/;
const directCommitPattern =
  /\/(?:wordgard\/wordgard|wordgard\/website)\/commit\/([0-9a-f]{40})/g;
const root = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(root, '../../../..');
const rawDirectory = path.join(
  workspaceRoot,
  '.tmp/editor-issue-harvester/wordgard/raw'
);

const hash = (value) => createHash('sha256').update(value).digest('hex');
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const issueUrl = (number) =>
  `https://code.haverbeke.berlin/wordgard/wordgard/issues/${number}`;

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }

  return response.json();
}

async function fetchIssuePage(state, page) {
  const value = await fetchJson(
    `${apiRoot}/issues?state=${state}&page=${page}&limit=${providerLimit}`
  );
  if (!Array.isArray(value)) {
    throw new Error(
      `Expected an issue array for state=${state}, page=${page}.`
    );
  }

  return value;
}

async function fetchTimeline(number) {
  const events = [];

  for (let page = 1; ; page += 1) {
    const value = await fetchJson(
      `${apiRoot}/issues/${number}/timeline?page=${page}&limit=${timelineLimit}`
    );
    const pageEvents = value ?? [];
    if (!Array.isArray(pageEvents)) {
      throw new Error(`Expected a timeline array for issue #${number}.`);
    }
    events.push(...pageEvents);

    if (pageEvents.length < timelineLimit) break;
  }

  return events;
}

async function mapConcurrent(values, limit, mapper) {
  const output = new Array(values.length);
  let cursor = 0;

  async function worker() {
    while (cursor < values.length) {
      const index = cursor++;
      output[index] = await mapper(values[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, values.length) }, () => worker())
  );
  return output;
}

const normalizeListIssue = (issue) => ({
  closedAt: issue.closed_at,
  createdAt: issue.created_at,
  labels: (issue.labels ?? []).map((label) => label.name).sort(),
  number: issue.number,
  state: String(issue.state).toUpperCase(),
  title: issue.title,
  updatedAt: issue.updated_at,
  url: issue.html_url ?? issueUrl(issue.number),
});

const normalizeTimelineEvent = (event) => ({
  body: event.body ?? '',
  createdAt: event.created_at,
  htmlUrl: event.html_url ?? '',
  pullRequestUrl: event.pull_request?.html_url ?? '',
  refCommitSha: event.ref_commit_sha ?? '',
  type: event.type,
  user: event.user?.login ?? event.user?.username ?? '',
});

function readHead(relativePath) {
  return execFileSync('git', ['-C', relativePath, 'rev-parse', 'HEAD'], {
    cwd: workspaceRoot,
    encoding: 'utf8',
  }).trim();
}

function readTrackedClean(relativePath) {
  return [
    ['diff', '--quiet'],
    ['diff', '--cached', '--quiet'],
  ].every(
    (args) =>
      spawnSync('git', ['-C', relativePath, ...args], {
        cwd: workspaceRoot,
      }).status === 0
  );
}

const classificationCounts = (rows) =>
  Object.fromEntries(
    ['fixed', 'open', 'stale', 'duplicate'].map((classification) => [
      classification,
      rows.filter((row) => row.classification === classification).length,
    ])
  );

const closureCounts = (rows) =>
  Object.fromEntries(
    [
      'covered-by-existing-test',
      'deferred-with-owner',
      'invalid-skip',
      'needs-repro',
    ].map((status) => [
      status,
      rows.filter((row) => row.closureStatus === status).length,
    ])
  );

export async function hydrateIssues() {
  const refreshedAt = new Date().toISOString();
  const classifiedPath = path.join(root, 'classified-issues.json');
  const previousClassified = existsSync(classifiedPath)
    ? JSON.parse(readFileSync(classifiedPath, 'utf8'))
    : [];
  const previousByNumber = new Map(
    previousClassified.map((issue) => [issue.number, issue])
  );
  const [all, allPageTwo, open, closed] = await Promise.all([
    fetchIssuePage('all', 1),
    fetchIssuePage('all', 2),
    fetchIssuePage('open', 1),
    fetchIssuePage('closed', 1),
  ]);
  const listed = all
    .map(normalizeListIssue)
    .sort((a, b) => a.number - b.number);
  const listedNumbers = listed.map((issue) => issue.number);
  const decisionNumbers = issueDecisions.map((issue) => issue.number);
  const stateNumbers = [...open, ...closed]
    .map((issue) => issue.number)
    .sort((a, b) => a - b);

  if (allPageTwo.length !== 0) {
    throw new Error(
      `Provider pagination is incomplete: page 2 has ${allPageTwo.length} issues.`
    );
  }
  if (new Set(listedNumbers).size !== listedNumbers.length) {
    throw new Error(
      'Forgejo all-state inventory contains duplicate issue numbers.'
    );
  }
  if (JSON.stringify(listedNumbers) !== JSON.stringify(stateNumbers)) {
    throw new Error('Forgejo all/open/closed issue inventories disagree.');
  }
  if (JSON.stringify(listedNumbers) !== JSON.stringify(decisionNumbers)) {
    throw new Error(
      'Hydrated issue numbers do not match the semantic decision ledger.'
    );
  }

  const hydrated = await mapConcurrent(listedNumbers, 6, async (number) => {
    const [detail, timeline] = await Promise.all([
      fetchJson(`${apiRoot}/issues/${number}`),
      fetchTimeline(number),
    ]);
    const normalizedTimeline = timeline.map(normalizeTimelineEvent);
    const normalized = {
      body: detail.body ?? '',
      closedAt: detail.closed_at,
      createdAt: detail.created_at,
      labels: (detail.labels ?? []).map((label) => label.name).sort(),
      number: detail.number,
      providerCommentCount: detail.comments ?? 0,
      state: String(detail.state).toUpperCase(),
      timeline: normalizedTimeline,
      title: detail.title,
      updatedAt: detail.updated_at,
      url: detail.html_url ?? issueUrl(number),
    };

    if (normalized.number !== number) {
      throw new Error(
        `Forgejo returned issue #${normalized.number} for #${number}.`
      );
    }

    return normalized;
  });

  for (const issue of hydrated) {
    const listIssue = listed.find(
      (candidate) => candidate.number === issue.number
    );
    for (const field of ['state', 'title', 'updatedAt', 'url']) {
      if (JSON.stringify(issue[field]) !== JSON.stringify(listIssue[field])) {
        throw new Error(
          `List/detail mismatch for issue #${issue.number}: ${field}.`
        );
      }
    }
  }

  const rawPath = path.join(
    rawDirectory,
    `issues-all-with-bodies-${refreshedAt.slice(0, 10)}.json`
  );
  const raw = json(hydrated);
  mkdirSync(rawDirectory, { recursive: true });
  writeFileSync(rawPath, raw);

  const byNumber = new Map(hydrated.map((issue) => [issue.number, issue]));
  const classified = issueDecisions.map((decision) => {
    const issue = byNumber.get(decision.number);
    const commentCount = issue.timeline.filter(
      (event) => event.type === 'comment'
    ).length;
    if (commentCount !== issue.providerCommentCount) {
      throw new Error(
        `Issue #${issue.number} declares ${issue.providerCommentCount} comments but hydrated ${commentCount}.`
      );
    }

    const semanticSha256 = hash(
      JSON.stringify({
        body: issue.body,
        labels: issue.labels,
        state: issue.state,
        timeline: issue.timeline,
        title: issue.title,
      })
    );
    const previous = previousByNumber.get(issue.number);
    const providerMentionedCommitRefs = [
      ...new Set(
        [issue.body, ...issue.timeline.map((event) => event.body)].flatMap(
          (text) =>
            [...text.matchAll(directCommitPattern)].map((match) => match[1])
        )
      ),
    ];
    if (
      previous?.semanticSha256 &&
      previous.semanticSha256 !== semanticSha256
    ) {
      throw new Error(
        `Issue #${issue.number} changed semantically; reread its title, body, labels, state, and timeline before refreshing the ledger.`
      );
    }

    return {
      number: issue.number,
      state: issue.state,
      title: issue.title,
      url: issue.url,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      closedAt: issue.closedAt,
      labels: issue.labels,
      hydrated: true,
      bodySha256: hash(issue.body),
      timelineSha256: hash(JSON.stringify(issue.timeline)),
      semanticSha256,
      timelineEventCount: issue.timeline.length,
      providerCommentCount: issue.providerCommentCount,
      hydratedCommentCount: commentCount,
      providerCommitRefs: [
        ...new Set(
          issue.timeline
            .map((event) => event.refCommitSha)
            .filter((revision) => commitPattern.test(revision))
        ),
      ],
      providerMentionedCommitRefs,
      ...decision,
      relevant: true,
      status: decision.closureStatus,
      checkmark: '[x]',
      lastCheckedAt: refreshedAt,
    };
  });

  const sourceHeads = {
    wordgard: readHead('../wordgard'),
    wordgardWebsite: readHead('../wordgard-website'),
  };
  const sourceTrackedClean = {
    wordgard: readTrackedClean('../wordgard'),
    wordgardWebsite: readTrackedClean('../wordgard-website'),
  };
  const publicContractProbePath = path.join(
    workspaceRoot,
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-public-contract-probe.json'
  );
  const publicContractProbe = JSON.parse(
    readFileSync(publicContractProbePath, 'utf8')
  );
  if (publicContractProbe.wordgardHead !== sourceHeads.wordgard) {
    throw new Error('Wordgard public-contract probe targets a different head.');
  }
  const staleDistSnapshot = publicContractProbe.distProvenance.snapshotRef;
  const staleDistCommitLag =
    publicContractProbe.distProvenance.changedCommitsAfterSnapshot.length;
  const nodePackageImportsResolveToDist = Object.values(
    publicContractProbe.entryParity.node.imports
  ).every((entry) => entry.resolved.includes('/dist/'));
  if (
    !publicContractProbe.distProvenance.ignored ||
    !publicContractProbe.distProvenance.fileParity.allEqual ||
    !nodePackageImportsResolveToDist ||
    !publicContractProbe.entryParity.browserTestResolution
      .resolvesWordgardToDist ||
    !publicContractProbe.entryParity.sameUnconditionalTargetsForNodeAndBrowser
  ) {
    throw new Error('Wordgard stale-dist harness provenance is incomplete.');
  }
  const timelineEventCount = hydrated.reduce(
    (sum, issue) => sum + issue.timeline.length,
    0
  );
  const providerCommentCount = hydrated.reduce(
    (sum, issue) => sum + issue.providerCommentCount,
    0
  );
  const hydratedCommentCount = classified.reduce(
    (sum, issue) => sum + issue.hydratedCommentCount,
    0
  );
  const unionExpandingIssues = classified
    .filter((issue) =>
      issue.conceptIds.some((conceptId) =>
        ['WG-CMD-004B', 'WG-INTEGRATION-COMPLETION-001'].includes(conceptId)
      )
    )
    .map((issue) => issue.number);
  const rawRelativePath = path.relative(workspaceRoot, rawPath);
  const refresh = {
    schemaVersion: 2,
    repository,
    provider: 'Forgejo API v1',
    refreshedAt,
    stateCoverage: 'all',
    endpointTemplates: {
      detail: `${apiRoot}/issues/{number}`,
      inventory: `${apiRoot}/issues?state={state}&page={page}&limit=${providerLimit}`,
      timeline: `${apiRoot}/issues/{number}/timeline?page={page}&limit=${timelineLimit}`,
    },
    sourceHeads,
    sourceTrackedClean,
    inventory: {
      providerLimit,
      allIssueCount: listed.length,
      allPageTwoCount: allPageTwo.length,
      openIssueCount: open.length,
      closedIssueCount: closed.length,
      hydratedIssueCount: hydrated.length,
      timelineEventCount,
      providerCommentCount,
      hydratedCommentCount,
    },
    parity: {
      allEqualsOpenPlusClosed: true,
      detailMetadataMatchesInventory: true,
      everyIssueHasSemanticDecision: true,
      providerCommentCountsMatch: true,
      providerPaginationExhausted: true,
      rawBodiesAndTimelinesKeptOutsideDocs: true,
    },
    raw: {
      path: rawRelativePath,
      sha256: hash(raw),
    },
    classifications: classificationCounts(classified),
    closureStatuses: closureCounts(classified),
    checkedIssueCount: classified.filter((issue) => issue.checkmark === '[x]')
      .length,
    uncheckedIssueCount: classified.filter((issue) => issue.checkmark !== '[x]')
      .length,
    auditChangingIssueCount: classified.filter((issue) => issue.changesAudit)
      .length,
    unionExpandingIssueCount: unionExpandingIssues.length,
    unionExpandingIssues,
    runtimeHarnessProof: {
      classification: 'stale-dist-only',
      currentHead: sourceHeads.wordgard,
      resolvedDistSnapshot: staleDistSnapshot,
      commitsBehindCurrentHead: staleDistCommitLag,
      ignoredDist: true,
      distFileCount: publicContractProbe.distProvenance.fileParity.fileCount,
      distMatchesSnapshotExactly:
        publicContractProbe.distProvenance.fileParity.allEqual,
      nodePackageImportsResolveToDist,
      browserTestsResolveToDist:
        publicContractProbe.entryParity.browserTestResolution
          .resolvesWordgardToDist,
      executesCurrentHeadRuntime: false,
      evidence:
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-public-contract-probe.json',
    },
    proofRuns: [
      {
        command: 'npm test',
        cwd: '../wordgard',
        exitCode: 0,
        proofClass: 'stale-dist-only',
        appliesToFrozenHead: false,
        resolvedRevision: staleDistSnapshot,
        result:
          '572 tests reported passing while package imports resolved ignored dist from 01eb2b5, seven commits behind frozen head; not current-head proof.',
      },
      {
        command:
          "node bin/test-headless.ts --binary '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'",
        cwd: '../wordgard',
        exitCode: 0,
        proofClass: 'stale-dist-only',
        appliesToFrozenHead: false,
        resolvedRevision: staleDistSnapshot,
        result:
          '733 tests reported passing while browser imports resolved ignored dist from 01eb2b5, seven commits behind frozen head; not current-head proof.',
      },
      {
        command: 'npx tsc --noEmit',
        cwd: '../wordgard',
        exitCode: 2,
        proofClass: 'current-head-failure',
        appliesToFrozenHead: true,
        result:
          'Fails at frozen head: unused InputRule, unresolved enter, unresolved CodeBlockLanguage, and missing codeBlockLanguage export.',
      },
      {
        command: 'npm run prepare',
        cwd: '../wordgard',
        exitCode: 0,
        proofClass: 'current-head-failure-hidden-by-exit-code',
        appliesToFrozenHead: true,
        result:
          'False green: prints the same TypeScript errors but the build script does not propagate failure.',
      },
      {
        command:
          'node docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/probe-wordgard-public-contracts.mjs',
        cwd: '.',
        exitCode: 0,
        proofClass: 'harness-provenance',
        appliesToFrozenHead: true,
        result:
          'Proves Node and browser test imports resolve ignored dist exactly matching 01eb2b5 across 22 files, seven commits behind frozen head.',
      },
    ],
  };

  writeFileSync(classifiedPath, json(classified));
  writeFileSync(path.join(root, 'issue-refresh.json'), json(refresh));

  return { classified, refresh };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { refresh } = await hydrateIssues();
  process.stdout.write(
    `${JSON.stringify(
      {
        auditChanging: refresh.auditChangingIssueCount,
        checked: refresh.checkedIssueCount,
        classifications: refresh.classifications,
        closureStatuses: refresh.closureStatuses,
        raw: refresh.raw,
        total: refresh.inventory.hydratedIssueCount,
        unchecked: refresh.uncheckedIssueCount,
      },
      null,
      2
    )}\n`
  );
}
