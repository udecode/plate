import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  check,
  coverage,
  integrity,
  draftExecution,
  draftReview,
  freshness,
  loadLedger,
  lookup,
  main,
  next,
  observe,
  orderUnits,
  record,
  recordsDir,
  scopesDir,
  searchResearch,
  show,
  status,
} from './review-ledger.mjs';

const digest = (value) => createHash('sha256').update(value).digest('hex');
const script = fileURLToPath(new URL('./review-ledger.mjs', import.meta.url));

function scope(id, fields = {}) {
  return {
    id,
    title: id,
    question: `Who owns ${id}?`,
    dependsOn: [],
    last: false,
    opportunity: { score: 5, reason: 'A bounded owner question.' },
    owners: [`packages/core/src/${id}/`],
    members: [`packages/core/src/${id}/`],
    consumers: ['docs/evidence.md'],
    proof: [`packages/core/src/${id}/${id}.spec.ts`],
    relatedScopes: [],
    ...fields,
  };
}

function fixture(t, scopes = [scope('comments'), scope('link')]) {
  const root = mkdtempSync(join(tmpdir(), 'plate-review-ledger-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const put = (path, value) => {
    mkdirSync(join(root, dirname(path)), { recursive: true });
    writeFileSync(
      join(root, path),
      typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`
    );
  };
  const git = (...args) =>
    execFileSync('git', ['-C', root, ...args], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  const commit = () => {
    git('add', '-A');
    git(
      '-c',
      'user.email=fixture@example.com',
      '-c',
      'user.name=fixture',
      'commit',
      '-qm',
      'fixture'
    );
  };
  git('init', '-q');
  for (const item of scopes) {
    put(`packages/core/src/${item.id}/index.ts`, `export const ${item.id} = 1;`);
    put(`packages/core/src/${item.id}/${item.id}.spec.ts`, `test('${item.id}');`);
    put(`${scopesDir}/${item.id}.json`, item);
  }
  put('docs/evidence.md', 'Observed behavior and alternatives.');
  put('VISION.md', 'Doctrine.');
  mkdirSync(join(root, recordsDir), { recursive: true });
  mkdirSync(join(root, 'docs/plite/research'), { recursive: true });
  commit();
  return { root, put, git, commit };
}

function completed(draft, fields = {}) {
  return {
    ...draft,
    model: 'fixture-model',
    trigger: 'The owner asked for a review.',
    requirements: ['Keep one owner for comment ranges.'],
    evidenceReuse: 'First observation of the fixture source.',
    summary: 'Keep the existing owner.',
    verdict: 'stop',
    alternatives: [
      'Keep the owner: it has an independent range lifetime.',
      'Delete the owner: the consumer still needs mapped ranges.',
    ],
    proofLimits: 'Fixture source only.',
    references: ['docs/evidence.md'],
    reconciliation: draft.reconciliation.map((entry) => ({
      ...entry,
      action: entry.action || 'retains',
      reason: entry.reason || 'The same evidence still holds.',
    })),
    ...fields,
  };
}

function recordReview(root, put, scopeId, fields = {}) {
  const { draft } = draftReview(root, scopeId);
  const value = completed(draft, fields);
  put(`drafts/${value.id}.json`, value);
  return record(root, `drafts/${value.id}.json`);
}

function recordExecution(root, put, plan, fields = {}) {
  const { draft } = draftExecution(root, plan);
  const value = {
    ...draft,
    summary: 'Implemented the governing Pursue.',
    proof: { state: 'partial', evidence: [], limits: 'Fixture proof only.' },
    ...fields,
  };
  put(`drafts/${value.id}.json`, value);
  return record(root, `drafts/${value.id}.json`);
}

function plan(put, path, { scopes, basis, workKind = 'implementation', state }) {
  put(
    path,
    `---\nreview_scopes: [${scopes.join(', ')}]\nreview_basis: [${basis.join(', ')}]\nwork_kind: ${workKind}\n---\n\n# Plan\n\nStatus: ${state}\n`
  );
}

const openOf = (root, id) =>
  status(root).open.find((item) => item.id === id)?.open ?? null;

test('retaining a completed execution does not adopt a new Pursue', (t) => {
  const { root, put } = fixture(t);
  recordReview(root, put, 'comments', {
    id: '2026-09-01-comments',
    verdict: 'pursue',
    callSites: { current: 'a()', proposed: 'b()' },
  });
  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    state: 'executed',
  });
  recordExecution(root, put, 'docs/plans/2026-09-02-comments.md', {
    id: '2026-09-02-comments-execution',
    outcome: 'completed',
  });
  assert.equal(openOf(root, 'comments'), null);

  recordReview(root, put, 'comments', {
    id: '2026-09-03-comments',
    verdict: 'pursue',
    relation: 'supersedes',
    callSites: { current: 'b()', proposed: 'c()' },
  });

  assert.equal(openOf(root, 'comments'), 'pursue-not-adopted');
});

test('only a completed implementation or workflow execution adopts its Pursue', (t) => {
  const { root, put } = fixture(t);
  recordReview(root, put, 'comments', {
    id: '2026-09-01-comments',
    verdict: 'pursue',
    callSites: { current: 'a()', proposed: 'b()' },
  });
  plan(put, 'docs/plans/2026-09-02-design.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    workKind: 'design',
    state: 'done',
  });
  recordExecution(root, put, 'docs/plans/2026-09-02-design.md', {
    id: '2026-09-02-design-execution',
    outcome: 'completed',
  });

  assert.equal(openOf(root, 'comments'), 'pursue-not-adopted');
});

