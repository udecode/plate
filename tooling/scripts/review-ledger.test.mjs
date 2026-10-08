import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
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

import {
  check,
  coverage,
  freshness,
  loadLedger,
  lookup,
  next,
  observe,
  orderUnits,
  recordsDir,
  scopesDir,
  searchResearch,
  show,
  status,
} from './review-ledger.mjs';

const digest = (value) => createHash('sha256').update(value).digest('hex');

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
    execFileSync(
      'git',
      [
        '-C',
        root,
        '-c',
        'user.email=fixture@example.com',
        '-c',
        'user.name=fixture',
        ...args,
      ],
      { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }
    );
  const commit = () => {
    git('add', '-A');
    git('commit', '-qm', 'fixture');
  };
  git('init', '-q');
  for (const item of scopes) {
    put(
      `packages/core/src/${item.id}/index.ts`,
      `export const ${item.id} = 1;`
    );
    put(
      `packages/core/src/${item.id}/${item.id}.spec.ts`,
      `test('${item.id}');`
    );
    put(`${scopesDir}/${item.id}.json`, item);
  }
  put('docs/evidence.md', 'Observed behavior and alternatives.');
  put('VISION.md', 'Doctrine.');
  mkdirSync(join(root, recordsDir), { recursive: true });
  mkdirSync(join(root, 'docs/plite/research'), { recursive: true });
  commit();
  return { root, put, git, commit };
}

function plan(
  put,
  path,
  {
    scopes,
    basis,
    verdict,
    workKind = verdict ? null : 'implementation',
    state,
    commit,
    inputs,
    action = 'supersedes',
    reconciles = basis,
  }
) {
  const keys = [
    `review_scopes: [${scopes.join(', ')}]`,
    `review_basis: [${basis.join(', ')}]`,
    ...(verdict ? [`verdict: ${verdict}`] : []),
    ...(workKind ? [`work_kind: ${workKind}`] : []),
    ...(commit ? [`review_commit: ${commit}`] : []),
    ...(inputs ? [`review_inputs: [${inputs.join(', ')}]`] : []),
  ];
  const reconciled = reconciles.map(
    (id) => `- ${id} ${action}: the fixture reads it again.`
  );
  put(
    path,
    `---\n${keys.join('\n')}\n---\n\n# Plan\n\nThe lead paragraph.\n\nStatus: ${state}\nPlaybook: api-review\n\n## Public API\n\nCurrent and proposed call sites.\n\n## Close\n\nLanded with fixture proof${inputs ? ` in ${inputs.join(', ')}` : ''}.\n\n## Evidence\n\nModel: fixture-model\n\nRead [the evidence](../evidence.md).\n\n${reconciled.join('\n')}\n\n### Requirements\n\n- Keep one owner.\n\n### Lanes\n\n- Keep the owner.\n- Delete the owner.\n`
  );
}

const legacyReview = (id, fields = {}) => ({
  id,
  kind: 'review',
  scope: 'comments',
  date: id.slice(0, 10),
  verdict: 'pursue',
  previous: null,
  relation: 'initial',
  summary: 'Legacy.',
  references: ['docs/evidence.md'],
  source: null,
  ...fields,
});

const openOf = (root, id) =>
  status(root).open.find((item) => item.id === id)?.open ?? null;

const headOf = (git) => git('rev-parse', 'HEAD').trim();

test("a review page's verdict becomes the scope's head", (t) => {
  const { root, put, git } = fixture(t);
  const write = (verdict) =>
    plan(put, 'docs/plans/2026-09-01-comments-review.md', {
      scopes: ['comments'],
      basis: [],
      verdict,
      state: 'reviewed',
      commit: headOf(git),
    });
  write('stop');

  assert.equal(
    lookup(root, 'comments')[0].head.id,
    '2026-09-01-comments-review'
  );
  assert.equal(openOf(root, 'comments'), null);
  assert.equal(check(root).ok, true);
  write('pursue');
  assert.equal(openOf(root, 'comments'), 'pursue-not-adopted');
  write('maybe');
  assert.throws(() => check(root), /verdict/);
});

