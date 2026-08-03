#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { matrixTruth } from '../../../plans/artifacts/wordgard-exhaustive-architecture-re-audit/matrix-truth.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(root, '../../../..');
const classified = JSON.parse(
  readFileSync(path.join(root, 'classified-issues.json'), 'utf8')
);
const refresh = JSON.parse(
  readFileSync(path.join(root, 'issue-refresh.json'), 'utf8')
);
const canonicalConceptIds = new Set(matrixTruth.map((concept) => concept.id));
const evidencePattern = /^(.*):(\d+)(?:-(\d+))?$/;
const commitPattern = /^[0-9a-f]{40}$/;

const clean = (value) =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .replace(/\t/g, ' ')
    .trim();
const list = (value) =>
  Array.isArray(value) ? value.join('; ') : (value ?? '');
const md = (value) => clean(value).replace(/\|/g, '\\|');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEvidence(evidence, issueNumber, field) {
  for (const reference of evidence) {
    const match = reference.match(evidencePattern);
    assert(match, `Issue #${issueNumber} has invalid ${field}: ${reference}`);
    const [, relativePath, startText, endText] = match;
    const absolutePath = path.resolve(workspaceRoot, relativePath);
    const lineCount = readFileSync(absolutePath, 'utf8').split('\n').length;
    const start = Number(startText);
    const end = Number(endText ?? startText);
    assert(
      start > 0 && end >= start,
      `Issue #${issueNumber} has an invalid line range: ${reference}`
    );
    assert(
      end <= lineCount,
      `Issue #${issueNumber} evidence is past EOF (${lineCount}): ${reference}`
    );
  }
}

function assertLinkedRefs(
  references,
  providerCommitRefs,
  providerMentionedCommitRefs,
  issueNumber
) {
  const providerRefs = new Set([
    ...providerCommitRefs,
    ...providerMentionedCommitRefs,
  ]);
  const linkedRevisions = [];
  for (const reference of references) {
    const separator = reference.indexOf('@');
    assert(
      separator > 0,
      `Issue #${issueNumber} has invalid linked ref: ${reference}`
    );
    const repository = reference.slice(0, separator);
    const revisions = reference.slice(separator + 1).split('..');
    linkedRevisions.push(...revisions);
    if (repository.endsWith('timeline-orphan')) {
      assert(
        revisions.every((revision) => commitPattern.test(revision)),
        `Issue #${issueNumber} has invalid orphaned timeline ref: ${reference}`
      );
      assert(
        revisions.every((revision) => providerRefs.has(revision)),
        `Issue #${issueNumber} orphaned ref lacks provider provenance: ${reference}`
      );
      continue;
    }
    const repositoryPath =
      repository === 'wordgard/website' ? '../wordgard-website' : '../wordgard';
    for (const revision of revisions) {
      const result = spawnSync(
        'git',
        ['-C', repositoryPath, 'cat-file', '-e', `${revision}^{commit}`],
        { cwd: workspaceRoot }
      );
      assert(
        result.status === 0,
        `Issue #${issueNumber} linked commit does not exist: ${reference}`
      );
    }
  }
  assert(
    providerCommitRefs.every((revision) => linkedRevisions.includes(revision)),
    `Issue #${issueNumber} omits a Forgejo commit-ref event.`
  );
}

assert(
  classified.length === 35,
  `Expected 35 issues, found ${classified.length}.`
);
assert(
  new Set(classified.map((issue) => issue.number)).size === classified.length,
  'Issue ledger contains duplicate numbers.'
);
assert(
  classified.every((issue, index) => issue.number === index + 1),
  'Issue ledger must contain ascending issue numbers 1 through 35.'
);
assert(
  classified.every((issue) => issue.hydrated && issue.checkmark === '[x]'),
  'Every issue must be hydrated and checked.'
);
assert(
  refresh.sourceTrackedClean.wordgard &&
    refresh.sourceTrackedClean.wordgardWebsite,
  'Frozen Wordgard source repositories must have no tracked changes.'
);
assert(
  classified.every(
    (issue) =>
      issue.claim &&
      issue.currentSourceTruth &&
      issue.proofRelation &&
      issue.classification &&
      issue.auditChange &&
      issue.conceptIds.length > 0
  ),
  'Every issue needs semantic claim, concept mapping, source truth, proof relation, classification, and audit decision.'
);
assert(
  classified.every(
    (issue) =>
      (issue.state === 'OPEN' && issue.classification === 'open') ||
      (issue.state === 'CLOSED' &&
        ['fixed', 'stale', 'duplicate'].includes(issue.classification))
  ),
  'Provider state and semantic classification disagree.'
);

