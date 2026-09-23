import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const indexPath = 'docs/research/review-index.json';
const hash = (value) => createHash('sha256').update(value).digest('hex');
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const read = (root, path) => readFileSync(join(root, path), 'utf-8');
const parse = (root, path) => JSON.parse(read(root, path));
const compareStrings = (a, b) => a.localeCompare(b);
const latestRecord = (all, scope) =>
  all.findLast(
    (record) => record.scope === scope && record.kind === 'review'
  ) ??
  all
    .filter((record) => record.scope === scope && record.kind === 'historical')
    .sort((a, b) => a.date.localeCompare(b.date))
    .at(-1);

export function files(root, path, exclusions = []) {
  if (exclusions.some((item) => new RegExp(item.pattern).test(`${path}/`))) {
    return [];
  }
  if (!existsSync(join(root, path))) return [];
  return readdirSync(join(root, path), { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      if (
        [
          'node_modules',
          '.claude',
          '.next',
          '.git',
          '.turbo',
          '.tmp',
          '.cache',
          'dist',
          'test-results',
          'playwright-report',
        ].includes(entry.name)
      ) {
        return [];
      }
      const child = `${path}/${entry.name}`;
      return entry.isDirectory()
        ? files(root, child, exclusions)
        : entry.isFile()
          ? [child]
          : [];
    });
}

export function featureId(path) {
  const parts = path.split('/');
  if (parts[0] === 'packages') {
    const pkg = parts[1];
    if (parts[2] !== 'src') return `${pkg}/proof-and-packaging`;
    if (pkg === 'platejs' && parts[3] === 'features') {
      return `platejs/${parts[4]}`;
    }
    if (
      pkg === 'platejs' &&
      parts[3] === 'code-block' &&
      parts[4] === 'codemirror'
    ) {
      return 'platejs/code-block/codemirror';
    }
    if (pkg === 'plitejs' && parts[3] === 'core') {
      return `plitejs/core/${parts[4].replace(/\.[^.]+$/, '')}`;
    }
    if (pkg === 'plitejs' && parts[3] === 'react') {
      const owner = parts[4] === 'editable' ? `editable/${parts[5]}` : parts[4];
      return `plitejs/react/${owner.replace(/\.[^.]+$/, '')}`;
    }
    if (pkg === 'platejs' && parts[3] === 'lib') {
      return `platejs/lib/${parts[4].replace(/\.[^.]+$/, '')}`;
    }
    if (pkg === 'plitejs' && parts[3] === 'editor') {
      return `plitejs/editor/${parts[4].replace(/\.[^.]+$/, '')}`;
    }
    return `${pkg}/${parts.length > 4 ? parts[3] : 'entrypoints'}`;
  }
  if (path.startsWith('apps/www/src/registry/components/editor/')) {
    return `ui/${parts[6]
      .replace(/\.(spec|test|slow|lifecycle|keyboard|navigation|type).*$/, '')
      .replace(/\.[^.]+$/, '')
      .replace(/-static$/, '')}`;
  }
  if (path.startsWith('apps/www/src/registry/examples/')) {
    if (parts[5] === 'values') {
      return `example/value/${parts[6] === 'cn' ? parts[7] : parts[6]}`
        .replace(/\.(spec|test).*$/, '')
        .replace(/\.[^.]+$/, '');
    }
    return `example/registry/${parts[5].replace(/\.(spec|test).*$/, '').replace(/\.[^.]+$/, '')}`;
  }
  if (
    path.startsWith('apps/www/src/registry/lib/') ||
    path.startsWith('apps/www/src/registry/hooks/')
  ) {
    return `registry/${parts[4]}/${parts[5].replace(/\.[^.]+$/, '')}`;
  }
  if (path.startsWith('apps/www/src/registry/app/api/')) {
    return `application/${parts[6]}`;
  }
  if (path.startsWith('apps/www/src/app/(app)/examples/plite/_examples/')) {
    return `example/plite/${parts[8].replace(/\.[^.]+$/, '')}`;
  }
  if (path.startsWith('apps/www/src/app/(app)/examples/plite/')) {
    return 'application/plite-examples';
  }
  if (path.startsWith('apps/www/tests/browser/')) {
    return `browser/${parts[4].replace(/\.spec\.ts$/, '')}`;
  }
  if (path.startsWith('apps/www/src/app/api/ai/')) {
    return `application/ai-${parts[6]}`;
  }
  if (path.startsWith('apps/www/src/registry/')) return `registry/${parts[4]}`;
  if (path.startsWith('apps/plite/')) return 'tooling/browser-proof';
  if (path.startsWith('benchmarks/')) return 'tooling/performance';
  return 'tooling/distribution';
}