test('a landed plan naming an older review does not adopt the newer Pursue', (t) => {
  const { root, put, git } = fixture(t);
  plan(put, 'docs/plans/2026-09-01-comments.md', {
    scopes: ['comments'],
    basis: [],
    verdict: 'pursue',
    state: 'reviewed',
    commit: headOf(git),
  });
  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    state: 'executed',
  });
  assert.equal(openOf(root, 'comments'), null);

  plan(put, 'docs/plans/2026-09-03-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    verdict: 'pursue',
    state: 'reviewed',
    commit: headOf(git),
  });

  assert.equal(openOf(root, 'comments'), 'pursue-not-adopted');
});

test('a landed design plan does not adopt its Pursue', (t) => {
  const { root, put, git } = fixture(t);
  plan(put, 'docs/plans/2026-09-01-comments.md', {
    scopes: ['comments'],
    basis: [],
    verdict: 'pursue',
    state: 'complete',
    commit: headOf(git),
  });
  plan(put, 'docs/plans/2026-09-02-design.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    workKind: 'design',
    state: 'done',
  });

  assert.equal(openOf(root, 'comments'), 'pursue-not-adopted');
});

test('an imported execution without a recovered binding never adopts', (t) => {
  const { root, put } = fixture(t);
  put(
    `${recordsDir}/2026-09-01-comments.json`,
    legacyReview('2026-09-01-comments')
  );
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

test("readers tolerate another session's half-written ledger files", (t) => {
  const { root, put } = fixture(t, [
    scope('comments'),
    scope('link'),
    scope('table'),
  ]);
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
  put(
    `${scopesDir}/link.json`,
    scope('link', { dependsOn: ['table'], prerequisiteReason: 'Cycle.' })
  );
  put(
    `${scopesDir}/table.json`,
    scope('table', { dependsOn: ['link'], prerequisiteReason: 'Cycle.' })
  );
  put(
    'docs/plans/2026-09-09-other.md',
    '---\nreview_scopes: [link]\nreview_basis: [missing]\nwork_kind: design\n---\n\nStatus: building\nStatus: done\n'
  );
  put('docs/research/review-documents.json', [
    {
      path: 'docs/plans/deleted.md',
      scopes: ['link'],
      kind: 'plan',
      disposition: 'historical',
      rationale: 'Gone.',
    },
  ]);

  assert.equal(coverage(root).unowned.total, 1);
  assert.equal(status(root).scopes, 3);
  assert.ok(next(root).unit);
});

test('a broken scope file fails check and leaves lookup of another scope working', (t) => {
  const { root, put } = fixture(t);
  put(`${scopesDir}/link.json`, '{ not json');
  put('packages/core/src/link/index.ts', 'export const link = 3;');

  assert.equal(lookup(root, 'comments').length, 1);
  assert.throws(() => check(root), /link\.json/);
  put(`${scopesDir}/link.json`, scope('link'));
  assert.equal(check(root).ok, true);
});

test('a review page reads stale when its scope changed since its review_commit', (t) => {
  const { root, put, git } = fixture(t);
  plan(put, 'docs/plans/2026-09-01-comments.md', {
    scopes: ['comments'],
    basis: [],
    verdict: 'stop',
    state: 'reviewed',
    commit: headOf(git),
  });
  assert.equal(lookup(root, 'comments')[0].freshness.state, 'matching');

  put('packages/core/src/comments/index.ts', 'export const comments = 2;');

  const [item] = lookup(root, 'comments');
  assert.equal(item.freshness.state, 'stale');
  assert.deepEqual(item.freshness.changed.items, [
    'packages/core/src/comments/',
  ]);
});

test('a doctrine edit moves the law clock without staling source', (t) => {
  const { root, put, git } = fixture(t);
  plan(put, 'docs/plans/2026-09-01-comments.md', {
    scopes: ['comments'],
    basis: [],
    verdict: 'stop',
    state: 'reviewed',
    commit: headOf(git),
  });
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
        'packages/core/src/comments/index.ts': digest(
          'export const comments = 1;'
        ),
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
  assert.equal(
    freshness(observe(root), loadLedger(root).records.get(legacy.id)).state,
    'stale'
  );
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

test("check fails on a legacy record's broken reference, not on source edits", (t) => {
  const { root, put } = fixture(t);
  put('packages/core/src/link/index.ts', 'export const link = 3;');
  assert.equal(check(root).ok, true);

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

test('two review pages naming one head fork the scope until a review names both', (t) => {
  const { root, put, git } = fixture(t);
  const page = (id, basis, verdict = 'stop') =>
    plan(put, `docs/plans/${id}.md`, {
      scopes: ['comments'],
      basis,
      verdict,
      state: 'reviewed',
      commit: headOf(git),
    });
  page('2026-09-01-comments', []);
  page('2026-09-02-a', ['2026-09-01-comments']);
  page('2026-09-02-b', ['2026-09-01-comments']);

  assert.equal(openOf(root, 'comments'), 'fork');
  assert.throws(() => check(root), /Fork in comments/);
  page('2026-09-03-resolve', ['2026-09-02-a', '2026-09-02-b'], 'pursue');
  assert.equal(openOf(root, 'comments'), 'pursue-not-adopted');
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

test('a landed implementation plan naming the head closes its Pursue', (t) => {
  const { root, put, git } = fixture(t);
  plan(put, 'docs/plans/2026-09-01-comments.md', {
    scopes: ['comments'],
    basis: [],
    verdict: 'pursue',
    state: 'reviewed',
    commit: headOf(git),
  });
  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    state: 'building',
  });
  assert.equal(openOf(root, 'comments'), 'pursue-not-adopted');

  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    state: 'executed, folded into the subject',
  });

  assert.equal(openOf(root, 'comments'), null);
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
    scope('runtime', {
      group: 'core',
      opportunity: { score: 4, reason: 'Core.' },
    }),
    scope('state', {
      group: 'core',
      opportunity: { score: 6, reason: 'Core.' },
    }),
  ]);
  put('docs/research/review-groups.json', {
    core: { title: 'Core', reason: 'Reviewed together.' },
  });

  assert.deepEqual(
    orderUnits(loadLedger(root)).map((unit) => unit.id),
    ['core', 'model', 'table', 'ai']
  );
  put(
    `${scopesDir}/model.json`,
    scope('model', {
      dependsOn: ['table'],
      prerequisiteReason: 'Cycle.',
    })
  );
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
  put(
    'docs/plite/research/2026-01-02-second/read-log.tsv',
    'claim\tstatus\ncomment\t\n'
  );

  const result = searchResearch(root, 'comment');

  assert.equal(
    result.matches.find((item) => item.row?.claim === 'comment range').status,
    'deferred-proof'
  );
  assert.deepEqual(result.matches.find((item) => item.row === null).rawCells, [
    'comment malformed',
  ]);
  assert.equal(
    result.matches.find((item) => item.row?.claim === 'comment').row.status,
    ''
  );
  assert.equal(result.warnings.length, 1);
});

test('a later open plan on the same Pursue reopens it', (t) => {
  const { root, put, git } = fixture(t);
  plan(put, 'docs/plans/2026-09-01-comments.md', {
    scopes: ['comments'],
    basis: [],
    verdict: 'pursue',
    state: 'reviewed',
    commit: headOf(git),
  });
  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    state: 'executed',
  });
  assert.equal(openOf(root, 'comments'), null);

  plan(put, 'docs/plans/2026-09-03-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    state: 'building',
  });

  assert.equal(openOf(root, 'comments'), 'pursue-not-adopted');
});

