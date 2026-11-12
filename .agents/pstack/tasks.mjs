// Installed by the sync-pstack skill.

import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';
import { capEffort } from './lead.mjs';
import { landed, stateOf } from './status.mjs';

export const LEDGER = 'suggested-tasks.decisions.tsv';
// Trunk delivery keeps the ledger out of the branch's history: git ignores the artifacts
// directory, and setup.mjs keeps the file in step with LEDGER_REF on origin.
export const ledgerPath = (plans, delivery) => (delivery === 'trunk' ? join(plans, 'artifacts', LEDGER) : join(plans, LEDGER));
export const LEDGER_REF = 'refs/pstack/ledger';

let config;
const projectConfig = () => (config ??= existsSync('.agents/pstack.json') ? JSON.parse(readFileSync('.agents/pstack.json', 'utf8')) : {});
const trunk = () => projectConfig().delivery === 'trunk';
const branch = () => projectConfig().branch ?? 'main';
const reviewScopes = (dir) => (existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isFile()).map((entry) => entry.name.replace(/\.[^.]+$/u, '')) : []);

const FROM = {
  started: ['offered', 'started'],
  landed: ['started'],
  reviewed: ['landed'],
  carded: ['offered'],
  uncarded: ['offered'],
  updated: ['offered', 'started'],
  folded: ['offered'],
  apart: ['offered', 'started'],
  reopened: ['dismissed gone', 'dismissed dup'],
  'dismissed done': ['offered'],
  'dismissed dup': ['offered'],
  'dismissed superseded': ['offered'],
  'dismissed declined': ['offered'],
  'dismissed stopped': ['started'],
  'dismissed gone': ['offered'],
  'dismissed replaced': ['offered'],
};
const TARGETED = ['dup', 'replaced'];
const withdrawn = (card) => `log started when the dismiss tool reports the owner started it, dismissed declined with card: ${card} when it reports the owner dismissed it, and otherwise uncarded with card: ${card}`;
const REASONS = Object.keys(FROM)
  .filter((move) => move.startsWith('dismissed '))
  .map((move) => move.slice('dismissed '.length))
  .filter((reason) => !TARGETED.includes(reason));
export const CHIP_STATES = ['offered', ...Object.keys(FROM).filter((move) => !move.startsWith('dismissed '))];
const RESULT = new RegExp(`^(${CHIP_STATES.join('|')}|dismissed (?:${REASONS.join('|')}|(${TARGETED.join('|')}) ([\\w-]+)))(?:[.:;,]?(?:\\s.*)?)?$`, 'u');
const LEGACY_ONLY = ['dismissed gone', 'dismissed replaced'];
const PROOFS = ['repro', 'regressed', 'ship'];
const EVIDENCE = ['priority', ...PROOFS];
const FACTS = ['review-scope', 'regression'];
const TAKES = {
  offered: ['writes', 'topic', 'kind', 'waits', 'owns', 'fast', 'card', 'shown', 'session', 'transcript', 'via', ...EVIDENCE, ...FACTS],
  updated: ['writes', 'topic', 'kind', 'effort', 'waits', 'owns', 'fast', 'session', 'transcript', ...EVIDENCE, ...FACTS],
  folded: ['writes', 'kind', 'effort', 'waits', 'owns', ...EVIDENCE],
  started: ['writes', 'session'],
  landed: ['patch', 'commit'],
  carded: ['card', 'shown', 'session', 'codex'],
  uncarded: ['card'],
  apart: ['from'],
  'dismissed declined': ['card'],
};
const LIST_KEYS = ['writes', 'waits', 'owns', 'commit', 'from', 'regression'];
const SCALAR_KEYS = ['topic', 'kind', 'effort', 'fast', 'patch', 'card', 'shown', 'session', 'transcript', 'codex', 'via', 'review-scope', ...EVIDENCE];
const KINDS = ['fix', 'decide', 'review'];
const PRIORITIES = ['P0', 'P1', 'P2', 'P3'];
const ROUTES = ['verdict', 'babysit', 'time', 'hook', 'panel'];
const CARD_LIMIT = 10;

