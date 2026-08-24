#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptPath), '../..');

export const createTypeAwareLintSteps = ({
  args = [],
  platform = process.platform,
  root = repoRoot,
} = {}) => [
  {
    args: ['g:build'],
    command: platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
    shell: platform === 'win32',
  },
  {
    args: [
      '--type-aware',
      '--report-unused-disable-directives-severity=error',
      '.',
      ...args,
    ],
    command: path.join(
      root,
      'node_modules',
      '.bin',
      platform === 'win32' ? 'oxlint.cmd' : 'oxlint'
    ),
    shell: platform === 'win32',
  },
];

export const runTypeAwareLint = ({ args = [], root = repoRoot } = {}) => {
  for (const step of createTypeAwareLintSteps({ args, root })) {
    const result = spawnSync(step.command, step.args, {
      cwd: root,
      shell: step.shell,
      stdio: 'inherit',
    });

    if (result.error) throw result.error;
    if (result.status !== 0) return result.status ?? 1;
  }

  return 0;
};

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  process.exit(runTypeAwareLint({ args: process.argv.slice(2) }));
}
