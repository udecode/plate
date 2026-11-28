#!/usr/bin/env node
// Runs Local CI: every check step on the newest origin/next, including
// the ones a landing leaves out, one run at a time. A launchd job starts it
// every 20 minutes; a run that finds next unchanged or another run going
// exits at once. Once a day the first run after 04:00 is the full fresh run.
// The owner's Mac is the main CI and checks every step; another teammate's
// Mac checks the steps its config.json names. A red step is rerun alone,
// its first bad commit is searched for from the last commit that step passed
// on while the hour lasts, and the result goes to events.jsonl, never to the
// team channel (owner's word, 2026-11-17).
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { homedir, loadavg, userInfo } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import {
  installLockfile,
  INTERRUPTED,
  lockfileInstalled,
  STEP_LOG,
} from './check-steps.mjs';
import {
  appendLocalCiEvent,
  classifyLocalCiChanges,
  frictionCommand,
  FULL_RUN_HOUR,
  localCiFiles,
  localCiRedSince,
  readLocalCiEvents,
  readLocalCiState,
  searchFirstBad,
  settleCheckCommand,
  startsBrokenStreak,
} from './local-ci-events.mjs';
import {
  isSplit,
  newPrivateFiles,
  pairedCommit,
  PRIVATE_DIR,
} from './private-files.mjs';
import {
  dueRecurrences,
  recurrenceOffer,
  reportsRun,
  runsOf,
} from './red-recurrence.mjs';
import { failuresOf, stepOutput } from './step-failures.mjs';

const USAGE = `Usage: node tooling/scripts/local-ci.mjs <command>
  run        check the newest origin/next unless it was checked
             --full     the daily fresh run, with --build --browser --reads on main
             --ref <sha> --green <sha>   check <sha>, searching back to <sha>
             --step <name>   run one step instead of this Mac's steps
             --force    check next again although it has not moved
             --dry      write the event only: no ref push or task
  status     the last run, the last green commit, this Mac's steps and the
             latest events
  wait       block until an event the operator acts on, print it and exit
             --after <iso time>   only events written after that time
  settle-check  judge which threads can be settled against state.tip
             [--stdin | --session <id>...] [--ref <ref>]
  friction   queue what got in a zbot session's way for the operator;
             friction alone prints its commands
  install    start the launchd job that runs it every 20 minutes, as the
             main CI that checks every step
             --steps <name,name>   as a Mac other than main that checks only
                        these steps
  uninstall  stop and remove that job`;

const LABEL = 'dev.plate.local-ci';
const INTERVAL_SECONDS = 1200;
const BUDGET_MS = 55 * 60_000;
const FULL_ARGS = ['--build', '--browser', '--reads'];
const FLAKE_LOAD = 20;
const GREEN_REF = 'refs/pstack/local-ci-green';
const POLL_MS = 5000;

const here = dirname(fileURLToPath(import.meta.url));
const git = (cwd, args) =>
  spawnSync('git', args, { cwd, encoding: 'utf-8', maxBuffer: 64 << 20 });
const must = (cwd, args) => {
  const result = git(cwd, args);
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')}: ${result.stderr.trim()}`);
  }
  return result.stdout.trim();
};
const common = must(here, [
  'rev-parse',
  '--path-format=absolute',
  '--git-common-dir',
]);
const main = dirname(common);
const { home, state: statePath, events: eventsPath } = localCiFiles(common);
const configPath = join(home, 'config.json');
const lockDir = join(home, 'lock');
const worktree = join(main, '.claude', 'worktrees', 'local-ci');
const plist = join(homedir(), 'Library', 'LaunchAgents', `${LABEL}.plist`);

const readState = () => readLocalCiState(common);
const writeState = (state) =>
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);

const valueOf = (args, name) => {
  const at = args.indexOf(name);
  return at === -1 ? undefined : args[at + 1];
};
const myEmail = () => git(main, ['config', 'user.email']).stdout.trim();
// The steps a Mac other than main checks, which install --steps writes. A Mac
// with no config.json is main.
const configSteps = () =>
  existsSync(configPath)
    ? JSON.parse(readFileSync(configPath, 'utf-8')).steps
    : undefined;
