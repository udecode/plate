#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/review.mjs [--tier <tier>] [--net <session>] | --mark | --done <session> | --revert <session> [--stage] [--check <command>]...
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
//
// When the config names a `companion` whose git directory `companion.dir` is
// in the checkout, the companion's origin/<branch> commits are listed,
// classified and reviewed the same way, each after the commit its
// `Lands-With:` line names and marked `In <companion.dir>`, with its own
// refs/pstack/reviewed in that repository.
//
// --revert <session> reverts, newest first, every first-parent commit on the
// branch land.mjs lands on whose body has the line `Session: <session>`, in
// both repositories of a split checkout, and lands the result through the
// land.mjs beside it with each --check, as one `fix(revert)` commit with an
// `Introduced-by:` line per reverted commit. It runs only in a worktree with
// no uncommitted change in either repository, never the main checkout, with
// no commit the branch lacks, and fast-forwards a worktree that is behind. It
// refuses a merge commit, and on a conflict it stops with the revert in
// progress. With --stage it stops once the revert is staged and prints the
// land.mjs command.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REF = 'refs/pstack/reviewed';
const FIRST = 20;
const TIERS = ['public', 'internal'];
const USAGE =
  'Usage: node .agents/pstack/review.mjs [--tier public|internal|all] [--net <session>] | --mark | --done <session> | --revert <session> [--stage] [--check <command>]...';
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
const checks = [];
for (let at = 0; at < args.length; at += 1) {
  const flag = args[at].replace(/^--/u, '');
  if (flag === 'check' && args[at + 1] !== undefined) checks.push(args[++at]);
  else if (!['tier', 'net', 'done', 'mark', 'revert', 'stage'].includes(flag) || flag in flags) fail(USAGE, 2);
  else if (flag === 'mark' || flag === 'stage') flags[flag] = true;
  else if (args[at + 1] === undefined) fail(USAGE, 2);
  else flags[flag] = args[++at];
}
if ((flags.mark || flags.done !== undefined || flags.revert !== undefined) && Object.keys(flags).filter((flag) => flag !== 'stage').length > 1) fail(USAGE, 2);
if ((checks.length > 0 || flags.stage) && flags.revert === undefined) fail(USAGE, 2);
process.chdir(must('rev-parse', '--show-toplevel'));
const { branch, plans = 'docs/plans', reviewPaths, companion } = JSON.parse(readFileSync('.agents/pstack.json', 'utf8'));
const tier = flags.tier ?? (reviewPaths ? 'public' : 'all');
if (![...TIERS, 'all'].includes(tier)) fail(USAGE, 2);
if (tier !== 'all' && !reviewPaths) fail(`--tier ${tier} needs reviewPaths in .agents/pstack.json`, 2);
const pair = companion?.dir && existsSync(companion.dir) ? companion : null;
const repos = [{ name: null, run: git }, ...(pair ? [{ name: pair.dir, run: (args, options) => git([`--git-dir=${pair.dir}`, '--work-tree=.', ...args], options) }] : [])];
for (const repo of repos) {
  repo.must = (...args) => {
    const run = repo.run(args);
    if (run.status !== 0) fail(`git ${args.join(' ')}${repo.name ? ` in ${repo.name}` : ''} failed: ${run.stderr.trim()}`);
    return run.stdout.trim();
  };
}
const where = (repo) => `${repo.name ? `${repo.name}'s ` : ''}origin/${branch}`;
if (flags.revert !== undefined) revert(flags.revert);
const upstream = `refs/remotes/origin/${branch}`;
for (const repo of repos) {
  const fetched = repo.run(['fetch', '--quiet', 'origin', `+refs/heads/${branch}:${upstream}`]);
  if (fetched.status !== 0) console.error(`review.mjs: fetch failed, listing the last fetched ${where(repo)}: ${fetched.stderr.trim()}`);
  repo.tip = repo.must('rev-parse', upstream);
  repo.reviewed = repo.run(['rev-parse', '--verify', '--quiet', REF]).stdout.trim();
  [, repo.slug] = repo.run(['remote', 'get-url', 'origin']).stdout.trim().match(/github\.com[:/](.+?)(?:\.git)?$/u) ?? [];
}

const store = resolve(must('rev-parse', '--git-common-dir'), 'pstack-reviewed');
const reviewedShas = new Set(existsSync(store) ? readFileSync(store, 'utf8').split('\n').filter(Boolean) : []);
const [{ reviewed }] = repos;
const PLAN = new RegExp(`${plans.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}/[^\\s)\\]\`'"<>]+?\\.md`, 'u');