test('an imported execution without a recovered binding never adopts', (t) => {
  const { root, put } = fixture(t);
  recordReview(root, put, 'comments', {
    id: '2026-09-01-comments',
    verdict: 'pursue',
    callSites: { current: 'a()', proposed: 'b()' },
  });
  put(`${recordsDir}/2026-09-02-imported.json`, {
    id: '2026-09-02-imported',
    kind: 'execution',
    date: '2026-09-02',
    scopes: ['comments'],
    reviewBasis: ['2026-09-01-comments'],
    workKind: 'implementation',
    plan: { path: 'docs/evidence.md', sha256: digest('x') },
    binding: 'historical-unbound',
    outcome: 'completed',
    summary: 'Imported claim.',
    proof: { state: 'unknown', evidence: [], limits: 'Imported.' },
    source: null,
    references: ['docs/evidence.md'],
  });

  assert.notEqual(openOf(root, 'comments'), null);
});

test('recording one scope ignores every other session’s unfinished state', (t) => {
  const { root, put } = fixture(t, [
    scope('comments'),
    scope('link'),
    scope('table'),
  ]);
  const { draft } = draftReview(root, 'comments');
  put('drafts/comments.json', completed(draft));
  put('packages/core/src/typed-text.ts', 'export const wip = 1;');
  put('packages/core/src/link/index.ts', 'export const link = 2;');
  put('VISION.md', 'Doctrine, edited.');
  put(`${recordsDir}/2026-09-09-half-written.json`, '{ "id": ');
  put(`${recordsDir}/2026-09-09-bad-shape.json`, {
    id: '2026-09-09-bad-shape',
    kind: 'execution',
    date: '2026-09-09',
    scopes: {},
  });
  put(`${recordsDir}/2026-09-09-bad-date.json`, {
    id: '2026-09-09-bad-date',
    kind: 'review',
    scope: 'link',
    date: ['2026-09-09'],
  });
  put(`${recordsDir}/2026-09-09-bad-upstream.json`, {
    id: '2026-09-09-bad-upstream',
    kind: 'review',
    scope: 'link',
    date: '2026-09-09',
    upstreams: [null],
  });
  put('docs/research/review-legacy.json', [null]);
  put(`${scopesDir}/link.json`, scope('link', { dependsOn: ['table'], prerequisiteReason: 'Cycle.' }));
  put(`${scopesDir}/table.json`, scope('table', { dependsOn: ['link'], prerequisiteReason: 'Cycle.' }));
  put('docs/plans/2026-09-09-other.md', '---\nreview_scopes: [link]\nreview_basis: [missing]\nwork_kind: design\n---\n\nStatus: building\nStatus: done\n');
  put('docs/research/review-documents.json', [
    { path: 'docs/plans/deleted.md', scopes: ['link'], kind: 'plan', disposition: 'historical', rationale: 'Gone.' },
  ]);

  const result = record(root, 'drafts/comments.json');

  assert.equal(result.recorded, `${recordsDir}/${draft.id}.json`);
  assert.equal(coverage(root).unowned.total, 1);
  assert.equal(status(root).scopes, 3);
  assert.ok(next(root).unit);
});

test('a broken foreign scope file fails check but not another scope’s record', (t) => {
  const { root, put } = fixture(t);
  put(`${scopesDir}/link.json`, '{ not json');
  const { draft } = draftReview(root, 'comments');
  put('drafts/comments.json', completed(draft));

  assert.ok(record(root, 'drafts/comments.json').recorded);
  assert.throws(() => check(root), /link\.json/);
});

test('record refuses a stale previous and names the new head', (t) => {
  const { root, put } = fixture(t);
  const first = draftReview(root, 'comments').draft;
  const second = { ...first, id: '2026-09-02-other' };
  put('drafts/a.json', completed(first));
  put('drafts/b.json', completed(second));
  record(root, 'drafts/a.json');

  assert.throws(
    () => record(root, 'drafts/b.json'),
    new RegExp(`head of comments is ${first.id}`)
  );
});

test('a review must reconcile a bound execution recorded after its previous', (t) => {
  const { root, put } = fixture(t);
  recordReview(root, put, 'comments', {
    id: '2026-09-01-comments',
    verdict: 'pursue',
    callSites: { current: 'a()', proposed: 'b()' },
  });
  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    state: 'building',
  });
  recordExecution(root, put, 'docs/plans/2026-09-02-comments.md', {
    id: '2026-09-02-comments-execution',
  });
  const { draft } = draftReview(root, 'comments');
  const value = completed(draft, {
    reconciliation: [
      { record: '2026-09-01-comments', action: 'retains', reason: 'Same.' },
    ],
    verdict: 'pursue',
    callSites: { current: 'a()', proposed: 'b()' },
  });
  put('drafts/next.json', value);

  assert.throws(
    () => record(root, 'drafts/next.json'),
    /Reconcile 2026-09-02-comments-execution/
  );
});

