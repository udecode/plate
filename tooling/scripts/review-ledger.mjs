import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  linkSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { landed } from '../../.agents/pstack/status.mjs';

export const scopesDir = 'docs/research/review-scopes';
export const recordsDir = 'docs/research/review-records';
export const groupsPath = 'docs/research/review-groups.json';
export const documentsPath = 'docs/research/review-documents.json';
export const legacyPath = 'docs/research/review-legacy.json';
export const method = 'best-api-review/history-v4';

export const census = {
  roots: [
    'packages',
    'apps/www/src/registry',
    'apps/plite',
    'benchmarks/editor/benchmarks',
    'tooling/scripts',
    'tooling/plite',
    'apps/www/src/app/(app)/examples/plite',
    'apps/www/tests/browser',
  ],
  files: [
    'package.json',
    'benchmarks/editor/package.json',
    'apps/www/playwright.config.ts',
    'apps/www/package.json',
  ],
  extension: /\.(?:[cm]?[jt]sx?|json|css|mdx?|snap|html|txt|ya?ml)$/,
  exclusions: [
    {
      pattern: /\/(?:AGENTS|CLAUDE|README|CHANGELOG)\.md$/,
      reason:
        'Package and workflow prose is context, not a product capability.',
    },
    {
      pattern: /^apps\/www\/src\/registry\/changelog\//,
      reason: 'Historical release prose is not current feature source.',
    },
    { pattern: /\/tsconfig\.tsbuildinfo$/, reason: 'Build cache.' },
    {
      pattern: /^apps\/plite\/(out|plite|tmp)\//,
      reason: 'Static build output, nested proof copies and stress artifacts.',
    },
    {
      pattern: /^apps\/www\/tests\/browser\/docs-sidebar\.spec\.ts$/,
      reason: 'Documentation-site navigation is not editor proof.',
    },
  ],
};

// Directory digests skip the directories the retired inventory walker skipped,
// so legacy directory digests stay comparable.
const skippedDirectories = new Set([
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
]);
// Legacy drafts hashed these method and package files into records regardless of scope.
const legacyPolicyInputs = new Set([
  'package.json',
  'pnpm-lock.yaml',
  '.agents/skills/best-api-review/SKILL.md',
  '.agents/rules/best-api-review.mdc',
]);
const isLaw = (path) => path === 'VISION.md' || path.startsWith('docs/vision/');

const hash = (value) => createHash('sha256').update(value).digest('hex');
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const read = (root, path) => readFileSync(join(root, path), 'utf-8');
const isDigest = (value) => /^[a-f0-9]{64}$/.test(value ?? '');
const isText = (value) => typeof value === 'string' && value.trim() !== '';
const byId = (a, b) => a.id.localeCompare(b.id);
// Record bytes depend on this order, so it stays the default code-unit sort.
const byCodeUnit = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const bounded = (items, limit) => ({
  items: items.slice(0, limit),
  total: items.length,
});
const clip = (text = '', limit = 600) =>
  text.length > limit ? `${text.slice(0, limit - 3)}...` : text;

function bySegment(a, b) {
  const left = a.split('/');
  const right = b.split('/');
  for (let i = 0; i < Math.min(left.length, right.length); i++) {
    if (left[i] !== right[i]) return left[i].localeCompare(right[i]);
  }
  return left.length - right.length;
}

function repoPath(path) {
  assert.ok(
    isText(path) && !path.startsWith('/') && !path.split('/').includes('..'),
    `Expected a repository-relative path: ${path}`
  );
  return path;
}

/** Live observation of the working tree, memoized for one command. */
export function observe(root) {
  let listed;
  const digests = new Map();
  const files = () => {
    listed ??= execFileSync(
      'git',
      ['-C', root, 'ls-files', '-z', '-co', '--exclude-standard'],
      { encoding: 'utf-8', maxBuffer: 1 << 28 }
    )
      .split('\0')
      .filter(
        (path) =>
          path &&
          !path
            .split('/')
            .slice(0, -1)
            .some((part) => skippedDirectories.has(part)) &&
          existsSync(join(root, path))
      )
      .sort(bySegment);
    return listed;
  };
  const fileDigest = (path) => {
    if (!digests.has(path)) {
      digests.set(
        path,
        existsSync(join(root, path)) && statSync(join(root, path)).isFile()
          ? hash(readFileSync(join(root, path)))
          : null
      );
    }
    return digests.get(path);
  };
  const under = (directory) => {
    const prefix = directory.endsWith('/') ? directory : `${directory}/`;
    return files().filter((path) => path.startsWith(prefix));
  };
  const digest = (entry) => {
    if (!entry.endsWith('/')) return fileDigest(entry);
    if (!existsSync(join(root, entry))) return null;
    return hash(
      under(entry)
        .map((path) => `${path}\0${fileDigest(path)}`)
        .join('\n')
    );
  };
  return { root, files, under, digest };
}

const entryOf = (root, path) =>
  path.endsWith('/') ||
  !existsSync(join(root, path)) ||
  !statSync(join(root, path)).isDirectory()
    ? path
    : `${path}/`;

function readJson(root, path, warnings, fallback = null) {
  if (!existsSync(join(root, path))) return { value: fallback, sha256: null };
  try {
    const text = read(root, path);
    return { value: JSON.parse(text), sha256: hash(text) };
  } catch (error) {
    warnings.push(`${path}: ${error.message.split('\n')[0]}`);
    return { value: fallback, sha256: null };
  }
}

function jsonFiles(root, directory) {
  if (!existsSync(join(root, directory))) return [];
  return readdirSync(join(root, directory))
    .filter((name) => name.endsWith('.json') && !name.startsWith('.'))
    .sort()
    .map((name) => `${directory}/${name}`);
}

function evidenceOf(raw) {
  if (raw.inputs) {
    return {
      inputs: raw.inputs,
      upstreams: raw.upstreams ?? [],
      legacyGroups: 0,
    };
  }
  if (!raw.source) return null;
  const inputs = {};
  for (const [path, digest] of Object.entries(raw.source.files ?? {})) {
    if (!legacyPolicyInputs.has(path)) inputs[path] = digest;
  }
  for (const [path, digest] of Object.entries(raw.source.directories ?? {})) {
    inputs[path.endsWith('/') ? path : `${path}/`] = digest;
  }
  return {
    inputs,
    upstreams: raw.source.upstreams ?? [],
    legacyGroups: Object.keys(raw.source.features ?? {}).length,
  };
}

function normalize(raw) {
  const common = {
    id: raw.id,
    kind: raw.kind,
    date: raw.date,
    summary: raw.summary ?? '',
    references: raw.references ?? [],
    evidence: evidenceOf(raw),
    raw,
  };
  if (raw.kind === 'execution') {
    return {
      ...common,
      scopes: raw.scopes ?? [],
      reviewBasis: raw.reviewBasis ?? [],
      workKind: raw.workKind,
      plan: raw.plan?.path ?? raw.plan ?? null,
      previous: raw.previous ?? [],
      outcome: raw.outcome,
      proof: raw.proof ?? { state: 'unknown', evidence: [], limits: '' },
      // Imported completion claims without a recovered binding never adopt.
      bound: raw.binding
        ? raw.binding === 'current'
        : (raw.reviewBasis ?? []).length > 0,
    };
  }
  return {
    ...common,
    scope: raw.scope,
    question: raw.question,
    verdict: raw.verdict ?? null,
    previous: raw.previous ?? null,
    relation: raw.relation,
    reconciliation: raw.reconciliation ?? [],
    callSites: raw.callSites ?? null,
    alternatives: raw.alternatives ?? [],
    proofLimits: raw.proofLimits ?? '',
  };
}

const strings = (value) =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');
const optionalStrings = (value) => value === undefined || strings(value);

const isObject = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const stringMap = (value) =>
  isObject(value) &&
  Object.values(value).every((item) => typeof item === 'string');
const upstreamsShape = (value) =>
  value === undefined ||
  (Array.isArray(value) &&
    value.every(
      (item) =>
        isObject(item) &&
        typeof item.checkout === 'string' &&
        typeof item.commit === 'string' &&
        (item.files === undefined || stringMap(item.files))
    ));

