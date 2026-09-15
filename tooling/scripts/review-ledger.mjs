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
import { dirname, join, resolve } from 'node:path';
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
    .filter((record) => record.scope === scope)
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
  const previous = latestRecord(records(root, index), scopeId)?.id ?? null;
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
    method: 'best-api-review/history-v2',
    trigger: '',
    requirements: [],
    evidenceReuse: '',
    summary: '',
    verdict: null,
    previous,
    relation: previous ? 'reaffirms' : 'initial',
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

export function validateRecord(
  root,
  record,
  index,
  prior = [],
  { recording = true } = {}
) {
  assert.ok(/^[a-z0-9][a-z0-9-]+$/.test(record.id), 'Invalid review ID');
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
        assert.ok(
          record.source.files?.[path] || record.source.directories?.[path],
          `Review must capture declared evidence: ${path}`
        );
      }
    }
    assert.ok(
      !prior.some((item) => item.scope === record.scope) || record.previous,
      'Repeated review must reconcile previous history'
    );
    assert.ok(
      record.previous
        ? record.relation !== 'initial'
        : record.relation === 'initial',
      'Initial relation must match history'
    );
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

export function validate(root, index, { current = true } = {}) {
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
    ].forEach((path) => localPath(root, path));
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
  index.scopes.find((scope) => scope.id === record.scope).review =
    latestRecord([...prior, record], record.scope).kind === 'review'
      ? 'reviewed'
      : 'historical';
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