test('next skips a scope whose open plan is in flight and names that plan', (t) => {
  const { root, put, git } = fixture(t);
  const review = (id, state) =>
    plan(put, `docs/plans/2026-09-01-${id}-review.md`, {
      scopes: [id],
      basis: [],
      verdict: 'pursue',
      state,
      commit: headOf(git),
    });
  review('comments', 'reviewed');
  review('link', 'reviewed');
  const first = next(root).unit;
  const other = first === 'comments' ? 'link' : 'comments';

  review(first, 'building: phase 2');

  assert.equal(next(root).unit, other);
  assert.deepEqual(next(root).inFlight, [
    { plans: [`docs/plans/2026-09-01-${first}-review.md`], scope: first },
  ]);
});

test('next still offers a scope whose open plan has not changed for weeks', (t) => {
  const { root, put, git } = fixture(t);
  const review = (id, state) =>
    plan(put, `docs/plans/2026-09-01-${id}-review.md`, {
      scopes: [id],
      basis: [],
      verdict: 'pursue',
      state,
      commit: headOf(git),
    });
  review('comments', 'reviewed');
  review('link', 'reviewed');
  const first = next(root).unit;

  review(first, 'building: phase 2');
  git('add', '-A');
  git('commit', '-qm', 'stale plan', '--date', '2026-01-01T00:00:00Z');

  assert.equal(next(root).unit, first);
  assert.equal(next(root).inFlight, undefined);
});