const CHIP = /^([\w-]+) (?:(?:Now|After): )?\S/u;
const LEGACY_TITLE_TAGS = /^(?:Now: |After: |\[P[0-3]\] )| \((?:high|fast)\)$/gu;
const NOT_A_PATH = /[\s*?{}`'"]|[^.][.:]$/u;
const TOPIC = /^[a-z0-9][a-z0-9-]*$/u;
const CHECK = /^[\w.:/-]+$/u;
export const SESSION = /^\w[\w.-]*$/u;
const WAIT = /^(?:pr:(\d+)|task:([\w-]+)|run:(\S+\.md))$/u;

const withoutReproProse = (evidence, key) => (key === 'repro' ? evidence : evidence.replace(/(^|;)\s*repro:[^;]*/gu, '$1'));
const field = (key) => new RegExp(`(^|[\\s;])${key}:\\s*([^;]*)`, 'gu');
const values = (evidence, key) => [...withoutReproProse(evidence, key).matchAll(field(key))].map((match) => match[2].trim());
export const hasToken = (evidence, key) => values(evidence, key).length > 0;

const sessionOwner = (session) => (session && session !== 'none' ? session : null);
export const namesOwner = (evidence) => values(evidence, 'session').some((session) => sessionOwner(session));
export const withoutPlannedWrites = (cells) =>
  TAKES[parseRow(cells)?.move]?.includes('writes')
    ? cells[3]
        .split(';')
        .map((part) => (hasToken(part, 'writes') ? part.replace(field('writes'), '$1') : part))
        .join(';')
    : cells[3];
const list = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);
// A one-token value with a space in it ran into the next field.
const ranOn = (value) => (/\s/u.test(value) ? '; a field runs to the next ";", so end it with ";" before more evidence' : '');
const moveOf = (outcome) => (outcome[2] ? `dismissed ${outcome[2]}` : outcome[1]);
const isOpen = (task) => task.status === 'offered' || task.status === 'started';
const taskState = (task) => (task.status === 'dismissed' ? `dismissed ${task.reason}` : task.status);
const joined = (a, b) => [...new Set([...a, ...b])];
const sessionPicksPlan = (task) => task.status === 'started';
const byOrder = (a, b) => a.order - b.order;
const untaggedTitle = (decision, id) => decision.slice(id.length + 1).replace(LEGACY_TITLE_TAGS, '');
const takePlaceOf = (kept, task) => {
  if (kept) kept.order = Math.min(kept.order, task.order);
};
const higher = (one, other) => (one && (!other || one < other) ? one : other ?? null);
const article = (word) => (/^[aeiou]/u.test(word) ? 'an' : 'a');

// Lowercased because macOS volumes are case-insensitive by default, so
// readme.md and README.md name one file. The kernel follows a symlink before
// a later .. steps out of it, so the path is not resolve()d until its
// existing part has been through realpath.
export function writeKey(path) {
  let base = isAbsolute(path) ? path : `${process.cwd()}/${path}`;
  const rest = [];
  while (!existsSync(base)) {
    rest.unshift(basename(base));
    base = dirname(base);
  }
  return resolve(realpathSync.native(base), ...rest).toLowerCase();
}

const companionGitDir = () => {
  const dir = projectConfig().companion?.dir;
  return dir && existsSync(dir) ? ['--git-dir', dir] : null;
};

const commitHome = (sha) => {
  if (!/^[0-9a-f]{7,40}$/u.test(sha)) return null;
  const home = [[], companionGitDir()].filter(Boolean).find((via) => {
    try {
      execFileSync('git', [...via, 'cat-file', '-e', `${sha}^{commit}`], { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  });
  return home ?? null;
};

const isCommit = (sha) => commitHome(sha) !== null;

const contains = (outer, inner) => inner.startsWith(outer.endsWith('/') ? outer : `${outer}/`);
export const overlaps = (a, b) => a.some((x) => b.some((y) => x === y || contains(x, y) || contains(y, x)));
// A card session edits project paths in its own worktree, but another
// repository's files in place, so only those still keep two tasks apart.
const apartKeys = (keys) => {
  if (trunk()) return [];
  const root = writeKey(process.cwd());
  return keys.filter((key) => key !== root && !contains(root, key));
};

const memo = (read, keyOf = (key) => key) => {
  const seen = new Map();
  return (...args) => {
    const key = keyOf(...args);
    if (!seen.has(key)) seen.set(key, read(...args));
    return seen.get(key);
  };
};
const planOnOrigin = memo((plan) => {
  try {
    // A plan the companion repository tracks lives on its origin, not this one's.
    return execFileSync('git', [...(companionGitDir() ?? []), 'show', `origin/${branch()}:${plan}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
});
let worktreeRoots;
const planInWorktree = (plan) =>
  (worktreeRoots ??= (execFileSync('git', ['worktree', 'list', '--porcelain'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).match(/^worktree .+$/gmu) ?? []).map((line) => line.slice('worktree '.length))).some((root) => existsSync(join(root, plan)));

const parseRow = ([phase, decision = '', why = '', evidence = '', result = '']) => {
  const [, id] = phase === 'chip' ? (decision.match(CHIP) ?? []) : [];
  const outcome = id && result.match(RESULT);
  return outcome ? { id, decision, why, evidence, move: moveOf(outcome), target: outcome[3] } : null;
};

const fields = (evidence) => {
  const given = {};
  const repeated = [];
  for (const key of LIST_KEYS) {
    const found = values(evidence, key);
    if (found.length > 0) given[key] = found.flatMap(list);
  }
  for (const key of SCALAR_KEYS) {
    const found = values(evidence, key);
    if (found.length > 1) repeated.push(key);
    if (found.length > 0) given[key] = found[0];
  }
  const blankWaits = given.waits?.length === 0;
  if (given.waits) given.waits = given.waits.filter((wait) => wait !== 'none');
  return { given, repeated, blankWaits };
};

const follow = (id, tasks) => {
  const seen = new Set();
  let task = tasks.get(id);
  while (task?.status === 'dismissed' && task.target && !seen.has(task.id)) {
    seen.add(task.id);
    task = tasks.get(task.target);
  }
  return task;
};

const waitsInTopic = (task, tasks) =>
  task.topic !== null &&
  task.waits.some((wait) => {
    const target = wait.match(WAIT)?.[2];
    const next = target && follow(target, tasks);
    return next && next.id !== task.id && isOpen(next) && next.topic === task.topic;
  });

const mergeInto = (kept, task, tasks) => {
  kept.covers.push({ id: task.id, title: displayTitle(task), findings: task.findings }, ...task.covers);
  kept.owns = joined(kept.owns, task.owns);
  kept.apart = joined(kept.apart, task.apart).filter((other) => other !== kept.id);
  if (kept.status !== 'offered') return;
  const outside = (wait) => {
    const target = wait.match(WAIT)?.[2];
    return !target || follow(target, tasks) !== kept;
  };
  kept.waits = joined(kept.waits.filter(outside), task.waits.filter(outside));
  kept.writes = joined(kept.writes, task.writes);
  kept.keys = kept.writes.map(writeKey);
  if (task.kind === 'decide') kept.kind = 'decide';
  if (needsJudgment(task)) kept.effort = 'xhigh';
  kept.priority = higher(task.priority, kept.priority);
  for (const key of PROOFS) kept[key] ??= task[key];
};

export function recordRow(tasks, cells, ts = null) {
  const row = parseRow(cells);
  if (!row) return;
  const task = tasks.get(row.id);
  const { given } = fields(row.evidence);
  if (row.move === 'offered') {
    if (task) return;
    const writes = given.writes ?? [];
    const created = {
      id: row.id,
      decision: row.decision,
      title: untaggedTitle(row.decision, row.id),
      order: tasks.size,
      status: 'offered',
      reason: null,
      target: null,
      writes,
      keys: writes.map(writeKey),
      topic: given.topic ?? null,
      kind: given.kind ?? 'fix',
      waits: given.waits ?? [],
      owns: given.owns ?? [],
      card: given.card ?? null,
      cardedAt: given.card ? ts : null,
      codex: false,
      session: given.card ? (given.session ?? null) : null,
      owner: sessionOwner(given.session),
      ownerTranscript: given.transcript ?? null,
      outside: given.session === 'none',
      startedIn: null,
      effort: null,
      fast: given.fast === 'yes',
      priority: given.priority ?? null,
      repro: given.repro ?? null,
      regressed: given.regressed ?? null,
      ship: given.ship ?? null,
      reviewScope: given['review-scope'] ?? null,
      regression: given.regression ?? [],
      patch: null,
      commits: [],
      landedAt: null,
      reviewed: false,
      findings: [row.why],
      covers: [],
      apart: [],
    };
    created.cardEffort = created.card ? levelOf(created) : null;
    tasks.set(row.id, created);
    return;
  }
  if (!task) return;
  if (row.move === 'started' || row.move === 'folded') {
    task.writes = joined(task.writes, given.writes ?? []);
    task.keys = task.writes.map(writeKey);
  }
  if (row.move === 'folded') {
    if (given.kind === 'decide') task.kind = 'decide';
    if (given.effort) task.effort = given.effort;
    task.waits = joined(task.waits, given.waits ?? []);
    task.owns = joined(task.owns, given.owns ?? []);
    task.priority = higher(given.priority, task.priority);
    for (const key of PROOFS) if (given[key] !== undefined) task[key] = given[key];
    task.findings.push(row.why);
  }
  if (row.move === 'started') {
    task.status = 'started';
    if (given.session) task.startedIn = given.session;
  }
  if (row.move === 'landed') {
    task.status = 'landed';
    task.patch = given.patch ?? null;
    task.commits = given.commit ?? [];
    task.landedText = `${row.why} ${row.evidence}`;
    task.landedAt = ts;
  }
  if (row.move === 'reviewed') task.reviewed = true;
  if (row.move === 'apart') task.apart = joined(task.apart, given.from ?? []);
  if (row.move === 'carded') {
    task.card = given.card ?? null;
    task.cardedAt = ts;
    task.codex = given.codex === 'always';
    task.session = given.session ?? null;
    task.cardEffort = levelOf(task);
    // An offer older than the session: token has no owner, so the first
    // session that cards it takes it.
    task.owner ??= task.session;
    task.outside = false;
  }
  if (row.move === 'uncarded' || row.move === 'reopened' || row.move.startsWith('dismissed')) {
    task.card = null;
    task.cardedAt = null;
    task.codex = false;
    task.session = null;
    task.cardEffort = null;
  }
  if (row.move === 'reopened') {
    const kept = task.reason === 'dup' && follow(task.target, tasks);
    if (kept) {
      const brought = new Set([task.id, ...task.covers.map((entry) => entry.id)]);
      kept.covers = kept.covers.filter((entry) => !brought.has(entry.id));
    }
    task.status = 'offered';
    task.reason = null;
    task.target = null;
  }
  if (row.move === 'updated') {
    if (given.writes) {
      task.writes = given.writes;
      task.keys = given.writes.map(writeKey);
    }
    for (const key of ['topic', 'kind', 'effort', 'waits', 'owns', ...EVIDENCE]) if (given[key] !== undefined) task[key] = given[key];
    if (given['review-scope'] !== undefined) task.reviewScope = given['review-scope'];
    if (given.regression !== undefined) task.regression = given.regression;
    if (given.fast !== undefined) task.fast = given.fast === 'yes';
    if (given.session !== undefined) {
      task.owner = sessionOwner(given.session);
      task.outside = given.session === 'none';
      task.ownerTranscript = given.transcript ?? null;
    }
  }
  if (row.move.startsWith('dismissed')) {
    task.status = 'dismissed';
    task.reason = row.move.slice('dismissed '.length);
    task.target = row.target ?? null;
    const kept = row.target && tasks.get(row.target);
    takePlaceOf(kept, task);
    if (row.move === 'dismissed dup' && kept && isOpen(kept)) mergeInto(kept, task, tasks);
  }
}

export function readTasks(lines) {
  const tasks = new Map();
  for (const line of lines) {
    if (!line.trim()) continue;
    const [ts, ...cells] = line.split('\t');
    recordRow(tasks, cells, ts);
  }
  markDeferred(tasks);
  liftPriorities(tasks);
  return tasks;
}

const tokenProblems = (given, where) => {
  const found = [];
  if (given.topic !== undefined && !TOPIC.test(given.topic)) found.push(`${where}: topic: names the owner question as one lowercase kebab-case word, such as plite-landing`);
  if (given.kind !== undefined && !KINDS.includes(given.kind)) found.push(`${where}: kind: is fix, decide or review`);
  if (given.fast !== undefined && !['yes', 'no'].includes(given.fast)) found.push(`${where}: fast: is yes or no`);
  if (given.patch !== undefined && NOT_A_PATH.test(given.patch)) found.push(`${where}: patch: names the patch file the session applied, as one path with no whitespace, glob or quote`);
  if (given.effort !== undefined && !['high', 'xhigh'].includes(given.effort)) found.push(`${where}: effort: is high or xhigh`);
  for (const wait of given.waits ?? []) if (!WAIT.test(wait)) found.push(`${where}: waits: takes pr:<number>, task:<id> or run:<plan path ending in .md>, comma-separated, or none; "${wait}" is none of them`);
  for (const check of given.owns ?? []) if (!CHECK.test(check)) found.push(`${where}: owns: names each check as one token, such as ci:check`);
  if (given.session !== undefined && !SESSION.test(given.session)) found.push(`${where}: session: names the session id as one token${ranOn(given.session)}`);
  if (given.transcript !== undefined && !SESSION.test(given.transcript)) found.push(`${where}: transcript: names the session's transcript id as one token${ranOn(given.transcript)}`);
  if (given.codex !== undefined && given.codex !== 'always') found.push(`${where}: codex: is always, which forces the card session's Codex handoff`);
  if (given.priority !== undefined && !PRIORITIES.includes(given.priority)) found.push(`${where}: priority: is P0, P1, P2 or P3, as chips.md's Priority says`);
  if (given.via !== undefined && !ROUTES.includes(given.via)) found.push(`${where}: via: is verdict, babysit, time, hook or panel, the route that lets a run offer a P2 or P3 task, as chips.md's Offer says`);
  if (given.shown !== undefined && !PRIORITIES.includes(given.shown)) found.push(`${where}: shown: is the priority the card's title shows, P0, P1, P2 or P3`);
  if (given.repro === '') found.push(`${where}: repro: names a failing test, or exact steps someone ran and saw fail`);
  if (given.regressed !== undefined && !/^[0-9a-f]{7,40}$/u.test(given.regressed)) found.push(`${where}: regressed: names the commit the regression came in by its hash`);
  if (given.ship !== undefined && !SESSION.test(given.ship)) found.push(`${where}: ship: names one item of the project's ship list by its id`);
  if (given['review-scope'] !== undefined && !TOPIC.test(given['review-scope'])) found.push(`${where}: review-scope: names the review scope that owns the task's code by its id, or none when no review scope owns it`);
  for (const page of given.regression ?? []) if (!['http:', 'https:'].includes(URL.parse(page)?.protocol)) found.push(`${where}: regression: names each page where the behavior still works by its URL, comma-separated, as a triage record's regression: does; "${page}" is not a URL`);
  return found;
};

const afterRow = (before, cells) => {
  const after = structuredClone(before);
  recordRow(after, cells);
  markDeferred(after);
  liftPriorities(after);
  return after;
};

export function chipRowProblems(cells, before, where) {
  const [, decision, , evidence] = cells;
  const [, id] = decision.match(CHIP) ?? [];
  if (!id) return [`${where}: a chip row's decision is "<task id> <title>", with (xhigh) after the title of a design question or of a bug whose cause nobody has located`];
  const row = parseRow(cells);
  if (!row) return [`${where}: a chip row's result is offered, carded, uncarded, updated, folded, apart, started, landed, reviewed, reopened, or dismissed with done, superseded, declined, stopped or dup <task id>`];
  const { move } = row;
  const known = before.get(id);
  const { given } = fields(evidence);
  const found = tokenProblems(given, where);
  if ((given.writes ?? []).some((path) => NOT_A_PATH.test(path)) || (move === 'offered' && !given.writes?.length)) {
    found.push(`${where}: a chip offer lists the paths the task will write as "writes: <path>, <path>" in its evidence, and a later row lists any it adds, each a repository path or directory, or an absolute path in another checkout, with no whitespace, glob, quote, comma or semicolon`);
  }
  if (move === 'offered') {
    if (known) return [...found, `${where}: ${id} was already offered; a task id is offered once`];
  } else {
    if (!known) return [...found, `${where}: ${id} has no offered chip row before this one`];
    if (known.decision !== decision) found.push(`${where}: ${id} was offered as "${known.decision}", and every later row repeats that decision`);
    const state = taskState(known);
    if (!FROM[move].includes(state)) found.push(`${where}: ${id} is ${state}, so it cannot be ${move}`);
  }
  if (move === 'carded' && !given.card) found.push(`${where}: a carded row names the suggest tool's card id as "card: <id>"`);
  if (move === 'apart' && (!given.from?.length || given.from.some((other) => other === id || !before.has(other) || follow(other, before)?.id === id))) {
    found.push(`${where}: an apart row names in "from: <task id>, <task id>" each other task the ledger holds that a sweep judged separate work from ${id}`);
  }
  if (move === 'updated' && !TAKES.updated.some((key) => given[key] !== undefined)) found.push(`${where}: an updated row names what changes: writes:, topic:, kind:, effort:, waits:, owns:, fast: or session:`);
  if (move === 'updated' && given.transcript !== undefined && given.session === undefined) found.push(`${where}: transcript: goes beside session:, the owner it names`);
  if (move === 'updated' && known && sessionPicksPlan(known) && Object.keys(given).some((key) => key !== 'owns' && !FACTS.includes(key))) {
    found.push(`${where}: ${id} is started, so an updated row on it takes only owns:, review-scope: and regression:; the session adds paths with another started row`);
  }
  const kept = row.target && before.get(row.target);
  if (move === 'dismissed dup' && (row.target === id || !kept || !isOpen(kept))) found.push(`${where}: ${row.target} must be another task the ledger holds as offered; offer the task it merges into before this row`);
  if (move === 'folded' && given.kind !== undefined && given.kind !== 'decide') found.push(`${where}: a folded row takes kind: decide only, when its finding is a design question; it never turns a design question back into a fix`);
  if (move === 'folded' && given.effort !== undefined && given.effort !== 'xhigh') found.push(`${where}: a folded row takes effort: xhigh only, when its finding is a bug or slowness whose cause nobody has located; an updated row lowers a task's effort`);
  if (found.length > 0) return found;
  const after = afterRow(before, cells);
  const dup = move === 'dismissed dup';
  const subject = dup ? after.get(row.target) : after.get(id);
  const madeDecide = !['dismissed dup', 'folded'].includes(move) || before.get(subject.id).kind !== 'decide';
  if (['offered', 'updated', 'reopened', 'folded', 'dismissed dup'].includes(move) && subject.status === 'offered' && subject.kind === 'decide' && madeDecide) {
    const peers = [...after.values()].filter((peer) => peer.id !== subject.id && peer.kind === 'decide' && peer.topic !== null && peer.topic === subject.topic);
    const rival = !waitsInTopic(subject, after) && peers.find((peer) => peer.status === 'offered' && !waitsInTopic(peer, after));
    if (rival) {
      const moved = move === 'updated' && given.topic !== undefined;
      const route = rival.card ? `give ${id} waits: task:${rival.id}, since ${rival.id} holds card ${rival.card}` : dup || (moved && known.topic !== null) ? `log ${id} dismissed dup ${rival.id} instead` : moved ? `give ${id} a topic of its own with its waits, then log it dismissed dup ${rival.id}` : `log this finding as a folded row on ${rival.id} instead`;
      found.push(`${where}: topic ${subject.topic} already has the open design question ${rival.id}; ${route}`);
    }
    for (const running of peers.filter((peer) => peer.status === 'started')) {
      const waitsOnRunning = subject.waits.some((wait) => {
        const target = wait.match(WAIT)?.[2];
        return target && follow(target, after)?.id === running.id;
      });
      if (!waitsOnRunning) {
        found.push(
          dup
            ? `${where}: topic ${subject.topic}'s design question ${running.id} is running; log updated on ${subject.id} with its waits plus task:${running.id} before this row`
            : `${where}: topic ${subject.topic}'s design question ${running.id} is running; a new one waits on it with waits: task:${running.id}`,
        );
      }
    }
  }
  return found;
}

// A session owns the tasks it offered, or carded first when the offer named no
// session. here is the writing session's { session, transcript }; either id
// matches, because an account switch can change one of them.
export const ownedBy = (task, here) => Boolean(here) && ((here.session && ownerOf(task) === here.session) || (here.transcript && ownerTranscriptOf(task) === here.transcript));

export const ownerOf = (task) => (task.ship ? null : task.owner);

const held = (task) => task?.status === 'offered' && task.card;
const ownerTranscriptOf = (task) => (task.ship ? null : task.ownerTranscript);

export function newChipRowProblems(cells, before, where, git, here = null, shipList = () => NO_SHIP) {
  const [, decision, , evidence] = cells;
  const row = parseRow(cells);
  if (!row) return [];
  const { id, move } = row;
  if (LEGACY_ONLY.includes(move)) return [`${where}: a task keeps its id for good: log uncarded when its card leaves the queue, updated when its waits or paths change, and dismissed dup <task id> to merge it into another task`];
  const { given, repeated, blankWaits } = fields(evidence);
  const found = repeated.map((key) => `${where}: a chip row names ${key}: once`);
  if (blankWaits) found.push(`${where}: waits: takes pr:<number>, task:<id> or run:<plan path ending in .md>, comma-separated, or none; an empty waits: is none of them`);
  const takes = TAKES[move] ?? [];
  for (const key of Object.keys(given)) {
    if (!takes.includes(key)) found.push(`${where}: ${article(move)} ${move} row does not take ${key}:, so it would be ignored; ${takes.length ? `it takes ${takes.map((each) => `${each}:`).join(', ')}` : 'it takes none'}`);
  }
  if (move === 'offered' && !before.has(id)) {
    if (untaggedTitle(decision, id) !== decision.slice(id.length + 1)) found.push(`${where}: a new title is a plain imperative phrase, with (xhigh) only for a design question or a bug whose cause nobody has located; chips works out when a task can start, so no title says Now: or After:, chips brief adds its priority as [P1], and fast: yes adds (fast) for it`);
    if (!given.topic) found.push(`${where}: a new offer names its owner question as "topic: <word>"; run chips to see the open topics and reuse one when the finding answers its question`);
    if (!given.priority && !given.owns?.length) found.push(`${where}: a new offer names its priority as "priority: P0", P1, P2 or P3, as chips.md's Priority says; a task that owns a check failing on the base branch is P0 without one`);
    if (['P2', 'P3'].includes(given.priority) && !given.via) found.push(`${where}: a run offers a task only for a new P0 or P1 finding, as chips.md's Offer says, so list this ${given.priority} finding in the plan's Open work, or in the reply when the run keeps no plan; an offer for an item the run's verdict judges, for a finding in a babysit run, for a measurement the Time budget rule sends to a task, from a project hook that finds recurring work due, or for the design question that two open critical panel findings require names its route as via: verdict, via: babysit, via: time, via: hook or via: panel`);
    if (given.via === 'panel' && given.kind !== 'decide') found.push(`${where}: via: panel is the route for the design question that two open critical panel findings require, so it goes only on a kind: decide offer`);
  }
  const claimed = ['P0', 'P1'].includes(given.priority) ? afterRow(before, cells).get(id) : null;
  if (claimed && !claimed.owns.length && !claimed.repro) {
    if (given.priority === 'P0' && !claimed.regressed) {
      found.push(`${where}: a P0 task is broken now, so it owns a check failing on the base branch (owns:), names the commit it regressed in (regressed: <hash>) or names its repro (repro: <failing test, or exact steps someone ran and saw fail>); without one, it is P1 or lower`);
    }
    if (given.priority === 'P1' && !claimed.ship) {
      found.push(`${where}: a P1 task is a bug with its repro (repro: <failing test, or exact steps someone ran and saw fail>) or serves an open item of the project's ship list (ship: <id>); without one, it is P2 or lower`);
    }
  }
  if (given.regressed !== undefined && !isCommit(given.regressed)) found.push(`${where}: regressed: ${given.regressed} is not a commit in this checkout; name the commit the regression came in`);
  if (given.ship !== undefined) {
    const { items, note } = shipList();
    if (!items) found.push(`${where}: ship: names an item of the project's ship list, and ${note ?? 'this project sets no chips.ship command in .agents/pstack.json'}`);
    else if (!items.some((item) => item.id === given.ship)) found.push(`${where}: ship: ${given.ship} is not an open item of the project's ship list; chips lists the open ones`);
  }
  const scopes = projectConfig().chips?.scopes;
  const scope = given['review-scope'];
  if (scopes && scope && scope !== 'none' && !reviewScopes(scopes).includes(scope)) found.push(`${where}: review-scope: ${scope} is no review scope in ${scopes}; name the one that owns the task's code, or none`);
  const cycledBefore = cyclicEdges(before);
  const added = [...cyclicEdges(afterRow(before, cells))].filter((edge) => !cycledBefore.has(edge)).map((edge) => edge.split(' '));
  const self = added.find(([from, to]) => from === to);
  const loops = [...new Set(added.flat())];
  if (self) found.push(`${where}: ${self[0]} cannot wait on itself`);
  else if (loops.length > 0) {
    const route = move !== 'dismissed dup' ? 'drop the wait that closes the loop' : `keep ${id} open`;
    found.push(`${where}: this row leaves ${loops.join(' and ')} waiting on each other; ${route}`);
  }
  if (move === 'started') {
    const known = before.get(id);
    const added = apartKeys((given.writes ?? []).map(writeKey).filter((key) => !known?.keys.includes(key)));
    for (const [other, peer] of before) {
      if (other !== id && peer.status === 'started' && overlaps(added, apartKeys(peer.keys))) found.push(`${where}: ${id} cannot add a path outside this checkout that ${other}, also started, writes, because both sessions would edit it in place; leave that path to ${other} and tell the owner`);
    }
  }
  const unmigrated = (task) => `${where}: ${task.id} has no topic, so its waits may still be prose; migrate it first: log updated with topic: and the waits: it has, as waits: none when it has none`;
  const own = before.get(id);
  const keeper = row.target && before.get(row.target);
  if (move === 'dismissed dup' && keeper?.status === 'started') found.push(`${where}: ${keeper.id} is started, and a dup moves work only into an offered task; keep ${id} open, log updated with its waits plus task:${keeper.id}, and log dismissed done once ${keeper.id} lands with the fix`);
  if (move === 'dismissed dup' && own && keeper) {
    if (own.topic === null) found.push(unmigrated(own));
    else if (keeper.topic === null) found.push(unmigrated(keeper));
    else if (own.topic !== keeper.topic && (own.kind !== 'decide' || keeper.kind !== 'decide')) found.push(`${where}: ${id} is in topic ${own.topic} and ${keeper.id} in ${keeper.topic}, and a dup joins tasks on one question; when ${id} answers ${keeper.id}'s question, log updated with topic: ${keeper.topic} on ${id} first`);
  }
  if (move === 'updated' && given.topic && own?.topic === null && given.waits === undefined) found.push(`${where}: ${id} has no topic yet, so this row migrates it; name its waits too, as waits: none when it has none`);
  if (move === 'landed' && given.patch && !existsSync(given.patch)) found.push(`${where}: patch: ${given.patch} does not exist; save the patch you applied there first, under the checkout's plans artifacts`);
  for (const sha of move === 'landed' ? (given.commit ?? []) : []) {
    if (!isCommit(sha)) found.push(`${where}: commit: ${sha} is not a commit in this checkout; name each commit that delivered the task by its hash, after committing it${ranOn(sha)}`);
  }
  if (move === 'carded' && before.get(id)?.card) found.push(`${where}: ${id} already has card ${before.get(id).card}; log uncarded with card: ${before.get(id).card} once that card is withdrawn or its session has ended, then card it again`);
  if (given.card && !given.session && ['carded', 'offered'].includes(move)) found.push(`${where}: a card names the session that holds it as "session: <id>", the id the runtime's session tool gives this session`);
  const owner = before.has(id) ? ownerOf(before.get(id)) : null;
  if (move === 'carded' && owner && given.session && given.session !== owner && !ownedBy(before.get(id), here)) {
    found.push(`${where}: ${id} belongs to session ${owner}, so only that session cards it; withdraw this card, as chips.md's Limits says, and once that session is archived or gone, /chips all takes the task with updated session: ${given.session}`);
  }
  if (own && ['uncarded', 'dismissed declined'].includes(move) && (given.card ?? null) !== own.card) {
    if (move === 'uncarded' && !own.card) found.push(`${where}: ${id} has no card to withdraw`);
    else if (!given.card) found.push(`${where}: ${id} holds card ${own.card}; name it as card: ${own.card}`);
    else found.push(`${where}: ${id}'s card is ${own.card ?? 'none'}, not ${given.card}; a dismissal of an older card closes nothing, so log no row for it`);
  }
  if (move === 'folded' && held(own)) found.push(`${where}: ${id} holds card ${own.card}, which cannot show new work; offer the finding as a new task in topic ${own.topic ?? '<its question>'} with waits: task:${id}, and chips merges it once the card is withdrawn`);
  const narrows = Object.keys(given).every((key) => key === 'writes') && (given.writes ?? []).map(writeKey).every((key) => own?.keys.some((old) => key === old || contains(old, key)));
  const addsWaits = Object.keys(given).every((key) => key === 'waits') && given.waits !== undefined && given.waits.length > (own?.waits.length ?? 0) && (own?.waits ?? []).every((wait) => given.waits.includes(wait));
  const relabels = Object.keys(given).every((key) => key === 'effort' || EVIDENCE.includes(key) || FACTS.includes(key));
  if (move === 'updated' && held(own) && !narrows && !addsWaits && !relabels) {
    found.push(`${where}: ${id} holds card ${own.card}, which cannot change; withdraw the card first, as chips.md's Limits says, then log this row; a row that only narrows writes:, only adds waits: and keeps every wait it has, or only sets effort:, priority: and its evidence, review-scope: or regression:, needs no withdrawal`);
  }
  if (given.fast === 'yes') {
    const after = afterRow(before, cells).get(id);
    if (after && (after.kind !== 'fix' || needsJudgment(after))) found.push(`${where}: ${id} is ${after.kind === 'fix' ? 'an (xhigh) task' : `a ${after.kind} task`}, and fast: yes marks only a fix at high effort that names its exact change`);
  }
  if (move === 'dismissed dup' && own && keeper && judgedApart(own, keeper, before)) found.push(`${where}: an apart row keeps ${id} and ${keeper.id} apart as separate work, so ${id} is no duplicate of ${keeper.id}; keep both open`);
  if (move === 'dismissed dup' && held(keeper)) found.push(`${where}: ${keeper.id} holds card ${keeper.card}, which cannot show new work; keep ${id} open and log updated on it with its waits plus task:${keeper.id}, and chips merges it once the card is withdrawn`);
  if (move === 'carded' || (move === 'offered' && given.card)) {
    const uncarded = move === 'carded' ? before : afterRow(before, cells);
    const task = uncarded.get(id);
    if (move === 'offered' && task) task.card = null;
    const view = board(uncarded, git);
    if (task && !view.ready.includes(task)) {
      const blockers = view.waiting.find((entry) => entry.task === task)?.blockers ?? ['it has no topic'];
      found.push(`${where}: ${id} cannot start yet (${blockers.join('; ')}), so it gets no card; chips lists it until it is ready`);
    }
  }
  return found;
}

export function baseRedProblems(evidence, tasks, where) {
  return values(evidence, 'base-red')
    .flatMap(list)
    .flatMap((check) => {
      if (!CHECK.test(check)) return [`${where}: base-red: names each failing check as one token, such as ci:check`];
      const owner = [...tasks.values()].some((task) => isOpen(task) && task.owns.includes(check));
      return owner ? [] : [`${where}: base-red: ${check} has no open suggested task that owns it; offer one with "owns: ${check}", or log updated on the task that makes the base branch green, before this row`];
    });
}

export const NO_SHIP = { items: null, note: null };

// The ship list is a project's path to release, such as a review ledger's open
// items, which the chips.ship command prints as a JSON array.
export function readShip(command) {
  if (!command) return NO_SHIP;
  if (!Array.isArray(command) || command.length === 0 || command.some((part) => typeof part !== 'string')) return { items: null, note: 'chips.ship in .agents/pstack.json is not a command written as an array of strings' };
  try {
    const parsed = JSON.parse(execFileSync(command[0], command.slice(1), { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 120_000 }));
    if (!Array.isArray(parsed)) return { items: null, note: `${command.join(' ')} printed no JSON array` };
    const items = parsed
      .filter((item) => SESSION.test(item?.id ?? '') && typeof item.title === 'string')
      .map((item) => ({
        id: item.id,
        title: item.title,
        finding: typeof item.finding === 'string' ? item.finding : `${item.id} is open on the project's ship list`,
        writes: Array.isArray(item.writes) && item.writes.length ? item.writes : [projectConfig().plans ?? 'docs/plans'],
        topic: TOPIC.test(item.topic ?? '') ? item.topic : `ship-${item.id.toLowerCase().replace(/[^a-z0-9]+/gu, '-')}`,
        kind: KINDS.includes(item.kind) ? item.kind : 'decide',
        waits: Array.isArray(item.waits) ? item.waits.filter((wait) => WAIT.test(wait)) : [],
      }));
    return { items, note: null };
  } catch (error) {
    return { items: null, note: `${command.join(' ')} failed: ${String(error.stderr || error.message).trim().split('\n')[0]}` };
  }
}

export function gitMerges({ fetch = false, branch } = {}) {
  const where = branch ? `each remote's ${branch} branch` : 'the remote branches';
  let note = `PR waits read ${where} as last fetched; chips --fetch refreshes them.`;
  if (fetch) {
    try {
      execFileSync('git', ['fetch', '--quiet', '--all'], { stdio: 'ignore', timeout: 60_000 });
      note = `PR waits read ${where} just fetched.`;
    } catch {
      note = `The fetch failed, so PR waits read ${where} as last fetched.`;
    }
  }
  const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\n');
  // A ref glob's * also matches /, so each remote's branch is named exactly.
  const refsOf = () => {
    if (!branch) return ['--remotes'];
    const wanted = new Set(git('remote').filter(Boolean).map((remote) => `refs/remotes/${remote}/${branch}`));
    return git('for-each-ref', '--format=%(refname)', 'refs/remotes/').filter((ref) => wanted.has(ref));
  };
  let refs;
  const cache = new Map();
  const merged = (number) => {
    if (!cache.has(number)) {
      try {
        refs ??= refsOf();
        const subjects = refs.length === 0 ? [] : git('log', ...refs, '--format=%s', '-E', `--grep=Merge pull request #${number} from`, `--grep=\\(#${number}\\)`);
        const merge = new RegExp(`^Merge pull request #${number} from `, 'u');
        const squash = new RegExp(`\\(#${number}\\)$`, 'u');
        cache.set(number, subjects.some((subject) => merge.test(subject) || squash.test(subject)));
      } catch {
        cache.set(number, null);
      }
    }
    return cache.get(number);
  };
  const dirty = memo(
    (paths) => {
      if (paths.length === 0) return [];
      try {
        const changed = git('diff', '--name-only', 'HEAD', '--', ...paths);
        const added = git('ls-files', '--others', '--exclude-standard', '--', ...paths);
        return [...new Set([...changed, ...added].filter(Boolean))];
      } catch {
        return paths;
      }
    },
    (paths) => paths.join('\0'),
  );
  const committedSince = memo(
    (path, since) => {
      if (!since) return false;
      try {
        return git('log', '-1', '--format=%h', `--since=${since}`, 'HEAD', '--', path)[0] !== '';
      } catch {
        return false;
      }
    },
    (path, since) => `${since}\0${path}`,
  );
  return { merged, dirty, committedSince, note };
}

const cyclicEdges = (tasks) => {
  const edges = new Set();
  for (const task of tasks.values()) {
    if (task.status !== 'offered') continue;
    for (const wait of task.waits) {
      const taskId = wait.match(WAIT)?.[2];
      const next = taskId && follow(taskId, tasks);
      if (next?.status === 'offered' && (next.id === task.id || loopsBack(next, task, tasks))) edges.add(`${task.id} ${next.id}`);
    }
  }
  return edges;
};

const loopsBack = (from, origin, tasks, seen = new Set()) => {
  if (seen.has(from.id)) return false;
  seen.add(from.id);
  return from.waits.some((wait) => {
    const [, , taskId] = wait.match(WAIT) ?? [];
    const next = taskId && follow(taskId, tasks);
    return next?.status === 'offered' && (next.id === origin.id || loopsBack(next, origin, tasks, seen));
  });
};

export const patchPaths = (text) => [...new Set([...text.matchAll(/^diff --git a\/(\S+) b\/(\S+)$/gmu)].flatMap((match) => [match[1], match[2]]))];

// A new card session starts from the branch's last commit, so a task waiting on
// a landed patch starts only once each patched path is committed. A path still
// dirty counts as committed when a commit after the landed row touched it,
// because the dirt is a later task's edit on top of the landed work.
function uncommitted(task, git) {
  if (!existsSync(task.patch)) return { text: `task:${task.id} landed, but its patch ${task.patch} is gone, so nothing shows its paths are committed`, stuck: true };
  const paths = patchPaths(readFileSync(task.patch, 'utf8'));
  const waiting = git.dirty(paths).filter((path) => !git.committedSince(path, task.landedAt));
  return waiting.length ? { text: `task:${task.id} landed, waiting for a commit of ${waiting.join(', ')}` } : null;
}

function waitBlocker(wait, origin, tasks, git) {
  const [, pr, taskId, plan] = wait.match(WAIT) ?? [];
  if (pr) {
    const merged = git.merged(Number(pr));
    if (merged) return null;
    return { text: merged === null ? `pr:${pr} unreadable, git log failed` : `pr:${pr} not merged` };
  }
  if (taskId) {
    const task = follow(taskId, tasks);
    if (!task) return { text: `task:${taskId} dangling, no such task`, stuck: true };
    if (task.id === origin.id) return { text: `task:${taskId} is this task`, stuck: true };
    if (isOpen(task)) return task.status === 'offered' && loopsBack(task, origin, tasks) ? { text: `task:${taskId} waits back on ${origin.id}`, stuck: true } : { text: `task:${taskId} ${task.status}` };
    if (task.status === 'landed' && task.patch) return uncommitted(task, git);
    if (task.status === 'landed' || task.reason === 'done') return null;
    return { text: `task:${taskId} closed as dismissed ${task.reason} without its result`, stuck: true };
  }
  if (plan) {
    const onOrigin = trunk() && !isAbsolute(plan);
    const text = onOrigin ? planOnOrigin(plan) : existsSync(plan) ? readFileSync(plan, 'utf8') : null;
    if (text === null) return onOrigin && planInWorktree(plan) ? { text: `run:${plan} not landed` } : { text: `run:${plan} dangling, no such plan`, stuck: true };
    const status = text.match(/^Status:\s*(.*)$/mu)?.[1] ?? '';
    if (landed(status)) return null;
    const state = stateOf(status);
    return state === 'done' ? { text: `run:${plan} closed without its result`, stuck: true } : { text: `run:${plan} ${state ?? 'without a Status line'}` };
  }
  return { text: `${wait} malformed`, stuck: true, malformed: true };
}

function queueBlockers(task, tasks, git, ready) {
  const found = blockersOf(task, tasks, git);
  const ahead = ready.find((peer) => overlaps(apartKeys(task.keys), apartKeys(peer.keys)));
  if (found.length === 0 && ahead) found.push({ text: `queued behind ${ahead.id}, which writes the same paths outside this checkout` });
  return found;
}

function blockersOf(task, tasks, git) {
  const found = task.waits.map((wait) => waitBlocker(wait, task, tasks, git)).filter(Boolean);
  for (const peer of tasks.values()) {
    if (peer.id !== task.id && peer.status === 'started' && overlaps(apartKeys(task.keys), apartKeys(peer.keys))) found.push({ text: `started ${peer.id} writes its paths outside this checkout` });
  }
  return found;
}

export function offeredAt(lines) {
  const at = new Map();
  for (const line of lines) {
    const [ts, phase, decision = '', , , result = ''] = line.split('\t');
    const id = decision.match(CHIP)?.[1];
    if (phase === 'chip' && id && result.startsWith('offered') && !at.has(id)) at.set(id, ts);
  }
  return at;
}

// The notes older ledger migrations wrote in place of a finding, one per
// semicolon-separated clause.
const MIGRATION_NOTE = /^(?:[Oo]ffered \d{4}-\d{2}-\d{2}\b.* by |moved from \S|waits for(?::|\s+(?:task_|t_|udecode\/|the (?:started|open|paused) ))|no open run or task writes its paths$|retagged under the suggested-tasks rule$|merges (?:task_|t_)|and (?:the (?:started |open )?tasks? |task_|t_))/u;
const isMigrationNote = (finding) => finding.split(/;\s+/u).every((clause) => MIGRATION_NOTE.test(clause.trim()));
const possiblyThin = (task) => [...task.findings, ...task.covers.flatMap((entry) => entry.findings)].every(isMigrationNote);

export function staleReport(tasks, at, probe) {
  const rows = [...tasks.values()]
    .filter(isOpen)
    .sort(byOrder)
    .map((task) => {
      const since = at.get(task.id);
      const absent = task.writes.filter((path) => !probe.exists(path));
      const deleted = since ? absent.filter((path) => probe.deletedSince(since, path)) : [];
      const missing = absent.filter((path) => !deleted.includes(path));
      const commits = since ? probe.commitsSince(since, task.writes.filter((path) => probe.exists(path))) : [];
      const closed = task.waits.flatMap((wait) => {
        const pr = wait.match(WAIT)?.[1];
        const state = pr && probe.prState(Number(pr));
        return state && state !== 'OPEN' ? [`pr:${pr} ${state.toLowerCase()}`] : [];
      });
      const shipClosed = Boolean(task.ship && probe.ship && !probe.ship.some((item) => item.id === task.ship));
      const facts = [
        since ? `age ${Math.floor((probe.now - Date.parse(since)) / 86_400_000)}d` : 'age unknown',
        priorityOf(task) ? `priority ${priorityOf(task)}${task.blocks ? ` (own ${task.priority ?? 'none'}, from ${task.blocks})` : ''}` : 'no priority',
        ...(shipClosed ? [`ship item ${task.ship} is no longer open`] : []),
        ...(task.status === 'started' ? [task.startedIn ? `started in session ${task.startedIn}` : 'started'] : []),
        ...(deleted.length ? [`deleted since its offer: ${deleted.join(', ')}`] : []),
        ...(missing.length ? [`missing: ${missing.join(', ')}`] : []),
        ...(commits.length ? [`${commits.length} ${commits.length === 1 ? 'commit' : 'commits'} on its paths since its offer, last "${commits[0]}"`] : []),
        ...closed,
        ...(possiblyThin(task) ? ['possibly thin: every finding is a note an older migration wrote, so add the finding before its next card'] : []),
        ...(projectConfig().triage?.experimental && task.status === 'offered' && !task.reviewScope ? ['no review scope'] : []),
        ...(task.card ? [`card ${task.card}${task.session ? ` in session ${task.session}` : ''}`] : []),
      ];
      return { task, facts, weight: 3 * (deleted.length > 0) + 3 * (closed.length > 0) + 3 * shipClosed + 2 * possiblyThin(task) + (missing.length > 0) + (commits.length > 0) };
    })
    .sort((a, b) => b.weight - a.weight || byOrder(a.task, b.task));
  return rows.map(({ task, facts }) => line(task, `  ${facts.join('; ')}`));
}

const COMMON_WORDS = new Set('the and are for its with from into onto over under through after before when whose that this their his her one two every each make keep find why fix let give stop decide whether what how does not more than again also xhigh fast'.split(' '));
const wordsOf = (text) => new Set(text.toLowerCase().split(/[^a-z0-9]+/u).filter((word) => word.length > 2 && !COMMON_WORDS.has(word)).map((word) => (word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word)));
const shareOf = (a, b) => {
  const both = [...a].filter((word) => b.has(word)).length;
  return both / (a.size + b.size - both || 1);
};
const CODE_NAME = /\b(?:[a-z][a-z0-9]*[A-Z][a-z0-9]+\w*|[\w-]+(?:\.[\w-]+)*\.(?:tsx?|jsx?|mjs))\b/gu;
const REPRO_FILE = /[\w./-]+\.(?:test|spec)\.[a-z]+|[\w./-]+\.log\b/gu;
const WRITTEN_FILE = /(?:^|\/)[^/.][^/]*\.[a-z0-9]+$/iu;
const RARE = 3;
const TITLE_SHARE = 0.3;
const TOPIC_SHARE = 0.5;
const KINDS_TO_PAIR = 2;

const judgedApart = (task, other, tasks) => task.apart.some((id) => follow(id, tasks)?.id === other.id) || other.apart.some((id) => follow(id, tasks)?.id === task.id);

const isBookkeeping = (path, plans) => path.startsWith('.changeset/') || path === plans || path.startsWith(`${plans}/`);

export function groupsOf(tasks, plans = 'docs/plans') {
  const open = [...tasks.values()].filter(isOpen).sort(byOrder);
  const facts = new Map(
    open.map((task) => [
      task.id,
      {
        title: wordsOf(task.title),
        topic: wordsOf(task.topic ?? ''),
        repro: new Set(task.repro?.match(REPRO_FILE) ?? []),
        reproNames: new Set((task.repro?.match(REPRO_FILE) ?? []).map((file) => basename(file))),
        area: new Set([...task.writes.filter((path) => WRITTEN_FILE.test(path) && !isBookkeeping(path, plans)), ...([...task.findings, ...task.covers.flatMap((entry) => entry.findings)].join(' ').match(CODE_NAME) ?? [])]),
      },
    ]),
  );
  const named = new Map();
  for (const { area } of facts.values()) for (const key of area) named.set(key, (named.get(key) ?? 0) + 1);
  const waitsOn = (task, other) =>
    task.waits.some((wait) => {
      const target = wait.match(WAIT)?.[2];
      return target && follow(target, tasks)?.id === other.id;
    });
  const links = [];
  for (const [at, a] of open.entries()) {
    for (const b of open.slice(at + 1)) {
      if (waitsOn(a, b) || waitsOn(b, a) || judgedApart(a, b, tasks)) continue;
      const one = facts.get(a.id);
      const two = facts.get(b.id);
      const kinds = [];
      if (shareOf(one.title, two.title) >= TITLE_SHARE || (one.topic.size > 0 && shareOf(one.topic, two.topic) >= TOPIC_SHARE)) kinds.push('problem');
      const failure = [...a.owns.filter((check) => b.owns.includes(check)), ...[...one.repro].filter((file) => two.repro.has(file))];
      if (failure.length > 0) kinds.push(`failure (${failure.join(', ')})`);
      const area = [...one.area].filter((key) => two.area.has(key) && (named.get(key) <= RARE || (a.writes.includes(key) && b.writes.includes(key))) && !one.reproNames.has(basename(key)) && !two.reproNames.has(basename(key)));
      if (area.length > 0) kinds.push(`fix area (${area.slice(0, 3).join(', ')})`);
      if (kinds.length >= KINDS_TO_PAIR) links.push({ a, b, kinds });
    }
  }
  const root = new Map(open.map((task) => [task.id, task.id]));
  const rootOf = (id) => (root.get(id) === id ? id : rootOf(root.get(id)));
  for (const { a, b } of links) root.set(rootOf(b.id), rootOf(a.id));
  const groups = new Map();
  for (const link of links) {
    const group = groups.get(rootOf(link.a.id)) ?? { members: new Map(), links: [] };
    group.members.set(link.a.id, link.a).set(link.b.id, link.b);
    group.links.push(link);
    groups.set(rootOf(link.a.id), group);
  }
  return [...groups.values()].map((group) => ({ members: [...group.members.values()].sort(byOrder), links: group.links })).sort((x, y) => byOrder(x.members[0], y.members[0]));
}

export function renderGroups(groups, ledger) {
  if (groups.length === 0) return `No two open tasks in ${ledger} share two kinds of evidence, so no group needs judging.`;
  const out = [
    `${groups.length} ${groups.length === 1 ? 'group' : 'groups'} of open tasks in ${ledger} that may answer one question. Judge each pair as chips.md's Groups bullet says: dismissed dup when they share two kinds of evidence and one fix removes both, and otherwise apart with from:, then a task: wait when an offered task needs the other's result or one fix removes both.`,
  ];
  for (const { members, links } of groups) {
    out.push('', ...links.map(({ a, b, kinds }) => `  ${a.id} and ${b.id}: ${kinds.join('; ')}`), ...members.map((task) => line(task, `  ${task.status === 'started' ? 'started' : task.card ? `card ${task.card}` : 'no card'}`)));
  }
  return out.join('\n');
}

export function startedOverlaps(tasks) {
  const started = [...tasks.values()].filter((task) => task.status === 'started');
  return started.flatMap((task, at) =>
    started
      .slice(at + 1)
      .filter((peer) => overlaps(apartKeys(task.keys), apartKeys(peer.keys)))
      .map((peer) => `${task.id} and ${peer.id} are both started on an overlapping path outside this checkout; the owner runs both`),
  );
}

// A session cards only the tasks it owns. With all, it also cards the tasks no
// session owns and takes over each one whose owner is not in live, the ids of
// the sessions not archived; without live, no owner counts as gone.
export function board(tasks, git, here = null, { transcript = null, all = false, live = null, ship = NO_SHIP } = {}) {
  const open = [...tasks.values()].filter(isOpen).sort(byOrder);
  const started = open.filter((task) => task.status === 'started');
  const offered = open.filter((task) => task.status === 'offered');
  const lost = [...tasks.values()].filter((task) => task.status === 'dismissed' && task.reason === 'gone').sort(byOrder);
  const ready = [];
  const waiting = [];
  const unmigrated = [];
  const cardedFirst = [...offered.filter((each) => each.card), ...offered.filter((each) => !each.card).sort((a, b) => Number(a.deferred) - Number(b.deferred))];
  for (const task of cardedFirst) {
    if (!task.topic) {
      unmigrated.push(task);
      continue;
    }
    const found = queueBlockers(task, tasks, git, ready);
    if (found.length > 0) waiting.push({ task, blockers: found.map((blocker) => blocker.text), stuck: found.filter((blocker) => blocker.stuck).map((blocker) => blocker.text) });
    else ready.push(task);
  }
  ready.sort(byPriority);
  waiting.sort((a, b) => byPriority(a.task, b.task));
  const topics = new Map();
  for (const task of open) {
    if (!task.topic) continue;
    const entry = topics.get(task.topic) ?? { topic: task.topic, tasks: [], decides: [] };
    entry.tasks.push(task);
    if (task.kind === 'decide') entry.decides.push(task);
    topics.set(task.topic, entry);
  }
  const freeDecides = (entry) => entry.decides.filter((task) => task.status === 'offered' && !waitsInTopic(task, tasks));
  const elsewhere = (task) => here !== null && task.session !== here;
  const checks = offered
    .filter((task) => task.card && elsewhere(task))
    .map((task) => {
      const blocker = waiting.find((entry) => entry.task === task)?.blockers[0];
      const holds = `${task.id}'s card ${task.card}${blocker ? ` on a task that now waits on ${blocker}` : ''}`;
      return {
        kind: 'check',
        text: task.session ? `check session ${task.session}, which holds ${holds}: when the session tool reports it archived or gone, log uncarded with card: ${task.card}` : `check ${holds}, which names no session: when the owner says it is gone, log uncarded with card: ${task.card}`,
      };
    });
  const runs = started
    .filter((task) => here !== null && task.startedIn !== here)
    .map((task) => ({
      kind: 'check',
      text: task.startedIn
        ? `check session ${task.startedIn}, which started ${task.id}: when the session tool reports it archived, ${
            trunk()
              ? `log landed with commit: once a commit on origin/${branch()} holds its change, because a session whose land.mjs opened a PR has not landed it yet; and log dismissed stopped when no such commit holds it and its worktree is gone or holds no edit on its paths`
              : "log landed when a commit holds its change or its last report says it landed the change, with patch: when it names one; when that report hands back a patch it never applied, land that patch as chips brief's footer says and log landed with patch:; and log dismissed stopped when it hands back no patch and neither this checkout nor its worktree holds an uncommitted edit on its paths"
          }`
        : `find the session that started ${task.id} with the session tool, archived sessions included, as the one whose transcript opens with its card prompt, and log started with session: <its id>; when the search finds none, ${task.id} stays started`,
    }));
  const me = here === null ? null : { session: here, transcript };
  const mine = (task) => !task.ship && !task.outside && (here === null || ownedBy(task, me));
  const ownerless = (task) => !ownerOf(task) && !ownerTranscriptOf(task);
  const mayCard = (task) => mine(task) || (all && ownerless(task));
  const others = offered.filter((task) => !mine(task));
  const adoptions = all
    ? others
        .filter((task) => !task.card && ownerOf(task) && live !== null && !live.has(ownerOf(task)))
        .map((task) => ({ kind: 'adopt', ids: [task.id], text: `take ${task.id}: its owner session ${ownerOf(task)} is archived or gone; log updated with session: ${here}` }))
    : [];
  const withdrawals = [
    ...waiting
      .filter(({ task }) => task.card && !elsewhere(task))
      .map(({ task, blockers }) => ({ kind: 'problem', ids: [task.id], text: `withdraw ${task.id}'s card ${task.card}: ${blockers[0]}; ${withdrawn(task.card)} once it is withdrawn or its session has ended` })),
    ...ready
      .filter((task) => task.card && !elsewhere(task) && cardDrift(task))
      .map((task) => ({ kind: 'effort', ids: [task.id], text: `withdraw ${task.id}'s card ${task.card}: ${cardDrift(task)}; ${withdrawn(task.card)} once it is withdrawn or its session has ended, and the card pass offers it again` })),
    ...displacedCards(ready, waiting, offered, elsewhere, (task) => mayCard(task) && ownPriority(task))
      .map(({ task, crowded }) => ({ kind: 'deferred', ids: [task.id], text: `withdraw ${task.id}'s card ${task.card}: its review scope is deferred, and ${crowded} ready ${crowded === 1 ? 'task that ranks' : 'tasks that rank'} above it ${crowded === 1 ? 'has' : 'have'} no room for a card; ${withdrawn(task.card)} once it is withdrawn or its session has ended` })),
  ];
  const misdeferred = deferredProblem();
  const mistiered = tiersProblem();
  const rows = [
    ...(misdeferred ? [{ kind: 'problem', ids: [], text: misdeferred }] : []),
    ...(mistiered ? [{ kind: 'problem', ids: [], text: mistiered }] : []),
    ...waiting.flatMap(({ task, stuck }) => stuck.map((blocker) => ({ kind: 'problem', ids: [task.id], text: `fix ${task.id}'s wait: ${blocker}; log updated with the waits it has now` }))),
    ...[...topics.values()]
      .filter((entry) => freeDecides(entry).length > 1)
      .map((entry) => ({ kind: 'problem', ids: freeDecides(entry).map((task) => task.id), text: `fold topic ${entry.topic}: ${freeDecides(entry).map((task) => task.id).join(' and ')} are both open design questions; keep one and log the others as dismissed dup <kept id>` })),
    ...unmigrated.flatMap((task) => blockersOf(task, tasks, git).filter((blocker) => blocker.stuck && !blocker.malformed).map((blocker) => ({ kind: 'problem', ids: [task.id], text: `fix ${task.id}'s wait: ${blocker.text}; log updated with the waits it has now` }))),
    ...unmigrated.map((task) => ({ kind: 'migrate', ids: [task.id], text: `migrate ${task.id}: log updated with topic:, priority: and the waits: it has, as waits: none when it has none` })),
    ...offered
      .filter((task) => task.topic && !ownPriority(task))
      .map((task) => ({ kind: 'priority', ids: [task.id], text: `prioritize ${task.id}: log updated with priority: and the evidence a P0 or P1 claim needs, as chips.md's Priority says` })),
    ...shipOffers(ship.items, tasks, open),
    ...lost.map((task) => ({ kind: 'migrate', ids: [task.id], text: `reopen ${task.id} or close it: a dropped card closed it as gone; log reopened, then updated with topic: and waits:, or dismissed done or superseded` })),
  ];
  const owed = [...tasks.values()].filter((task) => task.status === 'landed' && fastOf(task) && !task.reviewed).sort(byOrder);
  rows.push(...reviewItems(tasks, owed), ...adoptions);
  const merge = mergeItem(offered, tasks, git);
  const cardable = ready.filter((task) => !task.card && mayCard(task) && ownPriority(task));
  const room = Math.max(0, CARD_LIMIT - offered.filter((task) => task.card && !elsewhere(task)).length);
  const notes = cardable.length > room ? [{ kind: 'note', text: `${cardable.length - room} more can start once this session holds fewer than ${CARD_LIMIT} cards; the card pass offers them in board order` }] : [];
  const cards = cardable
    .slice(0, room)
    .map((task) => {
      const shared = sharesWith(task, open);
      const hint = shared.length ? `, starting with ${shared.join(', ')}, which ${shared.length === 1 ? 'writes' : 'write'} its paths` : '';
      return {
        kind: 'card',
        ids: [task.id],
        text: `card ${task.id}: it can start and has no card; first judge whether it needs the result of another open task${hint}, or of an open design question its work builds on, and when it does, log updated with its waits plus task:<that id> instead; otherwise offer it with the prompt from chips brief ${task.id} and log carded, or list it in Open work where the runtime has no suggest tool`,
      };
    });
  const passes = [
    ['withdrawal', here === null ? [] : withdrawals],
    ['ledger', merge ? [merge, ...rows.filter((item) => !item.ids.some((id) => merge.ids.includes(id)))] : rows],
    ['card', cards],
  ];
  const [pass, items] = passes.find(([, each]) => each.length > 0) ?? [null, []];
  const problem = [...withdrawals, ...rows].some((item) => item.kind === 'problem');
  return { open, ready, cardable, others, all, started, waiting, unmigrated, lost, owed, topics: [...topics.values()], todo: [...items, ...(pass === 'card' || pass === null ? notes : []), ...checks, ...runs], pass, problem, here, note: git.note, shipNote: ship.note };
}

const failsOnBase = (task) => task.owns.length > 0;
const ownPriority = (task) => (failsOnBase(task) ? 'P0' : task.priority);
export const priorityOf = (task) => higher(ownPriority(task), task.blockingPriority);

const cardDrift = (task) => (task.cardEffort && task.cardEffort !== levelOf(task) ? `it was offered at ${task.cardEffort} and the task is at ${levelOf(task)} now` : null);

function liftPriorities(tasks) {
  for (const task of tasks.values()) {
    task.blockingPriority = null;
    task.blocks = null;
  }
  const waiters = [...tasks.values()].filter((task) => task.status === 'offered');
  let changed = true;
  while (changed) {
    changed = false;
    for (const waiter of waiters) {
      const level = priorityOf(waiter);
      for (const wait of waiter.waits) {
        const blocker = follow(wait.match(WAIT)?.[2] ?? '', tasks);
        const current = blocker && priorityOf(blocker);
        if (!level || !blocker || blocker === waiter || !isOpen(blocker) || (waiter.deferred && !blocker.deferred) || (current && current <= level)) continue;
        blocker.blockingPriority = level;
        blocker.blocks = waiter.id;
        changed = true;
      }
    }
  }
}

const deferredScopes = () => {
  const listed = projectConfig().chips?.deferred;
  return Array.isArray(listed) ? listed : [];
};

function deferredProblem() {
  const { deferred, scopes } = projectConfig().chips ?? {};
  if (deferred === undefined) return null;
  if (!Array.isArray(deferred) || !deferred.every((id) => typeof id === 'string')) return 'fix chips.deferred in .agents/pstack.json: it is a list of review scope ids, such as ["collaboration"], so chips defers no task until it is one';
  const unknown = scopes ? deferred.filter((id) => !reviewScopes(scopes).includes(id)) : [];
  return unknown.length ? `fix chips.deferred in .agents/pstack.json: ${unknown.join(', ')} is no review scope in ${scopes}, so chips defers no task for it` : null;
}

function markDeferred(tasks) {
  const deferred = deferredScopes();
  for (const task of tasks.values()) task.deferred = deferred.includes(task.reviewScope) && !failsOnBase(task);
  undeferBlockers(tasks);
}

function displacedCards(ready, waiting, offered, elsewhere, cardable) {
  const leaving = new Set(waiting.map(({ task }) => task));
  const kept = offered.filter((task) => task.card && !elsewhere(task) && !leaving.has(task)).length;
  const crowded = ready.filter((task) => !task.card && !task.deferred && cardable(task)).length - Math.max(0, CARD_LIMIT - kept);
  if (crowded <= 0) return [];
  const deferredCards = ready.filter((task) => task.card && !elsewhere(task) && task.deferred && !cardDrift(task));
  return deferredCards.slice(-crowded).map((task) => ({ task, crowded }));
}

function undeferBlockers(tasks) {
  const waiters = [...tasks.values()].filter((task) => task.status === 'offered');
  let changed = true;
  while (changed) {
    changed = false;
    for (const waiter of waiters) {
      if (waiter.deferred) continue;
      for (const wait of waiter.waits) {
        const blocker = follow(wait.match(WAIT)?.[2] ?? '', tasks);
        if (!blocker?.deferred || blocker === waiter || !isOpen(blocker)) continue;
        blocker.deferred = false;
        changed = true;
      }
    }
  }
}

const rank = (task) => {
  const at = PRIORITIES.indexOf(priorityOf(task));
  return at === -1 ? PRIORITIES.length : at;
};

const milestoneClassOf = ({ reviewScope, regression }) => {
  const experimental = projectConfig().triage?.experimental;
  if (!experimental || !reviewScope || reviewScope === 'none') return null;
  if (regression.length > 0) return 'regression';
  return experimental.includes(reviewScope) ? 'experimental' : 'new';
};
const MILESTONE_RANK = { regression: 0, new: 1, experimental: 2 };
const milestoneRank = (task) => MILESTONE_RANK[milestoneClassOf(task) ?? 'new'];

const configuredTiers = () => {
  const listed = projectConfig().chips?.tiers;
  return Array.isArray(listed) ? listed : null;
};
const matchers = (tier) => (tier.paths?.length ?? 0) + (tier.scopes?.length ?? 0);
const under = (path, dirs = []) => dirs.some((dir) => path === dir.replace(/\/$/u, '') || path.startsWith(dir.endsWith('/') ? dir : `${dir}/`));
const tierOf = (task) => {
  const tiers = configuredTiers();
  if (!tiers) return null;
  if (task.regression.length > 0 || failsOnBase(task)) return { name: 'regression', at: -1 };
  const hit = tiers.findIndex((tier) => matchers(tier) > 0 && (task.writes.some((path) => under(path, tier.paths) && !under(path, tier.except)) || (tier.scopes ?? []).includes(task.reviewScope)));
  const at = hit === -1 ? tiers.findIndex((tier) => matchers(tier) === 0) : hit;
  return at === -1 ? { name: 'other', at: tiers.length } : { name: tiers[at].name, at };
};
const classRank = (task) => tierOf(task)?.at ?? milestoneRank(task);
const classLabel = (task) => tierOf(task)?.name ?? milestoneClassOf(task);

function tiersProblem() {
  const tiers = projectConfig().chips?.tiers;
  if (tiers === undefined) return null;
  const list = (value) => value === undefined || (Array.isArray(value) && value.every((each) => typeof each === 'string' && each));
  const fine = Array.isArray(tiers) && tiers.every((tier) => tier && typeof tier.name === 'string' && tier.name && list(tier.paths) && list(tier.except) && list(tier.scopes));
  if (!fine) return 'fix chips.tiers in .agents/pstack.json: it is a list of { name, paths, except, scopes } in rank order, each list of strings, so chips ranks by milestone class until it is one';
  const loose = tiers.filter((tier) => matchers(tier) === 0);
  return loose.length > 1 ? `fix chips.tiers in .agents/pstack.json: ${loose.map((tier) => tier.name).join(' and ')} name no paths or scopes, and only one tier may catch the tasks no other tier matches` : null;
}

const PUBLIC_ISSUE = /(?<![&\w])[\w.-]*#\d+\b|:\/\/\S+\/issues\/\d+/u;
const issueRank = (task) => (PUBLIC_ISSUE.test(task.repro ?? '') ? 0 : 1);
const byPriority = (a, b) => Number(a.deferred) - Number(b.deferred) || rank(a) - rank(b) || classRank(a) - classRank(b) || issueRank(a) - issueRank(b) || byOrder(a, b);

function shipOffers(items, tasks, open) {
  const served = new Set(open.map((task) => task.ship).filter(Boolean));
  return (items ?? [])
    .filter((item) => !served.has(item.id))
    .map((item) => {
      const landedFor = [...tasks.values()].filter((task) => task.status === 'landed' && task.ship === item.id).sort(byOrder).at(-1);
      const flag = landedFor ? `; ${landedFor.id} landed serving it, so first check whether only the item's own record still lists it open` : '';
      const waits = item.waits.length ? `; waits: ${item.waits.join(', ')}` : '';
      const tokens = `writes: ${item.writes.join(', ')}; topic: ${item.topic}; kind: ${item.kind}; priority: P1; ship: ${item.id}${waits}`;
      return { kind: 'ship', ids: [], text: `offer ship item ${item.id}, which no open task serves${flag}: append chip "${newId()} ${item.title}" "${item.finding}" "${tokens}" offered` };
    });
}

// Fast work stays owed until a review task covers it, so a declined or
// stopped review leaves it owed again.
function reviewItems(tasks, owed) {
  const reviews = [...tasks.values()].filter((task) => task.kind === 'review' && isOpen(task)).sort(byOrder);
  const covered = (task) => reviews.some((review) => review.waits.some((wait) => follow(wait.match(WAIT)?.[2] ?? '', tasks) === task));
  const inFlight = [...tasks.values()].filter((task) => fastOf(task) && ((task.status === 'offered' && task.card) || task.status === 'started'));
  const uncovered = [...inFlight, ...owed].filter((task) => !covered(task)).sort(byOrder);
  if (uncovered.length === 0) return [];
  const ids = uncovered.map((task) => task.id);
  const waits = ids.map((id) => `task:${id}`).join(', ');
  const open = reviews.find((review) => review.status === 'offered' && !review.card);
  if (open) return [{ kind: 'review', ids: [open.id, ...ids], text: `review the fast work of ${ids.join(', ')}: log updated on ${open.id} with its waits plus ${waits}` }];
  const writes = [...new Set(uncovered.flatMap((task) => task.writes))].join(', ');
  return [{ kind: 'review', ids, text: `review the fast work of ${ids.join(', ')}: offer one task titled "Review the fast work of ${ids.join(', ')}" with writes: ${writes}; topic: fast-review; kind: review; waits: ${waits}` }];
}

function mergeItem(offered, tasks, git) {
  for (const task of offered) {
    if (task.card || !task.topic) continue;
    for (const wait of task.waits) {
      const target = wait.match(WAIT)?.[2];
      const keeper = target && follow(target, tasks);
      if (!keeper || keeper.status !== 'offered' || keeper.card || keeper.topic !== task.topic || judgedApart(task, keeper, tasks) || waitBlocker(wait, task, tasks, git)?.stuck) continue;
      const cells = ['chip', task.decision, 'its card is gone, so it joins the task it waited on', '', `dismissed dup ${keeper.id}`];
      if (chipRowProblems(cells, tasks, 'merge').length === 0 && newChipRowProblems(cells, tasks, 'merge', git).length === 0) {
        return { kind: 'merge', ids: [task.id, keeper.id], text: `merge ${task.id} into ${keeper.id}: ${keeper.id} has no card now, so log ${task.id} dismissed dup ${keeper.id}` };
      }
    }
  }
  return null;
}

const sharesWith = (task, open) => {
  const ids = open.filter((peer) => peer.id !== task.id && overlaps(task.keys, peer.keys)).map((peer) => peer.id);
  return ids.length > 5 ? [...ids.slice(0, 5), `${ids.length - 5} more`] : ids;
};

const line = (task, extra = '') => `  ${task.id}  ${displayTitle(task)}${task.topic ? `  [${task.topic}${task.kind === 'decide' ? ', decide' : ''}]` : ''}${classLabel(task) ? `  ${classLabel(task)}` : ''}${task.owns.length ? `  owns ${task.owns.join(', ')}` : ''}${extra}`;

export function renderBoard(view, ledger, max = null) {
  if (view.open.length === 0 && view.lost.length === 0 && view.owed.length === 0) return `No open suggested tasks in ${ledger}.`;
  const out = [`${view.open.length} open suggested tasks in ${ledger}. ${view.note}`, 'A session a card started works from chips brief <its task id>, because its task can change after the card.'];
  if (view.shipNote) out.push(`No ship list: ${view.shipNote}.`);
  if (view.here && view.all) out.push('This session cards the tasks it owns, the ship-list tasks and the ones no session owns, and takes over each task whose owner session is archived or gone.');
  else if (view.here) out.push('This session cards the tasks it owns, the ones it offered or carded first when the offer named no session. chips all also takes the ship-list tasks, which no session owns, and the tasks no live session owns.');
  const section = (title, rows) => {
    if (rows.length > 0) out.push('', `${title} (${rows.length})`, ...rows);
  };
  const owners = new Map();
  for (const task of view.others) {
    const owner = ownerOf(task) ? `session ${ownerOf(task)}` : 'no owner';
    owners.set(owner, [...(owners.get(owner) ?? []), task.id]);
  }
  const card = (task) => `  card ${task.card}${task.session && task.session !== view.here ? ` in session ${task.session}` : ''}`;
  const loweredEffort = (task) => {
    const capped = effortOf(task, max);
    return capped === effortOf(task, null) ? '' : `  effort ${capped}`;
  };
  const shares = (task) => {
    const shared = sharesWith(task, view.open);
    return shared.length ? `  shares paths with ${shared.join(', ')}` : '';
  };
  // P2, P3 and untagged tasks show as counts unless chips all, because every
  // sweep reads the board and the urgent tiers are what it acts on.
  const tiered = (title, entries, taskOf, render) => {
    const hidden = [];
    for (const tier of [...PRIORITIES, null]) {
      const group = entries.filter((entry) => (priorityOf(taskOf(entry)) ?? null) === tier);
      const name = tier ?? 'no priority';
      if (view.all || tier === 'P0' || tier === 'P1') section(`${title}, ${name}`, group.map(render));
      else if (group.length > 0) hidden.push(`${name} ${group.length}`);
    }
    if (hidden.length > 0) out.push('', `${title}, lower priority (${hidden.join(', ')}): chips all lists them`);
  };
  const deferredApart = (title, entries, taskOf, render) => {
    tiered(title, entries.filter((entry) => !taskOf(entry).deferred), taskOf, render);
    tiered(`${title}, deferred`, entries.filter((entry) => taskOf(entry).deferred), taskOf, render);
  };
  const blocking = (task) => (task.blocks ? `  blocks ${task.blocks}` : '');
  deferredApart('Ready', view.ready, (task) => task, (task) => line(task, loweredEffort(task) + blocking(task) + (task.card ? card(task) : '  no card') + shares(task)));
  section('Started', view.started.map((task) => line(task, task.startedIn ? `  session ${task.startedIn}` : '')));
  deferredApart('Waiting', view.waiting, ({ task }) => task, ({ task, blockers }) => line(task, `${loweredEffort(task)}${blocking(task)}  waits on ${blockers.join('; ')}`));
  section('Owed review', view.owed.map((task) => line(task, task.patch ? `  patch ${task.patch}` : '')));
  section('Unmigrated', view.unmigrated.map((task) => line(task)));
  section('Lost', view.lost.map((task) => line(task)));
  section('Other owners', [...owners].map(([owner, ids]) => `  ${owner}  ${ids.length} open: ${ids.join(', ')}`));
  section(
    'Topics',
    view.topics.filter((entry) => entry.tasks.length > 1 || entry.decides.length > 0).map((entry) => `  ${entry.topic}  ${entry.tasks.length} open${entry.decides.length ? `, design question ${entry.decides.map((task) => task.id).join(' and ')}` : ''}`),
  );
  section(view.pass ? `Do, ${view.pass} pass` : 'Do', view.todo.map((item) => `  ${item.text}`));
  return out.join('\n');
}

const XHIGH = ' (xhigh)';
const FAST = ' (fast)';
// An effort: token outranks the title, so a row can lower a task an older offer tagged (xhigh).
const levelOf = (task) => (task.kind === 'decide' ? 'xhigh' : (task.effort ?? (task.title.endsWith(XHIGH) || task.covers.some((entry) => entry.title.endsWith(XHIGH)) ? 'xhigh' : 'high')));
const needsJudgment = (task) => levelOf(task) === 'xhigh';
// Read from the task as it stands, so a fold or dup that raises it drops the mark.
const fastOf = (task) => task.fast && task.kind === 'fix' && !needsJudgment(task);
const displayTitle = (task) => (task.title.endsWith(XHIGH) ? task.title.slice(0, -XHIGH.length) : task.title) + (needsJudgment(task) ? XHIGH : '') + (fastOf(task) ? FAST : '');
export const effortOf = (task, max) => capEffort(levelOf(task), max);

export function boardState(tasks, task, git, wholeBoard) {
  if (task.status === 'started') return 'Started';
  if (task.status !== 'offered') return taskState(task);
  if (!task.topic) return 'Unmigrated, because it has no topic';
  const found = apartKeys(task.keys).length > 0 ? (wholeBoard().waiting.find((entry) => entry.task === task)?.blockers ?? []) : queueBlockers(task, tasks, git, []).map((blocker) => blocker.text);
  return found.length > 0 ? `Waiting on ${found.join('; ')}` : 'Ready';
}

// codex is the project's chips.codex setting; "always" forces the Codex handoff on every task.
export function briefOf(tasks, id, ledger, max = null, codex = null, stateOf = null) {
  const task = tasks.get(id);
  const live = follow(id, tasks);
  if (['dup', 'replaced'].includes(task.reason) && live && live !== task) {
    const moved = task.reason === 'dup' ? 'merged into' : 'replaced by';
    if (live.status === 'offered' && !live.card) return { ok: true, text: `${id} was ${moved} ${live.id}; work from its brief.\n\n${brief(live, ledger, max, tasks, codex, stateOf?.(live))}` };
    const held = live.status === 'offered' ? `has card ${live.card}` : `is ${taskState(live)}`;
    return { ok: false, text: `${id} was ${moved} ${live.id}, which ${held}, so there is nothing to start; tell the owner.` };
  }
  return isOpen(task) ? { ok: true, text: brief(task, ledger, max, tasks, codex, stateOf?.(task)) } : { ok: false, text: `${id} is ${taskState(task)}, so there is nothing to start; tell the owner.` };
}

const shellQuoted = (text) => `"${text.replace(/["\\$`]/gu, '\\$&')}"`;

