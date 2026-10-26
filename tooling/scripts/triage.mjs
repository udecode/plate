#!/usr/bin/env node
// Keeps the triage register, docs/triage/issues.tsv: one row per triage call on
// an issue of the triage repository, with the commit and issue text it read and
// the GitHub account, model and effort that wrote it. Every state is derived at
// read time from fresh reads of the trunk branch, the suggested-task ledger and
// GitHub.
// Usage: pnpm triage claim <N>... [--take <hold>,... --why "<owner's words>"] [--drives <device>] [--session <id>]
//        pnpm triage claim --domain <scope> [--task <id>] [same flags]
//        pnpm triage claim --task <id> [same flags]
//        pnpm triage claim --next [--drives <device>] [--session <id>]
//        pnpm triage release <N>... --why "<reason>" [--session <id>]
//        pnpm triage lane [<device>]
//        pnpm triage show <N>... [--brief] [--json]
//        pnpm triage queue [--label <label>] [--json]
//        pnpm triage record <N> --outcome <outcome> --detail <detail> --seen <fingerprint> --why <why> [--dry-run]
//        pnpm triage record --from <batch.tsv> [--dry-run]
//        pnpm triage mark <draft.md>
//        pnpm triage labels
//        pnpm triage check [<register>]

import { execFileSync, spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { appendFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { EFFORTS, findLead, leadLabel } from '../../.agents/pstack/lead.mjs';
import {
  board,
  boardState,
  gitMerges,
  LEDGER,
  LEDGER_REF,
  ledgerPath,
  newId,
  readTasks,
  SESSION,
} from '../../.agents/pstack/tasks.mjs';
import {
  CLAIM_COLUMNS,
  CLAIMS_FILE,
  CLAIMS_REF,
  claimLine,
  COMMENT_WINDOW_MS,
  decide,
  decideNext,
  DEVICES,
  domainsOf,
  devicesOf,
  foldClaims,
  laneOf,
  ownerFiles,
  parseClaims,
  sameActor,
  STALE_MS,
  targetMembers,
} from './triage-claims.mjs';

const REGISTER = 'docs/triage/issues.tsv';
const CONFIG = '.agents/pstack.json';
const COLUMNS = [
  'id',
  'ts',
  'issue',
  'outcome',
  'detail',
  'read',
  'seen',
  'rev',
  'by',
  'who',
  'prev',
  'why',
];
const BATCH_COLUMNS = ['issue', 'outcome', 'detail', 'seen', 'why'];
// A private copy, so this helper never moves the ref setup.mjs syncs the ledger file with.
const LEDGER_COPY = 'refs/pstack/triage-ledger';
const GH_FIELDS = 'number,title,body,state,comments,labels,issueType,author';
const GRAPHQL_BATCH = 50;
const PRIORITY_FIELD = 'Priority';
const PRIORITY_ORDER = ['P0', 'P1', 'P2', 'P3'];
const SCOPE_FIELD = 'Scope';
const SCOPES = 'docs/research/review-scopes';
const OUTCOME_LABELS = {
  dup: 'duplicate',
  'needs-repro': 'needs reproduction',
};
const OUTCOME_TYPES = { kind: 'Bug', spec: 'Feature' };
const QUEUE_LIMIT = 5000;
// A triage draft ends in a marker holding the hash of its own text, so posting it unchanged keeps its record current and editing it does not.
const DRAFT_MARK = /\n*<!-- triage:([0-9a-f]{12}) -->\s*$/u;
const TEAM = new Set(['OWNER', 'MEMBER', 'COLLABORATOR']);
// A reader that cuts long lines, as Claude Code's Read once did at 2,000 characters, would hide part of a line from record.
const LINE_LIMIT = 400;
// gh prints a bot comment's author without its [bot] suffix.
const BOTS = new Set(['dosubot', 'github-actions', 'copilot', 'claude']);
const RUNTIMES = new Set(['claude', 'codex']);
const STATE_ORDER = [
  'conflict',
  'stale',
  'unchecked',
  'untriaged',
  'unconfirmed',
  'current',
];

const PATH_REF = /^[^\s:,;]+(?::\d+(?:-\d+)?)?$/u;
const ISSUE = /^[1-9]\d*$/u;
const LOGIN = /^[A-Za-z\d](?:[A-Za-z\d-]{0,38})$/u;
const paths = (value) => value.split(/,\s*/u);
const KEY_VALUES = {
  scope: /^[a-z][a-z0-9-]*$/u,
  priority: /^P[0-3]$/u,
  owner: (value) => paths(value).every((ref) => PATH_REF.test(ref)),
  cause: /^(?:read|inferred)$/u,
  miss: /\S/u,
  moved: /\S/u,
  device: (value) => paths(value).every((device) => DEVICES.includes(device)),
  of: ISSUE,
  commit: /^[0-9a-f]{7,40}$/u,
  proof: /\S/u,
  retest: /\S/u,
  missing: /\S/u,
  law: PATH_REF,
  into: (value) =>
    paths(value).length >= 2 && paths(value).every((part) => ISSUE.test(part)),
  question: /\S/u,
};
const OUTCOMES = {
  kind: {
    required: ['scope', 'priority', 'owner', 'cause'],
    optional: ['miss', 'moved', 'device'],
  },
  dup: { required: ['of'], optional: [] },
  fixed: { required: ['commit', 'owner', 'proof'], optional: ['retest'] },
  'needs-repro': { required: ['missing'], optional: [] },
  'not-bug': { required: ['law'], optional: [] },
  split: { required: ['into'], optional: [] },
  spec: { required: ['question'], optional: ['law'] },
};
const ROW_SHAPE = {
  ts: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u,
  issue: ISSUE,
  read: /^[0-9a-f]{40}$/u,
  seen: /^[0-9a-f]{16}$/u,
  rev: /^[1-9]\d*$/u,
  by: new RegExp(`^\\S+ @(?:${EFFORTS.join('|')})$`, 'u'),
  who: LOGIN,
  why: /\S/u,
};

class RefusalError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RefusalError';
  }
}
const refuse = (message) => {
  throw new RefusalError(message);
};
class UsageError extends RefusalError {
  constructor(message) {
    super(message);
    this.name = 'UsageError';
  }
}
const usage = (message) => {
  throw new UsageError(message);
};

const root = (() => {
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf-8',
  });
  return result.status === 0 ? result.stdout.trim() : process.cwd();
})();

const run = (command, args, options = {}) =>
  spawnSync(command, args, {
    cwd: root,
    encoding: 'utf-8',
    maxBuffer: 256 * 1024 * 1024,
    ...options,
  });
const gitOut = (...args) => {
  const result = run('git', args);
  return result.status === 0 ? result.stdout : null;
};
const NETWORK_MS = 60_000;
const fetchRef = (remote, refspec) => {
  const result = run('git', ['fetch', '--quiet', remote, refspec], {
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    timeout: NETWORK_MS,
  });
  if (result.status === 0) return null;
  if (result.error?.code === 'ETIMEDOUT') {
    return {
      timedOut: true,
      message: `git fetch gave no answer in ${NETWORK_MS / 1000} s`,
    };
  }
  return {
    timedOut: false,
    message:
      result.stderr.trim().split('\n')[0] ||
      `git fetch exited ${result.status}`,
  };
};

const readJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};
const readLines = (path) =>
  readFileSync(path, 'utf-8').split('\n').map(readJson).filter(Boolean);
const localConfig = () =>
  existsSync(join(root, CONFIG))
    ? readJson(readFileSync(join(root, CONFIG), 'utf-8'))
    : null;

const rank = (effort) => EFFORTS.indexOf(effort);
const parseLabel = (label) => {
  const match = /^(\S+) @(\S+)$/u.exec(label ?? '');
  return match ? { model: match[1], effort: match[2] } : null;
};
const meets = (model, effort, floor, max = null) =>
  rank(effort) !== -1 &&
  floor.some(
    (entry) =>
      model.startsWith(entry.model) &&
      rank(effort) >= rank(entry.effort) &&
      (max === null || rank(effort) <= rank(max))
  );

function policyProblems(config) {
  const policy = config?.triage;
  if (!policy) {
    return [`${CONFIG} has no triage key with repo, floor, owners and rev`];
  }
  const found = [];
  if (!/^[\w.-]+\/[\w.-]+$/u.test(policy.repo ?? '')) {
    found.push(`${CONFIG}: triage.repo names the repository as owner/name`);
  }
  if (!Array.isArray(policy.floor) || policy.floor.length === 0) {
    found.push(
      `${CONFIG}: triage.floor lists at least one "<model prefix> @<effort>"`
    );
  }
  for (const entry of Array.isArray(policy.floor) ? policy.floor : []) {
    const parsed = parseLabel(entry);
    if (!parsed || rank(parsed.effort) === -1) {
      found.push(
        `${CONFIG}: triage.floor entry ${JSON.stringify(entry)} is not "<model prefix> @<effort>" with an effort of ${EFFORTS.join(', ')}`
      );
    } else if (
      config.maxEffort &&
      rank(parsed.effort) > rank(config.maxEffort)
    ) {
      found.push(
        `${CONFIG}: triage.floor entry ${entry} is above maxEffort ${config.maxEffort}, so no session could record`
      );
    }
  }
  if (!Array.isArray(policy.owners) || policy.owners.length === 0) {
    found.push(`${CONFIG}: triage.owners lists at least one GitHub login`);
  }
  for (const entry of Array.isArray(policy.owners) ? policy.owners : []) {
    if (typeof entry !== 'string' || !LOGIN.test(entry)) {
      found.push(
        `${CONFIG}: triage.owners entry ${JSON.stringify(entry)} is not a GitHub login`
      );
    }
  }
  if (!Number.isInteger(policy.rev) || policy.rev < 1) {
    found.push(`${CONFIG}: triage.rev is a positive integer`);
  }
  return found;
}

const policyOf = (config) => ({
  repo: config.triage.repo,
  floor: config.triage.floor.map(parseLabel),
  floorText: config.triage.floor.join(' or '),
  owners: config.triage.owners,
  ownersText: config.triage.owners.join(' or '),
  rev: config.triage.rev,
  max: config.maxEffort ?? null,
});

function parseDetail(detail) {
  const fields = new Map();
  for (const part of detail.split(/;\s*/u)) {
    const at = part.indexOf(': ');
    if (at === -1) return null;
    fields.set(part.slice(0, at), part.slice(at + 2));
  }
  return fields;
}

function detailProblems(outcome, detail) {
  const shape = OUTCOMES[outcome];
  if (!shape) {
    return [
      `outcome is one of ${Object.keys(OUTCOMES).join(', ')}, not ${JSON.stringify(outcome)}`,
    ];
  }
  const fields = parseDetail(detail);
  const keys = [...shape.required, ...shape.optional];
  if (!fields) {
    return [
      `detail is "key: value" pairs joined by "; ", such as ${shape.required.map((key) => `${key}: ...`).join('; ')}`,
    ];
  }
  const found = [];
  for (const key of shape.required) {
    if (!fields.has(key)) found.push(`a ${outcome} detail needs ${key}:`);
  }
  for (const [key, value] of fields) {
    const valid = KEY_VALUES[key];
    if (!keys.includes(key)) {
      found.push(`a ${outcome} detail takes ${keys.join(', ')}, not ${key}:`);
    } else if (
      !(typeof valid === 'function' ? valid(value) : valid.test(value))
    ) {
      found.push(`${key}: ${JSON.stringify(value)} is not a valid value`);
    }
  }
  return found;
}

const parseRow = (line) => {
  const cells = line.split('\t');
  const row = Object.fromEntries(
    COLUMNS.map((column, index) => [column, cells[index] ?? ''])
  );
  return {
    ...row,
    cells,
    prevIds: row.prev === 'none' ? [] : row.prev.split(','),
  };
};
const parseRows = (text) =>
  text
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('id\t'))
    .map(parseRow);

