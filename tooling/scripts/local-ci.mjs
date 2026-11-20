#!/usr/bin/env node
// Runs Local CI: every check step on the newest origin/next, including
// the ones a landing leaves out, one run at a time. A launchd job starts it
// every 20 minutes; a run that finds next unchanged or another run going
// exits at once. Once a day the first run after 04:00 is the full fresh run.
// A red step is rerun alone, its first bad commit is searched for from the
// last commit that step passed on while the hour lasts, and the result goes to
// events.jsonl and the suggested-task ledger, never to the team channel
// (owner's word, 2026-11-17). The local-ci skill's watcher reads events.jsonl
// and runs one fix at a time for the red steps.
import { spawnSync } from 'node:child_process';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { homedir, loadavg, userInfo } from 'node:os';
import { dirname, join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import { ledgerPath, readTasks } from '../../.agents/pstack/tasks.mjs';
import {
  installLockfile,
  INTERRUPTED,
  lockfileInstalled,
  STEP_LOG,
} from './check-steps.mjs';
import { newPrivateFiles } from './private-files.mjs';
import {
  clearedHeader,
  EXPECTED_PATH,
  expectedVerdict,
  failureKey,
  failuresOf,
  openExpectedFailures,
  stepOutput,
} from './step-failures.mjs';

const USAGE = `Usage: node tooling/scripts/local-ci.mjs <command>
  run        check the newest origin/next unless it was checked
             --full     the daily fresh run with --build --browser --reads
             --ref <sha> --green <sha>   check <sha>, searching back to <sha>
             --step <name>   run one step instead of every step
             --force    check next again although it has not moved
             --dry      write the event only: no ref push or task
  status     the last run, the last green commit and the latest events
  wait       block until an event the watcher acts on, print it and exit
             --after <iso time>   only events written after that time
  install    start the launchd job that runs it every 20 minutes
  uninstall  stop and remove that job`;

const LABEL = 'dev.plate.local-ci';
const INTERVAL_SECONDS = 1200;
const BUDGET_MS = 55 * 60_000;
const FULL_HOUR = 4;
const FLAKE_LOAD = 20;
const GREEN_REF = 'refs/pstack/local-ci-green';
const FIX_TOPIC = 'local-ci';
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
const home = join(common, 'plate-local-ci');
const statePath = join(home, 'state.json');
const eventsPath = join(home, 'events.jsonl');
const lockDir = join(home, 'lock');
const worktree = join(main, '.claude', 'worktrees', 'local-ci');
const plist = join(homedir(), 'Library', 'LaunchAgents', `${LABEL}.plist`);

const readState = () =>
  existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf-8')) : {};
const writeState = (state) =>
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
const readEvents = () =>
  existsSync(eventsPath)
    ? readFileSync(eventsPath, 'utf-8')
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line))
    : [];
const appendEvent = (event) => {
  const line = { at: new Date().toISOString(), ...event };
  appendFileSync(eventsPath, `${JSON.stringify(line)}\n`);
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
  // setup.mjs installs once per worktree, and this one moves to every new
  // tip, so it installs here when the lockfile differs from the installed one.
  if (lockfileInstalled(worktree) === true) return;
  const failure = installLockfile(worktree);
  if (failure !== null) throw new Error(`pnpm install at ${sha}: ${failure}`);
};

const runId = (sha, suffix) =>
  `${new Date().toISOString().slice(0, 16).replace(':', '')}-${sha.slice(0, 10)}${suffix ? `-${suffix}` : ''}`;

// Runs check.mjs in the Local CI worktree through proof.mjs, so the hour's
// limit and the core pool apply, and reads back which steps failed.
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
  const [subject, session] = must(main, [
    'log',
    '-1',
    '--format=%s%n%(trailers:key=Session,valueonly,separator=)',
    sha,
  ]).split('\n');
  return { culprit: sha, session: session || null, subject };
};

const shell = (logs, name, line) => {
  const result = node(worktree, [
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
  ]);
  return {
    log:
      /^log: (.+) exit=/mu.exec(result.stdout)?.[1] ??
      join(logs, `${name}-a1.log`),
    ok: result.status === 0,
  };
};

const stepLog = (log, step) =>
  stepOutput(existsSync(log) ? readFileSync(log, 'utf-8') : '', step);
const readFailures = (log, step) => {
  const output = stepLog(log, step);
  const failures = failuresOf(output, worktree);
  const listed = new Set(
    openExpectedFailures(worktree)
      .filter((entry) => entry.step === step)
      .map(failureKey)
  );
  return {
    failures,
    listedPassing: output.includes(clearedHeader(step)),
    unexpected: [...failures.keys()].filter((key) => !listed.has(key)),
  };
};
const passes = (run, step, onlyFiles) =>
  run.ok ||
  expectedVerdict({
    onlyFiles,
    output: stepLog(run.log, step),
    root: worktree,
    status: 1,
    step,
  }).status === 0;
