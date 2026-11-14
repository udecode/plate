#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/proof.mjs --dir <run-dir> --name <name> [--cwd <dir>] [--timeout <seconds>] [--cores <n>] [--stress] -- <command> [arg...]
// Runs one proof command and writes its command line, its output and its exit
// status to <run-dir>/<name>-a<N>.log, N one past the highest attempt logged, so
// a log that a decision row cites is never rewritten. One command argument runs
// in bash with pipefail; several run directly. Exits with the command's status,
// or 1 when a timeout, signal or spawn error ended it. Without --stress,
// --timeout defaults to 3,600 seconds and a longer one is refused. A run its
// timeout stopped logs that before `exit=ETIMEDOUT`, whatever the command
// returned, and stops every process still in the command's process group.
// Before it starts, it asks this machine's core pool for half a core for each
// of its --cores (default 1) workers. A --stress run asks for a whole core for
// each, and is refused when its --cores is over half the machine's cores.
// Every proof.mjs and land.mjs check of every session shares the pool, and
// the pool counts the workers each one runs, so a command that runs
// more workers than it asked for holds a share for each. It waits while the
// pool is full or free memory is low, or while the pool still counts the
// workers of a command that just started, and waiters enter in the order
// they arrived.

import { spawn, spawnSync } from 'node:child_process';
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, readSync, realpathSync, rmSync, statSync, writeFileSync, writeSync } from 'node:fs';
import { availableParallelism, constants, freemem, tmpdir, totalmem } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const quote = (arg) => (/^[\w@%+=:,./-]+$/u.test(arg) ? arg : `'${arg.replaceAll("'", "'\\''")}'`);

function claim(dir, name) {
  const folder = dirname(join(dir, name));
  mkdirSync(folder, { recursive: true });
  const pattern = new RegExp(`^${basename(name).replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}-a(\\d+)\\.log$`, 'u');
  let attempt = Math.max(0, ...readdirSync(folder).map((file) => Number(file.match(pattern)?.[1] ?? 0))) + 1;
  for (;;) {
    const path = join(folder, `${basename(name)}-a${attempt}.log`);
    try {
      return { fd: openSync(path, 'wx'), path };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      attempt++;
    }
  }
}

const POOL = join(tmpdir(), 'pstack-slots');
const POOL_LOCK = join(POOL, '.lock');
const HELD = 'PSTACK_SLOT';
const MIN_FREE_MEMORY = 0.15;
// The owner allows twice as many workers as cores (2026-10-26), because the
// memory floor, not the core count, keeps the machine from freezing. Pool
// files stay in cores, so a proof.mjs from an older checkout reads the same
// fill.
const CORES_PER_WORKER = 0.5;
const STRESS_CORES_PER_WORKER = 1;
const STRESS_MAX_CORE_SHARE = 0.5;
const POLL_MS = 2000;
const STALE_LOCK_MS = 10_000;
// On a loaded machine a new command had started four fifths of its workers
// within five seconds (measured 2026-11-14). Without this wait, commands that
// start together all enter before the pool has counted the workers of any.
const WATCH_MS = 6000;

const tenths = (cores) => Math.round(cores * 10) / 10;
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
};

// macOS counts its file cache as used, so os.freemem() reads near zero on an
// idle Mac; the kernel's own free-memory percentage is what its pressure uses.
function freeMemory() {
  if (process.platform === 'darwin') {
    const level = Number(spawnSync('sysctl', ['-n', 'kern.memorystatus_level'], { encoding: 'utf8' }).stdout);
    if (level > 0) return level / 100;
  }
  return freemem() / totalmem();
}

function lockPool() {
  try {
    mkdirSync(POOL_LOCK);
    return true;
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    if (Date.now() - statSync(POOL_LOCK, { throwIfNoEntry: false })?.mtimeMs > STALE_LOCK_MS) rmSync(POOL_LOCK, { recursive: true, force: true });
    return false;
  }
}

