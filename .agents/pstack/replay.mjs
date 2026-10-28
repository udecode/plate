#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/replay.mjs --dir <run dir> --seat <name>=<claude|codex>:<model>@<effort>... [--case <introducing sha>:<fix sha>]... [--limit <n>] [--clean <n>] [--timeout <seconds>] [--dry-run]
// Replays panel seats on bugs that landed, to measure which seat would have
// caught each one. A case pairs a fix commit on <branch>, the branch
// .agents/pstack.json names, fetched from the remote land.mjs rebases onto,
// with each commit its `Introduced-by:` lines name; a `fix(revert)` session
// undo is skipped, and --case adds a pair traced by hand. --limit takes up to
// 6 cases, the default: mined cases first, newest fix first, then the --case
// pairs. --clean takes up to 2 commits, the default, to measure noise:
// first-parent commits older than 30 days, neither a fix nor a revert, that
// change code and that no `Introduced-by:` line names.
//
// Each case's introducing commit and each clean commit gets a packet under
// --dir: a prompt asking for a read-only review of the change, with its
// message, its diff and its plan, and one seats.mjs round. The diff leaves out
// the plans folder, which holds the original panel's rows on the change, and
// the reviewPaths.skip globs; a diff still over 200,000 characters is cut, and
// the prompt then lists every changed path. The seats run in a temp
// repository of two commits, the change's parent and then the change, with no
// plans folder, no other history and no link to the project's git directory.
// Each seat runs read-only and offline: no web search, no MCP server or
// connector, and for Codex no user config. A seat can still read any other
// folder by absolute path, which its prompt forbids. The project's maxEffort
// caps each seat.
//
// A seat whose answer holds the fix's sha, 7 characters or more, or its
// subject line, is leaked for that case. One Opus judge per packet reads the
// other answers as cand-1 to cand-n and says whether each named the defect the
// fix repaired, quoting it, or, for a clean commit, whether each critical
// finding is real. A judge answer without one parsable JSON block, or a catch
// whose quote is not in that seat's answer, leaves the seat unjudged. Each
// seat's recall counts only the cases every seat was judged on. The report
// goes to <dir>/replay.md and stdout and names each seat at the model and
// effort it ran at. --dry-run writes the prompts and prints the plan with each
// prompt's size, and builds no copy and starts no seat or judge.

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ask, GIVE_UP_MS, onStop, STOP_GRACE_MS } from './cross.mjs';

const USAGE =
  'Usage: node .agents/pstack/replay.mjs --dir <run dir> --seat <name>=<claude|codex>:<model>@<effort>... [--case <introducing sha>:<fix sha>]... [--limit <n>] [--clean <n>] [--timeout <seconds>] [--dry-run]';
const SEAT = /^([\w-]+)=(claude|codex):([^@\s]+)@(\w+)$/u;
const PAIR = /^([\da-f]{7,40}):([\da-f]{7,40})$/iu;
const FIX = /^fix(\([^()\s]+\))?!?: /u;
const REVERT = /^(?:revert(\([^()\s]+\))?!?: |Revert ")/u;
const SESSION_REVERT = /^fix\(revert\)!?: /u;
const INTRODUCED = /^Introduced-by: [ \t]*(\S+)[ \t]*$/gmu;
const PLAN = /^Plan: (\S+)/mu;
const NOT_CODE = /\.(?:mdx?|tsv)$/iu;
const SHA = /\b[\da-f]{7,40}\b/giu;
const MAX_CASES = 6;
const MAX_CLEAN = 2;
const CLEAN_AGE = 30 * 86_400_000;
const CLEAN_SEARCH = 200;
const SHOW_LIMIT = 200_000;
const TIME_BUDGET = 3600;
const FETCH_TIMEOUT = 120;
const COPY_SECONDS = 60;
const SETUP_ALLOWANCE = (MAX_CASES + MAX_CLEAN) * COPY_SECONDS;
const JUDGE_TIMEOUT = 600;
const REPORT_SECONDS = 14;
const SEAT_TIMEOUT_MAX = TIME_BUDGET - FETCH_TIMEOUT - SETUP_ALLOWANCE - JUDGE_TIMEOUT - (2 * GIVE_UP_MS) / 1000 - REPORT_SECONDS;
const ROUND_STOP_MS = STOP_GRACE_MS + 5000;
const HERE = dirname(fileURLToPath(import.meta.url));

class Refusal extends Error {}

const rounds = new Set();
let stopped = false;

const git = (args, cwd, timeout) => spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 1 << 28, timeout: timeout && timeout * 1000 });
const must = (args, cwd, timeout) => {
  const run = git(args, cwd, timeout);
  if (run.status !== 0) throw new Refusal(`git ${args.join(' ')} failed: ${run.error?.code === 'ETIMEDOUT' ? `no answer within ${timeout} seconds` : run.stderr.trim()}`);
  return run.stdout.trim();
};
const short = (sha) => sha.slice(0, 10);
const squash = (text) => text.replace(/\s+/gu, ' ').trim();

