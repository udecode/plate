#!/usr/bin/env node
// Installed by the sync-pstack skill.

import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { constants, tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { browserLaunch } from './codex-browser.mjs';
import { ISOLATED_CODEX_ARGS, managedCodexConfig, NO_EXEC_RULES } from './codex-isolation.mjs';
import { capEffort, claudeSessionRun, maxEffort } from './lead.mjs';

export const MODELS = { claude: 'opus', codex: 'gpt-6.1-sol' };

export const otherRuntime = (env = process.env) => (env.CLAUDECODE ? 'codex' : 'claude');

const DASHED_WORD = /^-\S+$/u;
const TIME_BUDGET_SECONDS = 3600;
// A --bypass run is a Codex worker writing code, and stopping a long fix wastes its work.
const CODING_BUDGET_SECONDS = 21_600;
const VALUE_FLAGS = new Map([
  ['--to', 'to'],
  ['--timeout', 'timeout'],
  ['--model', 'model'],
  ['--effort', 'effort'],
  ['--computer-use', 'events'],
  ['--chrome-profile', 'chromeProfile'],
  ['--prompt-file', 'promptFile'],
  ['--prompt', 'prompt'],
]);

// Each child runs in its own process group, which outlives this process, so
// stopping a run stops every runtime it launched.
const running = new Set();
const cleanups = new Set();
const folders = new Set();
export const STOP_GRACE_MS = 3000;
export const GIVE_UP_MS = 3000;
let stopsOnSignals = false;
let stopping = false;
const removeFolder = (folder) => {
  rmSync(folder, { recursive: true, force: true });
  folders.delete(folder);
};
const stopOnSignals = () => {
  if (stopsOnSignals) return;
  stopsOnSignals = true;
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(signal, async () => {
      if (stopping) return;
      stopping = true;
      const groups = [...running];
      for (const signalGroup of groups) signalGroup('SIGTERM');
      await Promise.allSettled([...cleanups].map(async (cleanup) => cleanup()));
      const deadline = Date.now() + STOP_GRACE_MS;
      while (groups.some((signalGroup) => signalGroup(0)) && Date.now() < deadline) await new Promise((wake) => setTimeout(wake, 100));
      for (const signalGroup of groups) signalGroup('SIGKILL');
      for (const folder of folders) removeFolder(folder);
      process.exit(128 + constants.signals[signal]);
    });
  }
};

export const onStop = (cleanup) => {
  cleanups.add(cleanup);
  stopOnSignals();
};

