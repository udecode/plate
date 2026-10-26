#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/review.mjs [--tier <tier>] [--net <session>] | --mark | --done <session>
// Lists the commits on origin/<branch>, the branch .agents/pstack.json names,
// since refs/pstack/reviewed, oldest first and grouped by the session each
// commit's `Session:` line names, with a DiffsHub link to each, the plan the
// message links under the config's plans directory, its `Beyond the ask:` line
// and whether it shipped fast. It follows first parents, so a merged PR shows
// as its merge commit. Without the ref it lists the last 20 commits.
// --done <session> marks that session's listed commits reviewed, `none`
// standing for commits without a Session: line, and moves the ref past the
// oldest commits once each is reviewed. --mark moves the ref to the tip it
// listed. The ref and the reviewed list live in this clone only.
//
// The config's reviewPaths, such as {"skip": ["docs/**"], "tests":
// ["**/*.test.*"], "public": ["packages/**"]}, sorts each changed file into the
// first of skip, tests and public whose globs match it, and every other file
// into internal, so a path no list names still reaches a review. A skipped
// file is never reviewed. A commit weakens tests when it deletes a test file, drops
// expect or assert lines from them or adds .skip or .todo calls. --tier public,
// the default when reviewPaths is set, or --tier internal lists only the
// commits with a file in that tier or weakened tests, and --tier all lists
// every commit. A commit that changes only skipped paths and new tests
// needs no review, so the ref moves past it. A session with more than one
// listed commit names --net <session>, which prints the diff of that
// session's commits in the tier as if they had landed together, so a later
// commit that undoes an earlier one cancels it.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const REF = 'refs/pstack/reviewed';
const FIRST = 20;
const TIERS = ['public', 'internal'];
const USAGE = 'Usage: node .agents/pstack/review.mjs [--tier public|internal|all] [--net <session>] | --mark | --done <session>';
const GLOB = { '**/': '(?:.*/)?', '**': '.*', '*': '[^/]*', '?': '[^/]' };

const fail = (message, code = 1) => {
  console.error(`review.mjs: ${message}`);
  process.exit(code);
};
const git = (args, options = {}) => spawnSync('git', ['--literal-pathspecs', ...args], { encoding: 'utf8', maxBuffer: 1 << 28, ...options });
const must = (...args) => {
  const run = git(args);
  if (run.status !== 0) fail(`git ${args.join(' ')} failed: ${run.stderr.trim()}`);
  return run.stdout.trim();
};

const args = process.argv.slice(2);
const flags = {};
for (let at = 0; at < args.length; at += 1) {
  const flag = args[at].replace(/^--/u, '');
  if (!['tier', 'net', 'done', 'mark'].includes(flag) || flag in flags) fail(USAGE, 2);
  if (flag === 'mark') flags.mark = true;
  else if (args[at + 1] === undefined) fail(USAGE, 2);
  else flags[flag] = args[++at];
}
if ((flags.mark || flags.done !== undefined) && Object.keys(flags).length > 1) fail(USAGE, 2);
process.chdir(must('rev-parse', '--show-toplevel'));
const { branch, plans = 'docs/plans', reviewPaths } = JSON.parse(readFileSync('.agents/pstack.json', 'utf8'));
const tier = flags.tier ?? (reviewPaths ? 'public' : 'all');
if (![...TIERS, 'all'].includes(tier)) fail(USAGE, 2);
if (tier !== 'all' && !reviewPaths) fail(`--tier ${tier} needs reviewPaths in .agents/pstack.json`, 2);
const upstream = `refs/remotes/origin/${branch}`;
const fetched = git(['fetch', '--quiet', 'origin', `+refs/heads/${branch}:${upstream}`]);
if (fetched.status !== 0) console.error(`review.mjs: fetch failed, listing the last fetched origin/${branch}: ${fetched.stderr.trim()}`);

const store = resolve(must('rev-parse', '--git-common-dir'), 'pstack-reviewed');
const reviewedShas = new Set(existsSync(store) ? readFileSync(store, 'utf8').split('\n').filter(Boolean) : []);
const tip = must('rev-parse', upstream);
const reviewed = git(['rev-parse', '--verify', '--quiet', REF]).stdout.trim();
const range = reviewed ? [`${reviewed}..${tip}`] : ['-n', String(FIRST), tip];
const log = must('log', '--first-parent', '--format=%H%x1f%h%x1f%s%x1f%b%x1e', ...range);
const PLAN = new RegExp(`${plans.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}/[^\\s)\\]\`'"<>]+?\\.md`, 'u');
const [, repo] = git(['remote', 'get-url', 'origin']).stdout.trim().match(/github\.com[:/](.+?)(?:\.git)?$/u) ?? [];

