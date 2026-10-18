#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/review.mjs [--mark]
// Lists the commits on origin/<branch>, the branch .agents/pstack.json names,
// since refs/pstack/reviewed, oldest first and grouped by the plan each
// commit's message links under the config's plans directory, with each
// subject and its `Beyond the ask:` line. It follows first parents, so a merged
// PR shows as its merge commit. Without the ref it lists the last 20 commits.
// --mark moves the ref to the tip it listed. The ref lives in this clone only.

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const REF = 'refs/pstack/reviewed';
const FIRST = 20;

const fail = (message, code = 1) => {
  console.error(`review.mjs: ${message}`);
  process.exit(code);
};
const git = (...args) => spawnSync('git', args, { encoding: 'utf8' });
const must = (...args) => {
  const run = git(...args);
  if (run.status !== 0) fail(`git ${args.join(' ')} failed: ${run.stderr.trim()}`);
  return run.stdout.trim();
};

const args = process.argv.slice(2);
if (args.some((arg) => arg !== '--mark')) fail('Usage: node .agents/pstack/review.mjs [--mark]', 2);
process.chdir(must('rev-parse', '--show-toplevel'));
const { branch, plans = 'docs/plans' } = JSON.parse(readFileSync('.agents/pstack.json', 'utf8'));
const upstream = `refs/remotes/origin/${branch}`;
const fetched = git('fetch', '--quiet', 'origin', `+refs/heads/${branch}:${upstream}`);
if (fetched.status !== 0) console.error(`review.mjs: fetch failed, listing the last fetched origin/${branch}: ${fetched.stderr.trim()}`);

const tip = must('rev-parse', upstream);
const reviewed = git('rev-parse', '--verify', '--quiet', REF).stdout.trim();
const range = reviewed ? [`${reviewed}..${tip}`] : ['-n', String(FIRST), tip];
const log = must('log', '--first-parent', '--format=%h%x1f%s%x1f%b%x1e', ...range);
const PLAN = new RegExp(`${plans.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}/[^\\s)\\]\`'"<>]+?\\.md`, 'u');

const groups = new Map();
for (const record of log.split('\x1e').map((part) => part.trim()).filter(Boolean).reverse()) {
  const [sha, subject, body = ''] = record.split('\x1f');
  const plan = `${subject}\n${body}`.match(PLAN)?.[0] ?? 'No plan link';
  const beyond = body.match(/^Beyond the ask:.*$/mu)?.[0] ?? 'No Beyond the ask: line';
  if (!groups.has(plan)) groups.set(plan, []);
  groups.get(plan).push(`  ${sha} ${subject}\n    ${beyond}`);
}

const since = reviewed ? `since ${REF} (${reviewed.slice(0, 7)})` : `in the last ${FIRST}, because ${REF} is not set`;
const count = [...groups.values()].reduce((sum, lines) => sum + lines.length, 0);
console.log(count === 0 ? `No commits on origin/${branch} ${since}.` : `${count} commit(s) on origin/${branch} ${since}:`);
for (const [plan, lines] of groups) console.log(`\n${plan}\n${lines.join('\n')}`);
if (args.includes('--mark')) {
  must('update-ref', REF, tip);
  console.log(`\nMarked origin/${branch} at ${tip.slice(0, 7)} as reviewed.`);
}
