// Installed by the sync-pstack skill. A plan's state is the first word of its
// Status line, a panel row's kind is the first word of its decision, and a
// cited proof is a path under <plans>/artifacts/.

import { spawnSync } from 'node:child_process';
import { closeSync, existsSync, lstatSync, openSync, readdirSync, readFileSync, readSync, realpathSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const GLOB = { '**/': '(?:.*/)?', '**': '.*', '*': '[^/]*', '?': '[^/]' };
// ** matches dot directories such as .agents too, which node:path's matchesGlob skips.
export const globMatcher = (globs = []) => {
  const patterns = globs.map((glob) => new RegExp(`^${glob.replace(/[.+^${}()|[\]\\]/gu, '\\$&').replace(/\*\*\/|\*\*|\*|\?/gu, (token) => GLOB[token])}$`, 'u'));
  return (path) => patterns.some((pattern) => pattern.test(path));
};

const STEP_EXCLUDE = ['**/*.test.*', '**/*.spec.*', '**/__tests__/**', '**/fixtures/**', '**/*.md', '**/*.mdx'];
export const plansOf = (config) => (config.plans || 'docs/plans').replace(/^(?:\.\/)+/u, '').replace(/\/+$/u, '');
export const stepBudget = (config) => {
  const { stepBudget: { lines = 400, exclude = [] } = {}, generated = [] } = config;
  if (!Number.isInteger(lines) || lines < 1) throw new Error(`.agents/pstack.json: stepBudget.lines is ${JSON.stringify(lines)}, not a whole number of 1 or more`);
  return { lines, excluded: globMatcher([...STEP_EXCLUDE, `${plansOf(config)}/**`, ...generated.flatMap((entry) => entry.paths ?? []), ...exclude]) };
};
export const BIG_STEP = /^big step:\s*\S/u;
const LANDED_ROW = /^(?:steps? [^\t]*?)?landed as [0-9a-f]{7,40}\b/iu;
export const liftsStep = (text) =>
  text.split('\n').reduce((lifted, line) => {
    const [, phase, decision = ''] = line.split('\t');
    if (phase === 'owner' && BIG_STEP.test(decision)) return true;
    return LANDED_ROW.test(decision) ? false : lifted;
  }, false);
export const overBudget = (product, lines) =>
  `changes ${product} product lines, past the step budget of ${lines}. Split the step into lettered steps that land one by one, such as step 4a and step 4b, each with its own diff round, or log an owner row whose decision starts "big step:" and quotes the owner`;

// Git counts a symlink as the one line of its target path.
const countLines = (path) => {
  let text;
  try {
    if (lstatSync(path).isSymbolicLink()) return 1;
    text = readFileSync(path);
  } catch {
    return 0;
  }
  if (text.length === 0 || text.includes(0)) return 0;
  const lines = text.toString('utf8').split('\n').length;
  return text.at(-1) === 10 ? lines - 1 : lines;
};

const split = (output) => (output === null ? null : output.split('\0').filter(Boolean));

const nearestBase = (git, config) => {
  const names = ['upstream', 'origin'].flatMap((remote) => [config.branch, config.protected].filter(Boolean).map((branch) => `refs/remotes/${remote}/${branch}`));
  if (names.length === 0) return null;
  const listed = git('for-each-ref', '--format=%(refname)', ...names)?.split('\n') ?? [];
  let best = null;
  for (const ref of listed.filter((name) => names.includes(name))) {
    const sha = git('merge-base', 'HEAD', ref);
    const count = sha && git('rev-list', '--count', `${sha}..HEAD`);
    const ahead = count === null ? Number.NaN : Number(count);
    if (sha && Number.isInteger(ahead) && (best === null || ahead < best.ahead)) best = { ref: ref.replace(/^refs\/remotes\//u, ''), sha, ahead };
  }
  return best;
};

export function stepLines(top, config, gitAt) {
  const { excluded } = stepBudget(config);
  const git = (...args) => gitAt(top, ...args);
  const base = nearestBase(git, config);
  const fields = base && split(git('diff', '--numstat', '-z', base.sha));
  const untracked = fields && split(git('ls-files', '--others', '--exclude-standard', '-z'));
  if (!untracked) return null;
  const step = { product: 0, base: `${base.ref} at ${base.sha.slice(0, 10)}`, sha: base.sha.slice(0, 10), files: [] };
  for (let at = 0; at < fields.length; at += 1) {
    const [added, deleted, ...rest] = fields[at].split('\t');
    const path = rest.join('\t');
    // A rename's numstat leaves the path empty and names the old and new paths in the next two fields.
    const file = path === '' ? fields[(at += 2)] : path;
    step.files.push(file);
    if (added !== '-' && !excluded(file)) step.product += Number(added) + Number(deleted);
  }
  for (const file of untracked) {
    step.files.push(file);
    if (!excluded(file)) step.product += countLines(join(top, file));
  }
  return step;
}

const companionPlanFiles = (top, config, gitAt, plans) => {
  const companion = (...args) => gitAt(top, `--git-dir=${join(top, config.companion.dir)}`, `--work-tree=${top}`, ...args);
  const from = nearestBase(companion, config);
  const changed = from ? split(companion('diff', '--name-only', '--diff-filter=d', '-z', from.sha)) : [];
  const companionNew = split(companion('ls-files', '--others', '-z', '--', `:(glob)${plans}/*`, `:(exclude,glob)${plans}/*/**`));
  const tracked = split(gitAt(top, 'ls-files', '-z', '--', `${plans}/`));
  if (!changed || !companionNew || !tracked) return null;
  const publicTracked = new Set(tracked);
  return [...changed, ...companionNew.filter((file) => !publicTracked.has(file))];
};

export function stepRecords(top, config, gitAt, files) {
  const plans = plansOf(config);
  const companion = config.companion?.dir && existsSync(join(top, config.companion.dir)) ? companionPlanFiles(top, config, gitAt, plans) : [];
  if (companion === null) return null;
  const records = { logs: [], planned: false };
  for (const file of [...files, ...companion]) {
    const name = file.startsWith(`${plans}/`) ? file.slice(plans.length + 1) : '/';
    if (name.includes('/') || !existsSync(join(top, file))) continue;
    if (name.endsWith('.decisions.tsv')) records.logs.push(join(top, file));
    if (/^\d{4}-\d{2}-\d{2}-.+\.(?:md|decisions\.tsv)$/u.test(name)) records.planned = true;
  }
  return records;
}

const LANDED = ['done', 'complete', 'completed', 'shipped', 'executed', 'implemented', 'fixed', 'released', 'merged', 'verified', 'landed'];

export const STATES = {
  done: [...LANDED, 'superseded', 'replaced', 'closed', 'cancelled', 'canceled', 'abandoned', 'retired', 'terminated'],
  active: ['building', 'executing', 'in', 'active', 'resumed', 'reopened', 'rework', 'review', 'reviewing', 'awaiting', 'waiting'],
  held: ['blocked', 'paused'],
  planning: ['planning', 'planned', 'draft', 'proposed', 'ready', 'pending', 'scoped', 'partial', 'approved', 'accepted', 'open'],
};

function words(status) {
  return status
    .trim()
    .replace(/^[^a-z]+/i, '')
    .toLowerCase()
    .split(/[^a-z-]+/)
    .map((word) => word.replaceAll('-', ''))
    .filter(Boolean);
}

export function stateOf(status) {
  const [first, second] = words(status);
  if (first === 'in' && ['planning', 'draft'].includes(second)) return 'planning';
  return Object.keys(STATES).find((state) => STATES[state].includes(first)) ?? null;
}

const WAIT_WORD = /\b(?:wait(?:s|ing)?|awaiting|blocked|needs?|hold|held|until)\b/iu;
const OWNER_WORD = /\b(?:you|your|owner)\b/iu;
export const waitsOnOwner = (status) =>
  /^\W*paused\b/iu.test(status) ||
  status.split(/[.;]/u).some((clause) => {
    const at = clause.search(WAIT_WORD);
    return at >= 0 && OWNER_WORD.test(clause.slice(at));
  });

export const SEATS = /^seats\s/u;
export const CRITICAL_SEATS = /^critical \[([^\]]*)\]:\s*\S/u;

export const SEAT_MODEL = /(?<![\w.:-])(?:codex:|agy:)?(?:claude-[\w.-]*\w|gpt-[\w.-]*\w|gemini-[\w.-]*\w|opus|sonnet|haiku|fable)(?![\w-])/gu;
export const seatName = (name) => name.trim().replace(/^(?:codex|agy):/u, '').replace(/\s+missing$/u, '').replace(/\s+@\w+$/u, '');
export const seatKey = (name) => seatName(name.toLowerCase()).replace(/^claude-([a-z]+)-.*$/u, '$1');

function modelForSeatWord(key, models) {
  if (key === 'lead' || models.includes(key) || !/^[a-z]+$/u.test(key)) return key;
  const matches = models.filter((model) => model.split('-').at(-1) === key);
  return matches.length === 1 ? matches[0] : key;
}

export function bracketSeats(decision, models) {
  return decision.match(CRITICAL_SEATS)?.[1].split(',').map((name) => modelForSeatWord(seatKey(name), models));
}

export function seatRoster(decision) {
  const marked = new Set();
  const slots = decision
    .replace(/^seats\b(?:[^,]*?:\s)?/u, '')
    .replace(/\([^)]*\)/gu, ' ')
    .split(/[,;]/u)
    .flatMap((entry) => {
      const [named, ...after] = entry.split(/\b(?:missing|skipped)\b/u);
      const seat = named.match(SEAT_MODEL)?.[0];
      if (after.length === 0) return seat ? [seatKey(seat)] : [];
      if (seat) marked.add(seatKey(seat));
      const ran = after.join(' ').match(SEAT_MODEL)?.[0];
      return ran ? [seatKey(ran)] : seat ? [null] : [];
    });
  const models = [...new Set(slots.filter(Boolean))];
  return { slots, models, missing: [...marked].filter((model) => !models.includes(model)) };
}

export const decisionLogs = (plans) =>
  readdirSync(plans)
    // In trunk delivery the ledger's former path is a link to the moved ledger, for helpers that predate the move.
    .filter((name) => name.endsWith('.decisions.tsv') && lstatSync(join(plans, name)).isFile())
    .map((name) => join(plans, name));

export const isHandOffReview = (phase) => /^review/iu.test(phase ?? '');

export const SEVERITIES = ['critical', 'warning', 'nit'];
const SEVERITY = new RegExp(`^(?:${SEVERITIES.join('|')})(?=$|[\\s:])`, 'u');
export const severityOf = (decision) => decision.match(SEVERITY)?.[0];

export const STAGE_PHASES = {
  Design: ['architect', 'prototype', 'arena', 'how', 'why', 'design'],
  Review: ['panel', 'interrogate'],
  Build: ['build', 'fix'],
  Writing: ['writing'],
  Verify: ['verify', 'proof'],
  Ship: ['ship', 'delivery'],
  Reflect: ['reflect', 'lesson'],
  Audit: ['trail'],
};

// Panel rounds before the first build or fix row review the plan; later ones review the code.
export function stageOfRow(phases, index) {
  const phase = phases[index];
  if (isHandOffReview(phase)) return 'Audit';
  if (STAGE_PHASES.Writing.includes(phase)) {
    const staged = (each) => !STAGE_PHASES.Writing.includes(each) && (isHandOffReview(each) || Object.values(STAGE_PHASES).flat().includes(each));
    const last = phases.findLastIndex((each, at) => at < index && staged(each));
    if (STAGE_PHASES.Review.includes(phases[last])) return stageOfRow(phases, last);
  }
  if (STAGE_PHASES.Review.includes(phase)) {
    const firstBuild = phases.findIndex((each) => STAGE_PHASES.Build.includes(each));
    return firstBuild < 0 || index < firstBuild ? 'Plan review' : 'Code review';
  }
  return Object.keys(STAGE_PHASES).find((stage) => STAGE_PHASES[stage].includes(phase));
}

// Superseded and cancelled plans close without their work, so only landed ones face the Done gate.
export const landed = (status) => LANDED.includes(words(status)[0]);

export const reopened = (status) => words(status)[0] === 'reopened';

const LOCATION = /(?::\d+){1,2}(?:-\d+)?$|#L\d+(?:-L?\d+)?$/u;
const TRAILING = /[.:,;!?*_–—]+$/u;
const NOT_ONE_FILE = /[*?<>{}|[\]]|\.\.|\$\{/u;
export const tidy = (path) => path.replace(TRAILING, '').replace(LOCATION, '').replace(TRAILING, '');

const viaAnotherTree = (lead) => lead.endsWith('/') && !lead.startsWith('/') && lead !== './';
const firstExisting = (candidates) => candidates.find((candidate) => existsSync(candidate)) ?? candidates.at(-1);

function citation(token, root) {
  const at = token.indexOf(root);
  if (at === -1) return null;
  const lead = token.slice(Math.max(0, token.slice(0, at).search(/\S*$/u)), at);
  if (viaAnotherTree(lead)) return null;
  const path = token.slice(lead.startsWith('/') ? at - lead.length : at);
  const found = firstExisting([tidy(path.trim()), tidy(path.split(/\s/u)[0])]);
  return NOT_ONE_FILE.test(found) ? null : found;
}

export function runPaths(text, plans) {
  const root = `${plans}/artifacts/`;
  const spans = [...text.matchAll(/`([^`]+)`|\]\(([^)\s]+)\)/gu)].map((match) => match[1] ?? match[2]);
  const bare = text.replace(/`[^`]*`|\]\([^)]*\)/gu, ' ').split(/[\s,;()'"=]+/u);
  return [...new Set([...spans, ...bare].map((token) => citation(token, root)).filter(Boolean))];
}

const RECEIPT = /^exit=(?:-?\d+|SIG[A-Z]+|E[A-Z]{3,})$/u;
const isReceipt = (line) => RECEIPT.test(line.trimEnd());

export function recordsExit(path) {
  const fd = openSync(path, 'r');
  const buffer = Buffer.alloc(65_536);
  let carry = '';
  try {
    for (let read = readSync(fd, buffer); read > 0; read = readSync(fd, buffer)) {
      const lines = `${carry}${buffer.toString('utf8', 0, read)}`.split('\n');
      carry = lines.pop().slice(-4096);
      if (lines.some(isReceipt)) return true;
    }
    return isReceipt(carry);
  } finally {
    closeSync(fd);
  }
}

export function committedLines(path) {
  const base = process.env.PSTACK_BASE;
  if (base !== undefined && spawnSync('git', ['rev-parse', '--verify', '--quiet', `${base}^{commit}`]).status !== 0) {
    throw new Error(`PSTACK_BASE ${base} names no commit`);
  }
  const shown = spawnSync('git', ['show', `${base ?? 'HEAD'}:./${relative(process.cwd(), path)}`], { encoding: 'utf8' });
  return new Set(shown.status === 0 ? shown.stdout.split('\n') : []);
}

export const STATUSES = [
  'accepted',
  'apart',
  'applied',
  'blocked',
  'carded',
  'corrected',
  'decided',
  'deferred',
  'dismissed',
  'fixed',
  'folded',
  'gap',
  'inconclusive',
  'kept',
  'landed',
  'offered',
  'open',
  'partial',
  'proven',
  'recorded',
  'reopened',
  'reviewed',
  'reverted',
  'skipped',
  'started',
  'superseded',
  'uncarded',
  'updated',
  'verified',
];
export const PROVEN = ['fixed', 'proven', 'verified'];

export const statusOf = (result) => result.replace(/^'/u, '').match(/^[a-z]+/iu)?.[0]?.toLowerCase();

export function parseFence(line) {
  const match = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
  if (!match || (match[1][0] === '`' && match[2].includes('`'))) return null;
  const words = match[2].trim().split(/\s+/).filter(Boolean);
  const tag = ['before', 'after'].includes(words.at(-1)) ? words.pop() : undefined;
  return { marker: match[1], lang: words[0] ?? '', tag };
}
export const isFence = (line) => parseFence(line) !== null;

export const OPEN_BOX = /^\s*(?:(?:[-*+]|\d+\.)\s+)+\[ \]/u;
export const CLOSED_BOX = /^\s*(?:(?:[-*+]|\d+\.)\s+)+\[[xX]\]/u;

function codeSpanEnd(raw, at) {
  const ticks = raw.slice(at).match(/^`+/u)[0].length;
  const start = at + ticks;
  const close = [...raw.slice(start).matchAll(/`+/gu)].find((run) => run[0].length === ticks);
  return close ? start + close.index + ticks : start;
}

function uncomment(raw, commented) {
  let line = '';
  let at = 0;
  while (at < raw.length) {
    if (commented) {
      const end = raw.indexOf('-->', at);
      if (end === -1) break;
      commented = false;
      at = end + 3;
    } else if (raw.startsWith('<!--', at)) {
      commented = true;
      at += 4;
    } else if (raw[at] === '`') {
      const end = codeSpanEnd(raw, at);
      line += raw.slice(at, end);
      at = end;
    } else {
      line += raw[at];
      at += 1;
    }
  }
  return { line, commented };
}

// Each line of a Markdown file with its HTML comments cut out. A fence line
// comes back with `fence`, and a line inside a fence or a comment with `hidden`.
export function markdownLines(markdown) {
  const lines = [];
  let fenced = false;
  let commented = false;
  for (const [index, raw] of markdown.split('\n').entries()) {
    if (!commented && /^\s*(?:```|~~~)/u.test(raw)) {
      fenced = !fenced;
      lines.push({ fence: true, index, line: '', raw });
      continue;
    }
    if (fenced) {
      lines.push({ hidden: true, index, line: '', raw });
      continue;
    }
    const next = uncomment(raw, commented);
    lines.push(commented && next.commented ? { hidden: true, index, line: '', raw } : { index, line: next.line, raw });
    commented = next.commented;
  }
  return lines;
}

const indentOf = (line) => line.length - line.trimStart().length;

const sameFence = (opener) => {
  const { marker } = parseFence(opener);
  const deepest = indentOf(opener) + 3;
  const run = new RegExp(`^[ \\t]{0,${deepest}}${marker[0]}{${marker.length},}`, 'u');
  const rest = (line) => line.replace(run, '').trim();
  return { closes: (line) => run.test(line) && !rest(line), opens: (line) => run.test(line) && Boolean(rest(line)) && isFence(line) };
};

function fenceClose(lines, start) {
  const { closes } = sameFence(lines[start]);
  let index = start + 1;
  while (index < lines.length && !closes(lines[index])) index += 1;
  return index;
}

export function readFence(lines, start) {
  const { lang, tag } = parseFence(lines[start]);
  const close = fenceClose(lines, start);
  return { lang, tag, body: lines.slice(start + 1, close).join('\n'), next: close + 1 };
}

function fenceSpans(lines) {
  const spans = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (!isFence(lines[index])) continue;
    const close = fenceClose(lines, index);
    spans.push({ open: index, close });
    if (close < lines.length) index = close;
  }
  return spans;
}

export function outsideFences(lines) {
  const outside = lines.map(() => true);
  for (const { open, close } of fenceSpans(lines)) if (close < lines.length) outside.fill(false, open, close + 1);
  return outside;
}

export const strayFence = (lines) =>
  fenceSpans(lines).find(({ open, close }) => close === lines.length || lines.slice(open + 1, close).some(sameFence(lines[open]).opens))?.open ?? -1;

export const TABLE_RULE = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;

export function splitRow(row) {
  return row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replaceAll('\\|', '|'));
}

export const NOT_PASSED = ['partial', 'open', 'gap', 'blocked', 'inconclusive'];

const realOf = (path) => (existsSync(path) ? realpathSync(path) : path);
export const proofKey = (path) => relative(realOf(process.cwd()), realOf(resolve(path)));

export function proofLabels(evidence, plans, exists = existsSync) {
  const root = `${plans}/artifacts/`;
  return [...evidence.matchAll(/(?:^|[\s;`])proof:\s+([^\s;,`]+)/gu)].flatMap(([, value]) => {
    if (value === 'none') return [{ none: true }];
    if (!value.includes(root)) return [];
    const path = tidy(value);
    return [{ path, key: proofKey(path), exists: exists(path) }];
  });
}

export const acceptedWord = (evidence) => evidence.match(/(?:^|[\s;`])word:\s*([^;]+?)\s*(?:;|$)/u)?.[1];

const plainWord = (text) =>
  text
    .replace(/[`"“”'‘’*_]/gu, '')
    .trim()
    .replace(/[.:,;!?]+$/u, '')
    .toLowerCase();

function blankFencesAndComments(lines) {
  let fence = null;
  let commented = false;
  return lines.map((line) => {
    if (fence) {
      const close = line.match(/^\s*(`{3,}|~{3,})\s*$/u);
      if (close && close[1][0] === fence[0] && close[1].length >= fence.length) fence = null;
      return '';
    }
    let kept = line;
    if (commented) {
      const end = kept.indexOf('-->');
      if (end === -1) return '';
      commented = false;
      kept = kept.slice(end + 3);
    }
    const open = kept.match(/^\s*(`{3,}|~{3,})/u);
    if (open) {
      fence = open[1];
      return '';
    }
    kept = kept.replace(/<!--.*?-->/gu, '');
    const start = kept.indexOf('<!--');
    if (start !== -1) {
      commented = true;
      kept = kept.slice(0, start);
    }
    return kept;
  });
}

export function defaultsWords(planText) {
  const lines = blankFencesAndComments(planText.split('\n'));
  const start = lines.findIndex((line) => /^##\s+Defaults\s*$/u.test(line));
  if (start === -1) return new Set();
  const end = lines.findIndex((line, index) => index > start && /^##\s/u.test(line));
  const words = new Set();
  for (const { head, rows } of tablesOf(lines.slice(start + 1, end === -1 ? undefined : end))) {
    const names = head.map((cell) => plainWord(cell));
    if (names.slice(0, 4).join('|') !== 'decision|pick|alternative|word') continue;
    const column = names.indexOf('word');
    for (const row of rows) {
      for (const option of (row[column] ?? '').split(/,|\bor\b/iu)) {
        const word = plainWord(option);
        if (word) words.add(word);
      }
    }
  }
  return words;
}

export const isAcceptingWord = (word, words) => Boolean(word) && words.has(plainWord(word));

export function proofStates(rows, plans) {
  const states = new Map();
  for (const [, phase = '', , , evidence = '', result = ''] of rows) {
    if (isHandOffReview(phase)) continue;
    const status = statusOf(result);
    for (const label of proofLabels(evidence, plans)) {
      if (label.none) continue;
      const state = states.get(label.key) ?? { passed: true, word: null };
      if (NOT_PASSED.includes(status)) states.set(label.key, { passed: false, word: null });
      else if (status === 'accepted') states.set(label.key, { ...state, word: acceptedWord(evidence) ?? null });
      else if (PROVEN.includes(status)) states.set(label.key, { passed: true, word: null });
    }
  }
  return states;
}

export function tablesOf(lines) {
  const tables = [];
  for (let index = 0; index < lines.length; ) {
    if (isFence(lines[index])) {
      index = readFence(lines, index).next;
      continue;
    }
    if (!/^\s*\|/.test(lines[index]) || !TABLE_RULE.test(lines[index + 1] ?? '')) {
      index += 1;
      continue;
    }
    const head = splitRow(lines[index]);
    const rows = [];
    for (index += 2; index < lines.length && /^\s*\|/.test(lines[index]); index += 1) {
      rows.push(splitRow(lines[index]));
    }
    tables.push({ head, rows });
  }
  return tables;
}
