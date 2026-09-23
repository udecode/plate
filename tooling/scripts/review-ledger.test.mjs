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
  documentMetadata,
  draftExecution,
  draftReview,
  executionFreshness,
  freshness,
  main,
  orderScopes,
  planState,
  recordReview,
  records,
  reviewQueue,
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
    inspection: 'Fixture owner and consumer inspected.',
    gaps: 'No product behavior is exercised by this fixture.',
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
  const draft = draftReview(root, index, overrides.scope ?? 'comments');
  return {
    ...draft,
    reconciliation: draft.reconciliation.map((entry) => ({
      ...entry,
      reason:
        'The same requirements and unchanged fixture evidence still justify this conclusion.',
    })),
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

test('inventory ignores local Claude settings inside packages', (t) => {
  const { root, put, index } = fixture(t);
  const before = discover(root, index);

  put('packages/ai/.claude/settings.local.json', '{}');

  assert.deepEqual(discover(root, index), before);
});

test('recording is not blocked by unavailable evidence from another scope', (t) => {
  const { root, put, index } = fixture(t);
  const draft = completed(root, index);

  index.scopes.find((scope) => scope.id === 'link').evidenceInputs = [
    'docs/missing-link-proof.json',
  ];
  put('docs/research/review-index.json', JSON.stringify(index));
  put('docs/review-draft.json', JSON.stringify(draft));

  assert.match(
    main(root, ['record', 'docs/review-draft.json']).path,
    /2026-09-11-comments-first/
  );
  assert.throws(() => main(root, ['check']), /Missing evidence/);
});

test('a review records an explicit gap instead of inventing missing evidence', (t) => {
  const { root, index } = fixture(t);

  index.scopes[0].evidenceInputs = ['docs/missing-comments-proof.json'];
  index.scopes[0].gaps = 'The historical comments proof is unavailable.';
  const draft = completed(root, index, {
    proofLimits: 'The historical comments proof is unavailable.',
  });

  assert.doesNotThrow(() => recordReview(root, index, draft));
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

test('historical references survive source deletion while new references must exist', (t) => {
  const { root, put, index } = fixture(t);
  const evidence = 'docs/retired-proof.md';
  put(evidence, 'Observed owner before adoption.');
  index.scopes[0].evidenceInputs = [evidence];
  const record = completed(root, index, { references: [evidence] });
  const path = recordReview(root, index, record);
  const original = readFileSync(join(root, path), 'utf-8');
  rmSync(join(root, evidence));
  index.scopes[0].evidenceInputs = [];
  put('docs/research/review-index.json', JSON.stringify(index));

  main(root, ['refresh']);
  main(root, ['render']);
  const hub = readFileSync(
    join(root, 'docs/research/features/comments.md'),
    'utf-8'
  );
  assert.ok(hub.includes(`\`${evidence}\` (historical input unavailable)`));
  assert.ok(!hub.includes('](../../retired-proof.md)'));
  assert.equal(main(root, ['check']).records, 1);
  assert.equal(
    main(root, ['lookup', 'comments'])[0].history[0].freshness,
    'stale'
  );
  assert.equal(readFileSync(join(root, path), 'utf-8'), original);
  assert.throws(
    () =>
      recordReview(
        root,
        index,
        completed(root, index, {
          id: '2026-09-11-comments-second',
          references: [evidence],
          previous: record.id,
          relation: 'reaffirms',
        })
      ),
    /Missing evidence/
  );
});

test('queue prerequisites do not capture unrelated source; explicit directory evidence detects additions', (t) => {
  const { root, put, index } = fixture(t);
  index.scopes[0].dependsOn = ['link'];
  const draft = completed(root, index);
  assert.ok(!draft.source.features['platejs/link']);
  put('packages/platejs/src/features/link/new.ts', 'export const added = 1;');
  assert.equal(freshness(root, draft, discover(root, index)), 'matching');
  index.scopes[0].evidenceInputs = ['packages/platejs/src/features/link'];
  const compared = completed(root, index);
  assert.ok(compared.source.directories['packages/platejs/src/features/link']);
  put(
    'packages/platejs/src/features/link/another.ts',
    'export const another = 1;'
  );
  assert.equal(freshness(root, compared, discover(root, index)), 'stale');
});

test('declared proof and runner inputs are required and independently invalidate evidence', (t) => {
  const { root, put, index } = fixture(t);
  put('docs/proof.test.ts', 'original proof');
  put('docs/runner.json', 'original runner');
  index.scopes[0].proof = ['docs/proof.test.ts'];
  index.scopes[0].evidenceInputs = ['docs/runner.json'];
  const record = completed(root, index);
  assert.equal(
    record.source.files['docs/proof.test.ts'],
    digest('original proof')
  );
  const incomplete = structuredClone(record);
  delete incomplete.source.files['docs/proof.test.ts'];
  assert.throws(
    () => recordReview(root, index, incomplete),
    /capture declared evidence/
  );
  put('docs/proof.test.ts', 'changed assertion');
  assert.equal(freshness(root, record, discover(root, index)), 'stale');
  put('docs/proof.test.ts', 'original proof');
  put('docs/runner.json', 'changed runner');
  assert.equal(freshness(root, record, discover(root, index)), 'stale');
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

test('grouped reviews preserve external prerequisites, internal order and AI-last', (t) => {
  const { index } = fixture(t);
  const scope = (id, dependsOn = []) => ({
    ...index.scopes[0],
    id,
    dependsOn,
  });
  index.scopes[0].dependsOn = ['base'];
  index.scopes[1].dependsOn = ['comments'];
  index.scopes.push(scope('base'), scope('consumer', ['link']), {
    ...scope('ai'),
    last: true,
    opportunity: { score: 10 },
  });
  index.reviewGroups = [
    {
      id: 'core',
      title: 'Core',
      scopes: ['comments', 'link'],
      reason: 'Synthetic shared architecture.',
    },
  ];
  const queue = reviewQueue(index);
  assert.deepEqual(
    queue.map((unit) => unit.id),
    ['base', 'core', 'consumer', 'ai']
  );
  assert.deepEqual(queue[1].dependsOn, ['base']);
  assert.deepEqual(queue[2].dependsOn, ['core']);
  assert.deepEqual(index.scopes[1].dependsOn, ['comments']);
  assert.equal(queue[1].pending, 2);
});

test('group lookup and partial completion retain individual records, proof and feature routes', (t) => {
  const { root, put, index } = fixture(t);
  const first = completed(root, index);
  const recordPath = recordReview(root, index, first);
  const original = readFileSync(join(root, recordPath), 'utf-8');
  const features = structuredClone(index.features);
  index.scopes[1].title = 'Link comments in text';
  index.reviewGroups = [
    {
      id: 'core',
      title: 'Core',
      scopes: ['comments', 'link'],
      reason: 'Synthetic shared architecture.',
    },
  ];
  put('docs/research/review-index.json', JSON.stringify(index));

  const [unit] = main(root, ['queue']);
  assert.equal(unit.reviewed, 1);
  assert.equal(unit.pending, 1);
  const lookup = main(root, ['lookup', 'core']);
  assert.deepEqual(
    lookup.map((scope) => scope.id),
    ['comments', 'link']
  );
  assert.equal(lookup[0].history[0].id, first.id);
  assert.equal(lookup[1].history.length, 0);
  assert.equal(lookup[1].review, 'unassessed');
  assert.equal(lookup[1].proofState, 'unknown');
  assert.equal(lookup[1].adoption, 'not-assessed');
  assert.equal(lookup[1].reviewGroup.id, 'core');
  assert.deepEqual(
    main(root, ['lookup', 'comments']).map((scope) => scope.id),
    ['comments']
  );
  assert.deepEqual(
    main(root, ['lookup', 'platejs/link']).map((scope) => scope.id),
    ['link']
  );
  assert.equal(main(root, ['draft', 'link']).previous, null);
  assert.deepEqual(index.features, features);
  assert.equal(readFileSync(join(root, recordPath), 'utf-8'), original);

  main(root, ['render']);
  const rendered = readFileSync(
    join(root, 'docs/research/reviews.md'),
    'utf-8'
  );
  assert.match(
    rendered,
    /1 pending reviews across 1 pending questions; 1 reviews in total/
  );
  assert.match(rendered, /\| unassessed \| not-assessed \| unknown \|/);
  assert.equal(main(root, ['check']).records, 1);

  recordReview(
    root,
    index,
    completed(root, index, {
      scope: 'link',
      id: '2026-09-11-link-first',
    })
  );
  assert.equal(reviewQueue(index)[0].pending, 0);
  assert.equal(reviewQueue(index)[0].reviewed, 2);
});

test('invalid groups and dependency cycles introduced by grouping are rejected', (t) => {
  const { index } = fixture(t);
  const group = {
    id: 'core',
    title: 'Core',
    scopes: ['comments', 'link'],
    reason: 'Shared owner.',
  };
  for (const groups of [
    [{ ...group, id: 'comments' }],
    [group, group],
    [{ ...group, scopes: ['comments', 'missing'] }],
    [{ ...group, scopes: ['comments', 'comments'] }],
    [{ ...group, scopes: ['comments'] }],
    [group, { ...group, id: 'other' }],
  ]) {
    assert.throws(
      () => reviewQueue({ ...index, reviewGroups: groups }),
      /review group/
    );
  }
  index.scopes.push({ ...index.scopes[0], id: 'bridge', dependsOn: ['link'] });
  index.scopes[0].dependsOn = ['bridge'];
  assert.doesNotThrow(() => orderScopes(index.scopes));
  assert.throws(
    () => reviewQueue({ ...index, reviewGroups: [group] }),
    /cycle or missing/
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

test('single- and double-quoted capabilities retain individual inventory and consumer evidence', (t) => {
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
    'export const PLUGINS = {\n  bold: "bold",\n  italic: "italic",\n} as const;\n'
  );
  assert.deepEqual(
    discover(root, index).map(({ id, paths }) => ({ id, paths })),
    found.map(({ id, paths }) => ({ id, paths }))
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
  assert.ok(
    draft.source.files['packages/platejs/src/features/comments/owner.ts']
  );
  assert.deepEqual(draft.source.features, {});
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

test('actual example keys and loader targets are reconciled instead of inferred from labels', (t) => {
  const { root, put, index } = fixture(t);
  const directory = 'apps/www/src/app/(app)/examples/plite';
  index.inventory.roots.push(directory, 'apps/www/tests/browser');
  put(
    `${directory}/plite-example-registry.ts`,
    "export const EXAMPLE_NAMES_AND_PATHS = [\n  ['Plain Text', 'plaintext'],\n] as const;\n"
  );
  put(
    `${directory}/plite-example-loaders.tsx`,
    "export const pliteExampleComponents = {\n  plaintext: createPliteExampleLoader(() => import('./_examples/plaintext')),\n};\n"
  );
  put(
    `${directory}/_examples/plaintext.tsx`,
    'export default function Example() {}'
  );
  put('apps/www/tests/browser/input.spec.ts', 'native input proof');
  const found = discover(root, index);
  assert.ok(
    found
      .find((item) => item.id === 'example/plite/plaintext')
      .paths.includes(`${directory}/_examples/plaintext.tsx`)
  );
  assert.ok(!found.some((item) => item.id === 'example/plite/plain-text'));
  assert.ok(found.some((item) => item.id === 'browser/input'));
  put(
    `${directory}/plite-example-registry.ts`,
    "export const EXAMPLE_NAMES_AND_PATHS = [\n  ['Plain Text', 'plain-text'],\n] as const;\n"
  );
  assert.throws(() => discover(root, index), /catalog and loaders disagree/);
});

test('snapshot refresh preserves history and related scopes provide context without adopting a verdict', (t) => {
  const { root, put, index } = fixture(t);
  const first = completed(root, index);
  recordReview(root, index, first);
  const original = readFileSync(
    join(root, 'docs/research/review-records', `${first.id}.json`),
    'utf-8'
  );
  index.scopes[1].relatedScopes = ['comments'];
  put('docs/research/review-index.json', JSON.stringify(index));
  main(root, ['refresh']);
  const next = JSON.parse(
    readFileSync(join(root, 'docs/research/review-index.json'), 'utf-8')
  );
  assert.match(next.inventory.snapshot.fingerprint, /^[a-f0-9]{64}$/);
  assert.equal(next.inventory.snapshot.kind, 'working-tree');
  assert.equal(
    readFileSync(
      join(root, 'docs/research/review-records', `${first.id}.json`),
      'utf-8'
    ),
    original
  );
  const [link] = main(root, ['lookup', 'link']);
  assert.equal(link.review, 'unassessed');
  assert.equal(link.observation.inventoryStatus, 'matching');
  assert.equal(link.related[0].history[0].id, first.id);
  assert.equal(draftReview(root, next, 'link').previous, null);
  main(root, ['render']);
  assert.equal(main(root, ['check']).records, 1);
  put('packages/platejs/src/features/table/owner.ts', 'new feature');
  const [unrelated] = main(root, ['lookup', 'link']);
  assert.equal(unrelated.observation.status, 'matching');
  assert.equal(unrelated.observation.inventoryStatus, 'stale');
});

test('a missing proof owner requires an explicit gap without inventing a test', (t) => {
  const { root, index } = fixture(t);
  index.scopes[0].proof = [];
  index.scopes[0].gaps = '';
  assert.throws(() => validate(root, index), /Missing proof gap/);
  index.scopes[0].gaps = 'No relevant behavior proof located.';
  assert.doesNotThrow(() => validate(root, index));
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

function executionFixture(
  t,
  { scopes = ['comments'], workKind = 'implementation' } = {}
) {
  const fixtureState = fixture(t);
  const { root, put, index } = fixtureState;
  const reviews = scopes.map((scope) =>
    completed(root, index, {
      scope,
      id: `2026-09-11-${scope}-basis`,
      verdict: 'pursue',
    })
  );
  for (const review of reviews) recordReview(root, index, review);
  const plan = 'docs/plans/2026-09-12-adoption.md';
  put(
    plan,
    `---\nreview_scopes: ${JSON.stringify(scopes)}\nreview_basis: ${JSON.stringify(reviews.map((review) => review.id))}\nwork_kind: ${workKind}\n---\n# Adoption\n\nStatus: Complete. Target adopted and proof executed.\n`
  );
  put('docs/proof-result.json', '{"passed":true,"case":"mapped ranges"}\n');
  const execution = {
    ...draftExecution(root, index, plan),
    id: '2026-09-12-adoption-proof',
    date: '2026-09-12',
    summary:
      'The governing owner decision was implemented and the mapped-range case passed.',
    proof: {
      state: 'verified',
      evidence: [
        {
          path: 'docs/proof-result.json',
          sha256: digest('{"passed":true,"case":"mapped ranges"}\n'),
          claim: 'The fixture public behavior case passed.',
        },
      ],
      limits:
        'Synthetic helper fixture; no real product behavior is exercised.',
    },
  };
  const persist = () =>
    put('docs/research/review-index.json', JSON.stringify(index));
  return { ...fixtureState, reviews, plan, execution, persist };
}

test('execution after a review is discoverable, bound to evidence, and never replaces the decision', (t) => {
  const { root, put, index, reviews, plan, execution, persist } =
    executionFixture(t);
  recordReview(root, index, execution);
  persist();
  const [lookup] = main(root, ['lookup', 'comments']);
  assert.equal(lookup.current.id, reviews[0].id);
  assert.equal(draftReview(root, index, 'comments').previous, reviews[0].id);
  assert.equal(lookup.progress.state, 'completed');
  assert.equal(lookup.proofState, 'verified');
  assert.equal(lookup.progress.plan, plan);
  assert.deepEqual(lookup.progress.reviewBasis, [reviews[0].id]);
  assert.equal(lookup.subsequentExecution.items[0].id, execution.id);
  assert.ok(
    lookup.conflicts.items.some((gap) => gap.kind === 'unreconciled-execution')
  );
  index.scopes[0].decision = 'docs/current-decision.md';
  put(
    index.scopes[0].decision,
    `---\ncurrent_review: ${reviews[0].id}\nreconciled_executions: [${execution.id}]\n---\n# Current decision\nThe accepted target is implemented; proof limits remain in the outcome.\n`
  );
  persist();
  assert.equal(main(root, ['lookup', 'comments'])[0].conflicts.total, 0);
  assert.equal(
    main(root, ['draft-execution', plan]).plan.sha256,
    execution.plan.sha256
  );
});

test('proof, plan and source changes independently invalidate an execution without rewriting it', (t) => {
  const { root, put, index, execution, persist } = executionFixture(t);
  const path = recordReview(root, index, execution);
  const original = readFileSync(join(root, path), 'utf-8');
  persist();
  for (const input of [
    'docs/proof-result.json',
    execution.plan.path,
    'packages/platejs/src/features/comments/owner.ts',
  ]) {
    const before = readFileSync(join(root, input), 'utf-8');
    put(input, `${before}\nchanged`);
    assert.equal(
      executionFreshness(root, execution, discover(root, index)),
      'stale'
    );
    assert.equal(main(root, ['lookup', 'comments'])[0].proofState, 'stale');
    assert.ok(
      main(root, ['lookup', 'comments'])[0].conflicts.items.some(
        (gap) => gap.kind === 'stale-execution-proof'
      )
    );
    assert.equal(readFileSync(join(root, path), 'utf-8'), original);
    put(input, before);
  }
  assert.equal(
    executionFreshness(root, execution, discover(root, index)),
    'matching'
  );
  rmSync(join(root, 'docs/proof-result.json'));
  assert.equal(
    executionFreshness(root, execution, discover(root, index)),
    'stale'
  );
});

test('a repeated Stop reuses evidence and a changed verdict must reopen the exact prior question', (t) => {
  const { root, index } = fixture(t);
  const first = completed(root, index);
  recordReview(root, index, first);
  const repeat = completed(root, index, {
    id: '2026-09-12-comments-stop',
    relation: 'reaffirms',
  });
  recordReview(root, index, repeat);
  assert.deepEqual(repeat.source, first.source);
  assert.deepEqual(index.scopes[0].plans, []);
  const reversal = completed(root, index, {
    id: '2026-09-13-comments-reopen',
    verdict: 'pursue',
    relation: 'reverses',
  });
  assert.throws(
    () => recordReview(root, index, reversal),
    /explicitly reopen or supersede/
  );
  reversal.reconciliation[0] = {
    record: repeat.id,
    question: 'An unrelated paint question',
    action: 'reopens',
    reason: 'New contradictory native range evidence.',
  };
  assert.throws(
    () => recordReview(root, index, reversal),
    /exact prior question/
  );
  reversal.reconciliation[0].question = repeat.question;
  recordReview(root, index, reversal);
  assert.equal(records(root, index).length, 3);
  assert.equal(records(root, index)[0].verdict, 'stop');
});

test('a new review must explicitly reconcile execution that followed its predecessor', (t) => {
  const { root, index, execution } = executionFixture(t);
  recordReview(root, index, execution);
  const next = completed(root, index, {
    id: '2026-09-13-comments-review',
    verdict: 'pursue',
  });
  assert.ok(next.reconciliation.some((entry) => entry.record === execution.id));
  assert.throws(
    () =>
      recordReview(root, index, {
        ...next,
        reconciliation: next.reconciliation.filter(
          (entry) => entry.record !== execution.id
        ),
      }),
    /subsequent execution/
  );
  recordReview(root, index, next);
  assert.equal(records(root, index).at(-1).id, next.id);
});

test('a cross-feature plan has one lifecycle and one outcome shared by both question histories', (t) => {
  const { root, index, execution, persist } = executionFixture(t, {
    scopes: ['comments', 'link'],
  });
  recordReview(root, index, execution);
  persist();
  assert.deepEqual(execution.scopes, ['comments', 'link']);
  assert.equal(execution.reviewBasis.length, 2);
  for (const scope of execution.scopes) {
    const [lookup] = main(root, ['lookup', scope]);
    assert.equal(lookup.progress.record, execution.id);
    assert.equal(lookup.plans.total, 1);
    assert.equal(lookup.current.scope, undefined);
    assert.ok(lookup.current.id.includes(scope));
  }
  const invalid = {
    ...execution,
    id: '2026-09-12-incomplete-basis',
    reviewBasis: execution.reviewBasis.slice(0, 1),
  };
  assert.throws(
    () => recordReview(root, index, invalid),
    /governing review for each scope/
  );
  assert.equal(
    records(root, index).filter((record) => record.kind === 'execution').length,
    1
  );
});

test('missing associations and historical completion remain visible without inventing verified progress', (t) => {
  const { root, put, index } = fixture(t);
  const plan = 'docs/plans/2026-01-01-legacy.md';
  put(plan, '# Historical plan\n\nStatus: Complete\n');
  index.scopes[0].adoption = 'adopted';
  index.scopes[0].proofState = 'verified';
  put('docs/research/review-index.json', JSON.stringify(index));
  assert.equal(validate(root, index).unassociatedPlans, 1);
  assert.throws(() => draftExecution(root, index, plan), /Associate the plan/);
  index.documents = [
    {
      path: plan,
      scopes: ['comments'],
      kind: 'plan',
      disposition: 'historical',
      rationale:
        'The full plan records comment adoption, but source proof was not retained.',
      workKind: 'implementation',
      reviewBasis: [],
    },
  ];
  const execution = {
    ...draftExecution(root, index, plan),
    id: '2026-09-12-legacy-import',
    summary: 'Imported completion claim without recoverable source evidence.',
    proof: {
      state: 'unknown',
      evidence: [],
      limits: 'Historical completion only; no recoverable proof.',
    },
  };
  assert.equal(execution.binding, 'historical-unbound');
  assert.throws(
    () =>
      recordReview(root, index, {
        ...execution,
        proof: { ...execution.proof, state: 'verified' },
      }),
    /cannot certify proof/
  );
  recordReview(root, index, execution);
  put('docs/research/review-index.json', JSON.stringify(index));
  const [lookup] = main(root, ['lookup', 'comments']);
  assert.equal(lookup.current, null);
  assert.equal(lookup.adoption, 'unbound');
  assert.equal(lookup.proofState, 'unknown');
  assert.equal(validate(root, index).unassociatedPlans, 0);
});

test('compact lookup omits full source fingerprints and full history remains explicitly available', (t) => {
  const { root, put, index } = fixture(t);
  for (let i = 0; i < 12; i++) {
    recordReview(
      root,
      index,
      completed(root, index, { id: `2026-09-11-comments-review-${i}` })
    );
  }
  put('docs/research/review-index.json', JSON.stringify(index));
  const [compact] = main(root, ['lookup', 'comments']);
  const [detail] = main(root, ['lookup', 'comments', '--detail']);
  assert.equal(compact.history.length, 3);
  assert.equal(compact.historyTotal, 12);
  assert.equal(compact.historyOmitted, 9);
  assert.equal(compact.history[0].source, undefined);
  assert.equal(detail.history.length, 12);
  assert.equal(detail.historyOmitted, 0);
  assert.ok(detail.history[0].source.files['docs/evidence.md']);
  assert.ok(JSON.stringify(compact).length < JSON.stringify(detail).length / 2);
});

test('candidate classification preserves rejections and removes inspected leads from unresolved retrieval', (t) => {
  const { root, put, index } = fixture(t);
  put('docs/actual-comments.md', 'Mapped comment ranges.');
  put('docs/github-comments.md', 'GitHub PR comment process.');
  put('docs/unknown.md', 'Uninspected candidate.');
  index.scopes[0].historyCandidates = [
    'docs/actual-comments.md',
    'docs/github-comments.md',
    'docs/unknown.md',
  ];
  index.documents = [
    {
      path: 'docs/actual-comments.md',
      scopes: ['comments'],
      kind: 'specification',
      disposition: 'historical',
      rationale: 'Contains the earlier [mapped-range contract](evidence.md).',
    },
  ];
  index.rejectedCandidates = [
    {
      path: 'docs/github-comments.md',
      scopes: ['comments'],
      reason: 'PR comments are unrelated to document Comments.',
    },
  ];
  put('docs/research/review-index.json', JSON.stringify(index));
  const [lookup] = main(root, ['lookup', 'comments']);
  assert.deepEqual(lookup.historyCandidates.items, ['docs/unknown.md']);
  assert.equal(lookup.rejectedCandidates.total, 1);
  const [detail] = main(root, ['lookup', 'comments', '--detail']);
  assert.equal(
    detail.rejectedCandidates[0].reason,
    index.rejectedCandidates[0].reason
  );
  main(root, ['render']);
  assert.equal(main(root, ['check']).hubs, 2);
  assert.match(
    readFileSync(join(root, 'docs/research/features/comments.md'), 'utf-8'),
    /PR comments are unrelated/
  );
  const hub = readFileSync(
    join(root, 'docs/research/features/comments.md'),
    'utf-8'
  );
  assert.ok(hub.includes('Contains the earlier mapped-range contract.'));
  assert.ok(!hub.includes('](evidence.md)'));
});

test('metadata and legacy lifecycle labels preserve ambiguity instead of choosing a convenient status', (t) => {
  const { root, put } = fixture(t);
  const path = 'docs/plans/status.md';
  put(
    path,
    '---\nreview_scopes:\n  - comments\n  - link\nreview_basis: []\nwork_kind: design\nstatus: active\n---\n# Plan\n\n- goal_status: active\n'
  );
  const active = planState(root, path);
  assert.equal(active.status, 'in-progress');
  assert.deepEqual(active.review_scopes, ['comments', 'link']);
  put(path, `${readFileSync(join(root, path), 'utf-8')}\nStatus: Complete\n`);
  assert.equal(planState(root, path).status, 'conflict');
  assert.deepEqual(documentMetadata('---\nreview_scopes: comments\n---\n'), {
    review_scopes: null,
  });
});

test('a completed design plan does not silently become implementation adoption', (t) => {
  const { root, index, execution, persist } = executionFixture(t, {
    workKind: 'design',
  });
  recordReview(root, index, execution);
  persist();
  const [lookup] = main(root, ['lookup', 'comments']);
  assert.equal(lookup.progress.workKind, 'design');
  assert.equal(lookup.progress.state, 'design-complete');
  assert.equal(lookup.adoption, 'not-established');
  assert.notEqual(lookup.adoption, 'adopted');
});

test('recording rejects stale execution inputs, conflicting lifecycle, and plan-only verified claims', (t) => {
  const { root, put, index, execution, plan } = executionFixture(t);
  const invalid = {
    ...execution,
    proof: {
      ...execution.proof,
      evidence: [{ ...execution.plan, claim: 'The plan says complete.' }],
    },
  };
  assert.throws(() => recordReview(root, index, invalid), /plan alone/);
  const before = readFileSync(join(root, plan), 'utf-8');
  put(plan, `${before}\nChanged plan.\n`);
  assert.throws(() => recordReview(root, index, execution), /input changed/);
  put(plan, `${before}\n- goal_status: active\n`);
  const conflicted = {
    ...execution,
    plan: draftExecution(root, index, plan).plan,
  };
  assert.throws(
    () => recordReview(root, index, conflicted),
    /conflicting plan lifecycle/
  );
});

test('generated hubs must match current decisions and leave immutable records untouched', (t) => {
  const { root, put, index, reviews, execution, persist } = executionFixture(t);
  const recordPath = recordReview(root, index, execution);
  const original = readFileSync(join(root, recordPath), 'utf-8');
  index.scopes[0].decision = 'docs/decision.md';
  put(
    'docs/decision.md',
    '---\ncurrent_review: wrong-record\n---\n# Decision\n'
  );
  persist();
  main(root, ['render']);
  assert.equal(main(root, ['check']).hubs, 2);
  assert.ok(
    main(root, ['lookup', 'comments'])[0].conflicts.items.some(
      (gap) =>
        gap.kind === 'decision-review-mismatch' &&
        gap.expected === reviews[0].id
    )
  );
  put('docs/research/features/comments.md', 'Stale hand-edited feature status');
  assert.throws(() => main(root, ['check']), /feature hub is stale/);
  main(root, ['render']);
  assert.equal(readFileSync(join(root, recordPath), 'utf-8'), original);
});

test('a newer decision without retained execution invalidates current progress while preserving the prior outcome', (t) => {
  const { root, put, index, execution, persist } = executionFixture(t);
  recordReview(root, index, execution);
  const replacement = completed(root, index, {
    id: '2026-09-14-comments-replacement',
    verdict: 'pursue',
    relation: 'supersedes',
  });
  replacement.reconciliation = replacement.reconciliation.map((entry) => ({
    ...entry,
    action: 'supersedes',
    reason:
      'Contradictory range evidence requires a different owner; old adoption does not implement it.',
  }));
  recordReview(root, index, replacement);
  persist();
  const [lookup] = main(root, ['lookup', 'comments']);
  assert.equal(lookup.progress.state, 'decision-changed');
  assert.equal(lookup.proofState, 'unknown');
  assert.equal(lookup.progress.priorOutcome.record, execution.id);
  assert.ok(
    lookup.conflicts.items.some((gap) => gap.kind === 'decision-changed')
  );
  const oldPlan = 'docs/plans/2026-01-01-recovered.md';
  put(
    oldPlan,
    '---\nreview_scopes: [comments]\nreview_basis: []\nwork_kind: implementation\n---\nStatus: Complete\n'
  );
  const recovered = {
    ...draftExecution(root, index, oldPlan),
    id: '2026-09-14-recovered',
    summary: 'Historical completion recovered without evidence.',
    proof: {
      state: 'unknown',
      evidence: [],
      limits: 'Execution date and source binding are unknown.',
    },
  };
  recordReview(root, index, recovered);
  persist();
  assert.equal(main(root, ['lookup', 'comments'])[0].adoption, 'unbound');
  assert.equal(main(root, ['lookup', 'comments'])[0].proofState, 'unknown');
});

test('retaining a governing decision preserves valid bound progress across repeated review', (t) => {
  const { root, index, execution, persist } = executionFixture(t);
  recordReview(root, index, execution);
  const first = completed(root, index, {
    id: '2026-09-13-retained',
    verdict: 'pursue',
    relation: 'reaffirms',
  });
  recordReview(root, index, first);
  const second = completed(root, index, {
    id: '2026-09-14-retained',
    verdict: 'pursue',
    relation: 'reaffirms',
  });
  assert.ok(
    !second.reconciliation.some((entry) => entry.record === execution.id)
  );
  recordReview(root, index, second);
  persist();
  const [lookup] = main(root, ['lookup', 'comments']);
  assert.equal(lookup.progress.state, 'completed');
  assert.equal(lookup.proofState, 'verified');
  assert.equal(lookup.progress.governsCurrentReview, true);
});

test('gated work and next-line completion labels are recovered without crossing arbitrary prose', (t) => {
  const { root, put } = fixture(t);
  const path = 'docs/plans/lifecycle.md';
  put(path, '# Proposal\n\nStatus: Gated on native proof.\n');
  assert.equal(planState(root, path).status, 'gated');
  put(path, '# Historical plan\n\nStatus:\n- Complete.\n');
  assert.equal(planState(root, path).status, 'completed');
  put(path, '# Historical plan\n\nStatus:\n\nUnrelated later prose.\n');
  assert.equal(planState(root, path).status, 'unknown');
});

test('compact lookup prioritizes current closure and recent governing plans over old unbound candidates', (t) => {
  const { root, put, index, execution, persist } = executionFixture(t);
  recordReview(root, index, execution);
  for (let i = 0; i < 20; i++) {
    const path = `docs/plans/2026-01-${String(i + 1).padStart(2, '0')}-legacy.md`;
    put(path, '# Legacy\n\nStatus: Complete\n');
    index.scopes[0].plans.push(path);
  }
  persist();
  const [lookup] = main(root, ['lookup', 'comments']);
  assert.equal(lookup.plans.items[0].path, execution.plan.path);
  assert.ok(
    lookup.conflicts.items.some((gap) => gap.kind === 'unreconciled-execution')
  );
  assert.equal(lookup.conflicts.byKind['unbound-plan'], 20);
  assert.equal(lookup.plans.total, 21);
  assert.ok(JSON.stringify(lookup).length < 8000);
});

test('required decision reconciliation does not invalidate execution proof through a mutable summary input', (t) => {
  const { root, put, index, reviews, plan, execution, persist } =
    executionFixture(t);
  const decision = 'docs/decision.md';
  index.scopes[0].decision = decision;
  index.scopes[0].evidenceInputs = [decision];
  put(decision, `---\ncurrent_review: ${reviews[0].id}\n---\n# Decision\n`);
  const draft = draftExecution(root, index, plan);
  assert.equal(draft.source.files[decision], undefined);
  const outcome = { ...execution, source: draft.source };
  recordReview(root, index, outcome);
  put(
    decision,
    `---\ncurrent_review: ${reviews[0].id}\nreconciled_executions: [${execution.id}]\n---\n# Decision\nOutcome reconciled.\n`
  );
  persist();
  assert.equal(main(root, ['lookup', 'comments'])[0].proofState, 'verified');
  assert.equal(main(root, ['lookup', 'comments'])[0].conflicts.total, 0);
  put('packages/platejs/src/features/comments/owner.ts', 'changed runtime');
  assert.equal(main(root, ['lookup', 'comments'])[0].proofState, 'stale');
});

test('explicit no-feature work differs from missing associations and invalid metadata is rejected', (t) => {
  const { root, put, index } = fixture(t);
  const path = 'docs/plans/2026-09-12-unrelated.md';
  put(
    path,
    '---\nreview_scopes: []\nreview_basis: []\nwork_kind: workflow\n---\nStatus: In progress\n'
  );
  assert.equal(validate(root, index).unassociatedPlans, 0);
  assert.equal(validate(root, index).explicitlyUnscopedPlans, 1);
  assert.throws(() => draftExecution(root, index, path), /Associate the plan/);
  put(
    path,
    '---\nreview_scopes: [missing]\nreview_basis: []\nwork_kind: workflow\n---\nStatus: In progress\n'
  );
  assert.throws(() => validate(root, index), /Unknown plan scope/);
  put(
    path,
    '---\nreview_scopes: []\nreview_basis: []\nwork_kind: workflow\n---\nStatus: In progress\n- goal_status: active\n'
  );
  assert.throws(() => validate(root, index), /one lifecycle Status/);
  rmSync(join(root, path));
  index.documents = [
    {
      path: 'docs/evidence.md',
      scopes: ['comments'],
      kind: 'specification',
      disposition: 'historial',
      rationale: 'A typo must not silently classify this as inspected.',
    },
  ];
  assert.throws(() => validate(root, index), /Classify inspected document/);
});

test('historical imports stay visible without forcing unrelated old executions into every repeated review', (t) => {
  const { root, put, index } = fixture(t);
  const first = completed(root, index);
  recordReview(root, index, first);
  const plan = 'docs/plans/2026-01-01-historical.md';
  put(
    plan,
    '---\nreview_scopes: [comments]\nreview_basis: []\nwork_kind: implementation\n---\nStatus: Complete\n'
  );
  const execution = {
    ...draftExecution(root, index, plan),
    id: '2026-09-15-recovered-history',
    summary: 'Unbound historic completion; execution date unknown.',
    proof: {
      state: 'unknown',
      evidence: [],
      limits: 'No source binding recovered.',
    },
  };
  recordReview(root, index, execution);
  const next = completed(root, index, { id: '2026-09-16-comments-stop' });
  assert.deepEqual(
    next.reconciliation.map((entry) => entry.record),
    [first.id]
  );
  recordReview(root, index, next);
  put('docs/research/review-index.json', JSON.stringify(index));
  assert.ok(
    main(root, ['lookup', 'comments', '--detail'])[0].history.some(
      (record) => record.id === execution.id
    )
  );
});