test('a changed verdict cannot retain its previous review', (t) => {
  const { root, put } = fixture(t);
  recordReview(root, put, 'comments', { id: '2026-09-01-comments' });
  const { draft } = draftReview(root, 'comments');
  put(
    'drafts/next.json',
    completed(draft, {
      verdict: 'pursue',
      callSites: { current: 'a()', proposed: 'b()' },
    })
  );

  assert.throws(
    () => record(root, 'drafts/next.json'),
    /changed verdict must reopen or supersede/
  );
});

test('recording is idempotent and refuses an id that exists with other content', (t) => {
  const { root, put } = fixture(t);
  const { draft } = draftReview(root, 'comments');
  put('drafts/a.json', completed(draft));
  record(root, 'drafts/a.json');

  assert.equal(record(root, 'drafts/a.json').duplicate, true);
  put('drafts/b.json', completed(draft, { summary: 'Different.' }));
  assert.throws(() => record(root, 'drafts/b.json'), /already exists/);
});

test('concurrent records of one id leave one complete file', async (t) => {
  const { root, put } = fixture(t);
  const { draft } = draftReview(root, 'comments');
  put('drafts/a.json', completed(draft, { summary: 'From session A.' }));
  put('drafts/b.json', completed(draft, { summary: 'From session B.' }));
  const run = (path) =>
    new Promise((done) => {
      const child = spawn(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          `import { record } from ${JSON.stringify(script)}; try { record(${JSON.stringify(root)}, ${JSON.stringify(path)}); process.exit(0) } catch { process.exit(1) }`,
        ],
        { stdio: 'ignore' }
      );
      child.on('exit', done);
    });

  const codes = await Promise.all([run('drafts/a.json'), run('drafts/b.json')]);

  assert.deepEqual([...codes].sort(), [0, 1]);
  const files = readdirSync(join(root, recordsDir));
  assert.deepEqual(files, [`${draft.id}.json`]);
  assert.match(
    readFileSync(join(root, recordsDir, files[0]), 'utf-8'),
    /From session [AB]\./
  );
});

test('an input moved after the draft records and reads stale with its path', (t) => {
  const { root, put } = fixture(t);
  const { draft } = draftReview(root, 'comments');
  put('drafts/a.json', completed(draft));
  put('packages/core/src/comments/index.ts', 'export const comments = 2;');

  const result = record(root, 'drafts/a.json');

  assert.deepEqual(result.changedSinceDraft, ['packages/core/src/comments/']);
  const [item] = lookup(root, 'comments');
  assert.equal(item.freshness.state, 'stale');
  assert.deepEqual(item.freshness.changed.items, ['packages/core/src/comments/']);
});

test('a doctrine edit moves the law clock without staling source', (t) => {
  const { root, put } = fixture(t);
  recordReview(root, put, 'comments');
  put('VISION.md', 'Doctrine, edited.');

  const [item] = lookup(root, 'comments');

  assert.equal(item.freshness.state, 'matching');
  assert.deepEqual(item.freshness.lawMoved.items, ['VISION.md']);
});

test('legacy group digests read unknown, never matching, and stale once a file moves', (t) => {
  const { root, put, commit } = fixture(t);
  const legacy = {
    id: '2026-09-01-comments-legacy',
    kind: 'review',
    scope: 'comments',
    date: '2026-09-01',
    question: 'Who owns comments?',
    verdict: 'stop',
    previous: null,
    relation: 'initial',
    summary: 'Legacy.',
    references: ['docs/evidence.md'],
    source: {
      files: {
        'packages/core/src/comments/index.ts': digest('export const comments = 1;'),
        'pnpm-lock.yaml': digest('anything'),
      },
      features: { 'core/comments': digest('group') },
    },
  };
  put(`${recordsDir}/${legacy.id}.json`, legacy);
  commit();
  const tree = observe(root);
  const read = () => freshness(tree, loadLedger(root).records.get(legacy.id));

  assert.equal(read().state, 'unknown');
  put('packages/core/src/comments/index.ts', 'export const comments = 2;');
  assert.equal(freshness(observe(root), loadLedger(root).records.get(legacy.id)).state, 'stale');
});

test('directory digests keep the legacy per-directory name order', (t) => {
  const { root, put } = fixture(t);
  for (const path of ['a/b.ts', 'a/b/c.ts', 'a/b-c.ts', 'a/b_d.ts']) {
    put(`packages/core/src/order/${path}`, path);
  }
  const walk = (dir) =>
    readdirSync(join(root, dir), { withFileTypes: true })
      .sort((x, y) => x.name.localeCompare(y.name))
      .flatMap((entry) =>
        entry.isDirectory()
          ? walk(`${dir}/${entry.name}`)
          : [`${dir}/${entry.name}`]
      );
  const legacy = digest(
    walk('packages/core/src/order')
      .map((path) => `${path}\0${digest(readFileSync(join(root, path)))}`)
      .join('\n')
  );

  assert.equal(observe(root).digest('packages/core/src/order/'), legacy);
});

test('check fails on an edited committed record and a broken reference, not on source edits', (t) => {
  const { root, put, commit } = fixture(t);
  const result = recordReview(root, put, 'comments');
  commit();
  put('packages/core/src/link/index.ts', 'export const link = 3;');
  assert.equal(check(root).ok, true);

  const text = readFileSync(join(root, result.recorded), 'utf-8');
  writeFileSync(join(root, result.recorded), text.replace('Keep', 'Drop'));
  assert.throws(() => check(root), new RegExp(result.recorded));

  writeFileSync(join(root, result.recorded), text);
  put(`${recordsDir}/2026-09-09-dangling.json`, {
    id: '2026-09-09-dangling',
    kind: 'review',
    scope: 'link',
    date: '2026-09-09',
    previous: '2026-01-01-missing',
    reconciliation: [],
  });
  assert.throws(() => check(root), /previous 2026-01-01-missing/);
});

