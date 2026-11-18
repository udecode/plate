#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/land.mjs [--message <file>] [--check <command>]... [--dry]
//    or: node .agents/pstack/land.mjs --friction
// Lands this worktree's task on <branch>, the branch .agents/pstack.json
// names, as one commit. It commits every change in the worktree, squashes the
// task's commits into one with the message file's text, rebases it onto the
// canonical <branch>, runs the config's lintFix on the changed files and each
// --check, then delivers by this clone's `git config pstack.delivery`: `push`
// pushes <branch> to origin, and anything else pushes a topic branch to origin
// and opens a PR into <branch> with gh. In PR mode the canonical repository is
// the `upstream` remote when the clone has one, so a contributor whose origin
// is a fork rebases onto upstream and opens the PR there from the fork. The PR
// body is the page `plan-page.mjs <plan> --pr` renders, with each frame it
// prints attached, when the task changes exactly one dated plan, and the
// commit body otherwise; a refused render stops before the push. It then
// arms GitHub auto-merge on the PR with a merge method <branch>'s rules allow,
// so the PR merges once its required checks and reviews pass.
// Without --message it keeps the message of the task's last commit, so a run
// stopped by a conflict or a failed check reruns as is. With --dry it checks
// the message, its source and the Defaults table of each open dated plan the
// task changes, runs each of the config's `landChecks` on the working tree and
// names every one that fails, then exits without committing. Those checks run
// without PSTACK_LAND_CHECK, and one that reads commit messages sees only the
// commits already made. A --dry check stopped at 55 minutes exits 1, not 75.
// When every path a rebase of this checkout conflicts on matches the globs of
// a `generated` entry in the config, it takes <branch>'s side of those paths,
// runs each matching entry's command to rebuild them from the merged sources,
// stages what the command wrote and continues the rebase. A failed command
// puts the conflicts back, and a write outside the entry's globs, staged or
// not, stops it with the rebase in progress, as any other conflict does.
// land.mjs also runs an `always` entry's command once both halves are rebased,
// unless the rebase already ran it or the task changes only companion files.
// It folds what the command wrote into the task's commit, and what it wrote in
// files the companion tracks into the task's companion commit, which it starts
// when the task has none. The config's `landChecks` run before each --check on
// every land.
// When the config names a `companion` whose git directory `companion.dir` is
// in the checkout, that repository tracks the files this checkout's git
// ignores through `companion.list`, and the task's changes there land in push
// mode, the default there, as a second commit with the same message. Every
// land rebases the companion onto its origin/<branch> and checks both halves
// together. A companion file missing from disk stops the land until it is put
// back, with `companion.restore` when the config names it, or its deletion is
// staged. The companion commit pushes after the first, with a `Lands-With:`
// line naming the commit it landed with. Before it pushes one repository, it
// fetches the other, unless this run just pushed that one, and when the other
// gained a commit since the rebase, it rebases both halves and checks them
// again first. A companion push refused because its origin moved rebases both
// halves, checks them again and pushes again, within the same three retries as
// the first push; past them, or on any other refusal, it exits 75, and the
// rerun rebases, checks and pushes it. A checkout whose config names a
// companion it lacks refuses to land in push mode. A branch cut before
// `companion.list` existed on <branch> stops with `companion.migrate`.
// Each commit ends with a `Lead:` line naming the model and effort lead.mjs
// reads for the agent session running this land, or `unknown`, replacing any
// such line in the message. When <branch>'s config lists `sourceless` GitHub
// logins, a commit lands only for them unless it names a source: an issue of
// this repository or its companion, a card in the suggested-task ledger, or a
// dated plan in the plans directory that exists.
// A landing takes one core of the machine's core pool the first time it
// rebuilds or checks, and holds it until it exits. It never waits for it, so
// the pool only counts the landing's workers against the proofs that queue.
// Its check runs with PSTACK_LAND_CHECK=1 and outside that share, so a check
// that reserves cores through proof.mjs enters at once as a landing too, and
// the pool counts a check that reserves none under the landing. It gives the
// share back while it waits out a GH006 and takes it again when it next
// rebuilds or checks. Each check runs in a process group of its
// own, and at 55 minutes into the run land.mjs stops that group and exits 75,
// so a check runner that records each step's pass keeps the steps that
// finished for the rerun. A check that fails after it ran on a public commit
// whose companion half reached origin late counts as a move, so land.mjs
// rebases both halves and checks them again. When a rebase changes the folder
// land.mjs runs from or .agents/pstack.json, the run goes on in a new process
// that loads the rebased copy, once per landing, and the 55 minutes count the
// time both processes took. Each run past the squash appends a line to
// pstack-land-runs.jsonl in the git common directory when it starts and another
// when it exits, so a run that a signal stopped still counts, and --friction
// prints the runs of the last day. A run that exits 75, other than for a GH006,
// or is stopped loses all its minutes, and any other run loses its wait for
// cores. When no land-friction task is open and the runs of the last day since
// the last one closed lost an hour, the run offers one in the suggested-task
// ledger as it exits.