/** Why a parsed record cannot be read, or null. Readers and `record` share it. */
function recordShape(raw) {
  if (!isObject(raw) || typeof raw.id !== 'string') return 'id is not a string';
  if (typeof raw.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(raw.date)) {
    return 'date is not YYYY-MM-DD';
  }
  if (raw.kind === 'execution') {
    if (!strings(raw.scopes)) return 'scopes is not a list';
    if (!optionalStrings(raw.reviewBasis)) return 'reviewBasis is not a list';
    if (!optionalStrings(raw.previous)) return 'previous is not a list';
    if (
      raw.proof !== undefined &&
      !(
        isObject(raw.proof) &&
        (raw.proof.evidence === undefined ||
          (Array.isArray(raw.proof.evidence) &&
            raw.proof.evidence.every(
              (item) => isObject(item) && typeof item.path === 'string'
            )))
      )
    ) {
      return 'proof.evidence is not a list of paths';
    }
  } else if (['review', 'historical'].includes(raw.kind)) {
    if (typeof raw.scope !== 'string') return 'scope is not a string';
    if (
      ![null, undefined].includes(raw.previous) &&
      typeof raw.previous !== 'string'
    ) {
      return 'previous is not a record id';
    }
    if (
      raw.reconciliation !== undefined &&
      !(
        Array.isArray(raw.reconciliation) &&
        raw.reconciliation.every(
          (entry) => isObject(entry) && typeof entry.record === 'string'
        )
      )
    ) {
      return 'reconciliation is not a list of records';
    }
  } else return `unknown kind ${raw.kind}`;
  if (raw.inputs !== undefined && !stringMap(raw.inputs)) {
    return 'inputs is not a map of digests';
  }
  if (!upstreamsShape(raw.upstreams)) return 'upstreams is malformed';
  if (
    raw.source !== undefined &&
    raw.source !== null &&
    (!isObject(raw.source) ||
      !['files', 'directories', 'features'].every(
        (key) => raw.source[key] === undefined || stringMap(raw.source[key])
      ) ||
      !upstreamsShape(raw.source.upstreams))
  ) {
    return 'source is malformed';
  }
  if (!optionalStrings(raw.references)) return 'references is not a list';
  return null;
}

function scopeShape(scope) {
  if (typeof scope?.id !== 'string') return 'id is not a string';
  for (const key of [
    'owners',
    'members',
    'consumers',
    'proof',
    'evidenceInputs',
    'dependsOn',
    'relatedScopes',
    'historyCandidates',
  ]) {
    if (!optionalStrings(scope[key])) return `${key} is not a list of strings`;
  }
  return null;
}

/**
 * Reads every ledger file. A file that does not parse or has the wrong shape
 * becomes a warning, so another session's half-written file does not stop this
 * command; `check` reports it.
 */
export function loadLedger(root) {
  const warnings = [];
  const scopes = new Map();
  for (const path of jsonFiles(root, scopesDir)) {
    const scope = readJson(root, path, warnings).value;
    if (!scope) continue;
    const problem = scopeShape(scope);
    if (problem) {
      warnings.push(`${path}: ${problem}`);
      continue;
    }
    if (scope.id !== path.slice(scopesDir.length + 1, -5)) {
      warnings.push(`${path}: id ${scope.id} differs from its file name`);
      continue;
    }
    scopes.set(scope.id, scope);
  }
  const topLevel = (path, fallback, valid, kind) => {
    const { value } = readJson(root, path, warnings, fallback);
    if (valid(value)) return value;
    warnings.push(`${path}: not ${kind}`);
    return fallback;
  };
  const groupFile = topLevel(groupsPath, {}, isObject, 'an object');
  const groups = new Map(
    Object.entries(groupFile).filter(([id, group]) => {
      if (isObject(group)) return true;
      warnings.push(`${groupsPath}: group ${id} is not an object`);
      return false;
    })
  );
  const listed = topLevel(documentsPath, [], Array.isArray, 'a list');
  const documents = listed.filter((document) => {
    const valid =
      typeof document?.path === 'string' &&
      strings(document.scopes) &&
      optionalStrings(document.reviewBasis);
    if (!valid) {
      warnings.push(
        `${documentsPath}: malformed entry ${JSON.stringify(document)?.slice(0, 80)}`
      );
    }
    return valid;
  });
  const manifest = topLevel(legacyPath, [], Array.isArray, 'a list');
  const legacy = new Map();
  for (const [position, item] of manifest.entries()) {
    if (typeof item?.id === 'string' && isDigest(item.sha256)) {
      legacy.set(item.id, { ...item, position });
    } else warnings.push(`${legacyPath}: malformed entry at ${position}`);
  }
  const records = new Map();
  for (const path of jsonFiles(root, recordsDir)) {
    const { value: raw, sha256 } = readJson(root, path, warnings);
    if (!raw) continue;
    const problem = recordShape(raw);
    if (problem) {
      warnings.push(`${path}: malformed record, ${problem}`);
      continue;
    }
    if (raw.id !== path.slice(recordsDir.length + 1, -5)) {
      warnings.push(`${path}: id ${raw.id} differs from its file name`);
      continue;
    }
    records.set(raw.id, { ...normalize(raw), sha256 });
  }
  const reviews = new Map();
  const executions = new Map();
  for (const record of records.values()) {
    if (record.kind === 'execution') {
      for (const scope of record.scopes) {
        if (!executions.has(scope)) executions.set(scope, []);
        executions.get(scope).push(record);
      }
    } else {
      if (!reviews.has(record.scope)) reviews.set(record.scope, []);
      reviews.get(record.scope).push(record);
    }
  }
  const byDate = (a, b) => a.date.localeCompare(b.date) || byId(a, b);
  for (const list of [...reviews.values(), ...executions.values()]) {
    list.sort(byDate);
  }
  const membership = new Map();
  for (const scope of scopes.values()) {
    for (const entry of scope.members ?? []) {
      if (!membership.has(entry)) membership.set(entry, new Set());
      membership.get(entry).add(scope.id);
    }
  }
  return {
    root,
    scopes,
    groups,
    documents,
    records,
    reviews,
    executions,
    membership,
    legacy,
    warnings,
  };
}

/**
 * Reviews of a scope that no other review of that scope names as previous or
 * reconciles. Imported historical records only stand in when no review exists.
 */
export function headsOf(ledger, scopeId) {
  const all = ledger.reviews.get(scopeId) ?? [];
  const reviews = all.filter((record) => record.kind === 'review');
  if (!reviews.length) return all.slice(-1);
  const named = new Set();
  for (const review of reviews) {
    if (review.previous) named.add(review.previous);
    for (const entry of review.reconciliation) named.add(entry.record);
  }
  return reviews.filter((review) => !named.has(review.id));
}

const latest = (heads) => heads.at(-1) ?? null;

const adopting = (execution) =>
  execution.bound &&
  ['implementation', 'workflow'].includes(execution.workKind);

/**
 * The implementation or workflow executions that currently stand for a review:
 * a later execution supersedes the ones it names as previous, and imported
 * executions supersede each other in their original append order.
 */
export function effectiveExecutions(ledger, reviewId) {
  const review = ledger.records.get(reviewId);
  const candidates = (ledger.executions.get(review?.scope) ?? []).filter(
    (record) => adopting(record) && record.reviewBasis.includes(reviewId)
  );
  const superseded = new Set(candidates.flatMap((record) => record.previous));
  const legacy = candidates
    .filter((record) => ledger.legacy.has(record.id))
    .sort(
      (a, b) =>
        ledger.legacy.get(a.id).position - ledger.legacy.get(b.id).position
    );
  for (const record of legacy.slice(0, -1)) superseded.add(record.id);
  return candidates.filter((record) => !superseded.has(record.id));
}

export function adoptionOf(ledger, review) {
  const effective = effectiveExecutions(ledger, review.id);
  return effective.length === 1 && effective[0].outcome === 'completed'
    ? effective[0]
    : null;
}

/**
 * A plan's review association. Front matter wins; a classified document entry
 * covers historical plans without it.
 */
export function associationOf(root, ledger, path) {
  const text = read(root, path);
  const meta = documentMetadata(text);
  if (
    ['review_scopes', 'review_basis', 'work_kind'].some((key) =>
      Object.hasOwn(meta, key)
    )
  ) {
    const invalid = [
      ...(Array.isArray(meta.review_scopes) ? [] : ['review_scopes']),
      ...(Object.hasOwn(meta, 'review_basis') &&
      !Array.isArray(meta.review_basis)
        ? ['review_basis']
        : []),
      ...(meta.work_kind && !workKinds.has(meta.work_kind)
        ? ['work_kind']
        : []),
    ];
    return {
      path,
      scopes: Array.isArray(meta.review_scopes) ? meta.review_scopes : [],
      reviewBasis: Array.isArray(meta.review_basis) ? meta.review_basis : [],
      workKind: meta.work_kind ?? null,
      ...planStatus(text),
      association: 'plan-metadata',
      ...(invalid.length ? { invalid } : {}),
    };
  }
  const document = ledger.documents.find(
    (item) =>
      item.path === path &&
      item.kind === 'plan' &&
      !['candidate', 'rejected'].includes(item.disposition)
  );
  if (!document) return null;
  const invalid =
    document.workKind && !workKinds.has(document.workKind) ? ['workKind'] : [];
  return {
    path,
    scopes: document.scopes,
    reviewBasis: document.reviewBasis ?? [],
    workKind: document.workKind ?? null,
    ...planStatus(text),
    association: 'classified-document',
    ...(invalid.length ? { invalid } : {}),
  };
}