function registerProblems(text, where) {
  const lines = text.split('\n');
  if (lines[0] !== COLUMNS.join('\t')) {
    return [`${where}:1: the header is ${COLUMNS.join(' ')}, tab-separated`];
  }
  const found = [];
  const ids = new Map();
  const rows = [];
  lines.slice(1).forEach((line, index) => {
    if (!line) return;
    const at = `${where}:${index + 2}`;
    const row = parseRow(line);
    if (row.cells.length !== COLUMNS.length) {
      found.push(
        `${at}: a row has ${row.cells.length} tab-separated cells, not ${COLUMNS.length}`
      );
      return;
    }
    for (const [column, shape] of Object.entries(ROW_SHAPE)) {
      if (!shape.test(row[column])) {
        found.push(
          `${at}: ${column} ${JSON.stringify(row[column])} is malformed`
        );
      }
    }
    const idStart = `${row.issue}-${row.ts}-`;
    if (
      !row.id.startsWith(idStart) ||
      !/^[0-9a-f]{6}$/u.test(row.id.slice(idStart.length))
    ) {
      found.push(`${at}: id is <issue>-<ts>-<6 hex>, starting ${idStart}`);
    }
    if (ids.has(row.id)) {
      found.push(`${at}: id ${row.id} repeats line ${ids.get(row.id)}`);
    }
    found.push(
      ...detailProblems(row.outcome, row.detail).map(
        (problem) => `${at}: ${problem}`
      )
    );
    ids.set(row.id, index + 2);
    rows.push({ at, row });
  });
  // A merge, unlike land.mjs's rebase, can put a row above the row its prev names.
  for (const { at, row } of rows) {
    for (const id of row.prevIds) {
      if (!ids.has(id)) found.push(`${at}: prev ${id} names no row`);
      else if (!id.startsWith(`${row.issue}-`)) {
        found.push(`${at}: prev ${id} is a row of another issue`);
      }
    }
  }
  return found;
}

// The canonical remote, as land.mjs picks it: a fork clone that lands through PRs reads upstream.
const canonicalRemote = () => {
  const push =
    run('git', ['config', '--get', 'pstack.delivery']).stdout.trim() === 'push';
  return !push && run('git', ['remote', 'get-url', 'upstream']).status === 0
    ? 'upstream'
    : 'origin';
};

// With fallback, a failed fetch reads the refs fetched last, so a read-only seat still sees the records, all unchecked.
function freshReads({ fallback, claims = false }) {
  const branch = localConfig()?.branch ?? 'main';
  const remote = canonicalRemote();
  const tipRef = `refs/remotes/${remote}/${branch}`;
  const notes = [];
  const cached = [];
  const fetchError = fetchRef(remote, `+refs/heads/${branch}:${tipRef}`);
  const fetched = fetchError === null;
  const failure = fetched ? '' : ` (${fetchError.message})`;
  if (!fetched) notes.push(`could not fetch ${remote}/${branch}${failure}`);
  const tip =
    fetched || fallback
      ? gitOut(
          'rev-parse',
          '--verify',
          '--quiet',
          `${tipRef}^{commit}`
        )?.trim() || null
      : null;
  if (!fetched && tip) {
    notes.push(
      `read ${remote}/${branch} as fetched last, at ${tip.slice(0, 10)}`
    );
    cached.push(`${remote}/${branch}`);
  }
  const config = tip
    ? readJson(gitOut('show', `${tip}:${CONFIG}`) ?? '')
    : null;
  const problems = tip
    ? policyProblems(config)
    : [`${remote}/${branch} could not be read${failure}`];
  const policy = problems.length === 0 ? policyOf(config) : null;

  const rows = new Map();
  const landed = new Map();
  const add = (into, row) => {
    if (!into.has(row.issue)) into.set(row.issue, new Map());
    into.get(row.issue).set(row.id, row);
  };
  if (tip) {
    for (const row of parseRows(gitOut('show', `${tip}:${REGISTER}`) ?? '')) {
      add(rows, row);
      add(landed, row);
    }
  }
  const workTree = join(root, REGISTER);
  if (existsSync(workTree)) {
    for (const row of parseRows(readFileSync(workTree, 'utf-8'))) {
      add(rows, row);
    }
  }

  // A second fetch from a remote that gave no answer would double the wait past a caller's two-minute timeout.
  const ledgerError = fetchError?.timedOut
    ? {
        message: `skipped, because the fetch of ${remote}/${branch} gave no answer`,
      }
    : fetchRef(remote, `+${LEDGER_REF}:${LEDGER_COPY}`);
  const ledgerFetched = ledgerError === null;
  if (!ledgerFetched) {
    notes.push(
      `could not fetch ${LEDGER_REF} from ${remote} (${ledgerError.message})`
    );
  }
  const ledgerRefs = ledgerFetched
    ? [LEDGER_COPY]
    : fallback
      ? [LEDGER_COPY, LEDGER_REF]
      : [];
  const ledgerText =
    ledgerRefs
      .map((ref) => gitOut('show', `${ref}:${LEDGER}`))
      .find((text) => text !== null) ?? null;
  if (!ledgerFetched && ledgerText !== null) cached.push(LEDGER_REF);
  const ledger =
    ledgerText === null || !policy ? null : ledgerOf(ledgerText, policy.repo);

  let claimRows = null;
  if (claims) {
    const read = fetchError?.timedOut
      ? { error: { message: 'skipped, because the fetch gave no answer' } }
      : fetchClaims(remote);
    if (read.error) {
      notes.push(
        `could not fetch ${CLAIMS_REF} from ${remote} (${read.error.message})`
      );
    }
    const text =
      read.error && fallback
        ? (gitOut('show', `${CLAIMS_REF}:${CLAIMS_FILE}`) ?? '')
        : (read.text ?? '');
    claimRows = parseClaims(text);
  }

  return {
    remote,
    branch,
    tip,
    fetched,
    cached,
    policy,
    problems,
    notes,
    rows,
    landed,
    ledger,
    claimRows,
    issues: issueReader(policy?.repo),
    stateMemo: new Map(),
  };
}

const taskIdOf = (cells) => cells[2].split(' ')[0];

const literal = (text) => text.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');

function ledgerOf(text, repo) {
  const lines = text
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('ts\t'));
  const chips = lines
    .map((line) => line.split('\t'))
    .filter((cells) => cells[1] === 'chip');
  const name = literal(repo.split('/')[1]);
  const reference = new RegExp(
    `(?:\\b${name}#|(?<![\\w/#])#|github\\.com/${literal(repo)}/issues/)(\\d+)\\b`,
    'gu'
  );
  const times = new Map();
  for (const cells of chips) {
    const id = taskIdOf(cells);
    const time = times.get(id) ?? {};
    const move = (cells[5] ?? '').split(' ')[0];
    if (move === 'started') time.started ??= cells[0];
    if (move === 'landed' || move === 'dismissed') time[move] = cells[0];
    time.last = cells[0];
    times.set(id, time);
  }
  return {
    chips,
    tasks: readTasks(lines),
    reference,
    times,
    // Every row's repro: counts because a fold replaces it, and only repro: counts because a finding's prose names unrelated issues.
    links: issueIndex(chips, reference, reproOf),
    mentions: issueIndex(chips, reference, (cells) => cells[3] ?? ''),
  };
}

const reproOf = (cells) =>
  (cells[4] ?? '')
    .split(/;\s+/u)
    .find((token) => token.startsWith('repro: ')) ?? '';

function issueIndex(chips, reference, textOf) {
  const index = new Map();
  for (const cells of chips) {
    for (const match of textOf(cells).matchAll(reference)) {
      if (!index.has(match[1])) index.set(match[1], new Set());
      index.get(match[1]).add(taskIdOf(cells));
    }
  }
  return index;
}

// An issue's last reopen id survives a later close and changes on another reopen.
function reopenIds(repo, numbers) {
  const [owner, name] = repo.split('/');
  const found = new Map();
  for (let at = 0; at < numbers.length; at += GRAPHQL_BATCH) {
    const part = numbers.slice(at, at + GRAPHQL_BATCH);
    const fields = part.map(
      (number) =>
        `i${number}: issue(number: ${number}) { timelineItems(itemTypes: [REOPENED_EVENT], last: 1) { nodes { ... on ReopenedEvent { id } } } }`
    );
    const query = `query { repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) { ${fields.join(' ')} } }`;
    const result = spawnSync('gh', ['api', 'graphql', '-f', `query=${query}`], {
      encoding: 'utf-8',
      maxBuffer: 64 * 1024 * 1024,
      timeout: NETWORK_MS,
    });
    const repository = readJson(result.stdout)?.data?.repository ?? {};
    for (const number of part) {
      const nodes = repository[`i${number}`]?.timelineItems?.nodes;
      if (Array.isArray(nodes)) {
        found.set(String(number), nodes[0]?.id ?? 'none');
      }
    }
  }
  return found;
}

// gh issue list cannot return issue fields, so the org's Priority and Scope fields and each issue's values come from GraphQL.
function fieldValues(repo, numbers) {
  const [owner, name] = repo.split('/');
  const issues = new Map();
  let fields = null;
  for (let at = 0; at < numbers.length; at += GRAPHQL_BATCH) {
    const part = numbers.slice(at, at + GRAPHQL_BATCH);
    const aliases = part.map(
      (number) =>
        `i${number}: issue(number: ${number}) { id issueFieldValues(first: 20) { nodes { ... on IssueFieldSingleSelectValue { optionId field { ... on IssueFieldSingleSelect { id } } } ... on IssueFieldMultiSelectValue { options { id } field { ... on IssueFieldMultiSelect { id } } } } } }`
    );
    const query = `query { organization(login: ${JSON.stringify(owner)}) { issueFields(first: 50) { nodes { __typename ... on IssueFieldSingleSelect { id name options { id name } } ... on IssueFieldMultiSelect { id name options { id name } } } } } repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) { ${aliases.join(' ')} } }`;
    const result = spawnSync('gh', ['api', 'graphql', '-f', `query=${query}`], {
      encoding: 'utf-8',
      maxBuffer: 64 * 1024 * 1024,
      timeout: NETWORK_MS,
    });
    const data = readJson(result.stdout)?.data;
    if (!data) {
      refuse(
        `labels could not read the ${PRIORITY_FIELD} and ${SCOPE_FIELD} fields of ${repo} issues: ${result.error?.code === 'ETIMEDOUT' ? `no answer in ${NETWORK_MS / 1000} s` : result.stderr?.trim() || 'gh returned no data'}`
      );
    }
    fields ??= data.organization?.issueFields?.nodes ?? [];
    for (const number of part) {
      const node = data.repository?.[`i${number}`];
      if (!node?.id) {
        refuse(`labels could not read the id of ${repo}#${number}`);
      }
      issues.set(number, node);
    }
  }
  const fieldOf = (fieldName, kind, wanted) => {
    const field = fields.find(
      (node) =>
        node?.name === fieldName &&
        node.__typename === `IssueField${kind}Select`
    );
    if (!field) {
      refuse(
        `the ${owner} organization has no ${kind.toLowerCase()}-select issue field named ${fieldName}`
      );
    }
    const optionIds = new Map(
      field.options.map((option) => [option.name, option.id])
    );
    const missing = wanted.filter((option) => !optionIds.has(option));
    if (missing.length > 0) {
      refuse(
        `the ${owner} ${fieldName} field has no option named ${missing.join(', ')}`
      );
    }
    return { id: field.id, optionIds };
  };
  const priority = fieldOf(PRIORITY_FIELD, 'Single', PRIORITY_ORDER);
  const scope = fieldOf(SCOPE_FIELD, 'Multi', []);
  const values = new Map(
    [...issues].map(([number, node]) => {
      const valueOf = (field) =>
        node.issueFieldValues?.nodes?.find(
          (value) => value?.field?.id === field.id
        );
      return [
        number,
        {
          issueId: node.id,
          priority: valueOf(priority)?.optionId ?? null,
          scopes: (valueOf(scope)?.options ?? []).map((option) => option.id),
        },
      ];
    })
  );
  return { priority, scope, values };
}

