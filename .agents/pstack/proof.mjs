#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/proof.mjs --dir <run-dir> --name <name> [--cwd <dir>] [--timeout <seconds>] -- <command> [arg...]
// Runs one proof command and writes its command line, its output and its exit
// status to <run-dir>/<name>-a<N>.log, N one past the highest attempt logged, so
// a log that a decision row cites is never rewritten. One command argument runs
// in bash with pipefail; several run directly. Exits with the command's status,
// or 1 when a timeout, signal or spawn error ended it.

import { spawnSync } from 'node:child_process';
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readdirSync, readSync, realpathSync, statSync, writeSync } from 'node:fs';
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

export function prove({ dir, name, command, cwd = process.cwd(), timeout }) {
  if (!dir || !name || command.length === 0 || name.split('/').includes('..')) throw new Error('prove needs a run directory, a name without "..", and a command');
  const shell = command.length === 1;
  const line = shell ? command[0] : command.map(quote).join(' ');
  const { fd, path } = claim(resolve(dir), name);
  const header = `$ (${resolve(cwd)}) ${line}\n`;
  writeSync(fd, header);
  const [file, args] = shell ? ['bash', ['-o', 'pipefail', '-c', command[0]]] : [command[0], command.slice(1)];
  const result = spawnSync(file, args, { cwd, stdio: ['ignore', fd, fd], timeout: timeout ? timeout * 1000 : undefined });
  closeSync(fd);
  const exit = result.status ?? result.signal ?? result.error?.code ?? 'error';
  const { size } = statSync(path);
  appendFileSync(path, `${size > Buffer.byteLength(header) && tail(path, size, 1) !== '\n' ? '\n' : ''}exit=${exit}\n`);
  const shown = Math.min(size - Buffer.byteLength(header), OUTPUT_TAIL_BYTES);
  return { exit, path, output: tail(path, size, shown) };
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
    if (!['dir', 'name', 'cwd', 'timeout'].includes(key)) throw new Error(`unknown option ${flags[index]}`);
    options[key] = flags[++index];
    if (key === 'timeout' && !(Number(options.timeout) > 0)) throw new Error(`--timeout takes a number of seconds, got ${options.timeout}`);
    if (key === 'timeout') options.timeout = Number(options.timeout);
  }
  return options;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parse(process.argv.slice(2));
    if (options.cwd && !existsSync(options.cwd)) throw new Error(`--cwd ${options.cwd} does not exist`);
    const { exit, path, output } = prove(options);
    const lines = output.split('\n');
    console.log(lines.length > 60 ? `[${lines.length - 60} earlier lines in the log]\n${lines.slice(-60).join('\n')}` : output);
    console.log(`log: ${path} exit=${exit}`);
    process.exit(typeof exit === 'number' ? exit : 1);
  } catch (error) {
    console.error(`${error.message}\nUsage: node .agents/pstack/proof.mjs --dir <run-dir> --name <name> [--cwd <dir>] [--timeout <seconds>] -- <command> [arg...]`);
    process.exit(2);
  }
}
