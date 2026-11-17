#!/usr/bin/env node
// Runs the deep lane: every check step on the newest origin/next, including
// the ones a landing leaves out, one run at a time. A launchd job starts it
// every 20 minutes; a run that finds next unchanged or another run going
// exits at once. Once a day the first run after 04:00 is the full fresh run.
// A red step is rerun alone, its first bad commit is searched for while the
// hour lasts, and the result goes to events.jsonl, the suggested-task ledger
// and the team channel. The deep-check skill's supervise mode watches
// events.jsonl and starts the fix session.
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
import { STEP_LOG } from './check-steps.mjs';

const USAGE = `Usage: node tooling/scripts/deep-check.mjs <command>
  run        check the newest origin/next unless it was checked
             --full     the daily fresh run with --build --browser --reads
             --ref <sha> --green <sha>   check <sha>, searching back to <sha>
             --step <name>   run one step instead of the deep lane
             --force    check next again although it has not moved
             --dry      write the event only: no ref push, task or message
  status     the last run, the last green commit and the latest events
  wait       block until an event the watcher acts on, print it and exit
             --after <iso time>   only events written after that time
  install    start the launchd job that runs it every 20 minutes
  uninstall  stop and remove that job`;

const LABEL = 'dev.plate.deep-check';
const INTERVAL_SECONDS = 1200;
const BUDGET_MS = 55 * 60_000;
const FULL_HOUR = 4;
const FLAKE_LOAD = 20;
const GREEN_REF = 'refs/pstack/deep-green';
const FIX_TOPIC = 'deep-check';
const STUCK_MS = 3 * 3_600_000;
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
const home = join(common, 'plate-deep-check');
const statePath = join(home, 'state.json');
const eventsPath = join(home, 'events.jsonl');
const lockDir = join(home, 'lock');
const worktree = join(main, '.claude', 'worktrees', 'deep-check');
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
const emit = (event) => {
  const line = { at: new Date().toISOString(), ...event };
  appendFileSync(eventsPath, `${JSON.stringify(line)}\n`);
  console.info(`[deep-check] ${line.kind} ${line.step ?? ''} ${line.tip}`);
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

// Moves the deep worktree to `sha`, its private half to the commit that
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
    ['.agents/pstack/setup.mjs', '--install', 'pnpm install --offline'],
  ]) {
    const result = node(worktree, args);
    if (result.status !== 0) {
      throw new Error(`${args[0]} at ${sha}: ${result.stdout}${result.stderr}`);
    }
    // attach keeps the private files a worktree already has, as a session's
    // own work, so this worktree's private files would stay at the commit it
    // was first made for. Nobody works here, so they move with the commit.
    if (args[0] === 'tooling/scripts/git-private.mjs') {
      must(worktree, [
        `--git-dir=${readFileSync(join(worktree, '.git-private'), 'utf-8')
          .replace(/^gitdir: /u, '')
          .trim()}`,
        `--work-tree=${worktree}`,
        'reset',
        '--quiet',
        '--hard',
      ]);
    }
  }
};

const runId = (sha, suffix) =>
  `${new Date().toISOString().slice(0, 16).replace(':', '')}-${sha.slice(0, 10)}${suffix ? `-${suffix}` : ''}`;