function issueReader(repo) {
  const cache = new Map();
  const load = (issues) => {
    const reopens = reopenIds(
      repo,
      issues.map((issue) => issue.number)
    );
    for (const issue of issues) {
      const number = String(issue.number);
      cache.set(
        number,
        reopens.has(number) ? { ...issue, reopen: reopens.get(number) } : null
      );
    }
  };
  return {
    prime: load,
    get(number) {
      if (!repo) return null;
      if (!cache.has(number)) {
        const result = spawnSync(
          'gh',
          ['issue', 'view', number, '--repo', repo, '--json', GH_FIELDS],
          {
            encoding: 'utf-8',
            maxBuffer: 64 * 1024 * 1024,
            timeout: NETWORK_MS,
          }
        );
        const issue = result.status === 0 ? readJson(result.stdout) : null;
        if (issue) load([issue]);
        else cache.set(number, null);
      }
      return cache.get(number);
    },
  };
}

const unixText = (text) => (text ?? '').replace(/\r\n?/gu, '\n');
const markOf = (text) =>
  createHash('sha256').update(unixText(text).trim()).digest('hex').slice(0, 12);
const isDraft = (comment) => {
  const text = unixText(comment.body);
  const match = DRAFT_MARK.exec(text);
  return (
    TEAM.has(comment.authorAssociation) &&
    match !== null &&
    markOf(text.slice(0, match.index)) === match[1]
  );
};
const isBot = (login) => BOTS.has(login) || login.endsWith('[bot]');
const hashedComments = (issue) =>
  (issue.comments ?? []).filter(
    (comment) => !isBot(comment.author?.login ?? '') && !isDraft(comment)
  );
// Stdout prints a lone surrogate as U+FFFD, so the text takes that form before it is printed, hashed or matched.
const issueSource = (issue) =>
  unixText(
    [
      `title: ${issue.title}`,
      `reopened: ${issue.reopen}`,
      'body:',
      issue.body ?? '',
      ...hashedComments(issue).flatMap((comment) => [
        `comment by ${comment.author?.login ?? 'unknown'} (${comment.authorAssociation ?? 'NONE'}):`,
        comment.body ?? '',
      ]),
    ].join('\n')
  ).toWellFormed();
const pieces = (line) => {
  const points = Array.from(line);
  return points.length <= LINE_LIMIT
    ? [line]
    : Array.from({ length: Math.ceil(points.length / LINE_LIMIT) }, (_, at) =>
        points.slice(at * LINE_LIMIT, (at + 1) * LINE_LIMIT).join('')
      );
};
// The issue and line number on each printed line keep a line read from another issue or position from counting as read.
const issueText = (issue) =>
  issueSource(issue)
    .split('\n')
    .flatMap((line, at) =>
      pieces(line).map(
        (piece, part) =>
          `${issue.number}:${at + 1}${part ? '+' : ''}${piece ? ` ${piece}` : ''}`
      )
    )
    .join('\n');
const fingerprint = (issue) =>
  createHash('sha256').update(issueSource(issue)).digest('hex').slice(0, 16);

const headsOf = (rows) => {
  const replaced = new Set(rows.flatMap((row) => row.prevIds));
  return rows.filter((row) => !replaced.has(row.id));
};

const stripLine = (ref) => ref.replace(/:\d+(?:-\d+)?$/u, '');

function ownerPaths(row) {
  const fields = parseDetail(row.detail) ?? new Map();
  if (row.outcome === 'kind' || row.outcome === 'fixed') {
    return paths(fields.get('owner') ?? '')
      .filter(Boolean)
      .map(stripLine);
  }
  if (
    (row.outcome === 'not-bug' || row.outcome === 'spec') &&
    fields.has('law')
  ) {
    return [stripLine(fields.get('law'))];
  }
  return [];
}

const stalingOwnerPaths = (head) =>
  head.outcome === 'fixed' ? [] : ownerPaths(head);

const ownerMoved = (read, tip, owned) => {
  const log = gitOut(
    'log',
    '--format=%H',
    '-1',
    `${read}..${tip}`,
    '--',
    ...owned
  );
  return log === null ? null : log.trim() !== '';
};

const dismissedAt = (ledger, id) =>
  Date.parse(ledger.times.get(id)?.dismissed ?? '') || -Infinity;

const linkedTasks = (issue, ledger) =>
  keptTasks(ledger.links.get(issue) ?? [], ledger);

const mentionedTasks = (issue, ledger) => {
  const linked = new Set(linkedTasks(issue, ledger).map((task) => task.id));
  return keptTasks(ledger.mentions.get(issue) ?? [], ledger).filter(
    (task) =>
      !linked.has(task.id) &&
      (task.status === 'offered' || task.status === 'started')
  );
};

function keptTasks(ids, ledger) {
  // A task dismissed into another, as a dup or a replacement, lives on as that one, as tasks.mjs's follow reads it.
  const kept = new Map();
  for (const id of ids) {
    let keeper = id;
    const followed = new Set([id]);
    for (
      let task = ledger.tasks.get(keeper);
      task?.status === 'dismissed' &&
      task.target &&
      ledger.tasks.has(task.target) &&
      !followed.has(task.target);
      task = ledger.tasks.get(keeper)
    ) {
      keeper = task.target;
      followed.add(keeper);
    }
    const task = ledger.tasks.get(keeper);
    if (task) {
      kept.set(keeper, {
        id: keeper,
        status: task.status,
        reason: task.reason ?? null,
      });
    }
  }
  return [...kept.values()];
}

function stateOf(issue, reads, visiting = new Set()) {
  if (!reads.stateMemo.has(issue)) {
    reads.stateMemo.set(
      issue,
      computeState(issue, reads, new Set([...visiting, issue]))
    );
  }
  return reads.stateMemo.get(issue);
}

// What a reader may act on: a state derived from refs fetched last is only a hint, because next may have moved since.
function stateFor(issue, reads) {
  const result = stateOf(issue, reads);
  if (reads.cached.length === 0 || result.state === 'unchecked') return result;
  const derived = `${result.state}${result.reasons.length ? ` (${result.reasons.join('; ')})` : ''}`;
  return {
    ...result,
    state: 'unchecked',
    reasons: [`${reads.cached.join(' and ')} as fetched last say ${derived}`],
  };
}

function computeState(issue, reads, visiting) {
  if (!reads.tip) return { state: 'unchecked', reasons: reads.problems };
  const rows = [...(reads.rows.get(issue)?.values() ?? [])];
  if (rows.length === 0) {
    if (!reads.policy) return { state: 'unchecked', reasons: reads.problems };
    return reads.issues.get(issue)
      ? { state: 'untriaged', reasons: [] }
      : { state: 'unchecked', reasons: [`gh could not read #${issue}`] };
  }
  const heads = headsOf(rows);
  if (heads.length > 1) {
    return {
      state: 'conflict',
      reasons: heads.map((row) => `${row.id} by ${row.who} on ${row.by}`),
      heads,
    };
  }
  const [head] = heads;
  const stale = [];
  const unknown = [];
  if (!reads.policy) unknown.push(...reads.problems);
  else {
    const by = parseLabel(head.by);
    if (!by || !meets(by.model, by.effort, reads.policy.floor)) {
      stale.push('below-floor');
    }
    if (Number(head.rev) < reads.policy.rev) stale.push('method-changed');
  }
  const current = reads.issues.get(issue);
  if (!current) unknown.push(`gh could not read #${issue}`);
  else if (fingerprint(current) !== head.seen) stale.push('issue-changed');
  const owned = stalingOwnerPaths(head);
  if (owned.length > 0) {
    const moved = ownerMoved(head.read, reads.tip, owned);
    if (moved === null) {
      unknown.push(`commit ${head.read} is not in this clone`);
    } else if (moved) stale.push('owner-moved');
  }
  if (head.outcome === 'dup') {
    const target = parseDetail(head.detail).get('of');
    const targetIssue = reads.issues.get(target);
    if (visiting.has(target)) stale.push('dup-target');
    else if (!targetIssue) {
      unknown.push(`gh could not read the duplicate's target #${target}`);
    } else {
      const targetState = stateOf(target, reads, visiting).state;
      if (
        targetIssue.state !== 'OPEN' ||
        ['stale', 'conflict', 'untriaged'].includes(targetState)
      ) {
        stale.push('dup-target');
      } else if (targetState === 'unchecked') {
        unknown.push(`the duplicate's target #${target} is unchecked`);
      }
    }
  }
  if (head.outcome === 'kind') {
    if (!reads.ledger) {
      unknown.push('the suggested-task ledger could not be read');
    } else {
      const tasks = linkedTasks(issue, reads.ledger);
      // A task dismissed done counts as a landing, because the tree already held its fix.
      const ended =
        tasks.length > 0 &&
        tasks.every(
          (task) => task.status === 'dismissed' && task.reason !== 'done'
        ) &&
        Math.max(...tasks.map((task) => dismissedAt(reads.ledger, task.id))) >
          Date.parse(head.ts);
      if (ended) stale.push('task-ended');
    }
  }
  if (stale.length > 0) return { state: 'stale', reasons: stale, head };
  if (unknown.length > 0) return { state: 'unchecked', reasons: unknown, head };
  if (!reads.policy.owners.includes(head.who)) {
    return { state: 'unconfirmed', reasons: [`by ${head.who}`], head };
  }
  return { state: 'current', reasons: [], head };
}

function runtimeAncestors() {
  const found = [];
  const seen = new Set();
  for (let pid = process.ppid; pid > 1 && !seen.has(pid);) {
    seen.add(pid);
    const match = execFileSync('ps', ['-o', 'ppid=,comm=', '-p', String(pid)], {
      encoding: 'utf-8',
    })
      .trim()
      .match(/^(\d+)\s+(.+)$/u);
    if (!match) break;
    if (RUNTIMES.has(basename(match[2]))) {
      found.push({ pid, name: basename(match[2]) });
    }
    pid = Number(match[1]);
  }
  return found;
}

const jsonlIn = (dir) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((name) => name.endsWith('.jsonl'))
        .map((name) => join(dir, name))
    : [];

const openingBoundary = (records) => {
  for (const record of records) {
    if (record.type === 'assistant') return null;
    if (record.type === 'system' && record.subtype === 'compact_boundary') {
      return record;
    }
  }
  return null;
};
const compactedIn = (records, uuid) => {
  const at = records.findIndex((record) => record.uuid === uuid);
  return (
    at > 0 && records.slice(0, at).some((record) => record.type === 'assistant')
  );
};