const sameRed = (lastRed, { interrupted, unexpected }) =>
  Array.isArray(lastRed?.failures) &&
  (interrupted || unexpected.every((key) => lastRed.failures.includes(key)));

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

// Binary search over next's first-parent commits after `green`, while the
// hour lasts; returns the first bad commit or the range still unsearched.
const firstBad = (logs, step, green, tip, deadline, target) => {
  const commits = must(main, [
    'rev-list',
    '--first-parent',
    '--reverse',
    `${green}..${tip}`,
  ]).split('\n');
  let good = -1;
  let bad = commits.length - 1;
  while (bad - good > 1 && Date.now() < deadline) {
    const mid = Math.floor((good + bad) / 2);
    checkout(commits[mid]);
    const probe = check(logs, runId(commits[mid], step), [step]);
    const failed =
      !probe.ok &&
      (target.length === 0 ||
        [...readFailures(probe.log, step).failures.keys()].some((key) =>
          target.includes(key)
        ));
    if (failed) bad = mid;
    else good = mid;
  }
  return bad - good === 1
    ? commitInfo(commits[bad])
    : {
        culprit: null,
        range: `${good === -1 ? green : commits[good]}..${commits[bad]}`,
      };
};

const where = (event) =>
  event.kind === 'flake'
    ? `once and passing its rerun${event.loaded ? ' under load' : ''}`
    : event.culprit
      ? `since ${event.culprit.slice(0, 10)} (${event.subject})`
      : `somewhere in ${event.range}`;

const ledgerHelper = join(main, '.agents', 'pstack', 'decisions-check.mjs');
const ledger = join(main, ledgerPath('docs/plans', 'trunk'));
const fixTitle = (step) => `Fix the ${step} check that fails on next`;
const openTask = (step) =>
  existsSync(ledger)
    ? [...readTasks(readFileSync(ledger, 'utf-8').split('\n')).values()].find(
        (task) =>
          task.title?.includes(fixTitle(step)) &&
          ['offered', 'started'].includes(task.status)
      )
    : undefined;

// A fix that dies with its session, such as in an app restart, leaves its
// task open with nobody on it.
const CLAIM_MS = 6 * 60 * 60_000;
const claimLive = (task) => {
  const rows = readFileSync(ledger, 'utf-8')
    .split('\n')
    .filter((line) => line.split('\t')[2]?.startsWith(`${task.id} `))
    .map((line) => line.split('\t')[0]);
  const wakes = readEvents()
    .filter((event) => event.wake && event.task === task.id)
    .map((event) => event.at);
  const newest = Math.max(...[...rows, ...wakes].map(Date.parse));
  return Date.now() - newest < CLAIM_MS;
};

const report = (event) => {
  const title = fixTitle(event.step);
  const open = openTask(event.step);
  if (open) {
    return claimLive(open) ? { wake: false } : { task: open.id, wake: true };
  }
  const found = event.cleared
    ? `Local CI found ${event.step} no longer failing on next with failures ${EXPECTED_PATH} lists. Log: ${event.log}, which names them. Remove their lines from the list and land through land.mjs.`
    : event.kind === 'flake'
      ? `Local CI found ${event.step} failing on next ${where(event)}, so a test it names depends on timing or host load. Log: ${event.log}. The newest flake event in ${eventsPath} names its failures. A passing pnpm check ${event.step} does not clear it: remove that dependence, such as a wall-clock bound, a raised timeout or a fixed wait, prove each failing test with five warm runs without retries and land through land.mjs.`
      : `Local CI found ${event.step} failing on next ${where(event)}. Log: ${event.log}. The newest ${event.kind} event in ${eventsPath} names the commits. Reproduce it with pnpm check ${event.step}, fix forward and land through land.mjs.`;
  let id = null;
  if (existsSync(ledger)) {
    id = node(main, [ledgerHelper, 'chips', 'id']).stdout.trim();
    const added = node(main, [
      ledgerHelper,
      'append',
      ledger,
      'chip',
      `${id} ${title}`,
      found,
      // A check that fails on next is P0, and the ledger refuses an offer
      // that names no check it owns or paths it writes.
      `writes: packages, apps, tooling; topic: ${FIX_TOPIC}; kind: fix; priority: P0; owns: ${event.step}; via: hook; session: none`,
      'offered',
    ]);
    if (added.status !== 0) id = null;
  }
  return { task: id, wake: true };
};