for (const issue of classified) {
  assertEvidence(issue.sourceEvidence, issue.number, 'sourceEvidence');
  assertEvidence(issue.proofEvidence, issue.number, 'proofEvidence');
  assertLinkedRefs(
    issue.linkedRefs,
    issue.providerCommitRefs,
    issue.providerMentionedCommitRefs,
    issue.number
  );
  for (const conceptId of issue.conceptIds) {
    assert(
      canonicalConceptIds.has(conceptId),
      `Issue #${issue.number} maps missing canonical concept: ${conceptId}`
    );
  }
}

const classifications = Object.fromEntries(
  ['fixed', 'open', 'stale', 'duplicate'].map((classification) => [
    classification,
    classified.filter((issue) => issue.classification === classification)
      .length,
  ])
);
const closureStatuses = Object.fromEntries(
  [
    'covered-by-existing-test',
    'deferred-with-owner',
    'invalid-skip',
    'needs-repro',
  ].map((status) => [
    status,
    classified.filter((issue) => issue.closureStatus === status).length,
  ])
);
const auditChanging = classified.filter((issue) => issue.changesAudit);
const unionExpanding = classified.filter((issue) =>
  refresh.unionExpandingIssues.includes(issue.number)
);
const currentHeadCovered = classified.filter(
  (issue) => issue.closureStatus === 'covered-by-existing-test'
);
assert(
  JSON.stringify(classifications) ===
    JSON.stringify({ fixed: 22, open: 12, stale: 1, duplicate: 0 }),
  `Unexpected classification counts: ${JSON.stringify(classifications)}.`
);
assert(
  JSON.stringify(closureStatuses) ===
    JSON.stringify({
      'covered-by-existing-test': 0,
      'deferred-with-owner': 32,
      'invalid-skip': 2,
      'needs-repro': 1,
    }),
  `Unexpected closure counts: ${JSON.stringify(closureStatuses)}.`
);
assert(
  refresh.runtimeHarnessProof.classification === 'stale-dist-only' &&
    refresh.runtimeHarnessProof.currentHead === refresh.sourceHeads.wordgard &&
    refresh.runtimeHarnessProof.resolvedDistSnapshot ===
      '01eb2b5eae509509677345fd603acad001827dff' &&
    refresh.runtimeHarnessProof.commitsBehindCurrentHead === 7 &&
    refresh.runtimeHarnessProof.ignoredDist === true &&
    refresh.runtimeHarnessProof.distFileCount === 22 &&
    refresh.runtimeHarnessProof.distMatchesSnapshotExactly === true &&
    refresh.runtimeHarnessProof.nodePackageImportsResolveToDist === true &&
    refresh.runtimeHarnessProof.browserTestsResolveToDist === true &&
    refresh.runtimeHarnessProof.executesCurrentHeadRuntime === false,
  'Runtime harness must remain classified as stale-dist-only.'
);
assert(
  JSON.stringify(auditChanging.map((issue) => issue.number)) ===
    JSON.stringify([
      2, 3, 4, 8, 12, 13, 16, 17, 18, 23, 24, 25, 26, 27, 28, 29, 31, 32, 33,
      34,
    ]),
  `Unexpected audit-changing issues: ${auditChanging.map((issue) => issue.number).join(', ')}.`
);
assert(
  refresh.proofRuns
    .filter((run) => run.proofClass === 'stale-dist-only')
    .every((run) => !run.appliesToFrozenHead),
  'Stale-dist proof runs must not be attributed to frozen-head runtime.'
);
assert(
  JSON.stringify(refresh.unionExpandingIssues) === JSON.stringify([13, 27]),
  `Unexpected union-expanding issues: ${refresh.unionExpandingIssues.join(', ')}.`
);