// A relaunch or a fork starts a new transcript with a copy of the last compact boundary, uuid and all, so a transcript
// that opens with one continues the transcript where that compaction happened: the one file in its folder that holds
// the boundary after earlier turns. A copy holds it before any turn, so it never counts. That file also holds every other
// branch's records after the compaction, and the new transcript holds copies of its own, so only the file's records up to
// the compaction belong to it.
function claudeChain(path) {
  const folder = dirname(path);
  const chain = [];
  for (let file = path, upTo = null; ;) {
    const all = readLines(file);
    const records =
      upTo === null
        ? all
        : all.slice(0, all.findIndex((record) => record.uuid === upTo) + 1);
    chain.push({ file, records });
    const boundary = openingBoundary(records);
    if (!boundary) return chain;
    const needle = `"uuid":"${boundary.uuid}"`;
    const holders = jsonlIn(folder).filter(
      (candidate) =>
        !chain.some((link) => link.file === candidate) &&
        readFileSync(candidate, 'utf-8').includes(needle) &&
        compactedIn(readLines(candidate), boundary.uuid)
    );
    if (holders.length !== 1) {
      const found =
        holders.length === 0
          ? `no transcript in ${folder} holds`
          : `${holders.length} transcripts (${holders.map((each) => basename(each)).join(', ')}) in ${folder} hold`;
      refuse(
        `${basename(file)} continues the transcript where compaction ${boundary.uuid} happened, and ${found} the turns before it`
      );
    }
    [file] = holders;
    upTo = boundary.uuid;
  }
}

function turnsOf(lead, chain) {
  if (lead.runtime === 'claude') {
    return chain.flatMap(({ records }) =>
      records
        .filter(
          (record) =>
            record.type === 'assistant' &&
            !record.isSidechain &&
            record.message?.model &&
            record.message.model !== '<synthetic>'
        )
        .map((record) => ({
          model: record.message.model,
          effort: record.effort ?? 'unknown',
        }))
    );
  }
  return chain.flatMap(({ records }) =>
    records
      .filter((record) => record.type === 'turn_context')
      .map((record) => ({
        model: record.payload?.model ?? 'unknown',
        effort: record.payload?.effort ?? 'unknown',
      }))
  );
}

const textOf = (content) =>
  typeof content === 'string'
    ? content
    : Array.isArray(content)
      ? content.map((part) => part?.text ?? '').join('\n')
      : '';

function toolOutputs(lead, chain) {
  if (lead.runtime === 'claude') {
    return chain.flatMap(({ records }) =>
      records
        .filter(
          (record) =>
            record.type === 'user' && Array.isArray(record.message?.content)
        )
        .flatMap((record) =>
          record.message.content
            .filter((block) => block.type === 'tool_result')
            .map((block) => textOf(block.content))
        )
    );
  }
  // Only what a call returned to the model counts, never the command's own output event. Codex's exec tool returns a
  // result as JSON text, whose escaped newlines would hide every line, so each string inside that JSON counts as well.
  const withJsonStrings = (text) => {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return [text];
    }
    const strings = [text];
    const walk = (value) => {
      if (typeof value === 'string') strings.push(value);
      else if (value && typeof value === 'object') {
        Object.values(value).forEach(walk);
      }
    };
    walk(parsed);
    return strings;
  };
  return chain.flatMap(({ records }) =>
    records.flatMap((record) => {
      const { type, output } = record.payload ?? {};
      if (
        record.type !== 'response_item' ||
        (type !== 'function_call_output' && type !== 'custom_tool_call_output')
      ) {
        return [];
      }
      const parts =
        typeof output === 'string'
          ? [output]
          : Array.isArray(output)
            ? output.map((part) => part?.text ?? '')
            : [textOf(output?.content)];
      return parts.flatMap(withJsonStrings);
    })
  );
}

const ghLogin = () => {
  const result = spawnSync('gh', ['api', 'user', '--jq', '.login'], {
    encoding: 'utf-8',
    timeout: NETWORK_MS,
  });
  const login = result.status === 0 ? result.stdout.trim() : '';
  return LOGIN.test(login) ? login : null;
};

function recorder(policy) {
  const { run: lead, miss } = findLead();
  if (!lead) {
    return {
      refusal: `this session's model and effort could not be read (${miss}); run record in the foreground of the session that read the issue`,
    };
  }
  if (
    lead.runtime === 'claude' &&
    lead.transcript.split('/').includes('subagents')
  ) {
    return {
      refusal: `${lead.transcript} is a subagent's transcript; a subagent reports and its lead records`,
    };
  }
  if (
    lead.runtime === 'codex' &&
    process.env.CODEX_THREAD_ID !== process.env.CODEX_SESSION_ID
  ) {
    return {
      refusal: `Codex thread ${process.env.CODEX_THREAD_ID} is a child of session ${process.env.CODEX_SESSION_ID}; the root session records`,
    };
  }
  const ancestors = runtimeAncestors();
  if (ancestors.length > 1) {
    return {
      refusal: `this ${ancestors[0].name} session runs under another ${ancestors[1].name} process (pid ${ancestors[1].pid}), so another agent session started it; record from a session you started yourself`,
    };
  }
  let chain;
  try {
    chain =
      lead.runtime === 'claude'
        ? claudeChain(lead.transcript)
        : [{ file: lead.transcript, records: readLines(lead.transcript) }];
  } catch (error) {
    if (error instanceof RefusalError) return { refusal: error.message };
    throw error;
  }
  const off = [
    ...new Set(
      turnsOf(lead, chain)
        .filter(
          (turn) => !meets(turn.model, turn.effort, policy.floor, policy.max)
        )
        .map((turn) => `${turn.model} @${turn.effort}`)
    ),
  ];
  const read = chain.map((link) => basename(link.file, '.jsonl')).join(', ');
  if (off.length > 0) {
    return {
      refusal: `this session's transcripts (${read}) have turns at ${off.join(', ')}; a triage record needs ${policy.floorText} on every turn${policy.max ? `, at most ${policy.max}` : ''}. Start a new session at that level`,
    };
  }
  const who = ghLogin();
  if (!who) {
    return {
      refusal:
        'gh could not say which GitHub account runs this session; run gh auth login',
    };
  }
  return { by: leadLabel(lead), who, lead, chain };
}

// A file read in pieces counts, so a line may carry the line number a reader prefixes.
function shownLines(outputs) {
  const shown = new Set();
  for (const line of unixText(outputs.join('\n')).split('\n')) {
    shown.add(line.trimEnd());
    shown.add(line.replace(/^ *\d+(?:\t|→)/u, '').trimEnd());
  }
  return shown;
}

function unshownLines(shown, issue, seen) {
  const wanted = [...issueText(issue).split('\n'), `seen: ${seen}`]
    .map((line) => line.trimEnd())
    .filter((line) => line.trim());
  return wanted.filter((line) => !shown.has(line));
}

function parseArgs(argv, flags) {
  const options = { positional: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) options.positional.push(arg);
    else if (flags.boolean?.includes(arg.slice(2))) {
      options[arg.slice(2)] = true;
    } else if (flags.value?.includes(arg.slice(2)) && index + 1 < argv.length) {
      index += 1;
      options[arg.slice(2)] = argv[index];
    } else usage(`unknown or incomplete option ${arg}`);
  }
  return options;
}