test('two reviews from one previous fork the scope until a review reconciles both', (t) => {
  const { root, put } = fixture(t);
  recordReview(root, put, 'comments', { id: '2026-09-01-comments' });
  const { draft } = draftReview(root, 'comments');
  for (const id of ['2026-09-02-a', '2026-09-02-b']) {
    put(`${recordsDir}/${id}.json`, completed({ ...draft, id }));
  }
  assert.equal(openOf(root, 'comments'), 'fork');

  const next = draftReview(root, 'comments').draft;
  assert.deepEqual(
    next.reconciliation.map((entry) => entry.record).sort(),
    ['2026-09-02-a', '2026-09-02-b']
  );
  put('drafts/resolve.json', completed(next));
  record(root, 'drafts/resolve.json');
  assert.equal(openOf(root, 'comments'), null);
});

test('coverage lists unowned source, skips ignored files and lets a directory member own new files', (t) => {
  const { root, put } = fixture(t);
  put('.gitignore', 'packages/core/src/secret/\n');
  put('packages/core/src/secret/key.ts', 'export const key = 1;');
  put('packages/core/src/orphan/index.ts', 'export const orphan = 1;');
  put('packages/core/src/comments/new.ts', 'export const added = 1;');

  const result = coverage(root);

  assert.deepEqual(Object.values(result.unowned.byDirectory).flat(), [
    'packages/core/src/orphan/index.ts',
  ]);
});

test('a path lookup for unowned source exits with the owners of nearby files', (t) => {
  const { root, put } = fixture(t);
  put('packages/core/src/comments/wip/draft.ts', 'export const wip = 1;');
  put(
    `${scopesDir}/comments.json`,
    scope('comments', { members: ['packages/core/src/comments/index.ts'] })
  );

  assert.throws(
    () => lookup(root, 'packages/core/src/comments/wip/draft.ts'),
    /No scope owns packages\/core\/src\/comments\/wip\/draft\.ts/
  );
});

test('a completed execution needs a landed plan whose front matter matches', (t) => {
  const { root, put } = fixture(t);
  recordReview(root, put, 'comments', {
    id: '2026-09-01-comments',
    verdict: 'pursue',
    callSites: { current: 'a()', proposed: 'b()' },
  });
  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    state: 'building',
  });
  assert.throws(
    () =>
      recordExecution(root, put, 'docs/plans/2026-09-02-comments.md', {
        outcome: 'completed',
      }),
    /landed plan Status/
  );
  assert.throws(
    () =>
      recordExecution(root, put, 'docs/plans/2026-09-02-comments.md', {
        workKind: 'workflow',
      }),
    /must match the plan association/
  );

  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    state: 'executed, folded into the subject',
  });
  assert.equal(draftExecution(root, 'docs/plans/2026-09-02-comments.md').draft.outcome, 'completed');
});

test('a landed plan for the head with no execution reads pursue-unbound', (t) => {
  const { root, put } = fixture(t);
  recordReview(root, put, 'comments', {
    id: '2026-09-01-comments',
    verdict: 'pursue',
    callSites: { current: 'a()', proposed: 'b()' },
  });
  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    state: 'done',
  });

  assert.equal(openOf(root, 'comments'), 'pursue-unbound');
});

test('queue order honours dependencies, groups and AI-last over payoff', (t) => {
  const { root, put } = fixture(t, [
    scope('model', { opportunity: { score: 3, reason: 'Base.' } }),
    scope('table', {
      dependsOn: ['model'],
      prerequisiteReason: 'Tables need the model.',
      opportunity: { score: 9, reason: 'Hot.' },
    }),
    scope('ai', { last: true, opportunity: { score: 10, reason: 'Last.' } }),
    scope('runtime', { group: 'core', opportunity: { score: 4, reason: 'Core.' } }),
    scope('state', { group: 'core', opportunity: { score: 6, reason: 'Core.' } }),
  ]);
  put('docs/research/review-groups.json', {
    core: { title: 'Core', reason: 'Reviewed together.' },
  });

  assert.deepEqual(
    orderUnits(loadLedger(root)).map((unit) => unit.id),
    ['core', 'model', 'table', 'ai']
  );
  put(`${scopesDir}/model.json`, scope('model', {
    dependsOn: ['table'],
    prerequisiteReason: 'Cycle.',
  }));
  assert.throws(() => orderUnits(loadLedger(root), { strict: true }), /cycle/);
  const ledger = loadLedger(root);
  assert.equal(orderUnits(ledger).length, 4);
  assert.match(ledger.warnings.join('\n'), /cycle/);
});

test('research search keeps headers, exact status and malformed-row warnings', (t) => {
  const { root, put } = fixture(t);
  put(
    'docs/plite/research/2026-01-02-second/lead-ledger.tsv',
    'claim\tdecision\tstatus\ncomment range\tpursue\tdeferred-proof\ncomment malformed\n'
  );
  put('docs/plite/research/2026-01-02-second/read-log.tsv', 'claim\tstatus\ncomment\t\n');

  const result = searchResearch(root, 'comment');

  assert.equal(
    result.matches.find((item) => item.row?.claim === 'comment range').status,
    'deferred-proof'
  );
  assert.deepEqual(
    result.matches.find((item) => item.row === null).rawCells,
    ['comment malformed']
  );
  assert.equal(result.matches.find((item) => item.row?.claim === 'comment').row.status, '');
  assert.equal(result.warnings.length, 1);
});

