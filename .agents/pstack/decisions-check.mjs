#!/usr/bin/env node
// Checks the rows a show-me-your-work decision log gained since HEAD, so a
// committed row always says plainly whether its work is fixed, partial or still
// open. Rows already committed are left as history. PSTACK_BASE=<commit> checks
// against that commit instead, so an owner's commit mid-run does not exempt the
// run's rows; a value that names no commit fails. Installed by sync-pstack.
// Usage: node .agents/pstack/decisions-check.mjs <log.decisions.tsv> [...]
//        node .agents/pstack/decisions-check.mjs --all
//        node .agents/pstack/decisions-check.mjs append <log> <phase> <decision> <why> <evidence> <result>
//        (stamps the row, checks it, and writes it only when it passes)
//        node .agents/pstack/decisions-check.mjs append <log> --from <rows.tsv>
//        (each line holds the five cells; writes every row only when all pass)
//        Both append forms open the batch with a lead row naming the session's model
//        and effort, read by lead.mjs, when they differ from the log's last lead row.
//        Both append forms print the stage a written batch moves the log into, so
//        the lead renames the session as the Session title rule asks.
//        Both append forms, unlike the <log> and --all checks, refuse a partial, open, gap,
//        blocked or inconclusive row without proof: <existing file under <plans>/artifacts/>
//        or proof: none, and an accepted row unless its proof: names files an earlier row
//        left not passed and its word: is a Word option in the plan's Defaults. Review-phase
//        rows are exempt.
//        node .agents/pstack/decisions-check.mjs rounds <log>
//        (exits 1 when the log is at the cap of panel rounds before a build)
//        node .agents/pstack/decisions-check.mjs chips [<ledger>]
//        (prints each suggested task still offered or started, and exits 1 naming each
//        Now task that another live task blocks; <ledger> defaults to
//        <plans>/suggested-tasks.decisions.tsv)

