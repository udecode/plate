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
//        Both append forms, unlike the <log> and --all checks, refuse a partial, open, gap,
//        blocked or inconclusive row without proof: <existing file under <plans>/artifacts/>
//        or proof: none, and an accepted row unless its proof: names files an earlier row
//        left not passed and its word: is a Word option in the plan's Defaults. Review-phase
//        rows are exempt.
//        node .agents/pstack/decisions-check.mjs rounds <log>
//        (exits 1 when the log is at the cap of panel rounds before a build)

import { appendFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { acceptedWord, committedLines, defaultsWords, isAcceptingWord, NOT_PASSED, proofLabels, proofStates, PROVEN, runPaths, SEATS, SEVERITIES, STATUSES, statusOf } from './status.mjs';

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

function rowProblems(line, where, opened) {
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
  return lines.flatMap((line, index) => {
    if (index === 0 || line === '') return [];
    const where = `${path}:${index + 1}`;
    const found = committed.has(line) ? [] : [...rowProblems(line, where, opened), ...missingPlan(path, line, where)];
    opened ||= opens(line);
    return found;
  });
}

function append(path, batch) {
  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/u, 'Z');
  const text = existsSync(path) ? readFileSync(path, 'utf8') : null;
  const existing = (text ?? '').split('\n');
  let opened = existing.some(opens);
  const isWriting = (line) => line.split('\t')[1] === 'writing';
  let written = isWriting(existing.findLast((line) => opens(line) || isWriting(line)) ?? '');
  let rounds = roundsSince(existing);
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
    found.push(...rowProblems(row, where, opened), ...missingPlan(path, row, where), ...appendOnlyLabelProblems(path, row, [...existing.slice(1).filter(Boolean), ...rows], where));
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
    rows.push(row);
  }
  if (found.length > 0) return found;
  const added = rows.map((row) => `${row}\n`).join('');
  if (text !== null) {
    appendFileSync(path, `${text === '' || text.endsWith('\n') ? '' : '\n'}${added}`);
  } else writeFileSync(path, `${HEADER}\n${added}`);
  return [];
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
if (args[0] === 'append') {
  const batch =
    args[2] === '--from'
      ? readFileSync(args[3] ?? '', 'utf8')
          .split(/\r?\n/u)
          .filter((line) => line.trim())
          .map((line) => line.split('\t'))
      : [args.slice(2)];
  const found = batch.length === 0 ? [`${args[3]} holds no rows`] : append(args[1] ?? '', batch);
  if (found.length > 0) {
    console.error(`${batch.length > 1 ? 'No row written' : 'Row not written'}:\n${found.join('\n')}`);
    process.exit(1);
  }
  console.info(batch.length > 1 ? `Appended ${batch.length} rows to ${args[1]}.` : `Appended a row to ${args[1]}.`);
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