test('next lists uncommitted member files of the scope it offers', (t) => {
  const { root, put, git } = fixture(t);
  for (const id of ['comments', 'link']) {
    plan(put, `docs/plans/2026-09-01-${id}-review.md`, {
      scopes: [id],
      basis: [],
      verdict: 'pursue',
      state: 'reviewed',
      commit: headOf(git),
    });
  }
  git('add', '-A');
  git('commit', '-qm', 'reviews');
  const [offered] = next(root).scopes;

  put(`packages/core/src/${offered.id}/index.ts`, 'export const edited = 2;');

  assert.deepEqual(next(root).scopes[0].uncommitted, [
    `packages/core/src/${offered.id}/index.ts`,
  ]);
});

test('a historical import beside a review does not fork the scope', (t) => {
  const { root, put, git } = fixture(t);
  plan(put, 'docs/plans/2026-09-01-comments.md', {
    scopes: ['comments'],
    basis: [],
    verdict: 'stop',
    state: 'reviewed',
    commit: headOf(git),
  });
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

test('a classified historical plan with a landed status adopts its basis', (t) => {
  const { root, put, git } = fixture(t);
  plan(put, 'docs/plans/2026-09-01-link.md', {
    scopes: ['link'],
    basis: [],
    verdict: 'pursue',
    state: 'reviewed',
    commit: headOf(git),
  });
  put('docs/plans/2026-03-15-table.md', '# Old plan\n\nStatus: done\n');
  put('docs/research/review-documents.json', [
    {
      path: 'docs/plans/2026-03-15-table.md',
      scopes: ['link'],
      kind: 'plan',
      disposition: 'historical',
      rationale: 'Inspected: it executed link work.',
      workKind: 'implementation',
      reviewBasis: ['2026-09-01-link'],
    },
  ]);

  assert.equal(openOf(root, 'link'), null);
});

test("a changed proof file in a plan's review_inputs reads stale", (t) => {
  const { root, put, git, commit } = fixture(t);
  plan(put, 'docs/plans/2026-09-01-comments.md', {
    scopes: ['comments'],
    basis: [],
    verdict: 'pursue',
    state: 'reviewed',
    commit: headOf(git),
  });
  put('docs/proof/report.md', 'Passed.');
  commit();
  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    state: 'building',
    commit: headOf(git),
    inputs: ['docs/proof/report.md'],
  });
  put('docs/proof/report.md', 'Failed.');

  const [item] = lookup(root, 'comments');

  assert.equal(item.plans.items[0].freshness.state, 'stale');
  assert.deepEqual(item.plans.items[0].freshness.changed.items, [
    'docs/proof/report.md',
  ]);
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
    source: {
      files: {},
      features: { 'ui/link-floating-toolbar': digest('x') },
    },
  });

  assert.deepEqual(
    lookup(root, 'floating-toolbar').map((item) => item.id),
    ['link']
  );
});

test('a plan with conflicting status labels does not adopt', (t) => {
  const { root, put, git } = fixture(t);
  plan(put, 'docs/plans/2026-09-01-comments.md', {
    scopes: ['comments'],
    basis: [],
    verdict: 'pursue',
    state: 'reviewed',
    commit: headOf(git),
  });
  put(
    'docs/plans/2026-09-02-comments.md',
    '---\nreview_scopes: [comments]\nreview_basis: [2026-09-01-comments]\nwork_kind: implementation\n---\n\n# Plan\n\n- goal_status: complete\n\nStatus: reopened, a regression returned\n'
  );

  assert.equal(openOf(root, 'comments'), 'pursue-not-adopted');
});

