import fs from 'node:fs';
import path from 'node:path';

// A worktree's .git is a file, and a copy made without git has none.
export const isMainCheckout = (repoRoot) =>
  fs
    .statSync(path.join(repoRoot, '.git'), { throwIfNoEntry: false })
    ?.isDirectory() === true;
