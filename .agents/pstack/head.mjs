#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/head.mjs
// The desktop app cuts every new worktree from origin/HEAD, and
// `git remote set-head origin --auto` copies whatever branch the remote calls
// its default, which can be the protected one and can change on the remote.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

import { remoteWorkingBranch } from './working-branch.mjs';

const git = (...args) => spawnSync('git', args, { encoding: 'utf8' });
const config = existsSync('.agents/pstack.json') ? JSON.parse(readFileSync('.agents/pstack.json', 'utf8')) : {};
const trunk = remoteWorkingBranch();
if (trunk && config.branch && config.branch !== trunk) {
  console.log(
    `head.mjs: this checkout's .agents/pstack.json works on ${config.branch}, but origin now works on ${trunk}, so this checkout was cut from a retired branch. Rebase onto origin/${trunk} before you edit or land: git rebase --onto origin/${trunk} origin/${config.branch}`
  );
}
const protectedWorkingBranch = config.protected ? config.branch : null;
const branch = trunk ?? protectedWorkingBranch;
if (!branch) process.exit(0);

const target = `refs/remotes/origin/${branch}`;
if (git('show-ref', '--verify', '--quiet', target).status !== 0) process.exit(0);
const current = git('symbolic-ref', '-q', 'refs/remotes/origin/HEAD').stdout.trim();
if (current === target) process.exit(0);

const set = git('remote', 'set-head', 'origin', branch);
if (set.status !== 0) {
  console.error(`head.mjs: git remote set-head origin ${branch} failed: ${set.stderr.trim()}`);
  process.exit(1);
}
console.log(`origin/HEAD now points at origin/${branch}, so new worktrees start from ${branch}.`);