export function discover(root, index) {
  const groups = new Map();
  for (const path of [
    ...new Set([
      ...index.inventory.roots.flatMap((dir) =>
        files(root, dir, index.inventory.exclusions)
      ),
      ...(index.inventory.inputs ?? []),
    ]),
  ].sort(compareStrings)) {
    if (!/\.(?:[cm]?[jt]sx?|json|css|mdx?|snap|html|txt|ya?ml)$/.test(path)) {
      continue;
    }
    if (
      index.inventory.exclusions.some((item) =>
        new RegExp(item.pattern).test(path)
      )
    ) {
      continue;
    }
    const id = featureId(path);
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(path);
  }
  for (const pkg of readdirSync(join(root, 'packages')).sort(compareStrings)) {
    const path = `packages/${pkg}/package.json`;
    if (!existsSync(join(root, path))) continue;
    const manifest = parse(root, path);
    for (const entry of Object.keys(manifest.exports ?? {})) {
      groups.set(`export/${pkg}/${entry}`, [path]);
    }
  }
  const catalogPath = 'packages/platejs/src/utils/plate-keys.ts';
  if (existsSync(join(root, catalogPath))) {
    const body = read(root, catalogPath).match(
      /export const PLUGINS = \{([\s\S]*?)\} as const;/
    )?.[1];
    assert.ok(
      body,
      'Capability catalog changed shape; reconcile its inventory parser'
    );
    const keys = [...body.matchAll(/^\s+(\w+): (["'])[^"']+\2,?$/gm)].map(
      (match) => match[1]
    );
    assert.equal(
      keys.length,
      body.split('\n').filter((line) => line.trim()).length,
      'Unparsed capability declaration'
    );
    const sources = [...new Set([...groups.values()].flat())]
      .filter(
        (path) =>
          /^(packages|apps\/www\/src\/registry)\//.test(path) &&
          /\.[jt]sx?$/.test(path)
      )
      .map((path) => [path, read(root, path)]);
    for (const key of keys) {
      const use = new RegExp(`\\bPLUGINS\\.${key}\\b`);
      groups.set(
        `capability/${key}`,
        [
          catalogPath,
          ...sources
            .filter(([path, text]) => path !== catalogPath && use.test(text))
            .map(([path]) => path),
        ].sort(compareStrings)
      );
    }
  }
  for (const example of pliteExamples(root)) {
    const id = `example/plite/${example.id}`;
    groups.set(
      id,
      [...new Set([...(groups.get(id) ?? []), ...example.paths])].sort(
        compareStrings
      )
    );
  }
  return [...groups]
    .map(([id, paths]) => ({
      id,
      paths,
      count: paths.length,
      fingerprint: hash(
        paths
          .map((path) => `${path}\0${hash(readFileSync(join(root, path)))}`)
          .join('\n')
      ),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function pliteExamples(root) {
  const directory = 'apps/www/src/app/(app)/examples/plite';
  const catalog = `${directory}/plite-example-registry.ts`;
  if (!existsSync(join(root, catalog))) return [];
  const loaders = `${directory}/plite-example-loaders.tsx`;
  const body = read(root, catalog).match(
    /export const EXAMPLE_NAMES_AND_PATHS = \[([\s\S]*?)\] as const/
  )?.[1];
  assert.ok(body, 'Plite example catalog changed shape');
  const entries = [...body.matchAll(/\['([^']+)', '([^']+)'\]/g)];
  assert.equal(
    entries.length,
    body.split('\n').filter((line) => line.trim()).length,
    'Unparsed Plite example declaration'
  );
  const source = read(root, loaders);
  const starts = [
    ...source.matchAll(
      /^ {2}(?:'([^']+)'|(\w+)): (?:createPliteExampleLoader|dynamic)\(/gm
    ),
  ];
  assert.deepEqual(
    entries.map((entry) => entry[2]).sort(compareStrings),
    starts.map((entry) => entry[1] ?? entry[2]).sort(compareStrings),
    'Plite example catalog and loaders disagree'
  );
  return entries.map((entry) => {
    const i = starts.findIndex((item) => (item[1] ?? item[2]) === entry[2]);
    const imported = source
      .slice(starts[i].index, starts[i + 1]?.index)
      .match(/import\('([^']+)'\)/)?.[1];
    assert.ok(imported, `Missing loader for ${entry[2]}`);
    const stem = imported.startsWith('@/')
      ? `apps/www/src/${imported.slice(2)}`
      : `${directory}/${imported.replace(/^\.\//, '')}`;
    const implementation = [`${stem}.tsx`, `${stem}.ts`].find((path) =>
      existsSync(join(root, path))
    );
    assert.ok(implementation, `Missing example implementation: ${entry[2]}`);
    return {
      id: entry[2],
      title: entry[1],
      paths: [catalog, loaders, implementation],
    };
  });
}

const directoryFingerprint = (root, path) =>
  hash(
    files(root, path)
      .map((file) => `${file}\0${hash(readFileSync(join(root, file)))}`)
      .join('\n')
  );

const inventoryFingerprint = (inventory) =>
  hash(json(inventory.map(({ id, fingerprint }) => ({ id, fingerprint }))));

export function freshness(root, record, inventory = []) {
  if (!record.source) return 'unknown';
  const inputs = record.source.files ?? {};
  const features = record.source.features ?? {};
  if (
    !Object.keys(inputs).length &&
    !Object.keys(features).length &&
    !Object.keys(record.source.directories ?? {}).length
  ) {
    return 'unknown';
  }
  if (
    Object.entries(inputs).some(
      ([path, digest]) =>
        !existsSync(join(root, path)) ||
        hash(readFileSync(join(root, path))) !== digest
    )
  ) {
    return 'stale';
  }
  if (
    Object.entries(features).some(
      ([id, digest]) =>
        inventory.find((item) => item.id === id)?.fingerprint !== digest
    )
  ) {
    return 'stale';
  }
  if (
    Object.entries(record.source.directories ?? {}).some(
      ([path, digest]) =>
        !existsSync(join(root, path)) ||
        directoryFingerprint(root, path) !== digest
    )
  ) {
    return 'stale';
  }
  for (const upstream of record.source.upstreams ?? []) {
    if (!existsSync(upstream.checkout)) return 'unknown';
    try {
      if (
        execFileSync('git', ['-C', upstream.checkout, 'rev-parse', 'HEAD'], {
          encoding: 'utf-8',
          stdio: ['ignore', 'pipe', 'ignore'],
        }).trim() !== upstream.commit
      ) {
        return 'stale';
      }
    } catch {
      return 'unknown';
    }
    if (
      Object.entries(upstream.files).some(
        ([path, digest]) =>
          !existsSync(join(upstream.checkout, path)) ||
          hash(readFileSync(join(upstream.checkout, path))) !== digest
      )
    ) {
      return 'stale';
    }
  }
  return 'matching';
}

export function draftReview(root, index, scopeId) {
  const scope = index.scopes.find((item) => item.id === scopeId);
  assert.ok(scope, 'Unknown scope');
  const members = new Set(
    index.features
      .filter((feature) => feature.scope === scopeId)
      .map((feature) => feature.id)
  );
  const all = records(root, index);
  const prior = latestRecord(all, scopeId);
  const previous = prior?.id ?? null;
  const paths = [
    ...new Set([
      ...scope.owners,
      ...scope.consumers,
      ...scope.proof,
      ...(scope.evidenceInputs ?? []),
      'VISION.md',
      'docs/vision/common.md',
      'package.json',
      'pnpm-lock.yaml',
      '.agents/skills/best-api-review/SKILL.md',
      '.agents/rules/task/references/best-api-review.md',
    ]),
  ];
  return {
    id: '',
    scope: scopeId,
    kind: 'review',
    date: new Date().toISOString().slice(0, 10),
    question: scope.question,
    model: null,
    method: 'best-api-review/history-v3',
    trigger: '',
    requirements: [],
    evidenceReuse: '',
    summary: '',
    verdict: null,
    previous,
    relation: previous ? 'reaffirms' : 'initial',
    reconciliation: [
      ...(prior ? [prior] : []),
      ...all
        .slice(prior ? all.indexOf(prior) + 1 : 0)
        .filter(
          (record) =>
            record.kind === 'execution' &&
            record.binding === 'current' &&
            belongsTo(record, scopeId)
        ),
    ].map((record) => ({
      record: record.id,
      question: record.question ?? scope.question,
      action: 'retains',
      reason: '',
    })),
    alternatives: [],
    proofLimits: '',
    references: [],
    source: {
      files: Object.fromEntries(
        paths
          .filter(
            (path) => existsSync(join(root, path)) && !readdirSafe(root, path)
          )
          .map((path) => [path, hash(readFileSync(join(root, path)))])
      ),
      directories: Object.fromEntries(
        paths
          .filter(
            (path) => existsSync(join(root, path)) && readdirSafe(root, path)
          )
          .map((path) => [path, directoryFingerprint(root, path)])
      ),
      features: Object.fromEntries(
        discover(root, index)
          .filter((item) => members.has(item.id))
          .map((item) => [item.id, item.fingerprint])
      ),
      upstreams: [],
    },
  };
}

function readdirSafe(root, path) {
  try {
    readdirSync(join(root, path));
    return true;
  } catch {
    return false;
  }
}

export function orderScopes(scopes) {
  const result = [];
  const pending = [...scopes];
  while (pending.length) {
    const ready = pending.filter((scope) =>
      scope.dependsOn.every((id) => result.some((item) => item.id === id))
    );
    assert.ok(
      ready.length,
      'Review dependencies contain a cycle or missing scope'
    );
    ready.sort(
      (a, b) =>
        Number(a.last) - Number(b.last) ||
        b.opportunity.score - a.opportunity.score ||
        a.id.localeCompare(b.id)
    );
    const next = ready[0];
    assert.ok(
      !next.last || pending.every((scope) => scope.last),
      'AI-last constraint conflicts with dependencies'
    );
    result.push(next);
    pending.splice(pending.indexOf(next), 1);
  }
  return result;
}

export function reviewQueue(index) {
  orderScopes(index.scopes);
  const scopes = new Map(index.scopes.map((scope) => [scope.id, scope]));
  const groups = index.reviewGroups ?? [];
  const membership = new Map();
  const ids = new Set(scopes.keys());

  for (const group of groups) {
    assert.ok(
      /^[a-z0-9][a-z0-9-]+$/.test(group.id) && !ids.has(group.id),
      `Invalid or duplicate review group: ${group.id}`
    );
    ids.add(group.id);
    assert.ok(
      group.title?.trim() &&
        group.reason?.trim() &&
        Array.isArray(group.scopes) &&
        group.scopes.length > 1,
      `Incomplete review group: ${group.id}`
    );
    for (const id of group.scopes) {
      assert.ok(scopes.has(id), `Unknown review group member: ${id}`);
      assert.ok(!membership.has(id), `Repeated review group member: ${id}`);
      membership.set(id, group.id);
    }
  }

  const units = [
    ...groups,
    ...index.scopes
      .filter((scope) => !membership.has(scope.id))
      .map((scope) => ({
        id: scope.id,
        title: scope.title,
        scopes: [scope.id],
      })),
  ].map((unit) => {
    const members = unit.scopes.map((id) => scopes.get(id));
    const dependsOn = [
      ...new Set(
        members.flatMap((scope) =>
          scope.dependsOn.map((id) => membership.get(id) ?? id)
        )
      ),
    ].filter((id) => id !== unit.id);

    return {
      ...unit,
      dependsOn,
      last: members.some((scope) => scope.last),
      opportunity: {
        score: Math.max(...members.map((scope) => scope.opportunity.score)),
      },
      reviewed: members.filter((scope) => scope.review === 'reviewed').length,
      pending: members.filter((scope) => scope.review !== 'reviewed').length,
    };
  });

  return orderScopes(units);
}

function localPath(root, path, requireExists = true) {
  assert.ok(
    typeof path === 'string' &&
      path &&
      !path.startsWith('/') &&
      !path.split('/').includes('..'),
    `Expected repository-relative path: ${path}`
  );
  if (requireExists) {
    assert.ok(existsSync(join(root, path)), `Missing evidence: ${path}`);
  }
}

const workKinds = new Set([
  'design',
  'implementation',
  'research',
  'workflow',
  'verification',
]);
const belongsTo = (record, scope) =>
  record.kind === 'execution'
    ? record.scopes.includes(scope)
    : record.scope === scope;
const unquote = (value) => value.trim().replace(/^(['"])(.*)\1$/, '$2');

// Read only the small metadata contract. Prose and other YAML remain owned by the document.
export function documentMetadata(text) {
  const frontmatter =
    text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? '';
  const result = {};
  for (const key of [
    'review_scopes',
    'review_basis',
    'work_kind',
    'current_review',
    'reconciled_executions',
  ]) {
    const match = frontmatter.match(
      new RegExp(
        `^${key}:([^\\n]*)(?:\\n((?:[ \\t]+-[^\\n]*(?:\\n|$))*))?`,
        'm'
      )
    );
    if (!match) continue;
    const value = match[1].trim();
    if (['work_kind', 'current_review'].includes(key)) {
      result[key] = unquote(value);
    } else if (value.startsWith('[') && value.endsWith(']')) {
      result[key] = value.slice(1, -1).trim()
        ? value.slice(1, -1).split(',').map(unquote)
        : [];
    } else if (!value) {
      result[key] = (match[2] ?? '')
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => unquote(line.replace(/^\s*-\s*/, '')));
    } else {
      result[key] = null;
    }
  }
  return result;
}

function lifecycle(value) {
  const status = value.trim().toLowerCase().replaceAll('**', '');
  if (/^(?:complete[d]?|done|closed|implemented|finished)\b/.test(status)) {
    return 'completed';
  }
  if (/^(?:in[ -]progress|active|running|executing|designing)\b/.test(status)) {
    return 'in-progress';
  }
  if (
    /^(?:pause[d]?|blocked|gated|deferred|superseded|abandoned|cancelled|canceled)\b/.test(
      status
    )
  ) {
    return status.match(/^\w+/)[0];
  }
  if (/^(?:plan[ned]?|draft|ready|approved|accepted|proposed)\b/.test(status)) {
    return 'planned';
  }
  return 'unknown';
}

export function planState(root, path) {
  const contents = read(root, path);
  const metadata = documentMetadata(contents);
  const labels = [
    ...contents.matchAll(
      /^(?:[-*][ \t]+)?(?:\*\*)?(?:Status|status|goal_status)(?:\*\*)?:[ \t]*(.+)$/gm
    ),
  ].map((match) => ({
    text: match[1].replaceAll('**', '').trim(),
    status: lifecycle(match[1]),
  }));
  for (const match of contents.matchAll(
    /^(?:Status|status):[ \t]*\r?\n[ \t]*-[ \t]+([^\n]+)$/gm
  )) {
    labels.push({ text: match[1], status: lifecycle(match[1]) });
  }
  const states = [...new Set(labels.map((label) => label.status))];
  return {
    path,
    ...metadata,
    status:
      states.length === 1 ? states[0] : states.length ? 'conflict' : 'unknown',
    statusLabels: labels,
    sha256: hash(contents),
    metadataPresent: ['review_scopes', 'review_basis', 'work_kind'].some(
      (key) => Object.hasOwn(metadata, key)
    ),
  };
}

function historyContext(root, index, live = discover(root, index)) {
  const all = records(root, index);
  const paths = new Set([
    ...files(root, 'docs/plans', [
      { pattern: '(^|/)(artifacts|templates)/' },
    ]).filter((path) => path.endsWith('.md')),
    ...index.scopes.flatMap((scope) => scope.plans),
    ...(index.documents ?? [])
      .filter((doc) => doc.kind === 'plan')
      .map((doc) => doc.path),
  ]);
  const plans = [...paths]
    .sort(compareStrings)
    .filter((path) => existsSync(join(root, path)))
    .map((path) => {
      const plan = planState(root, path);
      const document = (index.documents ?? []).find(
        (doc) => doc.path === path && doc.disposition !== 'candidate'
      );
      const legacyScopes = index.scopes
        .filter((scope) => scope.plans.includes(path))
        .map((scope) => scope.id);
      return {
        ...plan,
        scopes: plan.review_scopes ?? document?.scopes ?? legacyScopes,
        reviewBasis: plan.review_basis ?? document?.reviewBasis ?? [],
        workKind: plan.work_kind ?? document?.workKind ?? null,
        association: plan.metadataPresent
          ? plan.review_scopes?.length
            ? 'plan-metadata'
            : 'not-applicable'
          : document
            ? 'inspected-document'
            : legacyScopes.length
              ? 'legacy-index'
              : 'unassociated',
      };
    });
  return { all, live, plans };
}

function recordSummary(root, record, live) {
  return {
    id: record.id,
    path: `docs/research/review-records/${record.id}.json`,
    date: record.date,
    kind: record.kind,
    question: record.question,
    summary: record.summary,
    verdict: record.verdict,
    relation: record.relation,
    freshness:
      record.kind === 'execution'
        ? executionFreshness(root, record, live)
        : freshness(root, record, live),
    ...(record.kind === 'execution'
      ? {
          outcome: record.outcome,
          reviewBasis: record.reviewBasis,
          plan: record.plan.path,
          proof: record.proof.state,
          binding: record.binding,
        }
      : {}),
  };
}

export function changedInputs(root, record, live) {
  if (!record?.source) {
    return { status: 'unknown', files: [], directories: [], features: [] };
  }
  const { source } = record;
  return {
    status: freshness(root, record, live),
    files: Object.entries(source.files ?? {})
      .filter(
        ([path, sha256]) =>
          !existsSync(join(root, path)) ||
          hash(readFileSync(join(root, path))) !== sha256
      )
      .map(([path]) => path),
    directories: Object.entries(source.directories ?? {})
      .filter(
        ([path, sha256]) =>
          !existsSync(join(root, path)) ||
          directoryFingerprint(root, path) !== sha256
      )
      .map(([path]) => path),
    features: Object.entries(source.features ?? {})
      .filter(
        ([id, sha256]) =>
          live.find((entry) => entry.id === id)?.fingerprint !== sha256
      )
      .map(([id]) => id),
  };
}

export function executionFreshness(root, record, live = []) {
  if (record.binding !== 'current') return 'unknown';
  const inputs = [record.plan, ...record.proof.evidence];
  if (
    inputs.some(
      ({ path, sha256 }) =>
        !existsSync(join(root, path)) ||
        hash(readFileSync(join(root, path))) !== sha256
    )
  ) {
    return 'stale';
  }
  return freshness(root, record, live);
}

export function draftExecution(root, index, path) {
  localPath(root, path);
  const context = historyContext(root, index);
  const plan = context.plans.find((item) => item.path === path);
  assert.ok(
    plan?.scopes?.length,
    'Associate the plan with review_scopes or an inspected documents entry first'
  );
  const sources = plan.scopes.map(
    (scope) => draftReview(root, index, scope).source
  );
  const excluded = executionSummaryInputs(
    index,
    plan.scopes,
    plan.path,
    plan.workKind
  );
  const hasBasis =
    plan.reviewBasis.length &&
    plan.scopes.every((scope) =>
      plan.reviewBasis.some((id) =>
        context.all.some(
          (record) =>
            record.id === id &&
            record.kind === 'review' &&
            record.scope === scope
        )
      )
    );
  return {
    id: '',
    kind: 'execution',
    date: new Date().toISOString().slice(0, 10),
    scopes: plan.scopes,
    reviewBasis: plan.reviewBasis,
    workKind: plan.workKind,
    plan: { path, sha256: plan.sha256 },
    binding: hasBasis ? 'current' : 'historical-unbound',
    outcome: plan.status === 'completed' ? 'completed' : 'partial',
    summary: '',
    proof: {
      state: hasBasis ? 'unverified' : 'unknown',
      evidence: [],
      limits: '',
    },
    source: hasBasis
      ? {
          files: Object.fromEntries(
            Object.entries(
              Object.assign({}, ...sources.map((source) => source.files))
            ).filter(([sourcePath]) => !excluded.has(sourcePath))
          ),
          directories: Object.assign(
            {},
            ...sources.map((source) => source.directories)
          ),
          features: Object.assign(
            {},
            ...sources.map((source) => source.features)
          ),
          upstreams: [],
        }
      : null,
    references: [path],
  };
}

function executionSummaryInputs(index, scopes, plan, workKind) {
  return new Set([
    plan,
    indexPath,
    'docs/research/reviews.md',
    ...scopes.flatMap((id) => [
      index.scopes.find((scope) => scope.id === id)?.decision,
      `docs/research/features/${id}.md`,
    ]),
    ...(workKind === 'workflow'
      ? []
      : [
          '.agents/skills/best-api-review/SKILL.md',
          '.agents/rules/task/references/best-api-review.md',
        ]),
  ]);
}

function validateExecution(root, record, index, prior, recording) {
  assert.ok(
    record.scopes?.length &&
      new Set(record.scopes).size === record.scopes.length,
    'Execution requires unique scopes'
  );
  assert.ok(
    record.scopes.every((id) => index.scopes.some((scope) => scope.id === id)),
    'Unknown execution scope'
  );
  assert.ok(
    Array.isArray(record.reviewBasis),
    'Execution requires reviewBasis'
  );
  for (const id of record.reviewBasis) {
    assert.ok(
      prior.some(
        (item) =>
          item.id === id &&
          item.kind === 'review' &&
          record.scopes.includes(item.scope)
      ),
      `Unknown governing review: ${id}`
    );
  }
  assert.ok(workKinds.has(record.workKind), 'Execution requires workKind');
  assert.ok(
    ['current', 'historical-unbound'].includes(record.binding),
    'Execution requires explicit binding'
  );
  assert.ok(
    ['completed', 'partial', 'blocked', 'abandoned'].includes(record.outcome),
    'Invalid execution outcome'
  );
  assert.ok(
    record.summary?.trim() && record.proof?.limits?.trim(),
    'Execution requires summary and proof limits'
  );
  assert.ok(
    ['verified', 'partial', 'unverified', 'unknown'].includes(
      record.proof.state
    ),
    'Invalid execution proof state'
  );
  assert.ok(
    Array.isArray(record.proof.evidence),
    'Execution requires proof evidence array'
  );
  assert.ok(record.references?.length, 'Execution requires references');
  record.references.forEach((path) => localPath(root, path, recording));
  for (const entry of [record.plan, ...record.proof.evidence]) {
    localPath(root, entry?.path, recording);
    assert.ok(
      /^[a-f0-9]{64}$/.test(entry.sha256),
      'Execution requires plan and proof fingerprints'
    );
    if (recording) {
      assert.equal(
        hash(readFileSync(join(root, entry.path))),
        entry.sha256,
        `Execution input changed: ${entry.path}`
      );
    }
  }
  assert.ok(
    record.proof.evidence.every((entry) => entry.claim?.trim()),
    'Describe what each proof input establishes'
  );
  if (record.binding === 'historical-unbound') {
    assert.equal(
      record.proof.state,
      'unknown',
      'Unbound historical work cannot certify proof'
    );
    assert.equal(
      record.source,
      null,
      'Unbound historical work has no recovered source binding'
    );
  } else {
    assert.ok(
      record.scopes.every((scope) =>
        record.reviewBasis.some((id) =>
          prior.some((item) => item.id === id && item.scope === scope)
        )
      ),
      'Bound execution requires a governing review for each scope'
    );
    assert.ok(
      record.source &&
        [
          record.source.files,
          record.source.directories,
          record.source.features,
        ].some((inputs) => Object.keys(inputs ?? {}).length),
      'Bound execution requires source fingerprints'
    );
    if (record.proof.state === 'verified') {
      assert.ok(
        record.outcome === 'completed' && record.proof.evidence.length,
        'Verified execution requires completion and evidence'
      );
      assert.ok(
        record.proof.evidence.some((entry) => entry.path !== record.plan.path),
        'A completed plan alone does not verify execution'
      );
    }
    if (recording) {
      assert.equal(
        executionFreshness(root, record, discover(root, index)),
        'matching',
        'Execution source changed before recording'
      );
    }
    if (recording) {
      for (const id of record.scopes) {
        const scope = index.scopes.find((item) => item.id === id);
        assert.ok(
          index.features
            .filter((feature) => feature.scope === id)
            .every((feature) => record.source.features?.[feature.id]),
          `Execution source must cover scope members: ${id}`
        );
        for (const path of [
          ...scope.owners,
          ...scope.consumers,
          ...scope.proof,
          ...(scope.evidenceInputs ?? []),
        ].filter(
          (evidencePath) =>
            !executionSummaryInputs(
              index,
              record.scopes,
              record.plan.path,
              record.workKind
            ).has(evidencePath)
        )) {
          assert.ok(
            record.source.files?.[path] || record.source.directories?.[path],
            `Execution must capture declared evidence: ${path}`
          );
        }
      }
    }
  }
  if (recording) {
    const plan = historyContext(root, index).plans.find(
      (item) => item.path === record.plan.path
    );
    assert.ok(plan, 'Execution plan is not discoverable');
    assert.deepEqual(
      [...record.scopes].sort((left, right) => left.localeCompare(right)),
      [...plan.scopes].sort((left, right) => left.localeCompare(right)),
      'Execution scopes disagree with plan association'
    );
    assert.deepEqual(
      [...record.reviewBasis].sort((left, right) => left.localeCompare(right)),
      [...plan.reviewBasis].sort((left, right) => left.localeCompare(right)),
      'Execution governing reviews disagree with plan association'
    );
    assert.equal(
      record.workKind,
      plan.workKind,
      'Execution work kind disagrees with plan'
    );
    assert.ok(
      plan.status !== 'conflict',
      'Resolve conflicting plan lifecycle statuses before recording'
    );
    if (record.outcome === 'completed') {
      assert.equal(
        plan.status,
        'completed',
        'Completed execution requires the plan lifecycle to be complete'
      );
    }
  }
}

export function scopeHistory(
  root,
  index,
  scope,
  context = historyContext(root, index)
) {
  const { all, live } = context;
  const latest = latestRecord(all, scope.id);
  const plans = context.plans.filter((plan) => plan.scopes?.includes(scope.id));
  const executions = all.filter(
    (record) => record.kind === 'execution' && belongsTo(record, scope.id)
  );
  const decision =
    scope.decision && existsSync(join(root, scope.decision))
      ? documentMetadata(read(root, scope.decision))
      : {};
  const gaps = [];
  if (latest && (!scope.decision || !decision.current_review)) {
    gaps.push({
      kind: 'missing-current-decision',
      review: latest.id,
      path: scope.decision ?? null,
    });
  } else if (latest && decision.current_review !== latest.id) {
    gaps.push({
      kind: 'decision-review-mismatch',
      expected: latest.id,
      actual: decision.current_review,
      path: scope.decision,
    });
  }
  for (const plan of plans) {
    if (plan.status === 'conflict') {
      gaps.push({
        kind: 'conflicting-plan-status',
        path: plan.path,
        labels: plan.statusLabels,
      });
    }
    if (!plan.reviewBasis.length) {
      gaps.push({ kind: 'unbound-plan', path: plan.path });
    }
    const outcomes = executions.filter(
      (record) => record.plan.path === plan.path
    );
    if (
      plan.status === 'completed' &&
      !outcomes.some(
        (record) =>
          record.outcome === 'completed' && record.plan.sha256 === plan.sha256
      )
    ) {
      gaps.push({
        kind: 'completed-plan-without-current-outcome',
        path: plan.path,
      });
    }
    if (
      plan.metadataPresent &&
      (!Array.isArray(plan.review_scopes) ||
        !Array.isArray(plan.review_basis) ||
        !workKinds.has(plan.work_kind))
    ) {
      gaps.push({ kind: 'incomplete-plan-metadata', path: plan.path });
    }
  }
  for (const execution of executions) {
    if (
      execution.outcome === 'completed' &&
      !(decision.reconciled_executions ?? []).includes(execution.id)
    ) {
      gaps.push({
        kind: 'unreconciled-execution',
        record: execution.id,
        decision: scope.decision ?? null,
      });
    }
    if (executionFreshness(root, execution, live) === 'stale') {
      gaps.push({ kind: 'stale-execution-proof', record: execution.id });
    }
  }
  const latestExecution = executions.at(-1);
  const retainsOutcome = (review, visited = new Set()) => {
    if (!review || visited.has(review.id)) return false;
    visited.add(review.id);
    return (
      latestExecution.reviewBasis.includes(review.id) ||
      (review.reconciliation ?? []).some(
        (entry) =>
          entry.action === 'retains' &&
          (entry.record === latestExecution.id ||
            retainsOutcome(
              all.find(
                (record) =>
                  record.id === entry.record && record.kind === 'review'
              ),
              visited
            ))
      )
    );
  };
  const governsCurrentReview =
    latestExecution?.binding === 'current' && retainsOutcome(latest);
  if (latestExecution?.binding === 'current' && !governsCurrentReview) {
    gaps.push({
      kind: 'decision-changed',
      record: latestExecution.id,
      decision: scope.decision ?? null,
    });
  }
  const historicalOutcome = [...executions]
    .reverse()
    .find((record) => record.binding === 'current');
  const progress =
    latestExecution?.binding === 'current' && governsCurrentReview
      ? {
          state:
            latestExecution.outcome === 'completed' &&
            ['design', 'research', 'verification'].includes(
              latestExecution.workKind
            )
              ? `${latestExecution.workKind}-complete`
              : latestExecution.outcome,
          adoption: ['implementation', 'workflow'].includes(
            latestExecution.workKind
          )
            ? latestExecution.outcome
            : 'not-established',
          record: latestExecution.id,
          reviewBasis: latestExecution.reviewBasis,
          plan: latestExecution.plan.path,
          workKind: latestExecution.workKind,
          proof:
            executionFreshness(root, latestExecution, live) === 'matching'
              ? latestExecution.proof.state
              : executionFreshness(root, latestExecution, live),
          evidence: latestExecution.proof.evidence,
          limits: latestExecution.proof.limits,
          governsCurrentReview: true,
        }
      : {
          state:
            latestExecution?.binding === 'current'
              ? 'decision-changed'
              : executions.length ||
                  plans.some((plan) => plan.status === 'completed') ||
                  scope.adoption === 'adopted'
                ? 'unbound'
                : plans.some((plan) => plan.status === 'in-progress')
                  ? 'in-progress'
                  : plans.length
                    ? 'planned'
                    : 'not-assessed',
          proof: 'unknown',
          record: null,
          reviewBasis: [],
          limits:
            'No reconciled source-bound execution outcome establishes current adoption or proof.',
          ...(historicalOutcome
            ? {
                priorOutcome: {
                  record: historicalOutcome.id,
                  reviewBasis: historicalOutcome.reviewBasis,
                  workKind: historicalOutcome.workKind,
                  outcome: historicalOutcome.outcome,
                  proof: historicalOutcome.proof.state,
                  freshness: executionFreshness(root, historicalOutcome, live),
                },
              }
            : {}),
        };
  const afterReview = all
    .slice(latest ? all.indexOf(latest) + 1 : 0)
    .filter(
      (record) => record.kind === 'execution' && belongsTo(record, scope.id)
    );
  return {
    latest,
    plans,
    executions,
    progress,
    gaps,
    decision,
    afterReview,
    history: all.filter((record) => belongsTo(record, scope.id)),
  };
}

export function validateRecord(
  root,
  record,
  index,
  prior = [],
  { recording = true } = {}
) {
  assert.ok(/^[a-z0-9][a-z0-9-]+$/.test(record.id), 'Invalid review ID');
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(record.date), 'Missing review date');
  if (record.kind === 'execution') {
    validateExecution(root, record, index, prior, recording);
    return;
  }
  assert.ok(
    index.scopes.some((scope) => scope.id === record.scope),
    'Unknown review scope'
  );
  assert.ok(
    ['review', 'historical'].includes(record.kind),
    'Invalid record kind'
  );
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(record.date), 'Missing review date');
  for (const field of [
    'question',
    'summary',
    'trigger',
    'method',
    'proofLimits',
  ]) {
    assert.ok(
      typeof record[field] === 'string' && record[field].trim(),
      `Missing ${field}`
    );
  }
  assert.ok(
    Object.hasOwn(record, 'model'),
    'Record known model identity or null'
  );
  assert.ok(
    ['stop', 'pursue', 'defer', null].includes(record.verdict),
    'Invalid verdict'
  );
  assert.ok(
    [
      'initial',
      'reaffirms',
      'supersedes',
      'reverses',
      'defers',
      'historical-context',
    ].includes(record.relation),
    'Invalid review relation'
  );
  assert.ok(record.references?.length, 'Record requires evidence references');
  record.references.forEach((path) => localPath(root, path, recording));
  if (record.previous) {
    assert.ok(
      prior.some(
        (item) => item.id === record.previous && item.scope === record.scope
      ),
      'Previous record must exist in this scope'
    );
  }
  if (record.kind === 'review') {
    assert.ok(record.verdict, 'Completed review requires Stop/Pursue/Defer');
    assert.ok(
      record.requirements?.length &&
        record.requirements.every(
          (item) => typeof item === 'string' && item.trim()
        ),
      'Record current requirements and hard laws'
    );
    assert.ok(
      typeof record.evidenceReuse === 'string' && record.evidenceReuse.trim(),
      'Explain which evidence was reused or rechecked and why'
    );
    assert.ok(
      record.alternatives?.length >= 2,
      'Record the alternatives, including the strongest cut'
    );
    assert.ok(
      record.alternatives.every(
        (item) => typeof item === 'string' && item.trim()
      ),
      'Alternatives require concise findings'
    );
    assert.ok(
      record.source &&
        [
          record.source.features,
          record.source.files,
          record.source.directories,
        ].some((input) => Object.keys(input ?? {}).length),
      'Review requires current evidence fingerprints'
    );
    const expected = index.features
      .filter((feature) => feature.scope === record.scope)
      .map((feature) => feature.id);
    if (recording) {
      assert.ok(
        expected.every((id) => record.source.features[id]),
        'Review source must cover every scope member'
      );
      const scope = index.scopes.find((item) => item.id === record.scope);
      for (const path of [
        ...scope.owners,
        ...scope.consumers,
        ...scope.proof,
        ...(scope.evidenceInputs ?? []),
      ]) {
        if (!existsSync(join(root, path))) continue;
        assert.ok(
          record.source.files?.[path] || record.source.directories?.[path],
          `Review must capture declared evidence: ${path}`
        );
      }
    }
    assert.ok(
      !prior.some(
        (item) => item.scope === record.scope && item.kind !== 'execution'
      ) || record.previous,
      'Repeated review must reconcile previous history'
    );
    assert.ok(
      record.previous
        ? record.relation !== 'initial'
        : record.relation === 'initial',
      'Initial relation must match history'
    );
    if (recording || record.method === 'best-api-review/history-v3') {
      assert.ok(
        Array.isArray(record.reconciliation),
        'Record structured history reconciliation'
      );
      for (const entry of record.reconciliation) {
        const referenced = prior.find((item) => item.id === entry.record);
        assert.ok(referenced, `Unknown reconciliation record: ${entry.record}`);
        assert.ok(
          ['retains', 'reopens', 'supersedes'].includes(entry.action) &&
            entry.reason?.trim(),
          'Reconciliation requires a disposition and reason'
        );
        const question =
          referenced.question ??
          index.scopes.find((scope) => scope.id === record.scope).question;
        assert.equal(
          entry.question,
          question,
          'Reconcile the exact prior question; do not silently reopen adjacent decisions'
        );
      }
      const previous = prior.find((item) => item.id === record.previous);
      const required = [
        ...(previous ? [previous.id] : []),
        ...prior
          .slice(previous ? prior.indexOf(previous) + 1 : 0)
          .filter(
            (item) =>
              item.kind === 'execution' &&
              item.binding === 'current' &&
              belongsTo(item, record.scope)
          )
          .map((item) => item.id),
      ];
      assert.ok(
        required.every((id) =>
          record.reconciliation.some((entry) => entry.record === id)
        ),
        'Reconcile the previous conclusion and subsequent execution before review'
      );
      if (previous?.verdict && previous.verdict !== record.verdict) {
        assert.ok(
          record.reconciliation.some(
            (entry) =>
              entry.record === previous.id && entry.action !== 'retains'
          ),
          'A changed verdict must explicitly reopen or supersede its prior conclusion'
        );
      }
    }
    for (const [path, digest] of Object.entries(record.source.files ?? {})) {
      if (recording) {
        localPath(root, path);
        assert.ok(
          hash(readFileSync(join(root, path))) === digest,
          `Source changed before recording: ${path}`
        );
      }
    }
  }
}

export function records(root, index) {
  return index.records.map((entry) => {
    const contents = read(root, entry.path);
    assert.ok(
      hash(contents) === entry.sha256,
      `Immutable record changed: ${entry.path}`
    );
    return JSON.parse(contents);
  });
}

export function validate(
  root,
  index,
  { current = true, scopeEvidence = true } = {}
) {
  assert.ok(index.version === 1, 'Unsupported ledger version');
  for (const key of ['features', 'scopes', 'records']) {
    assert.ok(Array.isArray(index[key]), `Missing ${key}`);
  }
  const live = discover(root, index);
  const unique = (items, label) =>
    assert.ok(new Set(items).size === items.length, `Duplicate ${label}`);
  unique(
    index.features.map((item) => item.id),
    'feature ID'
  );
  unique(
    index.scopes.map((item) => item.id),
    'scope ID'
  );
  unique(
    index.records.map((item) => item.path),
    'record path'
  );
  assert.deepEqual(
    index.features.map((item) => item.id).sort(compareStrings),
    live.map((item) => item.id).sort(compareStrings),
    'Inventory changed; reconcile added/removed feature identities'
  );
  for (const feature of index.features) {
    assert.ok(
      index.scopes.some((scope) => scope.id === feature.scope),
      `Unknown scope for ${feature.id}`
    );
    assert.ok(
      ['review', 'grouped', 'support'].includes(feature.disposition),
      `Missing disposition: ${feature.id}`
    );
    if (feature.source && current) {
      localPath(root, feature.source);
      assert.ok(
        live
          .find((item) => item.id === feature.id)
          .paths.includes(feature.source),
        `Source example is outside feature membership: ${feature.id}`
      );
    }
    if (current) {
      assert.equal(
        feature.fingerprint,
        live.find((item) => item.id === feature.id).fingerprint,
        `Stale inventory: ${feature.id}; inspect source and refresh`
      );
    }
  }
  for (const scope of index.scopes) {
    assert.ok(
      scope.question &&
        scope.opportunity.reason &&
        Number.isInteger(scope.opportunity.score) &&
        scope.opportunity.score >= 0 &&
        scope.opportunity.score <= 10,
      `Invalid scope or opportunity: ${scope.id}`
    );
    assert.ok(
      scope.owners.length &&
        scope.consumers.length &&
        Array.isArray(scope.proof),
      `Missing owner/consumer/proof: ${scope.id}`
    );
    assert.ok(
      scope.proof.length || scope.gaps?.trim(),
      `Missing proof gap: ${scope.id}`
    );
    [
      ...scope.owners,
      ...scope.consumers,
      ...scope.proof,
      ...(scope.evidenceInputs ?? []),
      ...scope.plans,
      ...(scope.historyCandidates ?? []),
      ...(scope.decision ? [scope.decision] : []),
    ].forEach((path) => localPath(root, path, scopeEvidence));
    for (const id of scope.relatedScopes ?? []) {
      assert.ok(
        id !== scope.id && index.scopes.some((item) => item.id === id),
        `Unknown related scope: ${id}`
      );
    }
    if (index.inventory.snapshot) {
      assert.ok(
        scope.inspection?.trim() && scope.gaps?.trim(),
        `Missing inspection limits: ${scope.id}`
      );
      assert.ok(
        !scope.dependsOn.length || scope.prerequisiteReason?.trim(),
        `Missing prerequisite reason: ${scope.id}`
      );
    }
    assert.ok(
      ['unassessed', 'historical', 'reviewed'].includes(scope.review),
      `Invalid review state: ${scope.id}`
    );
    assert.ok(
      ['not-assessed', 'planned', 'in-progress', 'adopted'].includes(
        scope.adoption
      ),
      `Invalid adoption state: ${scope.id}`
    );
    assert.ok(
      ['not-replayed', 'partial', 'verified'].includes(scope.proofState),
      `Invalid proof state: ${scope.id}`
    );
  }
  if (current && index.inventory.snapshot) {
    assert.equal(
      index.inventory.snapshot.fingerprint,
      inventoryFingerprint(live),
      'Inventory snapshot fingerprint is stale'
    );
  }
  orderScopes(index.scopes);
  reviewQueue(index);
  const all = records(root, index);
  unique(
    all.map((item) => item.id),
    'review ID'
  );
  for (const [i, record] of all.entries()) {
    validateRecord(root, record, index, all.slice(0, i), { recording: false });
  }
  unique(
    (index.documents ?? []).map((item) => item.path),
    'document association'
  );
  for (const document of index.documents ?? []) {
    localPath(root, document.path);
    assert.ok(
      [
        'plan',
        'decision',
        'lesson',
        'specification',
        'report',
        'history',
      ].includes(document.kind) &&
        ['active', 'historical', 'superseded', 'candidate'].includes(
          document.disposition
        ) &&
        document.rationale?.trim(),
      `Classify inspected document: ${document.path}`
    );
    assert.ok(
      document.scopes?.length &&
        new Set(document.scopes).size === document.scopes.length &&
        document.scopes.every((id) =>
          index.scopes.some((scope) => scope.id === id)
        ),
      `Invalid document scopes: ${document.path}`
    );
    for (const id of document.reviewBasis ?? []) {
      assert.ok(
        all.some(
          (record) =>
            record.id === id &&
            record.kind === 'review' &&
            document.scopes.includes(record.scope)
        ),
        `Unknown document review basis: ${id}`
      );
    }
    if (document.workKind) {
      assert.ok(
        workKinds.has(document.workKind),
        `Invalid document work kind: ${document.path}`
      );
    }
  }
  unique(
    (index.rejectedCandidates ?? []).map((item) => item.path),
    'rejected candidate'
  );
  for (const candidate of index.rejectedCandidates ?? []) {
    localPath(root, candidate.path);
    assert.ok(
      candidate.reason?.trim() &&
        candidate.scopes?.length &&
        candidate.scopes.every((id) =>
          index.scopes.some((scope) => scope.id === id)
        ),
      `Invalid rejected candidate: ${candidate.path}`
    );
    assert.ok(
      !(index.documents ?? []).some(
        (document) =>
          document.path === candidate.path &&
          document.disposition !== 'candidate' &&
          document.scopes.some((id) => candidate.scopes.includes(id))
      ),
      `Candidate is both rejected and associated: ${candidate.path}`
    );
  }
  const context = historyContext(root, index, live);
  for (const historyPlan of context.plans.filter(
    (candidatePlan) => candidatePlan.metadataPresent
  )) {
    assert.ok(
      Array.isArray(historyPlan.review_scopes) &&
        Array.isArray(historyPlan.review_basis) &&
        (historyPlan.review_scopes.length ||
          !historyPlan.review_basis.length) &&
        workKinds.has(historyPlan.work_kind),
      `Incomplete plan metadata: ${historyPlan.path}`
    );
    assert.equal(
      historyPlan.statusLabels.length,
      1,
      `Plan metadata requires one lifecycle Status: ${historyPlan.path}`
    );
    assert.ok(
      historyPlan.review_scopes.every((id) =>
        index.scopes.some((scope) => scope.id === id)
      ),
      `Unknown plan scope: ${historyPlan.path}`
    );
    for (const id of historyPlan.review_basis) {
      assert.ok(
        all.some(
          (record) =>
            record.id === id &&
            record.kind === 'review' &&
            historyPlan.review_scopes.includes(record.scope)
        ),
        `Unknown plan review basis: ${id}`
      );
    }
  }
  for (const scope of index.scopes) {
    const latest = latestRecord(all, scope.id);
    assert.equal(
      scope.review,
      latest?.kind === 'review'
        ? 'reviewed'
        : latest
          ? 'historical'
          : 'unassessed',
      `Review state disagrees with records: ${scope.id}`
    );
  }
  return {
    features: live.length,
    files: new Set(live.flatMap((item) => item.paths)).size,
    scopes: index.scopes.length,
    records: all.length,
    trackingGaps: index.scopes.reduce(
      (count, scope) =>
        count + scopeHistory(root, index, scope, context).gaps.length,
      0
    ),
    unassociatedPlans: context.plans.filter(
      (plan) => plan.association === 'unassociated'
    ).length,
    explicitlyUnscopedPlans: context.plans.filter(
      (plan) => plan.association === 'not-applicable'
    ).length,
    live,
  };
}

export function recordReview(root, index, record) {
  const prior = records(root, index);
  const existing = prior.find((item) => item.id === record.id);
  const path = `docs/research/review-records/${record.id}.json`;
  if (existing) {
    assert.deepEqual(
      record,
      existing,
      'Review ID already recorded with different contents'
    );
    return path;
  }
  validateRecord(root, record, index, prior);
  if (record.kind === 'review') {
    assert.equal(
      record.previous,
      latestRecord(prior, record.scope)?.id ?? null,
      'Reconcile the latest review before recording'
    );
    assert.equal(
      freshness(root, record, discover(root, index)),
      'matching',
      'Review source changed before recording'
    );
  }
  const contents = json(record);
  mkdirSync(join(root, dirname(path)), { recursive: true });
  if (existsSync(join(root, path))) {
    assert.equal(
      read(root, path),
      contents,
      'Unindexed record already exists with different contents'
    );
  } else writeFileSync(join(root, path), contents, { flag: 'wx' });
  index.records.push({ path, sha256: hash(contents) });
  if (record.kind !== 'execution') {
    index.scopes.find((scope) => scope.id === record.scope).review =
      latestRecord([...prior, record], record.scope).kind === 'review'
        ? 'reviewed'
        : 'historical';
  }
  return path;
}

export function searchResearch(root, query) {
  assert.ok(query?.trim(), 'Supply a research query or semantic key');
  const needle = query.toLowerCase();
  const matches = [];
  const warnings = [];
  for (const run of readdirSync(join(root, 'docs/plite/research'), {
    withFileTypes: true,
  }).filter((entry) => entry.isDirectory())) {
    for (const name of [
      'repo-registry.tsv',
      'query-ledger.tsv',
      'read-log.tsv',
      'lead-ledger.tsv',
      'rejected-ledger.tsv',
      'promoted-ledger.tsv',
    ]) {
      const path = `docs/plite/research/${run.name}/${name}`;
      if (!existsSync(join(root, path))) continue;
      const [header, ...lines] = read(root, path).split(/\r?\n/);
      const keys = header.split('\t');
      for (const [i, line] of lines.entries()) {
        if (!line) continue;
        const cells = line.split('\t');
        const malformed =
          cells.length !== keys.length || new Set(keys).size !== keys.length;
        if (malformed) {
          warnings.push({
            path,
            line: i + 2,
            issue: 'Header/cell mismatch; inspect original row',
          });
        }
        if (
          !line.toLowerCase().includes(needle) &&
          !run.name.toLowerCase().includes(needle)
        ) {
          continue;
        }
        const row = malformed
          ? null
          : Object.fromEntries(keys.map((key, column) => [key, cells[column]]));
        matches.push({
          path,
          line: i + 2,
          status: row?.status ?? null,
          row,
          ...(malformed ? { header: keys, rawCells: cells } : {}),
        });
      }
    }
  }
  return {
    query,
    matches,
    warnings,
    limit:
      'Text/key lookup only; semantic equivalence and source reuse require review. Original headers and status are preserved.',
  };
}

const bounded = (items, limit = 8) => ({
  items: items.slice(0, limit),
  total: items.length,
  omitted: Math.max(0, items.length - limit),
});
const markdownCell = (value) =>
  String(value ?? '')
    .replaceAll('|', '\\|')
    .replaceAll('\n', ' ');
const documentLink = (from, path, label = path.split('/').at(-1)) =>
  `[${label}](${relative(dirname(from), path)})`;
// Excerpts keep their meaning; their original relative links belong to the linked source.
const excerptText = (text) =>
  text.replace(/\[([^\]\n]+)\]\((?:[^()\n]|\([^()\n]*\))*\)/g, '$1');

function retrievalCandidates(index, scope) {
  const classified = new Set(
    (index.documents ?? [])
      .filter(
        (doc) =>
          doc.disposition !== 'candidate' && doc.scopes.includes(scope.id)
      )
      .map((doc) => doc.path)
  );
  const rejected = (index.rejectedCandidates ?? []).filter((entry) =>
    entry.scopes.includes(scope.id)
  );
  const rejectedPaths = new Set(rejected.map((entry) => entry.path));
  return {
    unresolved: [
      ...new Set([
        ...(scope.historyCandidates ?? []),
        ...(index.documents ?? [])
          .filter(
            (doc) =>
              doc.disposition === 'candidate' && doc.scopes.includes(scope.id)
          )
          .map((doc) => doc.path),
      ]),
    ].filter((path) => !classified.has(path) && !rejectedPaths.has(path)),
    rejected,
  };
}

function compactScope(root, index, scope, context) {
  const state = scopeHistory(root, index, scope, context);
  const brief = (record) => {
    const summary = recordSummary(root, record, context.live);
    return {
      id: summary.id,
      kind: summary.kind,
      verdict: summary.verdict,
      ...(record.kind === 'execution'
        ? {
            outcome: record.outcome,
            binding: record.binding,
            plan: record.plan.path,
          }
        : { question: record.question }),
      freshness: summary.freshness,
      summary:
        summary.summary.length > 220
          ? `${summary.summary.slice(0, 217)}...`
          : summary.summary,
    };
  };
  const history = state.history
    .filter((record) => record.kind !== 'execution')
    .slice(-3)
    .map(brief);
  const changed = changedInputs(root, state.latest, context.live);
  const candidates = retrievalCandidates(index, scope);
  const planPriority = (plan) =>
    plan.reviewBasis.includes(state.latest?.id) ||
    state.latest?.references?.includes(plan.path)
      ? 0
      : ['in-progress', 'gated', 'blocked', 'planned'].includes(plan.status)
        ? 1
        : 2;
  const planDate = (path) =>
    path.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? '0000-00-00';
  const planSummaries = state.plans
    .sort(
      (a, b) =>
        planPriority(a) - planPriority(b) ||
        planDate(b.path).localeCompare(planDate(a.path)) ||
        b.path.localeCompare(a.path)
    )
    .map((plan) => ({
      path: plan.path,
      status: plan.status,
      workKind: plan.workKind,
      reviewBasis: plan.reviewBasis,
      association: plan.association,
    }));
  const gapPriority = (gap) =>
    ['decision-review-mismatch', 'missing-current-decision'].includes(gap.kind)
      ? 0
      : [
            'unreconciled-execution',
            'stale-execution-proof',
            'decision-changed',
          ].includes(gap.kind)
        ? 1
        : gap.kind === 'unbound-plan'
          ? 3
          : 2;
  const gaps = [...state.gaps].sort(
    (a, b) =>
      gapPriority(a) - gapPriority(b) ||
      (b.record ?? b.path ?? '').localeCompare(a.record ?? a.path ?? '')
  );
  return {
    id: scope.id,
    title: scope.title,
    question: scope.question,
    hub: `docs/research/features/${scope.id}.md`,
    decision: scope.decision ?? null,
    review: scope.review,
    current: state.latest
      ? {
          ...recordSummary(root, state.latest, context.live),
          summary:
            state.latest.summary.length > 600
              ? `${state.latest.summary.slice(0, 597)}...`
              : state.latest.summary,
        }
      : null,
    adoption: state.progress.adoption ?? state.progress.state,
    proofState: state.progress.proof,
    progress: {
      ...state.progress,
      evidence: state.progress.evidence?.map(({ path, claim }) => ({
        path,
        claim,
      })),
    },
    reviewGroup:
      (index.reviewGroups ?? []).find((item) =>
        item.scopes.includes(scope.id)
      ) ?? null,
    observation: {
      inventoryStatus: index.inventory.snapshot
        ? index.inventory.snapshot.fingerprint ===
          inventoryFingerprint(context.live)
          ? 'matching'
          : 'stale'
        : 'unknown',
      status: index.features
        .filter((feature) => feature.scope === scope.id)
        .some(
          (feature) =>
            context.live.find((item) => item.id === feature.id)?.fingerprint !==
            feature.fingerprint
        )
        ? 'stale'
        : 'matching',
    },
    changedInputs: {
      status: changed.status,
      files: bounded(changed.files, 5),
      directories: bounded(changed.directories, 5),
      features: bounded(changed.features, 5),
    },
    reconciliation: bounded(state.latest?.reconciliation ?? []),
    subsequentExecution: bounded(
      state.afterReview
        .slice()
        .sort(
          (a, b) =>
            Number(b.reviewBasis.includes(state.latest?.id)) -
              Number(a.reviewBasis.includes(state.latest?.id)) ||
            planDate(b.plan.path).localeCompare(planDate(a.plan.path)) ||
            context.all.indexOf(b) - context.all.indexOf(a)
        )
        .map(brief),
      3
    ),
    plans: bounded(planSummaries, 5),
    conflicts: {
      ...bounded(gaps, 5),
      byKind: Object.fromEntries(
        [...new Set(gaps.map((gap) => gap.kind))].map((kind) => [
          kind,
          gaps.filter((gap) => gap.kind === kind).length,
        ])
      ),
    },
    history,
    historySelection:
      'Recent review summaries; outcomes recorded later are listed separately.',
    historyTotal: state.history.length,
    historyOmitted: Math.max(0, state.history.length - history.length),
    related: (scope.relatedScopes ?? []).map((id) => {
      const latest = latestRecord(context.all, id);
      return {
        id,
        hub: `docs/research/features/${id}.md`,
        history: latest
          ? [
              {
                id: latest.id,
                verdict: latest.verdict,
                summary:
                  latest.summary.length > 120
                    ? `${latest.summary.slice(0, 117)}...`
                    : latest.summary,
              },
            ]
          : [],
      };
    }),
    historyCandidates: bounded(candidates.unresolved, 3),
    rejectedCandidates: {
      total: candidates.rejected.length,
      detail: `node tooling/scripts/review-ledger.mjs lookup ${scope.id} --detail`,
    },
    detail: `node tooling/scripts/review-ledger.mjs lookup ${scope.id} --detail`,
  };
}

export function renderFeature(
  root,
  index,
  scope,
  context = historyContext(root, index)
) {
  const path = `docs/research/features/${scope.id}.md`;
  const link = (target, label) =>
    existsSync(join(root, target))
      ? documentLink(path, target, label)
      : `\`${target}\` (historical input unavailable)`;
  const state = scopeHistory(root, index, scope, context);
  const candidates = retrievalCandidates(index, scope);
  const changes = changedInputs(root, state.latest, context.live);
  const lines = [
    `# ${scope.title}`,
    '',
    'Generated by `node tooling/scripts/review-ledger.mjs render`. Links and summaries derive from the ledger, plan lifecycle and immutable outcomes; do not maintain status here.',
    '',
    `[Docs guide](../../README.md) · [Review queue](../reviews.md) · [Ledger schema](../schema.md)`,
    '',
    `Question: ${scope.question}`,
    '',
    '## Current decision',
    '',
    state.latest
      ? `${link(`docs/research/review-records/${state.latest.id}.json`, state.latest.id)} — **${state.latest.verdict ?? 'historical / unknown'}**. ${state.latest.summary}`
      : 'Unassessed. No review conclusion is recorded.',
    '',
    `Compiled decision: ${scope.decision ? link(scope.decision) : 'not associated'}. Source observation: ${changes.status}. Source matching is not behavior proof.`,
    '',
    `Execution: **${state.progress.state}**. Proof: **${state.progress.proof}**. ${state.progress.limits}`,
  ];
  if (state.progress.record) {
    lines.push(
      '',
      `Outcome: ${link(`docs/research/review-records/${state.progress.record}.json`, state.progress.record)}. Governing reviews: ${state.progress.reviewBasis.map((id) => link(`docs/research/review-records/${id}.json`, id)).join(', ')}. Work kind: ${state.progress.workKind}. Reconciled with current review: ${state.progress.governsCurrentReview ? 'yes' : 'no; evidence belongs to the named governing review'}.`
    );
  }
  if (scope.adoption || scope.proofState) {
    lines.push(
      '',
      `Imported scope flags (unbound historical claims): adoption ${scope.adoption ?? 'unknown'}, proof ${scope.proofState ?? 'unknown'}. These flags do not establish current progress.`
    );
  }
  lines.push(
    '',
    '## Changes and tracking gaps',
    '',
    `Changed files: ${changes.files.map((item) => link(item)).join(', ') || 'none identified'}. Changed directories: ${changes.directories.map((item) => link(item)).join(', ') || 'none identified'}. Changed source groups: ${changes.features.join(', ') || 'none identified'}.`
  );
  if (!state.gaps.length) {
    lines.push(
      '',
      'No structural tracking gap detected. This does not certify the architectural conclusion.'
    );
  }
  for (const gap of state.gaps) {
    lines.push(
      '',
      `- **${gap.kind}**: ${gap.path ? link(gap.path) : gap.record ? link(`docs/research/review-records/${gap.record}.json`, gap.record) : (gap.review ?? '')}${gap.expected ? `; expected ${gap.expected}, recorded ${gap.actual ?? 'unknown'}` : ''}.`
    );
  }
  lines.push(
    '',
    '## Plans and execution',
    '',
    'The plan owns its lifecycle. Design completion is not implementation adoption. Unknown or unbound evidence stays explicit.',
    '',
    '| Plan | Lifecycle | Work kind | Governing review |',
    '| --- | --- | --- | --- |'
  );
  for (const plan of state.plans) {
    lines.push(
      `| ${link(plan.path)} | ${plan.status} | ${plan.workKind ?? 'unknown'} | ${plan.reviewBasis.map((id) => link(`docs/research/review-records/${id}.json`, id)).join(', ') || 'unbound'} |`
    );
  }
  if (!state.plans.length) {
    lines.push('| No associated plan | unknown | unknown | unbound |');
  }
  lines.push(
    '',
    '### Outcomes recorded after the latest review',
    '',
    'Record order is observation order. Historical imports do not establish when execution happened.',
    ''
  );
  if (!state.afterReview.length) {
    lines.push(
      'No subsequent execution outcome recorded. Completed plans without outcomes remain gaps above.'
    );
  }
  for (const record of state.afterReview) {
    lines.push(
      `- ${link(`docs/research/review-records/${record.id}.json`, record.id)}: ${record.outcome}; binding **${record.binding}**; ${record.summary} Proof: ${executionFreshness(root, record, context.live)} / ${record.proof.state}. ${record.proof.limits}`
    );
  }
  lines.push('', '## Inspected documents', '');
  const documents = (index.documents ?? []).filter(
    (doc) => doc.scopes.includes(scope.id) && doc.disposition !== 'candidate'
  );
  if (!documents.length) {
    lines.push(
      'No additional classified document. Linked legacy plans and immutable references remain available.'
    );
  }
  for (const document of documents) {
    lines.push(
      `- ${link(document.path)} — ${document.kind}, ${document.disposition}. ${excerptText(document.rationale)}`
    );
  }
  lines.push(
    '',
    '## Chronological history and alternatives',
    '',
    'Earlier conclusions and rejected alternatives remain question-specific. A newer paint observation does not automatically reopen topology or resize ownership.',
    ''
  );
  if (!state.history.length) lines.push('No immutable history recorded.');
  for (const record of [...state.history].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      context.all.indexOf(a) - context.all.indexOf(b)
  )) {
    lines.push(
      `### ${record.date}: ${record.id}`,
      '',
      `${link(`docs/research/review-records/${record.id}.json`, 'Immutable record')} — ${record.kind}; ${record.verdict ?? record.outcome ?? 'unknown'}; observation ${record.kind === 'execution' ? executionFreshness(root, record, context.live) : freshness(root, record, context.live)}.`,
      '',
      record.summary,
      ''
    );
    if (record.question) lines.push(`Question: ${record.question}`, '');
    for (const alternative of record.alternatives ?? []) {
      lines.push(`- ${alternative}`);
    }
    for (const entry of record.reconciliation ?? []) {
      lines.push(
        `- ${entry.action} ${link(`docs/research/review-records/${entry.record}.json`, entry.record)} (${entry.question}): ${entry.reason}`
      );
    }
    lines.push(
      '',
      `Proof limits: ${record.proofLimits ?? record.proof.limits}`,
      '',
      `References: ${(record.references ?? []).map((item) => link(item)).join(', ') || 'none'}.`,
      ''
    );
  }
  lines.push(
    '## Retrieval boundaries',
    '',
    `${candidates.unresolved.length} unclassified candidates. Filename matches are discovery leads, not adopted decisions.`,
    ''
  );
  for (const candidate of candidates.unresolved) {
    lines.push(`- ${link(candidate)}`);
  }
  lines.push(
    '',
    `${candidates.rejected.length} rejected retrieval matches retained to prevent rediscovery.`,
    ''
  );
  for (const rejected of candidates.rejected) {
    lines.push(`- ${link(rejected.path)}: ${rejected.reason}`);
  }
  lines.push(
    '',
    '## Owners and evidence entrypoints',
    '',
    `Owners: ${scope.owners.map((item) => link(item)).join(', ')}.`,
    '',
    `Consumers: ${scope.consumers.map((item) => link(item)).join(', ')}.`,
    '',
    `Proof entrypoints: ${scope.proof.map((item) => link(item)).join(', ') || 'none located'}. These links alone are not proof of a passing run.`,
    '',
    `Inspection: ${scope.inspection ?? 'unknown'}`,
    '',
    `Limits: ${scope.gaps ?? 'unknown'}`,
    '',
    `Related questions: ${(scope.relatedScopes ?? []).map((id) => `[${id}](${id}.md)`).join(', ') || 'none'}.`
  );
  return `${lines.join('\n')}\n`;
}

export function render(root, index, context = historyContext(root, index)) {
  const queue = reviewQueue(index);
  const lines = [
    '# Feature review ledger',
    '',
    'Generated by `node tooling/scripts/review-ledger.mjs render`. This is the queue; each feature hub owns the generated history view. [Docs guide](../README.md) · [Schema](schema.md).',
    '',
    `Inventory: ${index.features.length} source/capability/entrypoint groups across ${index.scopes.length} semantic review questions. Observation: ${index.inventory.checkedAt}.`,
    '',
    `Review queue: ${queue.filter((unit) => unit.pending > 0).length} pending reviews across ${queue.reduce((count, unit) => count + unit.pending, 0)} pending questions; ${queue.length} reviews in total.`,
    '',
    'Review, execution and proof are distinct. Progress is derived from immutable execution outcomes bound to a governing review, plan fingerprint and evidence. Legacy flags and completed plans without recovered evidence stay unbound. Source matching does not certify behavior.',
    '',
    'Scores estimate review payoff (0–10), not architecture quality. Prerequisites constrain order; related questions only supply context. AI is last in the global queue. A directly selected feature takes precedence.',
    '',
    '| Order | Review | Payoff | Questions | Reviewed | Pending |',
    '| --- | --- | ---: | ---: | ---: | ---: |',
  ];
  for (const [position, unit] of queue.entries()) {
    lines.push(
      `| ${position + 1} | [${unit.title}](#${unit.id}) | ${unit.opportunity.score} | ${unit.scopes.length} | ${unit.reviewed} | ${unit.pending} |`
    );
  }
  for (const group of index.reviewGroups ?? []) {
    lines.push(
      '',
      `<a id="${group.id}"></a>`,
      '',
      `## ${group.title}`,
      '',
      group.reason,
      '',
      ...group.scopes.map((id) => `- [${id}](features/${id}.md)`)
    );
  }
  lines.push(
    '',
    '## Feature progress',
    '',
    '| Question | Current conclusion | Execution | Proof | Gaps |',
    '| --- | --- | --- | --- | ---: |'
  );
  for (const scope of orderScopes(index.scopes)) {
    const state = scopeHistory(root, index, scope, context);
    lines.push(
      `| <a id="${scope.id}"></a>[${scope.title}](features/${scope.id}.md) | ${markdownCell(state.latest ? `${state.latest.verdict ?? 'historical'}: ${state.latest.summary}` : 'unassessed')} | ${state.progress.state}${state.progress.workKind ? ` (${state.progress.workKind})` : ''} | ${state.progress.proof} | ${state.gaps.length} |`
    );
  }
  const unassociated = context.plans.filter(
    (plan) => plan.association === 'unassociated'
  );
  lines.push(
    '',
    '## Retrieval limits',
    '',
    `${unassociated.length} discovered plans have no scope association. They remain unclassified; a filename match is not evidence. Use inspected document associations or plan metadata before claiming feature coverage.`,
    '',
    `Source census: ${new Set(context.live.flatMap((item) => item.paths)).size} distinct files. Current inventory: ${index.inventory.snapshot ? (index.inventory.snapshot.fingerprint === inventoryFingerprint(context.live) ? 'matching' : 'stale') : 'unknown'}. Original immutable records remain at their historical paths.`,
    '',
    'Use `lookup <scope>` for a compact conclusion and change summary. Use `lookup <scope> --detail` for complete records, fingerprints, associations and candidates.'
  );
  return `${lines.join('\n')}\n`;
}

export function main(root, args) {
  const [command, argument] = args;
  const index = parse(root, indexPath);
  if (command === 'discover') {
    return discover(root, index).map(({ paths, ...item }) => ({
      ...item,
      example: paths[0],
    }));
  }
  if (command === 'research') return searchResearch(root, argument);
  if (command === 'queue') return reviewQueue(index);
  if (command === 'draft') return draftReview(root, index, argument);
  if (command === 'draft-execution') {
    return draftExecution(root, index, argument);
  }
  if (command === 'lookup') {
    assert.ok(argument, 'Supply a scope, feature or search term');
    const group = (index.reviewGroups ?? []).find(
      (item) => item.id === argument.toLowerCase()
    );
    const exact = index.scopes.find(
      (scope) => scope.id === argument.toLowerCase()
    );
    const scopes = index.scopes.filter((scope) =>
      group
        ? group.scopes.includes(scope.id)
        : exact
          ? scope === exact
          : `${scope.id} ${scope.title} ${scope.question}`
              .toLowerCase()
              .includes(argument.toLowerCase()) ||
            index.features.some(
              (feature) =>
                feature.scope === scope.id &&
                feature.id.toLowerCase().includes(argument.toLowerCase())
            )
    );
    const context = historyContext(root, index);
    return scopes.map((scope) => {
      const compact = compactScope(root, index, scope, context);
      if (!args.includes('--detail')) return compact;
      const state = scopeHistory(root, index, scope, context);
      return {
        ...compact,
        scope,
        current: state.latest
          ? recordSummary(root, state.latest, context.live)
          : null,
        progress: state.progress,
        reconciliation: state.latest?.reconciliation ?? [],
        subsequentExecution: state.afterReview.map((record) => ({
          ...record,
          freshness: executionFreshness(root, record, context.live),
        })),
        observation: {
          ...compact.observation,
          snapshot: index.inventory.snapshot ?? null,
        },
        changedInputs: changedInputs(root, state.latest, context.live),
        plans: state.plans,
        conflicts: state.gaps,
        documents: (index.documents ?? []).filter((doc) =>
          doc.scopes.includes(scope.id)
        ),
        historyCandidates: retrievalCandidates(index, scope).unresolved,
        rejectedCandidates: retrievalCandidates(index, scope).rejected,
        history: state.history.map((record) => ({
          ...record,
          freshness:
            record.kind === 'execution'
              ? executionFreshness(root, record, context.live)
              : freshness(root, record, context.live),
        })),
        historySelection: 'All immutable records in append order.',
        historyOmitted: 0,
        features: index.features.filter(
          (feature) => feature.scope === scope.id
        ),
      };
    });
  }

  if (command === 'refresh') {
    validate(root, index, { current: false });
    const live = discover(root, index);
    index.features = index.features.map((feature) => {
      const item = live.find((entry) => entry.id === feature.id);
      return {
        ...feature,
        fingerprint: item.fingerprint,
        count: item.count,
        source:
          item.paths.find((path) => /\/index\.[jt]sx?$/.test(path)) ??
          item.paths.find((path) => !/\.(spec|test|slow)\./.test(path)) ??
          item.paths[0],
      };
    });
    index.inventory.checkedAt = new Date().toISOString().slice(0, 10);
    let baseCommit = null;
    try {
      baseCommit = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], {
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
    } catch {
      baseCommit = null;
    }
    index.inventory.snapshot = {
      kind: 'working-tree',
      baseCommit,
      fingerprint: inventoryFingerprint(live),
    };
    writeFileSync(join(root, indexPath), json(index));
    return 'Inventory refreshed; reviews and proof statuses unchanged. Run render and check.';
  }
  if (command === 'record') {
    assert.ok(argument, 'Supply a completed JSON review record');
    validate(root, index, { current: false, scopeEvidence: false });
    const path = recordReview(root, index, parse(root, argument));
    writeFileSync(join(root, indexPath), json(index));
    return {
      path,
      next: 'Reconcile current scope/decision state, then render and check.',
    };
  }
  if (command === 'render') {
    const context = historyContext(root, index);
    writeFileSync(
      join(root, 'docs/research/reviews.md'),
      render(root, index, context)
    );
    mkdirSync(join(root, 'docs/research/features'), { recursive: true });
    for (const scope of index.scopes) {
      writeFileSync(
        join(root, `docs/research/features/${scope.id}.md`),
        renderFeature(root, index, scope, context)
      );
    }
    return `Rendered docs/research/reviews.md and ${index.scopes.length} feature hubs`;
  }
  if (command === 'check') {
    const { live, ...counts } = validate(root, index);
    assert.equal(
      read(root, 'docs/research/reviews.md'),
      render(root, index),
      'Generated view is stale; run render'
    );
    const context = historyContext(root, index, live);
    for (const scope of index.scopes) {
      assert.equal(
        read(root, `docs/research/features/${scope.id}.md`),
        renderFeature(root, index, scope, context),
        `Generated feature hub is stale: ${scope.id}; run render`
      );
    }
    assert.deepEqual(
      files(root, 'docs/research/features')
        .filter((path) => path.endsWith('.md'))
        .sort(),
      index.scopes
        .map((scope) => `docs/research/features/${scope.id}.md`)
        .sort(),
      'Generated feature hub inventory disagrees with scopes'
    );
    return { ...counts, hubs: index.scopes.length };
  }
  throw new Error(
    'Usage: node tooling/scripts/review-ledger.mjs discover|queue|lookup <scope-or-group> [--detail]|research <key>|draft <scope>|draft-execution <plan>|record <json>|refresh|render|check'
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    process.stdout.write(
      json(
        main(
          resolve(dirname(fileURLToPath(import.meta.url)), '../..'),
          process.argv.slice(2)
        )
      )
    );
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