function parse(argv) {
  const options = { seats: [], pairs: [], limit: MAX_CASES, clean: MAX_CLEAN, timeout: 1800, dryRun: false };
  const count = (value, max) => (/^\d+$/u.test(value ?? '') && Number(value) <= max ? Number(value) : NaN);
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];
    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }
    index += 1;
    if (value === undefined) throw new Refusal(`${arg} needs a value\n${USAGE}`);
    if (arg === '--dir') options.dir = resolve(value);
    else if (arg === '--seat') {
      const match = value.match(SEAT);
      if (!match && !value.includes('@')) throw new Refusal(`name each seat's effort as the panel runs it, such as opus=claude:opus@xhigh: ${value}\n${USAGE}`);
      if (!match || options.seats.some((seat) => seat.name === match[1])) throw new Refusal(`${match ? 'seat name given twice' : 'bad seat'}: ${value}\n${USAGE}`);
      options.seats.push({ name: match[1], spec: value });
    } else if (arg === '--case') {
      const match = value.match(PAIR);
      if (!match) throw new Refusal(`bad case ${value}: give <introducing sha>:<fix sha>\n${USAGE}`);
      options.pairs.push({ intro: match[1], fix: match[2] });
    } else if (arg === '--limit') options.limit = count(value, MAX_CASES);
    else if (arg === '--clean') options.clean = count(value, MAX_CLEAN);
    else if (arg === '--timeout') options.timeout = Number(value);
    else throw new Refusal(USAGE);
  }
  if (!options.dir || options.seats.length === 0) throw new Refusal(USAGE);
  if (!(options.limit >= 1)) throw new Refusal(`--limit takes 1 to ${MAX_CASES}, so a run fits the hour\n${USAGE}`);
  if (!(options.clean >= 0)) throw new Refusal(`--clean takes 0 to ${MAX_CLEAN}\n${USAGE}`);
  if (!(options.timeout > 0 && options.timeout <= SEAT_TIMEOUT_MAX)) {
    throw new Refusal(`--timeout takes 1 to ${SEAT_TIMEOUT_MAX} seconds, so the fetch, the copies, the seats and the judge fit the hour\n${USAGE}`);
  }
  return options;
}

function project(root) {
  const config = JSON.parse(readFileSync(join(root, '.agents/pstack.json'), 'utf8'));
  if (!config.branch) throw new Refusal('.agents/pstack.json names no branch');
  const plans = config.plans ?? 'docs/plans';
  const copy = ['.', `:(exclude)${plans}`];
  return { branch: config.branch, plans, copy, review: [...copy, ...(config.reviewPaths?.skip ?? []).map((glob) => `:(glob,exclude)${glob}`)] };
}

