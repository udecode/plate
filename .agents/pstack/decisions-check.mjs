#!/usr/bin/env node
// Checks and appends decision-log rows.
// Installed by sync-pstack.
// Usage: node .agents/pstack/decisions-check.mjs <log.decisions.tsv> [...] | --all
//        node .agents/pstack/decisions-check.mjs append <log> (<phase> <decision> <why> <evidence> <result> | --from <rows.tsv>)

import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { findLead, leadLabel } from './lead.mjs';
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

let main;
function mainCheckout() {
  if (main === undefined) {
    try { main = execFileSync('git', ['worktree', 'list', '--porcelain'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).match(/^worktree (.+)$/mu)?.[1] ?? process.cwd(); }
    catch { main = process.cwd(); }
  }
  return main;
}

const checkoutCopies = (path) => [path, ...(trunk() && !isAbsolute(path) ? [join(mainCheckout(), path)] : [])];
const onDisk = (path) => checkoutCopies(path).some((copy) => existsSync(copy));
const markedMissing = (evidence, path) =>
  new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}(?::\\d+)*(?:#L\\d+)?\`?\\s*\\(missing\\)`, 'u').test(evidence);
const missingPaths = (evidence, where) =>
  runPaths(evidence, plansDir())
    .filter((path) => !onDisk(path) && !markedMissing(evidence, path))
    .map((path) => `${where}: evidence cites ${path}, which does not exist; write it first or cite the path it was saved to`);

function rowProblems(line, where) {
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
  return isHandOffReview(rest[0]) ? found : [...found, ...missingPaths(rest[3], where)];
}

function problems(path) {
  const lines = readFileSync(path, 'utf8').split('\n');
  if (lines[0] !== HEADER) return [`${path}:1: expected header "${HEADER}"`];
  const committed = committedLines(path);
  const found = [];
  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) continue;
    if (!committed.has(line)) found.push(...rowProblems(line, `${path}:${index + 1}`));
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
  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/u, 'Z');
  const label = run ? leadLabel(run) : 'unknown';
  const attribution = label !== lastLead(existing.slice(1)) ? [['lead', label, 'lead boundary', run ? `transcript: ${run.transcript}` : `unknown: ${miss}`, 'decided']] : [];
  const rows = [];
  const count = batch.length;
  for (const [index, raw] of [...attribution, ...batch].entries()) {
    const where = index < attribution.length ? `${path} (lead row)` : count > 1 ? `${path} (new row ${index + 1 - attribution.length})` : `${path} (new row)`;
    if (raw.length !== 5) {
      found.push(`${where}: expected 5 cells (phase, decision, why, evidence, result), got ${raw.length}`);
      continue;
    }
    const row = [stamp, ...raw].join('\t');
    found.push(...rowProblems(row, where));
    rows.push(row);
  }
  if (found.length > 0) return { found, rows: [] };
  const added = rows.map((row) => `${row}\n`).join('');
  if (text) appendFileSync(path, `${text.endsWith('\n') ? '' : '\n'}${added}`);
  else writeFileSync(path, `${HEADER}\n${added}`);
  return { found: [], rows };
}

const args = process.argv.slice(2);

function dispatch() {
  if (args[0] === '--help' || args[0] === '-h') {
    const src = readFileSync(new URL(import.meta.url), 'utf8').split('\n');
    const from = src.findIndex((line) => line.startsWith('// Usage:'));
    const to = src.findIndex((line, i) => i > from && !line.startsWith('//'));
    console.info(src.slice(from, to).map((line) => line.replace(/^\/\/ ?/, '')).join('\n'));
    return 0;
  }
  if (args[0] === 'append') {
    const batch = args[2] === '--from' ? readFileSync(args[3] ?? '', 'utf8').split(/\r?\n/u).filter((l) => l.trim()).map((l) => l.split('\t')) : [args.slice(2)];
    const lead = findLead();
    const run = lead.run ?? null;
    if (!run) console.error(`Runtime identity is unknown because ${lead.miss}, so ${args[1]} records an unknown lead boundary.`);
    const { found } = batch.length === 0 ? { found: [`${args[3]} holds no rows`] } : append(args[1] ?? '', batch, run, lead.miss);
    if (found.length > 0) { console.error(`${batch.length > 1 ? 'No row written' : 'Row not written'}:\n${found.join('\n')}`); return 1; }
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