function brief(task, ledger, max, tasks, codex, state) {
  const root = process.cwd();
  const ref = checkoutRef();
  const onTrunk = trunk();
  const run = onTrunk ? 'node .agents/pstack/decisions-check.mjs' : `cd ${root} && node .agents/pstack/decisions-check.mjs`;
  const artifacts = join(projectConfig().plans || 'docs/plans', 'artifacts');
  const patch = resolve(root, artifacts, 'chips', `${task.id}.patch`);
  const reviewed = task.waits.map((wait) => follow(wait.match(WAIT)?.[2] ?? '', tasks)).filter(Boolean);
  const priority = priorityOf(task);
  const milestone = milestoneClassOf(task);
  const tier = tierOf(task);
  return [
    `${priority ? `[${priority}] ` : ''}${displayTitle(task)}`,
    '',
    `Topic: ${task.topic ?? 'none'}. Kind: ${task.kind}. Effort: ${effortOf(task, max)}. Priority: ${priority ?? 'none yet'}${task.blocks ? `, from ${task.blocks}, which waits on it; its own is ${task.priority ?? 'none yet'}` : ''}.`,
    ...(task.outside ? ['Owner: none. Its finding lies outside the domain of the run that offered it, so only /chips all cards it.'] : []),
    ...(task.repro ? [`Repro: ${task.repro}`] : []),
    ...(task.regressed ? [`Regressed in: ${task.regressed}`] : []),
    ...(task.ship ? [`Serves ship item: ${task.ship}`] : []),
    ...(task.reviewScope ? [`Review scope: ${task.reviewScope}.${milestone ? ` Milestone: ${milestone}.` : ''}${task.deferred ? ' Deferred, so it ranks after every task whose scope chips.deferred does not list.' : ''}`] : []),
    ...(tier ? [`Tier: ${tier.name}, ${tier.at === -1 ? 'first in its priority, because it owns a check that fails on the base branch or names a page where it still works' : `rank ${tier.at + 1} of chips.tiers within its priority`}.`] : []),
    ...(task.regression.length ? [`Regression: it still works on ${task.regression.join(', ')}`] : []),
    'Findings:',
    ...task.findings.map((finding) => `- ${finding}`),
    ...(task.covers.length ? ['Also covers:', ...task.covers.flatMap((entry) => [`- ${entry.id} ${entry.title}`, ...entry.findings.map((finding) => `  - ${finding}`)])] : []),
    `Writes: ${task.writes.join(', ')}`,
    ...(task.owns.length ? [`Owns: ${task.owns.join(', ')}`] : []),
    `Waited on: ${task.waits.length ? task.waits.join(', ') : 'nothing'}`,
    ...(state ? [`State: ${state}.`] : []),
    ...(task.kind === 'decide' ? ['', "This task settles a design question first. Route it through the project playbook that gives a design verdict, or pstack's Investigation playbook where the project has none, then plan any fix."] : []),
    ...(!onTrunk && (task.codex || codex === 'always') ? ['', "This task forces the Codex handoff, as the Codex workers rule says: once you have found the cause, or settled the design of a design question, hand Codex the code and its tests whatever the size of the change, then review what it wrote."] : []),
    ...(fastOf(task) ? ['', `This task is marked fast: the owner's start of its card, or their "start <id>", is the word fast for it, as the Fast rule says, so its run spawns no review subagent or seat. A review task in the ledger reviews its change once it lands, ${onTrunk ? 'so land it as below.' : 'so land it with patch: as below.'}`] : []),
    ...(task.kind === 'review'
      ? [
          '',
          'This task reviews the fast work of the tasks it waits on. Run a panel on their combined change, which each landed row names:',
          ...reviewed.map((each) => `- ${each.id} ${displayTitle(each)}: ${each.patch ?? (each.status !== 'landed' ? `still ${each.status}` : each.commits.length ? `commits ${each.commits.join(', ')}` : 'no patch; read the commits on its paths')}`),
          `Apply the fixes the Panel review rule accepts. Then log reviewed on each task you reviewed, as ${run} append ${ledger} chip "<its id> <its title>" "<what the review found>" "proof: none" reviewed, and land your own fixes as below.`,
        ]
      : []),
    '',
    onTrunk
      ? `Work in your own worktree, and land the task yourself from it with node .agents/pstack/land.mjs, as ${root}/.agents/pstack/rules/land.md says. Write your run directory under ${root}/${artifacts} by absolute path, so removing your worktree deletes nothing your rows cite, and write its files with the shell, such as a quoted heredoc, because the Claude Code desktop app refuses a worktree session's Edit or Write tool call in the main checkout, even where guard.mjs allows it. Once land.mjs has pushed, log landed with commit: <the hash it pushed>, so the lead's report links it; when it opens a PR instead, log nothing more and name the PR in your last report, because a later sweep logs landed once origin/${branch()} holds the change. Last, stop each server you started. Merge each run directory that you or a tool, such as a page render, wrote under ${artifacts} in your worktree into the same path in ${root} without overwriting, with mkdir -p <that path> && cp -Rn <your run directory>/. <that path>/, because removing the worktree deletes ignored files. Then run node ${root}/.agents/skills/cleanup/scripts/scan.mjs --landed <your worktree's absolute path>. When it exits 0, every change of yours is committed where a remote reaches it or in the checkout, and every file under ${artifacts} is in the checkout; other ignored files are build output or copies, so remove your worktree as your final command with git -C ${root} worktree remove --force <your worktree's absolute path> && git -C ${root} worktree list, and check that its list no longer names your worktree. Your next command may fail once because its directory is gone, so use absolute paths after it. When it exits otherwise or the script is missing, keep the worktree and tell the owner what it printed. In every report, name each commit by its subject in the text, and end the report with its links, local file links first and then each commit as 📦 [<subject>](https://diffshub.com/<owner>/<repo>/commit/<sha>), with the owner and repository read from ${root}'s origin remote; a commit in another repository puts its name first, as 📦 [<repo>: <subject>](...).`
      : `When you work in your own worktree and your project's rules bring your work to ${ref} as a patch rather than through your own branch, you may commit in your worktree as you go. When you finish, land it yourself: run git add -A in your worktree and save git diff --cached <base>, where <base> is what git merge-base HEAD ${ref} prints, which holds your commits, your uncommitted changes and new files, as ${patch}, run git -C ${root} apply --check --whitespace=error-all ${patch}, then git -C ${root} apply ${patch}, which changes only the checkout's working tree and leaves its index alone. When the check fails, commit your work, copy the checkout's copy of each refused file into your worktree and commit those copies unchanged, then redo your change on them, rerun your checks and commit again. Save the patch again as git diff <base> <copies commit> -- . ':(exclude)<refused file>', with one exclude for each refused file, followed by git diff <copies commit> HEAD, because a diff from <base> would also carry the checkout's own edits to those files, which the checkout already has. Then deliver the patch's paths from ${root} as your project's Delivery rule says, because an applied patch ships nothing: where that rule commits, commit only those paths there; where the owner owns commits, leave them in the working tree. Merge each run directory you wrote under ${artifacts} in your worktree into the same path in ${root} without overwriting, with mkdir -p <that path> && cp -Rn <your run directory>/. <that path>/, because append refuses a row whose evidence cites a path the checkout lacks, and removing the worktree deletes ignored files your logged rows cite. Then log landed with patch: ${patch}, adding commit: <hash>, <hash> for each commit you made, so the lead's report links them. Last, stop each server you started. Then run node ${root}/.agents/skills/cleanup/scripts/scan.mjs --landed <your worktree's absolute path>. When it exits 0, every change and ignored file of yours is committed, recreated by an install or build, or in the checkout, so remove your worktree as your final command with git -C ${root} worktree remove --force <your worktree's absolute path> && git -C ${root} worktree list, and check that its list no longer names your worktree. Your next command may fail once because its directory is gone, so use absolute paths after it. When it exits otherwise or the script is missing, keep the worktree and tell the owner what it printed. When you work in the checkout itself, or your project's rules deliver through your own branch instead, land the change as your project's Delivery rule says. When that branch is in your own worktree, merge your run directories as above first. Then log landed, with commit: for each commit you made. When that branch is in your own worktree, then stop each server, run scan.mjs --landed and remove the worktree, as above. In every report, name each commit by its subject in the text, and end the report with its links, local file links first and then each commit as 📦 [<subject>](https://diffshub.com/<owner>/<repo>/commit/<sha>), with the owner and repository read from ${root}'s origin remote; a commit in another repository puts its name first, as 📦 [<repo>: <subject>](...).`,
    '',
    `Suggested task ${task.id} in ${ledger} of the project checkout ${root}. First detach this session from the session that offered your card or started it, such as with Claude Code desktop's detach_session with self, because while it stays linked each of your turn ends wakes that session; when the runtime refuses or lacks the detach, carry on. This prompt can be older than the task, so next run ${run} chips brief ${task.id} and work from what it prints. ${onTrunk ? 'Run every ledger command as written from your own worktree, where you make your edits and run your checks; the helper writes the live ledger in the main checkout.' : `Run every ledger command from ${root} that way, even when your session opened in its own worktree, because the live ledger is there; make your edits and run your checks in your own worktree.`} This prompt holds all of the chips law your task needs, so skip .agents/pstack/rules/chips.md and the chips skill unless you offer, card or drop another task. Each row you log on this task is ${run} append ${ledger} chip ${shellQuoted(task.decision)} "<why>" "<tokens>" <result>, with that decision unchanged and each field in "<tokens>" ended by ";" before the next, such as "writes: a.ts, b.ts; session: <id>". When the State: line that chips brief prints says neither Ready nor Started, tell the owner what it says and stop. Started means the lead already logged your start. Before you write any file, log a started row with the tokens writes: naming each path the Writes line above lacks and session: naming this session's id where the runtime's session tool gives one, then run ${run} chips brief ${task.id} again and work from what it prints, because the task can gain work until your started row. Before you write a path for your task that neither the brief nor a started row lists, log another started row with it${onTrunk ? '' : '; when append refuses it because another started task writes that path outside the checkout, leave the path alone and tell the owner'}. When the session tool shows this session above the brief's Effort:, say so to the owner in your first reply, because a session cannot lower its own effort. Once your task has landed or its PR is open, and before you remove your worktree, fix each piece of workflow friction you hit and have not fixed yet, such as a helper that hid a result or a file you could not reach, as the Improve the workflow mid-task rule says, each fix in a commit of its own: project tooling lands the way your task did, and a shared rule or helper goes through the sync-pstack skill's Lesson mode. Your last report names each piece of friction with the commit that settled it, or with what you could not fix and why, so the lead fixes the rest. Offer a suggested task only for a new P0 or P1 finding, never for friction. Your task's domain is the subject your task changes. A finding is in it when it is your task's own target, when its fix changes code, docs or a plan that subject owns, or when it exists only because of your own result. Any other finding is outside it, such as a bug in another subject's code that also shows without your change, even when your panel raised it, your work waits on it, your work touched the same shared code or its fix also changes a file your task added. Until a trace finds where its cause lies, a finding other than your task's target that also shows without your change counts as such a bug. Name the subject that owns it in your last report, and offer a task for it only when it ranks P0 or P1 or the panel or base-branch gate needs one. When your task is a verdict run, you may also offer a P2 or P3 task in its domain for an item your verdict judges, with via: verdict. Any other finding you offer must still rank P0 or P1. When your task is a babysit run, you may also offer a P2 or P3 finding in its domain other than friction, with via: babysit. A measurement the Time budget rule sends to a task goes with via: time, and the design question that two open critical panel findings require goes with via: panel. Each offer in your task's domain carries session: naming this session's id, which makes it yours, and you card it after your friction fixes and before you run scan.mjs --landed, as the chips skill's Close says. An offer outside your domain names session: none, so only a /chips all cards it. An offer in your domain that names ship: has no owner, because no session owns a ship-list task, but your Close still cards it like your other offers. Send the lead, the session that offered your card or started your session, no message, because its run does not wait on your task; your ledger rows, your session title and your last report carry the outcome to its next /chips. Once the task has landed or its PR is open, where your runtime can rename this session, title your session 👀 <name>, with no count, in the same message as your last other call, the worktree removal when you remove it, and after that call, as ${root}/.agents/pstack/rules/title.md says, so the owner's sidebar shows which sessions hold landed work to review and none still running. When a later message has you work again, title the session with your current stage before your first step. Whenever you stop on something only the owner can settle, title your session with the waiting state the title rule gives, so the owner's sidebar shows the stop. A question only the lead could answer does not stop you. Take its most reversible answer, as the Autopilot rule says, and name that pick in your report with the word that reverses it.`,
  ].join('\n');
}