test('check catches an execution whose previous execution is gone', (t) => {
  const { root, put } = fixture(t);
  put(
    `${recordsDir}/2026-09-01-comments.json`,
    legacyReview('2026-09-01-comments')
  );
  const execution = (id, previous) => ({
    id,
    kind: 'execution',
    date: '2026-09-02',
    scopes: ['comments'],
    reviewBasis: ['2026-09-01-comments'],
    workKind: 'implementation',
    previous,
    plan: 'docs/evidence.md',
    outcome: 'partial',
    summary: 'Fixture.',
    proof: { state: 'partial', evidence: [], limits: 'Fixture.' },
    references: ['docs/evidence.md'],
  });
  put(`${recordsDir}/2026-09-02-first.json`, execution('2026-09-02-first', []));
  put(
    `${recordsDir}/2026-09-02-second.json`,
    execution('2026-09-02-second', ['2026-09-02-first'])
  );
  rmSync(join(root, recordsDir, '2026-09-02-first.json'));

  assert.throws(() => check(root), /2026-09-02-second\.json: previous/);
});

test('a malformed foreign record fails check and leaves another scope readable', (t) => {
  const { root, put } = fixture(t);
  put(`${recordsDir}/2026-09-09-foreign.json`, {
    id: '2026-09-09-foreign',
    kind: 'execution',
    date: '2026-09-09',
    scopes: ['link'],
    binding: 'current',
    workKind: 'implementation',
    reviewBasis: {},
  });

  assert.equal(lookup(root, 'comments').length, 1);
  assert.throws(
    () => check(root),
    /2026-09-09-foreign\.json: malformed record/
  );
});

test('strict queue order catches a dependency cycle inside a review group', (t) => {
  const { root, put } = fixture(t, [
    scope('runtime', {
      group: 'core',
      dependsOn: ['state'],
      prerequisiteReason: 'Cycle.',
    }),
    scope('state', {
      group: 'core',
      dependsOn: ['runtime'],
      prerequisiteReason: 'Cycle.',
    }),
  ]);
  put('docs/research/review-groups.json', {
    core: { title: 'Core', reason: 'Reviewed together.' },
  });

  assert.throws(() => orderUnits(loadLedger(root), { strict: true }), /cycle/);
});

test("check fails on a review page whose basis names another scope's review", (t) => {
  const { root, put, git } = fixture(t);
  plan(put, 'docs/plans/2026-09-01-link.md', {
    scopes: ['link'],
    basis: [],
    verdict: 'stop',
    state: 'reviewed',
    commit: headOf(git),
  });
  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-link'],
    verdict: 'stop',
    state: 'reviewed',
    commit: headOf(git),
  });

  assert.throws(() => check(root), /not a review of/);
});

test('check fails on a changed verdict that retains its basis review', (t) => {
  const { root, put, git } = fixture(t);
  plan(put, 'docs/plans/2026-09-01-comments.md', {
    scopes: ['comments'],
    basis: [],
    verdict: 'stop',
    state: 'reviewed',
    commit: headOf(git),
  });
  const later = (action) =>
    plan(put, 'docs/plans/2026-09-02-comments.md', {
      scopes: ['comments'],
      basis: ['2026-09-01-comments'],
      verdict: 'pursue',
      state: 'reviewed',
      commit: headOf(git),
      action,
    });
  later('retains');

  assert.throws(
    () => check(root),
    /changed verdict retains 2026-09-01-comments/
  );
  later('supersedes');
  assert.equal(check(root).ok, true);
});

test('check fails on an Evidence line that names only a longer id than the basis', (t) => {
  const { root, put, git } = fixture(t);
  plan(put, 'docs/plans/2026-09-01-comments.md', {
    scopes: ['comments'],
    basis: [],
    verdict: 'stop',
    state: 'reviewed',
    commit: headOf(git),
  });
  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    verdict: 'stop',
    state: 'reviewed',
    commit: headOf(git),
    reconciles: ['2026-09-01-comments-design'],
  });

  assert.throws(
    () => check(root),
    /does not reconcile 2026-09-01-comments with an action/
  );
});

test('check fails on an absolute link on a review page', (t) => {
  const { root, put, git } = fixture(t);
  const path = 'docs/plans/2026-09-01-comments.md';
  plan(put, path, {
    scopes: ['comments'],
    basis: [],
    verdict: 'stop',
    state: 'reviewed',
    commit: headOf(git),
  });
  put(
    path,
    readFileSync(join(root, path), 'utf-8').replace(
      'Read [the evidence](../evidence.md).',
      'Read [the evidence](../evidence.md) and [the spec](/docs/spec.md).'
    )
  );

  assert.throws(() => check(root), /link \/docs\/spec\.md is absolute/);
});

