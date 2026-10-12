#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/plan-open.mjs <plan.md> [...]
//        node .agents/pstack/plan-open.mjs --done   (every plan whose Status starts with a landed word, such as done or executed)
// Lines already committed at HEAD skip the closed-box, citation, owner and stop
// checks, except that a box closed since then is judged on its own line plus the lines
// indented directly under it, up to a blank line or a nested box: their citations all
// count, but its artifact, and in a findings section its owner: and stop:, count only
// from its uncommitted lines. PSTACK_BASE=<commit> checks against that commit instead,
// so an owner's commit mid-run does not exempt the run's lines; a value that names no
// commit fails.
// A closed box fails when it cites a run-directory file whose latest partial, open,
// gap, blocked or inconclusive row in the plan's decision log (proof: <path>) has no
// later fixed, proven or verified row, unless the latest accepted row after it names
// a word: that the plan's Defaults still offers. A decision log that does not parse fails.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { committedLines, defaultsWords, isAcceptingWord, landed, proofKey, proofStates, recordsExit, runPaths } from './status.mjs';

const OPEN_BOX = /^\s*(?:(?:[-*+]|\d+\.)\s+)+\[ \]/u;
const CLOSED_BOX = /^\s*(?:(?:[-*+]|\d+\.)\s+)+\[[xX]\]/u;
const ITEM = /^\s*(?:[-*+]|\d+\.)\s+/u;
const PLACEHOLDER = /\b(?:TODO|TBD|FIXME)\b/u;
const FINDINGS = /^#{1,6}\s+.*\b(?:deferred|open (?:items|findings|questions|work)|follow-?ups?|known gaps|gaps|residual)\b/iu;
// A path or command in backticks, a link, a URL, a commit or an explicit skip.
const ARTIFACT = /`[^`]*[/.\s][^`]*`|\]\([^)]+\)|https?:\/\/|\b[0-9a-f]{7,40}\b|\bskip:/u;
const GATES = /^(?:#{1,6}\s+)?(?:Start|Completion) Gates:?$/iu;
const UNRESOLVED = /^(?:|pending|tbd|todo|\{\{.*\}\})$/iu;
const cells = (row) => row.trim().replace(/^\||\|$/gu, '').split('|').map((cell) => cell.trim());
const LOG_HEADER = 'ts\tphase\tdecision\twhy\tevidence\tresult';

function plansDir() {
  const config = '.agents/pstack.json';
  return (existsSync(config) && JSON.parse(readFileSync(config, 'utf8')).plans) || 'docs/plans';
}

function unprovenCitations(text) {
  return runPaths(text, plansDir()).flatMap((cited) => {
    if (!existsSync(cited)) return [`cites ${cited}, which does not exist`];
    if (cited.endsWith('.log') && statSync(cited).isFile() && !recordsExit(cited)) {
      return [`cites ${cited}, which records no exit status; rerun it through proof.mjs`];
    }
    return [];
  });
}

function proofsOf(log, found) {
  if (!existsSync(log)) return new Map();
  const rows = readFileSync(log, 'utf8').split('\n').filter(Boolean);
  if (rows[0] !== LOG_HEADER || rows.slice(1).some((row) => row.split('\t').length !== 6)) {
    found.push(`${log}: the decision log does not parse, so no closed box can be judged against its proofs`);
    return new Map();
  }
  return proofStates(rows.slice(1).map((row) => row.split('\t')), plansDir());
}

function notPassedCitations(text, states, words) {
  return runPaths(text, plansDir()).flatMap((cited) => {
    const state = states.get(proofKey(cited));
    if (!state || state.passed || isAcceptingWord(state.word, words)) return [];
    return [`cites ${cited}, whose latest labeled verdict is not passed: rerun the proof, log an accepted row with its proof: and a Defaults word:, or move a context citation to the decision log`];
  });
}

function openLines(path) {
  const text = readFileSync(path, 'utf8');
  const committed = committedLines(path);
  const found = [];
  const states = proofsOf(path.replace(/\.md$/u, '.decisions.tsv'), found);
  const words = defaultsWords(text);
  let closedBox = null;
  const checkClosedBox = () => {
    if (closedBox) {
      if (!ARTIFACT.test(closedBox.fresh)) found.push(`${closedBox.where} (name the artifact that closed it, or skip: <reason>)`);
      else if (closedBox.finding && !(/\bowner:/iu.test(closedBox.fresh) && /\bstop:/iu.test(closedBox.fresh))) found.push(`${closedBox.where} (name its owner:, where it is tracked, and its stop:)`);
      const problems = [...unprovenCitations(closedBox.text), ...notPassedCitations(closedBox.text, states, words)];
      found.push(...problems.map((problem) => `${closedBox.where} (${problem})`));
    }
    closedBox = null;
  };
  let fenced = false;
  let commented = false;
  let findings = false;
  let findingsLevel = 0;
  let gate = null;
  for (const [index, raw] of text.split('\n').entries()) {
    if (/^\s*(?:```|~~~)/u.test(raw)) {
      checkClosedBox();
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    let line = raw;
    if (commented) {
      const end = line.indexOf('-->');
      if (end === -1) continue;
      commented = false;
      line = line.slice(end + 3);
    }
    line = line.replace(/<!--.*?-->/gu, '');
    const start = line.indexOf('<!--');
    if (start !== -1) {
      commented = true;
      line = line.slice(0, start);
    }
    if (closedBox && line.trim() && raw.search(/\S/u) > closedBox.indent && !OPEN_BOX.test(line) && !CLOSED_BOX.test(line)) {
      closedBox.text += ` ${line.trim()}`;
      if (!committed.has(raw)) closedBox.fresh += ` ${line.trim()}`;
    } else checkClosedBox();
    const heading = line.match(/^(#{1,6})\s/u);
    if (heading) {
      // A heading nested under a findings heading, such as a question under
      // Open questions, keeps its items open findings.
      if (findingsLevel && heading[1].length > findingsLevel) continue;
      findings = FINDINGS.test(line);
      findingsLevel = findings ? heading[1].length : 0;
    }
    const where = `${path}:${index + 1}: ${raw.trim()}`;
    if (GATES.test(line.trim())) {
      gate = { header: null };
      continue;
    }
    if (gate && line.trim().startsWith('|')) {
      const row = cells(line);
      if (!gate.header) gate.header = row.map((cell) => cell.toLowerCase());
      else if (!row.every((cell) => /^:?-+:?$/u.test(cell))) {
        const open = gate.header.filter((name, column) => UNRESOLVED.test(row[column] ?? ''));
        if (open.length > 0) found.push(`${where} (resolve the gate's ${open.join(', ')})`);
      }
      continue;
    }
    if (gate && line.trim()) gate = null;
    const prose = line.replace(/`[^`]*`/gu, '');
    if (OPEN_BOX.test(prose) || PLACEHOLDER.test(prose)) {
      found.push(where);
      continue;
    }
    if (committed.has(raw)) continue;
    const closed = CLOSED_BOX.test(line);
    if (!closed && findings && ITEM.test(line) && !(/\bowner:/iu.test(line) && /\bstop:/iu.test(line))) found.push(`${where} (name its owner:, where it is tracked, and its stop:)`);
    if (closed) {
      checkClosedBox();
      closedBox = { finding: findings && ITEM.test(line), fresh: line, indent: raw.search(/\S/u), text: line, where: `${path}:${index + 1}: ${raw.trim()}` };
    }
  }
  checkClosedBox();
  return found;
}

function donePlans() {
  const dir = plansDir();
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => join(dir, entry.name))
    .filter((path) => landed(readFileSync(path, 'utf8').match(/^Status:(.*)$/mu)?.[1] ?? ''));
}

const args = process.argv.slice(2);
const paths = args[0] === '--done' ? donePlans() : args;
if (paths.length === 0 && args[0] !== '--done') {
  console.error('Usage: node .agents/pstack/plan-open.mjs <plan.md> [...] | --done');
  process.exit(2);
}
const open = paths.flatMap(openLines);
if (open.length > 0) {
  console.error(`${open.length} open item(s):\n${open.join('\n')}`);
  process.exit(1);
}
console.info(`No open items in ${paths.length} plan(s).`);