function readUnlessReleased(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

// The holders (`.json`) or waiters (`.wait`) whose process still runs.
function entries(suffix) {
  const live = [];
  for (const file of readdirSync(POOL).filter((name) => name.endsWith(suffix))) {
    const path = join(POOL, file);
    const text = readUnlessReleased(path);
    if (text === null) continue;
    const entry = JSON.parse(text);
    if (alive(entry.pid)) live.push(entry);
    else rmSync(path, { force: true });
  }
  return live;
}

// Counts the workers that run under a process now. A process that is running
// or ready to run is one worker, because on a loaded machine its CPU share
// reads far under the core it would use, and a process whose threads use
// several cores is that many. Where `ps` cannot run or hangs, nothing counts.
function countWorkers() {
  const { stdout } = spawnSync('ps', ['-A', '-o', 'pid=', '-o', 'ppid=', '-o', 'pcpu=', '-o', 'state='], { encoding: 'utf8', env: { ...process.env, LC_ALL: 'C' }, timeout: 10_000 });
  const children = new Map();
  for (const line of (stdout ?? '').split('\n')) {
    const [pid, parent, pcpu, state] = line.trim().split(/\s+/u);
    if (!state) continue;
    const child = { pid: Number(pid), workers: Math.max(state.startsWith('R') ? 1 : 0, (Number(pcpu) || 0) / 100) };
    if (!children.has(Number(parent))) children.set(Number(parent), []);
    children.get(Number(parent)).push(child);
  }
  return (root) => {
    const seen = new Set([root]);
    let workers = 0;
    for (const under = [...(children.get(root) ?? [])]; under.length > 0; ) {
      const child = under.pop();
      if (seen.has(child.pid)) continue;
      seen.add(child.pid);
      workers += child.workers;
      under.push(...(children.get(child.pid) ?? []));
    }
    return workers;
  };
}

// Holds the machine-wide pool's share for `workers` until the returned release
// runs or this process exits. A process whose ancestor holds a share takes
// none, so a proof started inside a proof or a land check never waits on its
// own parent. A waiter counts every earlier waiter's ask as held, so small
// proofs that arrive later never take the cores a land check is waiting for.
// It charges each holder the larger of its ask and the workers it runs now,
// so the ask in a holder's file never changes and an older proof.mjs still
// reads it.
export function reserve(workers, label, coresPerWorker = CORES_PER_WORKER) {
  if (process.env[HELD]) return () => {};
  const capacity = availableParallelism();
  const want = Math.min(workers * coresPerWorker, capacity);
  mkdirSync(POOL, { recursive: true });
  const mine = join(POOL, `${process.pid}.json`);
  const ticket = join(POOL, `${process.pid}.wait`);
  let since = null;
  const reported = new Set();
  for (;;) {
    const running = countWorkers();
    if (lockPool()) {
      let waiting;
      try {
        const now = Date.now();
        if (since === null) {
          since = now;
          writeFileSync(ticket, JSON.stringify({ pid: process.pid, cores: want, label, since }));
        }
        const live = entries('.json').map((holder) => ({
          ...holder,
          used: Math.min(capacity, Math.max(holder.cores, tenths(running(holder.pid) * (holder.perWorker ?? CORES_PER_WORKER)))),
        }));
        const held = tenths(live.reduce((sum, holder) => sum + holder.used, 0));
        const watched = live.find((holder) => Math.abs(now - holder.since) < WATCH_MS);
        const ahead = entries('.wait').filter((waiter) => waiter.since < since || (waiter.since === since && waiter.pid < process.pid));
        const queued = ahead.reduce((sum, waiter) => sum + waiter.cores, 0);
        const free = freeMemory();
        const fits = held + queued + want <= capacity;
        if (fits && free >= MIN_FREE_MEMORY && !watched) {
          writeFileSync(mine, JSON.stringify({ pid: process.pid, cores: want, label, since: now, perWorker: coresPerWorker }));
          rmSync(ticket, { force: true });
          process.env[HELD] = '1';
          const release = () => {
            rmSync(mine, { force: true });
            delete process.env[HELD];
          };
          process.once('exit', release);
          return release;
        }
        const behind = ahead.length > 0 ? `, and ${queued} asked for by ${ahead.length} earlier waiter${ahead.length === 1 ? '' : 's'}` : '';
        const share = (holder) => (holder.used > holder.cores ? `${holder.used} in use, asked ${holder.cores}` : holder.cores);
        if (!fits) waiting = { kind: 'cores', reason: `${held} of ${capacity} cores held by ${live.map((holder) => `${holder.label} (${holder.pid}, ${share(holder)})`).join(', ') || 'nobody'}${behind}` };
        else if (free < MIN_FREE_MEMORY) waiting = { kind: 'memory', reason: `free memory is ${Math.round(free * 100)}%, under ${MIN_FREE_MEMORY * 100}%` };
        else {
          const seconds = Math.round((now - watched.since) / 1000);
          waiting = {
            kind: 'count',
            reason: `${watched.label} (${watched.pid}) started ${seconds} second${seconds === 1 ? '' : 's'} ago, and the pool counts the workers of a new command for ${WATCH_MS / 1000} seconds before it admits the next`,
          };
        }
      } finally {
        rmSync(POOL_LOCK, { recursive: true, force: true });
      }
      if (!reported.has(waiting.kind)) console.error(`${label}: waiting for ${want} of this machine's cores; ${waiting.reason}`);
      reported.add(waiting.kind);
    }
    sleep(POLL_MS);
  }
}

export const TIME_BUDGET_SECONDS = 3600;
const SUPERVISE_GROUP = '--supervise-group';
const KILL_GRACE_MS = 5000;

export function prove({ dir, name, command, cwd = process.cwd(), timeout, cores = 1, stress = false }) {
  if (!dir || !name || command.length === 0 || name.split('/').includes('..')) throw new Error('prove needs a run directory, a name without "..", and a command');
  if (timeout !== undefined && !(Number.isFinite(timeout) && timeout > 0)) throw new Error(`--timeout takes a positive number of seconds, got ${timeout}`);
  if (!(Number.isInteger(cores) && cores > 0)) throw new Error(`--cores takes a positive whole number, got ${cores}`);
  if (stress) {
    const most = Math.max(1, Math.floor(availableParallelism() * STRESS_MAX_CORE_SHARE));
    if (cores > most)
      throw new Error(`--stress with --cores ${cores} is over half of this machine's ${availableParallelism()} cores; run the command with at most ${most} workers and pass --cores ${most}`);
  } else {
    if (timeout > TIME_BUDGET_SECONDS)
      throw new Error(`--timeout ${timeout} is over the ${TIME_BUDGET_SECONDS}-second time budget; split the proof, or offer it as a suggested task whose session passes --stress`);
    timeout ??= TIME_BUDGET_SECONDS;
  }
  const shell = command.length === 1;
  const line = shell ? command[0] : command.map(quote).join(' ');
  const { fd, path } = claim(resolve(dir), name);
  const header = `$ (${resolve(cwd)}) ${line}\n`;
  writeSync(fd, header);
  const [file, args] = shell ? ['bash', ['-o', 'pipefail', '-c', command[0]]] : [command[0], command.slice(1)];
  const release = reserve(cores, `proof.mjs ${name}`, stress ? STRESS_CORES_PER_WORKER : CORES_PER_WORKER);
  const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url), SUPERVISE_GROUP, String(timeout ?? 0), file, ...args], {
    cwd,
    stdio: ['ignore', fd, fd, 'pipe'],
    timeout: timeout ? timeout * 1000 + 3 * KILL_GRACE_MS : undefined,
    killSignal: 'SIGKILL',
  });
  release();
  closeSync(fd);
  const report = JSON.parse(result.output?.[3]?.toString() || 'null') ?? { timedOut: result.error?.code === 'ETIMEDOUT', error: result.error?.code ?? 'error' };
  const exit = report.timedOut ? 'ETIMEDOUT' : (report.code ?? report.signal ?? report.error ?? 'error');
  const { size } = statSync(path);
  const stopped = report.timedOut ? `timed out after ${timeout} seconds\n` : '';
  if (!report.logged) appendFileSync(path, `${size > Buffer.byteLength(header) && tail(path, size, 1) !== '\n' ? '\n' : ''}${stopped}exit=${exit}\n`);
  const shown = Math.min(size - Buffer.byteLength(header), OUTPUT_TAIL_BYTES);
  return { exit, path, output: tail(path, size, shown) };
}

