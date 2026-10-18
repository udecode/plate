#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/review.mjs [--mark | --done <session>]
// Lists the commits on origin/<branch>, the branch .agents/pstack.json names,
// since refs/pstack/reviewed, oldest first and grouped by the session each
// commit's `Session:` line names, with each subject, the plan the message
// links under the config's plans directory and its `Beyond the ask:` line. It
// follows first parents, so a merged PR shows as its merge commit. Without the
// ref it lists the last 20 commits. --done <session> marks that session's
// listed commits reviewed, `none` standing for commits without a Session:
// line, and moves the ref past the oldest commits once each is reviewed.
// --mark moves the ref to the tip it listed. The ref and the reviewed list
// live in this clone only.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REF = 'refs/pstack/reviewed';
const FIRST = 20;
const USAGE = 'Usage: node .agents/pstack/review.mjs [--mark | --done <session>]';

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
const mark = args.length === 1 && args[0] === '--mark';
const done = args.length === 2 && args[0] === '--done' ? args[1] : null;
if (args.length > 0 && !mark && done === null) fail(USAGE, 2);
process.chdir(must('rev-parse', '--show-toplevel'));
const { branch, plans = 'docs/plans' } = JSON.parse(readFileSync('.agents/pstack.json', 'utf8'));
const upstream = `refs/remotes/origin/${branch}`;
const fetched = git('fetch', '--quiet', 'origin', `+refs/heads/${branch}:${upstream}`);
if (fetched.status !== 0) console.error(`review.mjs: fetch failed, listing the last fetched origin/${branch}: ${fetched.stderr.trim()}`);

const store = resolve(must('rev-parse', '--git-common-dir'), 'pstack-reviewed');
const reviewedShas = new Set(existsSync(store) ? readFileSync(store, 'utf8').split('\n').filter(Boolean) : []);
const tip = must('rev-parse', upstream);
const reviewed = git('rev-parse', '--verify', '--quiet', REF).stdout.trim();
const range = reviewed ? [`${reviewed}..${tip}`] : ['-n', String(FIRST), tip];
const log = must('log', '--first-parent', '--format=%H%x1f%h%x1f%s%x1f%b%x1e', ...range);
const PLAN = new RegExp(`${plans.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}/[^\\s)\\]\`'"<>]+?\\.md`, 'u');

const commits = log
  .split('\x1e')
  .map((part) => part.trim())
  .filter(Boolean)
  .reverse()
  .map((record) => {
    const [sha, short, subject, body = ''] = record.split('\x1f');
    return {
      sha,
      short,
      subject,
      session: body.match(/^Session: (\S+)$/mu)?.[1] ?? 'none',
      plan: `${subject}\n${body}`.match(PLAN)?.[0] ?? 'No plan link',
      beyond: body.match(/^Beyond the ask:.*$/mu)?.[0] ?? 'No Beyond the ask: line',
    };
  });

if (mark) {
  must('update-ref', REF, tip);
  writeFileSync(store, '');
  console.log(`Marked origin/${branch} at ${tip.slice(0, 7)} as reviewed.`);
  process.exit(0);
}

if (done !== null) {
  const ours = commits.filter((commit) => commit.session === done && !reviewedShas.has(commit.sha));
  if (ours.length === 0) fail(`no listed commit to review has Session: ${done}; run review.mjs to see the sessions`);
  for (const commit of ours) reviewedShas.add(commit.sha);
  let advanced = null;
  for (const commit of commits) {
    if (!reviewedShas.has(commit.sha)) break;
    advanced = commit.sha;
    reviewedShas.delete(commit.sha);
  }
  if (advanced) must('update-ref', REF, advanced);
  writeFileSync(store, [...reviewedShas].map((sha) => `${sha}\n`).join(''));
  console.log(`Marked ${ours.length} commit(s) of session ${done} as reviewed.${advanced ? ` ${REF} is now at ${advanced.slice(0, 7)}.` : ''}`);
  process.exit(0);
}

const open = commits.filter((commit) => !reviewedShas.has(commit.sha));
const groups = new Map();
for (const commit of open) {
  if (!groups.has(commit.session)) groups.set(commit.session, []);
  groups.get(commit.session).push(`  ${commit.short} ${commit.subject}\n    ${commit.plan}\n    ${commit.beyond}`);
}
const since = reviewed ? `since ${REF} (${reviewed.slice(0, 7)})` : `in the last ${FIRST}, because ${REF} is not set`;
console.log(open.length === 0 ? `No commits to review on origin/${branch} ${since}.` : `${open.length} commit(s) to review on origin/${branch} ${since}:`);
for (const [session, lines] of groups) {
  const heading = session === 'none' ? 'No Session: line (--done none)' : session.startsWith('local_') ? `Session ${session} (claude://claude.ai/epitaxy/${session})` : `Session ${session}`;
  console.log(`\n${heading}\n${lines.join('\n')}`);
}
