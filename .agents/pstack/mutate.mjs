#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/mutate.mjs --dir <run-dir> <spec.json>
// spec: { "commit": "<frozen sha>", "test": ["node", "--test", "a.test.mjs"],
//         "timeout": 900,
//         "mutations": [{ "name": "drop-guard", "file": "src/a.mjs", "from": "<exact text>",
//                         "to": "<replacement>", "expect": "<the named assertion's own message>",
//                         "test": ["<optional per-mutation command>"] }] }
// Shows that each test fails when its fix is reverted. Run it from the
// repository that holds the commit, one run per run directory at a time: it
// exports the commit under <run-dir>/mutate/ with git archive, a plain directory
// rather than a worktree, and removes it after the mutations run, unless the run
// is killed. It links each entry of the repository's root and package
// node_modules into the export, except .cache, .vite and .vite-temp, so a test resolves the
// checkout's installed packages without writing those caches in the checkout,
// and a workspace sibling through those links resolves to the checkout's copy,
// not the commit's. A mutated file whose real path lies outside the export is
// refused. Each distinct test command first runs on the unmutated files and
// must pass. A mutation runs only when its file is valid UTF-8, its anchor
// matches exactly once and the control run's output does not hold its expected
// text. It then replaces its anchor, runs its test and restores the file, and
// counts as caught when the test exited non-zero, its output holds the expected
// text and the file's bytes came back unchanged. Only the last 16 MB of each
// run's output is searched, and a match proves the text appeared, not which
// assertion printed it, so read the mutant's log. Every test run is logged
// through proof.mjs and stops after the spec's timeout in seconds, 900 by
// default. Exits 0 only when every mutation is caught and the export is gone.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { prove } from './proof.mjs';

function problemWith(mutation, control, original) {
  const text = original.toString('utf8');
  const anchors = text.split(mutation.from).length - 1;
  if (!mutation.expect) return 'it names no expected text';
  if (control.output.includes(mutation.expect)) return 'its expected text also appears in the passing control run; name text only the failing assertion prints';
  if (!Buffer.from(text).equals(original)) return `${mutation.file} is not valid UTF-8`;
  if (anchors !== 1) return `its anchor matches ${anchors} times in ${mutation.file}, not once`;
  return null;
}

function check(dir, spec, tree) {
  const timeout = spec.timeout ?? 900;
  const controls = new Map();
  const lines = [];
  let ok = true;
  for (const mutation of spec.mutations) {
    const command = mutation.test ?? spec.test;
    if (!Array.isArray(command) || command.length === 0) {
      lines.push(`${mutation.name}: not run, it names no test command`);
      ok = false;
      continue;
    }
    const key = JSON.stringify(command);
    if (!controls.has(key)) {
      const control = prove({ dir, name: `mutate/control-${controls.size + 1}`, command, cwd: tree, timeout });
      controls.set(key, control);
      lines.push(`control ${command.join(' ')}: exit=${control.exit} log ${control.path}`);
      if (control.exit !== 0) ok = false;
    }
    const control = controls.get(key);
    if (control.exit !== 0) {
      lines.push(`${mutation.name}: not run, its control run failed`);
      continue;
    }
    const path = resolve(tree, mutation.file ?? '');
    if (!existsSync(path) || !realpathSync(path).startsWith(realpathSync(tree) + sep)) {
      lines.push(`${mutation.name}: not run, ${mutation.file} is outside the export`);
      ok = false;
      continue;
    }
    const original = readFileSync(path);
    const problem = problemWith(mutation, control, original);
    if (problem) {
      lines.push(`${mutation.name}: not run, ${problem}`);
      ok = false;
      continue;
    }
    let run;
    try {
      writeFileSync(path, original.toString('utf8').replace(mutation.from, () => mutation.to));
      run = prove({ dir, name: `mutate/${mutation.name}`, command, cwd: tree, timeout });
    } finally {
      writeFileSync(path, original);
    }
    const restored = readFileSync(path).equals(original);
    const named = run.exit !== 0 && run.output.includes(mutation.expect);
    const why = run.exit === 0 ? 'survived: the test passed' : named ? 'caught' : 'failed without the expected text';
    lines.push(`${mutation.name}: ${restored ? why : `${why}, and the file was not restored`} (exit=${run.exit}) log ${run.path}`);
    ok &&= named && restored;
  }
  return { lines, ok };
}

const UNLINKED = new Set(['.cache', '.vite', '.vite-temp']);

function linkModules(root, tree, commit) {
  const listed = spawnSync('git', ['ls-tree', '-r', '--name-only', commit], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28 }).stdout;
  const packages = listed.split('\n').filter((name) => name === 'package.json' || name.endsWith('/package.json'));
  for (const folder of new Set(['.', ...packages.map(dirname)])) {
    const modules = join(root, folder, 'node_modules');
    const target = join(tree, folder, 'node_modules');
    if (!existsSync(modules) || !existsSync(join(tree, folder)) || existsSync(target)) continue;
    mkdirSync(target);
    for (const name of readdirSync(modules)) if (!UNLINKED.has(name)) symlinkSync(join(modules, name), join(target, name));
  }
}

const args = process.argv.slice(2);
const dirAt = args.indexOf('--dir');
const dir = dirAt === -1 ? undefined : args[dirAt + 1];
const specPath = args.find((arg, index) => index !== dirAt && index !== dirAt + 1);
if (!dir || !specPath) {
  console.error('Usage: node .agents/pstack/mutate.mjs --dir <run-dir> <spec.json>');
  process.exit(2);
}
const spec = JSON.parse(readFileSync(specPath, 'utf8'));
if (!spec.commit || !(spec.mutations?.length > 0)) {
  console.error('the spec names no commit or lists no mutations');
  process.exit(1);
}
let attempt = 1;
while (existsSync(join(dir, 'mutate', `tree-a${attempt}`))) attempt++;
const tree = resolve(dir, 'mutate', `tree-a${attempt}`);
const removeTree = () => {
  rmSync(tree, { recursive: true, force: true });
  return !existsSync(tree);
};
mkdirSync(tree, { recursive: true });
const made = prove({ dir, name: 'mutate/tree', command: ['bash', '-o', 'pipefail', '-c', 'git archive "$1" | tar -x -C "$2"', 'export', spec.commit, tree] });
if (made.exit !== 0) {
  console.error(`could not export ${spec.commit}; log ${made.path}${removeTree() ? '' : `; remove ${tree} by hand`}`);
  process.exit(1);
}
let result;
let removed = false;
try {
  linkModules(spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).stdout.trim(), tree, spec.commit);
  result = check(dir, spec, tree);
} finally {
  removed = removeTree();
}
console.log([...result.lines, ...(removed ? [] : [`could not remove ${tree}; remove that directory by hand`])].join('\n'));
process.exit(result.ok && removed ? 0 : 1);
