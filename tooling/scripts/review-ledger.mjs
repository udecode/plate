import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { landed, stateOf, waitsOnOwner } from '../../.agents/pstack/status.mjs';
import {
  grepFiles,
  isSplit,
  privateGit,
  trackedFiles,
  UPSTREAM,
} from './private-files.mjs';

export const scopesDir = 'docs/research/review-scopes';
export const recordsDir = 'docs/research/review-records';
export const groupsPath = 'docs/research/review-groups.json';
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
    { pattern: /\/(?:AGENTS|CLAUDE|README|CHANGELOG)\.md$/ },
    { pattern: /^apps\/www\/src\/registry\/changelog\// },
    { pattern: /\/tsconfig\.tsbuildinfo$/ },
    { pattern: /^apps\/plite\/(out|plite|tmp)\// },
    { pattern: /^apps\/www\/tests\/browser\/docs-sidebar\.spec\.ts$/ },
  ],
};

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const read = (root, path) => readFileSync(join(root, path), 'utf-8');
const isText = (value) => typeof value === 'string' && value.trim() !== '';
const isObject = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const strings = (value) =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');
const optionalStrings = (value) => value === undefined || strings(value);
const byId = (a, b) => a.id.localeCompare(b.id);
const byCodeUnit = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const bounded = (items, limit) => ({
  items: items.slice(0, limit),
  total: items.length,
});
const clip = (text = '', limit = 600) =>
  text.length > limit ? `${text.slice(0, limit - 3)}...` : text;
const list = (items) => items.join(', ') || 'none';

function repoPath(path) {
  assert.ok(
    isText(path) && !path.startsWith('/') && !path.split('/').includes('..'),
    `Expected a repository-relative path: ${path}`
  );
  return path;
}

function visibleTree(root) {
  let visible;
  let listed;
  let directories;
  const visibleFiles = () =>
    (visible ??= new Set(trackedFiles(root, { untracked: true })));
  const files = () =>
    (listed ??= [...visibleFiles()]
      .filter((path) => path && existsSync(join(root, path)))
      .sort(byCodeUnit));
  const under = (directory) => {
    const prefix = directory.endsWith('/') ? directory : `${directory}/`;
    return files().filter((path) => path.startsWith(prefix));
  };
  const isListedDirectory = (path) => {
    if (!directories) {
      directories = new Set();
      for (const file of visibleFiles()) {
        for (
          let at = file.indexOf('/');
          at !== -1;
          at = file.indexOf('/', at + 1)
        ) {
          directories.add(file.slice(0, at));
        }
      }
    }
    return directories.has(path);
  };
  return { root, files, under, isListedDirectory };
}

const entryOf = (tree, path) =>
  path.endsWith('/') || !tree.isListedDirectory(path) ? path : `${path}/`;

function readJson(root, path, warnings, fallback = null) {
  if (!existsSync(join(root, path))) return fallback;
  try {
    return JSON.parse(read(root, path));
  } catch (error) {
    warnings?.push(`${path}: ${error.message.split('\n')[0]}`);
    return fallback;
  }
}

function jsonFiles(root, directory) {
  if (!existsSync(join(root, directory))) return [];
  return readdirSync(join(root, directory))
    .filter((name) => name.endsWith('.json') && !name.startsWith('.'))
    .sort()
    .map((name) => `${directory}/${name}`);
}

const scopeArrayKeys = [
  'owners',
  'members',
  'consumers',
  'proof',
  'evidenceInputs',
  'dependsOn',
  'relatedScopes',
  'historyCandidates',
];

function scopeShape(scope) {
  if (typeof scope?.id !== 'string') return 'id is not a string';
  const bad = scopeArrayKeys.find((key) => !optionalStrings(scope[key]));
  return bad ? `${bad} is not a list of strings` : null;
}

/**
 * Reads scopes, groups, review pages and legacy review records. Malformed scope
 * or group files become warnings so readers keep working while `check` reports
 * them.
 */
