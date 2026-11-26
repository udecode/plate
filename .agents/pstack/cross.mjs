#!/usr/bin/env node
// Installed by the sync-pstack skill.

import { spawn, spawnSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { closeSync, existsSync, mkdirSync, mkdtempSync, openSync, readdirSync, readFileSync, readSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { constants, homedir, tmpdir, userInfo } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { StringDecoder } from 'node:string_decoder';
import { fileURLToPath } from 'node:url';
import { capEffort, claudeSessionRun, claudeTranscript, maxEffort } from './lead.mjs';

const NO_EXEC_RULES = ['--ignore-rules'];
const ISOLATED_FEATURES = ['apps', 'plugins', 'remote_plugin', 'browser_use', 'browser_use_external', 'browser_use_full_cdp_access', 'computer_use', 'in_app_browser', 'in_app_local_automation', 'image_generation', 'skill_mcp_dependency_install', 'tool_suggest', 'multi_agent', 'multi_agent_v2', 'memories', 'chronicle'];
const ISOLATED_CODEX_ARGS = ['--ignore-user-config', ...NO_EXEC_RULES, '-c', 'web_search="disabled"', '-c', 'project_doc_max_bytes=0', ...ISOLATED_FEATURES.flatMap((f) => ['--disable', f])];
function managedCodexConfig() {
  let user;
  try {
    user = userInfo().username;
  } catch {
    return 'managed config for a user with no passwd entry';
  }
  return ['/etc/codex', '/Library/Managed Preferences/com.openai.codex.plist', `/Library/Managed Preferences/${user}/com.openai.codex.plist`].find((p) => existsSync(p));
}

export const MODELS = { claude: 'opus', codex: 'gpt-6.2-sol', agy: 'gemini-4-neon' };

export const otherRuntime = (env = process.env) => (env.CLAUDECODE ? 'codex' : 'claude');

const DASHED_WORD = /^-\S+$/u;
export const IDLE_SECONDS = 1200;
const VALUE_FLAGS = new Map([
  ['--to', 'to'],
  ['--timeout', 'timeout'],
  ['--model', 'model'],
  ['--effort', 'effort'],
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

// A runtime starts some commands in a process group of their own, so each
// process that inherited the seat's mark also counts as the seat's. macOS
// hides the environment of its own signed binaries, such as sleep.
const SEAT_MARK = 'PSTACK_SEAT';
export const envOutlivingSeat = ({ [SEAT_MARK]: _, ...env }) => env;

function markedProcesses(seat) {
  const mark = `${SEAT_MARK}=${seat}`;
  if (process.platform === 'linux') {
    return readdirSync('/proc')
      .filter((name) => /^\d+$/u.test(name))
      .filter((pid) => {
        try {
          return readFileSync(`/proc/${pid}/environ`, 'utf8').split('\0').includes(mark);
        } catch {
          return false;
        }
      })
      .map(Number);
  }
  const listing = spawnSync('ps', ['-axEww', '-o', 'pid=,command='], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }).stdout ?? '';
  return listing
    .split('\n')
    .filter((line) => line.split(' ').includes(mark))
    .map((line) => Number.parseInt(line, 10));
}
export const signalProcesses = (group, seat, signal) => {
  let alive = false;
  for (const pid of [-group, ...markedProcesses(seat)]) {
    try {
      process.kill(pid, signal);
      alive = true;
    } catch {}
  }
  return alive;
};
let stopsOnSignals = false;
let stopping = false;
const removeFolder = (folder) => {
  rmSync(folder, { recursive: true, force: true });
  folders.delete(folder);
};
const waitGone = async (seats) => {
  const deadline = Date.now() + STOP_GRACE_MS;
  while (seats.some((signalSeat) => signalSeat(0)) && Date.now() < deadline) await new Promise((wake) => setTimeout(wake, 100));
};
const stopOnSignals = () => {
  if (stopsOnSignals) return;
  stopsOnSignals = true;
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(signal, async () => {
      if (stopping) return;
      stopping = true;
      const seats = [...running];
      for (const signalSeat of seats) signalSeat('SIGTERM');
      await Promise.allSettled([...cleanups].map(async (cleanup) => cleanup()));
      await waitGone(seats);
      for (const signalSeat of seats) signalSeat('SIGKILL');
      for (const folder of folders) removeFolder(folder);
      process.exit(128 + constants.signals[signal]);
    });
  }
};

const UUID = '[\\da-f]{8}-[\\da-f]{4}-[\\da-f]{4}-[\\da-f]{4}-[\\da-f]{12}';
// Codex prints the provider's error as an `ERROR:` line, among any its tools
// printed and before its shutdown warnings, and only the session log names the
// error's kind.
export function codexFailure(stdout, stderr, codexHome, startedAt = new Date()) {
  const text = `${stderr}\n${stdout}`.replace(/\u001b\[[\d;]*m/gu, '');
  const id = text.match(new RegExp(`^(?:thread|session) id: (${UUID})$`, 'mu'))?.[1] ?? text.match(new RegExp(`"thread_id":"(${UUID})"`, 'u'))?.[1];
  const errors = [...text.matchAll(/^ERROR: (.+)$/gmu)].map((match) => match[1]);
  for (const line of text.split('\n')) {
    try {
      const event = JSON.parse(line);
      if (event.type === 'turn.failed' && event.error?.message) errors.push(event.error.message);
    } catch {}
  }
  const logged = id ? loggedError(join(codexHome, 'sessions'), id, startedAt) : null;
  return { message: logged?.message ?? errors.at(-1) ?? null, kind: logged?.kind ?? null };
}

function loggedError(sessions, id, startedAt) {
  const day = (date) => join(String(date.getFullYear()), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0'));
  for (const folder of new Set([day(startedAt), day(new Date())])) {
    let name;
    try {
      name = readdirSync(join(sessions, folder)).find((entry) => entry.endsWith(`-${id}.jsonl`));
    } catch {}
    if (!name) continue;
    for (const line of readFileSync(join(sessions, folder, name), 'utf8').split('\n').reverse()) {
      if (!line.includes('"codex_error_info"')) continue;
      try {
        const { payload } = JSON.parse(line);
        const error = payload?.error ?? payload;
        return { kind: error?.codex_error_info ?? null, message: error?.message ?? null };
      } catch {
        return null;
      }
    }
    return null;
  }
  return null;
}

const AGY_SANDBOXED = "Every shell command you run stays in agy's sandbox. Never ask to run one outside it, even when the sandbox blocks the network, and never write outside the scratch folder, because either request ends your run with no answer.";
const AGY_UNBOXED = "Your shell runs outside agy's sandbox and reaches the network, so read a page with curl and clone a repository into the scratch folder to check a claim. Write only the scratch folder, and never push, post, comment or open a PR, because a review changes nothing outside it.";
const scratchBrief = (project, browser, prompt) =>
  `Your working directory is a scratch folder you may write. The project is ${project}: read it by absolute path and never write it. ${browser} For each probe that needs a browser, put its full script and commands in your answer so the lead can run it.\n\n${prompt}\n\nPut your whole answer in your final message. Nobody reads the files you write in the scratch folder, and it is deleted when you finish, so for each file you wrote there that your answer cites or runs, paste its full source and the commands that create any fixture it reads.`;

// An agy print run that reaches a permission it would ask for ends with no answer,
// so each action a seat must not take that a rule can name is denied, which fails
// only that call. A personal account ignores an unsandboxed(*) rule, so only the
// brief keeps a seat from asking to run a command outside the sandbox.
// Auto mode runs a command it judges safe outside the sandbox, so the seat runs in
// default mode with every command in the sandbox. agy checks the real path a tool
// touches, such as /private/var for macOS's /var.
const realPath = (path) => {
  try {
    return realpathSync(path);
  } catch {
    return path;
  }
};
const agySettings = (scratch, readOnly, offline) => ({
  agentMode: '',
  toolPermission: 'proceed-in-sandbox',
  permissions: {
    allow: ['read_file(*)', `write_file(${realPath(scratch)})`, ...(offline ? [] : ['read_url(*)', 'mcp(*)'])],
    deny: [...[...new Set(readOnly.map(realPath))].map((dir) => `write_file(${dir})`), 'execute_url(*)', ...(offline ? ['read_url(*)', 'mcp(*)'] : [])],
  },
});

// agy prints a Gemini filter block as its answer and exits 0.
const GEMINI_FILTERED = /^This request was blocked by Gemini's filters\b/u;
// agy streams one JSON event a line and ends with a result event that holds the answer.
const agyAnswer = (stdout) => {
  for (const line of stdout.split('\n').reverse()) {
    try {
      const event = JSON.parse(line);
      if (event.event === 'result') return event.result?.response ?? '';
    } catch {}
  }
  return '';
};
const gitLines = (dir, args) => {
  const run = spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8' });
  return run.status === 0 ? run.stdout.trim().split('\n') : null;
};
const linkedMainCheckout = (dir) => {
  const [top, common] = gitLines(dir, ['rev-parse', '--path-format=absolute', '--show-toplevel', '--git-common-dir']) ?? [];
  const main = common && dirname(common);
  return top && main !== top ? main : null;
};
const checkoutState = (dir) => {
  const hash = createHash('sha256');
  for (const args of [['status', '--porcelain'], ['diff', 'HEAD', '--binary']]) hash.update(spawnSync('git', ['-C', dir, ...args], { maxBuffer: 1 << 30 }).stdout ?? '');
  return hash.digest('hex');
};
const withoutPushOrGitHub = (env) => {
  const guard = mkdtempSync(join(tmpdir(), 'pstack-seat-'));
  mkdirSync(join(guard, 'gh'));
  mkdirSync(join(guard, 'hooks'));
  writeFileSync(join(guard, 'hooks/pre-push'), '#!/bin/sh\necho "a seat never pushes" >&2\nexit 1\n', { mode: 0o755 });
  for (const name of ['GH_TOKEN', 'GITHUB_TOKEN', 'GH_ENTERPRISE_TOKEN', 'GITHUB_ENTERPRISE_TOKEN']) delete env[name];
  const count = Number(env.GIT_CONFIG_COUNT ?? 0);
  const config = [['core.hooksPath', join(guard, 'hooks')], ['url.pstack-seat-no-push:.pushInsteadOf', '']];
  config.forEach(([key, value], i) => Object.assign(env, { [`GIT_CONFIG_KEY_${count + i}`]: key, [`GIT_CONFIG_VALUE_${count + i}`]: value }));
  Object.assign(env, { GH_CONFIG_DIR: join(guard, 'gh'), GIT_CONFIG_COUNT: String(count + config.length) });
  return guard;
};

// Codex writes its final message only to the -o file, and reads a piped stdin
// as more prompt, so stdin is closed and the answer comes only from that file.
// A child that ignores SIGTERM, or leaves a descendant holding its pipes, is
// killed and abandoned at the deadline.
export async function ask(runtime, prompt, { cwd = process.cwd(), effortRoot = cwd, timeout, idle = IDLE_SECONDS, model = MODELS[runtime], effort, hooks = false, userConfig = false, readDirs = [], bypass = false, reach = false, offline = false } = {}) {
  const max = maxEffort(effortRoot);
  effort = capEffort(effort ?? max, max);
  const managed = runtime === 'codex' && !bypass && !reach && managedCodexConfig();
  if (managed) return { runtime, ok: false, text: `${managed} would still load over the command line; refusing to run` };
  const scratch = reach || runtime === 'agy';
  const runCwd = scratch ? mkdtempSync(join(tmpdir(), 'pstack-reach-')) : cwd;
  if (reach) prompt = scratchBrief(cwd, 'Your sandbox cannot run a browser, because Chromium, Firefox and WebKit die there as they start, so never start or drive one, through Playwright or any other tool.', prompt);
  const unboxed = runtime === 'agy' && !offline;
  if (runtime === 'agy') prompt = scratchBrief(cwd, `${unboxed ? AGY_UNBOXED : AGY_SANDBOXED} Never start or drive a browser, through Playwright, your browser tools or any other tool.`, prompt);
  const launchArgs = bypass ? [] : reach ? [...NO_EXEC_RULES, '--skip-git-repo-check', '-c', 'web_search="live"'] : userConfig ? NO_EXEC_RULES : ISOLATED_CODEX_ARGS;
  stopOnSignals();
  const answerDir = mkdtempSync(join(tmpdir(), 'pstack-cross-'));
  folders.add(answerDir);
  if (scratch) folders.add(runCwd);
  const answerFile = join(answerDir, 'answer.txt');
  const sessionId = randomUUID();
  const [command, args] =
    runtime === 'claude'
      ? ['claude', ['-p', '--session-id', sessionId, '--model', model, ...(effort ? ['--effort', effort] : []), ...(hooks ? [] : ['--settings', '{"disableAllHooks":true}']), ...readDirs.flatMap((dir) => ['--add-dir', dir]), ...(offline ? ['--disallowed-tools', 'WebFetch,WebSearch', '--strict-mcp-config'] : []), '--permission-mode', 'plan', '--', prompt]]
      : runtime === 'agy'
      ? ['agy', ['-p', prompt, '--model', effort ? `${model}-${effort}` : model, '--settings', JSON.stringify(agySettings(runCwd, [cwd, ...readDirs], offline)), unboxed ? '--dangerously-skip-permissions' : '--sandbox', '--output-format', 'stream-json']]
      : [
          'codex',
          [
            'exec',
            ...launchArgs,
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
  const { CLAUDECODE: _, CODEX_PERMISSION_PROFILE: __, PSTACK_READ_ONLY: ___, ...env } = process.env;
  if (!bypass) env.PSTACK_READ_ONLY = '1';
  env[SEAT_MARK] = sessionId;
  const guard = unboxed ? withoutPushOrGitHub(env) : null;
  if (guard) folders.add(guard);
  const mainCheckout = unboxed ? linkedMainCheckout(cwd) : null;
  const mainBefore = mainCheckout && checkoutState(mainCheckout);
  // Codex resolves a relative CODEX_HOME against its own working directory.
  const codexHome = resolve(runCwd, env.CODEX_HOME || join(homedir(), '.codex'));
  return new Promise((resolve) => {
    let settled = false;
    let late = null;
    let watcher = null;
    const timers = [];
    const done = (answer) => {
      if (settled || stopping) return;
      settled = true;
      watcher?.kill();
      running.delete(signalSeat);
      for (const timer of timers) clearTimeout(timer);
      removeFolder(answerDir);
      if (scratch) removeFolder(runCwd);
      if (guard) removeFolder(guard);
      resolve(answer);
    };
    const startedAt = new Date();
    const child = spawn(command, args, { cwd: runCwd, env, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
    const signalSeat = (signal) => signalProcesses(child.pid, sessionId, signal);
    // A session restart can kill this helper outright, which no signal handler sees, and the child's process group outlives it.
    if (child.pid) {
      const runFolders = [answerDir, ...(scratch ? [runCwd] : []), ...(guard ? [guard] : [])];
      watcher = spawn(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), 'seat-watch.mjs'), String(process.pid), String(child.pid), sessionId, ...runFolders], { env: envOutlivingSeat(process.env), stdio: 'ignore', detached: true });
      watcher.unref();
    }
    running.add(signalSeat);
    const stop = (reason) => {
      if (late !== null) return;
      late = child.exitCode === null && child.signalCode === null ? reason : '';
      signalSeat('SIGTERM');
      timers.push(
        setTimeout(() => signalSeat('SIGKILL'), 2000),
        setTimeout(() => done({ runtime, ok: false, text: reason }), GIVE_UP_MS),
      );
    };
    let stdout = '';
    let stderr = '';
    let workedAt = Date.now();
    const decoder = new StringDecoder('utf8');
    const onStdout = (text) => {
      stdout += text;
      workedAt = Date.now();
    };
    child.stdout.on('data', (chunk) => onStdout(decoder.write(chunk)));
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
      workedAt = Date.now();
    });
    // A Claude run prints nothing until it answers, but writes its transcript as it works.
    let transcript = null;
    const lastWork = () => {
      if (runtime !== 'claude') return workedAt;
      transcript ??= claudeTranscript(sessionId);
      try {
        return Math.max(workedAt, transcript ? statSync(transcript).mtimeMs : 0);
      } catch {
        return workedAt;
      }
    };
    if (timeout) timers.push(setTimeout(() => stop(`no answer within ${timeout} seconds`), timeout * 1000));
    timers.push(
      setInterval(() => {
        if (Date.now() - lastWork() > idle * 1000) stop(`no sign of work for ${idle} seconds`);
      }, Math.min(30_000, idle * 250)),
    );
    child.on('error', (error) => done({ runtime, ok: false, text: error.message }));
    child.on('close', async (code, signal) => {
      onStdout(decoder.end());
      if (signalSeat('SIGTERM')) {
        await waitGone([signalSeat]);
        signalSeat('SIGKILL');
      }
      try {
        const text = (runtime === 'codex' ? (existsSync(answerFile) ? readFileSync(answerFile, 'utf8') : '') : runtime === 'agy' ? agyAnswer(stdout) : stdout).trim();
        const filtered = runtime === 'agy' && (GEMINI_FILTERED.test(text) || GEMINI_FILTERED.test(stdout.trim()));
        const touched = mainCheckout && checkoutState(mainCheckout) !== mainBefore;
        const warnings = [touched && `the seat changed the main checkout ${mainCheckout}; check it before using this answer.`].filter(Boolean);
        const ok = code === 0 && text && !late && !filtered && !warnings.length;
        const codex = runtime === 'codex' && !ok ? codexFailure(stdout, stderr, codexHome, startedAt) : null;
        // The Claude CLI prints a usage-limit refusal on stdout and nothing on stderr.
        const detail = codex?.message ?? (stderr.trim() || stdout.trim()).split('\n').slice(-5).join('\n');
        const extracted = text === stdout.trim() ? '' : text;
        const failure = warnings.length ? `${warnings.join('\n\n')}\n\n${text}` : `${late || (code === 0 ? 'no answer' : `exit ${code ?? signal}`)}: ${detail}${extracted && `\n\n${extracted}`}`;
        // A Claude seat without --effort runs at the machine's default, which only its transcript records.
        const ran = runtime === 'claude' ? claudeSessionRun(sessionId) : null;
        const seat = `${ran?.model ?? model} @${ran?.effort ?? effort ?? 'default'}`;
        done(ok ? { runtime, ok: true, text, seat } : { runtime, ok: false, text: failure, seat, ...(codex?.kind === 'cyber_policy' && { refused: 'security' }), ...(codex?.kind === 'usage_limit_exceeded' && { limited: true }), ...(filtered && { refused: 'safety' }) });
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
    else if (arg === '--help' || arg === '-h') help = true;
    else if (DASHED_WORD.test(arg)) refusal ??= `unknown flag ${arg}`;
    else positional.push(arg);
  }
  const { to = otherRuntime(), model, effort, promptFile } = values;
  const sources = [...positional, values.prompt, promptFile].filter((source) => source !== undefined);
  let prompt = sources[0] ?? '';
  const timeout = values.timeout === undefined ? undefined : Number(values.timeout);
  const usage = 'Usage: node .agents/pstack/cross.mjs [--to codex|claude|agy] [--model <model>] [--effort <level>] [--timeout <seconds>] [--reach | --bypass] (--prompt-file <path> | --prompt <prompt> | <prompt>)';
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
  if (lane && (to !== 'codex' || isolated)) {
    console.error(`${lane} runs only --to codex, without --ignore-user-config\n${usage}`);
    return 2;
  }
  if (sources.length > 1) {
    console.error(`give one prompt: a positional prompt, --prompt or --prompt-file\n${usage}`);
    return 2;
  }
  if (promptFile) prompt = readFileSync(promptFile, 'utf8');
  if (!prompt.trim() || !Object.hasOwn(MODELS, to) || !(timeout === undefined || timeout > 0)) {
    console.error(usage);
    return 2;
  }
  const answer = await ask(to, prompt, { timeout, model, effort, bypass, reach });
  (answer.ok ? console.info : console.error)(answer.text);
  if (answer.refused) console.error(`refused: ${answer.refused}`);
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
