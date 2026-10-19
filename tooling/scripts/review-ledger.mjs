import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { landed, stateOf } from '../../.agents/pstack/status.mjs';
import { getWorkspaceSourceEntries } from '../../config/workspace-source-entries.mjs';

export const scopesDir = 'docs/research/review-scopes';
export const recordsDir = 'docs/research/review-records';
export const groupsPath = 'docs/research/review-groups.json';
export const documentsPath = 'docs/research/review-documents.json';
export const legacyPath = 'docs/research/review-legacy.json';
export const subjectOf = (id) => `docs/plans/topics/${id}.md`;

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
  '.agents/skills/verdict/SKILL.md',
  '.agents/rules/verdict.mdc',
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
  const pages = new Map();
  for (const path of (
    git(root, [
      'grep',
      '-l',
      '--untracked',
      '-E',
      '^verdict:',
      '--',
      'docs/plans/*.md',
    ]) ?? ''
  )
    .split('\n')
    .filter(Boolean)) {
    const page = pageOf(root, scopes, path);
    if (page) pages.set(page.id, page);
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
  for (const page of pages.values()) {
    for (const scope of page.scopes) {
      if (!reviews.has(scope)) reviews.set(scope, []);
      reviews
        .get(scope)
        .push({ ...page, scope, verdict: page.verdicts.get(scope) ?? null });
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
    pages,
    reviews,
    executions,
    membership,
    legacy,
    warnings,
  };
}

function pageOf(root, scopes, path) {
  const text = read(root, path);
  const meta = documentMetadata(text);
  if (!Array.isArray(meta.review_scopes) || meta.verdict === undefined) {
    return null;
  }
  const id = idOf(path);
  const inputs = Array.isArray(meta.review_inputs) ? meta.review_inputs : [];
  return {
    id,
    kind: 'review',
    path,
    date: id.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? '',
    scopes: meta.review_scopes,
    verdicts: verdictsOf(meta.review_scopes, meta.verdict),
    basis: Array.isArray(meta.review_basis) ? meta.review_basis : [],
    workKind: meta.work_kind ?? null,
    commit: meta.review_commit ?? null,
    inputs,
    upstreams: Array.isArray(meta.review_upstreams)
      ? meta.review_upstreams
      : [],
    entries: entriesFor(scopes, meta.review_scopes, inputs, path),
    summary: leadOf(text),
    previous: null,
    reconciliation: [],
    references: [],
    alternatives: [],
    raw: { id, path, ...meta },
  };
}

const idOf = (path) =>
  path.slice(path.lastIndexOf('/') + 1).replace(/\.md$/, '');

const verdictWords = new Set(['stop', 'pursue', 'defer']);

function verdictsOf(scopeIds, verdict) {
  const result = new Map();
  if (typeof verdict === 'string') {
    if (verdictWords.has(verdict)) {
      for (const id of scopeIds) result.set(id, verdict);
    }
    return result;
  }
  for (const item of Array.isArray(verdict) ? verdict : []) {
    const [id, word] = item.split('=').map((part) => part.trim());
    if (scopeIds.includes(id) && verdictWords.has(word) && !result.has(id)) {
      result.set(id, word);
    }
  }
  return result;
}

function entriesFor(scopes, scopeIds, inputs, own) {
  const added = inputs.filter((input) => !input.startsWith('!'));
  const dropped = new Set(
    inputs
      .filter((input) => input.startsWith('!'))
      .map((input) => input.slice(1))
  );
  const skipped = new Set(
    [own, ...scopeIds.map(subjectOf)].filter(
      (path) => path && !added.includes(path)
    )
  );
  const entries = new Set(added);
  for (const id of scopeIds) {
    for (const entry of scopes.has(id) ? entriesOf(scopes.get(id)) : []) {
      if (!skipped.has(entry)) entries.add(entry);
    }
  }
  return [...entries].filter((entry) => !dropped.has(entry)).sort(byCodeUnit);
}

export function headsOf(ledger, scopeId) {
  const all = ledger.reviews.get(scopeId) ?? [];
  const reviews = all.filter((record) => record.kind === 'review');
  if (!reviews.length) return all.slice(-1);
  const named = new Set();
  for (const review of reviews) {
    if (review.previous) named.add(review.previous);
    for (const entry of review.reconciliation) named.add(entry.record);
    for (const id of review.basis ?? []) named.add(id);
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

const executes = (plan) =>
  ['implementation', 'workflow'].includes(plan.workKind);

const isReviewPage = (plan) => plan.verdict !== undefined;

const legacyAdoption = (ledger, review) => {
  const effective = effectiveExecutions(ledger, review.id);
  return effective.length === 1 && effective[0].outcome === 'completed'
    ? effective[0]
    : null;
};

/**
 * What closes a Pursue: the implementation or workflow plans that name it, or
 * its own review page, when every one of them is landed. A review page's basis
 * adopts nothing.
 */
export function adoptionOf(ledger, review, plans) {
  const executing = plans.filter(
    (plan) =>
      executes(plan) &&
      plan.scopes.includes(review.scope) &&
      (plan.path === review.path ||
        (!isReviewPage(plan) && plan.reviewBasis.includes(review.id)))
  );
  if (executing.length) {
    return executing.every((plan) => plan.landed)
      ? { id: executing[0].path }
      : null;
  }
  return legacyAdoption(ledger, review);
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
    const scopeIds = Array.isArray(meta.review_scopes)
      ? meta.review_scopes
      : [];
    const lists = ['review_basis', 'review_inputs', 'review_upstreams'];
    const invalid = [
      ...(Array.isArray(meta.review_scopes) ? [] : ['review_scopes']),
      ...lists.filter(
        (key) => Object.hasOwn(meta, key) && !Array.isArray(meta[key])
      ),
      ...(meta.work_kind && !workKinds.has(meta.work_kind)
        ? ['work_kind']
        : []),
      ...(meta.verdict !== undefined &&
      (verdictsOf(scopeIds, meta.verdict).size !== scopeIds.length ||
        (Array.isArray(meta.verdict) &&
          meta.verdict.length !== scopeIds.length))
        ? ['verdict']
        : []),
      ...(meta.review_commit !== undefined &&
      !/^[0-9a-f]{40}$/.test(meta.review_commit)
        ? ['review_commit']
        : []),
      ...(Array.isArray(meta.review_upstreams) &&
      !meta.review_upstreams.every((entry) =>
        /^[^@\s]+@[0-9a-f]{40}$/.test(entry)
      )
        ? ['review_upstreams']
        : []),
    ];
    const inputs = Array.isArray(meta.review_inputs) ? meta.review_inputs : [];
    return {
      path,
      scopes: scopeIds,
      reviewBasis: Array.isArray(meta.review_basis) ? meta.review_basis : [],
      workKind: meta.work_kind ?? null,
      ...(meta.verdict === undefined ? {} : { verdict: meta.verdict }),
      ...(Object.hasOwn(meta, 'review_inputs') ? { inputs } : {}),
      ...(meta.review_commit
        ? {
            commit: meta.review_commit,
            inputs,
            upstreams: Array.isArray(meta.review_upstreams)
              ? meta.review_upstreams
              : [],
            entries: entriesFor(ledger.scopes, scopeIds, inputs, path),
          }
        : {}),
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

function gitGrep(root, args) {
  try {
    return execFileSync('git', ['-C', root, 'grep', ...args], {
      encoding: 'utf-8',
      maxBuffer: 1 << 28,
    });
  } catch (error) {
    if (error.status !== 1) throw error;
    return '';
  }
}

/** Plans that declare review metadata, plus classified historical plans. */
export function plansOf(root, ledger) {
  const declared = gitGrep(root, [
    '-l',
    '--untracked',
    '-E',
    '^review_scopes:',
    '--',
    'docs/plans/*.md',
  ])
    .split('\n')
    .filter(Boolean);
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

/** A plan's lifecycle labels: every `Status`, `status` and `goal_status` line. */
export const planLabels = (text) =>
  [
    ...text.matchAll(
      /^(?:[-*][ \t]+)?(?:\*\*)?(?:[Ss]tatus|goal_status)(?:\*\*)?:[ \t]*(\S.*)$/gm
    ),
    ...text.matchAll(/^[Ss]tatus:[ \t]*\r?\n[ \t]*-[ \t]+(.+)$/gm),
  ].map((match) => match[1].replaceAll('**', '').trim());

/**
 * A plan counts as landed only when every label is a landed word, so a
 * reopened Status beside an old completion is not landed.
 */
export function planStatus(text) {
  const labels = planLabels(text);
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
  const adopted = adoptionOf(ledger, head, plans);
  if (adopted) return { open: null, head: head.id, by: adopted.id };
  const started = plans.some(
    (plan) =>
      plan.scopes.includes(scopeId) &&
      plan.reviewBasis.includes(head.id) &&
      !plan.landed
  );
  return {
    open: 'pursue-not-adopted',
    head: head.id,
    progress: started ? 'in-progress' : 'none',
  };
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

const importRoots = ['packages', 'apps/www/src'];
const importSpecifier = /(?:\bfrom|\bimport\s*\()\s*['"]([^'"]+)['"]/;
// Apple Git's `grep -E` takes POSIX classes only.
const importGrep = `(from|import[[:space:]]*\\()[[:space:]]*['"][^'"]+['"]`;
const testSource =
  /(?:\.(?:spec|test|slow)\.[cm]?[jt]sx?$|\/(?:__tests__|type-tests)\/)/;
const edgeCache = new WeakMap();
const covers = (entries, path) =>
  entries.some((entry) =>
    entry.endsWith('/') ? path.startsWith(entry) : path === entry
  );

function importEdges(ledger, commit = null) {
  const { root } = ledger;
  if (!edgeCache.has(ledger)) edgeCache.set(ledger, new Map());
  const cache = edgeCache.get(ledger);
  if (cache.has(commit)) return cache.get(commit);
  const listed = execFileSync(
    'git',
    [
      '-C',
      root,
      ...(commit
        ? ['ls-tree', '-r', '--name-only', commit, '--', ...importRoots]
        : ['ls-files', '-co', '--exclude-standard', '--', ...importRoots]),
    ],
    { encoding: 'utf-8', maxBuffer: 1 << 28 }
  );
  const files = new Set(listed.split('\n').filter(Boolean));
  const specifiers = new Map(
    getWorkspaceSourceEntries(root).map(({ sourceEntry, specifier }) => [
      specifier,
      relative(root, sourceEntry),
    ])
  );
  const target = (file, specifier) =>
    specifier.startsWith('.')
      ? ['', '.ts', '.tsx', '/index.ts', '/index.tsx']
          .map((extension) => `${join(dirname(file), specifier)}${extension}`)
          .find((path) => files.has(path))
      : specifiers.get(specifier);
  const found = gitGrep(root, [
    ...(commit ? [] : ['--untracked']),
    '-I',
    '-o',
    '-E',
    importGrep,
    ...(commit ? [commit] : []),
    '--',
    ...importRoots,
  ]);
  const edges = [];
  for (const line of found.split('\n')) {
    const rest = commit ? line.slice(commit.length + 1) : line;
    const split = rest.indexOf(':');
    const file = rest.slice(0, split);
    const specifier = rest.slice(split + 1).match(importSpecifier)?.[1];
    if (
      !specifier ||
      file.startsWith('packages/plitejs/') ||
      testSource.test(file)
    ) {
      continue;
    }
    const path = target(file, specifier);
    if (path) edges.push([file, path]);
  }
  cache.set(commit, edges);
  return edges;
}

function dependentsOf(ledger, scope, commit = null) {
  const own = [...(scope.owners ?? []), ...(scope.members ?? [])];
  const byScope = new Map();
  const unowned = new Set();
  for (const [file, path] of importEdges(ledger, commit)) {
    if (!covers(own, path) || covers(own, file)) continue;
    const owners = owningScopes(ledger, file);
    if (!owners.length) unowned.add(file);
    for (const id of owners) {
      if (!byScope.has(id)) byScope.set(id, new Set());
      byScope.get(id).add(file);
    }
  }
  return {
    scopes: [...byScope]
      .map(([id, files]) => ({ id, files: [...files].sort(byCodeUnit) }))
      .sort(byId),
    unowned: [...unowned].sort(byCodeUnit),
  };
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

/** Source and law freshness of a review page, plan or legacy record against the live tree. Matching is not behavior proof. */
export function freshness(tree, record) {
  if (record.commit) return commitFreshness(tree, record);
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

function commitFreshness(tree, record) {
  const result = {
    state: 'unknown',
    changed: [],
    missing: [],
    law: { changed: [], state: 'unchanged' },
    legacyGroups: 0,
    upstream: null,
  };
  const moved = git(tree.root, [
    'diff',
    '--name-only',
    '--no-renames',
    record.commit,
    '--',
  ]);
  if (moved === null) {
    return { ...result, reason: `commit ${record.commit} is not reachable` };
  }
  const untracked =
    git(tree.root, ['ls-files', '--others', '--exclude-standard']) ?? '';
  const hit = new Set();
  for (const path of `${moved}\n${untracked}`.split('\n').filter(Boolean)) {
    if (isLaw(path)) {
      result.law.changed.push(path);
      continue;
    }
    for (const entry of record.entries) {
      if (entry === path || (entry.endsWith('/') && path.startsWith(entry))) {
        hit.add(entry);
      }
    }
  }
  for (const entry of [...hit].sort(byCodeUnit)) {
    const present = entry.endsWith('/')
      ? tree.under(entry).length > 0
      : existsSync(join(tree.root, entry));
    (present ? result.changed : result.missing).push(entry);
  }
  for (const upstream of record.upstreams) {
    result.upstream = checkoutState(tree.root, upstream, result.upstream);
  }
  result.state =
    result.changed.length ||
    result.missing.length ||
    result.upstream === 'stale'
      ? 'stale'
      : result.upstream === 'unknown'
        ? 'unknown'
        : 'matching';
  result.law.state = result.law.changed.length ? 'moved' : 'unchanged';
  return result;
}

function checkoutState(root, upstream, previous) {
  if (previous === 'stale') return previous;
  const at = upstream.lastIndexOf('@');
  const checkout = resolve(root, upstream.slice(0, at));
  if (!existsSync(checkout)) return 'unknown';
  const head = git(checkout, ['rev-parse', 'HEAD'])?.trim();
  const dirty = git(checkout, ['status', '--porcelain']);
  if (!head || dirty === null) return 'unknown';
  return head !== upstream.slice(at + 1) || dirty
    ? 'stale'
    : (previous ?? 'matching');
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
  const dependents = dependentsOf(ledger, scope);
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
        freshness: plan.commit ? briefFreshness(freshness(tree, plan)) : null,
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
    dependents: {
      scopes: dependents.scopes.map(({ id, files }) => ({
        id,
        files: bounded(files, 3),
        open: openState(ledger, id, plans).open,
      })),
      unowned: bounded(dependents.unowned, 5),
    },
    subject: existsSync(join(tree.root, subjectOf(scope.id)))
      ? subjectOf(scope.id)
      : null,
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
    plans: plans
      .filter((plan) => plan.scopes.includes(scope.id))
      .map((plan) => ({
        ...plan,
        freshness: plan.commit ? freshness(tree, plan) : null,
      })),
    documents: ledger.documents.filter((document) =>
      document.scopes.includes(scope.id)
    ),
    candidates: unresolvedCandidates(ledger, scope),
    executionsTotal: (ledger.executions.get(scope.id) ?? []).length,
  };
}

const lookupLimit = 10;

/** The ledger, tree and plans one or more lookups read. */
export function lookupContext(root) {
  const ledger = loadLedger(root);
  return { ledger, tree: observe(root), plans: plansOf(root, ledger) };
}

export const lookup = (root, query, options) =>
  lookupIn(lookupContext(root), query, options);

export function lookupIn(
  { ledger, tree, plans },
  query,
  { detail = false } = {}
) {
  assert.ok(isText(query), 'Supply a scope, group, path or search term');
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
    ...report(ledger),
  };
}

const report = (ledger) =>
  ledger.warnings.length ? { warnings: ledger.warnings } : {};

const IN_FLIGHT_DAYS = 14;

const changedWithin = (root, path, now) =>
  Boolean(git(root, ['status', '--porcelain', '--', path])?.trim()) ||
  now - Number(git(root, ['log', '-1', '--format=%at', '--', path])) * 1000 <
    IN_FLIGHT_DAYS * 86_400_000;

const inFlightPlans = (root, plans, scopeId, now) =>
  plans
    .filter(
      (plan) =>
        plan.scopes.includes(scopeId) &&
        ['active', 'held', 'planning'].includes(stateOf(plan.status)) &&
        changedWithin(root, plan.path, now)
    )
    .map((plan) => plan.path)
    .sort(byCodeUnit);

const shipSteps = {
  unreviewed: (scope) => ({
    title: `Review ${scope.title} (xhigh)`,
    kind: 'decide',
    finding: `Nobody has reviewed the ${scope.id} scope yet. Start it with verdict ${scope.id}.`,
  }),
  fork: (scope) => ({
    title: `Settle the open fork in ${scope.title} (xhigh)`,
    kind: 'decide',
    finding: `The ${scope.id} scope has more than one current review. Start it with verdict ${scope.id}, which settles them into one.`,
  }),
  'pursue-not-adopted': (scope) => ({
    title: `Build the pursued ${scope.title} design`,
    kind: 'fix',
    finding: `The ${scope.id} review's verdict is pursue, and no landed plan adopts it. Plan and build it from that review page through the Plan playbook.`,
  }),
};

/** The open scopes in queue order, which chips offers as P1 tasks through `chips.ship` in `.agents/pstack.json`. A deferred scope waits on outside evidence, so it is left out. */
export function ship(root) {
  const ledger = loadLedger(root);
  const plans = plansOf(root, ledger);
  const now = Date.now();
  return orderUnits(ledger).flatMap((unit) =>
    unit.scopes.flatMap((id) => {
      const scope = ledger.scopes.get(id);
      const step = shipSteps[openState(ledger, id, plans).open];
      if (!step) return [];
      return [
        {
          id,
          ...step({ id, title: scope.title ?? id }),
          writes: [
            'docs/plans',
            ...(scope.owners ?? []).map((path) => path.replace(/\/$/, '')),
          ],
          topic: `review-${id}`,
          busy: inFlightPlans(root, plans, id, now).length > 0,
        },
      ];
    })
  );
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
    } else if (record.path) {
      lines.push('', `Page: ${record.path}`);
    } else {
      lines.push('', `Proof limits: ${record.proofLimits}`);
    }
    lines.push('', `References: ${list(record.references)}.`, '');
  }
  const scopePlans = plans.filter((plan) => plan.scopes.includes(scope.id));
  lines.push('## Plans', '');
  for (const plan of scopePlans) {
    lines.push(
      `- ${plan.path}: ${plan.status || 'no status'}; ${plan.workKind ?? 'no work kind'}; basis ${list(plan.reviewBasis)}${plan.commit ? `; source ${freshness(tree, plan).state}` : ''}`
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
    `Dependents: ${list(dependentsOf(ledger, scope).scopes.map(({ id }) => id))}.`,
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

const workKinds = new Set([
  'design',
  'implementation',
  'research',
  'workflow',
  'verification',
]);

function git(root, args) {
  try {
    return execFileSync('git', ['-C', root, ...args], {
      encoding: 'utf-8',
      maxBuffer: 1 << 28,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

export function check(root, { base = 'HEAD' } = {}) {
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
        assert.ok(
          ledger.records.has(id) || ledger.pages.has(id),
          `Unknown review basis: ${id}`
        );
      }
      if (!existsSync(join(root, document.path))) {
        warnings.push(`Missing document: ${document.path}`);
      }
    });
  }
  for (const item of ledger.records.values()) {
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
      (heads.some((head) => head.path) ? errors : warnings).push(
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
  const plans = plansOf(root, ledger);
  const context = planContext(root, ledger, plans, base, errors);
  for (const plan of plans) {
    const problems = planProblems(context, plan);
    if (plan.conflict) {
      warnings.push(
        `${plan.path}: conflicting status labels ${plan.conflict.join(' | ')}`
      );
    }
    if (problems.length) errors.push(`${plan.path}: ${problems.join(', ')}`);
  }
  for (const path of (
    git(root, [
      'grep',
      '-l',
      '--untracked',
      '-i',
      '-E',
      '^(review|verdict|work.?kind)',
      '--',
      'docs/plans/*.md',
    ]) ?? ''
  )
    .split('\n')
    .filter(Boolean)) {
    const unknown = unknownReviewKeys(read(root, path));
    if (unknown.length) {
      errors.push(`${path}: unknown review key ${unknown.join(', ')}`);
    }
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
    pages: ledger.pages.size,
    ...(warnings.length ? { warnings } : {}),
  };
}

/**
 * Checks only the named plans: their review keys and the per-plan problems
 * `check` reports. Skips scope, record and queue validation, the coverage
 * census and every other plan, so a plan can be checked while it is written.
 */
export function checkPlans(root, paths, { base = 'HEAD' } = {}) {
  const ledger = loadLedger(root);
  const errors = [];
  const context = planContext(
    root,
    ledger,
    plansOf(root, ledger),
    base,
    errors
  );
  for (const path of paths) {
    if (!existsSync(join(root, path))) {
      errors.push(`${path}: no such plan`);
      continue;
    }
    const plan = associationOf(root, ledger, path);
    const unknown = unknownReviewKeys(read(root, path));
    const problems = [
      ...(unknown.length ? [`unknown review key ${unknown.join(', ')}`] : []),
      ...(plan ? planProblems(context, plan) : []),
    ];
    if (problems.length) errors.push(`${path}: ${problems.join(', ')}`);
  }
  assert.ok(!errors.length, errors.join('\n'));
  return { ok: true, plans: paths.length };
}

function planContext(root, ledger, plans, base, errors) {
  const baseCommit = git(root, [
    'rev-parse',
    '--verify',
    '--quiet',
    `${base}^{commit}`,
  ])?.trim();
  if (!baseCommit) {
    errors.push(
      `Cannot resolve the base commit ${base}, so new review pages cannot be told from committed ones. Pass a base this checkout holds.`
    );
  }
  const atBase = baseCommit
    ? new Set(
        git(root, [
          'ls-tree',
          '-r',
          '--name-only',
          baseCommit,
          '--',
          'docs/plans',
        ])?.split('\n')
      )
    : null;
  return {
    root,
    ledger,
    plans,
    unignored: unignoredPaths(root),
    added: (path) => atBase !== null && !atBase.has(path),
  };
}

function planProblems({ root, ledger, plans, unignored, added }, plan) {
  return [
    ...(plan.invalid ? [`invalid ${plan.invalid.join(', ')}`] : []),
    ...plan.scopes
      .filter((id) => !ledger.scopes.has(id))
      .map((id) => `unknown scope ${id}`),
    ...plan.scopes
      .filter((id, index) => plan.scopes.indexOf(id) !== index)
      .map((id) => `repeated scope ${id}`),
    ...plan.reviewBasis.flatMap((id) => {
      const reviewed = scopesOfReview(ledger, id);
      if (!reviewed) return [`unknown review ${id}`];
      return reviewed.some((scope) => plan.scopes.includes(scope))
        ? []
        : [`${id} is not a review of ${plan.scopes.join(', ')}`];
    }),
    ...pageProblems(root, unignored, ledger, plans, plan, added),
  ];
}

const unknownReviewKeys = (text) =>
  [...(text.match(frontmatterPattern)?.[1] ?? '').matchAll(/^([\w-]+):/gm)]
    .map((match) => match[1])
    .filter(
      (key) =>
        /^(review|verdict|work.?kind)/i.test(key) && !reviewKeys.includes(key)
    );

function scopesOfReview(ledger, id) {
  if (ledger.pages.has(id)) return ledger.pages.get(id).scopes;
  const record = ledger.records.get(id);
  return record?.kind === 'review' ? [record.scope] : null;
}

const unignoredPaths = (root) => {
  const paths = new Set();
  for (const file of (
    git(root, ['ls-files', '-z', '-co', '--exclude-standard']) ?? ''
  ).split('\0')) {
    for (let end = file.length; end > 0; end = file.lastIndexOf('/', end - 1)) {
      paths.add(file.slice(0, end));
    }
  }
  return paths;
};

const inTreeOrHistory = (root, unignored, path) =>
  unignored.has(path.replace(/\/$/, '')) ||
  Boolean(git(root, ['log', '--all', '-1', '--format=%H', '--', path])?.trim());

const absence = (root, path) =>
  existsSync(join(root, path))
    ? 'is git-ignored, so a fresh checkout lacks it; commit it or cite a tracked file'
    : 'is in no tree or commit';

function sectionOf(text, heading, level = '##') {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex(
    (line) => line.trim() === `${level} ${heading}`
  );
  if (start === -1) return '';
  const sameOrHigher = new RegExp(`^#{1,${level.length}} `);
  const end = lines.findIndex(
    (line, index) => index > start && sameOrHigher.test(line)
  );
  return lines
    .slice(start + 1, end === -1 ? undefined : end)
    .join('\n')
    .trim();
}

const listItems = (text) =>
  (text.match(/^[ \t]*(?:[-*]|\d+\.)[ \t]+\S/gm) ?? []).length;

function leadOf(text) {
  const body = text.replace(frontmatterPattern, '');
  const title = body.search(/^# /m);
  const rest = title === -1 ? body : body.slice(body.indexOf('\n', title) + 1);
  for (const block of rest.split(/\r?\n[ \t]*\r?\n/)) {
    const lines = block.split(/\r?\n/).filter((line) => line.trim());
    if (!lines.length) continue;
    if (lines[0].startsWith('#')) return '';
    if (lines.every((line) => /^(?:Status|Topic|Playbook|Page):/.test(line))) {
      continue;
    }
    return lines.join(' ').trim();
  }
  return '';
}

function linksOf(path, text) {
  return [...text.matchAll(/\]\(([^)\s]+)/g)]
    .map((match) => match[1])
    .filter((link) => !/^(?:[a-z][a-z0-9+.-]*:|#|\/)/i.test(link))
    .map((link) => {
      const target = link.split('#')[0];
      try {
        return join(dirname(path), decodeURIComponent(target));
      } catch {
        return join(dirname(path), target);
      }
    })
    .filter((target) => target && target !== '.');
}

function inlinedFrames(path, text) {
  const demo = sectionOf(text, 'Demo');
  const firstStep = demo.search(/^\d+[.)]\s/m);
  const images = [
    firstStep === -1 ? '' : demo.slice(firstStep),
    sectionOf(text, 'Teach'),
  ].flatMap(
    (section) =>
      section.match(/!\[[^\]]*\]\([^)\s]+\.(?:gif|jpe?g|png|svg|webp)\)/gi) ??
      []
  );
  return linksOf(path, images.join('\n')).filter((target) =>
    target.startsWith('docs/plans/artifacts/')
  );
}

function reconciliationOf(evidence, id) {
  const named = new RegExp(
    `(?:^|[^\\w-])${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`
  );
  for (const line of evidence.split('\n')) {
    if (!named.test(line)) continue;
    const match = line.match(/\b(retains|reopens|supersedes)\b(.*)$/);
    if (!match) continue;
    const reason = match[2]
      .replace(id, '')
      .replace(/[\s:;,.`*-]+/g, ' ')
      .trim();
    return { action: match[1], reason };
  }
  return null;
}

const unaffectedWithReason = /\bunaffected\b\W+(?:\S+\s+){2,}\S/i;

function dependentProblems(ledger, plan, evidence) {
  const commit = plan.commit ?? null;
  if (
    commit &&
    !git(ledger.root, [
      'rev-parse',
      '--verify',
      '--quiet',
      `${commit}^{commit}`,
    ])
  ) {
    return [
      `review_commit ${commit} is not in this checkout, so its dependents cannot be read`,
    ];
  }
  const dependents = new Map();
  for (const id of plan.scopes) {
    const scope = ledger.scopes.get(id);
    if (!scope) continue;
    for (const { files, id: dependent } of dependentsOf(ledger, scope, commit)
      .scopes) {
      if (!plan.scopes.includes(dependent) && !dependents.has(dependent)) {
        dependents.set(dependent, files);
      }
    }
  }
  if (!dependents.size) return [];
  const section = sectionOf(evidence, 'Dependents', '###');
  if (!section) {
    return [
      `## Evidence needs a ### Dependents list for ${[...dependents.keys()].join(', ')}; \`node tooling/scripts/review-ledger.mjs lookup ${plan.scopes[0]}\` lists the files each imports`,
    ];
  }
  const items = section.split(/\n(?=[ \t]*[-*][ \t])/);
  const inputs = (plan.inputs ?? []).filter((input) => !input.startsWith('!'));
  return [...dependents]
    .filter(([id, files]) => {
      const scope = ledger.scopes.get(id);
      const owned = [
        ...(scope.owners ?? []),
        ...(scope.members ?? []),
        ...(scope.consumers ?? []),
      ];
      const fromScope = (input) =>
        files.includes(input) || covers(owned, input);
      const named = new RegExp(
        `(?:^|[^\\w-])${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`
      );
      return !items.some(
        (item) =>
          named.test(item) &&
          (unaffectedWithReason.test(item) ||
            inputs.some((input) => item.includes(input) && fromScope(input)))
      );
    })
    .map(
      ([id, files]) =>
        `### Dependents does not account for ${id}, which imports ${files[0]}: name it beside a review_inputs path it owns or imports from, or beside "unaffected" and the reason`
    );
}

function pageProblems(root, unignored, ledger, plans, plan, added) {
  const problems = [];
  const text = read(root, plan.path);
  const inputs = (plan.inputs ?? []).filter((input) => !input.startsWith('!'));
  for (const path of inputs) {
    if (path.startsWith('/') || path.split('/').includes('..')) {
      problems.push(`review_inputs path ${path} is in no tree or commit`);
    } else if (!inTreeOrHistory(root, unignored, path)) {
      problems.push(`review_inputs path ${path} ${absence(root, path)}`);
    }
  }
  if (executes(plan) && plan.landed) {
    const close = sectionOf(text, 'Close');
    if (
      !close &&
      (plan.commit || plan.reviewBasis.some((id) => ledger.pages.has(id)))
    ) {
      problems.push('a landed plan needs a ## Close');
    }
    for (const path of inputs) {
      if (!close.includes(path)) {
        problems.push(`## Close does not name ${path}`);
      }
    }
  }
  if (!isReviewPage(plan)) return problems;
  const page = ledger.pages.get(idOf(plan.path));
  if (!plan.commit) problems.push('a review page needs review_commit');
  if (!leadOf(text)) problems.push('a review page needs a lead paragraph');
  if (!/^Playbook:[ \t]*\S/m.test(text)) {
    problems.push('a review page needs a Playbook: line');
  }
  const evidence = sectionOf(text, 'Evidence');
  if (!evidence) problems.push('a review page needs ## Evidence');
  if (!/^(?:[-*][ \t]+)?Model:[ \t]*\S/m.test(evidence)) {
    problems.push('## Evidence needs a Model: line');
  }
  if (listItems(sectionOf(evidence, 'Requirements', '###')) < 1) {
    problems.push('## Evidence needs a ### Requirements list');
  }
  if (listItems(sectionOf(evidence, 'Lanes', '###')) < 2) {
    problems.push('### Lanes needs at least two lanes');
  }
  if (
    [...(page?.verdicts.values() ?? [])].includes('pursue') &&
    !sectionOf(text, 'Public API')
  ) {
    problems.push('a Pursue page needs ## Public API');
  }
  for (const [, link] of text.matchAll(/\]\((\/[^)\s]*)/g)) {
    problems.push(`link ${link} is absolute, not a repository path`);
  }
  const inlined = inlinedFrames(plan.path, text);
  for (const target of linksOf(plan.path, text)) {
    if (target.startsWith('..')) {
      problems.push(`link ${target} leaves the repository`);
    } else if (
      !inlined.includes(target) &&
      !inTreeOrHistory(root, unignored, target)
    ) {
      problems.push(`link ${target} ${absence(root, target)}`);
    }
  }
  if (
    !linksOf(plan.path, evidence).some((target) => !target.startsWith('..'))
  ) {
    problems.push('## Evidence links no repository file');
  }
  if (added(plan.path)) {
    problems.push(...dependentProblems(ledger, plan, evidence));
  }
  for (const id of plan.reviewBasis) {
    const reconciled = [
      id,
      ...plans
        .filter(
          (other) =>
            executes(other) &&
            other.landed &&
            !isReviewPage(other) &&
            other.reviewBasis.includes(id)
        )
        .map((other) => idOf(other.path)),
      ...effectiveExecutions(ledger, id).map((execution) => execution.id),
    ];
    for (const name of reconciled) {
      const entry = reconciliationOf(evidence, name);
      if (!entry?.reason) {
        problems.push(
          `## Evidence does not reconcile ${name} with an action and a reason: name it on one line with retains, reopens or supersedes, then the reason`
        );
      }
    }
    const record = ledger.records.get(id);
    const basisVerdicts =
      ledger.pages.get(id)?.verdicts ??
      new Map(record?.verdict ? [[record.scope, record.verdict]] : []);
    for (const [scope, verdict] of page?.verdicts ?? []) {
      const before = basisVerdicts.get(scope);
      if (
        before &&
        before !== verdict &&
        reconciliationOf(evidence, id)?.action === 'retains'
      ) {
        problems.push(`a changed verdict retains ${id}`);
      }
    }
  }
  return problems;
}

const unquote = (value) => value.trim().replace(/^(['"])(.*)\1$/, '$2');

const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

const reviewKeys = [
  'review_scopes',
  'review_basis',
  'work_kind',
  'verdict',
  'review_commit',
  'review_inputs',
  'review_upstreams',
];

export function documentMetadata(text) {
  const frontmatter = text.match(frontmatterPattern)?.[1] ?? '';
  const result = {};
  for (const key of reviewKeys) {
    const match = frontmatter.match(
      new RegExp(
        `^${key}:([^\\n]*)(?:\\n((?:[ \\t]+-[^\\n]*(?:\\n|$))*))?`,
        'm'
      )
    );
    if (!match) continue;
    const value = match[1].trim();
    if (key === 'work_kind' || key === 'review_commit') {
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
    } else if (key === 'verdict') {
      result[key] = unquote(value);
    } else {
      result[key] = null;
    }
  }
  return result;
}

export function searchResearch(root, query) {
  assert.ok(query?.trim(), 'Supply a research query or semantic key');
  const needle = query.toLowerCase();
  const { rows, warnings } = researchRows(root);
  return {
    query,
    matches: rows
      .filter(
        ({ run, text }) =>
          text.toLowerCase().includes(needle) ||
          run.toLowerCase().includes(needle)
      )
      .map(({ run, text, ...match }) => match),
    warnings,
    limit:
      'Text/key lookup only; semantic equivalence and source reuse require review. Original headers and status are preserved.',
  };
}

/**
 * Every row of every research run's ledgers, with its run and raw text, and a
 * warning for each row whose cells do not match its header.
 */
export function researchRows(root) {
  const rows = [];
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
        const row = malformed
          ? null
          : Object.fromEntries(keys.map((key, column) => [key, cells[column]]));
        rows.push({
          run: run.name,
          text: line,
          path,
          line: i + 2,
          status: row?.status ?? null,
          row,
          ...(malformed ? { header: keys, rawCells: cells } : {}),
        });
      }
    }
  }
  return { rows, warnings };
}

const usage =
  'Usage: node tooling/scripts/review-ledger.mjs status|ship|lookup <scope|group|path|term> [--detail]|show [scope]|coverage [prefix]|check [plan...]|research <term>';

export function main(root, args) {
  const [command, argument] = args;
  if (command === 'status') return status(root);
  if (command === 'ship') return ship(root);
  if (command === 'lookup') {
    return lookup(root, argument, { detail: args.includes('--detail') });
  }
  if (command === 'show') return show(root, argument);
  if (command === 'coverage') return coverage(root, { prefix: argument ?? '' });
  if (command === 'check') {
    const base = process.env.PLATE_BASELINE_BASE || 'HEAD';
    const paths = args.slice(1);
    return paths.length
      ? checkPlans(
          root,
          paths.map((path) => relative(root, resolve(path))),
          { base }
        )
      : check(root, { base });
  }
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
