#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/freeze.mjs --dir <run-dir> [--parent <commit>] [--message <text>] <path> [...]
// Freezes HEAD plus the named paths' working copies as a commit object that no
// branch or ref points to, and prints its sha. The temporary index lives in the
// run directory and stays there, so the checkout's own index never changes.
// With --parent, the named paths must cover every path that differs between
// HEAD and the parent and whose working copy differs from HEAD, or it refuses.

import { spawnSync } from 'node:child_process';
import { lstatSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

function parse(argv) {
  const options = { message: 'frozen review tree', parent: 'HEAD', paths: [] };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--dir') options.dir = argv[++index];
    else if (arg === '--parent') options.parent = argv[++index];
    else if (arg === '--message') options.message = argv[++index];
    else options.paths.push(arg);
  }
  return options;
}

function git(args, env) {
  const result = spawnSync('git', args, { encoding: 'utf8', env: { ...process.env, ...env } });
  if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.stderr.trim()}`);
  return result.stdout.trim();
}

const options = parse(process.argv.slice(2));
if (!options.dir || options.paths.length === 0) {
  console.error('Usage: node .agents/pstack/freeze.mjs --dir <run-dir> [--parent <commit>] [--message <text>] <path> [...]');
  process.exit(2);
}

try {
  const dir = resolve(options.dir);
  mkdirSync(dir, { recursive: true });
  const env = { GIT_INDEX_FILE: resolve(dir, 'freeze-index') };
  if (options.parent !== 'HEAD') {
    const changed = (pathspec) => {
      const result = spawnSync('git', ['diff', '--name-only', '-z', '--no-renames', 'HEAD', options.parent, '--', ...pathspec], { encoding: 'utf8' });
      if (result.status !== 0) throw new Error(`git diff against --parent failed: ${result.stderr.trim()}`);
      return result.stdout.split('\0').filter(Boolean);
    };
    const named = new Set(changed(options.paths));
    const root = git(['rev-parse', '--show-toplevel']);
    const uncommitted = (path) =>
      spawnSync('git', ['cat-file', '-e', `HEAD:${path}`]).status === 0
        ? spawnSync('git', ['diff', '--quiet', 'HEAD', '--', `:(top,literal)${path}`]).status !== 0
        : lstatSync(resolve(root, path), { throwIfNoEntry: false }) !== undefined;
    const dropped = changed([]).filter((path) => !named.has(path) && uncommitted(path));
    if (dropped.length > 0) {
      const shown = dropped.slice(0, 20).join(', ') + (dropped.length > 20 ? ` and ${dropped.length - 20} more` : '');
      throw new Error(
        `${dropped.length} path(s) differ between HEAD and --parent ${options.parent} and hold uncommitted changes, but are not named, so this freeze would reset them to HEAD: ${shown}. Name each one, or omit --parent to start a new chain at HEAD.`
      );
    }
  }
  git(['read-tree', 'HEAD'], env);
  git(['add', '--force', '--', ...options.paths], env);
  const tree = git(['write-tree'], env);
  const commit = git(['commit-tree', tree, '-p', options.parent, '-m', options.message], env);
  console.log(commit);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