// Codex writes its final message only to the -o file, and reads a piped stdin
// as more prompt, so stdin is closed and the answer comes only from that file.
// A child that ignores SIGTERM, or leaves a descendant holding its pipes, is
// killed and abandoned at the deadline.
// A project hook, such as a Stop hook that stages files, would still write from a read-only run.
export async function ask(runtime, prompt, { cwd = process.cwd(), effortRoot = cwd, timeout = 900, model = MODELS[runtime], effort, hooks = false, userConfig = false, readDirs = [], computerUse, bypass = false, reach = false, offline = false } = {}) {
  const max = maxEffort(effortRoot);
  effort = capEffort(effort ?? max, max);
  const managed = runtime === 'codex' && !bypass && !reach && managedCodexConfig();
  if (managed) return { runtime, ok: false, text: `${managed} would still load over the command line; refusing to run` };
  const runCwd = computerUse ? mkdtempSync(join(tmpdir(), 'pstack-browser-')) : reach ? mkdtempSync(join(tmpdir(), 'pstack-reach-')) : cwd;
  if (reach) prompt = `Your working directory is a scratch folder you may write. The project is ${cwd}: read it by absolute path and never write it.\n\n${prompt}\n\nPut your whole answer in your final message. Nobody reads the files you write in the scratch folder.`;
  let launch = { args: bypass ? [] : reach ? [...NO_EXEC_RULES, '--skip-git-repo-check', '-c', 'web_search="live"'] : userConfig ? NO_EXEC_RULES : ISOLATED_CODEX_ARGS };
  if (computerUse) {
    launch = await browserLaunch({ cwd: runCwd, chromeProfile: computerUse.chromeProfile });
    if (launch.refusal) return { runtime, ok: false, text: `refusing the browser lane: ${launch.refusal}` };
  }
  stopOnSignals();
  const answerDir = mkdtempSync(join(tmpdir(), 'pstack-cross-'));
  folders.add(answerDir);
  if (reach) folders.add(runCwd);
  const answerFile = join(answerDir, 'answer.txt');
  const sessionId = randomUUID();
  const [command, args] =
    runtime === 'claude'
      ? ['claude', ['-p', '--session-id', sessionId, '--model', model, ...(effort ? ['--effort', effort] : []), ...(hooks ? [] : ['--settings', '{"disableAllHooks":true}']), ...readDirs.flatMap((dir) => ['--add-dir', dir]), ...(offline ? ['--disallowed-tools', 'WebFetch,WebSearch', '--strict-mcp-config'] : []), '--permission-mode', 'plan', '--', prompt]]
      : [
          'codex',
          [
            'exec',
            ...(computerUse ? ['--json', '--skip-git-repo-check'] : []),
            ...launch.args,
            '-m',
            model,
            ...(effort ? ['-c', `model_reasoning_effort=${effort}`] : []),
            ...(hooks || bypass ? [] : ['--disable', 'hooks']),
            ...(bypass ? ['--dangerously-bypass-approvals-and-sandbox'] : reach ? ['--sandbox', 'workspace-write', '-c', 'sandbox_workspace_write.network_access=true'] : ['--sandbox', 'read-only']),
            '-o',
            answerFile,
            '--',
            prompt,
          ],
        ];
  // A Codex Desktop parent exports its permission profile, which outranks --sandbox in a run that loads the user's config.
  const { CLAUDECODE: _, CODEX_PERMISSION_PROFILE: __, ...env } = process.env;
  return new Promise((resolve) => {
    let settled = false;
    let late = false;
    const timers = [];
    const done = (answer) => {
      if (settled || stopping) return;
      settled = true;
      running.delete(signalGroup);
      for (const timer of timers) clearTimeout(timer);
      removeFolder(answerDir);
      if (reach) removeFolder(runCwd);
      resolve(answer);
    };
    const child = spawn(command, args, { cwd: runCwd, env, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
    const signalGroup = (signal) => {
      try {
        process.kill(-child.pid, signal);
        return true;
      } catch {
        return false;
      }
    };
    running.add(signalGroup);
    timers.push(
      setTimeout(() => {
        late = child.exitCode === null && child.signalCode === null;
        signalGroup('SIGTERM');
      }, timeout * 1000),
      setTimeout(() => signalGroup('SIGKILL'), timeout * 1000 + 2000),
      setTimeout(() => done({ runtime, ok: false, text: `no answer within ${timeout} seconds` }), timeout * 1000 + GIVE_UP_MS),
    );
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('error', (error) => done({ runtime, ok: false, text: error.message }));
    child.on('close', (code, signal) => {
      try {
        if (computerUse) writeFileSync(computerUse.events, stdout);
        const text = (runtime === 'codex' ? (existsSync(answerFile) ? readFileSync(answerFile, 'utf8') : '') : stdout).trim();
        // The Claude CLI prints a usage-limit refusal on stdout and nothing on stderr.
        const failure = `${late ? `no answer within ${timeout} seconds` : code === 0 ? 'no answer' : `exit ${code ?? signal}`}: ${(stderr.trim() || stdout.trim()).split('\n').slice(-5).join('\n')}`;
        // A Claude seat without --effort runs at the machine's default, which only its transcript records.
        const ran = runtime === 'claude' ? claudeSessionRun(sessionId) : null;
        const seat = `${ran?.model ?? model} @${ran?.effort ?? effort ?? 'default'}`;
        done(code === 0 && text && !late ? { runtime, ok: true, text, seat } : { runtime, ok: false, text: failure, seat });
      } catch (error) {
        done({ runtime, ok: false, text: error.message });
      }
    });
  });
}

async function main(argv) {
  const values = {};
  let retired;
  let isolated = false;
  let bypass = false;
  let reach = false;
  let stress = false;
  let help = false;
  let refusal;
  const positional = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const key = VALUE_FLAGS.get(arg);
    const next = argv[index + 1];
    if (key && key in values) refusal ??= `${arg} given twice`;
    else if (key && next !== undefined && !DASHED_WORD.test(next)) values[key] = argv[++index];
    else if (key) refusal ??= `${arg} needs a value`;
    else if (['--write', '--events', '--resume'].includes(arg)) retired = arg;
    else if (arg === '--ignore-user-config') isolated = true;
    else if (arg === '--bypass') bypass = true;
    else if (arg === '--reach') reach = true;
    else if (arg === '--stress') stress = true;
    else if (arg === '--help' || arg === '-h') help = true;
    else if (DASHED_WORD.test(arg)) refusal ??= `unknown flag ${arg}`;
    else positional.push(arg);
  }
  const { to = otherRuntime(), model, effort, events, chromeProfile, promptFile } = values;
  const sources = [...positional, values.prompt, promptFile].filter((source) => source !== undefined);
  let prompt = sources[0] ?? '';
  const timeout = Number(values.timeout ?? 900);
  const usage = 'Usage: node .agents/pstack/cross.mjs [--to codex|claude] [--model <model>] [--effort <level>] [--timeout <seconds>] [--stress] [--reach | --bypass | --computer-use <events file> --chrome-profile <name>] (--prompt-file <path> | --prompt <prompt> | <prompt>)';
  if (help) {
    console.info(usage);
    return 0;
  }
  if (refusal) {
    console.error(`${refusal}\n${usage}`);
    return 2;
  }
  if (retired) {
    console.error(`${retired} is retired: cross.mjs runs Codex read-only, or with no sandbox under --bypass\n${usage}`);
    return 2;
  }
  if (bypass && reach) {
    console.error(`--bypass and --reach conflict\n${usage}`);
    return 2;
  }
  const lane = bypass ? '--bypass' : reach ? '--reach' : null;
  if (lane && (to !== 'codex' || isolated || events)) {
    console.error(`${lane} runs only --to codex, without --ignore-user-config or --computer-use\n${usage}`);
    return 2;
  }
  if (isolated && events) {
    console.error(`--ignore-user-config and --computer-use conflict\n${usage}`);
    return 2;
  }
  if (sources.length > 1) {
    console.error(`give one prompt: a positional prompt, --prompt or --prompt-file\n${usage}`);
    return 2;
  }
  if (promptFile) prompt = readFileSync(promptFile, 'utf8');
  if (!prompt.trim() || !['claude', 'codex'].includes(to) || !(timeout > 0)) {
    console.error(usage);
    return 2;
  }
  if (!stress && bypass && timeout > CODING_BUDGET_SECONDS) {
    console.error(`--timeout ${timeout} is over the ${CODING_BUDGET_SECONDS}-second budget of a --bypass coding run; split the task, or run it from a suggested task's session with --stress\n${usage}`);
    return 2;
  }
  if (!stress && !bypass && timeout > TIME_BUDGET_SECONDS) {
    console.error(`--timeout ${timeout} is over the ${TIME_BUDGET_SECONDS}-second time budget; split the task, or run it from a suggested task's session with --stress\n${usage}`);
    return 2;
  }
  if ((events || chromeProfile) && (to !== 'codex' || !events || !chromeProfile)) {
    console.error(`--computer-use and --chrome-profile go together, and only --to codex\n${usage}`);
    return 2;
  }
  const answer = await ask(to, prompt, { timeout, model, effort, bypass, reach, computerUse: events && { events, chromeProfile } });
  (answer.ok ? console.info : console.error)(answer.text);
  if (answer.seat) console.error(`seat: ${answer.seat}`);
  return answer.ok ? 0 : 1;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // A pipe on macOS takes writes asynchronously, so exiting before both
  // streams drain drops every byte of a reply past the 64 KB pipe buffer.
  main(process.argv.slice(2)).then((code) => {
    process.stdout.write('', () => process.stderr.write('', () => process.exit(code)));
  });
}
