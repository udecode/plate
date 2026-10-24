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
// commit body otherwise; a refused render stops before the push. A commit
// body that becomes a PR body needs a `## Why` and a `## Verification`
// section, each with text, as pstack's Opening a PR asks. When <branch>'s
// rules require an approval that a later push dismisses, it then arms GitHub
// auto-merge, so the PR merges once a reviewer approves its latest push.
// Without --message it keeps the message of the task's last commit, so a run
// stopped by a conflict or a failed check reruns as is.
//
// The message is one Conventional Commit whose body holds a `Beyond the ask:`
// line. The commit gains a `Session:` line naming the agent session that
// landed it, and a `Plan:` line when the task changes exactly one plan, so
// review.mjs lists each session's commits together. A rebase conflict stops
// with the rebase in progress and lists the conflicting paths. A push rejected because <branch> moved rebases and
// retries up to three times. A push GitHub declines with GH006 and no reason is
// pushed again after 1, 2, 4, 8 and 16 minutes. land.mjs exits 75 after the
// last try, or before a wait that would end past 55 minutes into the run;
// PSTACK_LAND_WAIT_SCALE multiplies those waits. Once the checks pass, and
// after each clean rebase onto a moved <branch>, land.mjs records the commit
// it would push, so a rerun with the same tree, parent, message and checks
// pushes without running the checks again. It never force-pushes.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const USAGE = 'Usage: node .agents/pstack/land.mjs [--message <file>] [--check <command>]...';
const SUBJECT = /^(feat|fix|docs|refactor|test|chore|perf)(\([^()\s]+\))?!?: \S(.*\S)?$/u;
const BEYOND = /^Beyond the ask: \S/mu;
const SESSION = /^Session: \S/mu;
const PLAN = /^Plan: \S/mu;
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
const { branch, protected: guarded, lintFix, plans = 'docs/plans' } = config;
if (!branch) fail('.agents/pstack.json names no branch');
const mode = git('config', '--get', 'pstack.delivery').stdout.trim() === 'push' ? 'push' : 'pr';
const forked = mode === 'pr' && git('remote', 'get-url', 'upstream').status === 0;
const canonical = forked ? 'upstream' : 'origin';
const upstream = `refs/remotes/${canonical}/${branch}`;
const target = `${canonical}/${branch}`;
const current = must('branch', '--show-current');
if (guarded && current === guarded) fail(`this checkout is on ${guarded}; land from a worktree cut from ${target}`);

const midway = ['rebase-merge', 'rebase-apply', 'MERGE_HEAD'].some((name) => existsSync(must('rev-parse', '--git-path', name)));
if (midway) fail('a rebase or merge is in progress; resolve it, `git add` the paths, `git rebase --continue`, then run land.mjs again');

const conflicted = () => must('diff', '--name-only', '--diff-filter=U').split('\n').filter(Boolean);
const dirty = () => must('status', '--porcelain', '--untracked-files=all') !== '';

function fetch() {
  must('fetch', '--quiet', canonical, `+refs/heads/${branch}:${upstream}`);
}

function rebase() {
  if (git('merge-base', '--is-ancestor', upstream, 'HEAD').status === 0) return;
  const run = git('rebase', '--quiet', upstream);
  if (run.status === 0) return;
  const paths = conflicted();
  if (paths.length === 0) {
    git('rebase', '--abort');
    fail(`git rebase ${target} failed: ${run.stderr.trim()}`);
  }
  fail(
    `rebasing onto ${target} conflicts in:\n${paths.map((path) => `  ${path}`).join('\n')}\n` +
      'The rebase is still in progress. Resolve those paths, `git add` them, `git rebase --continue`, then run land.mjs again without --message.'
  );
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
  return { subject, body: rest.join('\n').trim() };
}

// The one dated plan the task changes, or null when it changes none or several.
function planOf(staged) {
  const touched = staged.filter((path) => path.startsWith(`${plans}/`) && DATED.test(path.slice(plans.length + 1)));
  return touched.length === 1 ? touched[0] : null;
}

function trailers(body, plan) {
  const lines = [];
  if (session && !SESSION.test(body)) lines.push(`Session: ${session}`);
  if (!PLAN.test(body) && plan) lines.push(`Plan: ${plan}`);
  return lines.length > 0 ? `${body}\n\n${lines.join('\n')}` : body;
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

function squash({ subject, body }) {
  const head = must('rev-parse', 'HEAD');
  const base = must('merge-base', 'HEAD', upstream);
  must('add', '--all');
  must('reset', '--quiet', '--soft', base);
  if (git('diff', '--cached', '--quiet').status === 0) {
    must('reset', '--quiet', '--soft', head);
    fail(`nothing to land: the task changes nothing against ${target}`);
  }
  const plan = planOf(must('diff', '--cached', '--name-only').split('\n').filter(Boolean));
  const missing = mode === 'pr' && !paged(plan) ? missingSections(body) : [];
  if (missing.length > 0) {
    must('reset', '--quiet', '--soft', head);
    fail(
      `a PR whose body is the commit body needs ${missing.map((name) => `a \`## ${name}\` section`).join(' and ')} with text, as pstack's Opening a PR asks; ` +
        'add the missing text to the message and run land.mjs again with --message, or change exactly one dated plan so its page becomes the body'
    );
  }
  const file = join(mkdtempSync(join(tmpdir(), 'land-')), 'message');
  writeFileSync(file, `${subject}\n\n${trailers(body, plan)}\n`);
  const run = spawnSync('git', ['commit', '--quiet', '--file', file], { stdio: 'inherit' });
  if (run.status !== 0) {
    must('reset', '--quiet', '--soft', head);
    fail('git commit failed; the task commits are back as they were');
  }
  return plan;
}

fetch();
const ahead = Number(must('rev-list', '--count', `${upstream}..HEAD`));
if (messageText === null && ahead === 0) fail(`HEAD has no task commit to take a message from; pass --message <file>\n${USAGE}`);
const message = validate(messageText ?? must('log', '-1', '--format=%B'));
const plan = squash(message);
rebase();

const record = must('rev-parse', '--git-path', 'pstack-land-checked');
const stamp = () =>
  JSON.stringify({ tree: must('rev-parse', 'HEAD^{tree}'), parent: must('rev-parse', 'HEAD^'), message: must('log', '-1', '--format=%B'), lintFix: lintFix ?? null, checks });
const markChecked = () => writeFileSync(record, stamp());
if (existsSync(record) && readFileSync(record, 'utf8') === stamp()) {
  console.log('land.mjs recorded this commit in an earlier run, so it pushes without running the checks again.');
} else {
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
  markChecked();
}

if (mode === 'push') {
  let moves = 0;
  let declines = 0;
  for (;;) {
    const run = git('push', '--quiet', 'origin', `HEAD:refs/heads/${branch}`);
    if (run.status === 0) break;
    const moved = /\[rejected\]|fetch first|non-fast-forward/u.test(run.stderr);
    const declined = declinedWithoutReason(run.stderr);
    const wait = DECLINED_WAITS[declines];
    if (moved && moves < RETRIES) {
      moves += 1;
      console.log(`origin/${branch} moved; rebasing and pushing again (retry ${moves} of ${RETRIES})`);
      fetch();
      rebase();
      markChecked();
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
  console.log(`Landed ${must('rev-parse', '--short', 'HEAD')} on origin/${branch}: ${message.subject}`);
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