function trunk(root, branch) {
  const push = git(['config', '--get', 'pstack.delivery'], root).stdout.trim() === 'push';
  const remote = !push && git(['remote', 'get-url', 'upstream'], root).status === 0 ? 'upstream' : 'origin';
  must(['fetch', '--quiet', remote, `+refs/heads/${branch}:refs/remotes/${remote}/${branch}`], root, FETCH_TIMEOUT);
  return { name: `${remote}/${branch}`, tip: must(['rev-parse', `refs/remotes/${remote}/${branch}`], root) };
}

function select(root, branch, options, paths) {
  const resolveCommit = (rev) => {
    const run = git(['rev-parse', '--verify', '--quiet', `${rev}^{commit}`], root);
    return run.status === 0 ? run.stdout.trim() : null;
  };
  const ancestor = (older, newer) => git(['merge-base', '--is-ancestor', older, newer], root).status === 0;
  const subject = (sha) => must(['log', '-1', '--format=%s', sha], root);

  const explicit = options.pairs.map(({ intro, fix }) => {
    const [introSha, fixSha] = [resolveCommit(intro), resolveCommit(fix)];
    for (const [rev, sha] of [[intro, introSha], [fix, fixSha]]) {
      if (!sha || !ancestor(sha, branch.tip)) throw new Refusal(`--case ${intro}:${fix}: ${rev} is not a commit on ${branch.name}`);
    }
    if (introSha === fixSha || !ancestor(introSha, fixSha)) throw new Refusal(`--case ${intro}:${fix}: ${intro} is not an ancestor of ${fix}`);
    return { intro: introSha, fix: fixSha };
  });

  const named = new Set(explicit.map((pair) => pair.intro));
  const mined = [];
  const skipped = [];
  const log = must(['log', '--first-parent', '--format=%H%x1f%s%x1f%B%x1e', '--grep=^Introduced-by: ', branch.tip], root);
  for (const record of log.split('\x1e')) {
    const [fix, title, body] = record.trim().split('\x1f');
    if (!fix) continue;
    const undo = SESSION_REVERT.test(title);
    if (undo) skipped.push(`${short(fix)} reverts a session, which names no single defect`);
    for (const [, name] of body.matchAll(INTRODUCED)) {
      if (name === 'none') continue;
      const intro = resolveCommit(name);
      if (intro) named.add(intro);
      if (!FIX.test(title) || undo) continue;
      if (intro && intro !== fix && ancestor(intro, fix)) mined.push({ intro, fix });
      else skipped.push(`${short(fix)} names ${name}, which is not a commit before it on ${branch.name}`);
    }
  }

  const seen = new Set();
  const cases = [...mined, ...explicit].filter((pair) => {
    const key = `${pair.intro}:${pair.fix}`;
    return !seen.has(key) && seen.add(key);
  });
  if (cases.length === 0) throw new Refusal(`no case: no fix commit on ${branch.name} names the commit that introduced its bug, and no --case was given`);

  const cleans = [];
  const before = new Date(Date.now() - CLEAN_AGE).toISOString();
  const history = options.clean === 0 ? '' : must(['log', '--first-parent', '--diff-merges=first-parent', '--name-only', '--format=%x1e%H%x1f%s', `--before=${before}`, '-n', String(CLEAN_SEARCH), branch.tip, '--', ...paths.review], root);
  for (const record of history.split('\x1e')) {
    if (cleans.length === options.clean) break;
    const [head, ...files] = record.trim().split('\n').filter(Boolean);
    const [sha, title] = (head ?? '').split('\x1f');
    if (sha && !named.has(sha) && !FIX.test(title) && !REVERT.test(title) && files.some((file) => !NOT_CODE.test(file))) cleans.push(sha);
  }

  return {
    packets: [
      ...cases.slice(0, options.limit).map(({ intro, fix }) => ({ id: `case-${short(intro)}-${short(fix)}`, kind: 'case', sha: intro, fix, subject: subject(fix) })),
      ...cleans.map((sha) => ({ id: `clean-${short(sha)}`, kind: 'clean', sha, subject: subject(sha) })),
    ],
    left: Math.max(0, cases.length - options.limit),
    skipped,
  };
}

