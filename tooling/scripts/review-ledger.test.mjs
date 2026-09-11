import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';

import {
  discover,
  draftReview,
  freshness,
  main,
  orderScopes,
  recordReview,
  records,
  searchResearch,
  validate,
} from './review-ledger.mjs';

const digest = (value) => createHash('sha256').update(value).digest('hex');

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'plate-review-ledger-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const put = (path, value) => {
    mkdirSync(join(root, dirname(path)), { recursive: true });
    writeFileSync(join(root, path), value);
  };
  put(
    'packages/platejs/src/features/comments/owner.ts',
    'export const comments = 1;'
  );
  put('packages/platejs/src/features/link/owner.ts', 'export const link = 1;');
  put(
    'packages/platejs/package.json',
    JSON.stringify({ exports: { './comments': './comments.js' } })
  );
  put('docs/evidence.md', 'Observed behavior and alternatives.');
  mkdirSync(join(root, 'docs/plite/research'), { recursive: true });
  const scopes = ['comments', 'link'].map((id) => ({
    id,
    title: id,
    question: `Who owns ${id}?`,
    dependsOn: [],
    last: false,
    opportunity: { score: 5, reason: 'A concrete shared owner question.' },
    nextOwner: 'best-api',
    review: 'unassessed',
    adoption: 'not-assessed',
    proofState: 'not-replayed',
    owners: [`packages/platejs/src/features/${id}/owner.ts`],
    consumers: ['docs/evidence.md'],
    proof: ['docs/evidence.md'],
    plans: [],
  }));
  const index = {
    version: 1,
    inventory: { roots: ['packages'], exclusions: [], checkedAt: '2026-09-11' },
    scopes,
    features: [],
    records: [],
  };
  index.features = discover(root, index).map(({ id, count, fingerprint }) => ({
    id,
    count,
    fingerprint,
    scope: id.includes('link') ? 'link' : 'comments',
    disposition: 'grouped',
  }));
  return { root, put, index };
}

function completed(root, index, overrides = {}) {
  return {
    ...draftReview(root, index, 'comments'),
    id: '2026-09-11-comments-first',
    date: '2026-09-11',
    model: 'fixture-model-a',
    trigger: 'User requested a review.',
    requirements: ['Preserve mapped comment ranges.'],
    evidenceReuse: 'First observation of the fixture source.',
    alternatives: [
      'Keep the owner: it has an independent range lifetime job.',
      'Delete the owner: rejected because the fixture consumer needs mapped ranges.',
    ],
    summary: 'Keep the existing owner.',
    verdict: 'stop',
    proofLimits: 'Synthetic helper contract fixture only.',
    references: ['docs/evidence.md'],
    ...overrides,
  };
}

test('inventory accounts for exports and fails on new, removed or changed source groups', (t) => {
  const { root, put, index } = fixture(t);
  assert.ok(
    index.features.some((feature) => feature.id === 'export/platejs/./comments')
  );
  assert.equal(validate(root, index).scopes, 2);
  put(
    'packages/platejs/src/features/comments/owner.ts',
    'export const comments = 2;'
  );
  assert.throws(() => validate(root, index), /Stale inventory/);
  assert.doesNotThrow(() => validate(root, index, { current: false }));
  put(
    'packages/platejs/src/features/table/owner.ts',
    'export const table = 1;'
  );
  assert.throws(
    () => validate(root, index, { current: false }),
    /Inventory changed/
  );
  rmSync(join(root, 'packages/platejs/src/features/table'), {
    recursive: true,
  });
  rmSync(join(root, 'packages/platejs/src/features/link'), { recursive: true });
  assert.throws(
    () => validate(root, index, { current: false }),
    /Inventory changed/
  );
});

