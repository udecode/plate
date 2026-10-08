#!/usr/bin/env node
// --install runs an offline frozen install instead of linking node_modules,
// because Turbopack refuses node_modules linked from outside the worktree root.

import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  realpathSync,
  statSync,
  symlinkSync,
  unlinkSync,
} from 'node:fs';
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
} from 'node:path';

const USAGE =
  'Usage: node tooling/scripts/proof-worktree.mjs <path> [<sha>] [--install] [--with <file>]... [--dir <run-dir> --name <name> [--expect-fail <text>]... -- <command> [arg...]]';

function git(args, cwd) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf-8' });
  if (result.status !== 0) {
    console.error(`git ${args.join(' ')}: ${result.stderr.trim()}`);
    process.exit(1);
  }
  return result.stdout;
}

function parse(argv) {
  const split = argv.indexOf('--');
  const options = split === -1 ? argv : argv.slice(0, split);
  const command = split === -1 ? [] : argv.slice(split + 1);
  const positional = [];
  const files = [];
  const expectFail = [];
  const values = new Map();
  let install = false;
  for (let index = 0; index < options.length; index++) {
    const option = options[index];
    if (option === '--install') install = true;
    else if (['--with', '--dir', '--name', '--expect-fail'].includes(option)) {
      index += 1;
      const value = options[index];
      if (!value) throw new Error(`${option} needs a value`);
      if (option === '--with') files.push(value);
      else if (option === '--expect-fail') expectFail.push(value);
      else values.set(option, value);
    } else if (option.startsWith('--')) {
      throw new Error(`unknown option ${option}`);
    } else positional.push(option);
  }
  const dir = values.get('--dir');
  const name = values.get('--name');
  if (positional.length === 0 || positional.length > 2) {
    throw new Error('expected <path> [<sha>]');
  }
  if (command.length > 0 && (!dir || !name)) {
    throw new Error('a command needs --dir and --name');
  }
  if (command.length === 0 && (dir || name || expectFail.length > 0)) {
    throw new Error('--dir, --name and --expect-fail need a command after --');
  }
  return { command, dir, expectFail, install, name, positional, with: files };
}

let args;
try {
  args = parse(process.argv.slice(2));
} catch (error) {
  console.error(`${error.message}\n${USAGE}`);
  process.exit(2);
}
// proof.mjs arrives through the pstack sync, so a checkout can lack it.
let prove;
if (args.command.length > 0) {
  try {
    ({ prove } = await import('../../.agents/pstack/proof.mjs'));
  } catch (error) {
    console.error(`${error.message}\n${USAGE}`);
    process.exit(2);
  }
}
const [target, sha = 'HEAD'] = args.positional;
const root = git(['rev-parse', '--show-toplevel'], process.cwd()).trim();
const path = resolve(target);
if (existsSync(path)) {
  console.error(`${path} exists; every proof run gets a fresh worktree`);
  process.exit(1);
}
const realLocation = (location) =>
  existsSync(location)
    ? realpathSync(location)
    : join(realLocation(dirname(location)), basename(location));
const leaves = (rest) =>
  rest === '..' || rest.startsWith('../') || isAbsolute(rest);
if (
  args.dir &&
  !leaves(relative(realLocation(path), realLocation(resolve(args.dir))))
) {
  console.error(
    `--dir ${args.dir} lies inside the worktree, which the run removes`
  );
  process.exit(1);
}
const realRoot = realpathSync(root);
const overlay = args.with.map((file) => {
  const location = resolve(file);
  const inside = relative(realRoot, location);
  if (
    leaves(inside) ||
    !existsSync(location) ||
    realpathSync(location) !== location ||
    !statSync(location).isFile()
  ) {
    console.error(
      `--with ${file} names no file inside ${root} reached without a symlink`
    );
    process.exit(1);
  }
  return inside;
});
git(['worktree', 'add', '--quiet', '--detach', path, sha], root);
const writeInsideWorktree = (file, write) => {
  const destination = join(path, file);
  if (
    realLocation(dirname(destination)) !==
    join(realLocation(path), dirname(file))
  ) {
    console.error(
      `${file} passes through a symlink in the worktree; remove it with git worktree remove --force ${path}`
    );
    process.exit(1);
  }
  mkdirSync(dirname(destination), { recursive: true });
  if (lstatSync(destination, { throwIfNoEntry: false })?.isSymbolicLink()) {
    unlinkSync(destination);
  }
  write(destination);
};