/** Plans that declare review metadata, plus classified historical plans. */
export function plansOf(root, ledger) {
  let declared = [];
  try {
    declared = execFileSync(
      'git',
      [
        '-C',
        root,
        'grep',
        '-l',
        '--untracked',
        '-E',
        '^review_scopes:',
        '--',
        'docs/plans/*.md',
      ],
      { encoding: 'utf-8' }
    )
      .split('\n')
      .filter(Boolean);
  } catch (error) {
    if (error.status !== 1) throw error;
  }
  const paths = new Set([
    ...declared,
    ...ledger.documents
      .filter((document) => document.kind === 'plan')
      .map((document) => document.path),
  ]);
  return [...paths]
    .filter((path) => existsSync(join(root, path)))
    .map((path) => associationOf(root, ledger, path))
    .filter(Boolean)
    .sort((a, b) => b.path.localeCompare(a.path));
}

/**
 * A plan's lifecycle labels. It counts as landed only when every label is a
 * landed word, so a reopened Status beside an old completion is not landed.
 */
export function planStatus(text) {
  const labels = [
    ...text.matchAll(
      /^(?:[-*][ \t]+)?(?:\*\*)?(?:[Ss]tatus|goal_status)(?:\*\*)?:[ \t]*(\S.*)$/gm
    ),
    ...text.matchAll(/^[Ss]tatus:[ \t]*\r?\n[ \t]*-[ \t]+(.+)$/gm),
  ].map((match) => match[1].replaceAll('**', '').trim());
  const verdicts = new Set(labels.map((label) => landed(label)));
  return {
    status: labels[0] ?? '',
    landed: verdicts.size === 1 && verdicts.has(true),
    ...(verdicts.size > 1 ? { conflict: labels } : {}),
  };
}

/** The open state of one scope, derived from its records and plans. */
export function openState(ledger, scopeId, plans) {
  const heads = headsOf(ledger, scopeId);
  if (heads.length > 1) {
    return { open: 'fork', heads: heads.map((review) => review.id) };
  }
  const head = heads[0];
  if (!head?.verdict) return { open: 'unreviewed', head: head?.id ?? null };
  if (head.verdict === 'stop') return { open: null, head: head.id, by: 'stop' };
  if (head.verdict === 'defer') return { open: 'deferred', head: head.id };
  const adopted = adoptionOf(ledger, head);
  if (adopted) return { open: null, head: head.id, by: adopted.id };
  const recorded = new Set(
    (ledger.executions.get(scopeId) ?? []).map((execution) => execution.plan)
  );
  const unbound = plans
    .filter(
      (plan) =>
        plan.scopes.includes(scopeId) &&
        plan.reviewBasis.includes(head.id) &&
        plan.landed &&
        !recorded.has(plan.path)
    )
    .map((plan) => plan.path);
  if (unbound.length) {
    return { open: 'pursue-unbound', head: head.id, unbound };
  }
  const started = (ledger.executions.get(scopeId) ?? []).some((execution) =>
    execution.reviewBasis.includes(head.id)
  );
  return {
    open: 'pursue-not-adopted',
    head: head.id,
    progress: started ? 'in-progress' : 'none',
  };
}

/** Records a new review of the scope must reconcile, given its previous review. */
export function requiredReconciliation(ledger, scopeId, previousId) {
  const reviews = ledger.reviews.get(scopeId) ?? [];
  const reconciled = new Set(
    reviews.flatMap((review) =>
      review.reconciliation.map((entry) => entry.record)
    )
  );
  return [
    ...new Set([
      ...(previousId ? [previousId] : []),
      ...headsOf(ledger, scopeId)
        .map((review) => review.id)
        .filter((id) => id !== previousId),
      ...(ledger.executions.get(scopeId) ?? [])
        .filter((execution) => execution.bound && !reconciled.has(execution.id))
        .map((execution) => execution.id),
    ]),
  ];
}

export function owningScopes(ledger, path) {
  const owners = new Set(ledger.membership.get(path));
  const parts = path.split('/');
  for (let i = 1; i < parts.length; i++) {
    for (const id of ledger.membership.get(`${parts.slice(0, i).join('/')}/`) ??
      []) {
      owners.add(id);
    }
  }
  return [...owners].sort(byCodeUnit);
}

/**
 * Review units in queue order: dependencies first, AI-last, then payoff.
 * Read commands get a usable order despite a dangling dependency or a cycle,
 * reported in ledger.warnings; `strict` throws instead, for `check`.
 */
export function orderUnits(ledger, { strict = false } = {}) {
  const problem = (message) => {
    assert.ok(!strict, message);
    if (!ledger.warnings.includes(message)) ledger.warnings.push(message);
  };
  const rank = new Map();
  const waiting = [...ledger.scopes.values()];
  while (waiting.length) {
    const ready = waiting.filter((scope) =>
      (scope.dependsOn ?? []).every(
        (id) => rank.has(id) || !ledger.scopes.has(id)
      )
    );
    if (!ready.length) {
      problem(
        `Review dependencies contain a cycle: ${waiting.map((scope) => scope.id).join(', ')}`
      );
      ready.push(...waiting);
    }
    ready.sort(
      (a, b) =>
        (b.opportunity?.score ?? 0) - (a.opportunity?.score ?? 0) ||
        a.id.localeCompare(b.id)
    );
    for (const scope of ready) {
      rank.set(scope.id, rank.size);
      waiting.splice(waiting.indexOf(scope), 1);
    }
  }
  const scopes = [...ledger.scopes.values()].sort(
    (a, b) => rank.get(a.id) - rank.get(b.id)
  );
  const unitOf = (scope) => scope.group ?? scope.id;
  const units = new Map();
  for (const scope of scopes) {
    const id = unitOf(scope);
    if (!units.has(id)) {
      const group = scope.group ? ledger.groups.get(scope.group) : null;
      units.set(id, {
        id,
        title: group?.title ?? scope.title,
        scopes: [],
        dependsOn: new Set(),
        last: false,
        score: 0,
      });
    }
    const unit = units.get(id);
    unit.scopes.push(scope.id);
    unit.last ||= scope.last;
    unit.score = Math.max(unit.score, scope.opportunity?.score ?? 0);
    for (const dependency of scope.dependsOn ?? []) {
      const target = ledger.scopes.get(dependency);
      if (!target) problem(`Unknown dependency of ${scope.id}: ${dependency}`);
      else if (unitOf(target) !== id) unit.dependsOn.add(unitOf(target));
    }
  }
  const result = [];
  const pending = [...units.values()];
  while (pending.length) {
    const ready = pending.filter((unit) =>
      [...unit.dependsOn].every((id) => result.some((item) => item.id === id))
    );
    const byPayoff = (a, b) =>
      Number(a.last) - Number(b.last) ||
      b.score - a.score ||
      a.id.localeCompare(b.id);
    let chosen = ready.sort(byPayoff)[0];
    if (!chosen || (chosen.last && pending.some((unit) => !unit.last))) {
      problem(
        'Review dependencies contain a cycle or depend on an AI-last scope'
      );
      chosen = pending.sort(byPayoff)[0];
    }
    result.push({ ...chosen, dependsOn: [...chosen.dependsOn] });
    pending.splice(pending.indexOf(chosen), 1);
  }
  return result;
}

/** Source and law freshness of a record against the live tree. Matching is not behavior proof. */
export function freshness(tree, record) {
  const { evidence } = record;
  const result = {
    state: 'unknown',
    changed: [],
    missing: [],
    law: { changed: [] },
    legacyGroups: evidence?.legacyGroups ?? 0,
    upstream: null,
  };
  if (!evidence) return { ...result, reason: 'no captured source' };
  const inputs = Object.entries(evidence.inputs);
  if (record.kind === 'execution') {
    for (const item of record.proof.evidence ?? []) {
      if (item.sha256) inputs.push([item.path, item.sha256]);
    }
  }
  for (const [path, recorded] of inputs) {
    const current = tree.digest(path);
    if (current === recorded) continue;
    if (isLaw(path)) result.law.changed.push(path);
    else if (current === null) result.missing.push(path);
    else result.changed.push(path);
  }
  for (const upstream of evidence.upstreams) {
    result.upstream = upstreamState(upstream, result.upstream);
  }
  const moved =
    result.changed.length ||
    result.missing.length ||
    result.upstream === 'stale';
  result.state = moved
    ? 'stale'
    : inputs.length === 0 ||
        result.legacyGroups > 0 ||
        result.upstream === 'unknown'
      ? 'unknown'
      : 'matching';
  result.law.state = result.law.changed.length ? 'moved' : 'unchanged';
  return result;
}