const classifiedColumns = [
  'number',
  'state',
  'classification',
  'claim',
  'conceptIds',
  'currentSourceTruth',
  'sourceEvidence',
  'proofRelation',
  'proofEvidence',
  'changesAudit',
  'auditChange',
  'closureStatus',
  'owner',
  'reason',
  'nextAction',
  'linkedRefs',
  'providerCommitRefs',
  'providerMentionedCommitRefs',
  'title',
  'url',
  'bodySha256',
  'timelineSha256',
  'semanticSha256',
  'timelineEventCount',
  'lastCheckedAt',
];
writeFileSync(
  path.join(root, 'classified-issues.tsv'),
  `${[
    classifiedColumns.join('\t'),
    ...classified.map((issue) =>
      classifiedColumns
        .map((column) =>
          clean(
            [
              'conceptIds',
              'sourceEvidence',
              'proofEvidence',
              'linkedRefs',
              'providerCommitRefs',
              'providerMentionedCommitRefs',
            ].includes(column)
              ? list(issue[column])
              : issue[column]
          )
        )
        .join('\t')
    ),
  ].join('\n')}\n`
);

const verificationCommand = (issue) => {
  if (issue.closureStatus === 'needs-repro') {
    return 'bun test:mobile-device-proof:raw';
  }

  return 'node docs/editor-issue-harvester/wordgard/full/build-closure-ledger.mjs';
};
const upstreamTestProvenance = (issue) =>
  issue.proofEvidence.filter((evidence) =>
    evidence.includes('../wordgard/test/')
  );
const closureColumns = [
  'check',
  'issue',
  'state',
  'relevant',
  'classification',
  'owner',
  'status',
  'reason',
  'linked_prs',
  'linked_refs',
  'provider_commit_refs',
  'provider_mentioned_commit_refs',
  'upstream_test_provenance',
  'local_coverage',
  'local_test',
  'verification_command',
  'last_checked_at',
  'next_action',
  'title',
  'url',
  'claim',
  'concept_ids',
  'current_source_truth',
  'source_evidence',
  'proof_relation',
  'proof_evidence',
  'changes_audit',
  'audit_change',
  'body_sha256',
  'timeline_sha256',
  'semantic_sha256',
  'timeline_events',
];
const closureValue = (issue, column) => {
  const values = {
    check: issue.checkmark,
    issue: issue.number,
    relevant: issue.relevant ? 'yes' : 'no',
    status: issue.closureStatus,
    linked_prs: '',
    linked_refs: list(issue.linkedRefs),
    provider_commit_refs: list(issue.providerCommitRefs),
    provider_mentioned_commit_refs: list(issue.providerMentionedCommitRefs),
    upstream_test_provenance: list(upstreamTestProvenance(issue)),
    local_coverage: 'none; external-source semantic audit',
    local_test: '',
    verification_command: verificationCommand(issue),
    last_checked_at: issue.lastCheckedAt,
    next_action: issue.nextAction,
    concept_ids: list(issue.conceptIds),
    current_source_truth: issue.currentSourceTruth,
    source_evidence: list(issue.sourceEvidence),
    proof_relation: issue.proofRelation,
    proof_evidence: list(issue.proofEvidence),
    changes_audit: issue.changesAudit ? 'yes' : 'no',
    audit_change: issue.auditChange,
    body_sha256: issue.bodySha256,
    timeline_sha256: issue.timelineSha256,
    semantic_sha256: issue.semanticSha256,
    timeline_events: issue.timelineEventCount,
  };

  return column in values ? values[column] : issue[column];
};
writeFileSync(
  path.join(root, 'issue-closure-ledger.tsv'),
  `${[
    closureColumns.join('\t'),
    ...classified.map((issue) =>
      closureColumns
        .map((column) => clean(closureValue(issue, column)))
        .join('\t')
    ),
  ].join('\n')}\n`
);

