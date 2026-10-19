// Identity of the checkout that serves a proof run: its HEAD and a digest of
// every uncommitted change, so a run log names exactly what it exercised.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, readlinkSync } from 'node:fs';
import { join } from 'node:path';

const git = (cwd, args) =>
  execFileSync('git', ['-C', cwd, ...args], {
    encoding: 'utf-8',
    maxBuffer: 1024 * 1024 * 1024,
  });

// Untracked files enter the hash by path and contents, so editing one changes
// the fingerprint. Paths are NUL-separated and each entry is length-prefixed;
// a symlink contributes its target and an embedded repository its path.
export const servingFingerprint = (cwd = process.cwd()) => {
  const root = git(cwd, ['rev-parse', '--show-toplevel']).trim();
  const hash = createHash('sha256').update(git(root, ['diff', 'HEAD']));

  for (const path of git(root, [
    'ls-files',
    '-z',
    '--others',
    '--exclude-standard',
  ])
    .split('\0')
    .filter(Boolean)) {
    const absolute = join(root, path);
    const stat = lstatSync(absolute, { throwIfNoEntry: false });

    // Another process can delete a file between the listing and this read.
    if (!stat) continue;

    const contents = stat.isSymbolicLink()
      ? Buffer.from(readlinkSync(absolute))
      : stat.isFile()
        ? readFileSync(absolute)
        : Buffer.alloc(0);

    hash.update(`\0${path}\0${contents.length}\0`).update(contents);
  }

  return {
    dirtyFingerprint: hash.digest('hex'),
    head: git(root, ['rev-parse', 'HEAD']).trim(),
    root,
  };
};