test('the CLI drafts, dry-runs and records without writing anything else', (t) => {
  const { root, put, git } = fixture(t);
  const draft = main(root, ['draft', 'comments']);
  put('drafts/a.json', completed(draft));
  git('add', '-A');

  const dry = main(root, ['record', 'drafts/a.json', '--dry-run']);
  assert.equal(dry.valid, true);
  assert.equal(existsSync(join(root, recordsDir, `${draft.id}.json`)), false);

  main(root, ['record', 'drafts/a.json']);
  assert.deepEqual(
    git('status', '--porcelain', '--untracked-files=all').trim().split('\n'),
    ['A  drafts/a.json', `?? ${recordsDir}/${draft.id}.json`]
  );
});

test('a later partial execution of the same Pursue undoes its adoption', (t) => {
  const { root, put } = fixture(t);
  recordReview(root, put, 'comments', {
    id: '2026-09-01-comments',
    verdict: 'pursue',
    callSites: { current: 'a()', proposed: 'b()' },
  });
  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    state: 'executed',
  });
  recordExecution(root, put, 'docs/plans/2026-09-02-comments.md', {
    id: '2026-09-02-first',
    outcome: 'completed',
  });
  assert.equal(openOf(root, 'comments'), null);

  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    state: 'reopened, closure gaps remain',
  });
  assert.throws(
    () =>
      recordExecution(root, put, 'docs/plans/2026-09-02-comments.md', {
        id: '2026-09-02-second',
        previous: [],
      }),
    /previous: 2026-09-02-first/
  );
  recordExecution(root, put, 'docs/plans/2026-09-02-comments.md', {
    id: '2026-09-02-second',
  });

  assert.equal(openOf(root, 'comments'), 'pursue-not-adopted');
});

test('a historical import beside a review does not fork the scope', (t) => {
  const { root, put } = fixture(t);
  recordReview(root, put, 'comments', { id: '2026-09-01-comments' });
  put(`${recordsDir}/2026-08-01-imported.json`, {
    id: '2026-08-01-imported',
    kind: 'historical',
    scope: 'comments',
    date: '2026-08-01',
    verdict: null,
    previous: null,
    relation: 'historical-context',
    summary: 'Older context.',
    references: ['docs/evidence.md'],
    source: null,
  });

  assert.equal(openOf(root, 'comments'), null);
});

test('a plan classified in review-documents.json drafts an execution', (t) => {
  const { root, put } = fixture(t);
  put('docs/plans/2026-03-15-table.md', '# Old plan\n\nStatus: done\n');
  put('docs/research/review-documents.json', [
    {
      path: 'docs/plans/2026-03-15-table.md',
      scopes: ['link'],
      kind: 'plan',
      disposition: 'historical',
      rationale: 'Inspected: it executed link work.',
      workKind: 'verification',
    },
  ]);

  const { draft } = draftExecution(root, 'docs/plans/2026-03-15-table.md');

  assert.deepEqual(draft.scopes, ['link']);
  assert.equal(draft.workKind, 'verification');
  assert.equal(draft.outcome, 'completed');
});

test('check catches a staged edit to a record that was never committed', (t) => {
  const { root, put, git } = fixture(t);
  const result = recordReview(root, put, 'comments');
  git('add', '-A');
  assert.equal(check(root).ok, true);

  const text = readFileSync(join(root, result.recorded), 'utf-8');
  writeFileSync(join(root, result.recorded), text.replace('Keep', 'Drop'));
  git('add', '-A');

  assert.throws(() => check(root));
});

test('check catches a staged edit to an uncommitted legacy record', (t) => {
  const { root, put, git } = fixture(t);
  const legacy = {
    id: '2026-09-01-legacy',
    kind: 'historical',
    scope: 'comments',
    date: '2026-09-01',
    verdict: null,
    previous: null,
    relation: 'historical-context',
    summary: 'Imported.',
    references: ['docs/evidence.md'],
    source: null,
  };
  put(`${recordsDir}/${legacy.id}.json`, legacy);
  put('docs/research/review-legacy.json', [
    {
      id: legacy.id,
      sha256: digest(readFileSync(join(root, recordsDir, `${legacy.id}.json`))),
    },
  ]);
  git('add', '-A');
  put(`${recordsDir}/${legacy.id}.json`, { ...legacy, summary: 'Edited.' });
  git('add', '-A');

  assert.throws(() => check(root));
});

test('a changed proof artifact makes its execution stale', (t) => {
  const { root, put } = fixture(t);
  recordReview(root, put, 'comments', {
    id: '2026-09-01-comments',
    verdict: 'pursue',
    callSites: { current: 'a()', proposed: 'b()' },
  });
  put('docs/proof/report.md', 'Passed.');
  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    state: 'building',
  });
  recordExecution(root, put, 'docs/plans/2026-09-02-comments.md', {
    id: '2026-09-02-execution',
    proof: {
      state: 'partial',
      evidence: [{ path: 'docs/proof/report.md', claim: 'The run passed.' }],
      limits: 'One run.',
    },
  });
  put('docs/proof/report.md', 'Failed.');

  const ledger = loadLedger(root);
  const result = freshness(observe(root), ledger.records.get('2026-09-02-execution'));

  assert.equal(result.state, 'stale');
  assert.deepEqual(result.changed, ['docs/proof/report.md']);
});

