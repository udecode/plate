#!/usr/bin/env node
// Safe --ff-only hook for UserPromptSubmit (Claude Code) and PreInvocation (Antigravity).
// Throttles origin/next fetches across all worktrees via the shared .git/FETCH_HEAD mtime
// (> 2 min), fast-forwards both public and .git-private only when both working trees are
// clean and 0 commits ahead of origin/next, and otherwise prints a single hint without
// mutating git state.
import { spawnSync } from 'node:child_process';
import { existsSync, realpathSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  hookPayload,
  sessionCheckout,
} from '../../.agents/pstack/checkout.mjs';
import {
  BRANCH,
  isSplit,
  newPrivateFiles,
  PRIVATE_DIR,
  privateGit,
  UPSTREAM,
} from './private-files.mjs';

export const FETCH_INTERVAL_MS = 2 * 60 * 1000;

const FETCH_ENV = {
  GCM_INTERACTIVE: 'never',
  GIT_TERMINAL_PROMPT: '0',
};
const FETCH_ARGS = [
  '-c',
  'http.lowSpeedLimit=1000',
  '-c',
  'http.lowSpeedTime=5',
  'fetch',
  '--quiet',
  'origin',
  `+refs/heads/${BRANCH}:${UPSTREAM}`,
];

const runGit = (cwd, args, options = {}) =>
  spawnSync('git', args, {
    cwd,
    encoding: 'utf-8',
    timeout: 8000,
    ...options,
  });

const revCounts = (result) => {
  if (result.status !== 0) return null;
  const parts = result.stdout.trim().split(/\s+/u);
  if (parts.length !== 2) return null;
  const [ahead, behind] = parts.map(Number);
  return Number.isNaN(ahead) || Number.isNaN(behind) ? null : { ahead, behind };
};

const shouldFetch = (commonDir, now, intervalMs) => {
  const fetchHead = join(commonDir, 'FETCH_HEAD');
  const mtime = statSync(fetchHead, { throwIfNoEntry: false })?.mtimeMs;
  return mtime === undefined || now - mtime > intervalMs;
};

/**
 * Throttles a quiet origin/next fetch and either fast-forwards a clean checkout
 * with 0 local commits ahead or returns a concise hint when behind.
 */
export function runPromptFf(
  root,
  {
    fetchIntervalMs = FETCH_INTERVAL_MS,
    now = Date.now(),
    protectedBranch = 'main',
  } = {}
) {
  const branch = runGit(root, ['symbolic-ref', '--quiet', '--short', 'HEAD']);
  if (branch.status !== 0) return { action: 'skip', message: null };
  const branchName = branch.stdout.trim();
  if (!branchName || branchName === protectedBranch) {
    return { action: 'skip', message: null };
  }

  const common = runGit(root, [
    'rev-parse',
    '--path-format=absolute',
    '--git-common-dir',
  ]);
  if (common.status !== 0) return { action: 'skip', message: null };
  const commonDir = common.stdout.trim();
  const mainRoot = dirname(commonDir);
  const split = isSplit(root);

  let fetched = false;
  if (shouldFetch(commonDir, now, fetchIntervalMs)) {
    fetched = true;
    runGit(mainRoot, FETCH_ARGS, { env: { ...process.env, ...FETCH_ENV } });
    if (split) {
      const mainPrivate = join(mainRoot, PRIVATE_DIR);
      if (existsSync(mainPrivate)) {
        runGit(mainRoot, [`--git-dir=${mainPrivate}`, ...FETCH_ARGS], {
          env: { ...process.env, ...FETCH_ENV },
        });
      }
    }
  }

  const pubCounts = revCounts(
    runGit(root, ['rev-list', '--left-right', '--count', `HEAD...${UPSTREAM}`])
  );
  if (!pubCounts) return { action: 'skip', fetched, message: null };

  const privCounts = split
    ? (revCounts(
        privateGit(root, [
          'rev-list',
          '--left-right',
          '--count',
          `HEAD...${UPSTREAM}`,
        ])
      ) ?? { ahead: 0, behind: 0 })
    : { ahead: 0, behind: 0 };

  const behind = Math.max(pubCounts.behind, privCounts.behind);
  if (behind === 0) return { action: 'up-to-date', fetched, message: null };

  const pubClean =
    runGit(root, ['status', '--porcelain']).stdout.trim().length === 0;
  const privClean =
    !split ||
    (privateGit(root, ['status', '--porcelain']).stdout.trim().length === 0 &&
      newPrivateFiles(root).length === 0);
  const ahead = pubCounts.ahead + privCounts.ahead;

  if (!pubClean || !privClean || ahead > 0) {
    return {
      action: 'hint',
      behind,
      fetched,
      message: `origin/${BRANCH} is ${behind} commit${behind === 1 ? '' : 's'} ahead; rebase before editing`,
    };
  }

  let ffOk = true;
  if (pubCounts.behind > 0) {
    const merged = runGit(root, ['merge', '--ff-only', '--quiet', UPSTREAM]);
    if (merged.status !== 0) ffOk = false;
  }
  if (ffOk && split) {
    const remaining = revCounts(
      privateGit(root, [
        'rev-list',
        '--left-right',
        '--count',
        `HEAD...${UPSTREAM}`,
      ])
    );
    if (remaining && remaining.ahead === 0 && remaining.behind > 0) {
      const merged = privateGit(root, [
        'merge',
        '--ff-only',
        '--quiet',
        UPSTREAM,
      ]);
      if (merged.status !== 0) ffOk = false;
    }
  }

  if (!ffOk) {
    return {
      action: 'hint',
      behind,
      fetched,
      message: `origin/${BRANCH} is ${behind} commit${behind === 1 ? '' : 's'} ahead; rebase before editing`,
    };
  }

  return {
    action: 'fast-forwarded',
    behind,
    fetched,
    message: `prompt-ff: fast-forwarded by ${behind} commit${behind === 1 ? '' : 's'} to origin/${BRANCH}`,
  };
}

function main(argv) {
  const isHook = argv.includes('--hook');
  const payload = isHook ? hookPayload() : {};
  const isAgy = Boolean(payload.isAgy);
  const reply = (message) => {
    if (isAgy) {
      process.stdout.write(
        JSON.stringify(
          message
            ? {
                injectSteps: [{ systemMessage: { systemMessage: message } }],
              }
            : {}
        )
      );
    } else if (message) {
      console.log(message);
    }
    return 0;
  };
  if (process.env.PSTACK_READ_ONLY) return reply(null);
  const checkout = sessionCheckout(payload.cwd);
  if (!checkout) return reply(null);
  try {
    const result = runPromptFf(checkout.root);
    return reply(result.message);
  } catch {
    return reply(null);
  }
}

if (
  process.argv[1] &&
  realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  process.exitCode = main(process.argv.slice(2));
}