test('check fails on a review page whose Evidence section is empty', (t) => {
  const { root, put, git } = fixture(t);
  const path = 'docs/plans/2026-09-01-comments.md';
  plan(put, path, {
    scopes: ['comments'],
    basis: [],
    verdict: 'stop',
    state: 'reviewed',
    commit: headOf(git),
  });
  const text = readFileSync(join(root, path), 'utf-8');
  put(path, text.slice(0, text.indexOf('## Evidence')));

  assert.throws(() => check(root), /a review page needs ## Evidence/);
});

test('check fails on a review_inputs path that no tree or commit holds', (t) => {
  const { root, put, git } = fixture(t);
  plan(put, 'docs/plans/2026-09-01-comments.md', {
    scopes: ['comments'],
    basis: [],
    verdict: 'pursue',
    state: 'reviewed',
    commit: headOf(git),
  });
  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: ['2026-09-01-comments'],
    state: 'building',
    commit: headOf(git),
    inputs: ['docs/proof/gone.md'],
  });

  assert.throws(
    () => check(root),
    /review_inputs path docs\/proof\/gone\.md is in no tree or commit/
  );
});

test('check fails on a misspelled review front-matter key', (t) => {
  const { root, put } = fixture(t);
  put(
    'docs/plans/2026-09-16-persistence.md',
    '---\ntitle: Persistence\nreview_scope: comments\nreview: docs/evidence.md\n---\n\n# Plan\n\nStatus: done\n'
  );
  assert.throws(() => check(root), /review_scope/);

  put(
    'docs/plans/2026-09-16-persistence.md',
    '---\ntitle: Persistence\nreview_scopes: [comments]\n---\n\n# Plan\n\nStatus: done\n'
  );
  assert.equal(check(root).ok, true);
});

test('invalid plan front matter fails check instead of falling back to a classified entry', (t) => {
  const { root, put } = fixture(t);
  put(
    'docs/plans/2026-09-02-table.md',
    '---\nreview_scopes: link\n---\n\n# Plan\n\nStatus: done\n'
  );
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
    () => check(root),
    /2026-09-02-table\.md: invalid review_scopes/
  );
});

test('show lists the plans associated with a scope', (t) => {
  const { root, put } = fixture(t);
  plan(put, 'docs/plans/2026-09-02-comments.md', {
    scopes: ['comments'],
    basis: [],
    workKind: 'design',
    state: 'done',
  });

  assert.match(
    show(root, 'comments'),
    /docs\/plans\/2026-09-02-comments\.md: done; design/
  );
});

test('plan front matter without review_scopes fails check', (t) => {
  const { root, put } = fixture(t);
  put(
    'docs/plans/2026-09-02-link.md',
    '---\nreview_basis: [x]\n---\n\n# Plan\n\nStatus: done\n'
  );
  put('docs/research/review-documents.json', [
    {
      path: 'docs/plans/2026-09-02-link.md',
      scopes: ['link'],
      kind: 'plan',
      disposition: 'historical',
      rationale: 'Old.',
    },
  ]);

  assert.throws(
    () => check(root),
    /2026-09-02-link\.md: invalid review_scopes/
  );
});

test('check fails on a classified plan with an unknown work kind', (t) => {
  const { root, put } = fixture(t);
  put('docs/plans/2026-03-15-link.md', '# Old plan\n\nStatus: done\n');
  put('docs/research/review-documents.json', [
    {
      path: 'docs/plans/2026-03-15-link.md',
      scopes: ['link'],
      kind: 'plan',
      disposition: 'historical',
      rationale: 'Old.',
      workKind: 'implementaton',
    },
  ]);

  assert.throws(() => check(root), /invalid workKind/);
});

test('a ledger file of the wrong type fails check instead of reading as empty', (t) => {
  const { root, put } = fixture(t);
  put('docs/research/review-documents.json', { path: 'docs/plans/x.md' });

  assert.throws(() => check(root), /review-documents\.json: not a list/);
});