import { appendFileSync, existsSync, readdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';
import { currentLead, leadLabel } from './lead.mjs';
import { acceptedWord, committedLines, defaultsWords, isAcceptingWord, NOT_PASSED, proofLabels, proofStates, PROVEN, runPaths, SEATS, SEVERITIES, stageOfRow, STATUSES, statusOf } from './status.mjs';

const HEADER = 'ts\tphase\tdecision\twhy\tevidence\tresult';
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/u;
const CELLS = ['phase', 'decision', 'why', 'evidence', 'result'];

const opens = (line) => {
  const [, phase, decision = ''] = line.split('\t');
  return phase === 'panel' && SEATS.test(decision);
};
const MAX_ROUNDS = 3;
const restartsRoundCount = (line) => {
  const [, phase, decision = '', , , result = ''] = line.split('\t');
  if (phase === 'build') return /^built:\s*\S/u.test(decision) && /^(applied|fixed|partial|proven|recorded|verified)\b/u.test(result);
  return phase === 'owner' && /^another round:\s*\S/u.test(decision);
};
const roundsSince = (lines) => lines.slice(lines.findLastIndex(restartsRoundCount) + 1).filter(opens).length;

const LEDGER = 'suggested-tasks.decisions.tsv';
const CHIP = /^([\w-]+) (Now|After): \S.* \((?:high|xhigh)\)$/u;
const CHIP_RESULT = /^(offered|started|landed|dismissed (?:done|superseded|gone|stopped|(dup|replaced) ([\w-]+)))(?:[.:;,]?(?:\s.*)?)?$/u;
const CHIP_FROM = {
  started: ['offered', 'started'],
  landed: ['started'],
  'dismissed done': ['offered'],
  'dismissed dup': ['offered'],
  'dismissed gone': ['offered'],
  'dismissed replaced': ['offered'],
  'dismissed stopped': ['started'],
  'dismissed superseded': ['offered'],
};
const CHIP_STATES = ['offered', 'started', 'landed'];
const NOT_A_PATH = /[\s*?{}`'"]|[^.][.:]$/u;

// Lowercased because macOS volumes are case-insensitive by default, so
// readme.md and README.md name one file. The kernel follows a symlink before
// a later .. steps out of it, so the path is not resolve()d until its
// existing part has been through realpath.
function writeKey(path) {
  let base = isAbsolute(path) ? path : `${process.cwd()}/${path}`;
  const rest = [];
  while (!existsSync(base)) {
    rest.unshift(basename(base));
    base = dirname(base);
  }
  return resolve(realpathSync.native(base), ...rest).toLowerCase();
}

const writesOf = (evidence) =>
  evidence
    .match(/\bwrites:\s*([^;]*)/u)?.[1]
    .split(',')
    .map((path) => path.trim())
    .filter(Boolean) ?? [];
const contains = (outer, inner) => inner.startsWith(outer.endsWith('/') ? outer : `${outer}/`);
const overlaps = (a, b) => a.some((x) => b.some((y) => x === y || contains(x, y) || contains(y, x)));
const isLive = (chip) => chip.status === 'offered' || chip.status === 'started';
const moveOf = (outcome) => (outcome[2] ? `dismissed ${outcome[2]}` : outcome[1]);

function chipProblems([, decision, , evidence, result], chips, where) {
  const [, id] = decision.match(CHIP) ?? [];
  if (!id) return [`${where}: a chip row's decision is "<task id> Now: <title> (high)", with After: for a task that waits for something and (xhigh) for one that needs design judgment`];
  const outcome = result.match(CHIP_RESULT);
  if (!outcome) return [`${where}: a chip row's result is offered, started, landed, or dismissed with done, superseded, gone, stopped, dup <task id> or replaced <task id>`];
  const move = moveOf(outcome);
  const known = chips.get(id);
  const writes = ['offered', 'started'].includes(move) ? writesOf(evidence) : [];
  const found = writes.some((path) => NOT_A_PATH.test(path)) || (move === 'offered' && writes.length === 0)
    ? [`${where}: a chip offer lists the paths the task will write as "writes: <path>, <path>" in its evidence, and a started row lists any it adds, each a repository path or directory, or an absolute path in another checkout, with no whitespace, glob, quote, comma or semicolon`]
    : [];
  if (move === 'offered') return known ? [`${where}: ${id} was already offered; a task id is offered once`] : found;
  if (!known) return [`${where}: ${id} has no offered chip row before this one`];
  if (known.decision !== decision) found.push(`${where}: ${id} was offered as "${known.decision}", and every later row repeats that decision`);
  if (!CHIP_FROM[move].includes(known.status)) found.push(`${where}: ${id} is ${known.status}, so it cannot be ${move}`);
  const added = writes.map(writeKey).filter((key) => !known.keys.includes(key));
  for (const [other, peer] of chips) {
    if (other !== id && peer.status === 'started' && overlaps(added, peer.keys)) {
      found.push(`${where}: ${id} cannot add a path ${other}, also started, writes; leave that path to ${other} and tell the owner`);
    }
  }
  const [, , reason, target] = outcome;
  const live = reason === 'replaced' ? ['offered'] : ['offered', 'started'];
  if (target && (target === id || !live.includes(chips.get(target)?.status))) {
    found.push(`${where}: ${target} must be another task the ledger holds as ${live.join(' or ')}; offer the replacement before this row`);
  }
  return found;
}

const takePlaceOf = (replacement, replaced) => {
  replacement.order = Math.min(replacement.order, replaced.order);
};

function recordChip(chips, [phase, decision = '', , evidence = '', result = '']) {
  const [, id, tag] = phase === 'chip' ? (decision.match(CHIP) ?? []) : [];
  const outcome = id && result.match(CHIP_RESULT);
  if (!outcome) return;
  const move = moveOf(outcome);
  const chip = chips.get(id);
  if (move === 'offered') {
    const writes = writesOf(evidence);
    if (!chip) chips.set(id, { decision, keys: writes.map(writeKey), order: chips.size, status: move, tag, writes });
    return;
  }
  if (!chip) return;
  chip.status = move.split(' ')[0];
  if (move === 'started') {
    chip.writes = [...new Set([...chip.writes, ...writesOf(evidence)])];
    chip.keys = chip.writes.map(writeKey);
  }
  const target = chips.get(outcome[3]);
  if (target) takePlaceOf(target, chip);
}

function nowConflicts(chips, touched) {
  const live = [...chips].filter(([, chip]) => isLive(chip));
  const holdsPathsFirst = (peer, chip) => peer.order < chip.order || peer.status === 'started';
  const inBatch = (id, other) => touched.has(id) || touched.has(other);
  return live.flatMap(([id, chip]) =>
    chip.status === 'offered' && chip.tag === 'Now'
      ? live
          .filter(([other, peer]) => other !== id && holdsPathsFirst(peer, chip) && inBatch(id, other) && overlaps(chip.keys, peer.keys))
          .map(([other, peer]) => `${id} is Now, but ${other}, still ${peer.status}, writes an overlapping path; the lead that offered ${id} offers it again as After, waiting for ${other}, and dismisses it as replaced in the same batch${peer.status === 'started' ? `, and a session widening ${other} leaves that path alone and tells the owner` : ''}`)
      : [],
  );
}

function startedOverlaps(chips) {
  const started = [...chips].filter(([, chip]) => chip.status === 'started');
  return started.flatMap(([id, chip], at) =>
    started.slice(at + 1).filter(([, peer]) => overlaps(chip.keys, peer.keys)).map(([other]) => `${id} and ${other} are both started on an overlapping path; the owner runs both`),
  );
}

function plansDir() {
  const config = '.agents/pstack.json';
  return (existsSync(config) && JSON.parse(readFileSync(config, 'utf8')).plans) || 'docs/plans';
}

function missingPlan(path, line, where) {
  if (line.split('\t')[1] !== 'panel' || dirname(resolve(path)) !== resolve(plansDir())) return [];
  const plan = path.replace(/\.decisions\.tsv$/u, '.md');
  return existsSync(plan) ? [] : [`${where}: a panel row needs its plan ${plan} beside the log, so the page shows the round; write the plan first`];
}

const markedMissing = (evidence, path) =>
  new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}(?::\\d+)*(?:#L\\d+)?\`?\\s*\\(missing\\)`, 'u').test(evidence);

function missingPaths(evidence, where) {
  return runPaths(evidence, plansDir())
    .filter((path) => !existsSync(path) && !markedMissing(evidence, path))
    .map((path) => `${where}: evidence cites ${path}, which does not exist; write it first or cite the path it was saved to`);
}

function rowProblems(line, where, opened, chips) {
  const cells = line.split('\t');
  if (cells.length !== 6) return [`${where}: ${cells.length} cells, expected 6`];
  const found = [];
  const [ts, ...rest] = cells;
  if (!TIMESTAMP.test(ts)) found.push(`${where}: ts "${ts}" is not UTC ISO8601`);
  for (const [cell, value] of rest.entries()) {
    if (!value.trim()) found.push(`${where}: empty ${CELLS[cell]}`);
  }
  const status = statusOf(rest[4]);
  if (rest[4].trim() && (!status || !STATUSES.includes(status))) {
    found.push(`${where}: result must start with one of: ${STATUSES.join(', ')}`);
  }
  // A claim of success names what the proof covered (widths, persona,
  // fixture, allowed or denied path), which is where overclaims hide.
  if (status && PROVEN.includes(status) && !/\bscope:/iu.test(rest[3])) {
    found.push(`${where}: a ${status} result needs "scope:" in its evidence naming what the proof covered, or a partial result that states the gap`);
  }
  if (rest[0] === 'panel' && !SEATS.test(rest[1])) {
    if (!SEVERITIES.includes(rest[1].split(/\s/u)[0])) found.push(`${where}: a panel row's decision starts with "seats" or a severity: critical, warning or nit; any other phase, such as build or trail, takes a row that is neither`);
    else if (!opened) found.push(`${where}: a panel finding needs a "seats" row before it`);
    if (!/^(applied|dismissed|deferred|open)\b\W+\w/u.test(rest[4])) found.push(`${where}: a panel finding's result starts with "applied", "dismissed", "deferred" or "open" and gives the reason`);
    else if (/^deferred\b/u.test(rest[4])) {
      if (rest[1].startsWith('critical')) found.push(`${where}: a critical panel finding is applied or dismissed, never deferred`);
      else if (!/\bowner:\s*\S/u.test(rest[4])) found.push(`${where}: a deferred panel finding names its owner:`);
    } else if (/^open\b/u.test(rest[4]) && !(/\bpatch:\s*\S/u.test(rest[4]) && /\bowner:\s*\S/u.test(rest[4]))) {
      found.push(`${where}: an open panel finding names its patch: and owner:`);
    }
  }
  if (rest[0] !== 'chip' && CHIP_STATES.includes(status)) found.push(`${where}: an ${status} result belongs only in a chip row`);
  if (rest[0] === 'chip' && chips) found.push(...chipProblems(rest, chips, where));
  const reviewerRow = rest[0].startsWith('review');
  return reviewerRow ? found : [...found, ...missingPaths(rest[3], where)];
}

function appendOnlyLabelProblems(log, row, earlier, where) {
  const [, phase, , , evidence, result] = row.split('\t');
  if (phase.startsWith('review')) return [];
  const status = statusOf(result);
  if (!NOT_PASSED.includes(status) && status !== 'accepted') return [];
  const labels = proofLabels(evidence, plansDir());
  const found = labels
    .filter((label) => label.path && !label.exists)
    .map((label) => `${where}: proof: ${label.path} names no file`);
  if (NOT_PASSED.includes(status)) {
    if (labels.length === 0) found.push(`${where}: an unlabeled ${status} row: name the file whose verdict it states as "proof: <path under ${plansDir()}/artifacts/>" in its evidence, or write "proof: none" when it grades no file, such as a row that tracks a bug or a finding`);
    return found;
  }
  const states = proofStates(earlier.map((line) => line.split('\t')), plansDir());
  const files = labels.filter((label) => label.path);
  if (files.length === 0) found.push(`${where}: an accepted row names the not-passed file it accepts as "proof: <path>"`);
  for (const label of files.filter((file) => file.exists && states.get(file.key)?.passed !== false)) {
    found.push(`${where}: ${label.path} has no labeled partial, open, gap, blocked or inconclusive row before this one, so there is nothing to accept`);
  }
  const plan = log.replace(/\.decisions\.tsv$/u, '.md');
  const word = acceptedWord(evidence);
  if (!word) found.push(`${where}: an accepted row names the accepting Defaults word as "word: <word>"`);
  else if (!existsSync(plan)) found.push(`${where}: an accepted row needs its plan ${plan}, whose Defaults offers the word`);
  else if (!isAcceptingWord(word, defaultsWords(readFileSync(plan, 'utf8')))) found.push(`${where}: word: ${word} is not an option of a Word cell in ${plan}'s Defaults`);
  return found;
}

function problems(path) {
  const lines = readFileSync(path, 'utf8').split('\n');
  if (lines[0] !== HEADER) return [`${path}:1: header must be "${HEADER.replaceAll('\t', ' ')}"`];
  const committed = committedLines(path);
  let opened = false;
  const chips = resolve(path) === resolve(join(plansDir(), LEDGER)) ? new Map() : null;
  const touched = new Set();
  const found = lines.flatMap((line, index) => {
    if (index === 0 || line === '') return [];
    const where = `${path}:${index + 1}`;
    const rowFound = committed.has(line) ? [] : [...rowProblems(line, where, opened, chips), ...missingPlan(path, line, where)];
    opened ||= opens(line);
    if (chips) recordChip(chips, line.split('\t').slice(1));
    if (chips && !committed.has(line)) touched.add(line.split('\t')[2]?.match(CHIP)?.[1]);
    return rowFound;
  });
  return chips ? [...found, ...nowConflicts(chips, touched).map((problem) => `${path}: ${problem}`)] : found;
}

// The page shows which model and effort wrote each stretch of the log, so a
// batch from a session whose lead differs from the log's last lead row opens
// with a new one.
function leadRow(existing, run) {
  if (!run) return [];
  const last = existing.findLast((line) => line.split('\t')[1] === 'lead')?.split('\t')[2];
  const label = leadLabel(run);
  return last === label ? [] : [['lead', label, 'read from the session transcript, since an agent cannot see its own effort', `transcript ${basename(run.transcript)}`, `recorded ${run.runtime} session`]];
}

function append(path, batch, run) {
  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/u, 'Z');
  const text = existsSync(path) ? readFileSync(path, 'utf8') : null;
  const existing = (text ?? '').split('\n');
  batch = [...leadRow(existing, run), ...batch];
  let opened = existing.some(opens);
  const isWriting = (line) => line.split('\t')[1] === 'writing';
  let written = isWriting(existing.findLast((line) => opens(line) || isWriting(line)) ?? '');
  let rounds = roundsSince(existing);
  const chips = new Map();
  for (const line of existing.slice(1)) recordChip(chips, line.split('\t').slice(1));
  const ledger = resolve(path) === resolve(join(plansDir(), LEDGER));
  const touched = new Set();
  const rows = [];
  const found = [];
  for (const [index, cells] of batch.entries()) {
    const where = batch.length > 1 ? `${path} (new row ${index + 1})` : `${path} (new row)`;
    if (cells.length !== 5) {
      found.push(`${where}: append takes 5 cells, got ${cells.length}`);
      continue;
    }
    const broken = cells.findIndex((cell) => /[\t\n]/u.test(cell));
    if (broken !== -1) {
      found.push(`${where}: ${CELLS[broken]} contains a tab or newline`);
      continue;
    }
    const row = [stamp, ...cells].join('\t');
    if (cells[0] === 'chip' && !ledger) found.push(`${where}: chip rows go in the project's ledger ${join(plansDir(), LEDGER)}, because a suggested task outlives the run that offered it`);
    found.push(...rowProblems(row, where, opened, ledger ? chips : null), ...missingPlan(path, row, where), ...appendOnlyLabelProblems(path, row, [...existing.slice(1).filter(Boolean), ...rows], where));
    if (opens(row) && opened && !written) {
      found.push(`${where}: a later round's seats row needs a writing row after the previous seats row: log the round's writing passes under phase writing, or log a writing row that says why none ran`);
    }
    if (opens(row) && rounds >= MAX_ROUNDS) {
      found.push(`${where}: this would be panel round ${rounds + 1} since the last restart, past the cap of ${MAX_ROUNDS}. Stop reviewing: settle each open finding as applied, dismissed with its reason, deferred with its owner when it is not critical, or open with its patch: and owner:, then build. A build row whose decision starts with "built:" and names the files a plan's build changed, with a result that starts applied, fixed, partial, proven, recorded or verified, or an owner row whose decision starts with "another round:" and quotes the owner, starts the count again`);
    }
    if (restartsRoundCount(row)) rounds = 0;
    if (opens(row)) {
      written = false;
      rounds += 1;
    } else if (isWriting(row)) written = true;
    opened ||= opens(row);
    recordChip(chips, cells);
    if (cells[0] === 'chip') touched.add(cells[1].match(CHIP)?.[1]);
    rows.push(row);
  }
  if (ledger) found.push(...nowConflicts(chips, touched).map((problem) => `${path}: ${problem}`));
  if (found.length > 0) return found;
  const added = rows.map((row) => `${row}\n`).join('');
  if (text !== null) {
    appendFileSync(path, `${text === '' || text.endsWith('\n') ? '' : '\n'}${added}`);
  } else writeFileSync(path, `${HEADER}\n${added}`);
  return [];
}

