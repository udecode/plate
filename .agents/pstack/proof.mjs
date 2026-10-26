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
// Before it starts, it holds --cores (default 1) of this machine's core pool,
// which every proof.mjs and land.mjs check of every session shares, and waits
// while the pool is full or free memory is low.

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
const POLL_MS = 2000;
const STALE_LOCK_MS = 10_000;

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

function holders() {
  const live = [];
  for (const file of readdirSync(POOL).filter((name) => name.endsWith('.json'))) {
    const path = join(POOL, file);
    const holder = JSON.parse(readFileSync(path, 'utf8'));
    if (alive(holder.pid)) live.push(holder);
    else rmSync(path, { force: true });
  }
  return live;
}

// Holds `cores` of the machine-wide pool until the returned release runs or
// this process exits. A process whose ancestor holds a share takes none, so a
// proof started inside a proof or a land check never waits on its own parent.
export function reserve(cores, label) {
  if (process.env[HELD]) return () => {};
  const capacity = availableParallelism();
  const want = Math.min(cores, capacity);
  mkdirSync(POOL, { recursive: true });
  const mine = join(POOL, `${process.pid}.json`);
  let reported = false;
  for (;;) {
    if (lockPool()) {
      let reason;
      try {
        const live = holders();
        const held = live.reduce((sum, holder) => sum + holder.cores, 0);
        const free = freeMemory();
        if (held + want <= capacity && free >= MIN_FREE_MEMORY) {
          writeFileSync(mine, JSON.stringify({ pid: process.pid, cores: want, label }));
          process.env[HELD] = '1';
          const release = () => {
            rmSync(mine, { force: true });
            delete process.env[HELD];
          };
          process.once('exit', release);
          return release;
        }
        reason =
          held + want > capacity
            ? `${held} of ${capacity} cores held by ${live.map((holder) => `${holder.label} (${holder.pid}, ${holder.cores})`).join(', ')}`
            : `free memory is ${Math.round(free * 100)}%, under ${MIN_FREE_MEMORY * 100}%`;
      } finally {
        rmSync(POOL_LOCK, { recursive: true, force: true });
      }
      if (!reported) console.error(`${label}: waiting for ${want} of this machine's cores; ${reason}`);
      reported = true;
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
  if (!stress) {
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
  const release = reserve(cores, `proof.mjs ${name}`);
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
