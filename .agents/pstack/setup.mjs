#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: a Claude Code SessionStart hook,
//   node .agents/pstack/setup.mjs [--hook] [--install <command>] [--env <name>]...
// --hook reads the hook payload from stdin and works on the session's own
// checkout, as checkout.mjs finds it. In a linked worktree it copies each
// untracked env file (by default `.env` and `.env.local`, at any depth git
// does not skip as an ignored directory) from the main checkout to the same
// path when that path is free, and runs
// --install once per worktree, again after a failed run; run by hand, a
// failed install makes it exit 1. Then, in the main
// checkout, it keeps the suggested-task ledger, which git ignores, in step
// with refs/pstack/ledger on origin, and on the branch .agents/pstack.json
// names it fast-forwards only when no other local edit, staged, unstaged or
// untracked, touches a path the incoming commits change. It prints one line
// per action for the session.

import { spawnSync } from 'node:child_process';
import { appendFileSync, copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { hookPayload, sessionCheckout } from './checkout.mjs';
import { LEDGER, LEDGER_REF, ledgerPath } from './tasks.mjs';

// The ledger outgrows spawnSync's 1 MB default buffer, which cuts its output off without failing.
const git = (args, options = {}) => spawnSync('git', args, { encoding: 'utf8', maxBuffer: 1 << 30, timeout: 30_000, ...options });
const out = (...args) => {
  const run = git(args);
  return run.status === 0 ? run.stdout.trim() : null;
};

const args = process.argv.slice(2);
let install = null;
let hook = false;
const names = [];
for (let i = 0; i < args.length; i += 1) {
  const hasValue = args[i + 1] && !args[i + 1].startsWith('--');
  if (args[i] === '--hook') hook = true;
  else if (args[i] === '--install' && hasValue) install = args[++i];
  else if (args[i] === '--env' && hasValue) names.push(args[++i]);
  else {
    console.error('Usage: node .agents/pstack/setup.mjs [--hook] [--install <command>] [--env <name>]...');
    process.exit(2);
  }
}
if (names.length === 0) names.push('.env', '.env.local');

const checkout = sessionCheckout(hook ? hookPayload().cwd : undefined);
if (!checkout) process.exit(0);
process.chdir(checkout.root);
const gitDir = out('rev-parse', '--path-format=absolute', '--git-dir');
const commonDir = out('rev-parse', '--path-format=absolute', '--git-common-dir');
const linked = gitDir !== commonDir;

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
    if (run.status !== 0 && !hook) process.exitCode = 1;
  }
  if (!main) process.exit();
  process.chdir(main);
}

const rows = (text) => text.slice(0, text.lastIndexOf('\n') + 1).split('\n').filter(Boolean);

// Appends the complete rows of text that the file lacks, after the file's own. Returns how many,
// or null when the file ends inside a row another session is still writing.
const appendMissing = (path, text) => {
  const file = existsSync(path) ? readFileSync(path, 'utf8') : '';
  if (file !== '' && !file.endsWith('\n')) return null;
  const known = new Set(rows(file));
  const added = rows(text).filter((row) => !known.has(row));
  if (added.length > 0) {
    mkdirSync(dirname(path), { recursive: true });
    appendFileSync(path, `${added.join('\n')}\n`);
  }
  return added.length;
};

// Helpers from before the ledger moved append to its former path. Once this checkout has the
// tracked link there, their rows reach the ledger through it; until then, or when a file replaces
// the link, the rows move into the ledger and the path goes back to what HEAD holds.
const absorbFormer = (former, ledger) => {
  if (!lstatSync(former, { throwIfNoEntry: false })?.isFile()) return;
  const moved = appendMissing(ledger, readFileSync(former, 'utf8'));
  if (moved === null) return;
  if (moved > 0) console.log(`setup.mjs: moved ${moved} ledger row(s) from ${former} to ${ledger}`);
  if (git(['ls-files', '--error-unmatch', '--', former]).status !== 0) rmSync(former);
  else if (git(['diff', '--quiet', 'HEAD', '--', former]).status !== 0) git(['checkout', 'HEAD', '--', former]);
};