export const newId = () => `t_${randomBytes(4).toString('hex')}`;
export const TASK_ID = /\bt_[0-9a-f]{8}\b/gu;

const realOrSelf = (path) => (existsSync(path) ? realpathSync.native(path) : resolve(path));

function checkoutRef() {
  const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  return git('branch', '--show-current') || git('rev-parse', 'HEAD');
}

// A link reads as the commit's subject, which says what landed where a hash
// says nothing.
function commitLink() {
  const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  const origin = memo(
    (via) => {
      try {
        return git(...via, 'remote', 'get-url', 'origin').match(/github\.com[:/](.+?)(?:\.git)?$/u)?.[1] ?? null;
      } catch {
        return null;
      }
    },
    (via) => via.join(' ')
  );
  return (sha) => {
    const via = commitHome(sha) ?? [];
    const repo = origin(via);
    if (!repo) return sha;
    let subject = sha;
    try {
      subject = git(...via, 'log', '-1', '--format=%s', sha).replace(/[[\]]/gu, '\\$&');
    } catch {}
    const name = via.length ? `${repo.split('/').at(-1)}: ` : '';
    return `📦 [${name}${subject}](https://diffshub.com/${repo}/commit/${sha})`;
  };
}

const commitsNamedInProse = (task) => [...new Set(task.landedText.match(/\b[0-9a-f]{7,40}\b/gu) ?? [])].filter(isCommit);

