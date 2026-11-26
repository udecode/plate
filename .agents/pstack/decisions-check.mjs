#!/usr/bin/env node
// Checks new decision-log rows and runs suggested-task ledger (chips) commands.
// Installed by sync-pstack.
// Usage: node .agents/pstack/decisions-check.mjs <log.decisions.tsv> [...] | --all
//        node .agents/pstack/decisions-check.mjs append <log> (<phase> <decision> <why> <evidence> <result> | --from <rows.tsv>)
//        node .agents/pstack/decisions-check.mjs chips [all|sync|stale|groups|id|brief <id>|cleanup] [...]

import { execFileSync, spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, normalize, relative, resolve } from 'node:path';
import { findLead, leadLabel, maxEffort, runtimeFolder } from './lead.mjs';
import { board, boardState, briefOf, CHIP_STATES, cleanupOf, chipRowProblems, baseRedProblems, gitMerges, groupsOf, hasToken, LEDGER_REF, ledgerPath, lockLedger, namesOwner, newChipRowProblems, newId, offeredAt, readShip, readTasks, recordRow, REFUSED, renderBoard, renderGroups, SESSION, staleReport, startedOverlaps, syncLedger, withoutPlannedWrites } from './tasks.mjs';
import { committedLines, decisionLogs, isHandOffReview, PROVEN, runPaths, SEATS, severityOf, STATUSES, statusOf } from './status.mjs';

const HEADER = 'ts\tphase\tdecision\twhy\tevidence\tresult';
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/u;
const CELLS = ['phase', 'decision', 'why', 'evidence', 'result'];

function projectConfig(root = '.') {
  const config = join(root, '.agents/pstack.json');
  return existsSync(config) ? JSON.parse(readFileSync(config, 'utf8')) : {};
}
const plansDir = () => projectConfig().plans || 'docs/plans';
const trunk = () => projectConfig().delivery === 'trunk';
const ledgerFile = () => ledgerPath(plansDir(), projectConfig().delivery);
const git = gitMerges({ branch: projectConfig().branch });
let shipped;
const shipList = () => (shipped ??= readShip(projectConfig().chips?.ship));

