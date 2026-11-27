#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { hookPayload } from '../../.agents/pstack/checkout.mjs';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const BRANCH = 'origin/next';
const FIXES_DUE = 50;
const HOOK_TIMEOUT_MS = 30_000;
const INTAKE = /^(\d{4}-\d{2}-\d{2})-(?:.*-)?formal-.*-intake\.md$/;

const run = (command, args) =>
  execFileSync(command, args, {
    cwd: ROOT,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
const git = (...args) => run('git', args);
const fresh = (dir) =>
  Date.now() - (statSync(dir, { throwIfNoEntry: false })?.mtimeMs ?? 0) <
  2 * HOOK_TIMEOUT_MS;

function takeLock(lock) {
  try {
    mkdirSync(lock);
    return true;
  } catch {
    return !fresh(lock) && breakStaleLock(lock);
  }
}

function breakStaleLock(lock) {
  const breaker = `${lock}.break`;
  try {
    mkdirSync(breaker);
  } catch {
    return false;
  }
  try {
    if (!fresh(lock)) rmSync(lock, { force: true, recursive: true });
    mkdirSync(lock);
    return true;
  } catch {
    return false;
  } finally {
    rmSync(breaker, { force: true, recursive: true });
  }
}

function main() {
  const input = hookPayload();
  const isAgy = Boolean(input.isAgy);
  const done = () => {
    if (isAgy) process.stdout.write('{}');
  };
  const stopActive =
    input.stop_hook_active ||
    (isAgy && (input.continuationActive || Number(input.executionNum) > 0));
  // Codex sets CODEX_SESSION_ID only in its shell commands, so a Codex hook's
  // environment holds only ids inherited from a parent session, and only the
  // payload names this one.
  const session = process.argv.includes('--codex')
    ? input.session_id
    : isAgy
      ? process.env.T3CODE_THREAD_ID || input.session_id
      : process.env.CLAUDE_CODE_HOST_SESSION_ID ||
        process.env.CLAUDE_CODE_SESSION_ID ||
        input.session_id;
  if (
    process.env.PSTACK_READ_ONLY ||
    stopActive ||
    input.background_tasks?.length ||
    input.session_crons?.length ||
    (isAgy && input.fullyIdle === false) ||
    !session
  ) {
    done();
    return;
  }

  const config = JSON.parse(
    readFileSync(path.join(ROOT, '.agents/pstack.json'), 'utf-8')
  );
  const companion = path.join(ROOT, config.companion.dir);
  if (!existsSync(companion)) {
    done();
    return;
  }
  const landedIn = (...gitDir) =>
    git(
      ...gitDir,
      'log',
      '-1',
      '--format=%h',
      '--fixed-strings',
      `--grep=Session: ${session}`,
      BRANCH
    );
  const landed = landedIn() || landedIn('--git-dir', companion);
  if (!landed) {
    done();
    return;
  }

  const intake = git(
    '--git-dir',
    companion,
    'ls-tree',
    '--name-only',
    BRANCH,
    `${config.plans}/`
  )
    .split('\n')
    .map((file) => path.basename(file))
    .filter((name) => INTAKE.test(name))
    .sort()
    .at(-1);
  if (!intake) {
    done();
    return;
  }

  const common = git('rev-parse', '--path-format=absolute', '--git-common-dir');
  const lock = path.join(common, 'formal-intake.lock');
  if (!takeLock(lock)) {
    done();
    return;
  }
  try {
    const intakeDay = INTAKE.exec(intake)[1];
    const marker = path.join(common, 'formal-intake-notified');
    if (
      existsSync(marker) &&
      readFileSync(marker, 'utf-8').trim() === intakeDay
    ) {
      done();
      return;
    }

    const fixes = git(
      'log',
      `--since-as-filter=${intakeDay}T00:00:00`,
      '--format=%s',
      BRANCH
    )
      .split('\n')
      .filter((subject) => /^fix\b/.test(subject)).length;
    if (fixes < FIXES_DUE) {
      done();
      return;
    }

    writeFileSync(marker, `${intakeDay}\n`);
    process.stdout.write(
      JSON.stringify({
        decision: isAgy ? 'continue' : 'block',
        reason: `Formal intake is due: ${fixes} fix commits landed on next since ${intakeDay}, and this session landed ${landed}. Note this in one line for a follow-up formal intake run.`,
      })
    );
  } finally {
    rmSync(lock, { force: true, recursive: true });
  }
}

try {
  main();
} catch (error) {
  console.error(`formal-intake-due: ${error.stderr || error.message}`);
  process.exitCode = 1;
}
