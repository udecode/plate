#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { hookPayload } from '../../.agents/pstack/checkout.mjs';
import { ledgerPath, readTasks } from '../../.agents/pstack/tasks.mjs';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const BRANCH = 'origin/next';
const FIXES_DUE = 50;
const HOOK_TIMEOUT_MS = 30_000;
const TOPIC = 'formal-intake';
const INTAKE = /^(\d{4}-\d{2}-\d{2})-(?:.*-)?formal-.*-intake\.md$/;
const HELPER = path.join(ROOT, '.agents/pstack/decisions-check.mjs');

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

function countStart(intakeDay, rows, closedIntakes) {
  const ids = new Set(closedIntakes.map((task) => task.id));
  return [
    intakeDay,
    ...rows
      .map((row) => row.split('\t'))
      .filter((cells) => ids.has(cells[2]?.split(' ')[0]))
      .map((cells) => cells[0].slice(0, 10)),
  ]
    .sort((a, b) => a.localeCompare(b))
    .at(-1);
}

function main() {
  const input = hookPayload();
  // Codex sets CODEX_SESSION_ID only in its shell commands, so a Codex hook's
  // environment holds only ids inherited from a parent session, and only the
  // payload names this one.
  const session = process.argv.includes('--codex')
    ? input.session_id
    : process.env.CLAUDE_CODE_HOST_SESSION_ID ||
      process.env.CLAUDE_CODE_SESSION_ID ||
      input.session_id;
  if (
    process.env.PSTACK_READ_ONLY ||
    input.stop_hook_active ||
    input.background_tasks?.length ||
    input.session_crons?.length ||
    !session
  ) {
    return;
  }

  const config = JSON.parse(
    readFileSync(path.join(ROOT, '.agents/pstack.json'), 'utf-8')
  );
  const companion = path.join(ROOT, config.companion.dir);
  if (!existsSync(companion)) return;
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
  if (!landed) return;

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
  if (!intake) return;

  const common = git('rev-parse', '--path-format=absolute', '--git-common-dir');
  const ledger = path.join(
    path.dirname(common),
    ledgerPath(config.plans, config.delivery)
  );
  const lock = path.join(common, 'formal-intake.lock');
  if (!takeLock(lock)) return;
  try {
    const rows = (existsSync(ledger) ? readFileSync(ledger, 'utf-8') : '')
      .split('\n')
      .filter(Boolean);
    const intakes = [...readTasks(rows).values()].filter(
      (task) => task.topic === TOPIC
    );
    if (
      intakes.some(
        (task) => task.status === 'offered' || task.status === 'started'
      )
    ) {
      return;
    }

    const intakeDay = INTAKE.exec(intake)[1];
    const since = countStart(intakeDay, rows, intakes);
    const fixes = git(
      'log',
      `--since-as-filter=${since}T00:00:00`,
      '--format=%s',
      BRANCH
    )
      .split('\n')
      .filter((subject) => /^fix\b/.test(subject)).length;
    if (fixes < FIXES_DUE) return;

    const id = run('node', [HELPER, 'chips', 'id']);
    run('node', [
      HELPER,
      'append',
      ledger,
      'chip',
      `${id} Run formal intake over the fixes since ${intakeDay}`,
      `${fixes} fix commits landed on next since ${since}, the later of the newest formal intake, ${config.plans}/${intake}, and the last intake task's close. Run the formal intake that AGENTS.md's Owner phrases define, which reads every fix since that intake, to judge where a new formal check is worth building.`,
      `writes: ${config.plans}; topic: ${TOPIC}; kind: decide; priority: P3; via: hook; session: none`,
      'offered',
    ]);
    process.stdout.write(
      JSON.stringify({
        decision: 'block',
        reason: `Formal intake is due: ${fixes} fix commits landed on next since ${since}, and this session landed ${landed}. This hook offered it as ${id} in the suggested-task ledger with no owner, because it lies outside this session's domain, so only /chips all cards it. Say so in one line.`,
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