export function loadLedger(root) {
  const warnings = [];
  const scopes = new Map();
  for (const path of jsonFiles(root, scopesDir)) {
    const scope = readJson(root, path, warnings);
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
  const groupFile = readJson(root, groupsPath, warnings, {});
  const groups = new Map();
  if (isObject(groupFile)) {
    for (const [id, group] of Object.entries(groupFile)) {
      if (isObject(group)) groups.set(id, group);
      else warnings.push(`${groupsPath}: group ${id} is not an object`);
    }
  } else {
    warnings.push(`${groupsPath}: not an object`);
  }
  const reviews = new Map();
  const pushReview = (scopeId, entry) => {
    if (!reviews.has(scopeId)) reviews.set(scopeId, []);
    reviews.get(scopeId).push(entry);
  };
  for (const path of jsonFiles(root, recordsDir)) {
    const raw = readJson(root, path);
    if (
      !isObject(raw) ||
      !['review', 'historical'].includes(raw.kind) ||
      typeof raw.id !== 'string' ||
      typeof raw.scope !== 'string' ||
      typeof raw.date !== 'string'
    ) {
      continue;
    }
    pushReview(raw.scope, {
      id: raw.id,
      kind: raw.kind,
      scope: raw.scope,
      date: raw.date,
      verdict: raw.verdict ?? null,
      previous: typeof raw.previous === 'string' ? raw.previous : null,
      reconciliation: Array.isArray(raw.reconciliation)
        ? raw.reconciliation.filter(
            (entry) => isObject(entry) && typeof entry.record === 'string'
          )
        : [],
      summary: raw.summary ?? '',
    });
  }
  const pages = new Map();
  for (const path of grepFiles(
    root,
    ['-l', '-E', '^verdict:'],
    ['docs/plans/*.md']
  )
    .split('\n')
    .filter(Boolean)) {
    const page = pageOf(path, read(root, path));
    if (page) pages.set(page.id, page);
  }
  for (const page of pages.values()) {
    for (const scope of page.scopes) {
      pushReview(scope, {
        ...page,
        scope,
        verdict: page.verdicts.get(scope) ?? null,
      });
    }
  }
  const byDate = (a, b) => a.date.localeCompare(b.date) || byId(a, b);
  for (const entries of reviews.values()) entries.sort(byDate);
  const membership = new Map();
  for (const scope of scopes.values()) {
    for (const entry of scope.members ?? []) {
      if (!membership.has(entry)) membership.set(entry, new Set());
      membership.get(entry).add(scope.id);
    }
  }
  return { root, scopes, groups, pages, reviews, membership, warnings };
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

function pageOf(path, text) {
  const meta = documentMetadata(text);
  if (!Array.isArray(meta.review_scopes) || meta.verdict === undefined) {
    return null;
  }
  const id = idOf(path);
  return {
    id,
    kind: 'review',
    path,
    date: id.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? '',
    scopes: meta.review_scopes,
    verdicts: verdictsOf(meta.review_scopes, meta.verdict),
    basis: Array.isArray(meta.review_basis) ? meta.review_basis : [],
    workKind: meta.work_kind ?? null,
    summary: leadOf(text),
    jobs: jobsOf(text),
    previous: null,
    reconciliation: [],
  };
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
const executes = (plan) =>
  ['implementation', 'workflow'].includes(plan.workKind);
const isReviewPage = (plan) => plan.verdict !== undefined;

/** Closes a Pursue when every live implementation or workflow plan naming it has landed. */
export function adoptionOf(_ledger, review, plans) {
  const executing = plans.filter(
    (plan) =>
      executes(plan) &&
      plan.scopes.includes(review.scope) &&
      (plan.path === review.path ||
        (!isReviewPage(plan) && plan.reviewBasis.includes(review.id)))
  );
  if (!executing.length) return null;
  const live = executing.filter(
    (plan) => plan.landed || plan.conflict || stateOf(plan.status) !== 'done'
  );
  return live.length && live.every((plan) => plan.landed)
    ? { id: live[0].path }
    : null;
}

export function associationOf(root, _ledger, path) {
  const text = read(root, path);
  const meta = documentMetadata(text);
  if (
    !['review_scopes', 'review_basis', 'work_kind'].some((key) =>
      Object.hasOwn(meta, key)
    )
  ) {
    return null;
  }
  return {
    path,
    scopes: Array.isArray(meta.review_scopes) ? meta.review_scopes : [],
    reviewBasis: Array.isArray(meta.review_basis) ? meta.review_basis : [],
    workKind: meta.work_kind ?? null,
    ...(meta.verdict === undefined ? {} : { verdict: meta.verdict }),
    ...planStatus(text),
  };
}

/** Plans under `docs/plans/*.md` that declare `review_scopes` front matter. */
export function plansOf(root, ledger) {
  return grepFiles(root, ['-l', '-E', '^review_scopes:'], ['docs/plans/*.md'])
    .split('\n')
    .filter((path) => path && existsSync(join(root, path)))
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

/** Counts a plan as landed only when every status label is a landed word. */
export function planStatus(text) {
  const labels = planLabels(text);
  const verdicts = new Set(labels.map((label) => landed(label)));
  return {
    status: labels[0] ?? '',
    landed: verdicts.size === 1 && verdicts.has(true),
    ...(verdicts.size > 1 ? { conflict: labels } : {}),
  };
}

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

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function incomingOpenWorkByScope(root, ledger) {
  const topicsDir = join(root, 'docs/plans/topics');
  const byScope = new Map([...ledger.scopes.keys()].map((id) => [id, []]));
  if (!existsSync(topicsDir)) return byScope;
  const patterns = [...ledger.scopes.keys()].map((id) => {
    const escaped = escapeRegex(id);
    return [
      id,
      new RegExp(
        `(?:^\\s*\`?${escaped}\`?(?:'s\\b|\\s*(?:[.,;]|$))|` +
          `\\b(?:verdict|topics/)\\s*\`?${escaped}\`?(?![a-z0-9-])|` +
          `\\b${escaped}\\.md\\b|` +
          `(?<![a-z0-9-])\`?${escaped}\`?(?:'s)?\\s+(?:and\\s+\`?[a-z0-9-]+\`?\\s+)?(?:scope|subject|review|verdict)s?\\b|` +
          `\\band\\s+\`?${escaped}\`?\\s+(?:scope|subject|review|verdict)s?\\b)`,
        'i'
      ),
    ];
  });
  for (const file of readdirSync(topicsDir)
    .filter((name) => name.endsWith('.md'))
    .sort()) {
    const fromId = file.slice(0, -3);
    const open = sectionOf(
      readFileSync(join(topicsDir, file), 'utf-8'),
      'Open work'
    );
    if (!open) continue;
    const from = `docs/plans/topics/${file}`;
    for (const raw of open.split(/\r?\n/)) {
      const line = raw.trim();
      if (!/^(?:[-*]|\d+\.)\s+/.test(line)) continue;
      const match = /\bowner:\s*(.+?)(?=\s+\bstop:|$)/i.exec(line);
      if (!match) continue;
      const text = line.replace(/^(?:[-*]|\d+\.)\s+/, '');
      for (const [id, pattern] of patterns) {
        if (id !== fromId && pattern.test(match[1])) {
          byScope.get(id).push({ from, text });
        }
      }
    }
  }
  return byScope;
}

const entriesOf = (scope) => [
  ...(scope.owners ?? []),
  ...(scope.members ?? []),
  ...(scope.consumers ?? []),
  ...(scope.proof ?? []),
  ...(scope.evidenceInputs ?? []),
];

function compact(ledger, tree, plans, scope, incoming) {
  const head = latest(headsOf(ledger, scope.id));
  const scopePlans = plans.filter((plan) => plan.scopes.includes(scope.id));
  return {
    id: scope.id,
    title: scope.title,
    question: scope.question,
    ...(scope.group ? { group: scope.group } : {}),
    open: openState(ledger, scope.id, plans),
    head: head
      ? {
          id: head.id,
          date: head.date,
          verdict: head.verdict,
          summary: clip(head.summary),
        }
      : null,
    plans: bounded(
      scopePlans.map((plan) => ({
        path: plan.path,
        status: plan.status,
        reviewBasis: plan.reviewBasis,
      })),
      5
    ),
    incomingOpenWork: bounded(incoming?.get(scope.id) ?? [], 10),
    related: (scope.relatedScopes ?? []).map((id) => ({
      id,
      verdict: latest(headsOf(ledger, id))?.verdict ?? null,
      open: openState(ledger, id, plans).open,
    })),
    subject: existsSync(join(tree.root, subjectOf(scope.id)))
      ? subjectOf(scope.id)
      : null,
    scopeFile: `${scopesDir}/${scope.id}.json`,
    detail: `node tooling/scripts/review-ledger.mjs lookup ${scope.id} --detail`,
  };
}

function detailed(ledger, tree, plans, scope, incoming) {
  return {
    ...compact(ledger, tree, plans, scope, incoming),
    scope,
    history: (ledger.reviews.get(scope.id) ?? []).map(
      ({ id, kind, date, verdict, path, summary }) => ({
        id,
        kind,
        date,
        verdict,
        ...(path ? { path } : {}),
        summary,
      })
    ),
    plans: plans.filter((plan) => plan.scopes.includes(scope.id)),
    incomingOpenWork: incoming?.get(scope.id) ?? [],
  };
}

const lookupLimit = 10;

/** The ledger, visible tree, plans and incoming handoffs shared across lookups. */
export function lookupContext(root) {
  const ledger = loadLedger(root);
  return {
    ledger,
    tree: visibleTree(root),
    plans: plansOf(root, ledger),
    incoming: incomingOpenWorkByScope(root, ledger),
  };
}

export const lookup = (root, query, options) =>
  lookupIn(lookupContext(root), query, options);

export function lookupIn(
  { ledger, tree, plans, incoming },
  query,
  { detail = false } = {}
) {
  assert.ok(isText(query), 'Supply a scope, group, path or search term');
  const needle = query.toLowerCase();
  const scopes = [...ledger.scopes.values()].sort(byId);
  const matchesAny = (texts) =>
    texts.some((text) => text.toLowerCase().includes(needle));
  const path = query.replace(/^\.\//, '');
  const pathLike = path.includes('/') && !path.includes(' ');
  const steps = [
    () => (ledger.scopes.has(needle) ? [ledger.scopes.get(needle)] : []),
    () => scopes.filter((scope) => scope.group === needle),
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
        matchesAny([scope.id, scope.title, scope.question])
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
      .map(([id, items]) => `${id} (${items.length})`);
    throw new Error(
      `No scope owns ${path}.${counts.length ? ` Files beside it belong to: ${counts.join(', ')}.` : ''} Add it to "members" in ${scopesDir}/<scope>.json.`
    );
  }
  assert.ok(matched.length, `No scope, group or path matches: ${query}`);
  const shown = matched
    .slice(0, lookupLimit)
    .map((scope) =>
      detail
        ? detailed(ledger, tree, plans, scope, incoming)
        : compact(ledger, tree, plans, scope, incoming)
    );
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
    due: dueScopes(root, ledger, plans).length,
    open: [...states]
      .filter(([, state]) => state.open)
      .map(([id, state]) => ({
        id,
        open: state.open,
        verdict: latest(headsOf(ledger, id))?.verdict ?? null,
      })),
    ...(ledger.warnings.length ? { warnings: ledger.warnings } : {}),
  };
}

const configOf = (root, ledger) =>
  readJson(root, '.agents/pstack.json', ledger.warnings, {});

const runningPlans = (plans) =>
  plans.filter((plan) =>
    ['active', 'held', 'planning'].includes(stateOf(plan.status))
  );

const dueSteps = {
  closed: (scope) => ({
    title: `Pick the next step for ${scope.title}`,
    kind: 'decide',
    finding: `The audit pass has not reached the ${scope.id} scope: no review has ranked its jobs against other editors. Run verdict ${scope.id} with the Verdict playbook's Next step, as its Audit pass section says.`,
  }),
  unreviewed: (scope) => ({
    title: `Review ${scope.title}`,
    kind: 'decide',
    finding: `Nobody has reviewed the ${scope.id} scope yet, so the audit pass has not reached it. Run verdict ${scope.id} with the Verdict playbook's Next step, as its Audit pass section says.`,
  }),
};

const under = (path, dirs = []) =>
  dirs.some(
    (dir) =>
      path === dir.replace(/\/$/, '') ||
      path.startsWith(dir.endsWith('/') ? dir : `${dir}/`)
  );

function tierAt(tiers, { id, writes }) {
  const hit = tiers.findIndex(
    (tier) =>
      writes.some(
        (path) => under(path, tier.paths) && !under(path, tier.except)
      ) || (tier.scopes ?? []).includes(id)
  );
  if (hit !== -1) return hit;
  const fallback = tiers.findIndex(
    (tier) =>
      !(tier.paths?.length || tier.scopes?.length || tier.checks?.length)
  );
  return fallback === -1 ? tiers.length : fallback;
}

const leadScope = (page) => page.scopes[0];

function passStart(root, ledger) {
  const since = configOf(root, ledger).audit?.since;
  if (since === undefined) return Number.NEGATIVE_INFINITY;
  const at = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?Z)?$/.test(
    since
  )
    ? Date.parse(since)
    : Number.NaN;
  assert.ok(
    !Number.isNaN(at) &&
      new Date(at).toISOString().startsWith(since.slice(0, 10)),
    `audit.since in .agents/pstack.json is ${JSON.stringify(since)}, which is no UTC time. Write it as 2026-11-14T09:30:00Z, or as 2026-11-14 for the start of that day.`
  );
  return at;
}

const logOf = (page) => page.path?.replace(/\.md$/, '.decisions.tsv');

function firstRowAt(log, date) {
  const first = log
    ? Date.parse(log.split('\n')[1]?.split('\t')[0])
    : Number.NaN;
  return Number.isNaN(first) ? Date.parse(`${date}T00:00:00Z`) : first;
}

function beganAt(root, page) {
  const log = logOf(page);
  return firstRowAt(
    log && existsSync(join(root, log)) ? read(root, log) : null,
    page.date
  );
}

function pagesLandedSinceFork(root) {
  const pageGit = isSplit(root)
    ? (args) => privateGit(root, args).stdout
    : (args) => git(root, args) ?? '';
  const at = (path) => pageGit(['show', `${UPSTREAM}:${path}`]);
  return pageGit([
    'diff',
    '--name-only',
    '-z',
    '--no-renames',
    '--diff-filter=AM',
    `HEAD...${UPSTREAM}`,
    '--',
    'docs/plans',
  ])
    .split('\0')
    .filter((path) => path.endsWith('.md'))
    .flatMap((path) => {
      const page = pageOf(path, at(path));
      return page
        ? [{ page, began: firstRowAt(at(logOf(page)), page.date) }]
        : [];
    });
}

function dueScopes(root, ledger, plans) {
  const start = passStart(root, ledger);
  const counted = [
    ...[...ledger.pages.values()].map((page) => ({
      page,
      began: beganAt(root, page),
    })),
    ...pagesLandedSinceFork(root),
  ]
    .filter(
      ({ page, began }) =>
        ['ranked', 'unread'].includes(page.jobs) && began >= start
    )
    .map(({ page }) => page);
  const ranked = new Set(
    counted.filter((page) => page.jobs === 'ranked').map(leadScope)
  );
  return [...ledger.scopes.values()].flatMap((scope) => {
    const open = openState(ledger, scope.id, plans).open ?? 'closed';
    const unread = counted
      .filter((page) => page.jobs === 'unread' && leadScope(page) === scope.id)
      .map((page) => page.path);
    return dueSteps[open] && !ranked.has(scope.id)
      ? [{ scope, open, unread }]
      : [];
  });
}

const idleLimit = 7 * 86_400_000;

function changesSince(root, paths, head) {
  const began = head ? beganAt(root, head) : Number.NaN;
  if (!paths.length || Number.isNaN(began)) return 0;
  const count = [
    'rev-list',
    '--count',
    `--since=${Math.floor(began / 1000)}`,
    'HEAD',
    '--',
    ...paths,
  ];
  return [
    git(root, count),
    isSplit(root) ? privateGit(root, count).stdout : null,
  ].reduce((sum, out) => sum + Number(out?.trim() || 0), 0);
}

const DEFAULT_DEFERRED = ['collaboration'];
const DEFAULT_TIERS = [
  {
    name: 'plite core',
    paths: ['packages/plitejs/src/'],
    except: [
      'packages/plitejs/src/authored/',
      'packages/plitejs/src/diff/',
      'packages/plitejs/src/pagination/',
      'packages/plitejs/src/yjs/',
    ],
  },
  {
    name: 'plate core',
    paths: ['packages/platejs/src/'],
    except: [
      'packages/platejs/src/ai/',
      'packages/platejs/src/authored/',
      'packages/platejs/src/code-block/',
      'packages/platejs/src/diff/',
      'packages/platejs/src/docx/',
      'packages/platejs/src/excalidraw/',
      'packages/platejs/src/features/',
      'packages/platejs/src/math/',
      'packages/platejs/src/pagination/',
      'packages/platejs/src/react/features/field/',
      'packages/platejs/src/react/features/lock/',
      'packages/platejs/src/yjs/',
    ],
  },
  { name: 'feature' },
  { name: 'suggestions', scopes: ['suggestions'] },
  {
    name: 'experimental',
    scopes: [
      'authored',
      'diff',
      'documents',
      'fields',
      'ink',
      'lock',
      'pagination',
    ],
    paths: [
      'packages/plitejs/src/authored/',
      'packages/plitejs/src/diff/',
      'packages/plitejs/src/pagination/',
      'packages/platejs/src/authored/',
      'packages/platejs/src/diff/',
      'packages/platejs/src/features/field/',
      'packages/platejs/src/features/lock/',
      'packages/platejs/src/pagination/',
      'packages/platejs/src/react/features/field/',
      'packages/platejs/src/react/features/lock/',
    ],
  },
  { name: 'ai', scopes: ['ai'], paths: ['packages/platejs/src/ai/'] },
];

/** Returns the newest commit or decision-log timestamp (ms) for a plan path, or null. */
export function planActiveAt(root, given) {
  const plan = isAbsolute(given) ? relative(root, given) : given;
  const log = plan.replace(/\.md$/u, '.decisions.tsv');
  const paths = [plan, log];
  const ref =
    readJson(root, '.agents/pstack.json', null, {})?.delivery === 'trunk'
      ? UPSTREAM
      : 'HEAD';
  const commitMs = (out) => Number(out?.trim() || 0) * 1000 || 0;
  const pub = commitMs(
    git(root, ['log', '-1', '--format=%ct', ref, '--', ...paths])
  );
  const priv = isSplit(root)
    ? commitMs(
        privateGit(root, ['log', '-1', '--format=%ct', ref, '--', ...paths])
          .stdout
      )
    : 0;
  const logPath = join(root, log);
  const rowAt = existsSync(logPath)
    ? Date.parse(
        (
          readFileSync(logPath, 'utf-8').trimEnd().split('\n').at(-1) ?? ''
        ).split('\t')[0]
      ) || 0
    : 0;
  return Math.max(0, pub, priv, rowAt) || null;
}

/** The scopes the audit pass has not reached, ordered by tier and recent owner commits. */
export function due(root, { activeAt = () => null, now = Date.now() } = {}) {
  const ledger = loadLedger(root);
  const plans = plansOf(root, ledger);
  const config = configOf(root, ledger);
  const hasExplicit = config.audit?.tiers !== undefined;
  const tiers = config.audit?.tiers ?? (config.triage ? DEFAULT_TIERS : []);
  const deferred =
    config.audit?.deferred ??
    (hasExplicit || !config.triage ? [] : DEFAULT_DEFERRED);
  const scopes = dueScopes(root, ledger, plans);
  const reached = new Set(scopes.map(({ scope }) => scope.id));
  const running = runningPlans(plans).filter((plan) =>
    plan.scopes.some((id) => reached.has(id))
  );
  const idle = running.filter((plan) => {
    const at = activeAt(plan.path);
    return at !== null && now - at > idleLimit && !waitsOnOwner(plan.status);
  });
  const live = running.filter((plan) => !idle.includes(plan));
  return scopes
    .map(({ scope, open, unread }) => {
      const step = dueSteps[open]({
        id: scope.id,
        title: scope.title ?? scope.id,
      });
      const led = idle
        .filter((plan) => plan.scopes[0] === scope.id)
        .map((plan) => plan.path);
      const notes = [
        unread.length
          ? `The ledger does not count the Jobs table in ${unread.join(', ')}, because the table has no row, sits inside a code fence or follows a line of HTML. Read that page first, and when it already ranks the scope's jobs, move its table to plain lines under the Jobs heading instead of judging the scope again.`
          : '',
        led.length
          ? `Each of these plans names the scope first and has had no commit or decision log row for a week, so it does not resume, and this verdict decides what becomes of it: ${led.join(', ')}.`
          : '',
      ];
      const item = {
        id: scope.id,
        ...step,
        finding: [step.finding, ...notes].filter(Boolean).join(' '),
        writes: [
          subjectOf(scope.id),
          ...(scope.owners ?? []).map((path) => path.replace(/\/$/, '')),
          ...led,
        ],
        topic: `review-${scope.id}`,
        waits: live
          .filter((plan) => plan.scopes.includes(scope.id))
          .map((plan) => `run:${plan.path}`),
      };
      const at = tierAt(tiers, item);
      const head = latest(headsOf(ledger, scope.id));
      return {
        item: {
          ...item,
          tier: tiers[at]?.name ?? 'other',
          changes: changesSince(root, scope.owners ?? [], head),
        },
        deferred: Number(deferred.includes(scope.id)),
        at,
        date: head?.date ?? '',
      };
    })
    .sort(
      (a, b) =>
        a.deferred - b.deferred ||
        a.at - b.at ||
        b.item.changes - a.item.changes ||
        byCodeUnit(a.date, b.date) ||
        byCodeUnit(a.item.id, b.item.id)
    )
    .map(({ item }) => item);
}

/** Markdown summary of all scopes, or one scope's review history and ownership. */
export function show(root, scopeId) {
  const ledger = loadLedger(root);
  const plans = plansOf(root, ledger);
  if (!scopeId) {
    const rows = [...ledger.scopes.values()]
      .sort(byId)
      .map(
        (scope) =>
          `| ${scope.id} | ${scope.title} | ${openState(ledger, scope.id, plans).open ?? 'closed'} |`
      );
    return `${['# Review scopes', '', '| Scope | Review | Open state |', '| --- | --- | --- |', ...rows].join('\n')}\n`;
  }
  const scope = ledger.scopes.get(scopeId);
  assert.ok(scope, `Unknown scope: ${scopeId}`);
  const state = openState(ledger, scope.id, plans);
  const history = [...(ledger.reviews.get(scope.id) ?? [])].sort(
    (a, b) => b.date.localeCompare(a.date) || byId(b, a)
  );
  const scopePlans = plans.filter((plan) => plan.scopes.includes(scope.id));
  const lines = [
    `# ${scope.title}`,
    '',
    `Question: ${scope.question}`,
    '',
    `Open state: **${state.open ?? `closed by ${state.by}`}**.`,
    '',
    '## History, newest first',
    '',
    ...history.flatMap((record) => [
      `### ${record.date}: ${record.id}`,
      '',
      `${record.kind}; ${record.verdict ?? 'no verdict'}.`,
      '',
      record.summary,
      ...(record.path ? ['', `Page: ${record.path}`] : []),
      '',
    ]),
    '## Plans',
    '',
    ...(scopePlans.length
      ? scopePlans.map(
          (plan) =>
            `- ${plan.path}: ${plan.status || 'no status'}; ${plan.workKind ?? 'no work kind'}; basis ${list(plan.reviewBasis)}`
        )
      : ['None associated.']),
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
    '',
  ];
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
  const tree = visibleTree(root);
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

function git(root, args) {
  try {
    return execFileSync(
      'git',
      ['-C', root, '-c', 'core.quotePath=false', ...args],
      {
        encoding: 'utf-8',
        env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
        maxBuffer: 1 << 28,
        stdio: ['ignore', 'pipe', 'ignore'],
      }
    );
  } catch {
    return null;
  }
}

function assertScope(tree, ledger, scope) {
  for (const field of ['title', 'question']) {
    assert.ok(isText(scope[field]), `Missing ${field}`);
  }
  for (const path of entriesOf(scope)) {
    repoPath(path);
    assert.equal(
      entryOf(tree, path),
      path,
      `A directory entry ends with "/": ${path}`
    );
  }
  assert.ok(
    scope.owners?.length ||
      scope.members?.length ||
      scope.consumers?.length ||
      scope.evidenceInputs?.length,
    'A scope names owners, members, consumers or evidence inputs'
  );
  assert.ok(
    scope.proof?.length || isText(scope.gaps),
    'An empty proof list needs gaps saying why'
  );
  for (const id of [
    ...(scope.dependsOn ?? []),
    ...(scope.relatedScopes ?? []),
  ]) {
    assert.ok(id !== scope.id && ledger.scopes.has(id), `Unknown scope: ${id}`);
  }
  if (scope.dependsOn?.length) {
    assert.ok(
      isText(scope.prerequisiteReason),
      'dependsOn needs prerequisiteReason'
    );
  }
  if (scope.group) {
    assert.ok(ledger.groups.has(scope.group), `Unknown group: ${scope.group}`);
  }
}

/** Validates scope JSON structure, group definitions, forks, and reports unowned/dangling paths. */
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
  const tree = visibleTree(root);
  for (const scope of ledger.scopes.values()) {
    attempt(`${scopesDir}/${scope.id}.json`, () =>
      assertScope(tree, ledger, scope)
    );
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
  for (const id of ledger.scopes.keys()) {
    const heads = headsOf(ledger, id);
    if (heads.length > 1) {
      (heads.some((head) => head.path) ? errors : warnings).push(
        `Fork in ${id}: ${heads.map((head) => head.id).join(', ')}`
      );
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
    pages: ledger.pages.size,
    ...(warnings.length ? { warnings } : {}),
  };
}

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

const fenceOpen = /^ {0,3}(?:(`{3,})[^`]*|(~{3,}).*)$/;
const fenceClose = (mark) =>
  new RegExp(`^ {0,3}${mark[0]}{${mark.length},}[ \\t]*$`);

const unfenced = (text) => {
  let close = null;
  return text
    .split(/\r?\n/)
    .filter((line) => {
      if (close) {
        if (close.test(line)) close = null;
        return false;
      }
      const [, ticks, tildes] = fenceOpen.exec(line) ?? [];
      const mark = ticks ?? tildes;
      if (mark) close = fenceClose(mark);
      return !mark;
    })
    .join('\n');
};

const htmlLine = /^ {0,3}</;
const threePipeLines = /(?:^ {0,3}\|.*(?:\n|$)){3}/m;

function jobsOf(text) {
  const jobsIn = (page) =>
    sectionOf(sectionOf(page, 'Evidence'), 'Jobs', '###');
  const lines = unfenced(text).split('\n');
  const html = lines.findIndex((line) => htmlLine.test(line));
  const aboveHtml = (html === -1 ? lines : lines.slice(0, html)).join('\n');
  if (threePipeLines.test(jobsIn(aboveHtml))) return 'ranked';
  return /^\s*\|/m.test(jobsIn(text)) ? 'unread' : 'none';
}

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

const unquote = (value) => value.trim().replace(/^(['"])(.*)\1$/, '$2');
const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;
const reviewKeys = ['review_scopes', 'review_basis', 'work_kind', 'verdict'];

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
    if (key === 'work_kind') {
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
  'Usage: node tooling/scripts/review-ledger.mjs status|due|lookup <scope|group|path|term> [--detail]|show [scope]|coverage [prefix]|check|research <term>';

export function main(root, args) {
  const [command, argument] = args;
  if (command === '--help' || command === '-h') return `${usage}\n`;
  if (command === 'status') return status(root);
  if (command === 'due') {
    return due(root, { activeAt: (path) => planActiveAt(root, path) });
  }
  if (command === 'lookup') {
    return lookup(root, argument, { detail: args.includes('--detail') });
  }
  if (command === 'show') return show(root, argument);
  if (command === 'coverage') return coverage(root, { prefix: argument ?? '' });
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
