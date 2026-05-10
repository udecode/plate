#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const readHookInput = () => {
  if (process.stdin.isTTY) {
    return;
  }

  const input = readFileSync(0, 'utf8').trim();

  if (!input) {
    return;
  }

  try {
    return JSON.parse(input);
  } catch {
    return;
  }
};

const pass = () => {
  process.stdout.write(JSON.stringify({ continue: false }));
};

const block = (reason) => {
  process.stdout.write(
    JSON.stringify({
      decision: 'block',
      reason,
    })
  );
};

const packageJsonPath = new URL('../../package.json', import.meta.url);

if (!existsSync(packageJsonPath)) {
  pass();
  process.exit(0);
}

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

if (!packageJson.scripts?.['completion-check']) {
  pass();
  process.exit(0);
}

const hookInput = readHookInput();
const env = { ...process.env };

if (!env.CODEX_THREAD_ID && typeof hookInput?.session_id === 'string') {
  env.CODEX_THREAD_ID = hookInput.session_id;
}

const result = spawnSync('bun', ['run', 'completion-check'], {
  cwd: new URL('../..', import.meta.url),
  encoding: 'utf8',
  env,
});

const output = [result.stdout, result.stderr]
  .filter((value) => typeof value === 'string' && value.trim().length > 0)
  .join('\n')
  .trim();

if (result.status === 0) {
  pass();
  process.exit(0);
}

block(
  [
    'Completion check failed while running:',
    packageJson.scripts['completion-check'],
    result.status === null
      ? 'Exit code: unknown'
      : `Exit code: ${result.status}`,
    output ? `Recent output:\n${output}` : '',
    'Fix issues.',
  ]
    .filter(Boolean)
    .join('\n')
);
