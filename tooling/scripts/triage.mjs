#!/usr/bin/env node
// Keeps the triage register, docs/triage/issues.tsv: one row per triage call on
// an issue of the triage repository, with the commit and issue text it read and
// the model and effort that wrote it. Every state is derived at read time from
// fresh reads of the trunk branch, the suggested-task ledger and GitHub.
// Usage: pnpm triage show <N>... [--brief] [--json]
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

import { EFFORTS, findLead, leadLabel } from '../../.agents/pstack/lead.mjs';
import { LEDGER, LEDGER_REF, readTasks } from '../../.agents/pstack/tasks.mjs';

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
  'prev',
  'why',
];
const BATCH_COLUMNS = ['issue', 'outcome', 'detail', 'seen', 'why'];
// A private copy, so this helper never moves the ref setup.mjs syncs the ledger file with.
const LEDGER_COPY = 'refs/pstack/triage-ledger';
const GH_FIELDS = 'number,title,body,state,comments,labels';
const REOPEN_BATCH = 50;
const QUEUE_LIMIT = 5000;
// A triage draft ends in a marker holding the hash of its own text, so posting it unchanged keeps its record current and editing it does not.
const DRAFT_MARK = /\n*<!-- triage:([0-9a-f]{12}) -->\s*$/u;
const TEAM = new Set(['OWNER', 'MEMBER', 'COLLABORATOR']);
// A reader that cuts long lines, as Claude Code's Read once did at 2,000 characters, would hide part of a line from record.
const LINE_LIMIT = 400;
// gh prints a bot comment's author without its [bot] suffix.
const BOTS = new Set(['dosubot', 'github-actions', 'copilot', 'claude']);
const RUNTIMES = new Set(['claude', 'codex']);
const STATE_ORDER = ['conflict', 'stale', 'unchecked', 'untriaged', 'current'];

const PATH_REF = /^[^\s:,;]+(?::\d+(?:-\d+)?)?$/u;
const ISSUE = /^[1-9]\d*$/u;
const paths = (value) => value.split(/,\s*/u);
const KEY_VALUES = {
  scope: /^[a-z][a-z0-9-]*$/u,
  priority: /^P[0-3]$/u,
  owner: (value) => paths(value).every((ref) => PATH_REF.test(ref)),
  cause: /^(?:read|inferred)$/u,
  miss: /\S/u,
  moved: /\S/u,
  of: ISSUE,
  commit: /^[0-9a-f]{7,40}$/u,
  proof: /\S/u,
  missing: /\S/u,
  law: PATH_REF,
  into: (value) =>
    paths(value).length >= 2 && paths(value).every((part) => ISSUE.test(part)),
  question: /\S/u,
};
const OUTCOMES = {
  kind: {
    required: ['scope', 'priority', 'owner', 'cause'],
    optional: ['miss', 'moved'],
  },
  dup: { required: ['of'], optional: [] },
  fixed: { required: ['commit', 'owner', 'proof'], optional: [] },
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
  if (!policy) return [`${CONFIG} has no triage key with repo, floor and rev`];
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
  if (!Number.isInteger(policy.rev) || policy.rev < 1) {
    found.push(`${CONFIG}: triage.rev is a positive integer`);
  }
  return found;
}

