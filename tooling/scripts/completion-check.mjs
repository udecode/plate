#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DEFAULT_STATE_FILE = '.tmp/completion-check.md';
const LEGACY_STATE_DIR = '.tmp/completion-checks';

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
const continueFilePattern = /^\s*continue_file\s*:\s*(.+?)\s*$/im;

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

const resolveStateFilesForId = (cwd, stateId) => {
  const sanitizedId = sanitizeStateId(stateId);

  if (!sanitizedId) {
    fail(`invalid completion check id: ${stateId}`);
  }

  return {
    legacyStateFile: resolve(cwd, LEGACY_STATE_DIR, `${sanitizedId}.md`),
    stateFile: resolve(cwd, '.tmp', sanitizedId, 'completion-check.md'),
  };
};

const resolveStateFileForId = (cwd, stateId) => {
  const stateFiles = resolveStateFilesForId(cwd, stateId);

  if (existsSync(stateFiles.stateFile)) {
    return stateFiles.stateFile;
  }

  if (existsSync(stateFiles.legacyStateFile)) {
    return stateFiles.legacyStateFile;
  }

  return stateFiles.stateFile;
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

const readContinueFile = (content) => {
  const match = content.match(continueFilePattern);

  return match?.[1]?.trim().replace(/^['"]|['"]$/g, '');
};

const readNamedField = (content, name) => {
  const pattern = new RegExp(`^\\s*${name}\\s*:\\s*(.+?)\\s*$`, 'im');
  const match = content.match(pattern);

  return match?.[1]?.trim().replace(/^['"]|['"]$/g, '');
};

const getDoneConflict = (content) => {
  for (const field of ['ralplan_lane_status', 'final_handoff_status']) {
    const value = readNamedField(content, field);

    if (value && !doneValues.has(normalize(value))) {
      return `status done conflicts with ${field}: ${value}`;
    }
  }
};

const hasScopedStateFiles = (cwd) => {
  try {
    if (
      readdirSync(resolve(cwd, '.tmp'), {
        withFileTypes: true,
      }).some(
        (entry) =>
          entry.isDirectory() &&
          existsSync(resolve(cwd, '.tmp', entry.name, 'completion-check.md'))
      )
    ) {
      return true;
    }
  } catch {}

  try {
    return readdirSync(resolve(cwd, LEGACY_STATE_DIR), {
      withFileTypes: true,
    }).some((entry) => entry.isFile() && entry.name.endsWith('.md'));
  } catch {
    return false;
  }
};

const resolveStateFile = ({ args, cwd, env }) => {
  const explicitFile =
    env.COMPLETION_CHECK_FILE ||
    getFlagValue(args, '--file') ||
    getPositionalStateFile(args);

  if (explicitFile) {
    return {
      source: 'explicit',
      stateFile: resolve(cwd, explicitFile),
    };
  }

  const explicitId = env.COMPLETION_CHECK_ID || getFlagValue(args, '--id');

  if (explicitId) {
    return {
      source: 'explicit',
      stateFile: resolveStateFileForId(cwd, explicitId),
    };
  }

  const implicitId = env.CODEX_THREAD_ID || env.CODEX_SESSION_ID;

  if (implicitId) {
    const sessionStateFile = resolveStateFileForId(cwd, implicitId);

    if (existsSync(sessionStateFile)) {
      return {
        source: 'implicit',
        stateFile: sessionStateFile,
      };
    }

    return {
      implicitId,
      missingImplicitStateFile: sessionStateFile,
    };
  }

  return {
    source: 'shared',
    stateFile: resolve(cwd, DEFAULT_STATE_FILE),
  };
};

const fail = (message) => {
  console.error(`[completion-check] ${message}`);
  process.exit(1);
};

const resolvedState = resolveStateFile({
  args: process.argv.slice(2),
  cwd: process.cwd(),
  env: process.env,
});

if (resolvedState.missingImplicitStateFile) {
  console.log(
    `[completion-check] no state for session: ${resolvedState.implicitId} (${resolvedState.missingImplicitStateFile})`
  );
  process.exit(0);
}

const { stateFile } = resolvedState;

if (!existsSync(stateFile)) {
  if (resolvedState.source === 'shared' && hasScopedStateFiles(process.cwd())) {
    console.log(
      `[completion-check] no session id; scoped states exist, skipping shared fallback: ${stateFile}`
    );
    process.exit(0);
  }

  fail(
    `missing state file: ${stateFile}\n` +
      `Create ${DEFAULT_STATE_FILE} or .tmp/<session-id>/completion-check.md with one of:\n` +
      'status: pending\nstatus: done\nstatus: blocked'
  );
}

const content = readFileSync(stateFile, 'utf8');
const status = readStatus(content);
const continueFile = readContinueFile(content);

if (doneValues.has(status)) {
  const doneConflict = getDoneConflict(content);

  if (doneConflict) {
    if (continueFile) {
      console.error(`[completion-check] continue: ${continueFile}`);
    }

    fail(doneConflict);
  }

  console.log(`[completion-check] complete: ${stateFile}`);
  process.exit(0);
}

if (blockedValues.has(status)) {
  console.log(`[completion-check] blocked: ${stateFile}`);
  process.exit(0);
}

if (resolvedState.source === 'shared' && hasScopedStateFiles(process.cwd())) {
  console.log(
    `[completion-check] shared state pending and scoped states exist; no session id, skipping: ${stateFile}`
  );
  process.exit(0);
}

if (continueFile) {
  console.error(`[completion-check] continue: ${continueFile}`);
}

fail(`not complete: ${stateFile} (status: ${status})`);
