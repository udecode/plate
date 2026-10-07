#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/plan-open.mjs <plan.md> [...]
//        node .agents/pstack/plan-open.mjs --done   (every plan whose Status starts with a landed word, such as done or executed)

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { landed } from './status.mjs';

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

function plansDir() {
  const config = '.agents/pstack.json';
  return (existsSync(config) && JSON.parse(readFileSync(config, 'utf8')).plans) || 'docs/plans';
}

function committedLines(path) {
  const committed = spawnSync('git', ['show', `HEAD:./${relative(process.cwd(), path)}`], { encoding: 'utf8' });
  return new Set(committed.status === 0 ? committed.stdout.split('\n') : []);
}

function openLines(path) {
  const text = readFileSync(path, 'utf8');
  const committed = committedLines(path);
  const found = [];
  let fenced = false;
  let commented = false;
  let findings = false;
  let findingsLevel = 0;
  let gate = null;
  for (const [index, raw] of text.split('\n').entries()) {
    if (/^\s*(?:```|~~~)/u.test(raw)) {
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
    if (CLOSED_BOX.test(line) && !ARTIFACT.test(line)) found.push(`${where} (name the artifact that closed it, or skip: <reason>)`);
    else if (findings && ITEM.test(line) && !(/\bowner:/iu.test(line) && /\bstop:/iu.test(line))) found.push(`${where} (name its owner:, where it is tracked, and its stop:)`);
  }
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