let main;
function mainCheckout() {
  if (main === undefined) {
    try { main = execFileSync('git', ['worktree', 'list', '--porcelain'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).match(/^worktree (.+)$/mu)?.[1] ?? process.cwd(); }
    catch { main = process.cwd(); }
  }
  return main;
}

let ledgerTasks = null;
const currentLedger = () => {
  const path = trunk() ? join(mainCheckout(), ledgerFile()) : ledgerFile();
  ledgerTasks ??= readTasks(existsSync(path) ? readFileSync(path, 'utf8').split('\n').slice(1) : []);
  return ledgerTasks;
};

function chipsArgs(args) {
  const valued = new Set(['--session', '--sessions'].flatMap((name) => (args.includes(name) ? [args.indexOf(name), args.indexOf(name) + 1] : [])));
  const at = args.flatMap((arg, index) => (index > 0 && arg !== '--fetch' && !valued.has(index) ? [index] : []));
  const first = args[at[0]];
  const logAt = first === 'brief' ? at[2] : ['stale', 'groups', 'all', 'cleanup', 'sync'].includes(first) ? at[1] : first === 'id' ? undefined : at[0];
  return { rest: at.map((index) => args[index]), logAt };
}

function runLedgerCommandFromMainCheckout(args) {
  if (!trunk() || !['append', 'chips'].includes(args[0])) return;
  const logAt = args[0] === 'append' ? 1 : chipsArgs(args).logAt;
  const ledgers = [resolve(ledgerFile()), join(mainCheckout(), ledgerFile())];
  if (logAt !== undefined && !ledgers.includes(resolve(args[logAt] ?? ''))) return;
  if (args[0] === 'append' && args[2] === '--from' && args[3]) args[3] = resolve(args[3]);
  const sessions = args.indexOf('--sessions');
  if (sessions !== -1 && args[sessions + 1]) args[sessions + 1] = resolve(args[sessions + 1]);
  process.chdir(mainCheckout());
  if (logAt !== undefined) args[logAt] = ledgerFile();
}

const checkoutCopies = (path) => [path, ...(trunk() && !isAbsolute(path) ? [join(mainCheckout(), path)] : [])];
const onDisk = (path) => checkoutCopies(path).some((copy) => existsSync(copy));
const markedMissing = (evidence, path) =>
  new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}(?::\\d+)*(?:#L\\d+)?\`?\\s*\\(missing\\)`, 'u').test(evidence);
const missingPaths = (evidence, where) =>
  runPaths(evidence, plansDir())
    .filter((path) => !onDisk(path) && !markedMissing(evidence, path))
    .map((path) => `${where}: evidence cites ${path}, which does not exist; write it first or cite the path it was saved to`);

function rowProblems(line, where, chips) {
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
  if (status && PROVEN.includes(status) && !/\bscope:/iu.test(rest[3])) {
    found.push(`${where}: a ${status} result needs "scope:" in its evidence naming what the proof covered, or a partial result that states the gap`);
  }
  if (rest[0] === 'panel' && !SEATS.test(rest[1])) {
    if (!severityOf(rest[1])) found.push(`${where}: a panel row's decision starts with "seats" or a severity: critical, warning or nit`);
    if (!/^(applied|dismissed|deferred|open|recorded)\b\W+\w/u.test(rest[4])) {
      found.push(`${where}: a panel finding's result starts with applied, dismissed, deferred, open or recorded and gives the reason`);
    }
  }
  if (rest[0] !== 'chip' && CHIP_STATES.includes(status)) {
    found.push(`${where}: ${/^[aeiou]/u.test(status) ? 'an' : 'a'} ${status} result belongs only in a chip row`);
  }
  if (rest[0] === 'chip' && chips) found.push(...chipRowProblems(rest, chips, where));
  return isHandOffReview(rest[0]) ? found : [...found, ...missingPaths(chips ? withoutPlannedWrites(rest) : rest[3], where)];
}

function missingFindingPaths(cells, where) {
  if (!['offered', 'folded'].includes(statusOf(cells[4]))) return [];
  return runPaths(cells[2], plansDir())
    .filter((path) => !existsSync(path) && !markedMissing(cells[2], path))
    .map((path) => `${where}: the finding cites ${path}, which this checkout lacks`);
}

function newRowProblems(cells, where, chips, writer) {
  const found = [];
  if (cells[0] === 'chip' && chips) {
    found.push(...missingFindingPaths(cells, where));
    found.push(...newChipRowProblems(cells, chips, where, git, writer, shipList, invokedFrom));
  }
  found.push(...baseRedProblems(cells[3], chips ?? currentLedger(), where));
  return found;
}

const transcriptOf = (run) => (run?.transcript ? basename(run.transcript, '.jsonl') : null);
function stampTranscript(cells, run) {
  const [phase, , , evidence, result] = cells;
  const owning = phase === 'chip' && /^(?:offered|updated)\b/u.test(result) && namesOwner(evidence) && !hasToken(evidence, 'transcript');
  return owning && run ? [cells[0], cells[1], cells[2], `${evidence}; transcript: ${transcriptOf(run)}`, cells[4]] : cells;
}

function problems(path) {
  const lines = readFileSync(path, 'utf8').split('\n');
  if (lines[0] !== HEADER) return [`${path}:1: expected header "${HEADER}"`];
  const committed = committedLines(path);
  const chips = resolve(path) === resolve(ledgerFile()) ? new Map() : null;
  const found = [];
  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) continue;
    if (!committed.has(line)) found.push(...rowProblems(line, `${path}:${index + 1}`, chips));
    if (chips) {
      const cells = line.split('\t');
      if (cells.length === 6) recordRow(chips, cells.slice(1), cells[0]);
    }
  }
  return found;
}

