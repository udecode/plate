#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: a Claude Code SessionStart hook,
//   node .agents/pstack/setup.mjs [--install <command>] [--env <name>]...
// In a linked worktree it copies each untracked env file (by default `.env`
// and `.env.local`, at any depth git does not skip as an ignored directory)
// from the main checkout to the same path when that path is free, and runs
// --install when the worktree has no node_modules. In the main checkout on the
// branch .agents/pstack.json names, it fetches origin/<branch> and fast-forwards
// only when no local edit, staged, unstaged or untracked, touches a path the
// incoming commits change. It prints one line per action for the session.

import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

const git = (...args) => spawnSync('git', args, { encoding: 'utf8', timeout: 30_000 });
const out = (...args) => {
  const run = git(...args);
  return run.status === 0 ? run.stdout.trim() : null;
};

const args = process.argv.slice(2);
let install = null;
const names = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--install' && args[i + 1]) install = args[++i];
  else if (args[i] === '--env' && args[i + 1]) names.push(args[++i]);
  else {
    console.error('Usage: node .agents/pstack/setup.mjs [--install <command>] [--env <name>]...');
    process.exit(2);
  }
}
if (names.length === 0) names.push('.env', '.env.local');

const root = out('rev-parse', '--show-toplevel');
if (!root) process.exit(0);
process.chdir(root);
const linked = out('rev-parse', '--path-format=absolute', '--git-dir') !== out('rev-parse', '--path-format=absolute', '--git-common-dir');

if (linked) {
  const main = out('worktree', 'list', '--porcelain')?.match(/^worktree (.+)$/mu)?.[1];
  const listed = main ? out('-C', main, 'ls-files', '--others', '--ignored', '--exclude-standard', '--directory', '--no-empty-directory') : null;
  const copied = [];
  for (const path of (listed ?? '').split('\n')) {
    if (!names.includes(basename(path)) || existsSync(path) || !existsSync(dirname(path) || '.')) continue;
    copyFileSync(join(main, path), path);
    copied.push(path);
  }
  if (copied.length > 0) console.log(`setup.mjs: copied ${copied.join(', ')} from ${main}`);
  if (install && !existsSync('node_modules')) {
    const run = spawnSync(install, { shell: true, encoding: 'utf8' });
    const tail = `${run.stdout}${run.stderr}`.trim().split('\n').at(-1);
    console.log(run.status === 0 ? `setup.mjs: ran ${install}` : `setup.mjs: ${install} failed (exit ${run.status}): ${tail}`);
  }
  process.exit(0);
}

const { branch } = existsSync('.agents/pstack.json') ? JSON.parse(readFileSync('.agents/pstack.json', 'utf8')) : {};
if (!branch || out('branch', '--show-current') !== branch) process.exit(0);
const upstream = `refs/remotes/origin/${branch}`;
if (out('fetch', '--quiet', 'origin', `+refs/heads/${branch}:${upstream}`) === null) process.exit(0);
const behind = Number(out('rev-list', '--count', `HEAD..${upstream}`) ?? 0);
if (behind === 0) process.exit(0);
if (git('merge-base', '--is-ancestor', 'HEAD', upstream).status !== 0) {
  console.log(`setup.mjs: ${branch} has commits origin/${branch} lacks, so it was not fast-forwarded`);
  process.exit(0);
}
const incoming = new Set(out('diff', '--name-only', 'HEAD', upstream).split('\n').filter(Boolean));
const local = git('status', '--porcelain=v1', '-z', '--untracked-files=all').stdout.split('\0').filter(Boolean);
const touched = [];
for (let i = 0; i < local.length; i += 1) {
  const paths = [local[i].slice(3)];
  if (local[i][0] === 'R' || local[i][0] === 'C') paths.push(local[++i]);
  touched.push(...paths.filter((path) => incoming.has(path)));
}
if (touched.length > 0) {
  console.log(`setup.mjs: ${behind} commit(s) on origin/${branch} not pulled, because local edits touch ${touched.slice(0, 10).join(', ')}`);
  process.exit(0);
}
const merged = git('merge', '--ff-only', '--quiet', upstream);
console.log(merged.status === 0 ? `setup.mjs: fast-forwarded ${branch} by ${behind} commit(s)` : `setup.mjs: fast-forward failed: ${merged.stderr.trim()}`);
