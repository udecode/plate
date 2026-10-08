#!/usr/bin/env node
// Runs a prompt in the other agent runtime, read-only unless --write, from the current
// directory, and prints its final answer: Codex on gpt-6.1-sol from Claude
// Code, Claude on Opus from Codex. Installed by the sync-pstack skill.

import { spawn } from 'node:child_process';
import { appendFileSync, existsSync, mkdtempSync, readFileSync, realpathSync } from 'node:fs';
import { constants, tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const MODELS = { claude: 'opus', codex: 'gpt-6.1-sol' };

export const otherRuntime = (env = process.env) => (env.CLAUDECODE ? 'codex' : 'claude');

// Each child runs in its own process group, which outlives this process, so
// stopping a run stops every runtime it launched.
const running = new Set();
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => {
    for (const killAll of running) killAll('SIGTERM');
    process.exit(128 + constants.signals[signal]);
  });
}

// Codex writes its final message only to the -o file, and reads a piped stdin
// as more prompt, so stdin is closed and the answer comes only from that file.
// A child that ignores SIGTERM, or leaves a descendant holding its pipes, is
// killed and abandoned at the deadline.
// Hooks stay off unless asked for, because a project hook, such as a Stop hook
// that stages files, would write from a read-only run.
export function ask(runtime, prompt, { cwd = process.cwd(), timeout = 900, model = MODELS[runtime], effort, hooks = false, write = false, events, resume } = {}) {
  const answerFile = join(mkdtempSync(join(tmpdir(), 'pstack-cross-')), 'answer.txt');
  const [command, args] =
    runtime === 'claude'
      ? ['claude', ['-p', '--model', model, ...(effort ? ['--effort', effort] : []), ...(hooks ? [] : ['--settings', '{"disableAllHooks":true}']), '--permission-mode', 'plan', '--', prompt]]
      : [
          'codex',
          [
            'exec',
            ...(resume ? ['resume', resume] : []),
            '-m',
            model,
            ...(effort ? ['-c', `model_reasoning_effort=${effort}`] : []),
            ...(hooks ? [] : ['--disable', 'hooks']),
            ...(write ? ['-c', 'sandbox_mode="workspace-write"', '--json'] : ['--sandbox', 'read-only']),
            '-o',
            answerFile,
            '--',
            prompt,
          ],
        ];
  const { CLAUDECODE: _, ...env } = process.env;
  return new Promise((resolve) => {
    let settled = false;
    const timers = [];
    const done = (answer) => {
      if (settled) return;
      settled = true;
      running.delete(killAll);
      for (const timer of timers) clearTimeout(timer);
      resolve(answer);
    };
    const child = spawn(command, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
    const killAll = (signal) => {
      try {
        process.kill(-child.pid, signal);
      } catch {
        // The process group is already gone.
      }
    };
    running.add(killAll);
    timers.push(
      setTimeout(() => killAll('SIGTERM'), timeout * 1000),
      setTimeout(() => killAll('SIGKILL'), timeout * 1000 + 2000),
      setTimeout(() => done({ runtime, ok: false, text: `no answer within ${timeout} seconds` }), timeout * 1000 + 3000),
    );
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
      if (write) appendFileSync(events, chunk);
    });
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('error', (error) => done({ runtime, ok: false, text: error.message }));
    child.on('close', (code, signal) => {
      const text = (runtime === 'codex' ? (existsSync(answerFile) ? readFileSync(answerFile, 'utf8') : '') : stdout).trim();
      const failure = `${code === 0 ? 'no answer' : `exit ${code ?? signal}`}: ${stderr.trim().split('\n').slice(-5).join('\n')}`;
      const session = write ? stdout.match(/"thread_id":"([^"]+)"/u)?.[1] : undefined;
      done(code === 0 && text ? { runtime, ok: true, text, session } : { runtime, ok: false, text: failure, session });
    });
  });
}

async function main(argv) {
  let to = otherRuntime();
  let timeout = 900;
  let model;
  let effort;
  let events;
  let resume;
  let write = false;
  let prompt = '';
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--to') to = argv[++index];
    else if (arg === '--timeout') timeout = Number(argv[++index]);
    else if (arg === '--model') model = argv[++index];
    else if (arg === '--effort') effort = argv[++index];
    else if (arg === '--write') write = true;
    else if (arg === '--events') events = argv[++index];
    else if (arg === '--resume') resume = argv[++index];
    else if (arg === '--prompt-file') prompt = readFileSync(argv[++index], 'utf8');
    else prompt = arg;
  }
  const usage = 'Usage: node .agents/pstack/cross.mjs [--to codex|claude] [--model <model>] [--effort <level>] [--timeout <seconds>] [--write --events <file> [--resume <session>]] (--prompt-file <path> | <prompt>)';
  if (!prompt.trim() || !['claude', 'codex'].includes(to) || !(timeout > 0)) {
    console.error(usage);
    return 2;
  }
  if ((write || events || resume) && (to !== 'codex' || !write || !events)) {
    console.error(`--write runs only --to codex, needs --events <file>, and is the only mode --resume works in\n${usage}`);
    return 2;
  }
  const answer = await ask(to, prompt, { timeout, model, effort, write, events, resume });
  if (answer.session) console.info(`session ${answer.session}`);
  (answer.ok ? console.info : console.error)(answer.text);
  return answer.ok ? 0 : 1;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((code) => {
    process.exit(code);
  });
}