const issueNumber = (value) => {
  const number = String(value ?? '').replace(/^#/u, '');
  if (!ISSUE.test(number)) {
    refuse(`${JSON.stringify(value)} is not an issue number`);
  }
  return number;
};

const summary = (issue, reads) => {
  const { state, reasons, head } = stateFor(issue, reads);
  return {
    issue: Number(issue),
    title: reads.issues.get(issue)?.title ?? null,
    opener: reads.issues.get(issue)?.author?.login ?? null,
    state,
    reasons,
    head: head
      ? {
          id: head.id,
          outcome: head.outcome,
          detail: head.detail,
          by: head.by,
          who: head.who,
          read: head.read,
        }
      : null,
    scope: head ? (parseDetail(head.detail)?.get('scope') ?? null) : null,
    tasks: reads.ledger ? linkedTasks(issue, reads.ledger) : null,
  };
};

const taskText = (tasks) =>
  tasks?.length
    ? tasks
        .map(
          (task) =>
            `${task.id} ${task.status}${task.reason ? ` ${task.reason}` : ''}`
        )
        .join(', ')
    : '-';

function show(argv) {
  const options = parseArgs(argv, { boolean: ['brief', 'json'] });
  if (options.positional.length === 0) {
    refuse('show takes one or more issue numbers');
  }
  const reads = freshReads({ fallback: true, claims: true });
  const identity = reads.policy
    ? recorder(reads.policy)
    : { refusal: reads.problems.join('; ') };
  const numbers = options.positional.map(issueNumber);
  // Only the shown issues' rows fold, so an issue's open state is read only for the issues shown.
  const claims = liveClaims(
    reads,
    reads.claimRows.filter((row) => numbers.includes(row.issue)),
    (issue) => reads.issues.get(issue)?.state !== 'CLOSED'
  );
  const claimOf = (issue) => {
    const claim = claims.get(issue);
    if (!claim) return null;
    const activity = claimActivity(reads, claim, issue);
    return {
      who: claim.actor.who,
      session: claim.actor.session,
      since: claim.since,
      activity,
      stale: Date.now() - Date.parse(activity) > STALE_MS,
    };
  };
  const session = identity.by
    ? `${identity.who} on ${identity.by} can record${reads.policy.owners.includes(identity.who) ? '' : `; its records read unconfirmed until ${reads.policy.ownersText} records the issue again`}`
    : `cannot record: ${identity.refusal}`;
  const results = numbers.map((number) => ({
    ...summary(number, reads),
    claim: claimOf(number),
    mentions: reads.ledger ? mentionedTasks(number, reads.ledger) : null,
    text: options.brief || options.json ? null : reads.issues.get(number),
  }));
  // JSON carries the state only: record reads the issue's text back from a plain show, line by line.
  if (options.json) {
    console.log(
      JSON.stringify(
        {
          notes: reads.notes,
          session,
          issues: results.map(({ text, ...result }) => result),
        },
        null,
        2
      )
    );
    return;
  }
  for (const note of reads.notes) console.log(`note: ${note}`);
  console.log(`session: ${session}`);
  for (const result of results) {
    console.log(
      `\n#${result.issue} ${result.state}${result.reasons.length ? ` (${result.reasons.join('; ')})` : ''}`
    );
    console.log(`opened by ${result.opener ?? 'unknown'}`);
    if (result.head) {
      console.log(
        `record: ${result.head.outcome} ${result.head.detail}; by ${result.head.who} on ${result.head.by}; read ${result.head.read.slice(0, 10)}`
      );
    }
    console.log(`tasks: ${result.tasks ? taskText(result.tasks) : 'unread'}`);
    console.log(
      `claim: ${result.claim ? `${result.claim.who} session ${result.claim.session} since ${result.claim.since}, last activity ${result.claim.activity}${result.claim.stale ? ', stale' : ''}` : 'none'}`
    );
    console.log(
      `mentions: ${result.mentions ? taskText(result.mentions) : 'unread'}`
    );
    if (!result.text) continue;
    console.log(issueText(result.text));
    console.log(`seen: ${fingerprint(result.text)}`);
  }
}

function mark(argv) {
  const [file, extra] = argv;
  if (!file || extra) refuse('mark takes one file holding a drafted comment');
  const text = unixText(readFileSync(file, 'utf-8')).trim();
  console.log(`${text}\n\n<!-- triage:${markOf(text)} -->`);
}

function openIssues(reads, label = null) {
  const listed = spawnSync(
    'gh',
    [
      'issue',
      'list',
      '--repo',
      reads.policy.repo,
      '--state',
      'open',
      '--limit',
      String(QUEUE_LIMIT),
      '--json',
      GH_FIELDS,
      ...(label ? ['--label', label] : []),
    ],
    { encoding: 'utf-8', maxBuffer: 256 * 1024 * 1024, timeout: NETWORK_MS }
  );
  const open = listed.status === 0 ? readJson(listed.stdout) : null;
  if (!Array.isArray(open)) {
    refuse(
      `gh could not list the open issues of ${reads.policy.repo}: ${listed.error?.code === 'ETIMEDOUT' ? `no answer in ${NETWORK_MS / 1000} s` : listed.stderr.trim()}`
    );
  }
  if (open.length >= QUEUE_LIMIT) {
    refuse(
      `gh listed ${open.length} open issues, the most one call asks for, so some may be missing; narrow the queue with --label`
    );
  }
  reads.issues.prime(open);
  return open;
}

function queue(argv) {
  const options = parseArgs(argv, { boolean: ['json'], value: ['label'] });
  const reads = freshReads({ fallback: true });
  if (!reads.policy) {
    refuse(
      `the queue needs the triage policy on ${reads.remote}/${reads.branch}: ${reads.problems.join('; ')}`
    );
  }
  const results = openIssues(reads, options.label).map((issue) =>
    summary(String(issue.number), reads)
  );
  results.sort(
    (a, b) =>
      STATE_ORDER.indexOf(a.state) - STATE_ORDER.indexOf(b.state) ||
      (a.scope ?? '~').localeCompare(b.scope ?? '~') ||
      a.issue - b.issue
  );
  if (options.json) {
    console.log(
      JSON.stringify({ notes: reads.notes, issues: results }, null, 2)
    );
    return;
  }
  for (const note of reads.notes) console.log(`note: ${note}`);
  // A record by someone who is not an owner reads unconfirmed, so a non-owner's queue would list their own records forever.
  const login = ghLogin();
  const owner = login !== null && reads.policy.owners.includes(login);
  const counts = STATE_ORDER.map(
    (state) =>
      `${results.filter((result) => result.state === state).length} ${state}`
  );
  console.log(
    `${results.length} open issues${options.label ? ` labeled ${options.label}` : ''}: ${counts.join(', ')}`
  );
  const hidden = owner
    ? 0
    : results.filter((result) => result.state === 'unconfirmed').length;
  if (hidden > 0) {
    console.log(
      `note: ${hidden} unconfirmed issue(s) wait for ${reads.policy.ownersText} to triage them again`
    );
  }
  for (const result of results.filter(
    (entry) =>
      entry.state !== 'current' && (owner || entry.state !== 'unconfirmed')
  )) {
    console.log(
      [
        `#${result.issue}`,
        result.state,
        result.reasons.join('; ') || '-',
        result.scope ?? '-',
        taskText(result.tasks),
        result.title,
      ].join('\t')
    );
  }
}

function labels() {
  const reads = freshReads({ fallback: false });
  if (!reads.policy) {
    refuse(
      `labels needs the triage policy on ${reads.remote}/${reads.branch}: ${reads.problems.join('; ')}`
    );
  }
  if (!reads.ledger) {
    refuse(
      `labels needs the suggested-task ledger from ${reads.remote}: ${reads.notes.join('; ')}`
    );
  }
  const { repo } = reads.policy;
  const open = openIssues(reads).map((issue) => ({
    issue,
    ...stateFor(String(issue.number), reads),
  }));
  const kinds = open.filter(
    ({ state, head }) => state === 'current' && head.outcome === 'kind'
  );
  const fields =
    kinds.length > 0
      ? fieldValues(
          repo,
          kinds.map(({ issue }) => issue.number)
        )
      : null;
  const quoted = (label) => (label.includes(' ') ? `'${label}'` : label);
  const commands = [
    `gh label create triaged --repo ${repo} --color 0e8a16 --description "Has a current record in ${REGISTER}" --force`,
    `gh label create 'needs retest' --repo ${repo} --color fbca04 --description "A candidate fix landed on next; the reporter retests it on beta.platejs.org and closes it" --force`,
  ];
  const sets = [];
  const unscoped = [];
  for (const { issue, state, head } of open) {
    const names = new Set((issue.labels ?? []).map((label) => label.name));
    const edits = [];
    const closes =
      state === 'current' &&
      head.outcome === 'fixed' &&
      replaysReport(parseDetail(head.detail)) &&
      reads.landed.get(String(issue.number))?.has(head.id) === true &&
      deviceLaneOf(String(issue.number), reads).length === 0;
    if (state === 'current') {
      if (!names.has('triaged')) edits.push('--add-label triaged');
      for (const [label, wanted] of [
        ...Object.entries(OUTCOME_LABELS).map(([outcome, name]) => [
          name,
          head.outcome === outcome,
        ]),
        ['needs retest', head.outcome === 'fixed' && !closes],
      ]) {
        if (wanted && !names.has(label)) {
          edits.push(`--add-label ${quoted(label)}`);
        } else if (!wanted && names.has(label)) {
          edits.push(`--remove-label ${quoted(label)}`);
        }
      }
      const type = OUTCOME_TYPES[head.outcome];
      if (type && issue.issueType?.name !== type) {
        edits.push(`--type ${type}`);
      }
      if (head.outcome === 'kind') {
        const detail = parseDetail(head.detail);
        const level = detail.get('priority');
        const scope = detail.get('scope');
        const priorityId = fields.priority.optionIds.get(level);
        const scopeId = fields.scope.optionIds.get(scope);
        const { issueId, priority, scopes } = fields.values.get(issue.number);
        if (scopeId === undefined) unscoped.push(`#${issue.number} ${scope}`);
        const changes = [
          ...(priority === priorityId
            ? []
            : [
                `{ fieldId: "${fields.priority.id}", singleSelectOptionId: "${priorityId}" }`,
              ]),
          ...(scopeId === undefined ||
          (scopes.length === 1 && scopes[0] === scopeId)
            ? []
            : [
                `{ fieldId: "${fields.scope.id}", multiSelectOptionIds: ["${scopeId}"] }`,
              ]),
        ];
        if (changes.length > 0) {
          sets.push(
            `gh api graphql -f query='mutation { setIssueFieldValue(input: { clientMutationId: "#${issue.number} ${level} ${scope}", issueId: "${issueId}", issueFields: [${changes.join(', ')}] }) { clientMutationId } }'`
          );
        }
      }
    } else if (state !== 'unchecked' && names.has('triaged')) {
      edits.push('--remove-label triaged');
    }
    if (edits.length > 0) {
      commands.push(
        `gh issue edit ${issue.number} --repo ${repo} ${edits.join(' ')}`
      );
    }
    if (closes) {
      commands.push(
        `gh issue close ${issue.number} --repo ${repo} --reason completed`
      );
    }
  }
  if (unscoped.length > 0) {
    console.error(
      `triage labels: the ${SCOPE_FIELD} field has no option for ${unscoped.join(', ')}; add the option in the organization's issue field settings, or record the issue again with a scope that has one`
    );
  }
  console.log([...commands, ...sets].join('\n'));
}

function fetchClaims(remote) {
  const error = fetchRef(remote, `+${CLAIMS_REF}:${CLAIMS_REF}`);
  if (error && !/couldn't find remote ref/u.test(error.message)) {
    return { error };
  }
  const tip = error
    ? null
    : gitOut(
        'rev-parse',
        '--verify',
        '--quiet',
        `${CLAIMS_REF}^{commit}`
      )?.trim() || null;
  return {
    tip,
    text: tip ? (gitOut('show', `${tip}:${CLAIMS_FILE}`) ?? '') : '',
  };
}

const PUSH_TRIES = 4;

// The push is the lock: each try decides on the tip it fetched and pushes a commit whose parent is that tip, without
// force, so a push that another writer beat is rejected and the next try decides again on the new tip.
function pushClaims(remote, decideOn) {
  for (let attempt = 0; attempt < PUSH_TRIES; attempt += 1) {
    const { error, tip, text } = fetchClaims(remote);
    if (error) {
      refuse(`could not fetch ${CLAIMS_REF} from ${remote} (${error.message})`);
    }
    const { lines, result } = decideOn(text, attempt);
    if (lines.length === 0) return result;
    const base = text || `${CLAIM_COLUMNS.join('\t')}\n`;
    const blob = run('git', ['hash-object', '-w', '--stdin'], {
      input: `${base}${base.endsWith('\n') ? '' : '\n'}${lines.join('\n')}\n`,
    }).stdout.trim();
    const tree = run('git', ['mktree'], {
      input: `100644 blob ${blob}\t${CLAIMS_FILE}\n`,
    }).stdout.trim();
    const commit = run('git', [
      'commit-tree',
      tree,
      ...(tip ? ['-p', tip] : []),
      '-m',
      `${lines.length} triage claim move(s)`,
    ]).stdout.trim();
    const pushed = run(
      'git',
      ['push', '--quiet', remote, `${commit}:${CLAIMS_REF}`],
      {
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
        timeout: NETWORK_MS,
      }
    );
    if (pushed.status === 0) {
      run('git', ['update-ref', CLAIMS_REF, commit]);
      return result;
    }
    if (!/\[rejected\]/u.test(pushed.stderr)) {
      refuse(
        `could not push ${CLAIMS_REF} to ${remote}: ${pushed.stderr.trim().split('\n')[0] || `git push exited ${pushed.status}`}`
      );
    }
  }
  throw new RefusalError(
    `${CLAIMS_REF} on ${remote} moved ${PUSH_TRIES} times while this claim decided; run it again`
  );
}

const EVERY_TERMINAL = 'person';

function actorOf(options) {
  const who = ghLogin();
  if (!who) {
    refuse(
      'gh could not say which GitHub account runs this session; run gh auth login'
    );
  }
  const { run: lead } = findLead();
  const transcript = lead ? basename(lead.transcript, '.jsonl') : null;
  return {
    who,
    session:
      options.session ??
      (process.env.CLAUDE_CODE_HOST_SESSION_ID ||
        process.env.CLAUDE_CODE_SESSION_ID ||
        process.env.CODEX_SESSION_ID ||
        transcript ||
        EVERY_TERMINAL),
    transcript,
  };
}

function openList(repo) {
  const listed = spawnSync(
    'gh',
    [
      'issue',
      'list',
      '--repo',
      repo,
      '--state',
      'open',
      '--limit',
      String(QUEUE_LIMIT),
      '--json',
      'number,title,assignees',
    ],
    { encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024, timeout: NETWORK_MS }
  );
  const open = listed.status === 0 ? readJson(listed.stdout) : null;
  if (!Array.isArray(open)) {
    refuse(
      `gh could not list the open issues of ${repo}: ${listed.error?.code === 'ETIMEDOUT' ? `no answer in ${NETWORK_MS / 1000} s` : listed.stderr.trim()}`
    );
  }
  if (open.length >= QUEUE_LIMIT) {
    refuse(
      `gh listed ${open.length} open issues, the most one call asks for, so some may be missing`
    );
  }
  return new Map(
    open.map((issue) => [
      String(issue.number),
      {
        title: issue.title,
        assignees: issue.assignees.map((assignee) => assignee.login),
      },
    ])
  );
}

function liveSignals(repo, numbers) {
  const [owner, name] = repo.split('/');
  const found = new Map();
  for (let at = 0; at < numbers.length; at += GRAPHQL_BATCH) {
    const part = numbers.slice(at, at + GRAPHQL_BATCH);
    const fields = part.map(
      (number) =>
        `i${number}: issue(number: ${number}) { assignees(first: 20) { nodes { login } } timelineItems: timelineItems(itemTypes: [ASSIGNED_EVENT], last: 50) { nodes { ... on AssignedEvent { createdAt assignee { ... on User { login } } } } } referenced: timelineItems(itemTypes: [CROSS_REFERENCED_EVENT], last: 50) { nodes { ... on CrossReferencedEvent { source { ... on PullRequest { number state author { login } createdAt updatedAt title body } } } } } closedByPullRequestsReferences(first: 20, includeClosedPrs: false) { nodes { number state author { login } createdAt updatedAt } } comments(last: 100) { pageInfo { hasPreviousPage } nodes { databaseId author { login __typename } createdAt body } } }`
    );
    const query = `query { repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) { ${fields.join(' ')} } }`;
    const result = spawnSync('gh', ['api', 'graphql', '-f', `query=${query}`], {
      encoding: 'utf-8',
      maxBuffer: 64 * 1024 * 1024,
      timeout: NETWORK_MS,
    });
    const repository = readJson(result.stdout)?.data?.repository;
    for (const number of part) {
      const node = repository?.[`i${number}`];
      if (!node) {
        refuse(
          `gh could not read the assignees, closing PRs and comments of ${repo}#${number}: ${result.error?.code === 'ETIMEDOUT' ? `no answer in ${NETWORK_MS / 1000} s` : result.stderr?.trim() || 'gh returned no data'}`
        );
      }
      const assignedAt = new Map(
        node.timelineItems.nodes
          .filter((event) => event?.assignee?.login)
          .map((event) => [event.assignee.login, event.createdAt])
      );
      const oldest = Math.min(
        ...node.comments.nodes.map((each) => Date.parse(each.createdAt))
      );
      if (
        node.comments.pageInfo.hasPreviousPage &&
        Date.now() - oldest <= COMMENT_WINDOW_MS
      ) {
        refuse(
          `${repo}#${number} has more comments than one read returns in the last 30 days; read them with gh issue view ${number} --repo ${repo} --comments`
        );
      }
      // GitHub links a closing PR only when it targets the default branch, so a PR into next shows up as a reference.
      const closes = new RegExp(
        `\\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?):?\\s+(?:${literal(repo)})?#${number}\\b`,
        'iu'
      );
      const prs = new Map();
      for (const pr of [
        ...node.closedByPullRequestsReferences.nodes,
        ...node.referenced.nodes
          .map((event) => event?.source ?? {})
          .filter((source) =>
            closes.test(`${source.title ?? ''}\n${source.body ?? ''}`)
          ),
      ]) {
        // includeClosedPrs: false still returns a merged PR, which keeps holding an issue reopened after it.
        if (pr.state === 'OPEN' && !prs.has(pr.number)) {
          prs.set(pr.number, {
            number: pr.number,
            author: pr.author?.login ?? null,
            createdAt: pr.createdAt,
            updatedAt: pr.updatedAt,
          });
        }
      }
      found.set(String(number), {
        assignees: node.assignees.nodes.map(({ login }) => ({
          login,
          at: assignedAt.get(login) ?? null,
        })),
        prs: [...prs.values()],
        comments: node.comments.nodes.map((comment) => ({
          id: comment.databaseId,
          author: comment.author?.login ?? 'ghost',
          bot:
            comment.author?.__typename === 'Bot' ||
            isBot(comment.author?.login ?? ''),
          createdAt: comment.createdAt,
          body: comment.body,
        })),
      });
    }
  }
  return found;
}

const latest = (...times) =>
  times
    .filter(Boolean)
    .reduce((a, b) => (Date.parse(b) > Date.parse(a) ? b : a));

function headOf(issue, reads) {
  const [head] = headsOf([...(reads.rows.get(issue)?.values() ?? [])]).sort(
    (a, b) => Date.parse(b.ts) - Date.parse(a.ts)
  );
  return head
    ? {
        outcome: head.outcome,
        fields: parseDetail(head.detail) ?? new Map(),
        ts: head.ts,
      }
    : null;
}

const replaysReport = (fields) => fields.get('retest') === 'none';

const laneHeadOf = (issue, reads) => {
  const [newest] = [...(reads.rows.get(issue)?.values() ?? [])]
    .filter((row) => row.outcome === 'kind' || row.outcome === 'dup')
    .sort((a, b) => Date.parse(b.ts) - Date.parse(a.ts));
  return (
    newest && {
      outcome: newest.outcome,
      fields: parseDetail(newest.detail) ?? new Map(),
    }
  );
};

const deviceLaneOf = (issue, reads) =>
  laneOf(issue, { head: (number) => laneHeadOf(number, reads) });

const claimEnd = (reads, isOpen) => (issue, claim) => {
  if (!isOpen(issue)) return claim.since;
  const landedHead = headOf(issue, { rows: reads.landed });
  const task = claim.task ? reads.ledger?.tasks.get(claim.task) : null;
  const times = task ? reads.ledger.times.get(task.id) : null;
  const ownStart =
    Boolean(task?.startedIn) &&
    [claim.actor.session, claim.actor.transcript].includes(task.startedIn);
  const after = [
    landedHead?.outcome === 'fixed' ? landedHead.ts : null,
    times?.landed,
    ownStart ? times?.dismissed : null,
  ].filter((at) => at && Date.parse(at) > Date.parse(claim.since));
  return after.length > 0
    ? after.reduce((a, b) => (Date.parse(b) < Date.parse(a) ? b : a))
    : null;
};

function claimActivity(reads, claim, issue) {
  const files = ownerFiles(headOf(issue, reads));
  const touched =
    files.length > 0
      ? gitOut(
          'log',
          '--all',
          '-1',
          '--format=%cI',
          `--since=${claim.since}`,
          '--',
          ...files
        )?.trim()
      : null;
  return latest(
    claim.since,
    claim.task ? reads.ledger?.times.get(claim.task)?.last : null,
    touched || null
  );
}

const liveClaims = (reads, rows, isOpen) =>
  foldClaims(rows, {
    owners: reads.policy?.owners ?? [],
    endedAt: claimEnd(reads, isOpen),
  });

function claimWorld(reads, open, rows, live, actor, git) {
  const { tasks } = reads.ledger;
  const heads = new Map();
  const head = (issue) => {
    if (!heads.has(issue)) heads.set(issue, headOf(issue, reads));
    return heads.get(issue);
  };
  const linked = new Map();
  const links = (issue) => {
    if (!linked.has(issue)) {
      linked.set(issue, linkedTasks(issue, reads.ledger));
    }
    return linked.get(issue);
  };
  const byTask = new Map();
  for (const issue of open.keys()) {
    for (const task of links(issue)) {
      byTask.set(task.id, [...(byTask.get(task.id) ?? []), issue]);
    }
  }
  const times = (id) => reads.ledger.times.get(id) ?? {};
  let whole = null;
  return {
    actor,
    now: Date.now(),
    owners: reads.policy.owners,
    open,
    head,
    tasks,
    linked: links,
    taskIssues: (id) => byTask.get(id) ?? [],
    times,
    activity: (claim, issue) => claimActivity(reads, claim, issue),
    claimRows: rows,
    claims: liveClaims(reads, rows, (issue) => open.has(issue)),
    live,
    ready: (task) =>
      boardState(tasks, task, git, () => (whole ??= board(tasks, git))) ===
      'Ready',
  };
}

const ISSUE_ARG = /^#?([1-9]\d*)$/u;
const usageIssues = (values, command) =>
  values.map((value) => {
    const match = ISSUE_ARG.exec(value);
    if (!match) {
      usage(`${command}: ${JSON.stringify(value)} is not an issue number`);
    }
    return match[1];
  });

function sessionOption(options) {
  if (options.session !== undefined && !SESSION.test(options.session)) {
    usage(
      `--session takes the runtime session tool's id as one token, not ${JSON.stringify(options.session)}`
    );
  }
}

const holdText = (hold) =>
  `  ${hold.key}${hold.who ? ` by ${hold.who}` : ''}${hold.session ? ` in session ${hold.session}` : ''}, since ${hold.since ?? 'an unknown time'}${hold.activity ? `, last activity ${hold.activity}` : ''}${hold.stale ? ', stale' : ''}`;

function claimCommand(argv) {
  const options = parseArgs(argv, {
    boolean: ['next'],
    value: ['domain', 'task', 'take', 'why', 'drives', 'session'],
  });
  const issues = usageIssues(options.positional, 'claim');
  const forms = [
    issues.length > 0,
    options.domain !== undefined,
    options.task !== undefined && options.domain === undefined,
    options.next === true,
  ].filter(Boolean).length;
  if (forms !== 1) {
    usage(
      'claim takes issue numbers, --domain <scope> [--task <id>], --task <id>, or --next'
    );
  }
  if (options.domain !== undefined && !KEY_VALUES.scope.test(options.domain)) {
    usage(
      `--domain takes a review scope such as editing, not ${JSON.stringify(options.domain)}`
    );
  }
  if (options.task !== undefined && !SESSION.test(options.task)) {
    usage(`--task takes one task id, not ${JSON.stringify(options.task)}`);
  }
  if (options.drives !== undefined && !DEVICES.includes(options.drives)) {
    usage(`--drives takes one of ${DEVICES.join(', ')}`);
  }
  sessionOption(options);
  const take = (options.take ?? '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);
  if (take.length > 0 && !options.why?.trim()) {
    usage("--take needs --why with the owner's words, quoted");
  }
  if (take.length > 0 && options.next) {
    usage('--next takes no --take; name the issues or the domain to take over');
  }
  if (options.why !== undefined && take.length === 0) {
    usage('--why goes with --take, quoting the words that take the holds over');
  }
  if (/[\t\n]/u.test(options.why ?? '')) usage('--why holds a tab or newline');
  const reads = freshReads({ fallback: false });
  if (!reads.policy) {
    refuse(
      `a claim needs the triage policy on ${reads.remote}/${reads.branch}: ${reads.problems.join('; ')}`
    );
  }
  if (!reads.ledger) {
    refuse(
      `a claim needs the suggested-task ledger from ${reads.remote}: ${reads.notes.join('; ') || `${LEDGER_REF} holds no ${LEDGER}`}`
    );
  }
  const task = options.task ? reads.ledger.tasks.get(options.task) : null;
  if (options.task && !['offered', 'started'].includes(task?.status)) {
    refuse(
      `${options.task} is ${task ? task.status : 'no task the ledger holds'}, so there is nothing to claim for it`
    );
  }
  const { repo } = reads.policy;
  const actor = actorOf(options);
  const open = openList(repo);
  const git = gitMerges({ branch: reads.branch });
  let target = null;
  if (issues.length > 0) target = { issues };
  else if (!options.next) {
    target = { domain: options.domain ?? null, task: options.task ?? null };
  }
  const request = {
    target,
    take,
    drives: options.drives ?? null,
    offerId: newId(),
  };
  const scan = claimWorld(reads, open, [], new Map(), actor, git);
  const members = [
    ...new Set(
      (target
        ? [target]
        : domainsOf(scan).map((domain) => ({ domain, task: null }))
      ).flatMap((each) => targetMembers(each, scan).members)
    ),
  ];
  const readGitHub = () =>
    liveSignals(
      repo,
      members.filter((issue) => open.has(issue))
    );
  let live = readGitHub();
  const nameOf = (chosen) =>
    issues.length > 0
      ? issues.map((issue) => `#${issue}`).join(' ')
      : [
          options.next && '--next',
          chosen?.domain && `--domain ${chosen.domain}`,
          chosen?.task && `--task ${chosen.task}`,
        ]
          .filter(Boolean)
          .join(' ');
  let named = nameOf(target);
  let world;
  let written = [];
  const decision = pushClaims(reads.remote, (text, attempt) => {
    if (attempt > 0) live = readGitHub();
    world = claimWorld(reads, open, parseClaims(text), live, actor, git);
    const result = target ? decide(request, world) : decideNext(request, world);
    if (result.refusal) refuse(result.refusal);
    named = nameOf(result.target ?? target);
    const start = Date.now();
    written = result.writes.map((write, at) =>
      claimLine({
        ...write,
        ts: new Date(start + at).toISOString(),
        who: actor.who,
        session: actor.session,
        transcript: actor.transcript,
        why: options.why ?? `claim ${named}`,
      })
    );
    return { lines: written, result };
  });

  console.log(
    `actor: ${actor.who}, session ${actor.session}${actor.transcript ? ` (transcript ${actor.transcript})` : ''}`
  );
  if (options.next) {
    console.log(
      decision.target
        ? `next: --domain ${decision.target.domain}, whose worst kind this claim holds is ${decision.priorities[0]}`
        : 'next: no domain has a kind this claim can hold'
    );
  }
  console.log(
    `group: ${decision.members.map((issue) => `#${issue}`).join(' ') || 'none'}`
  );
  for (const result of decision.results) {
    const at = `#${result.issue}`;
    if (result.verdict === 'claim') console.log(`${at} claimed`);
    if (result.verdict === 'mine') console.log(`${at} yours already`);
    if (result.verdict === 'take') {
      console.log(
        `${at} taken over ${result.taken.map((hold) => hold.key).join(', ')}`
      );
      for (const hold of result.taken.filter((each) =>
        each.key.startsWith('assignee:')
      )) {
        console.log(
          `  GitHub still assigns ${hold.who}; the owner runs gh issue edit ${result.issue} --repo ${repo} --remove-assignee ${hold.who}`
        );
      }
    }
    if (result.verdict === 'held') {
      console.log(`held ${at}:`);
      for (const hold of result.holds) console.log(holdText(hold));
      console.log(
        `  it stays held until its holder releases it, or the owner's words take it: --take ${result.holds.map((hold) => hold.key).join(',')} --why "<their words, quoted>"`
      );
    }
    if (result.verdict === 'follows') {
      console.log(
        `skipped ${at}: it claims together with #${result.blocker.issue}, which is ${result.blocker.verdict}`
      );
    }
    if (result.verdict === 'device') {
      console.log(
        `skipped ${at}: device lane (${result.devices.join(', ')}); a person who drives it runs pnpm triage claim ${result.issue} --drives ${result.devices[0]}`
      );
    }
    if (result.verdict === 'desktop') {
      console.log(
        `skipped ${at}: no ${request.drives} kind; claim it without --drives`
      );
    }
    if (result.verdict === 'outside') {
      console.log(`skipped ${at}: outside this target`);
    }
    if (result.verdict === 'closed') console.log(`skipped ${at}: closed`);
    if (result.verdict === 'fixed') {
      console.log(
        `skipped ${at}: its record reads fixed, so it waits for its close or its reporter's retest; if it reopened or its reporter says it still fails, triage #${result.issue} records it again first`
      );
    }
  }
  const branches = (gitOut('ls-remote', '--heads', reads.remote) ?? '')
    .split('\n')
    .map((line) => line.split('\t')[1]?.replace('refs/heads/', ''))
    .filter(Boolean);
  for (const issue of decision.held) {
    for (const mention of mentionedTasks(issue, reads.ledger)) {
      console.log(
        `note: ${mention.id} (${mention.status}) names #${issue} in its finding, not in repro:`
      );
    }
    for (const branch of branches.filter((name) =>
      new RegExp(`(?<!\\d)${issue}(?!\\d)`, 'u').test(name)
    )) {
      console.log(`note: branch ${branch} names #${issue}`);
    }
  }
  if (decision.exit === 1) {
    console.log('nothing claimed');
    process.exitCode = 1;
    return;
  }

  const unassigned = decision.held.filter(
    (issue) =>
      !live
        .get(issue)
        .assignees.some((assignee) => assignee.login === actor.who)
  );
  for (const issue of unassigned) {
    run(
      'gh',
      ['issue', 'edit', issue, '--repo', repo, '--add-assignee', '@me'],
      { timeout: NETWORK_MS }
    );
  }
  const back =
    unassigned.length > 0 ? liveSignals(repo, unassigned) : new Map();
  const missing = unassigned.filter(
    (issue) =>
      !back
        .get(issue)
        .assignees.some((assignee) => assignee.login === actor.who)
  );
  if (unassigned.length > missing.length) {
    console.log(
      `assigned ${actor.who} on ${unassigned
        .filter((issue) => !missing.includes(issue))
        .map((issue) => `#${issue}`)
        .join(' ')}`
    );
  }
  if (missing.length > 0) {
    console.log(
      `GitHub does not show ${actor.who} assigned on ${missing.map((issue) => `#${issue}`).join(' ')}; the claim stands, and running this claim again repairs it, or pnpm triage release ${decision.held.join(' ')} --why "<reason>" --session ${actor.session} frees it`
    );
    process.exitCode = 1;
    return;
  }
  const { offer } = decision;
  const listed = (numbers) => numbers.map((issue) => `#${issue}`).join(' ');
  if (offer?.skip === 'unrecorded') {
    console.log(
      `note: no task covers ${listed(offer.issues)}, which has no record yet, so the claim offers none; run it again once the records are written`
    );
  }
  if (offer?.skip === 'priority') {
    console.log(
      `note: no task covers ${listed(offer.issues)}, whose worst kind is ${offer.priority}, so the claim offers none; a run offers only P0 or P1 tasks`
    );
  }
  const offering = offer?.skip === null;
  if (decision.starts.length === 0 && !offering) return;
  const main =
    gitOut('worktree', 'list', '--porcelain')?.match(
      /^worktree (.+)$/mu
    )?.[1] ?? root;
  setupIn(main);
  const ledger = ledgerNow(reads);
  if (!ledger) {
    console.log(
      `note: could not read ${LEDGER_REF} again, so the claim starts no task; a rerun starts them`
    );
    return;
  }
  const rows = [
    ...world.claimRows,
    ...parseClaims(`${CLAIM_COLUMNS.join('\t')}\n${written.join('\n')}`),
  ];
  const fresh = claimWorld({ ...reads, ledger }, open, rows, live, actor, git);
  const recheck = decide(
    { ...request, target: decision.target ?? target },
    fresh
  );
  const why = `claimed by pnpm triage claim ${named}`;
  const current = () => ledgerNow(reads);
  for (const id of decision.starts) {
    console.log(
      recheck.starts.includes(id)
        ? startTask(ledger.tasks.get(id), actor, why, main, current)
        : `note: ${id} changed after the claim decided, so the claim leaves it ${ledger.tasks.get(id)?.status ?? 'as it is'}`
    );
  }
  if (!offering) return;
  console.log(
    recheck.offer?.skip === null
      ? offerTask(recheck.offer, {
          id: request.offerId,
          world: fresh,
          repo,
          actor,
          named,
          main,
          current,
        })
      : `note: the shared ledger changed after the claim decided, so it offers no task for ${listed(offer.issues)}`
  );
}

function offerTask(offer, { id, world, repo, actor, named, main, current }) {
  const name = repo.split('/')[1];
  const refs = offer.issues.map((issue) => `${name}#${issue}`);
  const names =
    refs.length > 1
      ? `${refs.slice(0, -1).join(' ')} and ${refs.at(-1)}`
      : refs[0];
  const file = ledgerIn(main);
  // A start whose push failed leaves its rows only in this file, so the shared ledger the claim read cannot show them.
  const local = existsSync(file)
    ? ledgerOf(readFileSync(file, 'utf-8'), repo)
    : null;
  const waiting = local
    ? offer.issues
        .flatMap((issue) => linkedTasks(issue, local))
        .find((task) => task.status === 'offered' || task.status === 'started')
    : undefined;
  if (waiting) {
    return `note: ${waiting.id} in ${file} already covers ${names}, so the claim offers no task; node .agents/pstack/setup.mjs run in ${main} pushes it`;
  }
  const details = offer.issues.map((issue) => {
    const { outcome, fields } = world.head(issue);
    const about =
      outcome === 'kind'
        ? `${fields.get('priority')}, ${fields.get('scope')}, ${fields.get('owner')}`
        : `dup of ${name}#${fields.get('of')}`;
    return `${name}#${issue} (${about}) "${world.open.get(issue).title.replace(/\s+/gu, ' ')}".`;
  });
  const decision = `${id} Fix ${names}`;
  const appended = run(
    process.execPath,
    [
      PSTACK('decisions-check.mjs'),
      'append',
      file,
      'chip',
      decision,
      `pnpm triage claim ${named} holds ${names}, which no open task covers, so it offers this task and starts it for its own session. ${details.join(' ')}`,
      `writes: ${offer.files.join(', ')}; topic: ${name}-${offer.issues[0]}; kind: fix; priority: ${offer.priority}; repro: ${names} numbered repros hold the exact steps; session: ${actor.session}`,
      'offered',
    ],
    { cwd: main }
  );
  if (appended.status !== 0) {
    return `note: the claim offers no task for ${names}, because its offered row was refused: ${appended.stderr.trim().split('\n').at(-1)}`;
  }
  return `offered ${decision}\n${startTask({ id, decision }, actor, `claimed by pnpm triage claim ${named}`, main, current)}`;
}

function ledgerIn(main) {
  const config = readJson(readFileSync(join(main, CONFIG), 'utf-8')) ?? {};
  return join(main, ledgerPath(config.plans || 'docs/plans', config.delivery));
}

const PSTACK = (name) =>
  fileURLToPath(new URL(`../../.agents/pstack/${name}`, import.meta.url));

// The ledger file lives in the main checkout, which setup.mjs keeps in step with refs/pstack/ledger.
const setupIn = (main) =>
  run(process.execPath, [PSTACK('setup.mjs')], {
    cwd: main,
    timeout: 2 * NETWORK_MS,
  });

function ledgerNow(reads) {
  if (fetchRef(reads.remote, `+${LEDGER_REF}:${LEDGER_COPY}`)) return null;
  const text = gitOut('show', `${LEDGER_COPY}:${LEDGER}`);
  return text === null ? null : ledgerOf(text, reads.policy.repo);
}

function startTask(task, actor, why, main, current) {
  const ledger = ledgerIn(main);
  const appended = run(
    process.execPath,
    [
      PSTACK('decisions-check.mjs'),
      'append',
      ledger,
      'chip',
      task.decision,
      why,
      `session: ${actor.session}`,
      'started',
    ],
    { cwd: main }
  );
  if (appended.status !== 0) {
    return `note: ${task.id} stays offered, because its started row was refused: ${appended.stderr.trim().split('\n').at(-1)}`;
  }
  // setup.mjs returns at once while another start holds the ledger lock, so only the shared ref shows the push.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (attempt > 0) {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2000);
    }
    setupIn(main);
    const shared = current()?.tasks.get(task.id);
    if (shared?.status === 'started' && shared.startedIn === actor.session) {
      return `task ${task.id} started for session ${actor.session}`;
    }
  }
  return `task ${task.id} started for session ${actor.session}; note: its row is only in ${ledger}, and node .agents/pstack/setup.mjs run in ${main} pushes it`;
}

function releaseCommand(argv) {
  const options = parseArgs(argv, { value: ['why', 'session'] });
  const issues = usageIssues(options.positional, 'release');
  if (issues.length === 0) usage('release takes one or more issue numbers');
  if (!options.why?.trim()) {
    usage('release needs --why with the reason it stops');
  }
  if (/[\t\n]/u.test(options.why)) usage('--why holds a tab or newline');
  sessionOption(options);
  const reads = freshReads({ fallback: false });
  if (!reads.policy) {
    refuse(
      `a release needs the triage policy on ${reads.remote}/${reads.branch}: ${reads.problems.join('; ')}`
    );
  }
  const { repo, owners } = reads.policy;
  const actor = actorOf(options);
  const open = openList(repo);
  const { claims, released } = pushClaims(reads.remote, (text) => {
    const live = liveClaims(reads, parseClaims(text), (issue) =>
      open.has(issue)
    );
    const theirs = issues.filter(
      (issue) =>
        live.has(issue) &&
        !sameActor(live.get(issue).actor, actor) &&
        !owners.includes(actor.who)
    );
    if (theirs.length > 0) {
      refuse(
        `${theirs
          .map(
            (issue) =>
              `#${issue} is held by ${live.get(issue).actor.who} in session ${live.get(issue).actor.session}`
          )
          .join('; ')}; only that session or ${owners.join(' or ')} releases it`
      );
    }
    const held = issues.filter((issue) => live.has(issue));
    const start = Date.now();
    return {
      lines: held.map((issue, at) =>
        claimLine({
          ts: new Date(start + at).toISOString(),
          issue,
          move: 'release',
          who: actor.who,
          session: actor.session,
          transcript: actor.transcript,
          task: live.get(issue).task,
          drives: null,
          over: [],
          why: options.why,
        })
      ),
      result: { claims: live, released: held },
    };
  });
  for (const issue of issues) {
    if (!released.includes(issue)) {
      console.log(`#${issue} has no live claim`);
      continue;
    }
    const { who } = claims.get(issue).actor;
    console.log(`#${issue} released`);
    if (open.get(issue)?.assignees.includes(who)) {
      console.log(
        `  GitHub still assigns ${who}; gh issue edit ${issue} --repo ${repo} --remove-assignee ${who} unassigns them`
      );
    }
  }
}

function lane(argv) {
  const options = parseArgs(argv, {});
  const [device, extra] = options.positional;
  if (extra || (device !== undefined && !DEVICES.includes(device))) {
    usage(`lane takes one device of ${DEVICES.join(', ')}, or none`);
  }
  const reads = freshReads({ fallback: true, claims: true });
  if (!reads.policy) {
    refuse(
      `the lane needs the triage policy on ${reads.remote}/${reads.branch}: ${reads.problems.join('; ')}`
    );
  }
  const open = openList(reads.policy.repo);
  const claims = liveClaims(reads, reads.claimRows, (issue) => open.has(issue));
  const entries = [...open].flatMap(([issue, { title, assignees }]) => {
    const head = headOf(issue, reads);
    const devices = devicesOf(head);
    if (devices.length === 0 || (device && !devices.includes(device))) {
      return [];
    }
    const claim = claims.get(issue);
    return [
      {
        issue,
        priority: head.fields.get('priority'),
        line: [
          `#${issue}`,
          head.fields.get('priority'),
          head.fields.get('scope'),
          devices.join(','),
          claim
            ? `${claim.actor.who}/${claim.actor.session}`
            : assignees.join(',') || 'free',
          title,
        ].join('\t'),
      },
    ];
  });
  entries.sort(
    (a, b) =>
      PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority) ||
      Number(a.issue) - Number(b.issue)
  );
  for (const note of reads.notes) console.log(`note: ${note}`);
  if (entries.length === 0) {
    console.log(`no open kind needs ${device ?? 'a device'}`);
  }
  for (const entry of entries) console.log(entry.line);
}