function change(root, sha, paths, rest) {
  const show = (format, pathspec) => {
    const run = git(['show', '--no-color', '--format=', '--diff-merges=first-parent', ...format, sha, '--', ...pathspec], root);
    if (run.status !== 0) throw new Refusal(`git show ${short(sha)} failed: ${run.stderr.trim()}`);
    return run.stdout.trimEnd();
  };
  const diff = show([], paths.review);
  if (diff.length <= SHOW_LIMIT) return `<diff>\n${diff}\n</diff>`;
  const stat = show(['--stat=1000,1000', '--stat-graph-width=10'], paths.copy);
  return [
    `The diff is over ${SHOW_LIMIT} characters, so it is cut. ${rest} These are the paths it changes:`,
    `<stat>\n${stat}\n</stat>`,
    `<diff>\n${diff.slice(0, SHOW_LIMIT)}\n[cut at ${SHOW_LIMIT} characters]\n</diff>`,
  ].join('\n\n');
}

function snapshot(root, sha, plans) {
  const tree = mkdtempSync(join(tmpdir(), 'pstack-replay-'));
  try {
    const copy = (args) => must(['-c', 'core.autocrlf=false', '-c', 'core.hooksPath=/dev/null', '-c', 'commit.gpgsign=false', '-c', 'user.name=replay', '-c', 'user.email=replay@localhost', ...args], tree);
    const parent = git(['rev-parse', '--verify', '--quiet', `${sha}^`], root).stdout.trim();
    copy(['init', '--quiet']);
    if (parent) {
      const tar = join(tree, '.snapshot.tar');
      must(['archive', '--format=tar', `--output=${tar}`, parent], root);
      const untar = spawnSync('tar', ['-xf', tar, '-C', tree], { encoding: 'utf8' });
      if (untar.status !== 0) throw new Refusal(`tar could not unpack ${short(parent)}: ${untar.stderr.trim()}`);
      unlinkSync(tar);
      rmSync(join(tree, plans), { recursive: true, force: true });
      copy(['add', '--all']);
    }
    copy(['commit', '--quiet', '--no-verify', '--allow-empty', '-m', 'the parent of the change under review']);
    const patch = join(tree, '.snapshot.patch');
    must(['diff', '--binary', `--output=${patch}`, parent || must(['hash-object', '-t', 'tree', '/dev/null'], root), sha, '--', '.', `:(exclude)${plans}`], root);
    if (statSync(patch).size > 0) copy(['apply', '--index', patch]);
    unlinkSync(patch);
    copy(['commit', '--quiet', '--no-verify', '--allow-empty', '-m', must(['log', '-1', '--format=%B', sha], root)]);
    return tree;
  } catch (error) {
    rmSync(tree, { recursive: true, force: true });
    throw error;
  }
}

function reviewPrompt(root, sha, paths) {
  const message = must(['log', '-1', '--format=%B', sha], root);
  const plan = message.match(PLAN)?.[1];
  const planText = plan ? git(['show', `${sha}:${plan}`], root) : null;
  return [
    'Review the change that the last commit in your working directory made. Your working directory is a copy of the repository with two commits, the change\'s parent and then the change, so `git show HEAD` is the whole change and `git show HEAD~1:<path>` reads a file as it stood before it. Review only that folder, as if the change had just landed: never read any other folder, checkout or repository.',
    'This is a read-only review. Change no file, and for any command that would write, write "not run" and the command instead of running it.',
    'Report every finding with its severity, critical, warning or nit. Critical is a defect that breaks behavior, loses data, opens a security hole, or lets a check or test pass when it should fail. Give each as `path:line`, its severity, and the defect in a sentence or two. With none, say "No findings."',
    `<message>\n${message}\n</message>`,
    change(root, sha, paths, 'The full diff is `git show HEAD` in your working directory.'),
    ...(plan ? [planText.status === 0 ? `The plan its Plan: line names, ${plan}, as it read at that commit:\n\n<plan>\n${planText.stdout.trim()}\n</plan>` : `Its Plan: line names ${plan}, which does not exist at that commit.`] : []),
  ].join('\n\n');
}

