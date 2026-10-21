#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: a Claude Code SessionStart hook,
//   node .agents/pstack/setup.mjs [--install <command>] [--env <name>]...
// In a linked worktree it copies each untracked env file (by default `.env`
// and `.env.local`, at any depth git does not skip as an ignored directory)
// from the main checkout to the same path when that path is free, and runs
// --install once per worktree, again after a failed run. Then, in the main
// checkout on the branch .agents/pstack.json names, it lands the rows sessions
// appended to the suggested-task ledger as one commit on origin/<branch>, and
// fast-forwards only when no other local edit, staged, unstaged or untracked,
// touches a path the incoming commits change. It prints one line per action
// for the session.

import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { LEDGER } from './tasks.mjs';

const git = (args, options = {}) => spawnSync('git', args, { encoding: 'utf8', timeout: 30_000, ...options });
const out = (...args) => {
  const run = git(args);
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
const gitDir = out('rev-parse', '--path-format=absolute', '--git-dir');
const linked = gitDir !== out('rev-parse', '--path-format=absolute', '--git-common-dir');

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
  // A worktree can arrive with node_modules copied from the main checkout, which skipped every
  // install script, so a node_modules folder does not mean an install ran here.
  const installMarker = join(gitDir, 'pstack-installed');
  if (install && !existsSync(installMarker)) {
    const run = spawnSync(install, { shell: true, encoding: 'utf8' });
    if (run.status === 0) writeFileSync(installMarker, `${install}\n`);
    const tail = `${run.stdout}${run.stderr}`.trim().split('\n').at(-1);
    console.log(run.status === 0 ? `setup.mjs: ran ${install}` : `setup.mjs: ${install} failed (exit ${run.status}): ${tail}`);
  }
  if (!main) process.exit(0);
  process.chdir(main);
}

const config = existsSync('.agents/pstack.json') ? JSON.parse(readFileSync('.agents/pstack.json', 'utf8')) : {};
const { branch } = config;
if (!branch || out('branch', '--show-current') !== branch) process.exit(0);
const upstream = `refs/remotes/origin/${branch}`;
const fetchUpstream = () => out('fetch', '--quiet', 'origin', `+refs/heads/${branch}:${upstream}`) !== null;
if (!fetchUpstream()) process.exit(0);

// Every session appends its suggested-task rows to this checkout's ledger and no task commits
// them, so the first session to find them lands them; left here, they block every fast-forward.
const ledger = config.plans ? join(config.plans, LEDGER) : null;
const landLedger = () => {
  if (!ledger || !existsSync(ledger)) return;
  const base = git(['show', `HEAD:${ledger}`]).stdout ?? '';
  const file = readFileSync(ledger, 'utf8');
  // A row another session is still appending has no newline yet; the next run lands it.
  const text = file.slice(0, file.lastIndexOf('\n') + 1);
  if (text.length <= base.length) return;
  if (!text.startsWith(base)) {
    console.log(`setup.mjs: ${ledger} has local edits that are not appended rows, so they were not landed`);
    return;
  }
  const rows = text.slice(base.length).split('\n').filter(Boolean);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (attempt > 0 && !fetchUpstream()) break;
    const theirs = git(['show', `${upstream}:${ledger}`]).stdout ?? '';
    const known = new Set(theirs.split('\n'));
    const added = rows.filter((row) => !known.has(row));
    if (added.length === 0) {
      moveTo(out('rev-parse', upstream), text, theirs);
      return;
    }
    const content = `${theirs}${theirs === '' || theirs.endsWith('\n') ? '' : '\n'}${added.join('\n')}\n`;
    const blob = git(['hash-object', '-w', '--stdin'], { input: content }).stdout.trim();
    const env = { ...process.env, GIT_INDEX_FILE: join(gitDir, 'pstack-ledger-index') };
    git(['read-tree', upstream], { env });
    git(['update-index', '--cacheinfo', `100644,${blob},${ledger}`], { env });
    const tree = git(['write-tree'], { env }).stdout.trim();
    rmSync(env.GIT_INDEX_FILE, { force: true });
    const message = `chore(plans): land ${added.length} suggested-task ledger row(s)\n\n[skip ci]`;
    const head = out('commit-tree', tree, '-p', upstream, '-m', message);
    if (!head) break;
    if (git(['push', '--quiet', 'origin', `${head}:refs/heads/${branch}`], { timeout: 60_000 }).status !== 0) continue;
    git(['update-ref', upstream, head]);
    console.log(`setup.mjs: landed ${added.length} ledger row(s) on origin/${branch} as ${head.slice(0, 10)}`);
    moveTo(head, text, content);
    return;
  }
  console.log(`setup.mjs: could not land the ${rows.length} ledger row(s) on origin/${branch}`);
};

// Moves this checkout to the commit that holds its ledger rows without rewriting the ledger
// file, which other sessions keep appending to, unless the commit put rows before them.
const moveTo = (head, text, committed) => {
  if (git(['merge-base', '--is-ancestor', 'HEAD', head]).status !== 0) return;
  const changed = git(['diff', '--name-status', '--no-renames', '-z', 'HEAD', head]).stdout.split('\0').filter(Boolean);
  const paths = [];
  for (let i = 0; i < changed.length; i += 2) paths.push({ status: changed[i], path: changed[i + 1] });
  const updated = paths.filter(({ path }) => path !== ledger);
  const others = new Set(updated.map(({ path }) => path));
  if (localEdits().some((path) => others.has(path))) return;
  git(['reset', '--quiet', '--mixed', head]);
  for (const { path } of updated.filter(({ status }) => status === 'D')) rmSync(path, { force: true });
  const written = updated.filter(({ status }) => status !== 'D').map(({ path }) => path);
  for (let i = 0; i < written.length; i += 200) git(['checkout', '--quiet', '--', ...written.slice(i, i + 200)]);
  if (committed === text) return;
  const now = readFileSync(ledger, 'utf8');
  if (!now.startsWith(text)) return;
  writeFileSync(`${ledger}.tmp`, `${committed}${now.slice(text.length)}`);
  renameSync(`${ledger}.tmp`, ledger);
};

const localEdits = () => {
  const local = git(['status', '--porcelain=v1', '-z', '--untracked-files=all']).stdout.split('\0').filter(Boolean);
  const paths = [];
  for (let i = 0; i < local.length; i += 1) {
    paths.push(local[i].slice(3));
    if (local[i][0] === 'R' || local[i][0] === 'C') paths.push(local[++i]);
  }
  return paths;
};

landLedger();
const behind = Number(out('rev-list', '--count', `HEAD..${upstream}`) ?? 0);
if (behind === 0) process.exit(0);
if (git(['merge-base', '--is-ancestor', 'HEAD', upstream]).status !== 0) {
  console.log(`setup.mjs: ${branch} has commits origin/${branch} lacks, so it was not fast-forwarded`);
  process.exit(0);
}
const incoming = new Set(out('diff', '--name-only', 'HEAD', upstream).split('\n').filter(Boolean));
const touched = localEdits().filter((path) => incoming.has(path));
if (touched.length > 0) {
  console.log(`setup.mjs: ${behind} commit(s) on origin/${branch} not pulled, because local edits touch ${touched.slice(0, 10).join(', ')}`);
  process.exit(0);
}
const merged = git(['merge', '--ff-only', '--quiet', upstream]);
console.log(merged.status === 0 ? `setup.mjs: fast-forwarded ${branch} by ${behind} commit(s)` : `setup.mjs: fast-forward failed: ${merged.stderr.trim()}`);
