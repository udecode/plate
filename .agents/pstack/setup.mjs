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
// with refs/pstack/ledger on origin, or on the companion repository's origin
// through the main checkout's `companion.dir` when the config names a
// `companion`, skipping it while that is missing. The file takes the ref's
// order, and each row the ref's state forbids moves to
// suggested-tasks.refused.tsv beside it. On the branch
// .agents/pstack.json names it fast-forwards only when no other local edit,
// staged, unstaged or untracked, touches a path the incoming commits change.
// When the session's pstack install is older than the tag .claude/settings.json
// pins, a --hook run updates a Claude Code install and says to restart, and
// prints the update command for a Codex one.
// It prints one line per action for the session. In a session cross.mjs starts
// read-only, which sets PSTACK_READ_ONLY, it does nothing.

import { spawnSync } from 'node:child_process';
import { appendFileSync, copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { hookPayload, sessionCheckout } from './checkout.mjs';
import { pluginLag, runtimeFromEnv } from './lead.mjs';
import { LEDGER, LEDGER_REF, ledgerPath, lockLedger, REFUSED, syncLedger } from './tasks.mjs';

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
if (process.env.PSTACK_READ_ONLY) {
  console.log('setup.mjs: skipped, because this session is read-only');
  process.exit();
}

const checkout = sessionCheckout(hook ? hookPayload().cwd : undefined);
if (!checkout) process.exit(0);
process.chdir(checkout.root);
const gitDir = out('rev-parse', '--path-format=absolute', '--git-dir');
const commonDir = out('rev-parse', '--path-format=absolute', '--git-common-dir');
const linked = gitDir !== commonDir;

const runtime = runtimeFromEnv(process.env) ?? (hook ? 'claude' : null);
const lag = pluginLag(runtime);
if (lag) {
  const behind = `pstack ${lag.installed ?? 'is not installed'}${lag.installed ? ' is older than' : ', and'} .claude/settings.json pins v${lag.pin}`;
  const run = hook && runtime === 'claude' ? spawnSync(lag.command, { shell: true, cwd: lag.cwd, encoding: 'utf8', timeout: 180_000 }) : null;
  const tail = run ? `${run.stdout}${run.stderr}`.trim().split('\n').at(-1) : '';
  console.log(
    run?.status === 0
      ? `setup.mjs: ${behind}, so it ran ${lag.command}; restart this session to load v${lag.pin}`
      : `setup.mjs: ${behind}${run ? `, and the update failed: ${tail}` : ''}; run \`cd ${lag.cwd} && ${lag.command}\`, then restart this session`
  );
}

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
// the ref on origin keeps them durable and shared between clones.
const sync = (ledger, former, via) => {
  // A start that finds another run syncing leaves the ledger to it.
  const lock = lockLedger(commonDir);
  if (!lock) return;
  try {
    absorbFormer(former, ledger);
    const { reachable, pulled, pushed, refused, pending } = syncLedger(ledger, via, lock);
    if (pulled) console.log(`setup.mjs: added ${pulled} ledger row(s) from ${LEDGER_REF} on origin`);
    for (const { problem } of refused) console.log(`setup.mjs: refused ${problem}; the row moved to ${REFUSED}`);
    if (pushed) console.log(`setup.mjs: pushed ${pushed} ledger row(s) to ${LEDGER_REF} on origin`);
    if (pending) console.log(`setup.mjs: could not push ${pending} ledger row(s) to ${LEDGER_REF} on origin${reachable ? '' : ', because origin cannot be reached'}`);
  } finally {
    lock.release();
  }
};

const config = existsSync('.agents/pstack.json') ? JSON.parse(readFileSync('.agents/pstack.json', 'utf8')) : {};
const { branch } = config;
const mainCompanion = config.companion?.dir ? join(dirname(commonDir), config.companion.dir) : null;
if (config.plans && mainCompanion && !existsSync(mainCompanion)) console.log(`setup.mjs: skipped the ledger sync, because this clone has no ${config.companion.dir} yet`);
else if (config.plans) sync(ledgerPath(config.plans, 'trunk'), join(config.plans, LEDGER), mainCompanion ? ['--git-dir', mainCompanion] : []);
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