function judgePrompt(root, packet, answers, paths) {
  const seats = answers.map(({ label, text }) => `<answer id="${label}">\n${text}\n</answer>`).join('\n\n');
  const keys = answers.map(({ label }) => label).join(', ');
  const commit = (sha) => `<message>\n${must(['log', '-1', '--format=%B', sha], root)}\n</message>\n\n${change(root, sha, paths, `The full diff is \`git show ${sha}\` in your working directory.`)}`;
  return packet.kind === 'case'
    ? [
        `You judge one replay of a code review. Commit ${packet.sha} introduced a defect, and commit ${packet.fix} later repaired it. The fix's message and diff follow, then each reviewer's answer about commit ${packet.sha}, labelled cand-1 to cand-${answers.length}. The reviewers saw only commit ${packet.sha}.`,
        "For each answer, decide whether it names the defect the fix repaired: the same flaw in the same code, not only the same file or another problem nearby. Quote the answer's passage that names it word for word, or give an empty quote.",
        `<fix>\n${commit(packet.fix)}\n</fix>`,
        seats,
        `End with one fenced json block whose keys are the labels ${keys}, in this shape:\n\n\`\`\`json\n{"<label>": {"caught": true, "quote": "<the passage>"}}\n\`\`\``,
      ].join('\n\n')
    : [
        `You judge one replay of a code review. Commit ${packet.sha}'s message and diff follow, then each reviewer's answer about it, labelled cand-1 to cand-${answers.length}.`,
        'For each critical finding an answer raised, decide whether it is a real defect in that change, and give the reason.',
        `<commit>\n${commit(packet.sha)}\n</commit>`,
        seats,
        `End with one fenced json block whose keys are the labels ${keys}, each holding a list with one entry per critical finding, empty when the answer raised none, in this shape:\n\n\`\`\`json\n{"<label>": [{"finding": "<the finding>", "real": false, "reason": "<why>"}]}\n\`\`\``,
      ].join('\n\n');
}

function verdicts(packet, answers, text) {
  const block = [...(text ?? '').matchAll(/```json[ \t]*\n([\s\S]*?)\n```/gu)].at(-1);
  let value = null;
  try {
    value = block ? JSON.parse(block[1]) : null;
  } catch {}
  return Object.fromEntries(
    answers.map(({ name, label, text: answer }) => {
      const entry = value?.[label];
      if (packet.kind === 'case') {
        if (typeof entry?.caught !== 'boolean') return [name, 'unjudged'];
        if (!entry.caught) return [name, 'missed'];
        const quote = typeof entry.quote === 'string' ? squash(entry.quote) : '';
        return [name, quote && squash(answer).includes(quote) ? 'caught' : 'unjudged'];
      }
      const valid = Array.isArray(entry) && entry.every((finding) => typeof finding?.real === 'boolean');
      return [name, valid ? { real: entry.filter((finding) => finding.real).length, total: entry.length } : 'unjudged'];
    }),
  );
}

function leaked(packet, text) {
  if (packet.kind !== 'case') return false;
  return (text.match(SHA) ?? []).some((token) => packet.fix.startsWith(token.toLowerCase())) || squash(text).toLowerCase().includes(squash(packet.subject).toLowerCase());
}

// A stopped round never resolves, so no judge starts after a stop.
function seatRound(root, packet, options) {
  return new Promise((done) => {
    const args = [join(HERE, 'seats.mjs'), '--dir', packet.answers, '--prompt-file', packet.prompt, '--timeout', String(options.timeout), '--offline', '--effort-root', root, ...options.seats.map((seat) => seat.spec)];
    const child = spawn(process.execPath, args, { cwd: packet.tree, stdio: ['ignore', 'pipe', 'pipe'] });
    rounds.add(child);
    let output = '';
    child.stdout.on('data', (chunk) => (output += chunk));
    child.stderr.on('data', (chunk) => (output += chunk));
    child.on('error', (error) => done(error.message));
    child.on('close', () => {
      rounds.delete(child);
      if (!stopped) done(output);
    });
  });
}

