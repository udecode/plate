#!/usr/bin/env node
// Checks the rows a show-me-your-work decision log gained since HEAD, so a
// committed row always says plainly whether its work is fixed, partial or still
// open. Rows already committed are left as history. Installed by sync-pstack.
// Usage: node .agents/pstack/decisions-check.mjs <log.decisions.tsv> [...]
//        node .agents/pstack/decisions-check.mjs --all
//        node .agents/pstack/decisions-check.mjs append <log> <phase> <decision> <why> <evidence> <result>
//        (stamps the row, checks it, and writes it only when it passes)

import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { SEATS, SEVERITIES } from './status.mjs';

const HEADER = 'ts\tphase\tdecision\twhy\tevidence\tresult';
const STATUSES = [
  'applied',
  'blocked',
  'corrected',
  'decided',
  'deferred',
  'dismissed',
  'fixed',
  'gap',
  'inconclusive',
  'kept',
  'open',
  'partial',
  'proven',
  'recorded',
  'reverted',
  'skipped',
  'superseded',
  'verified',
];
const PROVEN = ['fixed', 'proven', 'verified'];
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/u;
const CELLS = ['phase', 'decision', 'why', 'evidence', 'result'];

const opens = (line) => {
  const [, phase, decision = ''] = line.split('\t');
  return phase === 'panel' && SEATS.test(decision);
};

function plansDir() {
  const config = '.agents/pstack.json';
  return (existsSync(config) && JSON.parse(readFileSync(config, 'utf8')).plans) || 'docs/plans';
}

function missingPlan(path, line, where) {
  if (line.split('\t')[1] !== 'panel' || dirname(resolve(path)) !== resolve(plansDir())) return [];
  const plan = path.replace(/\.decisions\.tsv$/u, '.md');
  return existsSync(plan) ? [] : [`${where}: a panel row needs its plan ${plan} beside the log, so the page shows the round; write the plan first`];
}

function committedRows(path) {
  const committed = spawnSync('git', ['show', `HEAD:./${relative(process.cwd(), path)}`], { encoding: 'utf8' });
  return new Set(committed.status === 0 ? committed.stdout.split('\n') : []);
}

function rowProblems(line, where, opened) {
  const cells = line.split('\t');
  if (cells.length !== 6) return [`${where}: ${cells.length} cells, expected 6`];
  const found = [];
  const [ts, ...rest] = cells;
  if (!TIMESTAMP.test(ts)) found.push(`${where}: ts "${ts}" is not UTC ISO8601`);
  for (const [cell, value] of rest.entries()) {
    if (!value.trim()) found.push(`${where}: empty ${CELLS[cell]}`);
  }
  const status = rest[4].replace(/^'/u, '').match(/^[a-z]+/iu)?.[0]?.toLowerCase();
  if (rest[4].trim() && (!status || !STATUSES.includes(status))) {
    found.push(`${where}: result must start with one of: ${STATUSES.join(', ')}`);
  }
  // A claim of success names what the proof covered (widths, persona,
  // fixture, allowed or denied path), which is where overclaims hide.
  if (status && PROVEN.includes(status) && !/\bscope:/iu.test(rest[3])) {
    found.push(`${where}: a ${status} result needs "scope:" in its evidence naming what the proof covered`);
  }
  if (rest[0] === 'panel' && !SEATS.test(rest[1])) {
    if (!SEVERITIES.includes(rest[1].split(/\s/u)[0])) found.push(`${where}: a panel row's decision starts with "seats" or a severity: critical, warning or nit`);
    else if (!opened) found.push(`${where}: a panel finding needs a "seats" row before it`);
    if (!/^(applied|dismissed|deferred)\b\W+\w/u.test(rest[4])) found.push(`${where}: a panel finding's result starts with "applied", "dismissed" or "deferred" and gives the reason`);
    else if (/^deferred\b/u.test(rest[4])) {
      if (rest[1].startsWith('critical')) found.push(`${where}: a critical panel finding is applied or dismissed, never deferred`);
      else if (!/\bowner:\s*\S/u.test(rest[4])) found.push(`${where}: a deferred panel finding names its owner:`);
    }
  }
  return found;
}

function problems(path) {
  const lines = readFileSync(path, 'utf8').split('\n');
  if (lines[0] !== HEADER) return [`${path}:1: header must be "${HEADER.replaceAll('\t', ' ')}"`];
  const committed = committedRows(path);
  let opened = false;
  return lines.flatMap((line, index) => {
    if (index === 0 || line === '') return [];
    const where = `${path}:${index + 1}`;
    const found = committed.has(line) ? [] : [...rowProblems(line, where, opened), ...missingPlan(path, line, where)];
    opened ||= opens(line);
    return found;
  });
}

function append(path, cells) {
  if (cells.length !== 5) return [`append takes 5 cells after the log path, got ${cells.length}`];
  const broken = cells.findIndex((cell) => /[\t\n]/u.test(cell));
  if (broken !== -1) return [`${CELLS[broken]} contains a tab or newline`];
  const row = [new Date().toISOString().replace(/\.\d{3}Z$/u, 'Z'), ...cells].join('\t');
  const text = existsSync(path) ? readFileSync(path, 'utf8') : null;
  const found = [...rowProblems(row, `${path} (new row)`, (text ?? '').split('\n').some(opens)), ...missingPlan(path, row, `${path} (new row)`)];
  if (found.length > 0) return found;
  if (text !== null) {
    appendFileSync(path, `${text === '' || text.endsWith('\n') ? '' : '\n'}${row}\n`);
  } else writeFileSync(path, `${HEADER}\n${row}\n`);
  return [];
}

const args = process.argv.slice(2);
if (args[0] === 'append') {
  const found = append(args[1] ?? '', args.slice(2));
  if (found.length > 0) {
    console.error(`Row not written:\n${found.join('\n')}`);
    process.exit(1);
  }
  console.info(`Appended a row to ${args[1]}.`);
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