function superviseGroup([seconds, file, ...args]) {
  const child = spawn(file, args, { stdio: ['ignore', 'inherit', 'inherit'], detached: true });
  const killGroup = (signal) => {
    try {
      process.kill(-child.pid, signal);
    } catch (error) {
      // macOS answers EPERM, not ESRCH, when every process left in the group is
      // a zombie.
      if (error.code !== 'ESRCH' && error.code !== 'EPERM') throw error;
    }
  };
  // A stop signal sent to the whole group ends the parent proof.mjs too, and
  // its pipe can still take the report, so the log gets the exit line here.
  let stopped = null;
  let logged = false;
  const logExit = (cause, exit) => {
    if (logged) return;
    logged = true;
    writeSync(1, `\n${cause}\nexit=${exit}\n`);
  };
  const report = (value) => {
    try {
      writeSync(3, JSON.stringify({ ...value, logged }));
    } catch (error) {
      if (error.code !== 'EPIPE') throw error;
      logExit('proof.mjs ended before its command', value.code ?? value.signal ?? value.error);
    }
    process.exit(0);
  };
  let timedOut = false;
  if (Number(seconds) > 0) {
    setTimeout(() => {
      timedOut = true;
      killGroup('SIGTERM');
      setTimeout(() => killGroup('SIGKILL'), KILL_GRACE_MS);
    }, Number(seconds) * 1000);
  }
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(signal, () => {
      stopped ??= signal;
      killGroup('SIGTERM');
      setTimeout(() => {
        killGroup('SIGKILL');
        logExit(`proof.mjs stopped by ${stopped}`, stopped);
        process.exit(128 + constants.signals[signal]);
      }, KILL_GRACE_MS);
    });
  }
  child.on('error', (error) => report({ error: error.code }));
  child.on('exit', (code, signal) => {
    if (timedOut) killGroup('SIGKILL');
    if (stopped) logExit(`proof.mjs stopped by ${stopped}`, code ?? signal);
    report({ code, signal, timedOut });
  });
}