async function stopRounds() {
  stopped = true;
  const children = [...rounds];
  const live = () => children.filter((child) => child.exitCode === null && child.signalCode === null);
  for (const child of children) child.kill('SIGTERM');
  const deadline = Date.now() + ROUND_STOP_MS;
  while (live().length > 0 && Date.now() < deadline) await new Promise((wake) => setTimeout(wake, 100));
  for (const child of live()) child.kill('SIGKILL');
}

async function replay(root, packet, options, paths) {
  const log = await seatRound(root, packet, options);
  writeFileSync(join(packet.dir, 'seats.log'), log);
  if (packet.tree) rmSync(packet.tree, { recursive: true, force: true });
  packet.tree = null;
  const read = (name, extension) => {
    const file = join(packet.answers, `${name}.${extension}`);
    return existsSync(file) ? readFileSync(file, 'utf8').trim() : '';
  };
  const answers = options.seats.map(({ name }) => ({ name, text: read(name, 'md') }));
  packet.ran = Object.fromEntries(options.seats.map(({ name }) => [name, read(name, 'err').match(/^seat: (.+)$/mu)?.[1]]));
  const settled = Object.fromEntries(answers.flatMap(({ name, text }) => (!text ? [[name, 'failed']] : leaked(packet, text) ? [[name, 'leaked']] : [])));
  const judged = answers.filter(({ name }) => !settled[name]).map((answer, index) => ({ ...answer, label: `cand-${index + 1}` }));
  if (judged.length === 0) return settled;
  const judge = await ask('claude', judgePrompt(root, packet, judged, paths), { cwd: root, model: 'opus', timeout: JUDGE_TIMEOUT }).catch((error) => ({ ok: false, text: error.message }));
  writeFileSync(join(packet.dir, 'judge.md'), `${judge.ok ? '' : 'judge failed: '}${judge.text}\n${judged.map(({ name, label }) => `${label}: ${name}`).join('\n')}\n`);
  return { ...verdicts(packet, judged, judge.ok ? judge.text : null), ...settled };
}

function report(branch, options, selection, results) {
  const cases = selection.packets.filter((packet) => packet.kind === 'case');
  const cleans = selection.packets.filter((packet) => packet.kind === 'clean');
  const verdict = (packet, name) => results.get(packet.id)[name];
  const shared = cases.filter((packet) => options.seats.every(({ name }) => ['caught', 'missed'].includes(verdict(packet, name))));
  const ran = (name) => [...new Set(selection.packets.map((packet) => packet.ran?.[name]).filter(Boolean))].join(' / ') || 'not run';
  const rows = options.seats.map(({ name }) => {
    const tally = (value) => cases.filter((packet) => verdict(packet, name) === value).length;
    const caught = shared.filter((packet) => verdict(packet, name) === 'caught').length;
    const findings = cleans.map((packet) => verdict(packet, name)).filter((value) => typeof value === 'object');
    const real = findings.reduce((sum, value) => sum + value.real, 0);
    const total = findings.reduce((sum, value) => sum + value.total, 0);
    const clean = `${real} of ${total}${cleans.length - findings.length ? `, ${cleans.length - findings.length} commits not judged` : ''}`;
    return `| ${name} | ${ran(name)} | ${caught} of ${shared.length} | ${tally('failed')} | ${tally('unjudged')} | ${tally('leaked')} | ${clean} |`;
  });
  const describe = (value) => (typeof value === 'object' ? `${value.real} of ${value.total} real` : value);
  const line = (packet) => {
    const seats = options.seats.map(({ name }) => `${name} ${describe(verdict(packet, name))}`).join(', ');
    return packet.kind === 'case' ? `- ${short(packet.sha)} -> ${short(packet.fix)} ${packet.subject}: ${seats}` : `- ${short(packet.sha)} ${packet.subject}: ${seats}`;
  };
  return [
    '# Review replay',
    '',
    `${branch.name} at ${short(branch.tip)}. Seats as they ran: ${options.seats.map(({ name }) => `${name} ${ran(name)}`).join(', ')}. Cases every seat was judged on: ${shared.length} of ${cases.length}.${selection.left ? ` Cases left past --limit: ${selection.left}.` : ''}`,
    '',
    '| Seat | Ran as | Caught on the cases every seat was judged on | Failed | Unjudged | Leaked | Clean findings judged real |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...rows,
    '',
    '## Cases',
    '',
    ...cases.map(line),
    ...(cleans.length ? ['', '## Clean commits', '', ...cleans.map(line)] : []),
    ...(selection.skipped.length ? ['', '## Skipped Introduced-by lines', '', ...selection.skipped.map((text) => `- ${text}`)] : []),
    '',
  ].join('\n');
}