const matcher = (globs = []) => {
  const patterns = globs.map((glob) => new RegExp(`^${glob.replace(/[.+^${}()|[\]\\]/gu, '\\$&').replace(/\*\*\/|\*\*|\*|\?/gu, (token) => GLOB[token])}$`, 'u'));
  return (path) => patterns.some((pattern) => pattern.test(path));
};
const classes = ['skip', 'tests', 'public'].map((name) => [name, matcher(reviewPaths?.[name])]);
const some = (paths) => `${paths.slice(0, 3).join(', ')}${paths.length > 3 ? `, and ${paths.length - 3} more` : ''}`;
const diffOf = (sha, ...rest) => ['diff-tree', '-r', '-M', '--no-commit-id', '--root', '--diff-merges=first-parent', ...rest, sha];

// Each changed file with its status and class, and a note when the commit weakens tests.
function changes(sha, repo) {
  const files = repo
    .must(...diffOf(sha, '--name-status'))
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
  for (const line of repo.must(...diffOf(sha, '-p', '-U0'), '--', ...tests.flatMap((file) => file.paths)).split('\n')) {
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

const load = (repo) =>
  repo
    .must('log', '--first-parent', '--format=%H%x1f%h%x1f%s%x1f%b%x1e', ...(repo.reviewed ? [`${repo.reviewed}..${repo.tip}`] : ['-n', String(FIRST), repo.tip]))
    .split('\x1e')
    .map((part) => part.trim())
    .filter(Boolean)
    .reverse()
    .map((record) => {
      const [sha, short, subject, body = ''] = record.split('\x1f');
      const { files, weak } = reviewPaths ? changes(sha, repo) : { files: [], weak: null };
      return {
        repo,
        sha,
        short,
        subject,
        files,
        weak,
        landsWith: body.match(/^Lands-With: (\S+)$/mu)?.[1],
        session: body.match(/^Session: (\S+)$/mu)?.[1] ?? 'none',
        plan: `${subject}\n${body}`.match(PLAN)?.[0] ?? 'No plan link',
        beyond: body.match(/^Beyond the ask:.*(?:\n(?!(?:Session|Plan|Introduced-by): ).+)*/mu)?.[0].replaceAll('\n', ' ') ?? 'No Beyond the ask: line',
        fast: /^Shipped fast, no review\.$/mu.test(body),
      };
    });
for (const repo of repos) repo.commits = load(repo);
function besideTheirPairs([own, companion]) {
  const placed = [...own.commits];
  for (const commit of companion?.commits ?? []) {
    const at = placed.findIndex((other) => other.sha === commit.landsWith);
    let end = at === -1 ? placed.length : at + 1;
    while (at !== -1 && placed[end]?.repo === commit.repo) end += 1;
    placed.splice(end, 0, commit);
  }
  return placed;
}
const commits = besideTheirPairs(repos);
const inTier = (commit, name) => commit.files.some((file) => file.tier === name);
const needsReview = (commit) => !reviewPaths || commit.weak !== null || TIERS.some((name) => inTier(commit, name));
const shown = (commit) => tier === 'all' || commit.weak !== null || inTier(commit, tier);

if (flags.mark) {
  for (const repo of repos) {
    repo.must('update-ref', REF, repo.tip);
    console.log(`Marked ${where(repo)} at ${repo.tip.slice(0, 7)} as reviewed.`);
  }
  writeFileSync(store, '');
  process.exit(0);
}

if (flags.done !== undefined) {
  const { done } = flags;
  const ours = commits.filter((commit) => commit.session === done && !reviewedShas.has(commit.sha));
  if (ours.length === 0) fail(`no listed commit to review has Session: ${done}; run review.mjs to see the sessions`);
  for (const commit of ours) reviewedShas.add(commit.sha);
  const moved = [];
  for (const repo of repos) {
    let advanced = null;
    for (const commit of repo.commits) {
      if (!reviewedShas.has(commit.sha) && needsReview(commit)) break;
      advanced = commit.sha;
      reviewedShas.delete(commit.sha);
    }
    if (!advanced) continue;
    repo.must('update-ref', REF, advanced);
    moved.push(` ${repo.name ? `${repo.name}'s ` : ''}${REF} is now at ${advanced.slice(0, 7)}.`);
  }
  writeFileSync(store, [...reviewedShas].map((sha) => `${sha}\n`).join(''));
  console.log(`Marked ${ours.length} commit(s) of session ${done} as reviewed.${moved.join('')}`);
  process.exit(0);
}

const open = commits.filter((commit) => !reviewedShas.has(commit.sha));

if (flags.net !== undefined) {
  const ours = open.filter((commit) => commit.session === flags.net);
  if (ours.length === 0) fail(`no listed commit to review has Session: ${flags.net}; run review.mjs to see the sessions`);
  const paths = tier === 'all' ? [] : [...new Set(ours.flatMap((commit) => commit.files.filter((file) => file.tier === tier).flatMap((file) => file.paths)))];
  if (tier !== 'all' && paths.length === 0) fail(`session ${flags.net} changes no ${tier} paths`);
  for (const repo of repos) {
    const used = ours.filter((commit) => commit.repo === repo && (tier === 'all' || inTier(commit, tier)));
    if (used.length === 0) continue;
    const start = repo.run(['rev-parse', '--verify', '--quiet', `${used[0].sha}^1`]).stdout.trim() || repo.must('hash-object', '-t', 'tree', '/dev/null');
    const scratch = mkdtempSync(join(tmpdir(), 'review-net-'));
    const env = { ...process.env, GIT_INDEX_FILE: join(scratch, 'index') };
    const unread = repo.run(['read-tree', start], { env }).status !== 0;
    const stuck = unread
      ? null
      : used.find((commit) => {
          const patch = repo.run([...diffOf(commit.sha, '-p', '--binary'), '--', ...paths]).stdout;
          return patch !== '' && repo.run(['apply', '--cached', '--binary'], { env, input: patch }).status !== 0;
        });
    const tree = unread || stuck ? null : repo.run(['write-tree'], { env }).stdout.trim();
    rmSync(scratch, { recursive: true, force: true });
    if (unread) fail(`git read-tree ${start} failed`);
    if (stuck) fail(`${stuck.short} does not apply on the session's earlier commits alone, because a commit landed between them changed the same lines; review its commits one by one`);
    console.log(`Net diff of session ${flags.net}'s ${used.length} ${repo.name ? `${repo.name} ` : ''}commit(s)${tier === 'all' ? '' : ` in ${tier} paths`}, from ${start.slice(0, 7)}:\n`);
    process.stdout.write(repo.must('diff', '-M', start, tree, '--', ...paths));
    process.stdout.write('\n');
  }
  process.exit(0);
}

const listed = open.filter(shown);
const title = (commit) =>
  commit.repo.slug ? `📦 [${commit.subject.replace(/[[\]]/gu, '\\$&')}](https://diffshub.com/${commit.repo.slug}/commit/${commit.sha})` : `${commit.short} ${commit.subject}`;
const groups = new Map();
for (const commit of listed) {
  if (!groups.has(commit.session)) groups.set(commit.session, []);
  const lines = [`  ${title(commit)}`];
  if (commit.repo.name) {
    const paired = listed.some((other) => other.sha === commit.landsWith && other.session === commit.session);
    lines.push(`    In ${commit.repo.name}${paired ? `, with ${commit.landsWith.slice(0, 7)}` : ''}`);
  }
  lines.push(`    ${commit.plan}`, `    ${commit.beyond}`);
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

function revert(session) {
  const [gitDir, commonDir] = must('rev-parse', '--git-dir', '--git-common-dir')
    .split('\n')
    .map((path) => resolve(path));
  if (gitDir === commonDir) fail('--revert runs in a worktree cut from the branch, not in the main checkout');
  const pr = git(['config', '--get', 'pstack.delivery']).stdout.trim() !== 'push';
  const remote = pr && git(['remote', 'get-url', 'upstream']).status === 0 ? 'upstream' : 'origin';
  const target = `${remote}/${branch}`;
  const onto = (repo) => (repo.name ? `origin/${branch}` : target);
  for (const repo of repos) repo.must('fetch', '--quiet', repo.name ? 'origin' : remote, `+refs/heads/${branch}:refs/remotes/${onto(repo)}`);
  if (must('status', '--porcelain', '--untracked-files=all') !== '' || (pair && repos[1].must('status', '--porcelain', '--untracked-files=no') !== '')) {
    fail('--revert needs a worktree without uncommitted changes, because land.mjs would carry them into the revert');
  }
  for (const repo of repos) {
    if (repo.must('rev-list', '--count', `${onto(repo)}..HEAD`) !== '0') fail(`HEAD${repo.name ? ` in ${repo.name}` : ''} has commits that ${onto(repo)} lacks, which land.mjs would carry into the revert; run --revert from a worktree cut from ${target}`);
    repo.must('merge', '--quiet', '--ff-only', onto(repo));
  }

  const line = `Session: ${session}`;
  const ours = repos.flatMap((repo) =>
    repo
      .must('log', '--first-parent', '--fixed-strings', `--grep=${line}`, '--format=%H%x1f%h%x1f%P%x1f%s%x1f%b%x1e', onto(repo))
      .split('\x1e')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((record) => {
        const [sha, short, parents, subject, body = ''] = record.split('\x1f');
        return { repo, sha, short, merge: parents.includes(' '), subject, lines: body.split('\n') };
      })
      .filter((commit) => commit.lines.includes(line))
  );
  if (ours.length === 0) fail(`no commit on ${target}${pair ? ` or ${where(repos[1])}` : ''} has the line ${line}`);
  const merges = ours.filter((commit) => commit.merge).map((commit) => commit.short);
  if (merges.length > 0) fail(`session ${session} landed the merge commit(s) ${merges.join(', ')}, which --revert does not undo; revert them by hand with \`git revert -m 1\``);

  const file = join(mkdtempSync(join(tmpdir(), 'review-revert-')), 'message');
  writeFileSync(
    file,
    [
      `fix(revert): undo session ${session.replace(/^local_/u, '').slice(0, 8)}`,
      '',
      '## Why',
      '',
      `Reverts every commit session ${session} landed on ${branch}, newest first:`,
      '',
      ...ours.map((commit) => `${commit.repo.name ? `${commit.repo.name} ` : ''}${commit.short} ${commit.subject}`),
      '',
      '## Verification',
      '',
      checks.length > 0 ? `land.mjs ran ${checks.map((check) => `\`${check}\``).join(', ')} on the reverted tree before landing it.` : 'No check ran on the reverted tree, because review.mjs --revert got no --check.',
      '',
      'Beyond the ask: none',
      '',
      ...ours.map((commit) => `Introduced-by: ${commit.sha}`),
      '',
    ].join('\n')
  );
  const conflicts = [];
  for (const repo of repos) {
    const shas = ours.filter((commit) => commit.repo === repo).map((commit) => commit.sha);
    if (shas.length === 0) continue;
    const run = repo.run(['revert', '--no-commit', ...shas]);
    if (run.status === 0) continue;
    const paths = repo.must('diff', '--name-only', '--diff-filter=U').split('\n').filter(Boolean);
    if (paths.length === 0) {
      for (const each of repos) each.run(['revert', '--abort']);
      fail(`git revert${repo.name ? ` in ${repo.name}` : ''} failed: ${run.stderr.trim()}`);
    }
    conflicts.push(...paths.map((path) => `  ${repo.name ? `${repo.name}: ` : ''}${path}`));
  }
  const sideGit = pair ? `\`git --git-dir=${pair.dir} --work-tree=.\`` : '';
  if (conflicts.length > 0) {
    fail(
      `reverting session ${session} conflicts in:\n${conflicts.join('\n')}\n` +
        'The revert is still in progress and nothing was pushed. Resolve those paths, `git add` them and run `GIT_EDITOR=true git revert --continue`, which reverts the rest; ' +
        `${pair ? `for a ${pair.dir} path, run those through ${sideGit}; ` : ''}then run \`node .agents/pstack/land.mjs --message ${file}\` with the same --check values, which lands them as one commit. \`git revert --abort\` drops the whole revert.`
    );
  }
  if (flags.stage) {
    console.log(
      `Session ${session}'s ${ours.length} commit(s) are reverted and staged, and nothing was pushed. Review \`git diff --cached\`${pair ? ` and ${sideGit} \`diff --cached\`` : ''}, then land it with \`node .agents/pstack/land.mjs --message ${file}${checks.map((check) => ` --check '${check.replaceAll("'", "'\\''")}'`).join('')}\`.`
    );
    process.exit(0);
  }
  const land = spawnSync(process.execPath, [fileURLToPath(new URL('land.mjs', import.meta.url)), '--message', file, ...checks.flatMap((check) => ['--check', check])], {
    stdio: 'inherit',
  });
  process.exit(land.status ?? 1);
}