function lastStage(path, rows) {
  const phases = existsSync(path)
    ? readFileSync(path, 'utf8').split('\n').slice(1).filter((line) => line.trim()).map((line) => line.split('\t')[1])
    : [];
  const covered = phases.slice(0, rows ?? phases.length);
  const index = covered.findLastIndex((_, at) => stageOfRow(covered, at));
  return index < 0 ? null : stageOfRow(covered, index);
}

const args = process.argv.slice(2);
if (args[0] === 'rounds') {
  if (!args[1] || !existsSync(args[1])) {
    console.error(args[1] ? `no log at ${args[1]}` : 'Usage: node .agents/pstack/decisions-check.mjs rounds <log.decisions.tsv>');
    process.exit(2);
  }
  const lines = readFileSync(args[1], 'utf8').split('\n');
  const rounds = roundsSince(lines);
  console.info(`${rounds} panel round(s) since the last restart; the cap is ${MAX_ROUNDS}`);
  process.exit(rounds >= MAX_ROUNDS ? 1 : 0);
}
if (args[0] === 'chips') {
  const ledger = args[1] ?? join(plansDir(), LEDGER);
  const chips = new Map();
  if (existsSync(ledger)) {
    for (const line of readFileSync(ledger, 'utf8').split('\n').slice(1)) recordChip(chips, line.split('\t').slice(1));
  } else if (args[1]) {
    console.error(`no log at ${ledger}`);
    process.exit(2);
  }
  const live = [...chips.values()].filter(isLive);
  for (const chip of live) console.info(`${chip.status}\t${chip.decision}\twrites: ${chip.writes.join(', ')}`);
  if (live.length === 0) console.error(existsSync(ledger) ? `No open suggested tasks in ${ledger}.` : `No ledger at ${ledger} yet; run this from the project root.`);
  const conflicts = nowConflicts(chips, new Set(chips.keys()));
  for (const note of startedOverlaps(chips)) console.error(note);
  if (conflicts.length > 0) console.error(`${conflicts.length} conflict(s):\n${conflicts.join('\n')}`);
  process.exit(conflicts.length > 0 ? 1 : 0);
}
if (args[0] === 'append') {
  const batch =
    args[2] === '--from'
      ? readFileSync(args[3] ?? '', 'utf8')
          .split(/\r?\n/u)
          .filter((line) => line.trim())
          .map((line) => line.split('\t'))
      : [args.slice(2)];
  const rowsBefore = existsSync(args[1] ?? '') ? readFileSync(args[1], 'utf8').split('\n').slice(1).filter((line) => line.trim()).length : 0;
  const stageBefore = lastStage(args[1] ?? '', rowsBefore);
  const run = currentLead(basename(args[1] ?? ''));
  if (!run) console.error(`No single session transcript holds this command, so ${args[1]} gets no lead row naming the model and effort.`);
  const found = batch.length === 0 ? [`${args[3]} holds no rows`] : append(args[1] ?? '', batch, run);
  if (found.length > 0) {
    console.error(`${batch.length > 1 ? 'No row written' : 'Row not written'}:\n${found.join('\n')}`);
    process.exit(1);
  }
  console.info(batch.length > 1 ? `Appended ${batch.length} rows to ${args[1]}.` : `Appended a row to ${args[1]}.`);
  if (run) console.info(`Lead: ${leadLabel(run)}.`);
  const stage = lastStage(args[1]);
  if (stage && stage !== stageBefore) console.info(`Stage: ${stage}. Rename the session now, as .agents/pstack/rules/title.md says.`);
  process.exit(0);
}
const paths =
  args[0] === '--all'
    ? readdirSync(plansDir())
        .filter((name) => name.endsWith('.decisions.tsv'))
        .map((name) => join(plansDir(), name))
    : args;
if (paths.length === 0 && args[0] !== '--all') {
  console.error('Usage: node .agents/pstack/decisions-check.mjs <log.decisions.tsv> [...] | --all');
  process.exit(2);
}
const found = paths.flatMap(problems);
if (found.length > 0) {
  console.error(`${found.length} problem(s):\n${found.join('\n')}`);
  process.exit(1);
}
console.info(`New rows are well formed in ${paths.length} log(s).`);