test('ordinary and new-model repeat reviews preserve history without altering adoption or proof', (t) => {
  const { root, index } = fixture(t);
  const first = completed(root, index);
  const path = recordReview(root, index, first);
  const original = readFileSync(join(root, path), 'utf-8');
  const second = completed(root, index, {
    id: '2026-09-11-comments-second',
    model: first.model,
    trigger: 'Repeated request on unchanged source.',
    evidenceReuse: 'Matching source reused; the new review revisits deletion.',
    relation: 'reaffirms',
  });
  assert.equal(second.previous, first.id);
  assert.deepEqual(second.source, first.source);
  recordReview(root, index, second);
  assert.equal(records(root, index).length, 2);
  assert.equal(readFileSync(join(root, path), 'utf-8'), original);
  assert.equal(index.scopes[0].review, 'reviewed');
  assert.equal(index.scopes[0].adoption, 'not-assessed');
  assert.equal(index.scopes[0].proofState, 'not-replayed');
  assert.equal(freshness(root, second, discover(root, index)), 'matching');
  const third = completed(root, index, {
    id: '2026-09-11-comments-third',
    model: 'fixture-model-b',
    trigger: 'Requested review with another model on the same evidence.',
    evidenceReuse: 'Matching source reused for a fresh comparison.',
    relation: 'reaffirms',
  });
  assert.equal(third.previous, second.id);
  assert.deepEqual(third.source, first.source);
  recordReview(root, index, third);
  assert.deepEqual(
    records(root, index).map((record) => record.model),
    [first.model, first.model, 'fixture-model-b']
  );
  assert.equal(index.scopes[0].adoption, 'not-assessed');
  assert.equal(index.scopes[0].proofState, 'not-replayed');
  assert.doesNotThrow(() => validate(root, index));
});

test('record is idempotent, rejects changed IDs and detects historical record edits', (t) => {
  const { root, put, index } = fixture(t);
  const record = completed(root, index);
  const path = recordReview(root, index, record);
  assert.equal(recordReview(root, index, record), path);
  assert.equal(index.records.length, 1);
  assert.throws(
    () => recordReview(root, index, { ...record, verdict: 'pursue' }),
    /different contents/
  );
  put(path, JSON.stringify({ ...record, verdict: 'pursue' }));
  assert.throws(() => records(root, index), /Immutable record changed/);
});

test('source changes invalidate only affected observations and stale drafts cannot be recorded', (t) => {
  const { root, put, index } = fixture(t);
  const record = completed(root, index);
  put('packages/platejs/src/features/link/owner.ts', 'export const link = 2;');
  assert.equal(freshness(root, record, discover(root, index)), 'matching');
  put(
    'packages/platejs/src/features/comments/owner.ts',
    'export const comments = 2;'
  );
  assert.equal(freshness(root, record, discover(root, index)), 'stale');
  assert.throws(() => recordReview(root, index, record), /Source changed/);
});

test('draft records transitive dependency source and changing it invalidates reuse', (t) => {
  const { root, put, index } = fixture(t);
  index.scopes[0].dependsOn = ['link'];
  const draft = completed(root, index);
  assert.ok(draft.source.features['platejs/link']);
  put('packages/platejs/src/features/link/new.ts', 'export const added = 1;');
  assert.equal(freshness(root, draft, discover(root, index)), 'stale');
});

test('unknown historical provenance stays unknown and an old import does not replace a completed review', (t) => {
  const { root, index } = fixture(t);
  const current = completed(root, index);
  recordReview(root, index, current);
  const historical = {
    ...current,
    id: '2026-07-01-comments-historical',
    kind: 'historical',
    date: '2026-07-01',
    model: null,
    source: null,
    verdict: null,
    relation: 'historical-context',
    previous: null,
  };
  recordReview(root, index, historical);
  assert.equal(freshness(root, historical, discover(root, index)), 'unknown');
  assert.equal(draftReview(root, index, 'comments').previous, current.id);
  assert.equal(index.scopes[0].review, 'reviewed');
});