function deliveredBy(task, url) {
  const named = task.commits.length ? task.commits : commitsNamedInProse(task);
  if (named.length) return named.map(url).join(', ');
  return task.patch ? `no commit named, patch ${task.patch}` : 'no commit named';
}

const CARD_LIFETIME = 7 * 86_400_000;

export function cleanupOf(tasks, sessions, here, callerFolders, now = Date.now()) {
  const cardWorktreeRoot = realOrSelf(resolve(process.cwd(), '.claude', 'worktrees'));
  const isCardSession = (session) => Boolean(session.cwd) && contains(cardWorktreeRoot, realOrSelf(session.cwd));
  // The Claude Code desktop app gives a new session the worktree folder of an archived one, and its session list leaves out the session that calls it.
  const live = [...callerFolders, ...sessions.flatMap((session) => (session.isArchived ? [] : [session.cwd]))].filter(Boolean).map(realOrSelf);
  const inUse = (path) => live.some((other) => other === path || contains(path, other));
  const bySession = new Map(sessions.map((session) => [session.sessionId, session]));
  const url = commitLink();
  const archive = new Map();
  const remove = new Set();
  const report = [];
  const kept = new Map();
  const cardsLostOnArchive = Map.groupBy([...tasks.values()].filter((each) => held(each) && each.session && now - Date.parse(each.cardedAt) < CARD_LIFETIME), (each) => each.session);
  for (const task of [...tasks.values()].filter((each) => each.status === 'landed' && each.startedIn && each.startedIn !== here).sort(byOrder)) {
    const session = bySession.get(task.startedIn);
    if (!session || session.pinned || !isCardSession(session)) continue;
    if (session.isArchived ? !existsSync(session.cwd) || inUse(realOrSelf(session.cwd)) : session.isRunning) continue;
    report.push(`${task.id} ${displayTitle(task)}: ${deliveredBy(task, url)}`);
    if (session.isArchived) remove.add(session.cwd);
    else if (cardsLostOnArchive.has(session.sessionId)) kept.set(session.sessionId, `${session.sessionId}  ${session.title}: holds ${cardsLostOnArchive.get(session.sessionId).map((each) => `${each.id}'s card ${each.card}`).join(', ')}`);
    else archive.set(session.sessionId, session);
  }
  return { archive: [...archive.values()], remove: [...remove], report, kept: [...kept.values()] };
}