// Every session appends its suggested-task rows to this checkout's ledger, which git ignores, so
// the ref on origin keeps them durable and shared between clones. Both sides only gain rows: the
// file gets the rows only the ref holds, and the ref gets the rows only the file holds, pushed as
// a fast-forward.
const syncLedger = (ledger, former) => {
  const lock = join(commonDir, 'pstack-ledger.lock');
  try {
    mkdirSync(lock);
  } catch {
    // Two starts at once would append the same rows twice; a lock this old belongs to a start that died.
    if (Date.now() - (statSync(lock, { throwIfNoEntry: false })?.mtimeMs ?? 0) < 120_000) return;
  }
  try {
    absorbFormer(former, ledger);
    let pending = 0;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const fetched = git(['fetch', '--quiet', 'origin', `+${LEDGER_REF}:${LEDGER_REF}`]).status === 0;
      if (attempt > 0 && !fetched) break;
      const tip = out('rev-parse', '--verify', '--quiet', `${LEDGER_REF}^{commit}`);
      const shown = tip ? git(['show', `${tip}:${LEDGER}`]) : null;
      const theirs = shown?.status === 0 ? shown.stdout : '';
      const pulled = appendMissing(ledger, theirs);
      if (pulled) console.log(`setup.mjs: added ${pulled} ledger row(s) from ${LEDGER_REF} on origin`);
      const known = new Set(rows(theirs));
      const added = rows(existsSync(ledger) ? readFileSync(ledger, 'utf8') : '').filter((row) => !known.has(row));
      pending = added.length;
      if (pending === 0) return;
      const content = `${theirs}${theirs === '' || theirs.endsWith('\n') ? '' : '\n'}${added.join('\n')}\n`;
      const blob = git(['hash-object', '-w', '--stdin'], { input: content }).stdout.trim();
      const tree = git(['mktree'], { input: `100644 blob ${blob}\t${LEDGER}\n` }).stdout.trim();
      const head = out('commit-tree', tree, ...(tip ? ['-p', tip] : []), '-m', `${pending} suggested-task ledger row(s)`);
      if (!head) break;
      if (git(['push', '--quiet', 'origin', `${head}:${LEDGER_REF}`], { timeout: 60_000 }).status !== 0) continue;
      git(['update-ref', LEDGER_REF, head]);
      console.log(`setup.mjs: pushed ${pending} ledger row(s) to ${LEDGER_REF} on origin`);
      return;
    }
    console.log(`setup.mjs: could not push ${pending} ledger row(s) to ${LEDGER_REF} on origin`);
  } finally {
    rmSync(lock, { recursive: true, force: true });
  }
};

const config = existsSync('.agents/pstack.json') ? JSON.parse(readFileSync('.agents/pstack.json', 'utf8')) : {};
const { branch } = config;
if (config.plans) syncLedger(ledgerPath(config.plans, 'trunk'), join(config.plans, LEDGER));
if (!branch || out('branch', '--show-current') !== branch) process.exit();
const upstream = `refs/remotes/origin/${branch}`;
if (out('fetch', '--quiet', 'origin', `+refs/heads/${branch}:${upstream}`) === null) process.exit();

const localEdits = () => {
  const local = git(['status', '--porcelain=v1', '-z', '--untracked-files=all']).stdout.split('\0').filter(Boolean);
  const paths = [];
  for (let i = 0; i < local.length; i += 1) {
    paths.push(local[i].slice(3));
    if (local[i][0] === 'R' || local[i][0] === 'C') paths.push(local[++i]);
  }
  return paths;
};

const behind = Number(out('rev-list', '--count', `HEAD..${upstream}`) ?? 0);
if (behind === 0) process.exit();
if (git(['merge-base', '--is-ancestor', 'HEAD', upstream]).status !== 0) {
  console.log(`setup.mjs: ${branch} has commits origin/${branch} lacks, so it was not fast-forwarded`);
  process.exit();
}
const incoming = new Set(out('diff', '--name-only', 'HEAD', upstream).split('\n').filter(Boolean));
const touched = localEdits().filter((path) => incoming.has(path));
if (touched.length > 0) {
  console.log(`setup.mjs: ${behind} commit(s) on origin/${branch} not pulled, because local edits touch ${touched.slice(0, 10).join(', ')}`);
  process.exit();
}
const merged = git(['merge', '--ff-only', '--quiet', upstream]);
console.log(merged.status === 0 ? `setup.mjs: fast-forwarded ${branch} by ${behind} commit(s)` : `setup.mjs: fast-forward failed: ${merged.stderr.trim()}`);