const OUTPUT_TAIL_BYTES = 16 * 1024 * 1024;

function tail(path, size, length) {
  const fd = openSync(path, 'r');
  const buffer = Buffer.alloc(length);
  readSync(fd, buffer, 0, length, size - length);
  closeSync(fd);
  return buffer.toString('utf8');
}

function parse(argv) {
  const split = argv.indexOf('--');
  const options = { command: split === -1 ? [] : argv.slice(split + 1) };
  const flags = split === -1 ? argv : argv.slice(0, split);
  for (let index = 0; index < flags.length; index++) {
    const key = flags[index].replace(/^--/u, '');
    if (key === 'stress') {
      options.stress = true;
      continue;
    }
    if (!['dir', 'name', 'cwd', 'timeout', 'cores'].includes(key)) throw new Error(`unknown option ${flags[index]}`);
    options[key] = flags[++index];
    if (key === 'timeout' && !(Number(options.timeout) > 0)) throw new Error(`--timeout takes a number of seconds, got ${options.timeout}`);
    if (key === 'timeout') options.timeout = Number(options.timeout);
    if (key === 'cores') options.cores = Number(options.cores);
  }
  return options;
}

const main = process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (main && process.argv[2] === SUPERVISE_GROUP) superviseGroup(process.argv.slice(3));
else if (main) {
  try {
    const options = parse(process.argv.slice(2));
    if (options.cwd && !existsSync(options.cwd)) throw new Error(`--cwd ${options.cwd} does not exist`);
    const { exit, path, output } = prove(options);
    const lines = output.split('\n');
    console.log(lines.length > 60 ? `[${lines.length - 60} earlier lines in the log]\n${lines.slice(-60).join('\n')}` : output);
    console.log(`log: ${path} exit=${exit}`);
    process.exit(typeof exit === 'number' ? exit : 1);
  } catch (error) {
    console.error(`${error.message}\nUsage: node .agents/pstack/proof.mjs --dir <run-dir> --name <name> [--cwd <dir>] [--timeout <seconds>] [--cores <n>] [--stress] -- <command> [arg...]`);
    process.exit(2);
  }
}