const markdown = [
  '# Wordgard Issue Closure Ledger',
  '',
  'status: complete',
  `source head: \`${refresh.sourceHeads.wordgard}\``,
  `website head: \`${refresh.sourceHeads.wordgardWebsite}\``,
  'tracked source state: clean in both repositories',
  'concept mappings: validated against canonical `matrix-truth.mjs` definitions',
  `provider refresh: \`${refresh.refreshedAt}\``,
  `raw hydrated corpus: \`${refresh.raw.path}\` (SHA-256 \`${refresh.raw.sha256}\`)`,
  '',
  'All 35 Forgejo issues were read with their bodies and complete timelines. Raw bodies and comments remain under `.tmp`; this checked-in ledger keeps only compact semantic decisions and content hashes.',
  '',
  '## Counts',
  '',
  '| Bucket | Count |',
  '| --- | ---: |',
  `| total / hydrated / checked | ${classified.length} / ${classified.filter((issue) => issue.hydrated).length} / ${classified.filter((issue) => issue.checkmark === '[x]').length} |`,
  `| open / closed at provider | ${refresh.inventory.openIssueCount} / ${refresh.inventory.closedIssueCount} |`,
  ...Object.entries(classifications).map(
    ([classification, count]) =>
      `| classification: ${classification} | ${count} |`
  ),
  ...Object.entries(closureStatuses).map(
    ([status, count]) => `| closure: ${status} | ${count} |`
  ),
  `| changes audit | ${auditChanging.length} |`,
  `| expands concept union | ${unionExpanding.length} |`,
  '| unchecked | 0 |',
  '',
  '## Source and Proof Result',
  '',
  `The 572-unit and 733-browser results execute ignored \`dist\` from \`${refresh.runtimeHarnessProof.resolvedDistSnapshot}\`, ${refresh.runtimeHarnessProof.commitsBehindCurrentHead} commits behind frozen head. They are stale-dist evidence, not current-head passes.`,
  '',
  '| Command | Proof class | Applies to frozen head | Result |',
  '| --- | --- | --- | --- |',
  ...refresh.proofRuns.map(
    (run) =>
      `| \`${md(run.command)}\` in \`${md(run.cwd)}\` | ${md(run.proofClass)} | ${run.appliesToFrozenHead ? 'yes' : 'no'} | exit ${run.exitCode}: ${md(run.result)} |`
  ),
  '',
  `Current-head covered issues: ${currentHeadCovered.length}. Exact retained regression source exists for #16, #17, #18, and #26, but its observed execution is stale-dist. No local product test or runtime source was added.`,
  '',
  '## Material Audit Deltas',
  '',
  `Only issues ${unionExpanding.map((issue) => `#${issue.number}`).join(' and ')} expand the concept union. The other ${auditChanging.length - unionExpanding.length} rows revise completeness, correctness, proof, or ownership of existing concepts.`,
  '',
  '| Issue | Concepts | Audit change |',
  '| ---: | --- | --- |',
  ...auditChanging.map(
    (issue) =>
      `| #${issue.number} | ${md(issue.conceptIds.join(', '))} | ${md(issue.auditChange)} |`
  ),
  '',
  '## Every Issue',
  '',
  '| Check | Issue | State | Classification | Claim | Concepts | Current source truth | Test / proof relation | Closure | Changes audit |',
  '| --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- |',
  ...classified.map(
    (issue) =>
      `| ${issue.checkmark} | [#${issue.number}](${issue.url}) | ${issue.state} | ${issue.classification} | ${md(issue.claim)} | ${md(issue.conceptIds.join(', '))} | ${md(issue.currentSourceTruth)} | ${md(issue.proofRelation)} | ${issue.closureStatus} | ${issue.changesAudit ? `yes — ${md(issue.auditChange)}` : 'no'} |`
  ),
  '',
  'Machine-readable resume state: `classified-issues.json`, `classified-issues.tsv`, and `issue-closure-ledger.tsv`.',
  '',
];
writeFileSync(path.join(root, 'issue-closure-ledger.md'), markdown.join('\n'));