const matcher = (globs = []) => {
  const patterns = globs.map((glob) => new RegExp(`^${glob.replace(/[.+^${}()|[\]\\]/gu, '\\$&').replace(/\*\*\/|\*\*|\*|\?/gu, (token) => GLOB[token])}$`, 'u'));
  return (path) => patterns.some((pattern) => pattern.test(path));
};
const classes = ['skip', 'tests', 'public'].map((name) => [name, matcher(reviewPaths?.[name])]);
const some = (paths) => `${paths.slice(0, 3).join(', ')}${paths.length > 3 ? `, and ${paths.length - 3} more` : ''}`;
const diffOf = (sha, ...rest) => ['diff-tree', '-r', '-M', '--no-commit-id', '--root', '--diff-merges=first-parent', ...rest, sha];

// Each changed file with its status and class, and a note when the commit weakens tests.
function changes(sha) {
  const files = must(...diffOf(sha, '--name-status'))
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [status, ...paths] = line.split('\t');
      return { status: status[0], paths, tier: classes.find(([, match]) => match(paths.at(-1)))?.[0] ?? 'internal' };
    });
  const tests = files.filter((file) => file.tier === 'tests');
  if (tests.length === 0) return { files, weak: null };
  let asserts = 0;
  let skips = 0;
  for (const line of must(...diffOf(sha, '-p', '-U0'), '--', ...tests.flatMap((file) => file.paths)).split('\n')) {
    if (!/^[-+](?![-+]{2} )/u.test(line)) continue;
    const sign = line[0] === '+' ? 1 : -1;
    if (/\b(?:expect|assert)\w*\s*\(/u.test(line)) asserts += sign;
    if (/\.(?:skip|todo)\s*\(|\bx(?:it|test|describe)\s*\(/u.test(line)) skips += sign;
  }
  const deleted = tests.filter((file) => file.status === 'D').map((file) => file.paths[0]);
  const notes = deleted.length > 0 ? [`deleted ${deleted.length} test file(s): ${some(deleted)}`] : [];
  if (asserts < 0) notes.push(`${-asserts} fewer expect or assert lines`);
  if (skips > 0) notes.push(`${skips} more .skip or .todo calls`);
  return { files, weak: notes.length > 0 ? notes.join(', ') : null };
}

const commits = log
  .split('\x1e')
  .map((part) => part.trim())
  .filter(Boolean)
  .reverse()
  .map((record) => {
    const [sha, short, subject, body = ''] = record.split('\x1f');
    const { files, weak } = reviewPaths ? changes(sha) : { files: [], weak: null };
    return {
      sha,
      short,
      subject,
      files,
      weak,
      session: body.match(/^Session: (\S+)$/mu)?.[1] ?? 'none',
      plan: `${subject}\n${body}`.match(PLAN)?.[0] ?? 'No plan link',
      beyond: body.match(/^Beyond the ask:.*(?:\n(?!(?:Session|Plan|Introduced-by): ).+)*/mu)?.[0].replaceAll('\n', ' ') ?? 'No Beyond the ask: line',
      fast: /^Shipped fast, no review\.$/mu.test(body),
    };
  });
const inTier = (commit, name) => commit.files.some((file) => file.tier === name);
const needsReview = (commit) => !reviewPaths || commit.weak !== null || TIERS.some((name) => inTier(commit, name));
const shown = (commit) => tier === 'all' || commit.weak !== null || inTier(commit, tier);

if (flags.mark) {
  must('update-ref', REF, tip);
  writeFileSync(store, '');
  console.log(`Marked origin/${branch} at ${tip.slice(0, 7)} as reviewed.`);
  process.exit(0);
}

if (flags.done !== undefined) {
  const { done } = flags;
  const ours = commits.filter((commit) => commit.session === done && !reviewedShas.has(commit.sha));
  if (ours.length === 0) fail(`no listed commit to review has Session: ${done}; run review.mjs to see the sessions`);
  for (const commit of ours) reviewedShas.add(commit.sha);
  let advanced = null;
  for (const commit of commits) {
    if (!reviewedShas.has(commit.sha) && needsReview(commit)) break;
    advanced = commit.sha;
    reviewedShas.delete(commit.sha);
  }
  if (advanced) must('update-ref', REF, advanced);
  writeFileSync(store, [...reviewedShas].map((sha) => `${sha}\n`).join(''));
  console.log(`Marked ${ours.length} commit(s) of session ${done} as reviewed.${advanced ? ` ${REF} is now at ${advanced.slice(0, 7)}.` : ''}`);
  process.exit(0);
}

const open = commits.filter((commit) => !reviewedShas.has(commit.sha));

if (flags.net !== undefined) {
  const ours = open.filter((commit) => commit.session === flags.net);
  if (ours.length === 0) fail(`no listed commit to review has Session: ${flags.net}; run review.mjs to see the sessions`);
  const paths = tier === 'all' ? [] : [...new Set(ours.flatMap((commit) => commit.files.filter((file) => file.tier === tier).flatMap((file) => file.paths)))];
  if (tier !== 'all' && paths.length === 0) fail(`session ${flags.net} changes no ${tier} paths`);
  const used = tier === 'all' ? ours : ours.filter((commit) => inTier(commit, tier));
  const start = git(['rev-parse', '--verify', '--quiet', `${used[0].sha}^1`]).stdout.trim() || must('hash-object', '-t', 'tree', '/dev/null');
  const scratch = mkdtempSync(join(tmpdir(), 'review-net-'));
  const env = { ...process.env, GIT_INDEX_FILE: join(scratch, 'index') };
  const unread = git(['read-tree', start], { env }).status !== 0;
  const stuck = unread
    ? null
    : used.find((commit) => {
        const patch = git([...diffOf(commit.sha, '-p', '--binary'), '--', ...paths]).stdout;
        return patch !== '' && git(['apply', '--cached', '--binary'], { env, input: patch }).status !== 0;
      });
  const tree = unread || stuck ? null : git(['write-tree'], { env }).stdout.trim();
  rmSync(scratch, { recursive: true, force: true });
  if (unread) fail(`git read-tree ${start} failed`);
  if (stuck) fail(`${stuck.short} does not apply on the session's earlier commits alone, because a commit landed between them changed the same lines; review its commits one by one`);
  console.log(`Net diff of session ${flags.net}'s ${used.length} commit(s)${tier === 'all' ? '' : ` in ${tier} paths`}, from ${start.slice(0, 7)}:\n`);
  process.stdout.write(must('diff', '-M', start, tree, '--', ...paths));
  process.stdout.write('\n');
  process.exit(0);
}

const listed = open.filter(shown);
const title = (commit) =>
  repo ? `📦 [${commit.subject.replace(/[[\]]/gu, '\\$&')}](https://diffshub.com/${repo}/commit/${commit.sha})` : `${commit.short} ${commit.subject}`;
const groups = new Map();
for (const commit of listed) {
  if (!groups.has(commit.session)) groups.set(commit.session, []);
  const lines = [`  ${title(commit)}`, `    ${commit.plan}`, `    ${commit.beyond}`];
  const files = commit.files.filter((file) => file.tier === tier).map((file) => file.paths.at(-1));
  if (tier !== 'all' && files.length > 0) lines.push(`    ${files.length} ${tier} file(s): ${some(files)}`);
  if (commit.weak) lines.push(`    Tests: ${commit.weak}`);
  if (commit.fast) lines.push('    Shipped fast, no review.');
  groups.get(commit.session).push(lines.join('\n'));
}
const since = reviewed ? `since ${REF} (${reviewed.slice(0, 7)})` : `in the last ${FIRST}, because ${REF} is not set`;
const noun = tier === 'all' ? '' : ` with ${tier} changes or weakened tests`;
console.log(listed.length === 0 ? `No commits${noun} to review on origin/${branch} ${since}.` : `${listed.length} commit(s)${noun} to review on origin/${branch} ${since}:`);
const defaultTier = reviewPaths ? 'public' : 'all';
for (const [session, entries] of groups) {
  const heading = session === 'none' ? 'No Session: line (--done none)' : session.startsWith('local_') ? `Session ${session} (claude://claude.ai/epitaxy/${session})` : `Session ${session}`;
  const net = entries.length > 1 ? `\n  Net: node .agents/pstack/review.mjs --net ${session}${tier === defaultTier ? '' : ` --tier ${tier}`}` : '';
  console.log(`\n${heading}\n${entries.join('\n')}${net}`);
}
if (tier !== 'all') {
  const hidden = open.filter((commit) => !shown(commit));
  const other = hidden.filter(needsReview).length;
  const rest = TIERS.find((name) => name !== tier);
  if (other > 0) console.log(`\n${other} more commit(s) change ${rest} paths and no ${tier} ones; --tier ${rest} lists them, and --done marks a session's commits reviewed in every tier.`);
  if (hidden.length > other) console.log(`${hidden.length - other} commit(s) change only skipped paths or add tests, and need no review.`);
}
