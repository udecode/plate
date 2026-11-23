// Installed by the sync-pstack skill.

import { spawnSync } from 'node:child_process';

const git = (...args) => spawnSync('git', args, { encoding: 'utf8' });

export function remoteWorkingBranch(remote = 'origin') {
  const listed = git('ls-remote', '--symref', remote, 'HEAD');
  if (listed.status !== 0) return null;
  const head = /^ref: refs\/heads\/(\S+)\s+HEAD$/m.exec(listed.stdout)?.[1];
  const tip = /^([0-9a-f]{40,64})\s+HEAD$/m.exec(listed.stdout)?.[1];
  if (!head || !tip) return null;
  if (git('cat-file', '-e', `${tip}^{commit}`).status !== 0 && git('fetch', '--quiet', remote, `+refs/heads/${head}:refs/remotes/${remote}/${head}`).status !== 0) return null;
  const shown = git('show', `${tip}:.agents/pstack.json`);
  if (shown.status !== 0) return null;
  try {
    return JSON.parse(shown.stdout).branch ?? null;
  } catch {
    return null;
  }
}