test('upstream commit and file changes invalidate reuse; a missing clone is unknown', (t) => {
  const { root, put, index } = fixture(t);
  const upstream = join(root, 'upstream');
  mkdirSync(upstream);
  execFileSync('git', ['init', '--quiet', upstream]);
  put('upstream/owner.ts', 'upstream v1');
  execFileSync('git', ['-C', upstream, 'add', 'owner.ts']);
  execFileSync('git', [
    '-C',
    upstream,
    '-c',
    'user.name=Fixture',
    '-c',
    'user.email=fixture@example.invalid',
    '-c',
    'commit.gpgsign=false',
    'commit',
    '--quiet',
    '-m',
    'fixture',
  ]);
  const commit = execFileSync('git', ['-C', upstream, 'rev-parse', 'HEAD'], {
    encoding: 'utf-8',
  }).trim();
  const record = completed(root, index);
  record.source.upstreams = [
    {
      checkout: upstream,
      commit,
      files: { 'owner.ts': digest('upstream v1') },
    },
  ];
  assert.equal(freshness(root, record, discover(root, index)), 'matching');
  put('upstream/owner.ts', 'upstream changed');
  assert.equal(freshness(root, record, discover(root, index)), 'stale');
  put('upstream/owner.ts', 'upstream v1');
  record.source.upstreams[0].commit = '0'.repeat(40);
  assert.equal(freshness(root, record, discover(root, index)), 'stale');
  rmSync(upstream, { recursive: true });
  assert.equal(freshness(root, record, discover(root, index)), 'unknown');
});

test('AI stays last despite a higher score; missing dependencies and cycles fail', () => {
  const scope = (id, score, dependsOn = [], last = false) => ({
    id,
    opportunity: { score },
    dependsOn,
    last,
  });
  assert.deepEqual(
    orderScopes([
      scope('ai', 10, [], true),
      scope('code', 9, ['native']),
      scope('native', 5),
    ]).map((item) => item.id),
    ['native', 'code', 'ai']
  );
  assert.throws(
    () => orderScopes([scope('code', 9, ['missing'])]),
    /cycle or missing/
  );
  assert.throws(
    () => orderScopes([scope('a', 1, ['b']), scope('b', 1, ['a'])]),
    /cycle or missing/
  );
  assert.throws(
    () => orderScopes([scope('ai', 10, [], true), scope('code', 9, ['ai'])]),
    /AI-last/
  );
});

test('cross-run lookup preserves rejected leads, historical headers, exact status and malformed-row warnings', (t) => {
  const { root, put } = fixture(t);
  put(
    'docs/plite/research/2026-01-01-first/rejected-ledger.tsv',
    'lead_key\treason\treopen_condition\ncomment:anchor:history\tDuplicate mapper\tNative identity changes\n'
  );
  put(
    'docs/plite/research/2026-01-02-second/lead-ledger.tsv',
    'claim\tdecision\tstatus\ncomment range\tpursue\tdeferred-proof\ncomment malformed\n'
  );
  put(
    'docs/plite/research/2026-01-02-second/read-log.tsv',
    'why_read\tsource\ncomment history\towner.ts@abc\n'
  );
  const result = searchResearch(root, 'comment');
  assert.equal(result.matches.length, 4);
  assert.equal(
    result.matches.find((item) => item.row?.claim === 'comment range').status,
    'deferred-proof'
  );
  assert.equal(
    result.matches.find((item) => item.row?.lead_key).row.reopen_condition,
    'Native identity changes'
  );
  assert.equal(result.matches.find((item) => item.row?.why_read).status, null);
  const malformed = result.matches.find((item) => item.row === null);
  assert.equal(malformed.status, null);
  assert.deepEqual(malformed.rawCells, ['comment malformed']);
  assert.equal(result.warnings.length, 1);
  assert.equal(result.warnings[0].line, 3);
});

test('capabilities declared together still have individual inventory members and consumer evidence', (t) => {
  const { root, put, index } = fixture(t);
  put(
    'packages/platejs/src/utils/plate-keys.ts',
    "export const PLUGINS = {\n  bold: 'bold',\n  italic: 'italic',\n} as const;\n"
  );
  put(
    'packages/platejs/src/features/comments/owner.ts',
    'export const fixture = PLUGINS.bold;'
  );
  const found = discover(root, index);
  assert.ok(
    found
      .find((item) => item.id === 'capability/bold')
      .paths.includes('packages/platejs/src/features/comments/owner.ts')
  );
  assert.equal(found.find((item) => item.id === 'capability/italic').count, 1);
  assert.throws(
    () => validate(root, index, { current: false }),
    /Inventory changed/
  );
  put(
    'packages/platejs/src/utils/plate-keys.ts',
    'export const PLUGINS = otherCatalog;'
  );
  assert.throws(() => discover(root, index), /catalog changed shape/);
});