// check.mjs loads npm packages. Only a Mac that names its steps loads it, so
// main's runner still starts and reports a broken event while its worktree's
// install is broken.
const checkModule = () => import('./check.mjs');
const stepsFlag = async (args) => {
  if (!args.includes('--steps')) return {};
  const { steps } = await checkModule();
  const names = (valueOf(args, '--steps') ?? '').split(',').filter(Boolean);
  const unknown = names.filter(
    (name) => !steps.some((step) => step.name === name)
  );
  if (names.length === 0 || unknown.length > 0) {
    return {
      error: `[local-ci] ${unknown.length > 0 ? `unknown step: ${unknown.join(', ')}` : '--steps names no step'}. Run pnpm check --list.`,
    };
  }
  if (!myEmail()) {
    return {
      error: `[local-ci] --steps needs git config user.email in ${main}, which a red's culprit is judged against.`,
    };
  }
  return { names };
};
const mainSteps = async () => {
  const { deepSteps, selectSteps } = await checkModule();
  return new Set(
    [...deepSteps, ...selectSteps(FULL_ARGS)].map((step) => step.name)
  );
};
const readEvents = () => readLocalCiEvents(common);
const appendEvent = (event) => {
  const line = appendLocalCiEvent(common, event);
  console.info(`[local-ci] ${line.kind} ${line.step ?? ''} ${line.tip}`);
  return line;
};

const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};
const takeLock = () => {
  try {
    mkdirSync(lockDir);
  } catch {
    const holder = Number(readFileSync(join(lockDir, 'pid'), 'utf-8'));
    if (alive(holder)) return holder;
    rmSync(lockDir, { force: true, recursive: true });
    mkdirSync(lockDir);
  }
  writeFileSync(join(lockDir, 'pid'), String(process.pid));
  return null;
};

const node = (cwd, args, env = {}) =>
  spawnSync(process.execPath, args, {
    cwd,
    encoding: 'utf-8',
    env: { ...process.env, ...env },
    maxBuffer: 64 << 20,
  });

// attach keeps the private files a worktree already has, as a session's
// own work, so this worktree's private files would stay at the commit it
// was first made for. Nobody works here, so they move with the commit.
const movePrivateFiles = () => {
  must(worktree, [
    `--git-dir=${readFileSync(join(worktree, '.git-private'), 'utf-8')
      .replace(/^gitdir: /u, '')
      .trim()}`,
    `--work-tree=${worktree}`,
    'reset',
    '--quiet',
    '--hard',
  ]);
  for (const file of newPrivateFiles(worktree)) {
    rmSync(join(worktree, file));
  }
};

// Moves the Local CI worktree to `sha`, its private half to the commit that
// landed with it, and installs what that commit's lockfile names.
const checkout = (sha) => {
  if (existsSync(worktree)) {
    must(worktree, ['checkout', '--quiet', '--force', '--detach', sha]);
    node(worktree, ['tooling/scripts/git-private.mjs', 'detach']);
  } else {
    must(main, ['worktree', 'add', '--quiet', '--detach', worktree, sha]);
  }
  for (const args of [
    ['tooling/scripts/git-private.mjs', 'attach'],
    ['.agents/pstack/setup.mjs'],
  ]) {
    const result = node(worktree, args);
    if (result.status !== 0) {
      throw new Error(`${args[0]} at ${sha}: ${result.stdout}${result.stderr}`);
    }
    if (args[0] === 'tooling/scripts/git-private.mjs') movePrivateFiles();
  }
  if (lockfileInstalled(worktree) !== true) {
    const failure = installLockfile(worktree);
    if (failure !== null) throw new Error(`pnpm install at ${sha}: ${failure}`);
  }
  // Every checkout on this Mac shares one Playwright browser cache, and any
  // `playwright install`, at any version, deletes the browsers no live install
  // registered. Installing here registers this worktree, which keeps its
  // Chromium, and puts back one that another install already deleted.
  const browsers = spawnSync('pnpm', ['plite:browser:install', 'chromium'], {
    cwd: worktree,
    encoding: 'utf-8',
    maxBuffer: 64 << 20,
  });
  if (browsers.status !== 0) {
    throw new Error(
      `playwright install at ${sha}: ${browsers.error?.message ?? `${browsers.stdout}${browsers.stderr}`}`
    );
  }
};

const privateHead = () =>
  must(worktree, [
    `--git-dir=${join(worktree, PRIVATE_DIR)}`,
    'rev-parse',
    'HEAD',
  ]);

const runId = (sha, suffix) =>
  `${new Date().toISOString().slice(0, 16).replace(':', '')}-${sha.slice(0, 10)}${suffix ? `-${suffix}` : ''}`;

const REPORT_EVERY_FAILURE = { PLITE_BROWSER_KEEP_GOING: '1' };