test('lookup still resolves a retired feature-group name through the records that bound it', (t) => {
  const { root, put } = fixture(t);
  put(`${recordsDir}/2026-09-01-legacy.json`, {
    id: '2026-09-01-legacy',
    kind: 'review',
    scope: 'link',
    date: '2026-09-01',
    verdict: 'stop',
    previous: null,
    relation: 'initial',
    summary: 'Legacy.',
    references: ['docs/evidence.md'],
    source: { files: {}, features: { 'ui/link-floating-toolbar': digest('x') } },
  });

  assert.deepEqual(
    lookup(root, 'floating-toolbar').map((item) => item.id),
    ['link']
  );
});

test('a reopened Status beside an old completion label cannot record a completed execution', (t) => {
  const { root, put } = fixture(t);
  recordReview(root, put, 'comments', {
    id: '2026-09-01-comments',
    verdict: 'pursue',
    callSites: { current: 'a()', proposed: 'b()' },
  });
  put(
    'docs/plans/2026-09-02-comments.md',
    '---\nreview_scopes: [comments]\nreview_basis: [2026-09-01-comments]\nwork_kind: implementation\n---\n\n# Plan\n\n- goal_status: complete\n\nStatus: reopened, a regression returned\n'
  );

  assert.equal(draftExecution(root, 'docs/plans/2026-09-02-comments.md').draft.outcome, 'partial');
  assert.throws(
    () =>
      recordExecution(root, put, 'docs/plans/2026-09-02-comments.md', {
        outcome: 'completed',
      }),
    /one landed plan status/
  );
});

test('check catches an execution whose previous execution is gone', (t) => {
  const { root, put } = fixture(t);
  recordReview(root, put, 'comments', {
    id: '2026-09-01-comments',
    verdict: 'pursue',
    callSites: { current: 'a()', proposed: 'b()' },
  });
  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    state: 'building',
  });
  recordExecution(root, put, 'docs/plans/2026-09-02-comments.md', { id: '2026-09-02-first' });
  recordExecution(root, put, 'docs/plans/2026-09-02-comments.md', { id: '2026-09-02-second' });
  rmSync(join(root, recordsDir, '2026-09-02-first.json'));

  assert.throws(() => check(root), /2026-09-02-second\.json: previous/);
});

test('a malformed foreign execution does not block another scope’s execution draft', (t) => {
  const { root, put } = fixture(t);
  recordReview(root, put, 'comments', {
    id: '2026-09-01-comments',
    verdict: 'pursue',
    callSites: { current: 'a()', proposed: 'b()' },
  });
  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    state: 'building',
  });
  put(`${recordsDir}/2026-09-09-foreign.json`, {
    id: '2026-09-09-foreign',
    kind: 'execution',
    date: '2026-09-09',
    scopes: ['link'],
    binding: 'current',
    workKind: 'implementation',
    reviewBasis: {},
  });

  const result = recordExecution(root, put, 'docs/plans/2026-09-02-comments.md', {
    id: '2026-09-02-execution',
  });

  assert.ok(result.recorded);
  assert.throws(() => check(root), /2026-09-09-foreign\.json: malformed record/);
});

test('a review must reconcile an execution recorded after its previous review even when drafted before it', (t) => {
  const { root, put } = fixture(t);
  recordReview(root, put, 'comments', {
    id: '2026-09-01-comments',
    verdict: 'pursue',
    callSites: { current: 'a()', proposed: 'b()' },
  });
  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    state: 'building',
  });
  const { draft } = draftExecution(root, 'docs/plans/2026-09-02-comments.md');
  recordReview(root, put, 'comments', {
    id: '2026-09-03-comments',
    verdict: 'pursue',
    callSites: { current: 'a()', proposed: 'b()' },
  });
  put('drafts/late.json', {
    ...draft,
    id: '2026-09-02-late-execution',
    date: '2026-09-02',
    summary: 'Drafted before the second review, recorded after it.',
    proof: { state: 'partial', evidence: [], limits: 'Fixture.' },
  });
  record(root, 'drafts/late.json');

  assert.ok(
    draftReview(root, 'comments').draft.reconciliation.some(
      (entry) => entry.record === '2026-09-02-late-execution'
    )
  );
});

test('record refuses a record its own readers could not read', (t) => {
  const { root, put } = fixture(t);
  const { draft } = draftReview(root, 'comments');
  put('drafts/a.json', completed(draft, { upstreams: [null] }));

  assert.throws(() => record(root, 'drafts/a.json'), /upstreams is malformed/);
});

test('check catches a committed deletion of a record recorded after the cutover', (t) => {
  const { root, put, commit, git } = fixture(t);
  put('docs/research/review-legacy.json', []);
  commit();
  const result = recordReview(root, put, 'comments');
  commit();
  assert.equal(check(root).ok, true);

  git('rm', '-q', result.recorded);
  commit();

  assert.throws(() => check(root), new RegExp(`deleted: ${result.recorded}`));
});