function entriesOf(options) {
  if (options.from) {
    const lines = readFileSync(options.from, 'utf-8')
      .split('\n')
      .filter((line) => line.trim());
    if (lines[0] !== BATCH_COLUMNS.join('\t')) {
      refuse(
        `${options.from}: the header is ${BATCH_COLUMNS.join(' ')}, tab-separated`
      );
    }
    return lines.slice(1).map((line, index) => {
      const cells = line.split('\t');
      if (cells.length !== BATCH_COLUMNS.length) {
        refuse(
          `${options.from}:${index + 2}: a batch row has ${cells.length} tab-separated cells, not ${BATCH_COLUMNS.length}`
        );
      }
      return Object.fromEntries(
        BATCH_COLUMNS.map((column, at) => [column, cells[at]])
      );
    });
  }
  const [issue, extra] = options.positional;
  if (!issue || extra) {
    refuse('record takes one issue number, or --from <batch.tsv>');
  }
  return [
    {
      issue,
      outcome: options.outcome,
      detail: options.detail,
      seen: options.seen,
      why: options.why,
    },
  ];
}

function refuseBadRowsBeforeAnyRead(entries) {
  const recorded = new Set();
  for (const entry of entries) {
    const issue = issueNumber(entry.issue);
    const where = `#${issue}`;
    if (recorded.has(issue)) {
      refuse(`${where} appears twice in one record call`);
    }
    recorded.add(issue);
    for (const column of ['outcome', 'detail', 'seen', 'why']) {
      if (!entry[column]?.trim()) refuse(`${where}: --${column} is required`);
      if (/[\t\n]/u.test(entry[column])) {
        refuse(`${where}: --${column} holds a tab or newline`);
      }
    }
    const problems = detailProblems(entry.outcome, entry.detail);
    if (problems.length > 0) refuse(`${where}: ${problems.join('; ')}`);
  }
}