const check = (logs, name, args, { full = false } = {}) => {
  const result = node(
    worktree,
    [
      '.agents/pstack/proof.mjs',
      '--dir',
      logs,
      '--name',
      name,
      '--cores',
      '8',
      '--',
      'node',
      'tooling/scripts/check.mjs',
      ...args,
    ],
    {
      ...REPORT_EVERY_FAILURE,
      PLATE_CHECK_RUN: name,
      ...(full ? { FAST_CHECK_SEED: 'random', TURBO_FORCE: 'true' } : {}),
    }
  );
  const lines = existsSync(join(common, STEP_LOG))
    ? readFileSync(join(common, STEP_LOG), 'utf-8')
        .split('\n')
        .filter((line) => line.includes(`"run":"${name}"`))
        .map((line) => JSON.parse(line))
    : [];
  const ended = lines.filter(
    (line) => line.seconds !== undefined && line.exit !== 0
  );
  return {
    // A step skipped on an earlier pass of the same files passes here too.
    passed: lines
      .filter(
        (line) =>
          line.covered !== undefined ||
          (line.seconds !== undefined && line.exit === 0)
      )
      .map((line) => line.step),
    failed: ended
      .filter((line) => line.exit !== INTERRUPTED)
      .map((line) => line.step),
    interrupted: ended
      .filter((line) => line.exit === INTERRUPTED)
      .map((line) => line.step),
    // proof.mjs numbers each attempt's log and prints its path last.
    log:
      /^log: (.+) exit=/mu.exec(result.stdout)?.[1] ??
      join(logs, `${name}-a1.log`),
    ok: result.status === 0,
    output: `${result.stdout}${result.stderr}`.trim().split('\n').slice(-5),
  };
};

const commitInfo = (sha) => {
  const [subject, author, session] = must(main, [
    'log',
    '-1',
    '--format=%s%n%ae%n%(trailers:key=Session,valueonly,separator=)',
    sha,
  ]).split('\n');
  return { author, culprit: sha, session: session || null, subject };
};

const shell = (logs, name, line) => {
  const result = node(
    worktree,
    [
      '.agents/pstack/proof.mjs',
      '--dir',
      logs,
      '--name',
      name,
      '--cores',
      '8',
      '--',
      'bash',
      '-o',
      'pipefail',
      '-c',
      line,
    ],
    REPORT_EVERY_FAILURE
  );
  return {
    log:
      /^log: (.+) exit=/mu.exec(result.stdout)?.[1] ??
      join(logs, `${name}-a1.log`),
    ok: result.status === 0,
  };
};

// Playwright empties its output folder when its next run starts.
const keepFailedResults = (logs, name, since) => {
  const kept = join(logs, `${name}-results`);
  let count = 0;
  for (const app of readdirSync(join(worktree, 'apps'))) {
    const results = join(worktree, 'apps', app, 'test-results');
    if (!existsSync(results)) continue;
    for (const entry of readdirSync(results, {
      recursive: true,
      withFileTypes: true,
    })) {
      if (entry.name !== 'error-context.md') continue;
      if (statSync(join(entry.parentPath, entry.name)).mtimeMs < since) {
        continue;
      }
      const folder = relative(results, entry.parentPath);
      cpSync(entry.parentPath, join(kept, app, folder), { recursive: true });
      count += 1;
    }
  }
  return count > 0 ? kept : null;
};

const stepLog = (log, step) =>
  stepOutput(existsSync(log) ? readFileSync(log, 'utf-8') : '', step);
const readFailures = (log, step) => failuresOf(stepLog(log, step), worktree);
const sameFailures = (lastRed, failing) =>
  failing.every((key) => lastRed.failures.includes(key));