function upstreamState(upstream, previous) {
  if (previous === 'stale') return previous;
  if (!existsSync(upstream.checkout)) return 'unknown';
  let head;
  try {
    head = execFileSync('git', ['-C', upstream.checkout, 'rev-parse', 'HEAD'], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'unknown';
  }
  const moved =
    head !== upstream.commit ||
    Object.entries(upstream.files ?? {}).some(
      ([path, digest]) =>
        !existsSync(join(upstream.checkout, path)) ||
        hash(readFileSync(join(upstream.checkout, path))) !== digest
    );
  return moved ? 'stale' : (previous ?? 'matching');
}

function headSummary(review) {
  return review
    ? {
        id: review.id,
        date: review.date,
        verdict: review.verdict,
        relation: review.relation,
        summary: clip(review.summary),
        ...(review.callSites ? { callSites: review.callSites } : {}),
      }
    : null;
}

function briefFreshness(state) {
  return {
    state: state.state,
    changed: bounded(state.changed, 5),
    missing: bounded(state.missing, 5),
    lawMoved: bounded(state.law.changed, 5),
    ...(state.legacyGroups ? { legacyGroups: state.legacyGroups } : {}),
    ...(state.upstream ? { upstream: state.upstream } : {}),
  };
}

function unresolvedCandidates(ledger, scope) {
  const classified = new Set(
    ledger.documents
      .filter(
        (document) =>
          document.disposition !== 'candidate' &&
          document.scopes.includes(scope.id)
      )
      .map((document) => document.path)
  );
  return [
    ...new Set([
      ...(scope.historyCandidates ?? []),
      ...ledger.documents
        .filter(
          (document) =>
            document.disposition === 'candidate' &&
            document.scopes.includes(scope.id)
        )
        .map((document) => document.path),
    ]),
  ].filter((path) => !classified.has(path));
}

function compact(ledger, tree, plans, scope) {
  const state = openState(ledger, scope.id, plans);
  const head = latest(headsOf(ledger, scope.id));
  const executions = ledger.executions.get(scope.id) ?? [];
  const scopePlans = plans.filter((plan) => plan.scopes.includes(scope.id));
  const documents = ledger.documents.filter(
    (document) =>
      document.scopes.includes(scope.id) &&
      !['candidate', 'rejected'].includes(document.disposition)
  );
  return {
    id: scope.id,
    title: scope.title,
    question: scope.question,
    ...(scope.group ? { group: scope.group } : {}),
    open: state,
    head: headSummary(head),
    freshness: head ? briefFreshness(freshness(tree, head)) : null,
    executions: bounded(
      executions
        .slice()
        .reverse()
        .map((execution) => ({
          id: execution.id,
          date: execution.date,
          outcome: execution.outcome,
          workKind: execution.workKind,
          namesHead: Boolean(head && execution.reviewBasis.includes(head.id)),
        })),
      3
    ),
    plans: bounded(
      scopePlans.map((plan) => ({
        path: plan.path,
        status: plan.status,
        reviewBasis: plan.reviewBasis,
      })),
      5
    ),
    documents: bounded(
      documents.map((document) => ({
        path: document.path,
        kind: document.kind,
        disposition: document.disposition,
      })),
      3
    ),
    candidates: bounded(unresolvedCandidates(ledger, scope), 5),
    related: (scope.relatedScopes ?? []).map((id) => ({
      id,
      verdict: latest(headsOf(ledger, id))?.verdict ?? null,
      open: openState(ledger, id, plans).open,
    })),
    decision: scope.decision ?? null,
    scopeFile: `${scopesDir}/${scope.id}.json`,
    detail: `node tooling/scripts/review-ledger.mjs lookup ${scope.id} --detail`,
  };
}

function detailed(ledger, tree, plans, scope) {
  const history = [
    ...(ledger.reviews.get(scope.id) ?? []),
    ...(ledger.executions.get(scope.id) ?? []),
  ].sort((a, b) => a.date.localeCompare(b.date) || byId(a, b));
  return {
    ...compact(ledger, tree, plans, scope),
    scope,
    history: history.map((record) => ({
      ...record.raw,
      freshness: freshness(tree, record),
    })),
    plans: plans.filter((plan) => plan.scopes.includes(scope.id)),
    documents: ledger.documents.filter((document) =>
      document.scopes.includes(scope.id)
    ),
    candidates: unresolvedCandidates(ledger, scope),
    executionsTotal: (ledger.executions.get(scope.id) ?? []).length,
  };
}

const lookupLimit = 10;

export function lookup(root, query, { detail = false } = {}) {
  assert.ok(isText(query), 'Supply a scope, group, path or search term');
  const ledger = loadLedger(root);
  const tree = observe(root);
  const plans = plansOf(root, ledger);
  const needle = query.toLowerCase();
  const scopes = [...ledger.scopes.values()].sort(byId);
  const legacy = legacyGroups(ledger);
  const matchesAny = (texts) =>
    texts.some((text) => text.toLowerCase().includes(needle));
  const path = query.replace(/^\.\//, '');
  const pathLike = path.includes('/') && !path.includes(' ');
  const steps = [
    () => (ledger.scopes.has(needle) ? [ledger.scopes.get(needle)] : []),
    () => scopes.filter((scope) => scope.group === needle),
    () => scopes.filter((scope) => legacy.get(scope.id)?.has(query)),
    () => {
      if (!pathLike) return [];
      const owners = new Set(owningScopes(ledger, path));
      return scopes.filter((scope) => owners.has(scope.id));
    },
    () =>
      pathLike && !inCensus(path)
        ? scopes.filter((scope) =>
            entriesOf(scope).some(
              (entry) =>
                entry === path ||
                (entry.endsWith('/') && path.startsWith(entry))
            )
          )
        : [],
    () =>
      scopes.filter((scope) =>
        matchesAny([
          scope.id,
          scope.title,
          scope.question,
          ...(legacy.get(scope.id) ?? []),
        ])
      ),
    () => scopes.filter((scope) => matchesAny(entriesOf(scope))),
  ];
  let matched = [];
  for (const step of steps) {
    matched = step();
    if (matched.length) break;
  }
  if (!matched.length && pathLike && inCensus(path)) {
    const directory = path.slice(0, path.lastIndexOf('/') + 1);
    const siblings = tree
      .under(directory)
      .filter((file) => !file.slice(directory.length).includes('/'))
      .flatMap((file) => owningScopes(ledger, file));
    const counts = Object.entries(Object.groupBy(siblings, (id) => id))
      .sort((x, y) => y[1].length - x[1].length)
      .map(([id, list]) => `${id} (${list.length})`);
    throw new Error(
      `No scope owns ${path}.${counts.length ? ` Files beside it belong to: ${counts.join(', ')}.` : ''} Add it to "members" in ${scopesDir}/<scope>.json.`
    );
  }
  assert.ok(matched.length, `No scope, group or path matches: ${query}`);
  const shown = matched
    .slice(0, lookupLimit)
    .map((scope) => (detail ? detailed : compact)(ledger, tree, plans, scope));
  return matched.length > lookupLimit
    ? [
        ...shown,
        {
          omitted: matched.length - lookupLimit,
          narrow: 'Use a scope id, a path or a longer term',
        },
      ]
    : shown;
}

const entriesOf = (scope) => [
  ...(scope.owners ?? []),
  ...(scope.members ?? []),
  ...(scope.consumers ?? []),
  ...(scope.proof ?? []),
  ...(scope.evidenceInputs ?? []),
];

/** Retired feature-group ids each scope's records bound, so old names still resolve. */
function legacyGroups(ledger) {
  const groups = new Map();
  for (const record of ledger.records.values()) {
    if (record.kind === 'execution') continue;
    const ids = Object.keys(record.raw.source?.features ?? {});
    if (!ids.length) continue;
    if (!groups.has(record.scope)) groups.set(record.scope, new Set());
    for (const id of ids) groups.get(record.scope).add(id);
  }
  return groups;
}

export function status(root) {
  const ledger = loadLedger(root);
  const plans = plansOf(root, ledger);
  const states = new Map(
    [...ledger.scopes.keys()].map((id) => [id, openState(ledger, id, plans)])
  );
  const count = (open) =>
    [...states.values()].filter((state) => state.open === open).length;
  return {
    scopes: ledger.scopes.size,
    unreviewed: count('unreviewed'),
    fork: count('fork'),
    pursueUnbound: count('pursue-unbound'),
    pursueNotAdopted: count('pursue-not-adopted'),
    deferred: count('deferred'),
    closed: count(null),
    unowned: coverage(root, { ledger }).unowned.total,
    open: [...states]
      .filter(([, state]) => state.open)
      .map(([id, state]) => ({ id, open: state.open })),
    queue: orderUnits(ledger).map((unit, index) => ({
      order: index + 1,
      unit: unit.id,
      title: unit.title,
      score: unit.score,
      scopes: unit.scopes.map((id) => ({
        id,
        open: states.get(id).open,
        verdict: latest(headsOf(ledger, id))?.verdict ?? null,
      })),
    })),
    ...report(root, ledger),
  };
}

const report = (root, ledger) => {
  const problems = integrity(root, ledger);
  return {
    ...(problems.length ? { integrity: problems } : {}),
    ...(ledger.warnings.length ? { warnings: ledger.warnings } : {}),
  };
};

export function next(root) {
  const ledger = loadLedger(root);
  const tree = observe(root);
  const plans = plansOf(root, ledger);
  const actionable = (id) =>
    ['fork', 'unreviewed', 'pursue-unbound', 'pursue-not-adopted'].includes(
      openState(ledger, id, plans).open
    );
  const unit = orderUnits(ledger).find((item) => item.scopes.some(actionable));
  if (!unit) {
    return {
      unit: null,
      reason: 'No scope is open except those deferred on outside evidence.',
      ...report(root, ledger),
    };
  }
  return {
    unit: unit.id,
    title: unit.title,
    scopes: unit.scopes
      .filter(actionable)
      .map((id) => compact(ledger, tree, plans, ledger.scopes.get(id))),
    ...report(root, ledger),
  };
}

/** Markdown for people, printed instead of committed. */
export function show(root, scopeId) {
  const ledger = loadLedger(root);
  const plans = plansOf(root, ledger);
  if (!scopeId) {
    const lines = [
      '# Review queue',
      '',
      '| Order | Review | Payoff | Questions and open state |',
      '| ---: | --- | ---: | --- |',
    ];
    for (const [index, unit] of orderUnits(ledger).entries()) {
      const cells = unit.scopes.map(
        (id) => `${id}: ${openState(ledger, id, plans).open ?? 'closed'}`
      );
      lines.push(
        `| ${index + 1} | ${unit.title} | ${unit.score} | ${cells.join('; ')} |`
      );
    }
    return `${lines.join('\n')}\n`;
  }
  const scope = ledger.scopes.get(scopeId);
  assert.ok(scope, `Unknown scope: ${scopeId}`);
  const tree = observe(root);
  const state = openState(ledger, scope.id, plans);
  const history = [
    ...(ledger.reviews.get(scope.id) ?? []),
    ...(ledger.executions.get(scope.id) ?? []),
  ].sort((a, b) => b.date.localeCompare(a.date) || byId(b, a));
  const list = (items) => items.join(', ') || 'none';
  const lines = [
    `# ${scope.title}`,
    '',
    `Question: ${scope.question}`,
    '',
    `Open state: **${state.open ?? `closed by ${state.by}`}**.`,
    '',
    '## History, newest first',
    '',
  ];
  for (const record of history) {
    const seen = freshness(tree, record);
    lines.push(
      `### ${record.date}: ${record.id}`,
      '',
      `${record.kind}; ${record.verdict ?? record.outcome ?? 'no verdict'}; source ${seen.state}${seen.law.changed.length ? '; doctrine moved since' : ''}.`,
      '',
      record.summary,
      ''
    );
    for (const alternative of record.alternatives ?? []) {
      lines.push(`- ${alternative}`);
    }
    for (const entry of record.reconciliation ?? []) {
      lines.push(`- ${entry.action} ${entry.record}: ${entry.reason}`);
    }
    if (record.kind === 'execution') {
      lines.push(
        `- plan ${record.plan}; basis ${list(record.reviewBasis)}; proof ${record.proof.state}: ${record.proof.limits}`
      );
    } else {
      lines.push('', `Proof limits: ${record.proofLimits}`);
    }
    lines.push('', `References: ${list(record.references)}.`, '');
  }
  const scopePlans = plans.filter((plan) => plan.scopes.includes(scope.id));
  lines.push('## Plans', '');
  for (const plan of scopePlans) {
    lines.push(
      `- ${plan.path}: ${plan.status || 'no status'}; ${plan.workKind ?? 'no work kind'}; basis ${list(plan.reviewBasis)}`
    );
  }
  if (!scopePlans.length) lines.push('None associated.');
  lines.push('');
  const documents = ledger.documents.filter((document) =>
    document.scopes.includes(scope.id)
  );
  lines.push('## Documents', '');
  for (const document of documents) {
    lines.push(
      `- ${document.path}: ${document.kind}, ${document.disposition}. ${document.rationale}`
    );
  }
  if (!documents.length) lines.push('None classified.');
  lines.push(
    '',
    '## Owners and evidence',
    '',
    `Owners: ${list(scope.owners ?? [])}.`,
    '',
    `Members: ${list(scope.members ?? [])}.`,
    '',
    `Consumers: ${list(scope.consumers ?? [])}.`,
    '',
    `Proof: ${list(scope.proof ?? [])}.${scope.gaps ? ` ${scope.gaps}` : ''}`,
    '',
    `Evidence inputs: ${list(scope.evidenceInputs ?? [])}.`,
    ''
  );
  return `${lines.join('\n')}\n`;
}

/** Product source the census covers: its roots and files, minus build output and prose. */
export const inCensus = (path) =>
  (census.files.includes(path) ||
    census.roots.some((dir) => path.startsWith(`${dir}/`))) &&
  census.extension.test(path) &&
  !census.exclusions.some((item) => item.pattern.test(path));

export function sourceFiles(tree) {
  return tree.files().filter(inCensus);
}

/** Census source that no scope owns, and owner or member entries that match nothing. */
export function coverage(
  root,
  { prefix = '', ledger = loadLedger(root) } = {}
) {
  const tree = observe(root);
  const universe = sourceFiles(tree).filter((path) => path.startsWith(prefix));
  const unowned = universe.filter((path) => !owningScopes(ledger, path).length);
  const dangling = [];
  for (const scope of ledger.scopes.values()) {
    for (const entry of [...(scope.owners ?? []), ...(scope.members ?? [])]) {
      if (!entry.startsWith(prefix)) continue;
      const matches = entry.endsWith('/')
        ? tree.under(entry).length
        : existsSync(join(root, entry));
      if (!matches) dangling.push({ scope: scope.id, entry });
    }
  }
  return {
    universe: universe.length,
    unowned: {
      total: unowned.length,
      byDirectory: Object.groupBy(unowned, (path) =>
        path.slice(0, path.lastIndexOf('/'))
      ),
    },
    dangling,
  };
}

function inputPaths(root, tree, scopes, extra, excluded) {
  const entries = new Set();
  for (const scope of scopes) {
    for (const path of entriesOf(scope)) entries.add(entryOf(root, path));
  }
  for (const path of tree.files().filter(isLaw)) entries.add(path);
  for (const path of extra) entries.add(entryOf(root, repoPath(path)));
  const inputs = {};
  const missing = [];
  for (const entry of [...entries].sort(byCodeUnit)) {
    if (excluded.has(entry) || excluded.has(entry.replace(/\/$/, ''))) continue;
    const digest = tree.digest(entry);
    if (digest === null) missing.push(entry);
    else inputs[entry] = digest;
  }
  return { inputs, missing };
}

function freeId(root, base) {
  let id = base;
  for (let n = 2; existsSync(join(root, recordsDir, `${id}.json`)); n++) {
    id = `${base}-${n}`;
  }
  return id;
}

export function draftReview(root, scopeId, extra = []) {
  const ledger = loadLedger(root);
  const scope = ledger.scopes.get(scopeId);
  assert.ok(scope, `Unknown scope: ${scopeId}`);
  const tree = observe(root);
  const head = latest(headsOf(ledger, scopeId));
  const date = new Date().toISOString().slice(0, 10);
  const { inputs, missing } = inputPaths(
    root,
    tree,
    [scope],
    extra,
    new Set(scope.decision ? [scope.decision] : [])
  );
  return {
    draft: {
      id: freeId(root, `${date}-${scopeId}`),
      kind: 'review',
      scope: scopeId,
      date,
      question: scope.question,
      model: null,
      method,
      trigger: '',
      requirements: [],
      evidenceReuse: '',
      summary: '',
      verdict: null,
      callSites: { current: '', proposed: '' },
      previous: head?.id ?? null,
      relation: head ? 'reaffirms' : 'initial',
      reconciliation: requiredReconciliation(
        ledger,
        scopeId,
        head?.id ?? null
      ).map((record) => ({ record, action: '', reason: '' })),
      alternatives: [],
      proofLimits: '',
      references: [],
      inputs,
      upstreams: [],
    },
    missing,
  };
}

export function draftExecution(root, planPath, extra = []) {
  repoPath(planPath);
  assert.ok(existsSync(join(root, planPath)), `Missing plan: ${planPath}`);
  const ledger = loadLedger(root);
  const plan = associationOf(root, ledger, planPath);
  assert.ok(
    !plan?.invalid,
    `The plan's review metadata is invalid: ${plan?.invalid?.join(', ')}`
  );
  assert.ok(
    plan?.scopes?.length,
    'Declare review_scopes, review_basis and work_kind in the plan front matter, or classify the plan in review-documents.json'
  );
  for (const id of plan.scopes) {
    assert.ok(ledger.scopes.has(id), `Unknown plan scope: ${id}`);
  }
  const tree = observe(root);
  const scopes = plan.scopes.map((id) => ledger.scopes.get(id));
  const { inputs, missing } = inputPaths(
    root,
    tree,
    scopes,
    extra,
    new Set([
      planPath,
      ...scopes.map((scope) => scope.decision).filter(Boolean),
    ])
  );
  const date = new Date().toISOString().slice(0, 10);
  const slug = planPath
    .split('/')
    .at(-1)
    .replace(/\.md$/, '')
    .replace(/^\d{4}-\d{2}-\d{2}-/, '');
  return {
    draft: {
      id: freeId(root, `${date}-${slug}-execution`),
      kind: 'execution',
      date,
      scopes: plan.scopes,
      reviewBasis: plan.reviewBasis,
      workKind: plan.workKind,
      previous: [
        ...new Set(
          plan.reviewBasis.flatMap((id) =>
            effectiveExecutions(ledger, id).map((execution) => execution.id)
          )
        ),
      ],
      plan: planPath,
      outcome: plan.landed ? 'completed' : 'partial',
      summary: '',
      proof: { state: 'unknown', evidence: [], limits: '' },
      references: [planPath],
      inputs,
      upstreams: [],
    },
    missing,
  };
}

const reviewKeys = [
  'id',
  'kind',
  'scope',
  'date',
  'question',
  'model',
  'method',
  'trigger',
  'requirements',
  'evidenceReuse',
  'summary',
  'verdict',
  'callSites',
  'previous',
  'relation',
  'reconciliation',
  'alternatives',
  'proofLimits',
  'references',
  'inputs',
  'upstreams',
];
const executionKeys = [
  'id',
  'kind',
  'date',
  'scopes',
  'reviewBasis',
  'workKind',
  'previous',
  'plan',
  'outcome',
  'summary',
  'proof',
  'references',
  'inputs',
  'upstreams',
];
const workKinds = new Set([
  'design',
  'implementation',
  'research',
  'workflow',
  'verification',
]);

function validateInputs(record) {
  assert.ok(
    isObject(record.inputs) &&
      Object.entries(record.inputs).every(
        ([path, digest]) => repoPath(path) && isDigest(digest)
      ),
    'inputs maps repository paths to SHA-256 digests'
  );
  assert.ok(
    Array.isArray(record.upstreams) && upstreamsShape(record.upstreams),
    'upstreams is a list of { checkout, commit, files } entries'
  );
}

/**
 * The rules a new record must keep forever. `record` checks them before
 * writing, and `check` re-checks every non-legacy record against them.
 */
function validateContract(ledger, record) {
  const shape = recordShape(record);
  assert.ok(!shape, `Malformed record: ${shape}`);
  assert.ok(/^[a-z0-9][a-z0-9-]+$/.test(record.id), 'Invalid record id');
  assert.ok(
    record.kind === 'execution' || record.kind === 'review',
    'kind is review or execution'
  );
  const keys = record.kind === 'execution' ? executionKeys : reviewKeys;
  const extra = Object.keys(record).filter((key) => !keys.includes(key));
  assert.ok(!extra.length, `Unknown fields: ${extra.join(', ')}`);
  assert.ok(
    record.references?.length && record.references.every(repoPath),
    'References name repository files'
  );
  validateInputs(record);
  if (record.kind === 'execution') validateExecutionContract(ledger, record);
  else validateReviewContract(ledger, record);
}

function validateReviewContract(ledger, record) {
  assert.ok(ledger.scopes.has(record.scope), `Unknown scope: ${record.scope}`);
  for (const field of [
    'question',
    'method',
    'trigger',
    'evidenceReuse',
    'summary',
    'proofLimits',
  ]) {
    assert.ok(isText(record[field]), `Missing ${field}`);
  }
  assert.ok(Object.hasOwn(record, 'model'), 'Record the model, or null');
  assert.ok(
    ['stop', 'pursue', 'defer'].includes(record.verdict),
    'A review needs a Stop, Pursue or Defer verdict'
  );
  if (record.verdict === 'pursue') {
    assert.ok(
      isText(record.callSites?.current) && isText(record.callSites?.proposed),
      'A Pursue review records callSites.current and callSites.proposed'
    );
  }
  assert.ok(
    record.requirements?.length && record.requirements.every(isText),
    'Record the current requirements and hard laws'
  );
  assert.ok(
    record.alternatives?.length >= 2 && record.alternatives.every(isText),
    'Record at least two alternatives, including the strongest cut'
  );
  assert.ok(
    ['initial', 'reaffirms', 'supersedes', 'reverses', 'defers'].includes(
      record.relation
    ),
    'Invalid relation'
  );
  assert.equal(
    record.previous === null,
    record.relation === 'initial',
    'Only a first review has relation initial and previous null'
  );
  if (record.previous !== null) {
    assert.equal(
      ledger.records.get(record.previous)?.scope,
      record.scope,
      `previous ${record.previous} is not a review of ${record.scope}`
    );
  }
  assert.ok(Array.isArray(record.reconciliation), 'Record reconciliation');
  for (const entry of record.reconciliation) {
    assert.ok(
      ledger.records.has(entry.record),
      `Unknown reconciliation record: ${entry.record}`
    );
    assert.ok(
      ['retains', 'reopens', 'supersedes'].includes(entry.action) &&
        isText(entry.reason),
      `Reconciliation of ${entry.record} needs an action and a reason`
    );
  }
  const previous = ledger.records.get(record.previous);
  if (previous?.verdict && previous.verdict !== record.verdict) {
    assert.ok(
      record.reconciliation.some(
        (entry) => entry.record === previous.id && entry.action !== 'retains'
      ),
      'A changed verdict must reopen or supersede its previous review'
    );
  }
  assert.ok(
    Object.keys(record.inputs).length,
    'A review captures the inputs it read'
  );
}

function validateExecutionContract(ledger, record) {
  assert.ok(
    record.scopes.length &&
      new Set(record.scopes).size === record.scopes.length &&
      record.scopes.every((id) => ledger.scopes.has(id)),
    'An execution needs unique known scopes'
  );
  assert.ok(Array.isArray(record.reviewBasis), 'Record reviewBasis');
  for (const id of record.reviewBasis) {
    const review = ledger.records.get(id);
    assert.ok(
      review &&
        review.kind === 'review' &&
        record.scopes.includes(review.scope),
      `Unknown governing review: ${id}`
    );
  }
  assert.ok(workKinds.has(record.workKind), 'Invalid workKind');
  assert.ok(
    Array.isArray(record.previous) &&
      record.previous.every(
        (id) => ledger.records.get(id)?.kind === 'execution'
      ),
    'previous names earlier executions'
  );
  assert.ok(
    ['completed', 'partial', 'blocked', 'abandoned'].includes(record.outcome),
    'Invalid outcome'
  );
  assert.ok(
    isText(record.summary) && isText(record.proof?.limits),
    'An execution needs a summary and proof limits'
  );
  assert.ok(
    ['verified', 'partial', 'unverified', 'unknown'].includes(
      record.proof.state
    ),
    'Invalid proof state'
  );
  assert.ok(
    Array.isArray(record.proof.evidence) &&
      record.proof.evidence.every(
        (item) =>
          repoPath(item.path) && isDigest(item.sha256) && isText(item.claim)
      ),
    'Each proof input names its path, digest and what it establishes'
  );
  repoPath(record.plan);
  if (record.proof.state === 'verified') {
    assert.ok(
      record.outcome === 'completed' &&
        record.proof.evidence.some((item) => item.path !== record.plan),
      'Verified proof needs a completed outcome and evidence beyond the plan'
    );
  }
}

/** The rules that hold only at the moment of recording, against the live ledger and tree. */
function validateAdmission(root, ledger, record) {
  for (const path of record.references) {
    assert.ok(existsSync(join(root, path)), `Missing reference: ${path}`);
  }
  if (record.kind === 'execution') {
    for (const item of record.proof.evidence) {
      assert.ok(
        existsSync(join(root, item.path)),
        `Missing proof file: ${item.path}`
      );
    }
    if (['implementation', 'workflow'].includes(record.workKind)) {
      const standing = record.reviewBasis
        .flatMap((id) => effectiveExecutions(ledger, id))
        .map((execution) => execution.id)
        .filter((id) => !record.previous.includes(id));
      assert.ok(
        !standing.length,
        `Name the executions this one follows in previous: ${[...new Set(standing)].join(', ')}`
      );
    }
    assert.ok(
      existsSync(join(root, record.plan)),
      `Missing plan: ${record.plan}`
    );
    const plan = associationOf(root, ledger, record.plan);
    assert.ok(
      plan && !plan.invalid,
      plan?.invalid
        ? `The plan's review metadata is invalid: ${plan.invalid.join(', ')}`
        : 'The plan has no review association'
    );
    const same = (a = [], b = []) =>
      JSON.stringify([...a].sort(byCodeUnit)) ===
      JSON.stringify([...b].sort(byCodeUnit));
    assert.ok(
      same(plan.scopes, record.scopes) &&
        same(plan.reviewBasis, record.reviewBasis) &&
        (plan.workKind ?? record.workKind) === record.workKind,
      'Execution scopes, reviewBasis and workKind must match the plan association'
    );
    if (record.outcome === 'completed') {
      assert.ok(
        plan.landed,
        plan.conflict
          ? `A completed execution needs one landed plan status; the plan says ${plan.conflict.map((label) => `"${label}"`).join(' and ')}`
          : `A completed execution needs a landed plan Status; found "${plan.status}"`
      );
    }
    return;
  }
  const heads = headsOf(ledger, record.scope);
  if (!heads.length) {
    assert.equal(record.previous, null, 'A first review has previous null');
  } else {
    assert.ok(
      heads.some((head) => head.id === record.previous),
      `The head of ${record.scope} is ${latest(heads).id}${heads.length > 1 ? ` (fork: ${heads.map((head) => head.id).join(', ')})` : ''}; set previous to it and reconcile it`
    );
  }
  const missing = requiredReconciliation(
    ledger,
    record.scope,
    record.previous
  ).filter((id) => !record.reconciliation.some((entry) => entry.record === id));
  assert.ok(!missing.length, `Reconcile ${missing.join(', ')}`);
}

/** Validates one record and creates its file. Never rewrites another file. */
export function recordDraft(root, draftPath, { dryRun = false } = {}) {
  const draft = JSON.parse(readFileSync(resolve(root, draftPath), 'utf-8'));
  delete draft.digest;
  const path = `${recordsDir}/${draft.id}.json`;
  const ledger = loadLedger(root);
  if (existsSync(join(root, path))) {
    const { digest, ...existing } = JSON.parse(read(root, path));
    const stored = new Map(
      (existing.proof?.evidence ?? []).map((item) => [item.path, item.sha256])
    );
    const retried =
      draft.kind === 'execution'
        ? {
            ...draft,
            proof: {
              ...draft.proof,
              evidence: (draft.proof?.evidence ?? []).map((item) => ({
                ...item,
                sha256: item.sha256 ?? stored.get(item.path),
              })),
            },
          }
        : draft;
    assert.equal(
      json(retried),
      json(existing),
      `${path} already exists with other content; pick another id`
    );
    return { recorded: path, duplicate: true, ...report(root, ledger) };
  }
  if (draft.kind === 'execution' && Array.isArray(draft.proof?.evidence)) {
    draft.proof.evidence = draft.proof.evidence.map((item) => ({
      ...item,
      sha256:
        item.sha256 ??
        (existsSync(join(root, item.path))
          ? hash(readFileSync(join(root, item.path)))
          : undefined),
    }));
  }
  for (const item of draft.kind === 'execution'
    ? (draft.proof?.evidence ?? [])
    : []) {
    assert.ok(
      typeof item?.path === 'string' && existsSync(join(root, item.path)),
      `Missing proof file: ${item?.path}`
    );
  }
  const contents = json({ ...draft, digest: hash(json(draft)) });
  validateContract(ledger, draft);
  validateAdmission(root, ledger, draft);
  const tree = observe(root);
  const changedSinceDraft = Object.entries(draft.inputs)
    .filter(([entry, digest]) => tree.digest(entry) !== digest)
    .map(([entry]) => entry);
  const scopes = (draft.kind === 'execution' ? draft.scopes : [draft.scope])
    .map((id) => ledger.scopes.get(id))
    .filter(Boolean);
  const skipped = new Set([
    ...scopes.map((scope) => scope.decision),
    draft.plan,
  ]);
  const notCaptured = [
    ...new Set(
      scopes
        .flatMap(entriesOf)
        .map((entry) => entryOf(root, entry))
        .filter(
          (entry) =>
            !skipped.has(entry) &&
            !Object.hasOwn(draft.inputs, entry) &&
            tree.digest(entry) !== null
        )
    ),
  ];
  const result = {
    recorded: path,
    inputs: Object.keys(draft.inputs).length,
    ...(changedSinceDraft.length ? { changedSinceDraft } : {}),
    ...(notCaptured.length ? { notCaptured } : {}),
    ...report(root, ledger),
  };
  if (dryRun) return { ...result, recorded: null, valid: true, record: draft };
  mkdirSync(join(root, recordsDir), { recursive: true });
  const temporary = join(root, recordsDir, `.${draft.id}.${process.pid}.tmp`);
  writeFileSync(temporary, contents);
  try {
    linkSync(temporary, join(root, path));
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    assert.equal(
      read(root, path),
      contents,
      `${path} was created concurrently with other content`
    );
    return { recorded: path, duplicate: true, ...report(root, ledger) };
  } finally {
    unlinkSync(temporary);
  }
  return result;
}

function git(root, args) {
  try {
    return execFileSync('git', ['-C', root, ...args], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

const gitBlob = (bytes) =>
  createHash('sha1')
    .update(`blob ${bytes.length}\0`)
    .update(bytes)
    .digest('hex');

/**
 * The blob each committed record and the legacy checksum list had in the first
 * commit that added it: the tree at the checksum list's oldest adding commit
 * (or at HEAD before one exists), plus every later addition reachable from
 * HEAD, side branches, merges and renamed paths included.
 */
function committedBlobs(root) {
  const history = ['-m', '--no-renames'];
  const base =
    git(root, [
      'log',
      ...history,
      '--diff-filter=A',
      '--format=%H',
      '--',
      legacyPath,
    ])
      ?.trim()
      .split('\n')
      .findLast(Boolean) ?? 'HEAD';
  const blobs = new Map();
  for (const line of (
    git(root, ['ls-tree', '-r', base, '--', recordsDir, legacyPath]) ?? ''
  ).split('\n')) {
    const match = line.match(/^\d+ blob ([a-f0-9]{40})\t(.+)$/);
    if (match) blobs.set(match[2], match[1]);
  }
  for (const line of (
    git(root, [
      'log',
      ...history,
      '--reverse',
      '--raw',
      '--no-abbrev',
      '--diff-filter=A',
      '--format=',
      `${base}..HEAD`,
      '--',
      recordsDir,
      legacyPath,
    ]) ?? ''
  ).split('\n')) {
    const match = line.match(/^:\d+ \d+ [a-f0-9]+ ([a-f0-9]{40}) A\t(.+)$/);
    if (match && !blobs.has(match[2])) blobs.set(match[2], match[1]);
  }
  return blobs;
}

/**
 * Edits and deletions of immutable records. The legacy checksum list and each
 * new record's digest and contract catch an edit before any commit. A
 * committed record or checksum list must match the blob it was first committed
 * with, in the working tree and in the index, so a byte-for-byte restore reads
 * clean. A staged record that was never committed must match its index entry,
 * which the Stop hook never restages.
 */
export function integrity(root, ledger) {
  const problems = [];
  for (const item of ledger.records.values()) {
    const path = `${recordsDir}/${item.id}.json`;
    const legacy = ledger.legacy.get(item.id);
    if (legacy) {
      if (item.sha256 !== legacy.sha256) {
        problems.push(`${path}: changed since the legacy checksum list`);
      }
      continue;
    }
    const { digest, ...body } = item.raw;
    if (digest !== hash(json(body))) {
      problems.push(`${path}: changed since it was recorded`);
      continue;
    }
    try {
      validateContract(ledger, body);
    } catch (error) {
      problems.push(`${path}: ${error.message.split('\n')[0]}`);
    }
  }
  for (const id of ledger.legacy.keys()) {
    if (!ledger.records.has(id)) problems.push(`Missing legacy record: ${id}`);
  }
  if (git(root, ['rev-parse', '--verify', 'HEAD']) === null) return problems;
  const indexed = new Map();
  for (const line of (
    git(root, ['ls-files', '-s', '--', recordsDir, legacyPath]) ?? ''
  ).split('\n')) {
    const match = line.match(/^\d+ ([a-f0-9]{40}) \d\t(.+)$/);
    if (match) indexed.set(match[2], match[1]);
  }
  const committed = committedBlobs(root);
  for (const [path, blob] of committed) {
    let bytes = null;
    try {
      bytes = readFileSync(join(root, path));
    } catch {
      problems.push(`Committed file deleted: ${path}`);
      continue;
    }
    if (gitBlob(bytes) !== blob || indexed.get(path) !== blob) {
      problems.push(
        `Committed file changed since it was first committed: ${path}`
      );
    }
  }
  for (const line of (
    git(root, [
      'diff',
      '--name-status',
      '--no-renames',
      '--',
      recordsDir,
      legacyPath,
    ]) ?? ''
  ).split('\n')) {
    const [change, path] = line.split('\t');
    if (/^[MD]$/.test(change) && !committed.has(path)) {
      problems.push(
        `Staged file changed or deleted before its first commit: ${path}`
      );
    }
  }
  return [...new Set(problems)];
}

/** Ledger integrity. Reads ledger files and git, never product source. */
export function check(root) {
  const ledger = loadLedger(root);
  const errors = [...ledger.warnings];
  const warnings = [];
  const attempt = (label, fn) => {
    try {
      fn();
    } catch (error) {
      errors.push(`${label}: ${error.message.split('\n')[0]}`);
    }
  };
  for (const scope of ledger.scopes.values()) {
    attempt(`${scopesDir}/${scope.id}.json`, () => {
      for (const field of ['title', 'question']) {
        assert.ok(isText(scope[field]), `Missing ${field}`);
      }
      assert.ok(
        Number.isInteger(scope.opportunity?.score) &&
          scope.opportunity.score >= 0 &&
          scope.opportunity.score <= 10 &&
          isText(scope.opportunity.reason),
        'opportunity needs an integer score 0 to 10 and a reason'
      );
      assert.equal(typeof scope.last, 'boolean', 'last is a boolean');
      for (const path of entriesOf(scope)) {
        repoPath(path);
        assert.equal(
          entryOf(root, path),
          path,
          `A directory entry ends with "/": ${path}`
        );
      }
      assert.ok(
        scope.owners?.length ||
          scope.members?.length ||
          scope.consumers?.length,
        'A scope names owners, members or consumers'
      );
      assert.ok(
        scope.proof?.length || isText(scope.gaps),
        'An empty proof list needs gaps saying why'
      );
      for (const id of [
        ...(scope.dependsOn ?? []),
        ...(scope.relatedScopes ?? []),
      ]) {
        assert.ok(
          id !== scope.id && ledger.scopes.has(id),
          `Unknown scope: ${id}`
        );
      }
      if (scope.dependsOn?.length) {
        assert.ok(
          isText(scope.prerequisiteReason),
          'dependsOn needs prerequisiteReason'
        );
      }
      if (scope.group) {
        assert.ok(
          ledger.groups.has(scope.group),
          `Unknown group: ${scope.group}`
        );
      }
    });
  }
  for (const [id, group] of ledger.groups) {
    attempt(`${groupsPath} ${id}`, () => {
      assert.ok(!ledger.scopes.has(id), 'A group id cannot be a scope id');
      assert.ok(
        isText(group.title) && isText(group.reason),
        'A group needs a title and a reason'
      );
      assert.ok(
        [...ledger.scopes.values()].filter((scope) => scope.group === id)
          .length > 1,
        'A group needs at least two scopes'
      );
    });
  }
  attempt(documentsPath, () => {
    const paths = ledger.documents.map((document) => document.path);
    assert.equal(new Set(paths).size, paths.length, 'Duplicate document path');
  });
  for (const document of ledger.documents) {
    attempt(`${documentsPath} ${document.path}`, () => {
      repoPath(document.path);
      assert.ok(
        [
          'plan',
          'decision',
          'lesson',
          'specification',
          'report',
          'history',
        ].includes(document.kind) &&
          [
            'active',
            'historical',
            'superseded',
            'candidate',
            'rejected',
          ].includes(document.disposition) &&
          isText(document.rationale),
        'A document needs a kind, a disposition and a rationale'
      );
      assert.ok(
        document.scopes?.length &&
          document.scopes.every((id) => ledger.scopes.has(id)),
        'Unknown document scope'
      );
      for (const id of document.reviewBasis ?? []) {
        assert.ok(ledger.records.has(id), `Unknown review basis: ${id}`);
      }
      if (!existsSync(join(root, document.path))) {
        warnings.push(`Missing document: ${document.path}`);
      }
    });
  }
  errors.push(...integrity(root, ledger));
  for (const item of ledger.records.values()) {
    if (!ledger.legacy.has(item.id) && item.raw.digest) continue;
    attempt(`${recordsDir}/${item.id}.json`, () => {
      if (item.kind === 'execution') {
        assert.ok(
          item.scopes.length &&
            item.scopes.every((id) => ledger.scopes.has(id)),
          'Unknown execution scope'
        );
        for (const id of item.reviewBasis) {
          assert.ok(ledger.records.has(id), `Unknown review basis: ${id}`);
        }
        for (const id of item.previous) {
          assert.equal(
            ledger.records.get(id)?.kind,
            'execution',
            `previous ${id} is not a recorded execution`
          );
        }
        return;
      }
      assert.ok(ledger.scopes.has(item.scope), `Unknown scope: ${item.scope}`);
      if (item.previous) {
        assert.equal(
          ledger.records.get(item.previous)?.scope,
          item.scope,
          `previous ${item.previous} is not a review of ${item.scope}`
        );
      }
      for (const entry of item.reconciliation) {
        assert.ok(
          ledger.records.has(entry.record),
          `Unknown reconciliation record: ${entry.record}`
        );
      }
    });
  }
  attempt('queue', () => orderUnits(ledger, { strict: true }));
  for (const id of ledger.scopes.keys()) {
    const heads = headsOf(ledger, id);
    if (heads.length > 1) {
      warnings.push(
        `Fork in ${id}: ${heads.map((head) => head.id).join(', ')}`
      );
    }
    for (const head of heads) {
      const standing = effectiveExecutions(ledger, head.id);
      if (standing.length > 1) {
        warnings.push(
          `Executions fork for ${head.id}: ${standing.map((item) => item.id).join(', ')}`
        );
      }
    }
  }
  if (existsSync(join(root, recordsDir))) {
    for (const name of readdirSync(join(root, recordsDir))) {
      if (name.endsWith('.tmp')) warnings.push(`Stray temporary file: ${name}`);
    }
  }
  for (const plan of plansOf(root, ledger)) {
    const problems = [
      ...plan.scopes
        .filter((id) => !ledger.scopes.has(id))
        .map((id) => `unknown scope ${id}`),
      ...plan.reviewBasis
        .filter((id) => ledger.records.get(id)?.kind !== 'review')
        .map((id) => `unknown review ${id}`),
    ];
    if (plan.invalid) problems.push(`invalid ${plan.invalid.join(', ')}`);
    if (plan.conflict) {
      problems.push(`conflicting status labels ${plan.conflict.join(' | ')}`);
    }
    if (problems.length) warnings.push(`${plan.path}: ${problems.join(', ')}`);
  }
  const covered = coverage(root, { ledger });
  if (covered.unowned.total) {
    warnings.push(
      `${covered.unowned.total} unowned source files; run coverage`
    );
  }
  for (const item of covered.dangling) {
    warnings.push(`${item.scope} entry matches no file: ${item.entry}`);
  }
  assert.ok(!errors.length, errors.join('\n'));
  return {
    ok: true,
    scopes: ledger.scopes.size,
    records: ledger.records.size,
    ...(warnings.length ? { warnings } : {}),
  };
}

const unquote = (value) => value.trim().replace(/^(['"])(.*)\1$/, '$2');

/**
 * Reads review_scopes, review_basis and work_kind from a document's front matter
 * and ignores every other key. The two list keys take a block list or `[a, b]`;
 * a scalar reads as null.
 */
export function documentMetadata(text) {
  const frontmatter =
    text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? '';
  const result = {};
  for (const key of ['review_scopes', 'review_basis', 'work_kind']) {
    const match = frontmatter.match(
      new RegExp(
        `^${key}:([^\\n]*)(?:\\n((?:[ \\t]+-[^\\n]*(?:\\n|$))*))?`,
        'm'
      )
    );
    if (!match) continue;
    const value = match[1].trim();
    if (key === 'work_kind') result[key] = unquote(value);
    else if (value.startsWith('[') && value.endsWith(']')) {
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

const usage =
  'Usage: node tooling/scripts/review-ledger.mjs next|status|lookup <scope|group|path|term> [--detail]|show [scope]|coverage [prefix]|draft <scope|plan.md> [--input <path>]...|record <draft.json> [--dry-run]|check|research <term>';

export function main(root, args) {
  const [command, argument] = args;
  const inputs = args.flatMap((arg, i) =>
    args[i - 1] === '--input' ? [arg] : []
  );
  if (command === 'next') return next(root);
  if (command === 'status') return status(root);
  if (command === 'lookup') {
    return lookup(root, argument, { detail: args.includes('--detail') });
  }
  if (command === 'show') return show(root, argument);
  if (command === 'coverage') return coverage(root, { prefix: argument ?? '' });
  if (command === 'draft') {
    assert.ok(argument, 'Supply a scope id or a plan path');
    const { draft, missing } = argument.endsWith('.md')
      ? draftExecution(root, argument, inputs)
      : draftReview(root, argument, inputs);
    if (missing.length) {
      process.stderr.write(`Not captured, missing: ${missing.join(', ')}\n`);
    }
    return draft;
  }
  if (command === 'record') {
    assert.ok(argument, 'Supply a completed draft');
    return recordDraft(root, argument, { dryRun: args.includes('--dry-run') });
  }
  if (command === 'check') return check(root);
  if (command === 'research') return searchResearch(root, argument);
  throw new Error(usage);
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const result = main(
      resolve(dirname(fileURLToPath(import.meta.url)), '../..'),
      process.argv.slice(2)
    );
    process.stdout.write(typeof result === 'string' ? result : json(result));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
