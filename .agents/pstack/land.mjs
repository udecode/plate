#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/land.mjs [--message <file>] [--check <command>]...
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
// commit body otherwise; a refused render stops before the push. When
// <branch>'s rules require an approval that a later push dismisses, it then
// arms GitHub auto-merge, so the PR merges once a reviewer approves its latest
// push.
// Without --message it keeps the message of the task's last commit, so a run
// stopped by a conflict or a failed check reruns as is.
// When every path a rebase of this checkout conflicts on matches the globs of
// a `generated` entry in the config, it takes <branch>'s side of those paths,
// runs each matching entry's command to rebuild them from the merged sources,
// stages what the command wrote and continues the rebase. A failed command
// puts the conflicts back, and a write outside the entry's globs, staged or
// not, stops it with the rebase in progress, as any other conflict does.
// land.mjs also runs an `always` entry's command after every rebase that did
// not already run it, and folds what it wrote into the task's commit. The
// config's `landChecks` run before each --check on every land.
// When the config names a `companion` whose git directory `companion.dir` is
// in the checkout, that repository tracks the files this checkout's git
// ignores through `companion.list`, and the task's changes there land in push
// mode, the default there, as a second commit with the same message. Every
// land rebases the companion onto its origin/<branch> and checks both halves
// together. A companion file missing from disk stops the land until it is put
// back, with `companion.restore` when the config names it, or its deletion is
// staged. The companion commit pushes after the first, with a `Lands-With:`
// line naming the commit it landed with; a refused companion push exits 75,
// and the rerun rebases, checks and pushes it. A checkout whose config names a
// companion it lacks refuses to land in push mode. A branch cut before
// `companion.list` existed on <branch> stops with `companion.migrate`.
// Each commit ends with a `Lead:` line naming the model and effort lead.mjs
// reads for the agent session running this land, or `unknown`, replacing any
// such line in the message. When <branch>'s config lists `sourceless` GitHub
// logins, a commit lands only for them unless it names a source: an issue of
// this repository or its companion, a card in the suggested-task ledger, or a
// dated plan in the plans directory that exists.