// Runs check.mjs in the deep worktree through proof.mjs, so the hour's
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
  const failed = lines
    .filter((line) => line.seconds !== undefined && line.exit !== 0)
    .map((line) => line.step);
  return {
    failed,
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

// Binary search over next's first-parent commits after `green`, while the
// hour lasts; returns the first bad commit or the range still unsearched.
const firstBad = (logs, step, green, tip, deadline) => {
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
    if (probe.ok) good = mid;
    else bad = mid;
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
    ? `twice in a row, passing alone each time${event.loaded ? ' under load' : ''}`
    : event.culprit
      ? `since ${event.culprit.slice(0, 10)} (${event.subject})`
      : `somewhere in ${event.range}`;

const send = (text) =>
  node(main, ['tooling/scripts/notify.mjs', 'send', '--to', 'dev', text]);

// Offers one suggested task per failing step while none is open, and tells
// the team channel. While the task stays open it says nothing more, except
// once when the step has been red for STUCK_MS. Returns what the event
// records: whether the watcher wakes for it and the task it offered.
const report = (event) => {
  const ledgerHelper = join(main, '.agents', 'pstack', 'decisions-check.mjs');
  const ledger = join(main, ledgerPath('docs/plans', 'trunk'));
  const title = `Fix the ${event.step} check that fails on next`;
  const open =
    existsSync(ledger) &&
    [...readTasks(readFileSync(ledger, 'utf-8').split('\n')).values()].some(
      (task) =>
        task.topic === FIX_TOPIC &&
        task.title?.includes(title) &&
        ['offered', 'started'].includes(task.status)
    );
  if (open) {
    const events = readEvents();
    const since = events.findLastIndex((entry) => entry.kind === 'green');
    const reds = events
      .slice(since + 1)
      .filter((entry) => entry.step === event.step);
    const stuck =
      reds.length > 0 &&
      Date.now() - Date.parse(reds[0].at) >= STUCK_MS &&
      !reds.some((entry) => entry.stuck);
    if (stuck) {
      send(
        `Deep check: ${event.step} has been red on next for ${STUCK_MS / 3_600_000} hours, ${where(event)}.`
      );
    }
    return { stuck, wake: false };
  }
  let id = null;
  if (existsSync(ledger)) {
    id = node(main, [ledgerHelper, 'chips', 'id']).stdout.trim();
    const added = node(main, [
      ledgerHelper,
      'append',
      ledger,
      'chip',
      `${id} ${title}`,
      `The deep lane found ${event.step} failing on next ${where(event)}. Log: ${event.log}. The newest ${event.kind} event in ${eventsPath} names the commits. Reproduce it with pnpm check ${event.step}, fix forward and land through land.mjs.`,
      // A check that fails on next is P0, and the ledger refuses an offer
      // that names no check it owns or paths it writes.
      `writes: packages, apps, tooling; topic: ${FIX_TOPIC}; kind: fix; priority: P0; owns: ${event.step}; via: hook; session: none`,
      'offered',
    ]);
    if (added.status !== 0) id = null;
  }
  send(
    `Deep check: ${event.step} fails on next ${where(event)}.${id ? ` Task ${id}.` : ''}`
  );
  return { task: id, wake: true };
};

const run = (args) => {
  const option = (name) => {
    const at = args.indexOf(name);
    return at === -1 ? undefined : args[at + 1];
  };
  const dry = args.includes('--dry');
  if (option('--step') && !option('--ref')) {
    console.error(
      '[deep-check] --step checks one step, so it needs --ref; a run on next checks every step.'
    );
    return 1;
  }
  mkdirSync(home, { recursive: true });
  const holder = takeLock();
  if (holder) {
    console.info(`[deep-check] run ${holder} is still going.`);
    return 0;
  }
  try {
    const started = Date.now();
    const state = readState();
    must(main, ['fetch', '--quiet', 'origin', 'next']);
    node(main, [
      'tooling/scripts/git-private.mjs',
      'fetch',
      '--quiet',
      'origin',
      'next',
    ]);
    const tip = option('--ref') ?? must(main, ['rev-parse', 'origin/next']);
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
      console.info(`[deep-check] next is still ${tip.slice(0, 10)}.`);
      return 0;
    }
    const logs = join(main, 'docs', 'plans', 'artifacts', 'deep-check', today);
    mkdirSync(logs, { recursive: true });
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
    const name = runId(tip, step ?? (full ? 'full' : 'deep'));
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
    } else if (result.failed.length === 0) {
      emit({
        kind: 'broken',
        log: result.log,
        output: result.output,
        tip,
        wake: readEvents().at(-1)?.kind !== 'broken',
      });
    }
    for (const failed of result.failed) {
      const alone = check(logs, runId(tip, `${failed}-alone`), [failed], {
        full,
      });
      if (alone.ok) {
        // A step that passes alone has no bad commit to find. The daily
        // check's rule stands: a flake gets a task on its second run in a row.
        const last = readEvents().findLast((event) => event.step === failed);
        const load = loadavg()[0];
        const event = {
          kind: 'flake',
          load,
          loaded: load > FLAKE_LOAD,
          log: result.log,
          step: failed,
          tip,
        };
        emit({
          ...event,
          ...(last?.kind === 'flake' && !dry ? report(event) : {}),
        });
        continue;
      }
      const found =
        green && green !== tip
          ? firstBad(logs, failed, green, tip, started + BUDGET_MS)
          : { culprit: null, range: tip };
      const event = {
        kind: 'red',
        green,
        log: alone.log,
        step: failed,
        tip,
        ...found,
      };
      emit({ ...event, ...(dry ? { dry, wake: true } : report(event)) });
    }
    if (!option('--ref')) writeState(next);
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
  // Each run moves the deep worktree to the newest next, so the job runs that
  // copy and a fix to this script reaches it with its landing. The main
  // checkout's copy moves only when someone pulls there.
  const script = [worktree, main]
    .map((root) => join(root, 'tooling', 'scripts', 'deep-check.mjs'))
    .find((path) => existsSync(path));
  if (!script) {
    console.error(
      `[deep-check] neither ${worktree} nor ${main} has tooling/scripts/deep-check.mjs, so land this script first.`
    );
    return 1;
  }
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
    console.error(`[deep-check] launchctl bootstrap: ${loaded.stderr}`);
    return 1;
  }
  console.info(
    `[deep-check] ${LABEL} runs ${script} every ${INTERVAL_SECONDS / 60} minutes.`
  );
  return 0;
};

const uninstall = () => {
  spawnSync('launchctl', ['bootout', `gui/${userInfo().uid}/${LABEL}`]);
  rmSync(plist, { force: true });
  console.info(`[deep-check] removed ${LABEL}.`);
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