async function main(argv) {
  const options = parse(argv);
  const root = must(['rev-parse', '--show-toplevel'], process.cwd());
  const paths = project(root);
  const branch = trunk(root, paths.branch);
  const selection = select(root, branch, options, paths);
  for (const packet of selection.packets) {
    packet.dir = join(options.dir, packet.id);
    if (existsSync(packet.dir)) throw new Refusal(`${packet.dir} exists; give a new --dir`);
  }
  for (const packet of selection.packets) {
    mkdirSync(packet.dir, { recursive: true });
    packet.prompt = join(packet.dir, 'prompt.md');
    packet.answers = join(packet.dir, 'answers');
    writeFileSync(packet.prompt, `${reviewPrompt(root, packet.sha, paths)}\n`);
  }
  if (options.dryRun) {
    const size = (packet) => `${packet.prompt}, ${readFileSync(packet.prompt, 'utf8').length} characters`;
    const lines = selection.packets.map((packet) => (packet.kind === 'case' ? `case ${short(packet.sha)} -> ${short(packet.fix)} ${packet.subject}: ${size(packet)}` : `clean ${short(packet.sha)} ${packet.subject}: ${size(packet)}`));
    const cases = selection.packets.filter((packet) => packet.kind === 'case').length;
    console.info(
      [
        `Dry run on ${branch.name} at ${short(branch.tip)}: cases ${cases}, clean commits ${selection.packets.length - cases}, seats ${options.seats.map((seat) => seat.spec).join(', ')}, ${options.timeout} s per seat round. No copy was built and no seat or judge ran.`,
        ...lines,
        ...(selection.left ? [`Cases left past --limit: ${selection.left}.`] : []),
        ...selection.skipped.map((text) => `skipped: ${text}`),
      ].join('\n'),
    );
    return 0;
  }
  const results = new Map();
  const removeTrees = () => {
    for (const packet of selection.packets.filter((each) => each.tree)) {
      rmSync(packet.tree, { recursive: true, force: true });
      packet.tree = null;
    }
  };
  onStop(async () => {
    await stopRounds();
    removeTrees();
  });
  try {
    for (const packet of selection.packets) packet.tree = snapshot(root, packet.sha, paths.plans);
    await Promise.all(selection.packets.map(async (packet) => results.set(packet.id, await replay(root, packet, options, paths))));
  } catch (error) {
    await stopRounds();
    throw error;
  } finally {
    removeTrees();
  }
  const text = report(branch, options, selection, results);
  writeFileSync(join(options.dir, 'replay.md'), text);
  console.info(text.trim());
  return 0;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (error) => {
      console.error(`replay.mjs: ${error.message}`);
      process.exit(error instanceof Refusal && error.message.endsWith(USAGE) ? 2 : 1);
    },
  );
}