import { spawn, spawnSync } from 'node:child_process';
import { appendFileSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { devNull, tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findLead, leadLabel, maxEffort, modelsSheet, runtimeFromEnv, sheetMisses } from './lead.mjs';
import { defaultsRefusal } from './plan-page.mjs';
import { alive, LAND_CHECK, reserve } from './proof.mjs';
import { ledgerPath, readTasks, TASK_ID } from './tasks.mjs';
import { findings } from './writing-check.mjs';

const USAGE = 'Usage: node .agents/pstack/land.mjs [--message <file>] [--check <command>]... [--dry], or node .agents/pstack/land.mjs --friction';
const SUBJECT = /^(feat|fix|docs|refactor|test|chore|perf)(\([^()\s]+\))?!?: \S(.*\S)?$/u;
const REQUIRED = [
  ['Beyond the ask', 'name every change the request did not ask for'],
  ['Picks', 'name each call the owner would notice, with the word that reverses it'],
  ['Not checked', 'name what the proof did not check'],
];
const REQUIRED_LABELS = REQUIRED.map(([label]) => label).join('|');
const withoutHtmlComments = (text) => text.replace(/<!--[\s\S]*?-->/gu, '');
const SESSION = /^Session: \S/mu;
const PLAN = /^Plan: \S/mu;
const TRAILER = /^(?:Session|Plan|Lands-With): \S/u;
const STAMP_LINES = /^(?:Session|Plan|Lead|Lands-With): .*$/gmu;
const ISSUE = /(?<![\w#/.-])(?:([\w.-]+)\/)?([\w.-]+)#\d+\b|https:\/\/github\.com\/([^/\s]+)\/([^/\s]+)\/issues\/\d+/gu;
const INTRODUCED = /^Introduced-by:(.*)$/gmu;
const CLOSING = /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)(?::\s*|\s+)(?:[\w.-]+\/([\w.-]+)#\d+|#\d+|GH-\d+|https?:\/\/github\.com\/[^/\s]+\/([^/\s]+)\/(?:issues|pull)\/\d+)(?!\w)/iu;
const DATED = /^\d{4}-\d\d-\d\d-[^/]+\.md$/u;
const PR_SECTIONS = ['Why', 'Verification'];
const RETRIES = 3;
// One core covers the git work and the generators, and makes the pool count a
// check that reserves none.
const LAND_WORKERS = 2;
const DECLINED_WAITS = [1, 2, 4, 8, 16];
const COMMAND_LIMIT = 60 * 60_000;
const DEADLINE = COMMAND_LIMIT - 5 * 60_000;
// A run that went on in a new process after a rebase changed the helpers counts the minutes of the process before it, because the hour limit covers both.
const spent = Number(process.env.PSTACK_LAND_SPENT_MS) || 0;
const elapsed = () => spent + performance.now();
const STOPS = ['SIGINT', 'SIGTERM', 'SIGHUP'];
const EX_TEMPFAIL = 75;
const MOVED = /\[rejected\]|fetch first|non-fast-forward|cannot lock ref/u;
const FRICTION_TOPIC = 'land-friction';
const FRICTION_BOUND_MINUTES = 60;
const FRICTION_WINDOW = 24 * 60 * 60_000;
const RUNS_KEPT = 7 * 24 * 60 * 60_000;
const session = process.env.CLAUDE_CODE_HOST_SESSION_ID || process.env.CLAUDE_CODE_SESSION_ID || process.env.CODEX_SESSION_ID || '';
const startedAt = Date.now();
const runId = `${process.pid}-${startedAt}`;

let why = '';
const fail = (message, code = 1) => {
  why = message.split('\n')[0];
  console.error(`land.mjs: ${message}`);
  process.exit(code);
};
const scale = process.env.PSTACK_LAND_WAIT_SCALE ?? '1';
if (!/^\d+(\.\d+)?$/u.test(scale)) fail(`PSTACK_LAND_WAIT_SCALE must be a decimal number of at least 0, not "${scale}"`, 2);
const MINUTE = 60_000 * Number(scale);
const git = (...args) => spawnSync('git', args, { encoding: 'utf8' });
function signerNote(prefix = [], rerun = 'run land.mjs again with the same --check options and no --message, because its commit stays local') {
  const read = (...args) => spawnSync('git', [...prefix, 'config', ...args], { encoding: 'utf8' }).stdout?.trim() ?? '';
  if (read('--type=bool', '--get', 'commit.gpgsign') !== 'true') return '';
  const format = read('--get', 'gpg.format') || 'openpgp';
  const keys = format === 'openpgp' ? '^gpg\\.(openpgp\\.)?program$' : `^gpg\\.${format}\\.program$`;
  const signer = read('--get-regexp', keys).split('\n').at(-1).replace(/^\S+\s?/u, '') || ({ openpgp: 'gpg', ssh: 'ssh-keygen', x509: 'gpgsm' }[format] ?? format);
  return `\nThis repository signs its commits with ${signer}. When the error comes from it and its key and settings are right, only a person can unlock or approve it, so ask the owner once, leave signing on and, after they answer, ${rerun}.`;
}
const must = (...args) => {
  const run = git(...args);
  if (run.status !== 0) fail(`git ${args.join(' ')} failed: ${run.stderr.trim()}${args[0] === 'commit' ? signerNote() : ''}`);
  return run.stdout.trim();
};
const quote = (text) => `'${text.replaceAll("'", "'\\''")}'`;

// GitHub sometimes declines a push with GH006 and no reason, then accepts a push of the same change later, sometimes more than an hour later.
function declinedWithoutReason(stderr) {
  const lines = stderr.split('\n');
  const at = lines.findIndex((line) => line.startsWith('remote: error: GH006: '));
  if (at < 0) return false;
  const after = [];
  for (const line of lines.slice(at + 1)) {
    if (!line.startsWith('remote:')) break;
    after.push(line.replace(/^remote:(\s*error:)?/u, '').trim());
  }
  return after.length > 0 && after.every((text) => text === '');
}

const args = process.argv.slice(2);
let messageFile = null;
let dry = false;
let report = false;
const checks = [];
const rerunArgs = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--message' && args[i + 1]) messageFile = args[++i];
  else if (args[i] === '--dry') dry = true;
  else if (args[i] === '--friction' && args.length === 1) report = true;
  else if (args[i] === '--check' && args[i + 1]) {
    checks.push(args[++i]);
    rerunArgs.push('--check', args[i]);
  } else fail(USAGE, 2);
}
// Read before the chdir, because the path is relative to the caller's directory.
const messageText = messageFile === null ? null : readFileSync(messageFile, 'utf8');

process.chdir(must('rev-parse', '--show-toplevel'));
const helpersDir = relative(realpathSync(process.cwd()), realpathSync(dirname(fileURLToPath(import.meta.url))));
const common = must('rev-parse', '--path-format=absolute', '--git-common-dir');
const RUNS = join(common, 'pstack-land-runs.jsonl');
if (report) {
  printFriction();
  process.exit(0);
}
const config = JSON.parse(readFileSync('.agents/pstack.json', 'utf8'));
const { branch, protected: guarded, lintFix, plans = 'docs/plans', companion, generated = [], freshEnv = [], landChecks = [] } = config;
checks.splice(0, checks.length, ...new Set([...landChecks, ...checks]));
const fresh = freshEnv.find((assignment) => {
  const at = assignment.indexOf('=');
  return process.env[assignment.slice(0, at)] === assignment.slice(at + 1);
});
if (!branch) fail('.agents/pstack.json names no branch');
const pair = companion?.dir && existsSync(companion.dir) ? companion : null;
const delivery = git('config', '--get', 'pstack.delivery').stdout.trim();
const mode = delivery === 'push' || (pair && delivery === '') ? 'push' : 'pr';
const forked = mode === 'pr' && git('remote', 'get-url', 'upstream').status === 0;
const canonical = forked ? 'upstream' : 'origin';
const upstream = `refs/remotes/${canonical}/${branch}`;
const target = `${canonical}/${branch}`;
const current = must('branch', '--show-current');
if (guarded && current === guarded) fail(`this checkout is on ${guarded}; land from a worktree cut from ${target}`);

if (pair && mode !== 'push') fail(`${pair.dir} lands only in push mode; run \`git config pstack.delivery push\``);
// A PR's panel ran on its author's own models sheet, so a sheet that seats a weaker panel than the project asks stops the PR before it opens.
const runtime = mode === 'pr' ? runtimeFromEnv(process.env) : null;
if (runtime) {
  const sheet = modelsSheet(runtime);
  const misses = sheetMisses(existsSync(sheet) ? readFileSync(sheet, 'utf8') : '', maxEffort());
  if (misses.length) {
    fail(`${sheet} runs panels on models or efforts this project does not allow, so this PR's panel ran weaker than the project asks. Fix the sheet, run the panel on the diff again, then run land.mjs again:\n${misses.map((miss) => `- ${miss}`).join('\n')}`);
  }
}
if (companion?.dir && !pair && mode === 'push') {
  fail(`this checkout has no ${companion.dir}, so landing would push ${branch} without its companion half or that half's checks; attach the companion repository first, then run land.mjs again`);
}
const side = pair ? [`--git-dir=${join(process.cwd(), pair.dir)}`, `--work-tree=${process.cwd()}`] : [];
const cgit = (...args) => spawnSync('git', [...side, ...args], { encoding: 'utf8' });
const cmust = (...args) => {
  const run = cgit(...args);
  if (run.status !== 0) fail(`git ${args.join(' ')} in ${pair.dir} failed: ${run.stderr.trim()}${args[0] === 'commit' ? signerNote(side) : ''}`);
  return run.stdout.trim();
};
const cupstream = `refs/remotes/origin/${branch}`;
const PAIRED = /^Lands-With: /mu;

// A clean --no-commit revert leaves REVERT_HEAD behind, so only the sequencer marks a revert with commits left to apply.
const stopped = (run) => ['rebase-merge', 'rebase-apply', 'MERGE_HEAD', 'sequencer'].some((name) => existsSync(run('rev-parse', '--git-path', name).stdout.trim()));
if (stopped(git)) fail('a rebase, merge or revert is in progress; resolve it, `git add` the paths, run `git rebase --continue` or `GIT_EDITOR=true git revert --continue`, then run land.mjs again');
if (pair && stopped(cgit)) fail(`a rebase or merge is in progress in ${pair.dir}; resolve it with \`git --git-dir=${pair.dir} --work-tree=.\`, then run land.mjs again`);

const dirty = () => must('status', '--porcelain', '--untracked-files=all') !== '';
const sideDirty = () => pair !== null && cmust('status', '--porcelain', '--untracked-files=no') !== '';

const gitAsync = (args) =>
  new Promise((resolve) => {
    const child = spawn('git', args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.setEncoding('utf8').on('data', (chunk) => (stderr += chunk));
    child.on('close', (status) => resolve({ status, stderr }));
  });

let fetched;
let share = null;
let waitedMs = 0;
let checkedMs = 0;
let moves = 0;
let declines = 0;
let cause = null;

function takeCores() {
  if (share) return;
  share = reserve(LAND_WORKERS, 'land.mjs', { first: true });
  waitedMs += share.waited;
}

function dropCores() {
  share?.();
  share = null;
}

async function rebaseOntoOrigin() {
  await fetchCompanionFirst();
  await rebaseFetched();
}

async function rebaseFetched() {
  const before = must('rev-parse', 'HEAD');
  rebase();
  await restartOnRebasedHelpers(before);
  if (pair) rebase(true);
  refresh();
}

// This process runs the helpers it loaded at its start, so when a rebase changes them or the config, the run goes on in a new process that
// loads the rebased copy. One restart per landing, so helpers that keep changing cannot loop it.
async function restartOnRebasedHelpers(before) {
  if (process.env.PSTACK_LAND_RESTARTED || helpersDir.startsWith('..') || isAbsolute(helpersDir)) return;
  if (git('diff', '--quiet', before, 'HEAD', '--', helpersDir, '.agents/pstack.json').status === 0) return;
  console.log(`the rebase changed ${helpersDir} or .agents/pstack.json, so land.mjs goes on in a new process that loads the rebased copy`);
  dropCores();
  process.off('exit', recordRun);
  why = 'went on in a new process that loads the rebased helpers';
  recordRun('restarted');
  const child = spawn(process.execPath, [join(helpersDir, 'land.mjs'), ...rerunArgs], {
    stdio: 'inherit',
    env: { ...process.env, PSTACK_LAND_RESTARTED: '1', PSTACK_LAND_SPENT_MS: String(Math.round(elapsed())) },
  });
  const pass = (signal) => child.kill(signal);
  for (const stop of STOPS) process.on(stop, pass);
  const [code, signal] = await new Promise((resolve) => child.on('close', (...end) => resolve(end)));
  for (const stop of STOPS) process.off(stop, pass);
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
}

async function fetchPastRaces(prefix, remote, ref, where) {
  const args = [...prefix, 'fetch', '--quiet', remote, `+refs/heads/${branch}:${ref}`];
  for (let attempt = 1; ; attempt += 1) {
    const run = await gitAsync(args);
    if (run.status === 0 || attempt === 3 || !/cannot lock ref/u.test(run.stderr)) return run;
    console.log(`another fetch moved ${where} while land.mjs fetched it; fetching again (retry ${attempt} of 2)`);
  }
}

const fetchTheirs = () => fetchPastRaces(side, 'origin', cupstream, `${pair.dir}'s origin/${branch}`);
const fetchOwn = () => fetchPastRaces([], canonical, upstream, target);

async function fetchCompanionFirst() {
  const crun = pair ? await fetchTheirs() : null;
  const run = await fetchOwn();
  if (run.status !== 0) fail(`git fetch --quiet ${canonical} +refs/heads/${branch}:${upstream} failed: ${run.stderr.trim()}`);
  if (crun && crun.status !== 0) fail(`git fetch --quiet origin +refs/heads/${branch}:${cupstream} in ${pair.dir} failed: ${crun.stderr.trim()}`);
  // FETCH_HEAD is per worktree. Every worktree shares the upstream refs, and another session's push moves them.
  fetched = { own: must('rev-parse', 'FETCH_HEAD'), theirs: pair ? cmust('rev-parse', 'FETCH_HEAD') : null };
}

// A failed fetch reads as no move, because a flaky fetch of the other repository should not stop a push that its own origin accepts.
async function fetchedPastHead(fetch, run) {
  if ((await fetch()).status !== 0) return false;
  return run('merge-base', '--is-ancestor', 'FETCH_HEAD', 'HEAD').status !== 0;
}

const companionMoved = () => fetchedPastHead(fetchTheirs, cgit);
const publicMoved = () => fetchedPastHead(fetchOwn, git);

async function lateCompanionHalf() {
  if (!pair || (await fetchTheirs()).status !== 0) return undefined;
  const commits = cmust('log', '--format=%B%x00', `${fetched.theirs}..FETCH_HEAD`).split('\0');
  const halves = commits.map((text) => [text.trim().split('\n')[0], text.match(/^Lands-With: (\S+)$/mu)?.[1]]);
  return halves.find(([subject, sha]) => sha && git('log', '-1', '--format=%s', sha).stdout.trim() === subject && git('merge-base', '--is-ancestor', sha, fetched.own).status === 0)?.[1];
}

function rebase(inCompanion = false) {
  const run = inCompanion ? cgit : git;
  const onto = inCompanion ? fetched.theirs : fetched.own;
  const where = inCompanion ? `${pair.dir}'s origin/${branch}` : target;
  if (!inCompanion) rebuilt.clear();
  if (run('merge-base', '--is-ancestor', onto, 'HEAD').status === 0) return;
  let rebased = run('rebase', '--quiet', onto);
  while (rebased.status !== 0) {
    const paths = unmerged(run);
    if (paths.length === 0) {
      run('rebase', '--abort');
      fail(`git rebase ${where} failed: ${rebased.stderr.trim()}${signerNote(inCompanion ? side : [])}`);
    }
    const hits = inCompanion ? [] : generated.map((entry) => unmerged(git, entry.paths));
    const owners = generated.filter((_, index) => hits[index]?.length > 0);
    const covered = new Set(hits.flat());
    if (paths.some((path) => !covered.has(path))) {
      const prefix = inCompanion ? `git --git-dir=${pair.dir} --work-tree=. ` : 'git ';
      const rebuilt = paths.filter((path) => covered.has(path));
      fail(
        `rebasing onto ${where} conflicts in:\n${paths.map((path) => `  ${path}`).join('\n')}\n` +
          `The rebase is still in progress. Resolve those paths, \`${prefix}add\` them, \`${prefix}rebase --continue\`, then run land.mjs again without --message.` +
          (rebuilt.length > 0
            ? `\nOf those, ${rebuilt.join(', ')} ${rebuilt.length === 1 ? 'is' : 'are'} generated: once the others are resolved, take ${where}'s side with \`git checkout --ours -- <path>\`, or \`git rm <path>\` where that side deleted it, run ${owners.map((entry) => `\`${entry.command}\``).join(' and ')} and add the output.`
            : '')
      );
    }
    rebased = rebuild(paths, owners);
  }
}

const nul = (text) => text.split('\0').filter(Boolean);
const literal = (paths) => paths.map((path) => `:(literal)${path}`);
const unmerged = (run, globs) => nul(run('diff', '-z', '--name-only', '--diff-filter=U', ...(globs ? ['--', ...globs.map((glob) => `:(glob)${glob}`)] : [])).stdout);
const rebuilt = new Set();

function worktreeTree(prefix = [], add = '--all') {
  const run = (args, env) => spawnSync('git', [...prefix, ...args], { encoding: 'utf8', env });
  const index = join(mkdtempSync(join(tmpdir(), 'land-')), 'index');
  copyFileSync(run(['rev-parse', '--git-path', 'index']).stdout.trim(), index);
  const env = { ...process.env, GIT_INDEX_FILE: index };
  if (run(['add', add], env).status !== 0) fail(`git add ${add} into a scratch index failed while rebuilding the generated paths`);
  const tree = run(['write-tree'], env);
  if (tree.status !== 0) fail(`git write-tree failed while rebuilding the generated paths: ${tree.stderr.trim()}`);
  return tree.stdout.trim();
}

function rebuild(paths, owners) {
  console.log(`rebasing onto ${target} conflicts only in generated paths, so land.mjs takes ${target}'s side of them and rebuilds them`);
  const resume = '`git rebase --continue`, then run land.mjs again without --message.';
  const kept = paths.filter((path) => git('cat-file', '-e', `HEAD:${path}`).status === 0);
  const gone = paths.filter((path) => !kept.includes(path));
  if (kept.length > 0) must('checkout', 'HEAD', '--', ...literal(kept));
  if (gone.length > 0) must('rm', '--quiet', '--force', '--', ...literal(gone));
  const { own: written } = regenerate(
    owners,
    (command) => {
      git('checkout', '--merge', '--', ...literal(paths));
      fail(`${command} failed, so land.mjs put the conflicts back. The rebase is still in progress. Fix the cause, resolve the conflicts, \`git add\` them, ${resume}`);
    },
    `The rebase is still in progress. Add or discard those files, ${resume}`
  );
  for (const entry of owners) rebuilt.add(entry);
  if (written.length > 0) must('add', '--all', '--', ...literal(written));
  return spawnSync('git', ['rebase', '--continue'], { encoding: 'utf8', env: { ...process.env, GIT_EDITOR: 'true' } });
}

function refresh() {
  const owners = generated.filter((entry) => entry.always && !rebuilt.has(entry));
  if (!landing.own || owners.length === 0) return;
  const rerun = 'then run land.mjs again without --message.';
  const { own, theirs } = regenerate(owners, (command) => fail(`${command} failed while rebuilding its generated paths after the rebase. Fix the cause, ${rerun}`), `Add or discard those files, ${rerun}`);
  if (own.length + theirs.length === 0) return;
  console.log(`land.mjs rebuilt ${[...own, ...theirs].join(', ')} after the rebase and folds the output into the commit`);
  if (own.length > 0) {
    must('add', '--all', '--', ...literal(own));
    must('commit', '--quiet', '--amend', '--no-edit');
  }
  if (theirs.length === 0) return;
  cmust('add', '--all', '--', ...literal(theirs));
  if (landing.theirs) cmust('commit', '--quiet', '--amend', '--no-edit');
  else cmust('commit', '--quiet', '--message', must('log', '-1', '--format=%B'));
  landing.theirs = true;
}

// The companion's tree takes `--update`, because with `--all` its git would take every file of this checkout.
function regenerate(owners, failed, outsideHint) {
  takeCores();
  const own = [];
  const theirs = [];
  let before = worktreeTree();
  let sideBefore = pair && worktreeTree(side, '--update');
  for (const { command, paths: globs } of owners) {
    console.log(`$ ${command}`);
    if (spawnSync(command, { shell: true, stdio: 'inherit' }).status !== 0) failed(command);
    const after = worktreeTree();
    const outside = nul(git('diff', '-z', '--name-only', before, after, '--', '.', ...globs.map((glob) => `:(exclude,glob)${glob}`)).stdout);
    if (outside.length > 0) fail(`${command} also changed files outside its generated paths:\n${outside.map((path) => `  ${path}`).join('\n')}\n${outsideHint}`);
    own.push(...nul(git('diff', '-z', '--name-only', before, after).stdout));
    before = after;
    if (pair) {
      const sideAfter = worktreeTree(side, '--update');
      theirs.push(...nul(cgit('diff', '-z', '--name-only', sideBefore, sideAfter).stdout));
      sideBefore = sideAfter;
    }
  }
  return { own, theirs };
}

// The companion's git never reads this clone's .git/info/exclude, so a path only that file ignores is local, not companion work.
function companionOwnedUntracked() {
  const tracked = new Set(nul(git('ls-files', '-z').stdout));
  const others = nul(cgit('ls-files', '-z', '--others', '--exclude-standard').stdout).filter((path) => !tracked.has(path));
  if (others.length === 0) return [];
  const ignored = (list) => nul(spawnSync('git', ['-c', `core.excludesFile=${list}`, 'check-ignore', '-z', '--stdin'], { encoding: 'utf8', input: others.join('\0') }).stdout);
  const here = new Set(ignored(devNull));
  return ignored(join(process.cwd(), pair.list)).filter((path) => !here.has(path));
}

function stageCompanion() {
  const missing = nul(cgit('ls-files', '-z', '--deleted').stdout);
  if (missing.length > 0) {
    const one = missing.length === 1;
    fail(
      `${missing.length} ${one ? 'file' : 'files'} that ${pair.dir} tracks ${one ? 'is' : 'are'} missing from disk, such as ${missing[0]}, and land.mjs never lands a missing file as a deletion. ` +
        `Put ${one ? 'it' : 'them'} back with \`${pair.restore ?? `git --git-dir=${pair.dir} --work-tree=. checkout -- <path>`}\`, or stage each deletion the task makes with \`git --git-dir=${pair.dir} --work-tree=. rm --cached -- <path>\`, then run land.mjs again.`
    );
  }
  cmust('add', '--update');
  const owned = companionOwnedUntracked();
  if (owned.length === 0) return;
  const run = spawnSync('git', [...side, 'add', '--force', '--pathspec-from-file=-', '--pathspec-file-nul'], { encoding: 'utf8', input: owned.join('\0') });
  if (run.status !== 0) fail(`git add in ${pair.dir} failed: ${run.stderr.trim()}`);
}

async function pushCompanion(lead, publicLanded) {
  const text = cmust('log', '-1', '--format=%B');
  const [subject, ...rest] = text.split('\n');
  const stamped = `${subject}\n\n${trailers(rest.join('\n').trim(), null, lead)}${PAIRED.test(text) ? '' : `\nLands-With: ${must('rev-parse', 'HEAD')}`}`;
  if (stamped !== text) {
    const file = join(mkdtempSync(join(tmpdir(), 'land-')), 'message');
    writeFileSync(file, `${stamped}\n`);
    cmust('commit', '--quiet', '--amend', '--only', '--file', file);
  }
  for (;;) {
    if (!publicLanded && (await publicMoved())) {
      await retry(target);
      continue;
    }
    const run = cgit('push', '--quiet', 'origin', `HEAD:refs/heads/${branch}`);
    if (run.status === 0) break;
    if (!MOVED.test(run.stderr)) {
      fail(
        `git push of the ${pair.dir} commit failed after the rest of the task landed. That commit stays local, so run land.mjs again with no --message; it rebases and checks that commit, then pushes it.\n${run.stderr.trim()}`,
        EX_TEMPFAIL
      );
    }
    await retry(`${pair.dir}'s origin/${branch}`);
  }
  console.log(`Landed ${cmust('rev-parse', '--short', 'HEAD')} on ${pair.dir}'s origin/${branch}`);
}

// The owner and name of a remote's repository, from its URL's last two path parts.
function repo(remote) {
  const match = must('remote', 'get-url', remote).match(/([^/:]+)\/([^/]+?)(?:\.git)?\/?$/u);
  if (!match) fail(`cannot read an owner/name from the ${remote} remote's URL`);
  return [match[1], match[2]];
}

function validate(text) {
  const [subject, gap, ...rest] = text.trim().split('\n');
  if (!SUBJECT.test(subject) || subject.endsWith('.')) {
    fail(`the subject "${subject}" is not one Conventional Commit, \`type(scope): subject\` with type feat, fix, docs, refactor, test, chore or perf and no trailing period`);
  }
  if (rest.length > 0 && gap !== '') fail('a blank line must separate the subject from the body');
  const body = rest.join('\n');
  for (const [label, what] of REQUIRED) {
    if (!new RegExp(`^${label}: \\S`, 'mu').test(withoutHtmlComments(body))) fail(`the body has no \`${label}:\` line; ${what}, or write \`${label}: none\`, then run land.mjs again with --message`);
  }
  const broken = findings(text.replace(STAMP_LINES, ''));
  if (broken.length > 0) {
    fail(`the message breaks the Writing rule, as writing-check.mjs reads it:\n${broken.map(({ line, rule, match, text: shown }) => `  line ${line}, ${rule} "${match}": ${shown}`).join('\n')}\nReword each line, or put literal text in backticks, then run land.mjs again with --message.`);
  }
  const closing = text.match(CLOSING);
  if (closing) {
    const name = closing[1] ?? closing[2] ?? must('remote', 'get-url', canonical).match(/([^/:]+?)(?:\.git)?\/?$/u)[1];
    fail(`${JSON.stringify(closing[0])} closes an issue once it reaches the default branch, because a form of close, fix or resolve comes right before its reference; write \`${name}#<N>\`, which links nothing`);
  }
  if (SUBJECT.exec(subject)[1] === 'fix') introduced(rest.join('\n'));
  return { subject, body: body.trim() };
}

function introduced(body) {
  const trace =
    `Trace the cause with \`git log -L <start>,<end>:<file> ${target}\`, \`git blame ${target} -- <file>\` or \`git bisect\`. ` +
    '`none` fits only a cause older than the history or outside the repository, such as a dependency or the platform; code that was broken when it landed names the commit that landed it.';
  const lines = [...body.matchAll(INTRODUCED)].map((match) => match[1]);
  if (lines.some((rest) => rest.trim() !== '' && !rest.startsWith(' '))) fail('write each line as `Introduced-by: <value>`, with a space after the colon');
  const values = lines.map((rest) => rest.trim());
  if (values.length === 0) fail(`the fix names no commit that introduced its bug; add an \`Introduced-by: <sha>\` line for each commit on ${target} that did, or one \`Introduced-by: none\`, to the message file and run land.mjs again with --message. ${trace}`);
  if (values.includes('none')) {
    if (values.length > 1) fail(`\`Introduced-by: none\` cannot stand beside another \`Introduced-by:\` line; keep the commits or write \`none\` alone. ${trace}`);
    return;
  }
  for (const value of values) {
    if (value === '') fail(`an \`Introduced-by:\` line has no value; name a commit on ${target} or write \`none\`. ${trace}`);
    if (!/^[0-9a-f]{7,40}$/u.test(value)) fail(`Introduced-by: ${value} is not a lowercase sha of 7 to 40 characters; write the commit's sha alone. ${trace}`);
    const landed = [[git, upstream], ...(pair ? [[cgit, cupstream]] : [])].map(([run, onto]) => {
      const sha = run('rev-parse', '--verify', '--quiet', `${value}^{commit}`).stdout.trim();
      return sha ? run('merge-base', '--is-ancestor', sha, onto).status === 0 : null;
    });
    if (landed.every((known) => known === null)) fail(`Introduced-by: ${value} names no commit this clone knows; name it by its sha. ${trace}`);
    if (!landed.includes(true)) {
      fail(`Introduced-by: ${value} names a commit ${target}${pair ? ` or ${pair.dir}'s origin/${branch}` : ''} does not contain; name the landed commit that introduced the bug. ${trace}`);
    }
  }
}

const isPlan = (path) => path.startsWith(`${plans}/`) && DATED.test(path.slice(plans.length + 1)) && statSync(path, { throwIfNoEntry: false })?.isFile() === true;

function planOf(staged) {
  const touched = staged.filter(isPlan);
  return touched.length === 1 ? touched[0] : null;
}

function leadOf() {
  const { run, miss } = findLead();
  if (run) return leadLabel(run);
  console.error(`land.mjs: the commit says \`Lead: unknown\`, because ${miss}`);
  return 'unknown';
}

// A rerun takes its message from the commit an earlier run wrote, so the new lines join that run's trailer block and an unchanged lead leaves the message as it was.
function trailers(body, plan, lead) {
  const kept = body.replace(/^Lead:.*$\n?/gmu, '').trimEnd();
  const lines = [];
  if (session && !SESSION.test(kept)) lines.push(`Session: ${session}`);
  if (!PLAN.test(kept) && plan) lines.push(`Plan: ${plan}`);
  lines.push(`Lead: ${lead}`);
  const block = kept.split('\n\n').at(-1).split('\n').every((line) => TRAILER.test(line));
  return `${kept}${block ? '\n' : '\n\n'}${lines.join('\n')}`;
}

// The owner and name of this repository and of its companion, from their remotes' URLs.
function homes() {
  return [git('remote', 'get-url', canonical), ...(pair ? [cgit('remote', 'get-url', 'origin')] : [])].flatMap((run) => {
    const match = run.stdout.trim().toLowerCase().match(/([^/:]+)\/([^/]+?)(?:\.git)?\/?$/u);
    return match ? [{ owner: match[1], name: match[2] }] : [];
  });
}

const ledgerFile = () => join(basename(common) === '.git' ? dirname(common) : process.cwd(), ledgerPath(plans, config.delivery));

function sourced(text, plan) {
  if (plan || [...text.matchAll(/^Plan: (\S+)$/gmu)].some(([, path]) => isPlan(path))) return true;
  const ours = homes();
  const issue = ([, refOwner, refName, urlOwner, urlName]) => {
    const owner = (refOwner ?? urlOwner)?.toLowerCase();
    const name = (refName ?? urlName).toLowerCase();
    return ours.some((home) => home.name === name && (owner === undefined || home.owner === owner));
  };
  if ([...text.matchAll(ISSUE)].some(issue)) return true;
  const cards = text.match(TASK_ID) ?? [];
  if (cards.length === 0) return false;
  const ledger = ledgerFile();
  if (!existsSync(ledger)) return false;
  const tasks = readTasks(readFileSync(ledger, 'utf8').split('\n'));
  return cards.some((id) => tasks.has(id));
}

function sourceRefusal(subject, body, plan) {
  if (!sourceless || sourced(`${subject}\n${body}`, plan)) return null;
  const login = spawnSync('gh', ['api', 'user', '--jq', '.login'], { encoding: 'utf8' });
  const who = login.status === 0 ? login.stdout.trim() : '';
  if (sourceless.includes(who)) return null;
  const why = who ? `, not ${who}` : `; gh api user failed: ${login.error?.message ?? (login.stderr.trim() || 'it printed no login')}`;
  return (
    `the message names no source, and only ${sourceless.join(', ')} land without one${why}. ` +
    `A source is an issue of ${homes().map((home) => home.name).join(' or ')} written as \`<repo>#<N>\` or its URL, the id of a card in the suggested-task ledger, or a \`Plan:\` line naming a dated plan in ${plans}/ that exists. ` +
    'Add one to the message and run land.mjs again with --message'
  );
}

const paged = (plan) => plan && existsSync(plan) && existsSync('.agents/pstack/plan-page.mjs');

const sectionUntilNextHeadingOrRequiredLine = (body, name) =>
  body.match(new RegExp(`^## ${name}[ \\t]*\\n([\\s\\S]*?)(?=^## |^(?:${REQUIRED_LABELS}):|(?![\\s\\S]))`, 'mu'))?.[1] ?? '';
function missingSections(body) {
  return PR_SECTIONS.filter((name) => sectionUntilNextHeadingOrRequiredLine(withoutHtmlComments(body), name).trim() === '');
}

// The PR body file and its --attach arguments: the plan's page when the task changes one plan, else the commit body.
function prBody(plan, body) {
  if (paged(plan)) {
    const render = spawnSync(process.execPath, ['.agents/pstack/plan-page.mjs', plan, '--pr'], { encoding: 'utf8' });
    if (render.status !== 0) {
      fail(`plan-page.mjs refused ${plan}, so nothing was pushed:\n${`${render.stderr}${render.stdout}`.trim()}\nFix the plan, then run land.mjs again without --message.`);
    }
    const [file, ...rest] = render.stdout.trim().split('\n');
    return { file, attach: rest.flatMap((line) => (/^--attach ./u.test(line) ? ['--attach', line.slice('--attach '.length)] : [])) };
  }
  const file = join(mkdtempSync(join(tmpdir(), 'land-')), 'body');
  writeFileSync(file, `${body}\n`);
  return { file, attach: [] };
}

function refuseEarly({ subject, body }, paths, plan) {
  const missing = mode === 'pr' && !paged(plan) ? missingSections(body) : [];
  if (missing.length > 0) {
    fail(
      `a PR whose body is the commit body needs ${missing.map((name) => `a \`## ${name}\` section`).join(' and ')} with text; ` +
        'add the missing text to the message and run land.mjs again with --message, or change exactly one dated plan so its page becomes the body'
    );
  }
  const loose = sourceRefusal(subject, body, plan);
  if (loose) fail(loose);
  refuseDefaults(paths);
}

function refuseDefaults(paths) {
  const defaults = paths.filter(isPlan).map(defaultsRefusal).filter(Boolean);
  if (defaults.length > 0) fail(`${defaults.join('\n')}\nFix each plan's Defaults table, then run land.mjs again.`);
}

// Squashes the task into one commit in each repository that it changes; a companion-only task leaves HEAD at its base here.
function squash({ subject, body }) {
  const head = must('rev-parse', 'HEAD');
  const base = must('merge-base', 'HEAD', upstream);
  must('add', '--all');
  const staged = (run, from) => nul(run('diff', '-z', '--cached', '--name-only', from).stdout);
  const own = staged(git, base);
  let sideHead = null;
  let sideBase = null;
  let theirs = [];
  if (pair) {
    stageCompanion();
    sideHead = cmust('rev-parse', 'HEAD');
    sideBase = cmust('merge-base', 'HEAD', cupstream);
    theirs = staged(cgit, sideBase);
  }
  if (own.length === 0 && theirs.length === 0) fail(`nothing to land: the task changes nothing against ${target}`);
  const plan = planOf([...own, ...theirs]);
  refuseEarly({ subject, body }, [...own, ...theirs], plan);
  const lead = leadOf();
  must('reset', '--quiet', '--soft', base);
  if (pair) cmust('reset', '--quiet', '--soft', sideBase);
  const undo = () => {
    must('reset', '--quiet', '--soft', head);
    if (pair) cmust('reset', '--quiet', '--soft', sideHead);
  };
  const file = join(mkdtempSync(join(tmpdir(), 'land-')), 'message');
  writeFileSync(file, `${subject}\n\n${trailers(body, plan, lead)}\n`);
  const commit = (prefix) => spawnSync('git', [...prefix, 'commit', '--quiet', '--file', file], { stdio: 'inherit' }).status === 0;
  const failed = own.length > 0 && !commit([]) ? [] : theirs.length > 0 && !commit(side) ? side : null;
  if (failed) {
    undo();
    fail(`git commit failed; the task commits are back as they were${signerNote(failed, 'run the same land.mjs command again')}`);
  }
  return { plan, lead, own: own.length > 0, theirs: theirs.length > 0 };
}

function minutesOf(ms) {
  return Math.round(ms / 6_000) / 10;
}

function loggedRows() {
  return (existsSync(RUNS) ? readFileSync(RUNS, 'utf8') : '').split('\n').flatMap((line) => {
    try {
      return line ? [JSON.parse(line)] : [];
    } catch {
      return [];
    }
  });
}

// A run writes a row without `exit` when it starts and its full row when it exits. A signal, such as a timeout's, skips Node's exit
// handlers, so a started run whose process is gone counts as stopped from its start until now, capped at the hour limit.
function readRuns() {
  const now = Date.now();
  const rows = loggedRows();
  const ended = rows.filter((row) => 'exit' in row);
  const exited = new Set(ended.map((row) => row.id));
  const stopped = rows
    .filter((row) => !('exit' in row) && !exited.has(row.id) && !alive(row.pid))
    .map((row) => {
      const end = Math.min(now, Date.parse(row.start) + COMMAND_LIMIT);
      return { ...row, end: new Date(end).toISOString(), minutes: minutesOf(end - Date.parse(row.start)), exit: null, waited: 0, checked: 0, moves: 0, declines: 0, why: 'stopped by a signal, such as a timeout' };
    });
  return [...ended, ...stopped].sort((one, other) => Date.parse(one.end) - Date.parse(other.end));
}

// A GH006 outage is GitHub's, so a run it ended loses only its wait for cores, as a run that landed does.
function thrownAway(run) {
  return run.exit === null || (run.exit === EX_TEMPFAIL && run.cause !== 'declined');
}

function lostMinutes(run) {
  return thrownAway(run) ? run.minutes : run.waited;
}

function total(runs, minutes) {
  return Math.round(runs.reduce((sum, run) => sum + minutes(run), 0) * 10) / 10;
}

function logRun(row) {
  appendFileSync(RUNS, `${JSON.stringify({ id: runId, pid: process.pid, start: new Date(startedAt).toISOString(), session: session || null, subject: message.subject, ...row })}\n`);
}

function startRun() {
  try {
    logRun({});
  } catch (error) {
    console.error(`land.mjs: recording this run in ${RUNS} failed: ${error.message}`);
  }
  process.on('exit', recordRun);
}

function recordRun(code) {
  try {
    const end = Date.now();
    logRun({
      end: new Date(end).toISOString(),
      minutes: minutesOf(end - startedAt),
      exit: code,
      waited: minutesOf(waitedMs),
      checked: minutesOf(checkedMs),
      moves,
      declines,
      cause,
      why: code === 0 ? 'landed' : (why || 'land.mjs threw').slice(0, 200),
    });
    if (statSync(RUNS).size > 1_000_000) writeFileSync(RUNS, loggedRows().filter((kept) => Date.parse(kept.end ?? kept.start) > end - RUNS_KEPT).map((kept) => `${JSON.stringify(kept)}\n`).join(''));
    offerFrictionFix(end);
  } catch (error) {
    console.error(`land.mjs: recording this run in ${RUNS} failed: ${error.message}`);
  }
}

const lockFresh = (lock) => Date.now() - (statSync(lock, { throwIfNoEntry: false })?.mtimeMs ?? 0) < 60_000;

// A landing that dies inside its offer leaves the lock behind. Only the holder of `<lock>.break` removes a stale lock, and it checks
// the lock again first, so a landing that saw it stale never removes the lock another landing just took.
function takeLock(lock) {
  try {
    mkdirSync(lock);
    return true;
  } catch {
    if (lockFresh(lock)) return false;
  }
  const breaker = `${lock}.break`;
  try {
    mkdirSync(breaker);
  } catch {
    return false;
  }
  try {
    if (!lockFresh(lock)) rmSync(lock, { recursive: true, force: true });
    mkdirSync(lock);
    return true;
  } catch {
    return false;
  } finally {
    rmSync(breaker, { recursive: true, force: true });
  }
}

function offerFrictionFix(now) {
  if (process.env.PSTACK_READ_ONLY) return;
  const ledger = ledgerFile();
  if (!existsSync(ledger)) return;
  // The window starts a day ago at the earliest, so the day's sum bounds it, and a quiet day skips reading the ledger.
  if (total(readRuns().filter((run) => Date.parse(run.end) > now - FRICTION_WINDOW), lostMinutes) < FRICTION_BOUND_MINUTES) return;
  const lock = join(common, 'pstack-land-friction.lock');
  if (!takeLock(lock)) return;
  try {
    const rows = readFileSync(ledger, 'utf8').split('\n').filter(Boolean);
    const ours = [...readTasks(rows).values()].filter((task) => task.topic === FRICTION_TOPIC);
    if (ours.some((task) => task.status === 'offered' || task.status === 'started')) return;
    const ids = new Set(ours.map((task) => task.id));
    const closed = rows.map((row) => row.split('\t')).filter((cells) => ids.has(cells[2]?.split(' ')[0])).map((cells) => Date.parse(cells[0]));
    const since = Math.max(now - FRICTION_WINDOW, ...closed.filter(Number.isFinite));
    const runs = readRuns().filter((run) => Date.parse(run.end) > since);
    const lost = total(runs, lostMinutes);
    if (lost < FRICTION_BOUND_MINUTES) return;
    const thrown = runs.filter(thrownAway);
    const waited = total(runs.filter((run) => !thrownAway(run)), (run) => run.waited);
    const helper = join(dirname(fileURLToPath(import.meta.url)), 'decisions-check.mjs');
    const call = (...words) => {
      const run = spawnSync(process.execPath, [helper, ...words], { encoding: 'utf8' });
      if (run.status !== 0) throw new Error(`decisions-check.mjs ${words[0]} failed: ${`${run.stderr}${run.stdout}`.trim()}`);
      return run.stdout.trim();
    };
    const id = call('chips', 'id');
    call(
      'append',
      ledger,
      'chip',
      `${id} Fix the landing friction land.mjs measured`,
      `${runs.length} land.mjs runs since ${new Date(since).toISOString().slice(0, 16)} lost ${lost} minutes: ${thrown.length} exited 75 or stopped, after ${total(thrown, (run) => run.minutes)} minutes in all, and the rest waited ${waited} minutes for cores. ` +
        '`node .agents/pstack/land.mjs --friction` lists the runs. Find what made them slow and fix it in the shared land.mjs or proof.mjs through sync-pstack Lesson mode.',
      `writes: .agents/pstack/land.mjs, .agents/pstack/proof.mjs; topic: ${FRICTION_TOPIC}; kind: fix; priority: P3; via: hook; session: none`,
      'offered'
    );
    console.log(`land.mjs offered ${id} in ${ledger}, because landings lost ${lost} minutes since ${new Date(since).toISOString().slice(0, 16)}; /chips all cards it. Say so in one line.`);
  } finally {
    rmSync(lock, { recursive: true, force: true });
  }
}

function printFriction() {
  const since = Date.now() - FRICTION_WINDOW;
  const runs = readRuns().filter((run) => Date.parse(run.end) > since);
  for (const run of runs) {
    console.log([run.end.slice(5, 16), `${run.minutes}m`, `exit ${run.exit ?? 'signal'}`, `waited ${run.waited}m`, `checked ${run.checked}m`, `moves ${run.moves}`, `declines ${run.declines}`, run.session ?? '-', run.why].join('\t'));
  }
  const lost = total(runs, lostMinutes);
  console.log(`${runs.length} land.mjs runs in the last day lost ${lost} minutes to exit 75, to a stop or to waiting for cores; past ${FRICTION_BOUND_MINUTES} since the last ${FRICTION_TOPIC} task closed, a landing offers one.`);
}

await fetchCompanionFirst();
// <branch>'s config, because a task could loosen its own copy, and a branch cut before the split still carries the config from before it.
const settled = JSON.parse(git('show', `${upstream}:.agents/pstack.json`).stdout || '{}');
const { sourceless } = settled;
const ahead = Number(must('rev-list', '--count', `${upstream}..HEAD`));
const sideAhead = pair ? Number(cmust('rev-list', '--count', `${cupstream}..HEAD`)) : 0;
if (messageText === null && ahead === 0 && sideAhead === 0) fail(`HEAD has no task commit to take a message from; pass --message <file>\n${USAGE}`);
const split = companion ?? settled.companion;
if (split?.list) {
  const listed = (rev) => git('cat-file', '-e', `${rev}:${split.list}`).status === 0;
  if (listed(upstream) && !listed(must('merge-base', 'HEAD', upstream))) {
    fail(
      `this branch was cut before ${split.list} existed on ${target}, so its commits still track files that ${split.dir} owns now. ` +
        `${split.migrate ? `Run \`${split.migrate}\`, which saves a patch of the branch and moves its work onto both repositories, then run` : `Move its work onto a worktree cut from ${target}, then run`} land.mjs again.`
    );
  }
}
const message = validate(messageText ?? (ahead > 0 ? must('log', '-1', '--format=%B') : cmust('log', '-1', '--format=%B')));
if (dry) {
  const paths = [
    ...new Set([
      ...nul(must('diff', '-z', '--name-only', must('merge-base', 'HEAD', upstream))),
      ...nul(must('ls-files', '-z', '--others', '--exclude-standard')),
      ...(pair ? [...nul(cmust('diff', '-z', '--name-only', cmust('merge-base', 'HEAD', cupstream))), ...companionOwnedUntracked()] : []),
    ]),
  ];
  if (paths.length === 0) fail(`nothing to land: the task changes nothing against ${target}`);
  refuseEarly(message, paths, planOf(paths));
  const failed = [];
  for (const command of landChecks) {
    const run = await runCheck(command, { asLanding: false });
    if (run.stopped) fail(`land.mjs --dry stopped ${command} at ${DEADLINE / 60_000} minutes into the run; nothing was committed`);
    if (run.status !== 0) failed.push(command);
  }
  if (failed.length > 0) fail(`land checks failed on the working tree, and nothing was committed:\n${failed.map((command) => `  ${command}`).join('\n')}`);
  console.log("land.mjs --dry: the message, its source, the Defaults of each open plan it changes and the config's landChecks pass; nothing was committed.");
  process.exit(0);
}
const landing = squash(message);
const { plan, lead } = landing;
startRun();
await rebaseFetched();

const record = must('rev-parse', '--git-path', 'pstack-land-checked');
const stamp = () =>
  JSON.stringify({
    tree: must('rev-parse', 'HEAD^{tree}'),
    parent: must('rev-parse', 'HEAD^'),
    message: must('log', '-1', '--format=%B'),
    ...(pair ? { companion: cmust('rev-parse', 'HEAD^{tree}') } : {}),
    lintFix: lintFix ?? null,
    checks,
  });

// The check gets a process group of its own, so the deadline stops every step it started. A signal to land.mjs passes on to that group, then ends land.mjs as it would have, so the run log counts the run as stopped.
function runCheck(command, { asLanding = true } = {}) {
  if (elapsed() >= DEADLINE) return Promise.resolve({ stopped: true });
  return new Promise((resolve) => {
    const env = { ...process.env };
    if (asLanding) {
      env[LAND_CHECK] = '1';
      delete env.PSTACK_SLOT;
    } else {
      delete env[LAND_CHECK];
    }
    const child = spawn(command, { shell: true, stdio: ['ignore', 'inherit', 'inherit'], detached: true, env });
    const killGroup = (signal) => {
      try {
        process.kill(-child.pid, signal);
      } catch (error) {
        if (error.code !== 'ESRCH' && error.code !== 'EPERM') throw error;
      }
    };
    const pass = (signal) => {
      killGroup(signal);
      for (const stop of STOPS) process.off(stop, pass);
      process.kill(process.pid, signal);
    };
    for (const stop of STOPS) process.on(stop, pass);
    let stopped = false;
    const timer = setTimeout(() => {
      stopped = true;
      killGroup('SIGTERM');
    }, DEADLINE - elapsed());
    child.on('close', (status) => {
      clearTimeout(timer);
      for (const stop of STOPS) process.off(stop, pass);
      if (!stopped) return resolve({ status });
      setTimeout(() => {
        killGroup('SIGKILL');
        resolve({ stopped: true });
      }, MINUTE / 2);
    });
  });
}

async function check(rebased = false) {
  const started = performance.now();
  rmSync(record, { force: true });
  const changed = [
    ...nul(must('diff', '-z', '--name-only', '--diff-filter=d', fetched.own, 'HEAD')),
    ...(landing.theirs ? nul(cmust('diff', '-z', '--name-only', '--diff-filter=d', fetched.theirs, 'HEAD')) : []),
  ];
  refuseDefaults(changed);
  if (lintFix && changed.length > 0) {
    const run = spawnSync(`${lintFix} ${changed.map(quote).join(' ')}`, { shell: true, stdio: 'inherit' });
    if (run.status !== 0) fail(`${lintFix} failed on the changed files; fix them and run land.mjs again`);
    if (landing.own && dirty()) {
      must('add', '--all');
      must('commit', '--quiet', '--amend', '--no-edit');
    }
    if (landing.theirs && sideDirty()) {
      cmust('add', '--update');
      cmust('commit', '--quiet', '--amend', '--no-edit');
    }
  }
  for (const command of checks) {
    const run = await runCheck(command);
    if (run.stopped) {
      fail(
        `land.mjs stopped ${command} at ${DEADLINE / 60_000} minutes into the run. ` +
          'The squashed commit stays local, so run land.mjs again with the same --check options and no --message; it rebases and checks it.',
        EX_TEMPFAIL
      );
    }
    if (run.status === 0) continue;
    const late = await lateCompanionHalf();
    if (late) {
      console.log(`check failed: ${command}; it ran on ${late} without that commit's ${pair.dir} half, which reached origin/${branch} after land.mjs read it, so land.mjs checks both halves again.`);
      checkedMs += performance.now() - started;
      return retry(`${pair.dir}'s origin/${branch}`);
    }
    fail(`check failed: ${command}; the squashed commit stays local${rebased ? `, rebased onto the commits origin/${branch} gained while its checks ran, which may cause the failure` : ''}`);
  }
  if (dirty() || sideDirty()) {
    const status = [must('status', '--short'), pair ? cmust('status', '--short', '--untracked-files=no') : ''].filter(Boolean).join('\n');
    fail(`the checks changed files; review them and run land.mjs again, which folds them into the commit:\n${status}`);
  }
  writeFileSync(record, stamp());
  checkedMs += performance.now() - started;
}

async function retry(where) {
  if (moves >= RETRIES || elapsed() >= DEADLINE) {
    fail(
      `${where} moved, and ${moves >= RETRIES ? `it had moved ${RETRIES} times already while land.mjs checked` : `the run has reached ${DEADLINE / 60_000} minutes`}. ` +
        'The squashed commit stays local, so run land.mjs again with the same --check options and no --message; it rebases and checks it.',
      EX_TEMPFAIL
    );
  }
  moves += 1;
  console.log(`${where} moved; rebasing and pushing again (retry ${moves} of ${RETRIES})`);
  await rebaseOntoOrigin();
  takeCores();
  await check(true);
}

if (fresh) {
  console.log(`${fresh} is set, so land.mjs runs the checks again whatever it recorded.`);
  takeCores();
  await check();
} else if (existsSync(record) && readFileSync(record, 'utf8') === stamp()) {
  console.log('land.mjs recorded this commit in an earlier run, so it pushes without running the checks again.');
} else {
  takeCores();
  await check();
}

if (mode === 'push') {
  const pushesPublic = landing.own;
  while (landing.own) {
    if (pair && (await companionMoved())) {
      await retry(`${pair.dir}'s origin/${branch}`);
      continue;
    }
    const run = git('push', '--quiet', 'origin', `HEAD:refs/heads/${branch}`);
    if (run.status === 0) break;
    const declined = declinedWithoutReason(run.stderr);
    const wait = DECLINED_WAITS[declines];
    if (MOVED.test(run.stderr)) {
      await retry(`origin/${branch}`);
    } else if (declined && wait !== undefined && elapsed() + wait * MINUTE <= DEADLINE) {
      declines += 1;
      console.log(`GitHub declined the push to ${branch} with an empty GH006; pushing again in ${wait} min (retry ${declines} of ${DECLINED_WAITS.length})`);
      dropCores();
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, wait * MINUTE);
    } else if (declined) {
      cause = 'declined';
      fail(
        `GitHub declined the push to ${branch} with an empty GH006 ${declines === 0 ? 'once' : `${declines + 1} times`}, over the ${Math.round(elapsed() / 60_000)} minutes land.mjs has run. ` +
          `The squashed commit stays local and land.mjs recorded it, so run land.mjs again with the same --check options and no --message; it skips the checks unless origin/${branch} has moved since this run last rebased onto it.\n${run.stderr.trim()}`,
        EX_TEMPFAIL
      );
    } else {
      fail(`git push origin HEAD:${branch} failed: ${run.stderr.trim()}`);
    }
  }
  if (landing.own) {
    console.log(`Landed ${must('rev-parse', '--short', 'HEAD')} on origin/${branch}: ${message.subject}`);
    landing.own = false;
  }
  if (landing.theirs) await pushCompanion(lead, pushesPublic);
} else {
  const slug = message.subject.toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '').slice(0, 50);
  const topic = current && current !== branch ? current : `land/${slug}`;
  // Rendered before the push, because its links name HEAD, which is the commit pushed next, and a refusal then leaves nothing pushed.
  const body = prBody(plan, message.body);
  const pushed = git('push', '--quiet', 'origin', `HEAD:refs/heads/${topic}`);
  if (pushed.status !== 0 && !forked && /denied|\b403\b/iu.test(pushed.stderr)) {
    fail('this clone cannot push to origin: fork the repository, point origin at the fork, add the canonical repository as `upstream`, then run land.mjs again');
  }
  if (pushed.status !== 0) {
    fail(`git push origin HEAD:${topic} failed, and land.mjs never forces: ${pushed.stderr.trim()}\nPush follow-up commits to the open PR yourself, or land from a new branch.`);
  }
  const head = forked ? `${repo('origin')[0]}:${topic}` : topic;
  const into = forked ? ['--repo', repo('upstream').join('/')] : [];
  const pr = spawnSync('gh', ['pr', 'create', '--base', branch, '--head', head, '--title', message.subject, '--body-file', body.file, ...body.attach, ...into], { encoding: 'utf8' });
  if (pr.status !== 0) fail(`gh pr create failed after pushing ${topic}: ${`${pr.stderr}${pr.stdout}`.trim()}`);
  const url = pr.stdout.trim();
  console.log(`Pushed ${topic} and opened a PR into ${branch}: ${url}`);
  console.log(armAutoMerge((forked ? repo('upstream') : repo('origin')).join('/'), url));
}

// Every PR land.mjs opens gets auto-merge, so a green, approved PR never waits on a maintainer to press merge (owner's word, 2026-11-12).
// An unreadable rule set constrains nothing here, because GitHub refuses a method the base forbids and that refusal is reported.
function armAutoMerge(slug, url) {
  const rules = spawnSync('gh', ['api', `repos/${slug}/rules/branches/${branch}`], { encoding: 'utf8' });
  const reviews = rules.status === 0 ? JSON.parse(rules.stdout).filter((rule) => rule.type === 'pull_request').map((rule) => rule.parameters ?? {}) : [];
  const method = ['squash', 'merge', 'rebase'].find((name) => reviews.every((rule) => (rule.allowed_merge_methods ?? [name]).includes(name)));
  if (!method) return `Auto-merge stays off: ${branch}'s rules allow no merge method in common.`;
  const run = spawnSync('gh', ['pr', 'merge', url, '--auto', `--${method}`], { encoding: 'utf8' });
  if (run.status !== 0) return `Auto-merge stays off: gh pr merge --auto failed: ${`${run.stderr}${run.stdout}`.trim()}`;
  return `Armed auto-merge (${method}): the PR merges once its required checks and reviews pass.`;
}
