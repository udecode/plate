#!/usr/bin/env node
// Installed by the sync-pstack skill.

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { constants, tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { browserLaunch } from './codex-browser.mjs';
import { ISOLATED_CODEX_ARGS, managedCodexConfig, NO_EXEC_RULES } from './codex-isolation.mjs';

export const MODELS = { claude: 'opus', codex: 'gpt-6.1-sol' };

export const otherRuntime = (env = process.env) => (env.CLAUDECODE ? 'codex' : 'claude');

// Each child runs in its own process group, which outlives this process, so
// stopping a run stops every runtime it launched.
const running = new Set();
let stopsOnSignals = false;
const stopOnSignals = () => {
  if (stopsOnSignals) return;
  stopsOnSignals = true;
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(signal, () => {
      for (const killAll of running) killAll('SIGTERM');
      process.exit(128 + constants.signals[signal]);
    });
  }
};

// Codex writes its final message only to the -o file, and reads a piped stdin
// as more prompt, so stdin is closed and the answer comes only from that file.
// A child that ignores SIGTERM, or leaves a descendant holding its pipes, is
// killed and abandoned at the deadline.
// A project hook, such as a Stop hook that stages files, would still write from a read-only run.
export async function ask(runtime, prompt, { cwd = process.cwd(), timeout = 900, model = MODELS[runtime], effort, hooks = false, userConfig = false, computerUse } = {}) {
  const managed = runtime === 'codex' && managedCodexConfig();
  if (managed) return { runtime, ok: false, text: `${managed} would still load over the command line; refusing to run` };
  const runCwd = computerUse ? mkdtempSync(join(tmpdir(), 'pstack-browser-')) : cwd;
  let launch = { args: userConfig ? NO_EXEC_RULES : ISOLATED_CODEX_ARGS };
  if (computerUse) {
    launch = await browserLaunch({ cwd: runCwd, chromeProfile: computerUse.chromeProfile });
    if (launch.refusal) return { runtime, ok: false, text: `refusing the browser lane: ${launch.refusal}` };
  }
  stopOnSignals();
  const answerFile = join(mkdtempSync(join(tmpdir(), 'pstack-cross-')), 'answer.txt');
  const [command, args] =
    runtime === 'claude'
      ? ['claude', ['-p', '--model', model, ...(effort ? ['--effort', effort] : []), ...(hooks ? [] : ['--settings', '{"disableAllHooks":true}']), '--permission-mode', 'plan', '--', prompt]]
      : [
          'codex',
          [
            'exec',
            ...(computerUse ? ['--json', '--skip-git-repo-check'] : []),
            ...launch.args,
            '-m',
            model,
            ...(effort ? ['-c', `model_reasoning_effort=${effort}`] : []),
            ...(hooks ? [] : ['--disable', 'hooks']),
            '--sandbox',
            'read-only',
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
    const child = spawn(command, args, { cwd: runCwd, env, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
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
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('error', (error) => done({ runtime, ok: false, text: error.message }));
    child.on('close', (code, signal) => {
      if (computerUse) writeFileSync(computerUse.events, stdout);
      const text = (runtime === 'codex' ? (existsSync(answerFile) ? readFileSync(answerFile, 'utf8') : '') : stdout).trim();
      const failure = `${code === 0 ? 'no answer' : `exit ${code ?? signal}`}: ${stderr.trim().split('\n').slice(-5).join('\n')}`;
      done(code === 0 && text ? { runtime, ok: true, text } : { runtime, ok: false, text: failure });
    });
  });
}

async function main(argv) {
  let to = otherRuntime();
  let timeout = 900;
  let model;
  let effort;
  let retired;
  let events;
  let chromeProfile;
  let promptFile;
  let isolated = false;
  let prompt = '';
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--to') to = argv[++index];
    else if (arg === '--timeout') timeout = Number(argv[++index]);
    else if (arg === '--model') model = argv[++index];
    else if (arg === '--effort') effort = argv[++index];
    else if (['--write', '--events', '--resume'].includes(arg)) retired = arg;
    else if (arg === '--ignore-user-config') isolated = true;
    else if (arg === '--computer-use') events = argv[++index];
    else if (arg === '--chrome-profile') chromeProfile = argv[++index];
    else if (arg === '--prompt-file') promptFile = argv[++index];
    else prompt = arg;
  }
  const usage = 'Usage: node .agents/pstack/cross.mjs [--to codex|claude] [--model <model>] [--effort <level>] [--timeout <seconds>] [--computer-use <events file> --chrome-profile <name>] (--prompt-file <path> | <prompt>)';
  if (retired) {
    console.error(`${retired} is retired: cross.mjs runs Codex read-only\n${usage}`);
    return 2;
  }
  if (isolated && events) {
    console.error(`--ignore-user-config and --computer-use conflict\n${usage}`);
    return 2;
  }
  if (promptFile) prompt = readFileSync(promptFile, 'utf8');
  if (!prompt.trim() || !['claude', 'codex'].includes(to) || !(timeout > 0)) {
    console.error(usage);
    return 2;
  }
  if ((events || chromeProfile) && (to !== 'codex' || !events || !chromeProfile)) {
    console.error(`--computer-use and --chrome-profile go together, and only --to codex\n${usage}`);
    return 2;
  }
  const answer = await ask(to, prompt, { timeout, model, effort, computerUse: events && { events, chromeProfile } });
  (answer.ok ? console.info : console.error)(answer.text);
  return answer.ok ? 0 : 1;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((code) => {
    process.exit(code);
  });
}
