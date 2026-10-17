#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/land.mjs [--message <file>] [--check <command>]...
// Lands this worktree's task on origin/<branch>, the branch .agents/pstack.json
// names, as one commit. It commits every change in the worktree, squashes the
// task's commits into one with the message file's text, rebases it onto
// origin/<branch>, runs the config's lintFix on the changed files and each
// --check, then delivers by this clone's `git config pstack.delivery`: `push`
// pushes <branch>, and anything else pushes a topic branch and opens a PR into
// <branch> with gh. Without --message it keeps the message of the task's last
// commit, so a run stopped by a conflict or a failed check reruns as is.
//
// The message is one Conventional Commit whose body holds a `Beyond the ask:`
// line. A rebase conflict stops with the rebase in progress and lists the
// conflicting paths. A push rejected because <branch> moved rebases and
// retries up to three times. It never force-pushes.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const USAGE = 'Usage: node .agents/pstack/land.mjs [--message <file>] [--check <command>]...';
const SUBJECT = /^(feat|fix|docs|refactor|test|chore|perf)(\([^()\s]+\))?!?: \S(.*\S)?$/u;
const BEYOND = /^Beyond the ask: \S/mu;
const RETRIES = 3;

const fail = (message, code = 1) => {
  console.error(`land.mjs: ${message}`);
  process.exit(code);
};
const git = (...args) => spawnSync('git', args, { encoding: 'utf8' });
const must = (...args) => {
  const run = git(...args);
  if (run.status !== 0) fail(`git ${args.join(' ')} failed: ${run.stderr.trim()}`);
  return run.stdout.trim();
};
const quote = (text) => `'${text.replaceAll("'", "'\\''")}'`;

const args = process.argv.slice(2);
let messageFile = null;
const checks = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--message' && args[i + 1]) messageFile = args[++i];
  else if (args[i] === '--check' && args[i + 1]) checks.push(args[++i]);
  else fail(USAGE, 2);
}
// Read before the chdir, because the path is relative to the caller's directory.
const messageText = messageFile === null ? null : readFileSync(messageFile, 'utf8');

process.chdir(must('rev-parse', '--show-toplevel'));
const config = JSON.parse(readFileSync('.agents/pstack.json', 'utf8'));
const { branch, protected: guarded, lintFix } = config;
if (!branch) fail('.agents/pstack.json names no branch');
const upstream = `refs/remotes/origin/${branch}`;
const mode = git('config', '--get', 'pstack.delivery').stdout.trim() === 'push' ? 'push' : 'pr';
const current = must('branch', '--show-current');
if (guarded && current === guarded) fail(`this checkout is on ${guarded}; land from a worktree cut from origin/${branch}`);

const midway = ['rebase-merge', 'rebase-apply', 'MERGE_HEAD'].some((name) => existsSync(must('rev-parse', '--git-path', name)));
if (midway) fail('a rebase or merge is in progress; resolve it, `git add` the paths, `git rebase --continue`, then run land.mjs again');

const conflicted = () => must('diff', '--name-only', '--diff-filter=U').split('\n').filter(Boolean);
const dirty = () => must('status', '--porcelain', '--untracked-files=all') !== '';

function fetch() {
  must('fetch', '--quiet', 'origin', `+refs/heads/${branch}:${upstream}`);
}

function rebase() {
  if (git('merge-base', '--is-ancestor', upstream, 'HEAD').status === 0) return;
  const run = git('rebase', '--quiet', upstream);
  if (run.status === 0) return;
  const paths = conflicted();
  if (paths.length === 0) {
    git('rebase', '--abort');
    fail(`git rebase origin/${branch} failed: ${run.stderr.trim()}`);
  }
  fail(
    `rebasing onto origin/${branch} conflicts in:\n${paths.map((path) => `  ${path}`).join('\n')}\n` +
      'The rebase is still in progress. Resolve those paths, `git add` them, `git rebase --continue`, then run land.mjs again without --message.'
  );
}