const lastLead = (lines) =>
  lines.reduce((last, line) => {
    const [, phase, decision] = line.split('\t');
    return phase === 'lead' ? decision : last;
  }, null);

function append(path, batch, run, miss) {
  if (!path) return { found: ['Usage: node .agents/pstack/decisions-check.mjs append <log> (<phase> <decision> <why> <evidence> <result> | --from <rows.tsv>)'], rows: [] };
  const text = existsSync(path) ? readFileSync(path, 'utf8') : null;
  const existing = text ? text.split('\n') : [];
  const found = text && existing[0] !== HEADER ? [`${path}:1: expected header "${HEADER}"`] : [];
  const chips = readTasks(existing.slice(1));
  const ledger = resolve(path) === resolve(ledgerFile());
  const writer = run ? { session: null, transcript: transcriptOf(run) } : null;
  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/u, 'Z');
  const label = run ? leadLabel(run) : 'unknown';
  const attribution = !ledger && label !== lastLead(existing.slice(1)) ? [['lead', label, 'lead boundary', run ? `transcript: ${run.transcript}` : `unknown: ${miss}`, 'decided']] : [];
  const rows = [];
  const count = batch.length;
  for (const [index, raw] of [...attribution, ...batch].entries()) {
    const where = index < attribution.length ? `${path} (lead row)` : count > 1 ? `${path} (new row ${index + 1 - attribution.length})` : `${path} (new row)`;
    if (raw.length !== 5) {
      found.push(`${where}: expected 5 cells (phase, decision, why, evidence, result), got ${raw.length}`);
      continue;
    }
    const cells = stampTranscript(raw, run);
    const row = [stamp, ...cells].join('\t');
    if (cells[0] === 'chip' && !ledger) found.push(`${where}: chip rows go in the project's ledger ${ledgerFile()}, because a suggested task outlives the run that offered it`);
    found.push(...rowProblems(row, where, ledger ? chips : null), ...newRowProblems(cells, where, ledger ? chips : null, writer));
    if (ledger) recordRow(chips, cells, stamp);
    rows.push(row);
  }
  if (found.length > 0) return { found, rows: [] };
  const added = rows.map((row) => `${row}\n`).join('');
  if (text) appendFileSync(path, `${text.endsWith('\n') ? '' : '\n'}${added}`);
  else writeFileSync(path, `${HEADER}\n${added}`);
  return { found: [], rows };
}

function sharedLedgerGit(log) {
  if (!trunk() || resolve(log) !== resolve(ledgerFile())) return null;
  const dir = projectConfig().companion?.dir;
  const via = dir ? ['--git-dir', join(mainCheckout(), dir)] : [];
  if (dir && !existsSync(via[1])) return null;
  return spawnSync('git', [...via, 'remote', 'get-url', 'origin'], { stdio: 'ignore' }).status === 0 ? via : null;
}

const reportRefused = (refused) => {
  for (const { problem } of refused) console.error(`Refused ${problem}, because a row on ${LEDGER_REF} came first; the row moved to ${REFUSED}.`);
};

function appendShared(log, batch, run, miss, via) {
  let held = null;
  const lock = lockLedger(execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { encoding: 'utf8' }).trim(), {
    waitMs: 60_000,
    onWait: (p) => { held = p; console.error(`Waiting for the ledger lock ${p}, which another run holds.`); },
  });
  if (!lock) return { found: [`another run held the ledger lock ${held} for 60 s; run append again`], rows: [] };
  try {
    const pulled = syncLedger(log, via, lock, { push: false });
    reportRefused(pulled.refused);
    const written = append(log, batch, run, miss);
    if (written.found.length > 0) return written;
    if (!pulled.reachable) {
      console.error(`${log} keeps the new rows locally until the next sync, because origin cannot be reached.`);
      return written;
    }
    const pushed = syncLedger(log, via, lock, { checked: pulled.tip });
    const lost = pushed.refused.filter(({ line }) => written.rows.includes(line));
    reportRefused(pushed.refused.filter((entry) => !lost.includes(entry)));
    if (lost.length > 0) return { found: lost.map(({ problem }) => `${problem}; the row moved to ${REFUSED}`), rows: [], heading: `Refused, because a row on ${LEDGER_REF} came first` };
    if (pushed.pending > 0) console.error(`${log} keeps the new rows locally until the next sync, because ${pushed.reachable ? `${LEDGER_REF} moved on each try` : 'origin cannot be reached'}.`);
    return written;
  } finally {
    lock.release();
  }
}