function recordCommand(argv) {
  const options = parseArgs(argv, {
    boolean: ['dry-run'],
    value: ['from', 'outcome', 'detail', 'seen', 'why'],
  });
  const entries = entriesOf(options);
  refuseBadRowsBeforeAnyRead(entries);
  const reads = freshReads({ fallback: false });
  if (!reads.policy) {
    refuse(
      `a record needs the triage policy on ${reads.remote}/${reads.branch}: ${reads.problems.join('; ')}`
    );
  }
  if (!reads.ledger) {
    refuse(
      `a record needs the suggested-task ledger from ${reads.remote}: ${reads.notes.join('; ') || `${LEDGER_REF} holds no ${LEDGER}`}`
    );
  }
  const identity = recorder(reads.policy);
  if (!identity.by) {
    refuse(
      options['dry-run']
        ? `${entries.length} row(s) pass the checks that need no session, but ${identity.refusal}`
        : identity.refusal
    );
  }
  const shown = shownLines(toolOutputs(identity.lead, identity.chain));
  const workTree = join(root, REGISTER);
  if (!existsSync(workTree)) {
    refuse(
      `this checkout has no ${REGISTER}; rebase it onto ${reads.remote}/${reads.branch}`
    );
  }
  const read = gitOut('merge-base', 'HEAD', reads.tip)?.trim();
  if (!read) {
    refuse(
      `this checkout shares no commit with ${reads.remote}/${reads.branch}`
    );
  }

  const start = Date.now();
  const rows = entries.map((entry, index) => {
    const issue = issueNumber(entry.issue);
    const where = `#${issue}`;
    const current = reads.issues.get(issue);
    if (!current) {
      refuse(`${where}: gh could not read the issue from ${reads.policy.repo}`);
    }
    const seen = fingerprint(current);
    if (seen !== entry.seen) {
      refuse(
        `${where}: the issue changed since it was read; run pnpm triage show ${issue}, read it again and record its new seen`
      );
    }
    const unshown = unshownLines(shown, current, seen);
    if (unshown.length > 0) {
      refuse(
        `${where}: ${unshown.length} line(s) of the issue's text never came back to this session, such as ${JSON.stringify(unshown[0].slice(0, 80))}; run pnpm triage show ${issue} in this session and read all of its output, in pieces when it is saved to a file`
      );
    }
    const fields = parseDetail(entry.detail);
    if (entry.outcome === 'dup') {
      const target = fields.get('of');
      if (target === issue) {
        refuse(`${where}: an issue is not a duplicate of itself`);
      }
      const targetIssue = reads.issues.get(target);
      if (!targetIssue) {
        refuse(`${where}: gh could not read its target #${target}`);
      }
      if (targetIssue.state !== 'OPEN') {
        refuse(
          `${where}: #${target} is ${targetIssue.state.toLowerCase()}, so a duplicate of it reads stale at once; record what closed #${target}, such as fixed or not-bug`
        );
      }
    }
    if (
      entry.outcome === 'fixed' &&
      run('git', [
        'merge-base',
        '--is-ancestor',
        fields.get('commit'),
        reads.tip,
      ]).status !== 0
    ) {
      refuse(
        `${where}: commit ${fields.get('commit')} is not on ${reads.remote}/${reads.branch}`
      );
    }
    if (entry.outcome === 'fixed' && replaysReport(fields)) {
      const devices = deviceLaneOf(issue, reads);
      if (devices.length > 0) {
        refuse(
          `${where}: its kind needs ${devices.join(', ')}, so only a retest on that device proves the fix; record what the reporter retests as retest: instead of none`
        );
      }
    }
    const owned = ownerPaths({ outcome: entry.outcome, detail: entry.detail });
    for (const path of owned) {
      if (run('git', ['cat-file', '-e', `${read}:${path}`]).status !== 0) {
        refuse(
          `${where}: ${path} does not exist at ${read.slice(0, 10)}, the newest ${reads.branch} commit this checkout holds`
        );
      }
    }
    if (owned.length > 0 && ownerMoved(read, reads.tip, owned)) {
      refuse(
        `${where}: ${reads.remote}/${reads.branch} changed ${owned.join(', ')} after this checkout's base; rebase and read them again`
      );
    }
    if (entry.outcome === 'kind') {
      const scope = fields.get('scope');
      const file = readJson(
        gitOut('show', `${read}:${SCOPES}/${scope}.json`) ?? ''
      );
      if (!file) {
        refuse(
          `${where}: scope: ${scope} has no ${SCOPES}/${scope}.json at ${read.slice(0, 10)}; name the review scope that owns the cause`
        );
      }
      const listed = [...(file.owners ?? []), ...(file.members ?? [])];
      if (
        !owned.some((path) =>
          listed.some((each) =>
            each.endsWith('/') ? path.startsWith(each) : path === each
          )
        )
      ) {
        console.error(
          `triage record: ${where}: the ${scope} scope lists none of ${owned.join(', ')} among its owners or members; check that scope: names the scope that owns the cause`
        );
      }
    }
    const ts = new Date(start + index).toISOString();
    const prev = headsOf([...(reads.rows.get(issue)?.values() ?? [])]).map(
      (head) => head.id
    );
    return [
      `${issue}-${ts}-${randomBytes(3).toString('hex')}`,
      ts,
      issue,
      entry.outcome,
      entry.detail,
      read,
      seen,
      String(reads.policy.rev),
      identity.by,
      identity.who,
      prev.length ? prev.join(',') : 'none',
      entry.why,
    ].join('\t');
  });

  const author = `${identity.who} on ${identity.by}${reads.policy.owners.includes(identity.who) ? '' : `; they read unconfirmed until ${reads.policy.ownersText} records them again`}`;
  if (options['dry-run']) {
    console.log(
      `dry run, nothing written: ${rows.length} row(s) would be recorded by ${author}`
    );
    for (const row of rows) console.log(row);
    return;
  }
  const text = readFileSync(workTree, 'utf-8');
  appendFileSync(
    workTree,
    `${text === '' || text.endsWith('\n') ? '' : '\n'}${rows.join('\n')}\n`
  );
  console.log(
    `recorded ${rows.length} row(s) in ${REGISTER} by ${author}; commit the file and land it`
  );
  for (const row of rows) console.log(row);
}

function check(argv) {
  const [file = REGISTER] = argv;
  const path = join(root, file);
  const found = existsSync(path)
    ? registerProblems(readFileSync(path, 'utf-8'), file)
    : [`${file} does not exist`];
  found.push(...policyProblems(localConfig()));
  if (found.length > 0) {
    for (const problem of found) console.error(problem);
    process.exit(1);
  }
  console.log(
    `${file}: ${parseRows(readFileSync(path, 'utf-8')).length} row(s), shape ok`
  );
}

const COMMANDS = {
  claim: claimCommand,
  release: releaseCommand,
  lane,
  show,
  queue,
  record: recordCommand,
  mark,
  labels,
  check,
};
const [command, ...rest] = process.argv.slice(2);
if (!COMMANDS[command]) {
  console.error(`usage: pnpm triage <${Object.keys(COMMANDS).join('|')}> ...`);
  process.exit(2);
}
try {
  COMMANDS[command](rest);
} catch (error) {
  if (!(error instanceof RefusalError)) throw error;
  console.error(`triage ${command}: ${error.message}`);
  process.exit(error instanceof UsageError ? 2 : 1);
}