test('check catches a hand-written record that breaks the record contract', (t) => {
  const { root, put } = fixture(t);
  recordReview(root, put, 'comments', {
    id: '2026-09-01-comments',
    verdict: 'pursue',
    callSites: { current: 'a()', proposed: 'b()' },
  });
  const forged = {
    id: '2026-09-02-forged',
    kind: 'execution',
    date: '2026-09-02',
    scopes: ['comments'],
    reviewBasis: ['2026-09-01-comments'],
    workKind: 'implementation',
    previous: [],
    plan: 'docs/evidence.md',
    outcome: 'completed',
    summary: 'Claims adoption.',
    proof: { state: 'verified', evidence: [], limits: 'None.' },
    references: ['docs/evidence.md'],
    inputs: {},
    upstreams: [],
  };
  put(`${recordsDir}/${forged.id}.json`, {
    ...forged,
    digest: digest(`${JSON.stringify(forged, null, 2)}\n`),
  });

  assert.throws(() => check(root), /Verified proof needs/);
});

test('retrying an execution draft without proof hashes stays a duplicate after the proof file changes', (t) => {
  const { root, put } = fixture(t);
  recordReview(root, put, 'comments', {
    id: '2026-09-01-comments',
    verdict: 'pursue',
    callSites: { current: 'a()', proposed: 'b()' },
  });
  put('docs/proof/report.md', 'Passed.');
  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    state: 'building',
  });
  const { draft } = draftExecution(root, 'docs/plans/2026-09-02-comments.md');
  put('drafts/e.json', {
    ...draft,
    id: '2026-09-02-execution',
    summary: 'Implemented.',
    proof: {
      state: 'partial',
      evidence: [{ path: 'docs/proof/report.md', claim: 'The run passed.' }],
      limits: 'One run.',
    },
  });
  record(root, 'drafts/e.json');
  put('docs/proof/report.md', 'Failed.');

  assert.equal(record(root, 'drafts/e.json').duplicate, true);
});

test('strict queue order catches a dependency cycle inside a review group', (t) => {
  const { root, put } = fixture(t, [
    scope('runtime', { group: 'core', dependsOn: ['state'], prerequisiteReason: 'Cycle.' }),
    scope('state', { group: 'core', dependsOn: ['runtime'], prerequisiteReason: 'Cycle.' }),
  ]);
  put('docs/research/review-groups.json', {
    core: { title: 'Core', reason: 'Reviewed together.' },
  });

  assert.throws(() => orderUnits(loadLedger(root), { strict: true }), /cycle/);
});

test('status reports a changed record as an integrity problem without failing', (t) => {
  const { root, put } = fixture(t);
  const result = recordReview(root, put, 'comments');
  const text = readFileSync(join(root, result.recorded), 'utf-8');
  writeFileSync(join(root, result.recorded), text.replace('Keep', 'Drop'));

  assert.match(status(root).integrity.join('\n'), /changed since it was recorded/);
});

test('a supplied proof digest does not admit a proof file that does not exist', (t) => {
  const { root, put } = fixture(t);
  recordReview(root, put, 'comments', {
    id: '2026-09-01-comments',
    verdict: 'pursue',
    callSites: { current: 'a()', proposed: 'b()' },
  });
  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    state: 'building',
  });

  assert.throws(
    () =>
      recordExecution(root, put, 'docs/plans/2026-09-02-comments.md', {
        proof: {
          state: 'partial',
          evidence: [{ path: 'docs/proof/gone.md', sha256: digest('x'), claim: 'Passed.' }],
          limits: 'One run.',
        },
      }),
    /Missing proof file: docs\/proof\/gone\.md/
  );
});

test('invalid plan front matter is reported instead of falling back to a classified entry', (t) => {
  const { root, put } = fixture(t);
  put('docs/plans/2026-09-02-table.md', '---\nreview_scopes: link\n---\n\n# Plan\n\nStatus: done\n');
  put('docs/research/review-documents.json', [
    {
      path: 'docs/plans/2026-09-02-table.md',
      scopes: ['link'],
      kind: 'plan',
      disposition: 'historical',
      rationale: 'Old link work.',
      workKind: 'verification',
    },
  ]);

  assert.throws(
    () => draftExecution(root, 'docs/plans/2026-09-02-table.md'),
    /metadata is invalid: review_scopes/
  );
  assert.match(check(root).warnings.join('\n'), /2026-09-02-table\.md: invalid review_scopes/);
});

test('show lists the plans associated with a scope', (t) => {
  const { root, put } = fixture(t);
  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: [],
    workKind: 'design',
    state: 'done',
  });

  assert.match(show(root, 'comments'), /docs\/plans\/2026-09-02-comments\.md: done; design/);
});

test('integrity reports a legacy record deleted after loading instead of throwing', (t) => {
  const { root, put } = fixture(t);
  const legacy = { id: '2026-09-01-legacy', kind: 'historical', scope: 'comments', date: '2026-09-01', verdict: null, previous: null, relation: 'historical-context', summary: 'Imported.', references: ['docs/evidence.md'], source: null };
  put(`${recordsDir}/${legacy.id}.json`, legacy);
  put('docs/research/review-legacy.json', [
    { id: legacy.id, sha256: digest(readFileSync(join(root, recordsDir, `${legacy.id}.json`))) },
  ]);
  const ledger = loadLedger(root);
  rmSync(join(root, recordsDir, `${legacy.id}.json`));

  assert.deepEqual(integrity(root, ledger), []);
});