const policyOf = (config) => ({
  repo: config.triage.repo,
  floor: config.triage.floor.map(parseLabel),
  floorText: config.triage.floor.join(' or '),
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
function freshReads({ fallback }) {
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
  const add = (row) => {
    if (!rows.has(row.issue)) rows.set(row.issue, new Map());
    rows.get(row.issue).set(row.id, row);
  };
  if (tip) {
    for (const row of parseRows(gitOut('show', `${tip}:${REGISTER}`) ?? '')) {
      add(row);
    }
  }
  const workTree = join(root, REGISTER);
  if (existsSync(workTree)) {
    for (const row of parseRows(readFileSync(workTree, 'utf-8'))) add(row);
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
    ledger,
    issues: issueReader(policy?.repo),
    stateMemo: new Map(),
  };
}

function ledgerOf(text, repo) {
  const lines = text
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('ts\t'));
  const chips = lines
    .map((line) => line.split('\t'))
    .filter((cells) => cells[1] === 'chip');
  const name = repo.split('/')[1].replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  const reference = new RegExp(
    `(?:\\b${name}#|(?<![\\w/#])#|github\\.com/${repo.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}/issues/)(\\d+)\\b`,
    'gu'
  );
  return { chips, tasks: readTasks(lines), reference };
}

// An issue's last reopen id survives a later close and changes on another reopen.
function reopenIds(repo, numbers) {
  const [owner, name] = repo.split('/');
  const found = new Map();
  for (let at = 0; at < numbers.length; at += REOPEN_BATCH) {
    const part = numbers.slice(at, at + REOPEN_BATCH);
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

const taskIdOf = (cells) => cells[2].split(' ')[0];

const dismissedAt = (ledger, id) =>
  Math.max(
    ...ledger.chips
      .filter(
        (cells) => taskIdOf(cells) === id && cells[5].startsWith('dismissed')
      )
      .map((cells) => Date.parse(cells[0])),
    -Infinity
  );

// Every row's repro: counts because a fold replaces it, and only repro: counts because a finding's prose names unrelated issues.
function linkedTasks(issue, ledger) {
  const ids = new Set();
  for (const cells of ledger.chips) {
    const repro = (cells[4] ?? '')
      .split(/;\s+/u)
      .find((token) => token.startsWith('repro: '));
    if (
      repro &&
      [...repro.matchAll(ledger.reference)].some((match) => match[1] === issue)
    ) {
      ids.add(taskIdOf(cells));
    }
  }
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
      reasons: heads.map((row) => `${row.id} by ${row.by}`),
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
  const owned = ownerPaths(head);
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
  return { by: leadLabel(lead), lead, chain };
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
    } else refuse(`unknown or incomplete option ${arg}`);
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
    state,
    reasons,
    head: head
      ? {
          id: head.id,
          outcome: head.outcome,
          detail: head.detail,
          by: head.by,
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
  const reads = freshReads({ fallback: true });
  const identity = reads.policy
    ? recorder(reads.policy)
    : { refusal: reads.problems.join('; ') };
  const session = identity.by
    ? `${identity.by} can record`
    : `cannot record: ${identity.refusal}`;
  const results = options.positional.map(issueNumber).map((number) => ({
    ...summary(number, reads),
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
    if (result.head) {
      console.log(
        `record: ${result.head.outcome} ${result.head.detail}; by ${result.head.by}; read ${result.head.read.slice(0, 10)}`
      );
    }
    console.log(`tasks: ${result.tasks ? taskText(result.tasks) : 'unread'}`);
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
  const counts = STATE_ORDER.map(
    (state) =>
      `${results.filter((result) => result.state === state).length} ${state}`
  );
  console.log(
    `${results.length} open issues${options.label ? ` labeled ${options.label}` : ''}: ${counts.join(', ')}`
  );
  for (const result of results.filter((entry) => entry.state !== 'current')) {
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
  const open = openIssues(reads);
  console.log(
    `gh label create triaged --repo ${repo} --color 0e8a16 --description "Has a current record in ${REGISTER}" --force`
  );
  for (const issue of open) {
    const names = new Set((issue.labels ?? []).map((label) => label.name));
    const { state } = stateFor(String(issue.number), reads);
    const edits = [];
    if (state === 'current') {
      if (!names.has('triaged')) edits.push('--add-label triaged');
      if (names.has('needs-triage')) edits.push('--remove-label needs-triage');
    } else if (state !== 'unchecked' && names.has('triaged')) {
      edits.push('--remove-label triaged');
    }
    if (edits.length > 0) {
      console.log(
        `gh issue edit ${issue.number} --repo ${repo} ${edits.join(' ')}`
      );
    }
  }
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

function recordCommand(argv) {
  const options = parseArgs(argv, {
    boolean: ['dry-run'],
    value: ['from', 'outcome', 'detail', 'seen', 'why'],
  });
  const entries = entriesOf(options);
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
  if (!identity.by) refuse(identity.refusal);
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

  const recorded = new Set();
  const start = Date.now();
  const rows = entries.map((entry, index) => {
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
      prev.length ? prev.join(',') : 'none',
      entry.why,
    ].join('\t');
  });

  if (options['dry-run']) {
    console.log(
      `dry run, nothing written: ${rows.length} row(s) would be recorded by ${identity.by}`
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
    `recorded ${rows.length} row(s) in ${REGISTER} by ${identity.by}; commit the file and land it`
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

const COMMANDS = { show, queue, record: recordCommand, mark, labels, check };
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
  process.exit(1);
}
