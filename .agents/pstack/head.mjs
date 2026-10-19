#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/head.mjs
// Points this clone's origin/HEAD at origin/<branch>, the working branch that
// .agents/pstack.json names, when the config also names a protected branch.
// The desktop app cuts every new worktree from origin/HEAD, and
// `git remote set-head origin --auto` copies the remote's default branch, which
// is the protected one. It writes nothing when the config names no protected
// branch, when origin has no such branch, or when origin/HEAD already points
// there, and prints one line when it moves origin/HEAD.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const git = (...args) => spawnSync('git', args, { encoding: 'utf8' });
const config = existsSync('.agents/pstack.json') ? JSON.parse(readFileSync('.agents/pstack.json', 'utf8')) : {};
if (!config.branch || !config.protected) process.exit(0);

const target = `refs/remotes/origin/${config.branch}`;
if (git('show-ref', '--verify', '--quiet', target).status !== 0) process.exit(0);
const current = git('symbolic-ref', '-q', 'refs/remotes/origin/HEAD').stdout.trim();
if (current === target) process.exit(0);

const set = git('remote', 'set-head', 'origin', config.branch);
if (set.status !== 0) {
  console.error(`head.mjs: git remote set-head origin ${config.branch} failed: ${set.stderr.trim()}`);
  process.exit(1);
}
console.log(`origin/HEAD now points at origin/${config.branch}, so new worktrees start from ${config.branch}.`);
