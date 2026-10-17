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
//        node .agents/pstack/decisions-check.mjs chips [--fetch] [--session <id>] [<ledger>]
//        (prints every open suggested task as ready, started, waiting or unmigrated,
//        its topic and a Do list of one pass, withdrawals, then ledger rows, then cards,
//        and exits 1 when any pass holds a problem: a card on a task that cannot start,
//        a wait that can never clear or two open design questions in one topic;
//        <ledger> defaults to <plans>/suggested-tasks.decisions.tsv,
//        --fetch refreshes the remote branches that PR waits read, and --session names
//        this session, so it cards only the tasks it owns and each card it does not hold
//        gets a check item instead of a withdraw problem)
//        node .agents/pstack/decisions-check.mjs chips all --session <id> [--sessions <file>] [<ledger>]
//        (also cards the tasks no session owns, and with the session tool's list saved as
//        a JSON array, takes over each task whose owner session is archived or gone)
//        node .agents/pstack/decisions-check.mjs chips stale [<ledger>]
//        (prints each open task's age, the paths it writes that were deleted since its offer
//        or are missing, the commits on its paths since its offer, its closed PR waits and
//        its card, likeliest stale first)
//        node .agents/pstack/decisions-check.mjs chips id
//        (prints a fresh id for a new task)
//        node .agents/pstack/decisions-check.mjs chips brief <id> [<ledger>]
//        (prints the prompt a card for that task carries)
//        node .agents/pstack/decisions-check.mjs chips wait [--session <id>] [--timeout <minutes>] [--every <seconds>] [<ledger>]
//        (polls the ledger and exits once a task lands, one this session may card turns
//        ready, or with --session a task that session carded starts, or at --timeout when
//        given; with no --timeout it waits until one of those happens)
//        node .agents/pstack/decisions-check.mjs chips cleanup --sessions <file> [--session <id>] [<ledger>]
//        (reads the session tool's list of every session, archived ones included, saved as a
//        JSON array, and prints the idle card sessions of landed tasks to archive, the worktrees
//        of archived ones to remove, and a report line with each task's commits; --session
//        names this session, whose own tasks it skips)

import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';
import { currentLead, leadLabel, maxEffort } from './lead.mjs';
import { board, briefOf, cardEffortOf, CHIP_STATES, cleanupOf, effortOf, chipRowProblems, baseRedProblems, gitMerges, LEDGER, newChipRowProblems, newId, offeredAt, readTasks, recordRow, renderBoard, SESSION, staleReport, startedOverlaps } from './tasks.mjs';
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

const git = gitMerges({ branch: projectConfig().branch });

let ledgerTasks = null;
const currentLedger = () => {
  const path = join(plansDir(), LEDGER);
  ledgerTasks ??= readTasks(existsSync(path) ? readFileSync(path, 'utf8').split('\n').slice(1) : []);
  return ledgerTasks;
};

function projectConfig() {
  const config = '.agents/pstack.json';
  return existsSync(config) ? JSON.parse(readFileSync(config, 'utf8')) : {};
}

function plansDir() {
  return projectConfig().plans || 'docs/plans';
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
      if (rest[1].startsWith('critical')) found.push(`${where}: a critical panel finding is never deferred: apply it or pivot the run to it, dismiss it on proof that it is no defect or is rare, or, when its own case fails the same way on the run's base, this run neither causes, worsens nor increases exposure to it, it breaks no outcome or property the typed ask states and it shows no requirement of this run's design unmet, log it open with patch: none, owner:, stop: and each line it limits in the result, and proof: none and the base run in the evidence`);
      else if (!/\bowner:\s*\S/u.test(rest[4])) found.push(`${where}: a deferred panel finding names its owner:`);
    } else if (/^open\b/u.test(rest[4]) && !(/\bpatch:\s*\S/u.test(rest[4]) && /\bowner:\s*\S/u.test(rest[4]))) {
      found.push(`${where}: an open panel finding names its patch: and owner:`);
    }
  }
  if (rest[0] !== 'chip' && CHIP_STATES.includes(status)) found.push(`${where}: an ${status} result belongs only in a chip row`);
  if (rest[0] === 'chip' && chips) found.push(...chipRowProblems(rest, chips, where));
  const reviewerRow = rest[0].startsWith('review');
  return reviewerRow ? found : [...found, ...missingPaths(rest[3], where)];
}