function validate(text) {
  const [subject, gap, ...rest] = text.trim().split('\n');
  if (!SUBJECT.test(subject) || subject.endsWith('.')) {
    fail(`the subject "${subject}" is not one Conventional Commit, \`type(scope): subject\` with type feat, fix, docs, refactor, test, chore or perf and no trailing period`);
  }
  if (rest.length > 0 && gap !== '') fail('a blank line must separate the subject from the body');
  if (!BEYOND.test(rest.join('\n'))) fail('the body has no `Beyond the ask:` line; name every change the request did not ask for, or write `Beyond the ask: none`');
  return { subject, body: rest.join('\n').trim() };
}

function squash(text) {
  const head = must('rev-parse', 'HEAD');
  const base = must('merge-base', 'HEAD', upstream);
  must('add', '--all');
  must('reset', '--quiet', '--soft', base);
  if (git('diff', '--cached', '--quiet').status === 0) {
    must('reset', '--quiet', '--soft', head);
    fail(`nothing to land: the task changes nothing against origin/${branch}`);
  }
  const file = join(mkdtempSync(join(tmpdir(), 'land-')), 'message');
  writeFileSync(file, text);
  const run = spawnSync('git', ['commit', '--quiet', '--file', file], { stdio: 'inherit' });
  if (run.status !== 0) {
    must('reset', '--quiet', '--soft', head);
    fail('git commit failed; the task commits are back as they were');
  }
}

fetch();
const ahead = Number(must('rev-list', '--count', `${upstream}..HEAD`));
if (messageText === null && ahead === 0) fail(`HEAD has no task commit to take a message from; pass --message <file>\n${USAGE}`);
const message = validate(messageText ?? must('log', '-1', '--format=%B'));
squash(`${message.subject}\n\n${message.body}\n`);
rebase();

const changed = must('diff', '--name-only', '--diff-filter=d', upstream, 'HEAD').split('\n').filter(Boolean);
if (lintFix && changed.length > 0) {
  const run = spawnSync(`${lintFix} ${changed.map(quote).join(' ')}`, { shell: true, stdio: 'inherit' });
  if (run.status !== 0) fail(`${lintFix} failed on the changed files; fix them and run land.mjs again`);
  if (dirty()) {
    must('add', '--all');
    must('commit', '--quiet', '--amend', '--no-edit');
  }
}
for (const check of checks) {
  const run = spawnSync(check, { shell: true, stdio: 'inherit' });
  if (run.status !== 0) fail(`check failed: ${check}; the squashed commit stays local`);
}
if (dirty()) {
  fail(`the checks changed files; review them and run land.mjs again, which folds them into the commit:\n${must('status', '--short')}`);
}

if (mode === 'push') {
  for (let attempt = 0; ; attempt += 1) {
    const run = git('push', '--quiet', 'origin', `HEAD:refs/heads/${branch}`);
    if (run.status === 0) break;
    const moved = /\[rejected\]|fetch first|non-fast-forward/u.test(run.stderr);
    if (!moved || attempt === RETRIES) fail(`git push origin HEAD:${branch} failed: ${run.stderr.trim()}`);
    console.log(`origin/${branch} moved; rebasing and pushing again (retry ${attempt + 1} of ${RETRIES})`);
    fetch();
    rebase();
  }
  console.log(`Landed ${must('rev-parse', '--short', 'HEAD')} on origin/${branch}: ${message.subject}`);
} else {
  const slug = message.subject.toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '').slice(0, 50);
  const topic = current && current !== branch ? current : `land/${slug}`;
  const pushed = git('push', '--quiet', 'origin', `HEAD:refs/heads/${topic}`);
  if (pushed.status !== 0) {
    fail(`git push origin HEAD:${topic} failed, and land.mjs never forces: ${pushed.stderr.trim()}\nPush follow-up commits to the open PR yourself, or land from a new branch.`);
  }
  const body = join(mkdtempSync(join(tmpdir(), 'land-')), 'body');
  writeFileSync(body, `${message.body}\n`);
  const pr = spawnSync('gh', ['pr', 'create', '--base', branch, '--head', topic, '--title', message.subject, '--body-file', body], { encoding: 'utf8' });
  if (pr.status !== 0) fail(`gh pr create failed after pushing ${topic}: ${`${pr.stderr}${pr.stdout}`.trim()}`);
  console.log(`Pushed ${topic} and opened a PR into ${branch}: ${pr.stdout.trim()}`);
}