const packages = git(['ls-files', '--', '*package.json'], root)
  .split('\n')
  .filter((file) => basename(file) === 'package.json')
  .map(dirname);
const linked = [];
const copied = [];
for (const dir of new Set(['.', ...packages])) {
  if (!existsSync(join(path, dir)) || !existsSync(join(root, dir))) continue;
  const modules = join(root, dir, 'node_modules');
  if (
    !args.install &&
    existsSync(modules) &&
    !existsSync(join(path, dir, 'node_modules'))
  ) {
    writeInsideWorktree(join(dir, 'node_modules'), (destination) =>
      symlinkSync(modules, destination)
    );
    linked.push(join(dir, 'node_modules'));
  }
  for (const name of readdirSync(join(root, dir)).filter((file) =>
    /^\.env(?:\..+)?$/u.test(file)
  )) {
    const file = join(dir, name);
    if (git(['ls-files', '--', file], root).trim()) continue;
    writeInsideWorktree(file, (destination) =>
      copyFileSync(join(root, file), destination)
    );
    copied.push(file);
  }
}
if (args.install) {
  const install = spawnSync(
    'pnpm',
    ['install', '--offline', '--frozen-lockfile', '--ignore-scripts'],
    {
      cwd: path,
      stdio: 'inherit',
    }
  );
  if (install.status !== 0) {
    console.error(
      `pnpm install failed in ${path}; it is not a usable worktree`
    );
    process.exit(1);
  }
}
for (const file of overlay) {
  writeInsideWorktree(file, (destination) =>
    copyFileSync(join(realRoot, file), destination)
  );
}

const head = git(['rev-parse', 'HEAD'], path).trim();
const status = git(
  [
    'status',
    '--porcelain',
    '--',
    '.',
    ...[...linked, ...overlay].map((entry) => `:(exclude,literal)${entry}`),
  ],
  path
).trim();
console.log(`worktree ${path} at ${head}`);
console.log(
  `linked: ${linked.join(', ') || (args.install ? 'none; installed' : 'none')}`
);
console.log(`copied: ${copied.join(', ') || 'none'}`);
if (status) {
  console.error(`not clean, so it cannot serve as a base:\n${status}`);
  console.error(`remove it with git worktree remove --force ${path}`);
  process.exit(1);
}
console.log(
  overlay.length > 0
    ? `candidate: base ${head} with ${overlay.join(', ')}`
    : `base: ${head}, clean`
);
if (args.command.length === 0) {
  console.log(`remove it with git worktree remove --force ${path}`);
  process.exit(0);
}

let proof;
try {
  proof = prove({
    command: args.command,
    cwd: path,
    dir: resolve(args.dir),
    name: args.name,
  });
  const lines = proof.output.split('\n');
  console.log(
    lines.length > 60
      ? `[${lines.length - 60} earlier lines in the log]\n${lines.slice(-60).join('\n')}`
      : proof.output
  );
  console.log(`log: ${proof.path} exit=${proof.exit}`);
} catch (error) {
  console.error(`${error.message}\n${USAGE}`);
}
let exitStatus = 2;
if (proof) exitStatus = typeof proof.exit === 'number' ? proof.exit : 1;
const removal = spawnSync('git', ['worktree', 'remove', '--force', path], {
  cwd: root,
  encoding: 'utf-8',
});
if (removal.status !== 0) {
  console.error(`could not remove ${path}: ${removal.stderr.trim()}`);
  process.exit(exitStatus || 1);
}
console.log(`removed ${path}`);
if (args.expectFail.length === 0 || !proof) process.exit(exitStatus);

if (typeof proof.exit !== 'number') {
  console.error(
    `the command did not run to an exit status (${proof.exit}), so it cannot show its named defect`
  );
  process.exit(2);
}
if (exitStatus === 0) {
  console.error(
    `the command passed, so it cannot show its named defect: ${args.expectFail.join(', ')}`
  );
  process.exit(1);
}
const missing = args.expectFail.filter((text) => !proof.output.includes(text));
if (missing.length > 0) {
  console.error(
    `the command failed, but its output does not show: ${missing.join(', ')}`
  );
  process.exit(1);
}
console.log(`fails as expected: ${args.expectFail.join(', ')}`);
process.exit(0);