test('a committed record restored byte for byte reads clean again', (t) => {
  const { root, put, commit, git } = fixture(t);
  put('docs/research/review-legacy.json', []);
  commit();
  const result = recordReview(root, put, 'comments');
  commit();
  const bytes = readFileSync(join(root, result.recorded));
  git('rm', '-q', result.recorded);
  commit();
  mkdirSync(join(root, recordsDir), { recursive: true });
  writeFileSync(join(root, result.recorded), bytes);
  commit();

  assert.equal(check(root).ok, true);
});

test('check catches a forged entry committed into the legacy checksum list', (t) => {
  const { root, put, commit } = fixture(t);
  put('docs/research/review-legacy.json', []);
  commit();
  const forged = { id: '2026-09-02-forged', kind: 'historical', scope: 'comments', date: '2026-09-02', verdict: 'stop', previous: null, relation: 'historical-context', summary: 'Forged.', references: ['docs/evidence.md'], source: null };
  put(`${recordsDir}/${forged.id}.json`, forged);
  put('docs/research/review-legacy.json', [
    { id: forged.id, sha256: digest(readFileSync(join(root, recordsDir, `${forged.id}.json`))) },
  ]);
  commit();

  assert.throws(() => check(root), /review-legacy\.json/);
});

test('next reports integrity problems even when no scope is open', (t) => {
  const { root, put } = fixture(t, [scope('comments')]);
  const result = recordReview(root, put, 'comments');
  const text = readFileSync(join(root, result.recorded), 'utf-8');
  writeFileSync(join(root, result.recorded), text.replace('Keep', 'Drop'));

  const answer = next(root);
  assert.equal(answer.unit, null);
  assert.ok(answer.integrity.length);
});

test('record refuses a review without an upstreams list', (t) => {
  const { root, put } = fixture(t);
  const { draft } = draftReview(root, 'comments');
  const { upstreams, ...rest } = completed(draft);
  put('drafts/a.json', rest);

  assert.throws(() => record(root, 'drafts/a.json'), /upstreams is a list/);
});

test('plan front matter without review_scopes is invalid, not a fallback', (t) => {
  const { root, put } = fixture(t);
  put('docs/plans/2026-09-02-link.md', '---\nreview_basis: [x]\n---\n\n# Plan\n\nStatus: done\n');
  put('docs/research/review-documents.json', [
    { path: 'docs/plans/2026-09-02-link.md', scopes: ['link'], kind: 'plan', disposition: 'historical', rationale: 'Old.' },
  ]);

  assert.throws(
    () => draftExecution(root, 'docs/plans/2026-09-02-link.md'),
    /metadata is invalid: review_scopes/
  );
});

test('check warns on a classified plan with an unknown work kind', (t) => {
  const { root, put } = fixture(t);
  put('docs/plans/2026-03-15-link.md', '# Old plan\n\nStatus: done\n');
  put('docs/research/review-documents.json', [
    { path: 'docs/plans/2026-03-15-link.md', scopes: ['link'], kind: 'plan', disposition: 'historical', rationale: 'Old.', workKind: 'implementaton' },
  ]);

  assert.match(check(root).warnings.join('\n'), /2026-03-15-link\.md: invalid workKind/);
});

test('a ledger file of the wrong type fails check instead of reading as empty', (t) => {
  const { root, put } = fixture(t);
  put('docs/research/review-documents.json', { path: 'docs/plans/x.md' });

  assert.throws(() => check(root), /review-documents\.json: not a list/);
});

test('check catches a committed deletion of a record that first landed in a merge commit', (t) => {
  const { root, put, commit, git } = fixture(t);
  put('docs/research/review-legacy.json', []);
  commit();
  const main = git('branch', '--show-current').trim();
  git('switch', '-q', '-c', 'side');
  put('docs/side.md', 'Side work.');
  commit();
  git('switch', '-q', main);
  git('merge', '-q', '--no-ff', '--no-commit', 'side');
  const result = recordReview(root, put, 'comments');
  commit();
  git('rm', '-q', result.recorded);
  commit();

  assert.throws(() => check(root), new RegExp(`deleted: ${result.recorded}`));
});

test('check catches a committed deletion hidden as a rename of a similar record', (t) => {
  const { root, put, commit, git } = fixture(t);
  put('docs/research/review-legacy.json', []);
  commit();
  const first = recordReview(root, put, 'comments', { id: '2026-09-01-comments' });
  commit();
  const bytes = readFileSync(join(root, first.recorded));
  git('rm', '-q', first.recorded);
  const second = recordReview(root, put, 'comments', { id: '2026-09-02-comments', previous: null, relation: 'initial', reconciliation: [] });
  commit();
  writeFileSync(join(root, first.recorded), bytes);
  git('rm', '-q', second.recorded);
  commit();

  assert.throws(() => check(root), new RegExp(`deleted: ${second.recorded}`));
});

test('a committed record restored and staged reads clean before the restore is committed', (t) => {
  const { root, put, commit, git } = fixture(t);
  put('docs/research/review-legacy.json', []);
  commit();
  const result = recordReview(root, put, 'comments');
  commit();
  const bytes = readFileSync(join(root, result.recorded));
  writeFileSync(join(root, result.recorded), '{}\n');
  commit();
  writeFileSync(join(root, result.recorded), bytes);
  git('add', '-A');

  assert.equal(check(root).ok, true);
});