const rerunCommand = (step, files) => {
  const quoted = (list) => list.map((file) => `'${file}'`).join(' ');
  if (['test', 'test-slow'].includes(step)) return `pnpm test ${quoted(files)}`;
  if (
    ['package-tests', 'plite-test'].includes(step) &&
    files.every((file) => /^packages\/(?:platejs|plitejs|test)\//u.test(file))
  ) {
    return `node tooling/scripts/package-tests.mjs ${quoted(files)}`;
  }
  if (
    step === 'plite-browser' &&
    files.every((file) => file.startsWith('apps/plite/'))
  ) {
    return `pnpm --filter plite test:plite-browser:chromium ${quoted(files.map((file) => file.slice('apps/plite/'.length)))}`;
  }
  return null;
};

const resetToTip = (tip) => {
  if (
    !existsSync(worktree) ||
    git(worktree, ['rev-parse', 'HEAD']).stdout.trim() !== tip
  ) {
    checkout(tip);
  } else {
    // A step such as www-build rewrites tracked files, so a step checked after
    // it on the same commit would judge that step's output instead of the
    // commit's.
    must(worktree, ['checkout', '--quiet', '--force', '--detach', tip]);
  }
};

const firstBad = (
  logs,
  step,
  green,
  tip,
  deadline,
  target,
  failedFilesRerun
) => {
  const commits = [
    green,
    ...must(main, [
      'rev-list',
      '--first-parent',
      '--reverse',
      `${green}..${tip}`,
    ]).split('\n'),
  ];
  const fails = (sha) => {
    checkout(sha);
    const name = runId(sha, failedFilesRerun ? `${step}-failed` : step);
    const probe = failedFilesRerun
      ? shell(logs, name, failedFilesRerun)
      : check(logs, name, [step]);
    return (
      !probe.ok &&
      (target.length === 0 ||
        [...readFailures(probe.log, step).keys()].some((key) =>
          target.includes(key)
        ))
    );
  };
  try {
    const found = searchFirstBad(commits, fails, deadline);
    if (found.culprit) return commitInfo(found.culprit);
    return found.failsAtStart
      ? { culprit: null, green: null, range: `..${found.failsAtStart}` }
      : { culprit: null, range: found.range };
  } finally {
    resetToTip(tip);
  }
};

const isRed = (step, event) =>
  event.step === step && ['flake', 'red'].includes(event.kind);
const firstRedAfterRecordedPass = (step) => {
  const runs = readEvents().filter(reportsRun);
  const passedTip = readState().passed?.[step];
  const passedRun = passedTip
    ? runs.findLastIndex((event) => event.tip === passedTip)
    : -1;
  const first = runs.slice(passedRun + 1).find((event) => isRed(step, event));
  return first ? Date.parse(first.at) : Number.POSITIVE_INFINITY;
};
const openStreakStart = (step, tipStillReporting) => {
  const start = streaks(
    readEvents().filter(
      (event) => !tipStillReporting || event.tip !== tipStillReporting
    )
  ).open.get(step);
  return start ? Date.parse(start) : Number.POSITIVE_INFINITY;
};
const redStart = (step, tipStillReporting) =>
  Math.min(
    firstRedAfterRecordedPass(step),
    openStreakStart(step, tipStillReporting)
  );

const report = (event) => localCiRedSince(redStart(event.step, event.tip));

const recordRecurrences = (tip) => {
  for (const due of dueRecurrences({
    events: readEvents(),
    now: Date.now(),
  })) {
    const { files, finding, title } = recurrenceOffer(due, eventsPath);
    appendEvent({
      files,
      finding,
      kind: 'recurrence',
      step: due.step,
      tip,
      title,
      wake: false,
    });
  }
};

const privateOriginTip = (tip) => {
  if (!isSplit(main)) return null;
  return (
    pairedCommit(main, tip) ??
    (git(main, [
      `--git-dir=${join(main, PRIVATE_DIR)}`,
      'rev-parse',
      '--verify',
      '--quiet',
      'origin/next',
    ]).stdout.trim() ||
      null)
  );
};

const changedFilesBetween = (fromTip, toTip, fromPrivate, toPrivate) => {
  const files = new Set();
  if (fromTip !== toTip) {
    const pub = git(main, [
      'diff',
      '--name-only',
      '--no-renames',
      `${fromTip}..${toTip}`,
    ]);
    if (pub.status !== 0) return null;
    for (const file of pub.stdout.split('\n').filter(Boolean)) files.add(file);
  }
  if (isSplit(main)) {
    if (!fromPrivate || !toPrivate) return null;
    if (fromPrivate !== toPrivate) {
      const priv = git(main, [
        `--git-dir=${join(main, PRIVATE_DIR)}`,
        'diff',
        '--name-only',
        '--no-renames',
        `${fromPrivate}..${toPrivate}`,
      ]);
      if (priv.status !== 0) return null;
      for (const file of priv.stdout.split('\n').filter(Boolean)) {
        files.add(file);
      }
    }
  }
  return [...files];
};

// Fetches next in both halves and returns its tip.
const fetchNext = () => {
  must(main, ['fetch', '--quiet', 'origin', 'next']);
  node(main, [
    'tooling/scripts/git-private.mjs',
    'fetch',
    '--quiet',
    'origin',
    'next',
  ]);
  return must(main, ['rev-parse', 'origin/next']);
};

const run = async (args) => {
  const option = (name) => valueOf(args, name);
  const dry = args.includes('--dry');
  const emit = (event) =>
    appendEvent(option('--ref') ? { ...event, offNext: true } : event);
  const brokenAt = (tip, error) => {
    emit({
      kind: 'broken',
      output: error.message.split('\n').slice(-5),
      tip,
      wake: startsBrokenStreak(readEvents()),
    });
    return 1;
  };
  if (option('--step') && !option('--ref')) {
    console.error(
      "[local-ci] --step checks one step, so it needs --ref; a run on next checks this Mac's steps."
    );
    return 1;
  }
  const mine = configSteps();
  const isMain = mine === undefined;
  const mainChecks = isMain ? new Set() : await mainSteps();
  const me = myEmail().toLowerCase();
  const leftToMain = (event) =>
    mainChecks.has(event.step) &&
    me !== '' &&
    Boolean(event.culprit && event.author) &&
    event.author.toLowerCase() !== me;
  const reportRed = (event) => {
    if (leftToMain(event)) {
      return { ...(dry ? { dry } : {}), leftToMain: true, wake: false };
    }
    return { wake: true, ...(dry ? { dry } : report(event)) };
  };
  mkdirSync(home, { recursive: true });
  const holder = takeLock();
  if (holder) {
    console.info(`[local-ci] run ${holder} is still going.`);
    return 0;
  }
  try {
    const started = Date.now();
    const state = readState();
    const tip = option('--ref') ?? fetchNext();
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const full =
      args.includes('--full') ||
      (!option('--ref') &&
        now.getHours() >= FULL_RUN_HOUR &&
        state.fullDay !== today &&
        state.fullTip !== tip);
    const targetPrivateTip = privateOriginTip(tip);
    if (
      !full &&
      !option('--ref') &&
      !args.includes('--force') &&
      tip === state.tip &&
      (!targetPrivateTip ||
        !state.privateTip ||
        targetPrivateTip === state.privateTip)
    ) {
      console.info(`[local-ci] next is still ${tip.slice(0, 10)}.`);
      try {
        resetToTip(tip);
      } catch (error) {
        return brokenAt(tip, error);
      }
      if (!dry && isMain && state.green) {
        spawnSync(process.execPath, [join(here, 'beta-release.mjs'), 'wake'], {
          cwd: main,
          stdio: 'inherit',
        });
      }
      return 0;
    }
    const logs = join(main, 'docs', 'plans', 'artifacts', 'local-ci', today);
    mkdirSync(logs, { recursive: true });
    // Each run on next reports every step still red, so the last run's red
    // events name the steps a landed fix may have cleared since.
    const wasRed = new Map(
      readEvents()
        .filter((event) => event.kind === 'red' && event.tip === state.tip)
        .map((event) => [event.step, event])
    );
    let runMode = 'deep';
    if (
      !full &&
      !option('--ref') &&
      !args.includes('--force') &&
      state.tip &&
      wasRed.size === 0
    ) {
      const prevPrivateTip =
        state.privateTip ??
        (isSplit(main) ? pairedCommit(main, state.tip) : null);
      const changed = changedFilesBetween(
        state.tip,
        tip,
        prevPrivateTip,
        targetPrivateTip
      );
      if (changed) runMode = classifyLocalCiChanges(changed);
    }
    if (runMode === 'md-only') {
      const name = runId(tip, 'md-only');
      const next = {
        ...state,
        lastRun: name,
        lastRunAt: now.toISOString(),
        privateTip: targetPrivateTip,
        tip,
        ...(state.green ? { green: tip } : {}),
      };
      emit({
        kind: 'green',
        skipped: 'md-only',
        tip,
        ...(targetPrivateTip ? { privateTip: targetPrivateTip } : {}),
        ...(isMain && !dry ? { wake: true } : {}),
      });
      if (!dry && isMain) pushGreen(tip);
      writeState(next);
      if (!dry && isMain) {
        spawnSync(process.execPath, [join(here, 'beta-release.mjs'), 'wake'], {
          cwd: main,
          stdio: 'inherit',
        });
      }
      return 0;
    }
    let privateTip;
    try {
      checkout(tip);
      privateTip = privateHead();
    } catch (error) {
      return brokenAt(tip, error);
    }
    const step = option('--step');
    const name = runId(
      tip,
      step ?? (full ? 'full' : runMode === 'affected' ? 'affected' : 'ci')
    );
    const checkStarted = Date.now();
    const checkArgs = step
      ? [step]
      : (mine ??
        (full
          ? FULL_ARGS
          : runMode === 'affected'
            ? ['--affected', '--base', state.tip]
            : ['--deep']));
    const result = check(logs, name, checkArgs, { full });
    const green = option('--green') ?? state.green ?? null;
    const next = {
      ...state,
      lastRun: name,
      lastRunAt: now.toISOString(),
      privateTip,
      tip,
    };
    if (full) Object.assign(next, { fullDay: today, fullTip: tip });
    if (result.ok) {
      emit({
        kind: 'green',
        log: result.log,
        tip,
        ...(isMain && !dry && !option('--ref') ? { wake: true } : {}),
      });
      if (!option('--ref')) next.green = tip;
      // The shared ref claims every step passed, which only main checks.
      if (!dry && !option('--ref') && isMain) pushGreen(tip);
    } else if (result.failed.length === 0 && result.interrupted.length === 0) {
      emit({
        kind: 'broken',
        log: result.log,
        output: result.output,
        tip,
        wake: startsBrokenStreak(readEvents()),
      });
      // A run that checked nothing leaves the tip unchecked, so the next
      // wake tries it again instead of reading it as done.
      if (!option('--ref')) {
        writeState({ ...state, lastRun: name, lastRunAt: now.toISOString() });
      }
      return 1;
    }
    const passing = new Set(result.passed);
    const results = keepFailedResults(logs, name, checkStarted);
    for (const failed of [...result.failed, ...result.interrupted]) {
      const interrupted = result.interrupted.includes(failed);
      const failures = interrupted
        ? new Map()
        : readFailures(result.log, failed);
      const failing = [...failures.keys()];
      const before = wasRed.get(failed);
      const held =
        Array.isArray(before?.failures) &&
        (interrupted ? Boolean(before) : sameFailures(before, failing));
      if (held) {
        const event = {
          author: before.author,
          culprit: before.culprit ?? null,
          failures: interrupted ? before.failures : failing,
          green: before.green ?? null,
          kind: 'red',
          known: true,
          log: result.log,
          privateTip,
          range: before.range,
          session: before.session,
          step: failed,
          subject: before.subject,
          tip,
        };
        emit({ ...event, ...reportRed(event) });
        continue;
      }
      const files = [...new Set(failing.map((key) => failures.get(key).file))];
      const failedFilesRerun =
        files.length > 0 && files.every(Boolean)
          ? rerunCommand(failed, files)
          : null;
      const aloneName = runId(
        tip,
        failedFilesRerun ? `${failed}-failed` : `${failed}-alone`
      );
      resetToTip(tip);
      const aloneStarted = Date.now();
      const alone = failedFilesRerun
        ? shell(logs, aloneName, failedFilesRerun)
        : check(logs, aloneName, [failed], { full });
      const { ok } = alone;
      if (ok && interrupted) {
        passing.add(failed);
        continue;
      }
      const load = loadavg()[0];
      if (ok) {
        const event = {
          kind: 'flake',
          failures: failing,
          load,
          loaded: load > FLAKE_LOAD,
          log: result.log,
          results,
          step: failed,
          tip,
        };
        emit({ ...event, ...(dry ? {} : { wake: true, ...report(event) }) });
        continue;
      }
      // The search starts from the last commit this step passed on, so a
      // step can find its culprit while other steps keep next from going green.
      const from = option('--green') ?? state.passed?.[failed] ?? green;
      const target = [...readFailures(alone.log, failed).keys()];
      let found = { culprit: null, range: tip };
      try {
        if (from && from !== tip) {
          found = firstBad(
            logs,
            failed,
            from,
            tip,
            started + BUDGET_MS,
            target,
            failedFilesRerun
          );
        }
      } catch (error) {
        return brokenAt(tip, error);
      }
      const event = {
        kind: 'red',
        failures: target.length > 0 ? target : failing,
        green: from,
        // A loaded host can time a step out alone too, so the fix run reads
        // the load the alone rerun ended under.
        load,
        loaded: load > FLAKE_LOAD,
        log: alone.log,
        privateTip,
        results: keepFailedResults(logs, aloneName, aloneStarted) ?? results,
        step: failed,
        tip,
        ...found,
      };
      emit({ ...event, ...reportRed(event) });
    }
    if (!option('--ref')) {
      for (const cleared of wasRed.keys()) {
        if (passing.has(cleared) && !dry) {
          emit({
            kind: 'passed',
            step: cleared,
            tip,
            wake: true,
          });
        }
      }
      if (!dry) recordRecurrences(tip);
      next.passed = {
        ...state.passed,
        ...Object.fromEntries([...passing].map((ok) => [ok, tip])),
      };
      writeState(next);
      if (result.ok && !dry && isMain) {
        spawnSync(process.execPath, [join(here, 'beta-release.mjs'), 'wake'], {
          cwd: main,
          stdio: 'inherit',
        });
      }
    }
    return 0;
  } finally {
    rmSync(lockDir, { force: true, recursive: true });
  }
};

// Moves the shared last-green ref forward only, so a run on an older tip
// never takes it back.
const pushGreen = (tip) => {
  const remote = git(main, ['ls-remote', 'origin', GREEN_REF]).stdout.split(
    '\t'
  )[0];
  if (remote) {
    git(main, ['fetch', '--quiet', 'origin', GREEN_REF]);
    if (git(main, ['merge-base', '--is-ancestor', remote, tip]).status !== 0) {
      return;
    }
  }
  git(main, [
    'push',
    '--quiet',
    `--force-with-lease=${GREEN_REF}:${remote ?? ''}`,
    'origin',
    `${tip}:${GREEN_REF}`,
  ]);
};

const streaks = (events) => {
  const open = new Map();
  const closed = [];
  for (const { events: reported } of runsOf(events)) {
    const red = new Map(
      reported
        .filter((event) => ['flake', 'red'].includes(event.kind))
        .map((event) => [event.step, event.at])
    );
    for (const [step, since] of [...open]) {
      if (red.has(step)) continue;
      closed.push({ at: reported[0].at, since, step });
      open.delete(step);
    }
    for (const [step, at] of red) if (!open.has(step)) open.set(step, at);
  }
  return { closed, open };
};
const hoursBetween = (from, to) =>
  (Date.parse(to) - Date.parse(from)) / 3_600_000;
const redFor = (events, now) => {
  const { closed, open } = streaks(events);
  const recent = closed
    .filter(({ at }) => Date.parse(at) > Date.parse(now) - 14 * 86_400_000)
    .map(({ at, since }) => hoursBetween(since, at))
    .toSorted((a, b) => a - b);
  return [
    open.size === 0 ? 'red now: nothing' : 'red now:',
    ...[...open.keys()].map((step) => {
      const since = new Date(redStart(step)).toISOString();
      return `  ${step} since ${since} (${hoursBetween(since, now).toFixed(1)}h)`;
    }),
    recent.length === 0
      ? 'time to green, last 14 days: no red step cleared'
      : `time to green, last 14 days: ${recent.length} cleared, median ${recent[Math.floor(recent.length / 2)].toFixed(1)}h, longest ${recent.at(-1).toFixed(1)}h`,
  ];
};

const status = () => {
  const state = readState();
  const lock = existsSync(join(lockDir, 'pid'))
    ? Number(readFileSync(join(lockDir, 'pid'), 'utf-8'))
    : null;
  const job = spawnSync('launchctl', [
    'print',
    `gui/${userInfo().uid}/${LABEL}`,
  ]);
  console.info(
    [
      `job: ${
        job.status !== 0
          ? 'not installed'
          : existsSync(plist) &&
              readFileSync(plist, 'utf-8').includes('<key>ProcessType</key>')
            ? 'loaded'
            : 'loaded at launchd throttled priority; run install again'
      }`,
      `running: ${lock && alive(lock) ? `pid ${lock}` : 'no'}`,
      `last run: ${state.lastRun ?? 'none'} at ${state.lastRunAt ?? '-'}`,
      `last green: ${state.green ?? 'none'}`,
      `checks: ${configSteps()?.join(', ') ?? 'every step (main CI)'}`,
      `culprits judged against: ${myEmail() || 'nobody, because git config user.email is empty'}`,
      ...redFor(readEvents(), new Date().toISOString()),
      `events: ${eventsPath}`,
      ...readEvents()
        .slice(-5)
        .map(
          (event) =>
            `  ${[event.at, event.kind, event.step, event.culprit ?? event.range ?? event.tip ?? event.id ?? event.item ?? event.reason, event.heldFor && `held for ${event.heldFor}`].filter(Boolean).join(' ')}`
        ),
    ].join('\n')
  );
  return 0;
};

const install = async (args) => {
  const flag = await stepsFlag(args);
  if (flag.error) {
    console.error(flag.error);
    return 1;
  }
  // Each run moves the Local CI worktree to the newest next, so the job runs
  // that copy and a fix to this script reaches it with its landing. The main
  // checkout's copy moves only when someone pulls there.
  const script = join(worktree, 'tooling', 'scripts', 'local-ci.mjs');
  if (!existsSync(script)) checkout(fetchNext());
  mkdirSync(home, { recursive: true });
  if (flag.names) {
    writeFileSync(
      configPath,
      `${JSON.stringify({ steps: flag.names }, null, 2)}\n`
    );
  } else {
    rmSync(configPath, { force: true });
  }
  const escape = (text) =>
    text.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
  const strings = (items) =>
    items.map((item) => `<string>${escape(item)}</string>`).join('');
  // launchd throttles a job with no ProcessType, and Standard is the same: its
  // processes run at priority 20 under the sessions' 31, so a loaded host
  // starves its steps past their hour.
  writeFileSync(
    plist,
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>${LABEL}</string>
<key>ProgramArguments</key><array>${strings([process.execPath, script, 'run'])}</array>
<key>WorkingDirectory</key><string>${escape(main)}</string>
<key>StartInterval</key><integer>${INTERVAL_SECONDS}</integer>
<key>ProcessType</key><string>Interactive</string>
<key>EnvironmentVariables</key><dict><key>PATH</key><string>${escape(process.env.PATH ?? '')}</string><key>HOME</key><string>${escape(homedir())}</string></dict>
<key>StandardOutPath</key><string>${escape(join(home, 'launchd.log'))}</string>
<key>StandardErrorPath</key><string>${escape(join(home, 'launchd.log'))}</string>
</dict></plist>
`
  );
  const domain = `gui/${userInfo().uid}`;
  spawnSync('launchctl', ['bootout', `${domain}/${LABEL}`]);
  const loaded = spawnSync('launchctl', ['bootstrap', domain, plist], {
    encoding: 'utf-8',
  });
  if (loaded.status !== 0) {
    console.error(`[local-ci] launchctl bootstrap: ${loaded.stderr}`);
    return 1;
  }
  console.info(
    `[local-ci] ${LABEL} runs ${script} every ${INTERVAL_SECONDS / 60} minutes and checks ${flag.names?.join(', ') ?? 'every step as the main CI'}.`
  );
  return 0;
};

const uninstall = () => {
  spawnSync('launchctl', ['bootout', `gui/${userInfo().uid}/${LABEL}`]);
  rmSync(plist, { force: true });
  console.info(`[local-ci] removed ${LABEL}.`);
  return 0;
};

// Exits once it prints, because the operator's background command wakes its
// session only when the command exits.
const wait = async (args) => {
  const at = args.indexOf('--after');
  const after = at === -1 ? new Date().toISOString() : args[at + 1];
  for (;;) {
    const fresh = readEvents().filter(
      (event) => event.wake && event.at > after
    );
    if (fresh.length > 0) {
      for (const event of fresh) console.info(JSON.stringify(event));
      return 0;
    }
    await sleep(POLL_MS);
  }
};

const isAncestor = (ancestor, descendant) =>
  ancestor === descendant ||
  git(main, ['merge-base', '--is-ancestor', ancestor, descendant]).status === 0;

const parseCommitLines = (stdout) =>
  stdout
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [sha, rawSessions = ''] = line.split('\u001F');
      return {
        sessions: rawSessions
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        sha,
      };
    });

const listSessionCommits = (state, ref) => {
  const format = '%H%x1f%(trailers:key=Session,valueonly,separator=,)';
  const recent = git(main, ['log', '-n', '50', `--format=${format}`, ref]);
  if (recent.status !== 0) {
    throw new Error(`git log ${ref}: ${recent.stderr.trim()}`);
  }
  const bySha = new Map();
  for (const commit of parseCommitLines(recent.stdout)) {
    bySha.set(commit.sha, commit);
  }
  for (const base of [state.green, state.tip]) {
    if (!base || bySha.has(base) || !isAncestor(base, ref)) continue;
    const range = git(main, ['log', `--format=${format}`, `${base}..${ref}`]);
    if (range.status !== 0) continue;
    for (const commit of parseCommitLines(range.stdout)) {
      if (!bySha.has(commit.sha)) bySha.set(commit.sha, commit);
    }
  }
  return [...bySha.values()];
};

const settleCheck = (args) => {
  const fileCache = new Map();
  const commitFiles = (sha) => {
    if (!fileCache.has(sha)) {
      const result = git(main, [
        'diff-tree',
        '--no-commit-id',
        '--name-only',
        '-r',
        '-m',
        '--first-parent',
        '--root',
        sha,
      ]);
      fileCache.set(
        sha,
        result.status === 0 ? result.stdout.split('\n').filter(Boolean) : []
      );
    }
    return fileCache.get(sha);
  };
  return settleCheckCommand(common, args, {
    commitFiles,
    input: () => readFileSync(0, 'utf-8'),
    isAncestor,
    listCommits: listSessionCommits,
  });
};

const friction = (args) =>
  frictionCommand(common, args, () => readFileSync(0, 'utf-8'));

const commands = {
  friction,
  install,
  run,
  'settle-check': settleCheck,
  status,
  uninstall,
  wait,
};
const [command, ...rest] = process.argv.slice(2);
if (!commands[command]) {
  console.error(USAGE);
  process.exitCode = 1;
} else {
  process.exitCode = await commands[command](rest);
}