import { spawn, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { availableParallelism, devNull, tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { findLead, leadLabel } from './lead.mjs';
import { reserve } from './proof.mjs';
import { ledgerPath, readTasks } from './tasks.mjs';

const USAGE = 'Usage: node .agents/pstack/land.mjs [--message <file>] [--check <command>]...';
const SUBJECT = /^(feat|fix|docs|refactor|test|chore|perf)(\([^()\s]+\))?!?: \S(.*\S)?$/u;
const BEYOND = /^Beyond the ask: \S/mu;
const SESSION = /^Session: \S/mu;
const PLAN = /^Plan: \S/mu;
const TRAILER = /^(?:Session|Plan|Lands-With): \S/u;
const ISSUE = /(?<![\w#/.-])(?:([\w.-]+)\/)?([\w.-]+)#\d+\b|https:\/\/github\.com\/([^/\s]+)\/([^/\s]+)\/issues\/\d+/gu;
const CARD = /\bt_[0-9a-f]{8}\b/gu;
const INTRODUCED = /^Introduced-by:(.*)$/gmu;
const CLOSING = /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)(?::\s*|\s+)(?:[\w.-]+\/([\w.-]+)#\d+|#\d+|GH-\d+|https?:\/\/github\.com\/[^/\s]+\/([^/\s]+)\/(?:issues|pull)\/\d+)(?!\w)/iu;
const DATED = /^\d{4}-\d\d-\d\d-[^/]+\.md$/u;
const PR_SECTIONS = ['Why', 'Verification'];
const RETRIES = 3;
const DECLINED_WAITS = [1, 2, 4, 8, 16];
const COMMAND_LIMIT = 60 * 60_000;
const DEADLINE = COMMAND_LIMIT - 5 * 60_000;
const EX_TEMPFAIL = 75;
const session = process.env.CLAUDE_CODE_HOST_SESSION_ID || process.env.CLAUDE_CODE_SESSION_ID || process.env.CODEX_SESSION_ID || '';

const fail = (message, code = 1) => {
  console.error(`land.mjs: ${message}`);
  process.exit(code);
};
const scale = process.env.PSTACK_LAND_WAIT_SCALE ?? '1';
if (!/^\d+(\.\d+)?$/u.test(scale)) fail(`PSTACK_LAND_WAIT_SCALE must be a decimal number of at least 0, not "${scale}"`, 2);
const MINUTE = 60_000 * Number(scale);
const git = (...args) => spawnSync('git', args, { encoding: 'utf8' });
const must = (...args) => {
  const run = git(...args);
  if (run.status !== 0) fail(`git ${args.join(' ')} failed: ${run.stderr.trim()}`);
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
if (companion?.dir && !pair && mode === 'push') {
  fail(`this checkout has no ${companion.dir}, so landing would push ${branch} without its companion half or that half's checks; attach the companion repository first, then run land.mjs again`);
}
const side = pair ? [`--git-dir=${join(process.cwd(), pair.dir)}`, `--work-tree=${process.cwd()}`] : [];
const cgit = (...args) => spawnSync('git', [...side, ...args], { encoding: 'utf8' });
const cmust = (...args) => {
  const run = cgit(...args);
  if (run.status !== 0) fail(`git ${args.join(' ')} in ${pair.dir} failed: ${run.stderr.trim()}`);
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

// Each half's fetch is a network round trip of a second or two, so both run at once.
async function fetch() {
  const own = ['fetch', '--quiet', canonical, `+refs/heads/${branch}:${upstream}`];
  const theirs = ['fetch', '--quiet', 'origin', `+refs/heads/${branch}:${cupstream}`];
  const [run, crun] = await Promise.all([gitAsync(own), pair ? gitAsync([...side, ...theirs]) : null]);
  if (run.status !== 0) fail(`git ${own.join(' ')} failed: ${run.stderr.trim()}`);
  if (crun && crun.status !== 0) fail(`git ${theirs.join(' ')} in ${pair.dir} failed: ${crun.stderr.trim()}`);
}

function rebase(inCompanion = false) {
  const run = inCompanion ? cgit : git;
  const onto = inCompanion ? cupstream : upstream;
  const where = inCompanion ? `${pair.dir}'s origin/${branch}` : target;
  if (!inCompanion) rebuilt.clear();
  if (run('merge-base', '--is-ancestor', onto, 'HEAD').status === 0) return;
  let rebased = run('rebase', '--quiet', onto);
  while (rebased.status !== 0) {
    const paths = unmerged(run);
    if (paths.length === 0) {
      run('rebase', '--abort');
      fail(`git rebase ${where} failed: ${rebased.stderr.trim()}`);
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
let rebuildTime = 0;
let refreshTime = 0;
const rebuilt = new Set();

function worktreeTree() {
  const index = join(mkdtempSync(join(tmpdir(), 'land-')), 'index');
  copyFileSync(must('rev-parse', '--git-path', 'index'), index);
  const env = { ...process.env, GIT_INDEX_FILE: index };
  if (spawnSync('git', ['add', '--all'], { env }).status !== 0) fail('git add --all into a scratch index failed while rebuilding the generated paths');
  const tree = spawnSync('git', ['write-tree'], { env, encoding: 'utf8' });
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
  const started = performance.now();
  const written = regenerate(
    owners,
    (command) => {
      git('checkout', '--merge', '--', ...literal(paths));
      fail(`${command} failed, so land.mjs put the conflicts back. The rebase is still in progress. Fix the cause, resolve the conflicts, \`git add\` them, ${resume}`);
    },
    `The rebase is still in progress. Add or discard those files, ${resume}`
  );
  rebuildTime = performance.now() - started;
  for (const entry of owners) rebuilt.add(entry);
  if (written.length > 0) must('add', '--all', '--', ...literal(written));
  return spawnSync('git', ['rebase', '--continue'], { encoding: 'utf8', env: { ...process.env, GIT_EDITOR: 'true' } });
}

// A clean rebase can still leave an `always` entry's output stale, such as when origin/<branch> changed the sources it reads.
function refresh() {
  const owners = generated.filter((entry) => entry.always && !rebuilt.has(entry));
  if (!landing.own || owners.length === 0) return;
  const rerun = 'then run land.mjs again without --message.';
  const started = performance.now();
  const written = regenerate(owners, (command) => fail(`${command} failed while rebuilding its generated paths after the rebase. Fix the cause, ${rerun}`), `Add or discard those files, ${rerun}`);
  refreshTime = performance.now() - started;
  if (written.length === 0) return;
  console.log(`land.mjs rebuilt ${written.join(', ')} after the rebase and folds the output into the commit`);
  must('add', '--all', '--', ...literal(written));
  must('commit', '--quiet', '--amend', '--no-edit');
}

function regenerate(owners, failed, outsideHint) {
  const release = reserve(Math.ceil(availableParallelism() / 2), 'land.mjs rebuild');
  const written = [];
  let before = worktreeTree();
  for (const { command, paths: globs } of owners) {
    console.log(`$ ${command}`);
    if (spawnSync(command, { shell: true, stdio: 'inherit' }).status !== 0) failed(command);
    const after = worktreeTree();
    const outside = nul(git('diff', '-z', '--name-only', before, after, '--', '.', ...globs.map((glob) => `:(exclude,glob)${glob}`)).stdout);
    if (outside.length > 0) fail(`${command} also changed files outside its generated paths:\n${outside.map((path) => `  ${path}`).join('\n')}\n${outsideHint}`);
    written.push(...nul(git('diff', '-z', '--name-only', before, after).stdout));
    before = after;
  }
  release();
  return written;
}

// The companion's git never reads this clone's .git/info/exclude, so a path only that file ignores is local, not companion work.
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
  const tracked = new Set(nul(git('ls-files', '-z').stdout));
  const others = nul(cgit('ls-files', '-z', '--others', '--exclude-standard').stdout).filter((path) => !tracked.has(path));
  if (others.length === 0) return;
  const ignored = (list) => nul(spawnSync('git', ['-c', `core.excludesFile=${list}`, 'check-ignore', '-z', '--stdin'], { encoding: 'utf8', input: others.join('\0') }).stdout);
  const here = new Set(ignored(devNull));
  const owned = ignored(join(process.cwd(), pair.list)).filter((path) => !here.has(path));
  if (owned.length === 0) return;
  const run = spawnSync('git', [...side, 'add', '--force', '--pathspec-from-file=-', '--pathspec-file-nul'], { encoding: 'utf8', input: owned.join('\0') });
  if (run.status !== 0) fail(`git add in ${pair.dir} failed: ${run.stderr.trim()}`);
}

function pushCompanion(lead) {
  const text = cmust('log', '-1', '--format=%B');
  const [subject, ...rest] = text.split('\n');
  const stamped = `${subject}\n\n${trailers(rest.join('\n').trim(), null, lead)}${PAIRED.test(text) ? '' : `\nLands-With: ${must('rev-parse', 'HEAD')}`}`;
  if (stamped !== text) {
    const file = join(mkdtempSync(join(tmpdir(), 'land-')), 'message');
    writeFileSync(file, `${stamped}\n`);
    cmust('commit', '--quiet', '--amend', '--only', '--file', file);
  }
  const run = cgit('push', '--quiet', 'origin', `HEAD:refs/heads/${branch}`);
  if (run.status !== 0) {
    fail(
      `git push of the ${pair.dir} commit failed after the rest of the task landed. That commit stays local, so run land.mjs again with no --message; it rebases and checks that commit, then pushes it.\n${run.stderr.trim()}`,
      EX_TEMPFAIL
    );
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
  if (!BEYOND.test(rest.join('\n'))) fail('the body has no `Beyond the ask:` line; name every change the request did not ask for, or write `Beyond the ask: none`');
  const closing = text.match(CLOSING);
  if (closing) {
    const name = closing[1] ?? closing[2] ?? must('remote', 'get-url', canonical).match(/([^/:]+?)(?:\.git)?\/?$/u)[1];
    fail(`${JSON.stringify(closing[0])} closes an issue once it reaches the default branch, because a form of close, fix or resolve comes right before its reference; write \`${name}#<N>\`, which links nothing`);
  }
  if (SUBJECT.exec(subject)[1] === 'fix') introduced(rest.join('\n'));
  return { subject, body: rest.join('\n').trim() };
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

function sourced(text, plan) {
  if (plan || [...text.matchAll(/^Plan: (\S+)$/gmu)].some(([, path]) => isPlan(path))) return true;
  const ours = homes();
  const issue = ([, refOwner, refName, urlOwner, urlName]) => {
    const owner = (refOwner ?? urlOwner)?.toLowerCase();
    const name = (refName ?? urlName).toLowerCase();
    return ours.some((home) => home.name === name && (owner === undefined || home.owner === owner));
  };
  if ([...text.matchAll(ISSUE)].some(issue)) return true;
  const cards = text.match(CARD) ?? [];
  if (cards.length === 0) return false;
  const common = git('rev-parse', '--path-format=absolute', '--git-common-dir').stdout.trim();
  const ledger = join(basename(common) === '.git' ? dirname(common) : process.cwd(), ledgerPath(plans, config.delivery));
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

// A heading counts only when text other than an HTML comment, such as the PR template's placeholder, follows it before the next heading or the Beyond the ask line.
function missingSections(body) {
  return PR_SECTIONS.filter((name) => {
    const section = body.match(new RegExp(`^## ${name}[ \\t]*\\n([\\s\\S]*?)(?=^## |^Beyond the ask:|(?![\\s\\S]))`, 'mu'));
    return !section || section[1].replace(/<!--[\s\S]*?-->/gu, '').trim() === '';
  });
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

// Squashes the task into one commit in each repository that it changes; a companion-only task leaves HEAD at its base here.
function squash({ subject, body }) {
  const head = must('rev-parse', 'HEAD');
  const base = must('merge-base', 'HEAD', upstream);
  must('add', '--all');
  const staged = (run, from) => run('diff', '--cached', '--name-only', from).stdout.split('\n').filter(Boolean);
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
  const missing = mode === 'pr' && !paged(plan) ? missingSections(body) : [];
  if (missing.length > 0) {
    fail(
      `a PR whose body is the commit body needs ${missing.map((name) => `a \`## ${name}\` section`).join(' and ')} with text; ` +
        'add the missing text to the message and run land.mjs again with --message, or change exactly one dated plan so its page becomes the body'
    );
  }
  const loose = sourceRefusal(subject, body, plan);
  if (loose) fail(loose);
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
  if ((own.length > 0 && !commit([])) || (theirs.length > 0 && !commit(side))) {
    undo();
    fail('git commit failed; the task commits are back as they were');
  }
  return { plan, lead, own: own.length > 0, theirs: theirs.length > 0 };
}

await fetch();
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
const landing = squash(message);
const { plan, lead } = landing;
rebase();
refresh();
if (pair) rebase(true);

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

let checkTime = 0;

function check(rebased = false) {
  const started = performance.now();
  rmSync(record, { force: true });
  const names = (text) => text.split('\n').filter(Boolean);
  const changed = [
    ...names(must('diff', '--name-only', '--diff-filter=d', upstream, 'HEAD')),
    ...(landing.theirs ? names(cmust('diff', '--name-only', '--diff-filter=d', cupstream, 'HEAD')) : []),
  ];
  const release = reserve(Math.ceil(availableParallelism() / 2), 'land.mjs checks');
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
    const run = spawnSync(command, { shell: true, stdio: 'inherit' });
    if (run.status !== 0) fail(`check failed: ${command}; the squashed commit stays local${rebased ? `, rebased onto the commits origin/${branch} gained while its checks ran, which may cause the failure` : ''}`);
  }
  release();
  if (dirty() || sideDirty()) {
    const status = [must('status', '--short'), pair ? cmust('status', '--short', '--untracked-files=no') : ''].filter(Boolean).join('\n');
    fail(`the checks changed files; review them and run land.mjs again, which folds them into the commit:\n${status}`);
  }
  writeFileSync(record, stamp());
  checkTime = performance.now() - started;
}

if (fresh) {
  console.log(`${fresh} is set, so land.mjs runs the checks again whatever it recorded.`);
  check();
} else if (existsSync(record) && readFileSync(record, 'utf8') === stamp()) {
  console.log('land.mjs recorded this commit in an earlier run, so it pushes without running the checks again.');
} else {
  check();
}

if (mode === 'push') {
  let moves = 0;
  let declines = 0;
  while (landing.own) {
    const run = git('push', '--quiet', 'origin', `HEAD:refs/heads/${branch}`);
    if (run.status === 0) break;
    const moved = /\[rejected\]|fetch first|non-fast-forward/u.test(run.stderr);
    const declined = declinedWithoutReason(run.stderr);
    const wait = DECLINED_WAITS[declines];
    if (moved && moves < RETRIES && performance.now() + checkTime + rebuildTime + refreshTime > DEADLINE) {
      fail(
        `origin/${branch} moved, and checking the rebased commit again would end past ${DEADLINE / MINUTE} minutes into the run. ` +
          'The squashed commit stays local, so run land.mjs again with the same --check options and no --message; it rebases and checks it.',
        EX_TEMPFAIL
      );
    } else if (moved && moves < RETRIES) {
      moves += 1;
      console.log(`origin/${branch} moved; rebasing and pushing again (retry ${moves} of ${RETRIES})`);
      await fetch();
      rebase();
      refresh();
      if (pair) rebase(true);
      check(true);
    } else if (declined && wait !== undefined && performance.now() + wait * MINUTE <= DEADLINE) {
      declines += 1;
      console.log(`GitHub declined the push to ${branch} with an empty GH006; pushing again in ${wait} min (retry ${declines} of ${DECLINED_WAITS.length})`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, wait * MINUTE);
    } else if (declined) {
      fail(
        `GitHub declined the push to ${branch} with an empty GH006 ${declines === 0 ? 'once' : `${declines + 1} times`}, over the ${Math.round(performance.now() / 60_000)} minutes land.mjs has run. ` +
          `The squashed commit stays local and land.mjs recorded it, so run land.mjs again with the same --check options and no --message; it skips the checks unless origin/${branch} has moved since this run last rebased onto it.\n${run.stderr.trim()}`,
        EX_TEMPFAIL
      );
    } else {
      fail(`git push origin HEAD:${branch} failed: ${run.stderr.trim()}`);
    }
  }
  if (landing.own) console.log(`Landed ${must('rev-parse', '--short', 'HEAD')} on origin/${branch}: ${message.subject}`);
  if (landing.theirs) pushCompanion(lead);
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

// Auto-merge lands whatever head is ready, so it is armed only where a required approval goes stale on a push and the approval of the landing head stays the gate.
function armAutoMerge(slug, url) {
  const rules = spawnSync('gh', ['api', `repos/${slug}/rules/branches/${branch}`], { encoding: 'utf8' });
  if (rules.status !== 0) return `Auto-merge stays off: could not read ${branch}'s rules: ${rules.stderr.trim()}`;
  const reviews = JSON.parse(rules.stdout).filter((rule) => rule.type === 'pull_request').map((rule) => rule.parameters ?? {});
  const gated = reviews.some((rule) => rule.required_approving_review_count > 0 && (rule.dismiss_stale_reviews_on_push || rule.require_last_push_approval));
  if (!gated) return `Auto-merge stays off: ${branch}'s rules require no approval of a PR's latest push.`;
  const method = ['squash', 'merge', 'rebase'].find((name) => reviews.every((rule) => (rule.allowed_merge_methods ?? [name]).includes(name)));
  if (!method) return `Auto-merge stays off: ${branch}'s rules allow no merge method in common.`;
  const run = spawnSync('gh', ['pr', 'merge', url, '--auto', `--${method}`], { encoding: 'utf8' });
  if (run.status !== 0) return `Auto-merge stays off: gh pr merge --auto failed: ${`${run.stderr}${run.stdout}`.trim()}`;
  return `Armed auto-merge (${method}): the PR merges once a reviewer approves its latest push.`;
}
