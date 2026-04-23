#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DEFAULT_STATE_FILE = 'tmp/completion-check.md';
const stateFile = resolve(
  process.cwd(),
  process.env.COMPLETION_CHECK_FILE || process.argv[2] || DEFAULT_STATE_FILE
);

const doneValues = new Set(['done', 'complete', 'completed', 'closed', 'true']);
const blockedValues = new Set(['blocked']);

const normalize = (value) => value.trim().toLowerCase();

const readStatus = (content) => {
  const patterns = [
    /^\s*status\s*:\s*([A-Za-z_-]+)\s*$/im,
    /^\s*completion\s*:\s*([A-Za-z_-]+)\s*$/im,
    /^\s*done\s*:\s*(true|false)\s*$/im,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match?.[1]) {
      return normalize(match[1]);
    }
  }

  if (
    /^\s*-\s*\[[xX]\]\s*(done|complete|completed|closed)\s*$/im.test(content)
  ) {
    return 'done';
  }

  if (/^\s*-\s*\[[xX]\]\s*blocked\s*$/im.test(content)) {
    return 'blocked';
  }

  return 'pending';
};

const fail = (message) => {
  console.error(`[completion-check] ${message}`);
  process.exit(1);
};

if (!existsSync(stateFile)) {
  fail(
    `missing state file: ${stateFile}\n` +
      `Create ${DEFAULT_STATE_FILE} with one of:\n` +
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