// Dismisses a step's offered task once a run on next passes the step, so a
// fix that already landed for another step queues no second fix. A started
// task stays with the session working on it.
const settle = (step, tip) => {
  const task = openTask(step);
  if (!task) return {};
  if (task.status === 'started') return { task: task.id };
  const dismissed = node(main, [
    ledgerHelper,
    'append',
    ledger,
    'chip',
    `${task.id} ${task.title}`,
    `Local CI passed ${step} on next at ${tip.slice(0, 10)}, so a fix already landed`,
    `the run on ${tip} passed ${step}; ${eventsPath} holds its passed event`,
    'dismissed done',
  ]);
  return { dismissed: dismissed.status === 0, task: task.id };
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

const run = (args) => {
  const option = (name) => {
    const at = args.indexOf(name);
    return at === -1 ? undefined : args[at + 1];
  };
  const dry = args.includes('--dry');
  const emit = (event) =>
    appendEvent(option('--ref') ? { ...event, offNext: true } : event);
  if (option('--step') && !option('--ref')) {
    console.error(
      '[local-ci] --step checks one step, so it needs --ref; a run on next checks every step.'
    );
    return 1;
  }
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
        now.getHours() >= FULL_HOUR &&
        state.fullDay !== today &&
        state.fullTip !== tip);
    if (
      !full &&
      !option('--ref') &&
      !args.includes('--force') &&
      tip === state.tip
    ) {
      console.info(`[local-ci] next is still ${tip.slice(0, 10)}.`);
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
    try {
      checkout(tip);
    } catch (error) {
      // The watcher wakes for the first broken run in a row, not each retry.
      emit({
        kind: 'broken',
        output: error.message.split('\n').slice(-5),
        tip,
        wake: readEvents().at(-1)?.kind !== 'broken',
      });
      return 1;
    }
    const step = option('--step');
    const name = runId(tip, step ?? (full ? 'full' : 'ci'));
    const result = check(
      logs,
      name,
      step ? [step] : full ? ['--build', '--browser', '--reads'] : ['--deep'],
      { full }
    );
    const green = option('--green') ?? state.green ?? null;
    const next = { ...state, tip, lastRun: name, lastRunAt: now.toISOString() };
    if (full) Object.assign(next, { fullDay: today, fullTip: tip });
    if (result.ok) {
      emit({ kind: 'green', log: result.log, tip });
      if (!option('--ref')) next.green = tip;
      if (!dry && !option('--ref')) pushGreen(tip);
    } else if (result.failed.length === 0 && result.interrupted.length === 0) {
      emit({
        kind: 'broken',
        log: result.log,
        output: result.output,
        tip,
        wake: readEvents().at(-1)?.kind !== 'broken',
      });
      // A run that checked nothing leaves the tip unchecked, so the next
      // wake tries it again instead of reading it as done.
      if (!option('--ref')) {
        writeState({ ...state, lastRun: name, lastRunAt: now.toISOString() });
      }
      return 1;
    }
    const passing = new Set(result.passed);
    const flaked = new Set();
    for (const failed of [...result.failed, ...result.interrupted]) {
      const interrupted = result.interrupted.includes(failed);
      const { failures, listedPassing, unexpected } = interrupted
        ? { failures: new Map(), listedPassing: false, unexpected: [] }
        : readFailures(result.log, failed);
      if (listedPassing && unexpected.length === 0) {
        const event = {
          cleared: true,
          kind: 'red',
          log: result.log,
          step: failed,
          tip,
        };
        emit({ ...event, ...(dry ? { dry, wake: true } : report(event)) });
        continue;
      }
      const before = wasRed.get(failed);
      if (sameRed(before, { interrupted, unexpected })) {
        const event = {
          culprit: before.culprit ?? null,
          failures: interrupted ? before.failures : unexpected,
          green: before.green ?? null,
          kind: 'red',
          known: true,
          log: result.log,
          range: before.range,
          session: before.session,
          step: failed,
          subject: before.subject,
          tip,
        };
        emit({ ...event, ...(dry ? { dry, wake: true } : report(event)) });
        continue;
      }
      const files = [
        ...new Set(unexpected.map((key) => failures.get(key).file)),
      ];
      const line =
        files.length > 0 && files.every(Boolean)
          ? rerunCommand(failed, files)
          : null;
      const alone = line
        ? shell(logs, runId(tip, `${failed}-failed`), line)
        : check(logs, runId(tip, `${failed}-alone`), [failed], { full });
      const ok = passes(alone, failed, line ? files : undefined);
      if (ok && interrupted) {
        passing.add(failed);
        continue;
      }
      const load = loadavg()[0];
      if (ok) {
        const event = {
          kind: 'flake',
          failures: unexpected,
          load,
          loaded: load > FLAKE_LOAD,
          log: result.log,
          step: failed,
          tip,
        };
        flaked.add(failed);
        emit({ ...event, ...(dry ? {} : report(event)) });
        continue;
      }
      // The search starts from the last commit this step passed on, so a
      // step can find its culprit while other steps keep next from going green.
      const from = option('--green') ?? state.passed?.[failed] ?? green;
      const target = readFailures(alone.log, failed).unexpected;
      const found =
        from && from !== tip
          ? firstBad(logs, failed, from, tip, started + BUDGET_MS, target)
          : { culprit: null, range: tip };
      const event = {
        kind: 'red',
        failures: target.length > 0 ? target : unexpected,
        green: from,
        // A loaded host can time a step out alone too, so the fix run reads
        // the load the alone rerun ended under.
        load,
        loaded: load > FLAKE_LOAD,
        log: alone.log,
        step: failed,
        tip,
        ...found,
      };
      emit({ ...event, ...(dry ? { dry, wake: true } : report(event)) });
    }
    if (!option('--ref')) {
      for (const cleared of wasRed.keys()) {
        if (passing.has(cleared) && !dry) {
          emit({
            kind: 'passed',
            step: cleared,
            tip,
            wake: true,
            ...settle(cleared, tip),
          });
        }
      }
      next.passed = {
        ...state.passed,
        ...Object.fromEntries([...passing, ...flaked].map((ok) => [ok, tip])),
      };
      writeState(next);
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
  const runs = [];
  for (const event of events.filter((entry) => !entry.dry && !entry.offNext)) {
    if (runs.at(-1)?.tip !== event.tip) {
      runs.push({ events: [], tip: event.tip });
    }
    runs.at(-1).events.push(event);
  }
  const open = new Map();
  const closed = [];
  for (const { events: reported } of runs) {
    if (reported.every((event) => event.kind === 'broken')) continue;
    const red = new Map(
      reported
        .filter((event) => event.kind === 'red')
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
    ...[...open].map(
      ([step, since]) =>
        `  ${step} since ${since} (${hoursBetween(since, now).toFixed(1)}h)`
    ),
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
      `job: ${job.status === 0 ? 'loaded' : 'not installed'}`,
      `running: ${lock && alive(lock) ? `pid ${lock}` : 'no'}`,
      `last run: ${state.lastRun ?? 'none'} at ${state.lastRunAt ?? '-'}`,
      `last green: ${state.green ?? 'none'}`,
      ...redFor(readEvents(), new Date().toISOString()),
      `events: ${eventsPath}`,
      ...readEvents()
        .slice(-5)
        .map(
          (event) =>
            `  ${event.at} ${event.kind} ${event.step ?? ''} ${event.culprit ?? event.range ?? event.tip}`
        ),
    ].join('\n')
  );
  return 0;
};

const install = () => {
  // Each run moves the Local CI worktree to the newest next, so the job runs
  // that copy and a fix to this script reaches it with its landing. The main
  // checkout's copy moves only when someone pulls there.
  const script = join(worktree, 'tooling', 'scripts', 'local-ci.mjs');
  if (!existsSync(script)) checkout(fetchNext());
  mkdirSync(home, { recursive: true });
  const escape = (text) =>
    text.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
  const strings = (items) =>
    items.map((item) => `<string>${escape(item)}</string>`).join('');
  writeFileSync(
    plist,
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>${LABEL}</string>
<key>ProgramArguments</key><array>${strings([process.execPath, script, 'run'])}</array>
<key>WorkingDirectory</key><string>${escape(main)}</string>
<key>StartInterval</key><integer>${INTERVAL_SECONDS}</integer>
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
    `[local-ci] ${LABEL} runs ${script} every ${INTERVAL_SECONDS / 60} minutes.`
  );
  return 0;
};

const uninstall = () => {
  spawnSync('launchctl', ['bootout', `gui/${userInfo().uid}/${LABEL}`]);
  rmSync(plist, { force: true });
  console.info(`[local-ci] removed ${LABEL}.`);
  return 0;
};

// Blocks until the runner writes an event the watcher acts on after `--after`,
// prints those events and exits, so a background command wakes the watcher
// session once per event and never on a timer.
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

const commands = { install, run, status, uninstall, wait };
const [command, ...rest] = process.argv.slice(2);
if (!commands[command]) {
  console.error(USAGE);
  process.exitCode = 1;
} else {
  process.exitCode = await commands[command](rest);
}
