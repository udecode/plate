#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const DEFAULT_STATE_FILE = 'tmp/completion-check.md';
const DEFAULT_STATE_DIR = 'tmp/completion-checks';

const doneValues = new Set(['done', 'complete', 'completed', 'closed', 'true']);
const blockedValues = new Set(['blocked']);
const doneChecklistPattern =
  /^\s*-\s*\[[xX]\]\s*(done|complete|completed|closed)\s*$/im;
const blockedChecklistPattern = /^\s*-\s*\[[xX]\]\s*blocked\s*$/im;
const statusPatterns = [
  /^\s*status\s*:\s*([A-Za-z_-]+)\s*$/im,
  /^\s*completion\s*:\s*([A-Za-z_-]+)\s*$/im,
  /^\s*done\s*:\s*(true|false)\s*$/im,
];

const normalize = (value) => value.trim().toLowerCase();

const getFlagValue = (args, name) => {
  const equalsPrefix = `${name}=`;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index];

    if (arg === name) {
      return args[index + 1];
    }

    if (arg.startsWith(equalsPrefix)) {
      return arg.slice(equalsPrefix.length);
    }
  }
};

const getPositionalStateFile = (args) => {
  const valueFlags = new Set(['--file', '--id']);

  for (let index = 0; index < args.length; index++) {
    const arg = args[index];

    if (valueFlags.has(arg)) {
      index++;
      continue;
    }

    if (!arg.startsWith('-')) {
      return arg;
    }
  }
};

const sanitizeStateId = (value) =>
  value
    .trim()
    .replaceAll(/[^A-Za-z0-9._-]+/g, '-')
    .replaceAll(/^-+|-+$/g, '');

const resolveStateFileForId = (cwd, stateId) => {
  const sanitizedId = sanitizeStateId(stateId);

  if (!sanitizedId) {
    fail(`invalid completion check id: ${stateId}`);
  }

  return resolve(cwd, DEFAULT_STATE_DIR, `${sanitizedId}.md`);
};

const getLatestScopedStateFile = (cwd) => {
  const stateDir = resolve(cwd, DEFAULT_STATE_DIR);

  if (!existsSync(stateDir)) {
    return;
  }

  const stateFiles = readdirSync(stateDir)
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const filePath = resolve(stateDir, fileName);

      return {
        filePath,
        mtimeMs: statSync(filePath).mtimeMs,
      };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  return stateFiles[0]?.filePath;
};

const resolveStateFile = ({ args, cwd, env }) => {
  const explicitFile =
    env.COMPLETION_CHECK_FILE ||
    getFlagValue(args, '--file') ||
    getPositionalStateFile(args);

  if (explicitFile) {
    return resolve(cwd, explicitFile);
  }

  const explicitId = env.COMPLETION_CHECK_ID || getFlagValue(args, '--id');

  if (explicitId) {
    return resolveStateFileForId(cwd, explicitId);
  }

  const implicitId = env.CODEX_THREAD_ID || env.CODEX_SESSION_ID;

  if (implicitId) {
    const sessionStateFile = resolveStateFileForId(cwd, implicitId);

    if (existsSync(sessionStateFile)) {
      return sessionStateFile;
    }
  }

  const latestScopedStateFile = getLatestScopedStateFile(cwd);

  if (latestScopedStateFile) {
    return latestScopedStateFile;
  }

  return resolve(cwd, DEFAULT_STATE_FILE);
};

const readStatus = (content) => {
  for (const pattern of statusPatterns) {
    const match = content.match(pattern);
    if (match?.[1]) {
      return normalize(match[1]);
    }
  }

  if (doneChecklistPattern.test(content)) {
    return 'done';
  }

  if (blockedChecklistPattern.test(content)) {
    return 'blocked';
  }

  return 'pending';
};

const fail = (message) => {
  console.error(`[completion-check] ${message}`);
  process.exit(1);
};

const stateFile = resolveStateFile({
  args: process.argv.slice(2),
  cwd: process.cwd(),
  env: process.env,
});

if (!existsSync(stateFile)) {
  fail(
    `missing state file: ${stateFile}\n` +
      `Create ${DEFAULT_STATE_FILE} or ${DEFAULT_STATE_DIR}/<session-id>.md with one of:\n` +
      'status: pending\nstatus: done\nstatus: blocked'
  );
}

const content = readFileSync(stateFile, 'utf8');
const status = readStatus(content);

if (doneValues.has(status)) {
  console.log(`[completion-check] complete: ${stateFile}`);
  process.exit(0);
}

if (blockedValues.has(status)) {
  console.log(`[completion-check] blocked: ${stateFile}`);
  process.exit(0);
}

fail(`not complete: ${stateFile} (status: ${status})`);