test('a proposed scope records comparator evidence without inventing current feature members', (t) => {
  const { root, index } = fixture(t);
  index.scopes.push({
    ...index.scopes[0],
    id: 'proposal',
    question: 'Should a new owner exist?',
    dependsOn: ['comments'],
  });
  const draft = draftReview(root, index, 'proposal');
  assert.ok(draft.source.features['platejs/comments']);
  assert.ok(!index.features.some((feature) => feature.scope === 'proposal'));
  const record = {
    ...completed(root, index),
    ...draft,
    id: '2026-09-11-proposal',
    requirements: ['Preserve comments.'],
    trigger: 'Review a proposed owner.',
    evidenceReuse: 'Compare against current comment ownership.',
    summary: 'Keep the canonical owner.',
    alternatives: [
      'Keep the current owner.',
      'Reject the proposed duplicate owner.',
    ],
    verdict: 'stop',
    proofLimits: 'Fixture comparison only.',
    references: ['docs/evidence.md'],
  };
  recordReview(root, index, record);
  assert.equal(index.scopes.at(-1).review, 'reviewed');
});

test('generated declarations and proof scratch do not change the source inventory', (t) => {
  const { root, put, index } = fixture(t);
  index.inventory.exclusions = [
    { pattern: '(^|/)\\.(turbo|tmp)/', reason: 'Generated output' },
  ];
  const before = discover(root, index);
  put(
    'packages/platejs/.turbo/entrypoint-types/index.ts',
    'export const generated = 1;'
  );
  put(
    'packages/platejs/src/features/comments/.tmp/probe.ts',
    'export const scratch = 1;'
  );
  assert.deepEqual(discover(root, index), before);
  put(
    'packages/platejs/.turbo/entrypoint-types/index.ts',
    'export const generated = 2;'
  );
  assert.deepEqual(discover(root, index), before);
});

test('empty trailing TSV cells retain their column instead of becoming malformed', (t) => {
  const { root, put } = fixture(t);
  put(
    'docs/plite/research/2026-01-01-run/lead-ledger.tsv',
    'claim\tstatus\ncomment\t\n'
  );
  const result = searchResearch(root, 'comment');
  assert.equal(result.warnings.length, 0);
  assert.equal(result.matches[0].row.status, '');
});

test('CLI actions persist history and regenerate a checked human view', (t) => {
  const { root, put, index } = fixture(t);
  put('docs/research/review-index.json', JSON.stringify(index));
  put('docs/completed-review.json', JSON.stringify(completed(root, index)));
  const result = main(root, ['record', 'docs/completed-review.json']);
  assert.equal(
    result.path,
    'docs/research/review-records/2026-09-11-comments-first.json'
  );
  const lookup = main(root, ['lookup', 'comments']);
  assert.equal(lookup[0].history.length, 1);
  assert.equal(lookup[0].history[0].freshness, 'matching');
  main(root, ['render']);
  assert.equal(main(root, ['check']).records, 1);
  put('docs/research/reviews.md', 'Hand-edited stale view');
  assert.throws(() => main(root, ['check']), /Generated view is stale/);
  main(root, ['render']);
  assert.equal(main(root, ['check']).records, 1);
});

test('incomplete decisions and unreconciled repeats are rejected', (t) => {
  const { root, index } = fixture(t);
  const first = completed(root, index);
  assert.throws(
    () => recordReview(root, index, { ...first, requirements: [] }),
    /requirements/
  );
  assert.throws(
    () => recordReview(root, index, { ...first, alternatives: [] }),
    /alternatives/
  );
  recordReview(root, index, first);
  assert.throws(
    () =>
      recordReview(root, index, { ...first, id: '2026-09-11-unreconciled' }),
    /reconcile previous/
  );
});