function runChipsStale(tasks, lines, ledger) {
  const states = new Map();
  const prState = (pr) => {
    if (!states.has(pr)) {
      try { states.set(pr, execFileSync('gh', ['pr', 'view', String(pr), '--json', 'state', '-q', '.state'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()); }
      catch { states.set(pr, null); }
    }
    return states.get(pr);
  };
  const at = offeredAt(lines);
  const oldest = [...at.values()].sort()[0] ?? new Date().toISOString();
  const read = (via, argv) => {
    try { return execFileSync('git', [...via, ...argv], { encoding: 'utf8', maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'ignore'] }); }
    catch { return ''; }
  };
  const logged = new Map();
  const logEntries = (via) => {
    const key = via.join('\0');
    if (logged.has(key)) return logged.get(key);
    const entries = [];
    let commit = null;
    for (const row of read([...via, '-c', 'core.quotePath=false'], ['log', '--first-parent', '--diff-merges=first-parent', `--since-as-filter=${oldest}`, '--format=%x01%ct%x09%h%x09%s', '--raw', '--no-abbrev', '-M']).split('\n')) {
      if (row.startsWith('\x01')) {
        const [time, hash, subject] = row.slice(1).split('\t');
        commit = { time: Number(time), hash, subject };
      } else if (row.startsWith(':') && commit) {
        const [meta, ...paths] = row.split('\t');
        const [, , before, after, status] = meta.split(' ');
        const changesContent = status !== 'R100';
        if (status.startsWith('R')) entries.push({ ...commit, status: 'D', path: paths[0], content: before, changesContent, renamed: true });
        entries.push({ ...commit, status: status[0], path: paths.at(-1), content: status[0] === 'D' ? before : after, changesContent });
      }
    }
    logged.set(key, entries);
    return entries;
  };
  const history = new Map();
  const historyOf = (via, partner = null) => {
    const key = via.join('\0');
    if (history.has(key)) return history.get(key);
    const entries = logEntries(via);
    if (partner) {
      const opp = { A: 'D', D: 'A' };
      const halves = new Map();
      for (const e of logEntries(partner)) halves.set(`${e.status}\0${e.path}\0${e.content}`, [...(halves.get(`${e.status}\0${e.path}\0${e.content}`) ?? []), e.time]);
      for (const e of entries) if (opp[e.status] && halves.get(`${opp[e.status]}\0${e.path}\0${e.content}`)?.some((t) => Math.abs(t - e.time) <= 86_400)) e.moved = true;
    }
    const byPath = new Map();
    for (const e of entries) byPath.set(e.path, [...(byPath.get(e.path) ?? []), e]);
    history.set(key, byPath);
    return byPath;
  };
  const companion = projectConfig().companion?.dir;
  const own = companion && existsSync(companion) ? [[], ['--git-dir', companion, '--work-tree', '.']] : [[]];
  const repoPath = (p) => { const c = normalize(p).replace(/\/$/u, ''); return c === '.' ? '' : c; };
  const root = realpathSync('.');
  const nearestDir = (p) => (existsSync(p) ? (statSync(p).isDirectory() ? p : dirname(p)) : nearestDir(dirname(p)));
  const ownHomes = (p) => own.map((via, i) => ({ byPath: historyOf(via, own.length > 1 ? own[1 - i] : null), path: repoPath(p) }));
  const homes = (written) => {
    if (!isAbsolute(written)) return ownHomes(written);
    const dir = nearestDir(written);
    const top = read(['-C', dir], ['rev-parse', '--show-toplevel']).trim();
    if (!top) return [];
    const path = join(read(['-C', dir], ['rev-parse', '--show-prefix']).trim(), relative(dir, written));
    return realpathSync(top) === root ? ownHomes(path) : [{ byPath: historyOf(['-C', top]), path: repoPath(path) }];
  };
  const entriesAt = (byPath, under, file) => (file ? (byPath.get(under) ?? []) : [...byPath].filter(([each]) => under === '' || each === under || each.startsWith(`${under}/`)).flatMap(([, entries]) => entries));
  const changesOf = (since, path) => {
    const after = Date.parse(since) / 1000;
    const file = existsSync(path) && !statSync(path).isDirectory();
    return homes(path).flatMap(({ byPath, path: under }) => entriesAt(byPath, under, file).filter((e) => e.time >= after && !e.moved));
  };
  const deletedSince = (since, path) => changesOf(since, path).some((e) => e.status === 'D' && !e.renamed);
  const commitsSince = (since, paths) => {
    const seen = new Map();
    for (const p of paths) for (const e of changesOf(since, p)) if (e.changesContent) seen.set(e.hash, e);
    return [...seen.values()].sort((a, b) => b.time - a.time).map((c) => c.subject);
  };
  const rows = staleReport(tasks, at, { exists: existsSync, deletedSince, commitsSince, prState, now: Date.now(), ship: shipList().items });
  console.info(rows.length ? `${rows.length} open suggested tasks in ${ledger}, the likeliest stale first:\n${rows.join('\n')}` : `No open suggested tasks in ${ledger}.`);
  return 0;
}

const args = process.argv.slice(2);
const invokedFrom = process.cwd();
runLedgerCommandFromMainCheckout(args);

function dispatch() {
  if (args[0] === '--help' || args[0] === '-h') {
    const src = readFileSync(new URL(import.meta.url), 'utf8').split('\n');
    const from = src.findIndex((line) => line.startsWith('// Usage:'));
    const to = src.findIndex((line, i) => i > from && !line.startsWith('//'));
    console.info(src.slice(from, to).map((line) => line.replace(/^\/\/ ?/, '')).join('\n'));
    return 0;
  }
  if (args[0] === 'chips') {
    const fetch = args.includes('--fetch');
    const at = args.indexOf('--session');
    const here = at === -1 ? null : (args[at + 1] ?? null);
    if (at !== -1 && !SESSION.test(here ?? '')) { console.error("--session takes this session's id, the one the runtime's session tool gives it"); return 2; }
    const { rest, logAt } = chipsArgs(args);
    if (rest[0] === 'id') { console.info(newId()); return 0; }
    const named = args[logAt];
    const ledger = named ?? ledgerFile();
    if (!existsSync(ledger)) { console.error(named ? `no log at ${ledger}` : `No ledger at ${ledger} yet; run this from the project root.`); return named ? 2 : 0; }
    const lines = readFileSync(ledger, 'utf8').split('\n').slice(1);
    const tasks = readTasks(lines);
    const sessionList = () => {
      const file = args.includes('--sessions') ? args[args.indexOf('--sessions') + 1] : null;
      if (!file) return null;
      try { const parsed = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null; if (Array.isArray(parsed)) return parsed; } catch {}
      console.error(`${file} does not hold a JSON array of sessions`);
      return false;
    };
    const all = rest[0] === 'all';
    if (all && here === null) { console.error('chips all takes --session <id>'); return 2; }
    const listed = all ? sessionList() : null;
    if (listed === false) return 2;
    const owning = { transcript: here === null ? null : transcriptOf(findLead().run ?? null), all, live: listed && new Set(listed.filter((s) => !s.isArchived).map((s) => s.sessionId)) };
    if (rest[0] === 'cleanup') {
      const sessions = sessionList();
      if (sessions === false) return 2;
      if (!sessions) { console.error('chips cleanup takes --sessions <file>'); return 2; }
      const { archive, remove, report, kept } = cleanupOf(tasks, sessions, here, [invokedFrom, runtimeFolder()]);
      if (!report.length) { console.info('Nothing to clean up: no landed task has an idle card session or a worktree left.'); return 0; }
      const out = [];
      if (archive.length) out.push(`Archive (${archive.length}):`, ...archive.map((s) => `  ${s.sessionId}  ${s.title}`));
      if (remove.length) out.push(`Remove (${remove.length}):`, `  node .agents/skills/cleanup/scripts/scan.mjs --repo . --remove ${remove.join(' ')}`);
      if (kept.length) out.push(`Keep (${kept.length}):`, ...kept.map((line) => `  ${line}`));
      out.push(`Report (${report.length}):`, ...report.map((line) => `  ${line}`));
      console.info(out.join('\n'));
      return 0;
    }
    if (rest[0] === 'groups') { console.info(renderGroups(groupsOf(tasks, plansDir()), ledger)); return 0; }
    if (rest[0] === 'stale') return runChipsStale(tasks, lines, ledger);
    if (rest[0] === 'brief') {
      const id = rest[1];
      if (!tasks.has(id ?? '')) { console.error(`${id ?? '(no id)'} is not a task in ${ledger}`); return 2; }
      const merges = gitMerges({ fetch, branch: projectConfig().branch });
      let view;
      const wholeBoard = () => (view ??= board(tasks, merges, null, { ship: shipList() }));
      const { ok, text } = briefOf(tasks, id, ledger, maxEffort(), projectConfig().chips?.codex, (each) => boardState(tasks, each, merges, wholeBoard));
      (ok ? console.info : console.error)(text);
      return ok ? 0 : 1;
    }
    const view = board(tasks, gitMerges({ fetch, branch: projectConfig().branch }), here, { ...owning, ship: shipList(), sync: rest[0] === 'sync' });
    for (const note of startedOverlaps(tasks)) console.error(note);
    console.info(renderBoard(view, ledger, maxEffort()));
    return view.problem ? 1 : 0;
  }
  if (args[0] === 'append') {
    const batch = args[2] === '--from' ? readFileSync(args[3] ?? '', 'utf8').split(/\r?\n/u).filter((l) => l.trim()).map((l) => l.split('\t')) : [args.slice(2)];
    const lead = findLead();
    const run = lead.run ?? null;
    if (!run) console.error(`Runtime identity is unknown because ${lead.miss}, so ${args[1]} records an unknown lead boundary.`);
    const via = sharedLedgerGit(args[1] ?? '');
    const { found, heading } = batch.length === 0 ? { found: [`${args[3]} holds no rows`] } : via ? appendShared(args[1], batch, run, lead.miss, via) : append(args[1] ?? '', batch, run, lead.miss);
    if (found.length > 0) { console.error(`${heading ?? (batch.length > 1 ? 'No row written' : 'Row not written')}:\n${found.join('\n')}`); return 1; }
    console.info(batch.length > 1 ? `Appended ${batch.length} rows to ${args[1]}.` : `Appended a row to ${args[1]}.`);
    if (run) console.info(`Lead: ${leadLabel(run)}.`);
    return 0;
  }
  const paths = args[0] === '--all' ? decisionLogs(plansDir()) : args;
  if (paths.length === 0 && args[0] !== '--all') { console.error('Usage: node .agents/pstack/decisions-check.mjs <log.decisions.tsv> [...] | --all'); return 2; }
  const missing = paths.filter((path) => !existsSync(path));
  if (missing.length > 0) { console.error(`no log at ${missing.join(', ')}; --help prints the usage`); return 2; }
  const found = paths.flatMap(problems);
  if (found.length > 0) { console.error(`${found.length} problem(s):\n${found.join('\n')}`); return 1; }
  console.info(`New rows are well formed in ${paths.length} log(s).`);
  return 0;
}
process.exitCode = dispatch();