export function render(root, index) {
  const all = records(root, index);
  const live = discover(root, index);
  const link = (path) => `[${path.split('/').at(-1)}](../../${path})`;
  const queue = reviewQueue(index);
  const lines = [
    '# Feature review ledger',
    '',
    'Generated by `node tooling/scripts/review-ledger.mjs render`. Edit `review-index.json`, then regenerate.',
    '',
    `Inventory: ${index.features.length} source/capability/entrypoint groups across ${index.scopes.length} semantic review questions. Observation: ${index.inventory.checkedAt}.`,
    '',
    `Review queue: ${queue.filter((unit) => unit.pending > 0).length} pending reviews across ${queue.reduce((count, unit) => count + unit.pending, 0)} pending questions; ${queue.length} reviews in total. Only the configured core architecture questions share a review. Other features remain independent.`,
    '',
    `Local working-tree snapshot; base commit: ${index.inventory.snapshot?.baseCommit ?? 'unknown'}. Source fingerprint: ${index.inventory.snapshot?.fingerprint ?? 'not recorded'}. Current inventory observation: ${index.inventory.snapshot ? (index.inventory.snapshot.fingerprint === inventoryFingerprint(live) ? 'matching' : 'stale; inspect changes before refresh') : 'unknown'}. This includes local files and does not claim that they are on GitHub.`,
    '',
    `Bounded coverage: ${new Set(live.flatMap((item) => item.paths)).size} distinct files, ${live.filter((item) => item.id.startsWith('capability/')).length} declared PLUGINS names, ${pliteExamples(root).length} actual Plite example catalog keys. Source groups are census entries, not independently reviewed features. Membership can overlap; totals do not add to a count of user capabilities.`,
    '',
    `Boundary: ${index.inventory.boundary ?? 'See the configured roots and exclusions in review-index.json.'}`,
    '',
    'Scores estimate review payoff (0–10), not architecture quality. Only justified review prerequisites constrain order; related questions supply context. Payoff ranks eligible scopes, with AI last. A directly requested feature still takes precedence. Product implementation stays in its owning plan.',
    '',
    'Source matching does not certify behavior. Review, adoption, proof and inspection depth remain independent. Each question names actual owners, consumers, selected proof inputs and remaining gaps; a file assigned to a census group is not a completed architecture assessment. Draft evidence includes those declared inputs; queue prerequisites never silently expand its fingerprints.',
    '',
    'Groups are one investigation with a verdict for every member question. Review completion counts recorded assessments; source freshness, adoption and proof remain visible under each question.',
    '',
    '| Order | Review | Payoff | Questions | Reviewed | Pending |',
    '| --- | --- | ---: | ---: | ---: | ---: |',
  ];
  for (const [i, unit] of queue.entries()) {
    lines.push(
      `| ${i + 1} | [${unit.title}](#${unit.id}) | ${unit.opportunity.score} | ${unit.scopes.length} | ${unit.reviewed} | ${unit.pending} |`
    );
  }
  for (const group of index.reviewGroups ?? []) {
    lines.push(
      '',
      `<a id="${group.id}"></a>`,
      `## ${group.title}`,
      '',
      group.reason,
      '',
      `Run \`$best-api-review audit ${group.id}\`. Use \`node tooling/scripts/review-ledger.mjs lookup ${group.id}\` for every member's owners, consumers, proof and history. Draft and record each member by its stable question ID.`,
      '',
      ...group.scopes.map((id) => {
        const scope = index.scopes.find((item) => item.id === id);
        return `- [${scope.title}](#${id}) (\`${id}\`): ${scope.question}`;
      })
    );
  }
  const examples = pliteExamples(root);
  if (examples.length) {
    lines.push(
      '',
      '## Plite example catalog',
      '',
      'Exact source-declared keys and their loaded implementation. Labels are not converted into invented route names. Shared loaders and helper files remain census support.',
      '',
      '| Catalog key | Review question | Implementation |',
      '| --- | --- | --- |'
    );
    for (const example of examples) {
      const scopeId = index.features.find(
        (feature) => feature.id === `example/plite/${example.id}`
      )?.scope;
      assert.ok(scopeId, `Unmapped example: ${example.id}`);
      lines.push(
        `| ${example.id} | [${scopeId}](#${scopeId}) | ${link(example.paths.at(-1))} |`
      );
    }
  }
  for (const scope of orderScopes(index.scopes)) {
    const latest = latestRecord(all, scope.id);
    lines.push(
      '',
      `<a id="${scope.id}"></a>`,
      `## ${scope.title}`,
      '',
      scope.question,
      '',
      `Review: ${scope.review}. Adoption: ${scope.adoption}. Proof: ${scope.proofState}. Latest record / freshness: ${latest ? `${latest.id} / ${freshness(root, latest, live)}` : 'none / unknown'}.`,
      '',
      `Payoff ${scope.opportunity.score}/10: ${scope.opportunity.reason}`,
      '',
      `Review prerequisites: ${scope.dependsOn.map((id) => `[${id}](#${id})`).join(', ') || 'none'}. ${scope.prerequisiteReason ?? ''} Next owner: ${scope.nextOwner}.`,
      '',
      `Related questions/history (not prerequisites): ${(scope.relatedScopes ?? []).map((id) => `[${id}](#${id})`).join(', ') || 'none'}.`,
      '',
      `Owners: ${scope.owners.map(link).join(', ')}.`,
      '',
      `Consumers: ${scope.consumers.map(link).join(', ')}.`,
      '',
      `Proof entry points (not replayed by this ledger): ${scope.proof.map(link).join(', ') || 'none located; see gaps'}.`,
      '',
      `Additional evidence inputs: ${(scope.evidenceInputs ?? []).map(link).join(', ') || 'none declared'}.`,
      '',
      `Inspection: ${scope.inspection ?? 'Entry points located; full review not executed.'}`,
      '',
      `Gaps: ${scope.gaps ?? 'Behavior, adoption and proof remain unassessed.'}`,
      '',
      `Plans/context: ${scope.plans.map(link).join(', ') || 'No specific prior plan linked; search before review.'}`
    );
    if (scope.decision) {
      lines.push('', `Current compiled decision: ${link(scope.decision)}.`);
    }
    if (scope.historyCandidates?.length) {
      lines.push(
        '',
        `Filename-discovered history: ${scope.historyCandidates.length} candidate plans, including ${scope.historyCandidates.slice(0, 3).map(link).join(', ')}. Full candidate list is in [the index](review-index.json); these links are not imported verdicts.`
      );
    }
    lines.push(
      '',
      '| Feature / entrypoint | Disposition | Source files | Source example |',
      '| --- | --- | ---: | --- |'
    );
    for (const member of index.features.filter(
      (feature) => feature.scope === scope.id
    )) {
      lines.push(
        `| ${member.id.replaceAll('|', '\\|')} | ${member.disposition} | ${member.count} | ${member.source ? link(member.source) : 'See scope owners'} |`
      );
    }
    const catalogOnly = index.features.filter(
      (feature) =>
        feature.scope === scope.id &&
        feature.id.startsWith('capability/') &&
        feature.count === 1
    );
    if (catalogOnly.length) {
      lines.push(
        '',
        `Catalog-only observations: ${catalogOnly.map((feature) => feature.id).join(', ')}. No literal PLUGINS property use was found; dynamic access is not ruled out. This is not a dead-code verdict.`
      );
    }
    lines.push('', 'History:');
    const history = all.filter((record) => record.scope === scope.id);
    if (!history.length) {
      lines.push('', 'No imported review. This is an unassessed queue entry.');
    }
    for (const record of history) {
      lines.push(
        '',
        `- [${record.date}: ${record.summary}](review-records/${record.id}.json) — ${record.kind}; ${record.verdict ?? 'no recovered verdict'}; ${record.relation}. ${record.proofLimits}`
      );
    }
  }
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
    const live = discover(root, index);
    return scopes.map((scope) => ({
      ...scope,
      reviewGroup:
        (index.reviewGroups ?? []).find((item) =>
          item.scopes.includes(scope.id)
        ) ?? null,
      observation: {
        snapshot: index.inventory.snapshot ?? null,
        inventoryStatus: index.inventory.snapshot
          ? index.inventory.snapshot.fingerprint === inventoryFingerprint(live)
            ? 'matching'
            : 'stale'
          : 'unknown',
        status: index.features
          .filter((feature) => feature.scope === scope.id)
          .some(
            (feature) =>
              live.find((item) => item.id === feature.id)?.fingerprint !==
              feature.fingerprint
          )
          ? 'stale'
          : 'matching',
      },
      related: (scope.relatedScopes ?? []).map((id) => ({
        id,
        title: index.scopes.find((item) => item.id === id)?.title,
        history: records(root, index).filter((record) => record.scope === id),
      })),
      features: index.features.filter((feature) => feature.scope === scope.id),
      history: records(root, index)
        .filter((record) => record.scope === scope.id)
        .map((record) => ({
          ...record,
          freshness: freshness(root, record, live),
        })),
    }));
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
    validate(root, index, { current: false });
    const path = recordReview(root, index, parse(root, argument));
    writeFileSync(join(root, indexPath), json(index));
    return {
      path,
      next: 'Reconcile current scope/decision state, then render and check.',
    };
  }
  if (command === 'render') {
    writeFileSync(join(root, 'docs/research/reviews.md'), render(root, index));
    return 'Rendered docs/research/reviews.md';
  }
  if (command === 'check') {
    const { live, ...counts } = validate(root, index);
    assert.equal(
      read(root, 'docs/research/reviews.md'),
      render(root, index),
      'Generated view is stale; run render'
    );
    return counts;
  }
  throw new Error(
    'Usage: node tooling/scripts/review-ledger.mjs discover|queue|lookup <scope-or-group>|research <key>|draft <scope>|record <json>|refresh|render|check'
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