// A card session reads a finding's evidence from this checkout, never from the worktree that wrote it.
function missingFindingPaths(cells, where) {
  if (!['offered', 'folded'].includes(statusOf(cells[4]))) return [];
  return runPaths(cells[2], plansDir())
    .filter((path) => !existsSync(path) && !markedMissing(cells[2], path))
    .map((path) => `${where}: the finding cites ${path}, which this checkout lacks; copy it here from the worktree that wrote it, or cite the path it was saved to`);
}

function newRowProblems(cells, where, chips, writer) {
  const found = [];
  if (cells[0] === 'chip' && chips) found.push(...missingFindingPaths(cells, where));
  return [...found, ...(cells[0] === 'chip' && chips ? newChipRowProblems(cells, chips, where, git, writer) : []), ...baseRedProblems(cells[3], chips ?? currentLedger(), where)];
}

const transcriptOf = (run) => (run ? basename(run.transcript, '.jsonl') : null);

// An owner's session id can change with the account, so an offer or a takeover
// that names session: also records the writing session's transcript id.
function stampTranscript(cells, run) {
  const [phase, , , evidence, result] = cells;
  const owning = phase === 'chip' && /^(?:offered|updated)\b/u.test(result) && /(?:^|[\s;])session:/u.test(evidence) && !/(?:^|[\s;])transcript:/u.test(evidence);
  return owning && run ? [cells[0], cells[1], cells[2], `${evidence}; transcript: ${transcriptOf(run)}`, cells[4]] : cells;
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
  return lines.flatMap((line, index) => {
    if (index === 0 || line === '') return [];
    const where = `${path}:${index + 1}`;
    const rowFound = committed.has(line) ? [] : [...rowProblems(line, where, opened, chips), ...missingPlan(path, line, where)];
    opened ||= opens(line);
    if (chips) {
      const [ts, ...cells] = line.split('\t');
      recordRow(chips, cells, ts);
    }
    return rowFound;
  });
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
  const chips = readTasks(existing.slice(1));
  const ledger = resolve(path) === resolve(join(plansDir(), LEDGER));
  const writer = run ? { session: null, transcript: transcriptOf(run) } : null;
  const rows = [];
  const found = [];
  for (let [index, cells] of batch.entries()) {
    if (cells.length === 5) cells = stampTranscript(cells, run);
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
    found.push(...rowProblems(row, where, opened, ledger ? chips : null), ...newRowProblems(cells, where, ledger ? chips : null, writer), ...missingPlan(path, row, where), ...appendOnlyLabelProblems(path, row, [...existing.slice(1).filter(Boolean), ...rows], where));
    if (opens(row) && opened && !written) {
      found.push(`${where}: a later round's seats row needs a writing row after the previous seats row: log the round's writing passes under phase writing, or log a writing row that says why none ran`);
    }
    if (opens(row) && rounds >= MAX_ROUNDS) {
      found.push(`${where}: this would be panel round ${rounds + 1} since the last restart, past the cap of ${MAX_ROUNDS}. Stop reviewing: settle each open finding as applied, dismissed on its proof, deferred with its owner when it is not critical, or open with its patch:, owner: and stop: when the Panel review rule lets it stay open, pivoting the run for a critical the lead must apply, then build a plan or move a diff to its next gate. A build row whose decision starts with "built:" and names the files a plan's build changed, with a result that starts applied, fixed, partial, proven, recorded or verified, or an owner row whose decision starts with "another round:" and quotes the owner, starts the count again`);
    }
    if (restartsRoundCount(row)) rounds = 0;
    if (opens(row)) {
      written = false;
      rounds += 1;
    } else if (isWriting(row)) written = true;
    opened ||= opens(row);
    recordRow(chips, cells, stamp);
    rows.push(row);
  }
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
  const fetch = args.includes('--fetch');
  const at = args.indexOf('--session');
  const here = at === -1 ? null : (args[at + 1] ?? null);
  if (at !== -1 && !SESSION.test(here ?? '')) {
    console.error("--session takes this session's id, the one the runtime's session tool gives it");
    process.exit(2);
  }
  const option = (name, fallback) => {
    const index = args.indexOf(name);
    const value = index === -1 ? fallback : Number(args[index + 1]);
    if (!(value > 0)) {
      console.error(`${name} takes a positive number`);
      process.exit(2);
    }
    return value;
  };
  const valued = new Set(['--session', '--timeout', '--every', '--sessions'].flatMap((name) => (args.includes(name) ? [args.indexOf(name), args.indexOf(name) + 1] : [])));
  const rest = args.filter((arg, index) => index > 0 && arg !== '--fetch' && !valued.has(index));
  if (rest[0] === 'id') {
    console.info(newId());
    process.exit(0);
  }
  const id = rest[0] === 'brief' ? rest[1] : null;
  const named = rest[0] === 'brief' ? rest[2] : ['stale', 'wait', 'all', 'cleanup'].includes(rest[0]) ? rest[1] : rest[0];
  const ledger = named ?? join(plansDir(), LEDGER);
  if (!existsSync(ledger)) {
    console.error(named ? `no log at ${ledger}` : `No ledger at ${ledger} yet; run this from the project root.`);
    process.exit(named ? 2 : 0);
  }
  const lines = readFileSync(ledger, 'utf8').split('\n').slice(1);
  const tasks = readTasks(lines);
  const sessionList = () => {
    const file = args.includes('--sessions') ? args[args.indexOf('--sessions') + 1] : null;
    if (!file) return null;
    let sessions = null;
    try {
      sessions = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
    } catch {}
    if (!Array.isArray(sessions)) {
      console.error(`${file} does not hold a JSON array of sessions, the session tool's list saved as JSON`);
      process.exit(2);
    }
    return sessions;
  };
  const all = rest[0] === 'all';
  if (all && here === null) {
    console.error("chips all takes --session <id>, the id the runtime's session tool gives this session, because the tasks it takes become this session's");
    process.exit(2);
  }
  const listed = all ? sessionList() : null;
  const owning = { transcript: here === null ? null : transcriptOf(currentLead(here)), all, live: listed && new Set(listed.filter((session) => !session.isArchived).map((session) => session.sessionId)) };
  if (rest[0] === 'cleanup') {
    const sessions = sessionList();
    if (!sessions) {
      console.error("chips cleanup takes --sessions <file>, the session tool's list of every session, archived ones included, saved as a JSON array");
      process.exit(2);
    }
    const { archive, remove, report } = cleanupOf(tasks, sessions, here);
    if (!report.length) {
      console.info('Nothing to clean up: no landed task has an idle card session or a worktree left.');
      process.exit(0);
    }
    const out = [];
    if (archive.length) out.push(`Archive (${archive.length}), with the session tool, each idle card session whose task landed, then save the session list again and rerun chips cleanup:`, ...archive.map((session) => `  ${session.sessionId}  ${session.title}`));
    if (remove.length) out.push(`Remove (${remove.length}) the worktrees of landed tasks whose sessions are archived:`, `  node .agents/skills/cleanup/scripts/scan.mjs --repo . --remove ${remove.join(' ')}`);
    out.push(`Report (${report.length}):`, ...report.map((line) => `  ${line}`));
    console.info(out.join('\n'));
    process.exit(0);
  }
  if (rest[0] === 'stale') {
    const states = new Map();
    const prState = (pr) => {
      if (!states.has(pr)) {
        try {
          states.set(pr, execFileSync('gh', ['pr', 'view', String(pr), '--json', 'state', '-q', '.state'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim());
        } catch {
          states.set(pr, null);
        }
      }
      return states.get(pr);
    };
    const repoOf = (path) => (!isAbsolute(path) ? '.' : existsSync(path) && statSync(path).isDirectory() ? path : dirname(path));
    const deletedSince = (since, path) => {
      try {
        return execFileSync('git', ['-C', repoOf(path), 'log', '-1', '--no-renames', '--diff-filter=D', `--since=${since}`, '--format=%h', '--', path], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() !== '';
      } catch {
        return false;
      }
    };
    const commitsSince = (since, paths) => {
      const seen = new Map();
      for (const path of paths) {
        const repo = repoOf(path);
        try {
          for (const entry of execFileSync('git', ['-C', repo, 'log', '--no-merges', `--since=${since}`, '--format=%ct%x09%h%x09%s', '--', path], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\n').filter(Boolean)) {
            const [time, hash, subject] = entry.split('\t');
            seen.set(hash, { time: Number(time), subject });
          }
        } catch {}
      }
      return [...seen.values()].sort((a, b) => b.time - a.time).map((commit) => commit.subject);
    };
    const rows = staleReport(tasks, offeredAt(lines), { exists: existsSync, deletedSince, commitsSince, prState, now: Date.now() });
    console.info(rows.length ? `${rows.length} open suggested tasks in ${ledger}, the likeliest stale first:\n${rows.join('\n')}` : `No open suggested tasks in ${ledger}.`);
    process.exit(0);
  }
  if (rest[0] === 'wait') {
    const branch = projectConfig().branch;
    const state = () => {
      const rows = readFileSync(ledger, 'utf8').split('\n').slice(1);
      const now = readTasks(rows);
      const view = board(now, gitMerges({ branch }), here, owning);
      const started = [...now.values()].filter((task) => task.status === 'started' && here !== null && task.session === here);
      return {
        ready: view.cardable.map((task) => task.id),
        landed: [...now.values()].filter((task) => task.status === 'landed').map((task) => task.id),
        started: new Map(started.map((task) => [task.id, `${task.id} in ${task.startedIn ? `session ${task.startedIn}` : 'a session its started row does not name'}, carded at ${cardEffortOf(task, maxEffort())}, brief at ${effortOf(task, maxEffort())}`])),
      };
    };
    const minutes = option('--timeout', Infinity);
    const start = state();
    const deadline = Date.now() + minutes * 60_000;
    while (Date.now() < deadline) {
      await new Promise((done) => setTimeout(done, option('--every', 30) * 1000));
      const now = state();
      const turned = now.ready.filter((each) => !start.ready.includes(each));
      const landedNow = now.landed.filter((each) => !start.landed.includes(each));
      const startedNow = [...now.started].filter(([each]) => !start.started.has(each)).map(([, text]) => text);
      if (turned.length || landedNow.length || startedNow.length) {
        console.info(
          [
            landedNow.length ? `Landed: ${landedNow.join(', ')}.` : '',
            turned.length ? `Ready with no card: ${turned.join(', ')}.` : '',
            startedNow.length ? `Started: ${startedNow.join('; ')}.` : '',
            startedNow.length ? "Lower to its brief's effort, with the session tool, each started session above it that still runs at its card's effort, or at yours when the suggest tool took no effort; a session at any other effort is the owner's choice. Then run the chips sweep." : 'Run the chips sweep.',
          ]
            .filter(Boolean)
            .join(' ')
        );
        process.exit(0);
      }
    }
    console.info('No task landed, started or turned ready before the timeout; run the sweep, then chips wait again while any task is started or carded.');
    process.exit(0);
  }
  if (rest[0] === 'brief') {
    const task = tasks.get(id ?? '');
    if (!task) {
      console.error(`${id ?? '(no id)'} is not a task in ${ledger}`);
      process.exit(2);
    }
    const { ok, text } = briefOf(tasks, id, ledger, maxEffort(), projectConfig().chips?.codex);
    (ok ? console.info : console.error)(text);
    process.exit(ok ? 0 : 1);
  }
  const view = board(tasks, gitMerges({ fetch, branch: projectConfig().branch }), here, owning);
  console.info(renderBoard(view, ledger, maxEffort()));
  for (const note of startedOverlaps(tasks)) console.error(note);
  process.exit(view.problem ? 1 : 0);
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
  if (stage && stage !== stageBefore) console.info(`Stage: ${stage}. Rename the session and publish the plan's page now, as .agents/pstack/rules/title.md and pages.md say.`);
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