const refreshMarkdown = [
  '# Wordgard Issue Refresh',
  '',
  'status: hydrated and semantically closed',
  `repository: \`${refresh.repository}\``,
  `provider: \`${refresh.provider}\``,
  `refreshed at: \`${refresh.refreshedAt}\``,
  `Wordgard head: \`${refresh.sourceHeads.wordgard}\``,
  `website head: \`${refresh.sourceHeads.wordgardWebsite}\``,
  'tracked source state: clean in both repositories',
  'concept mappings: validated against canonical `matrix-truth.mjs` definitions',
  '',
  '## Runtime Harness Truth',
  '',
  `classification: \`${refresh.runtimeHarnessProof.classification}\``,
  `resolved runtime: \`${refresh.runtimeHarnessProof.resolvedDistSnapshot}\` (${refresh.runtimeHarnessProof.commitsBehindCurrentHead} commits behind \`${refresh.runtimeHarnessProof.currentHead}\`)`,
  `ignored dist parity: ${refresh.runtimeHarnessProof.distFileCount} files, ${refresh.runtimeHarnessProof.distMatchesSnapshotExactly ? 'exact match' : 'mismatch'}`,
  `Node package imports resolve dist: ${refresh.runtimeHarnessProof.nodePackageImportsResolveToDist ? 'yes' : 'no'}`,
  `browser test imports resolve dist: ${refresh.runtimeHarnessProof.browserTestsResolveToDist ? 'yes' : 'no'}`,
  'The recorded 572/733 results do not execute frozen-head runtime code.',
  `evidence: \`${refresh.runtimeHarnessProof.evidence}\``,
  '',
  '| Provider parity | Count / result |',
  '| --- | --- |',
  `| all-state page 1 | ${refresh.inventory.allIssueCount} |`,
  `| all-state page 2 | ${refresh.inventory.allPageTwoCount} |`,
  `| open / closed | ${refresh.inventory.openIssueCount} / ${refresh.inventory.closedIssueCount} |`,
  `| hydrated details | ${refresh.inventory.hydratedIssueCount} |`,
  `| hydrated timeline events | ${refresh.inventory.timelineEventCount} |`,
  `| provider / hydrated comments | ${refresh.inventory.providerCommentCount} / ${refresh.inventory.hydratedCommentCount} |`,
  `| all = open + closed | ${refresh.parity.allEqualsOpenPlusClosed ? 'pass' : 'fail'} |`,
  `| list/detail metadata | ${refresh.parity.detailMetadataMatchesInventory ? 'pass' : 'fail'} |`,
  `| every issue has semantic decision | ${refresh.parity.everyIssueHasSemanticDecision ? 'pass' : 'fail'} |`,
  `| provider/hydrated comment counts | ${refresh.parity.providerCommentCountsMatch ? 'pass' : 'fail'} |`,
  `| raw bodies/comments outside docs | ${refresh.parity.rawBodiesAndTimelinesKeptOutsideDocs ? 'pass' : 'fail'} |`,
  '',
  `Raw corpus: \`${refresh.raw.path}\``,
  `SHA-256: \`${refresh.raw.sha256}\``,
  '',
  'The compact checked-in artifacts include body and timeline hashes, not raw issue prose or comments.',
  '',
];
writeFileSync(path.join(root, 'issue-refresh.md'), refreshMarkdown.join('\n'));

process.stdout.write(
  `${JSON.stringify(
    {
      auditChanging: auditChanging.length,
      checked: classified.length,
      classifications,
      closureStatuses,
      currentHeadCovered: currentHeadCovered.map((issue) => issue.number),
      unchecked: 0,
    },
    null,
    2
  )}\n`
);
