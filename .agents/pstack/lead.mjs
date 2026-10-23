#!/usr/bin/env node
// Reads the model and reasoning effort a Claude Code or Codex session ran at
// from its own transcript, because an agent cannot see its own effort.
// Installed by sync-pstack.
// Usage: node .agents/pstack/lead.mjs
//        (prints this session's "<model> @<effort>", or exits 1 when no
//        runtime identity can be verified against its transcript)

import { closeSync, existsSync, fstatSync, openSync, readdirSync, readFileSync, readlinkSync, readSync, realpathSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TAIL_CHARS = 512 * 1024;
const MAX_UTF8_BYTES_PER_CODE_UNIT = 3;

const claudeHome = () => join(process.env.HOME ?? homedir(), '.claude');
const codexHome = () => process.env.CODEX_HOME ?? join(process.env.HOME ?? homedir(), '.codex');

function filesUnder(dir, depth) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return depth > 0 ? filesUnder(path, depth - 1) : [];
    return entry.name.endsWith('.jsonl') ? [path] : [];
  });
}

function tailLines(path) {
  const fd = openSync(path, 'r');
  try {
    const { size } = fstatSync(fd);
    const buffer = Buffer.alloc(Math.min(size, MAX_UTF8_BYTES_PER_CODE_UNIT * TAIL_CHARS));
    readSync(fd, buffer, 0, buffer.length, size - buffer.length);
    const text = buffer.toString('utf8');
    return text.slice(Math.max(0, text.length - TAIL_CHARS)).split('\n').filter(Boolean);
  } finally {
    closeSync(fd);
  }
}

const parse = (line) => {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
};

// Claude Code stamps every assistant record with the effort it ran at.
function claudeRun(lines, upTo = lines.length - 1) {
  for (let index = upTo; index >= 0; index -= 1) {
    const record = parse(lines[index]);
    if (record?.type === 'assistant' && record.effort && record.message?.model) {
      return { runtime: 'claude', model: record.message.model, effort: record.effort, at: record.timestamp };
    }
  }
  return null;
}

/** The model and effort a finished `claude -p --session-id <id>` run used. */
export function claudeSessionRun(sessionId) {
  const projects = join(claudeHome(), 'projects');
  const path = filesUnder(projects, 1).find((file) => file.endsWith(`/${sessionId}.jsonl`));
  return path ? claudeRun(tailLines(path)) : null;
}

const ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/u;

function nearestRuntime() {
  let pid = process.ppid;
  let shell = null;
  const seen = new Set();
  while (pid > 1 && !seen.has(pid)) {
    seen.add(pid);
    const result = execFileSync('ps', ['-o', 'ppid=,comm=', '-p', String(pid)], { encoding: 'utf8' }).trim();
    const match = result.match(/^(\d+)\s+(.+)$/u);
    if (!match) return null;
    const name = basename(match[2]);
    if (name === 'claude' || name === 'codex') return { name, pid, shell };
    shell = pid;
    pid = Number(match[1]);
  }
  return null;
}

const EVAL = " && eval '";

export function bashCommandOf(shellArgv) {
  const start = shellArgv.indexOf(EVAL);
  if (start === -1) return null;
  let command = '';
  for (let index = start + EVAL.length; index < shellArgv.length; ) {
    if (shellArgv.startsWith(`'"'"'`, index)) {
      command += "'";
      index += 5;
    } else if (shellArgv[index] === "'") {
      return command;
    } else {
      command += shellArgv[index];
      index += 1;
    }
  }
  return null;
}

// A PreToolUse hook may rewrite a command before it runs, as rtk puts `rtk`
// before a tool it knows, while the transcript keeps the model's text.
export function ranAs(recorded, executed) {
  if (recorded === executed) return true;
  const words = recorded.split(/\s+/u).filter(Boolean);
  const run = executed.split(/\s+/u).filter(Boolean);
  if (run.length - words.length > Math.ceil(words.length / 2)) return false;
  let matched = 0;
  for (const word of run) if (word === words[matched]) matched += 1;
  return matched === words.length;
}

export function runtimeFolder() {
  const runtime = nearestRuntime();
  if (!runtime) return null;
  if (process.platform === 'linux') return readlinkSync(`/proc/${runtime.pid}/cwd`);
  const fields = execFileSync('lsof', ['-a', '-d', 'cwd', '-p', String(runtime.pid), '-Fn'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  return fields.split('\n').find((line) => line.startsWith('n'))?.slice(1) ?? null;
}

export function invocationRun(identity, transcripts) {
  const { runtime, thread, session, invocation } = identity;
  if (runtime !== 'codex') return { miss: 'the runtime is not codex' };
  if (!ID.test(thread ?? '')) return { miss: 'CODEX_THREAD_ID holds no thread id' };
  if (!ID.test(session ?? '')) return { miss: 'CODEX_SESSION_ID holds no session id' };
  if (!/^exec-[a-f0-9-]{36}$/u.test(invocation ?? '')) return { miss: 'CODEX_TOOL_CALL_ID holds no exec call id' };
  const results = transcripts.map(({ transcript, text }) => {
    const records = text.split('\n').map(parse).filter(Boolean);
    const metas = records.filter((record) => record.type === 'session_meta');
    if (metas.length !== 1) return { miss: `${transcript} holds ${metas.length} session_meta records, not one` };
    const meta = metas[0].payload;
    if (meta?.id !== thread || meta.session_id !== session) return { miss: `${transcript} belongs to another thread or session` };
    if (thread !== session && meta.parent_thread_id !== session) return { miss: `${transcript} is not a child of session ${session}` };
    const execution = records.findLast((record) => record.type === 'event_msg' && record.payload?.item?.id === invocation);
    if (execution && (execution.payload.thread_id !== thread || execution.payload.item.type !== 'CommandExecution' || execution.payload.item.status !== 'inProgress')) {
      return { miss: `${transcript} records this call as finished or in another thread` };
    }
    const context = records.findLast((record) => record.type === 'turn_context');
    if (!context?.payload?.model || !context.payload.effort) return { miss: `${transcript} names no model or effort for its turn` };
    if (execution && execution.payload.turn_id !== context.payload.turn_id) return { miss: `${transcript} records this call in another turn` };
    return { run: { runtime, model: context.payload.model, effort: context.payload.effort, at: context.timestamp, transcript } };
  });
  const matches = results.filter((result) => result.run);
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) return { miss: `${matches.length} transcripts of thread ${thread} match, not one` };
  return { miss: results.length ? results.map((result) => result.miss).join('; ') : `no transcript of thread ${thread} exists` };
}

// Claude Code appends a message's tool calls to the transcript once the whole
// message is written, which can be seconds after the first of them starts, and
// each call's result once that call ends.
function openClaudeCalls(transcripts) {
  return transcripts.flatMap(({ transcript, text }) => {
    const open = new Map();
    for (const record of text.split('\n').map(parse).filter(Boolean)) {
      const blocks = Array.isArray(record.message?.content) ? record.message.content : [];
      for (const block of blocks) {
        if (record.type === 'assistant' && block.type === 'tool_use' && block.name === 'Bash') open.set(block.id, { record, command: block.input?.command });
        if (record.type === 'user' && block.type === 'tool_result') open.delete(block.tool_use_id);
      }
    }
    return [...open.values()].map(({ record, command }) => ({ runtime: 'claude', model: record.message.model, effort: record.effort, at: record.timestamp, transcript, command }));
  });
}

const runningCalls = (calls, command) => (command === null ? calls : calls.filter((call) => typeof call.command === 'string' && ranAs(call.command, command)));

function claudeVerdict(found, command) {
  if (found.length === 0) return { miss: command === null ? 'no Bash call is open in the session transcripts' : 'no open Bash call in the session transcripts runs this command' };
  const [first] = found;
  if (found.some((call) => call.transcript !== first.transcript || call.model !== first.model || call.effort !== first.effort)) {
    return { miss: `${found.length} Bash calls are open, in ${[...new Set(found.map((call) => basename(call.transcript)))].join(', ')}, with more than one transcript, model or effort` };
  }
  if (!first.model || !first.effort) return { miss: `the open Bash call in ${first.transcript} names no model or effort` };
  const { runtime, model, effort, at, transcript } = first;
  return { run: { runtime, model, effort, at, transcript } };
}

export const claudeInvocationRun = (transcripts, command = null) => claudeVerdict(runningCalls(openClaudeCalls(transcripts), command), command);

// Stays under the Bash tool's default two-minute timeout, so a command whose
// record never lands still runs.
const OWN_CALL_WAIT_MS = 60_000;
const ANY_CALL_WAIT_MS = 1000;

function claudeLead(sessionId, command) {
  if (!ID.test(sessionId ?? '')) return { miss: 'CLAUDE_CODE_SESSION_ID holds no session id' };
  const path = filesUnder(join(claudeHome(), 'projects'), 1).find((file) => file.endsWith(`/${sessionId}.jsonl`));
  if (!path) return { miss: `no ${sessionId}.jsonl transcript is under ${join(claudeHome(), 'projects')}` };
  const files = [path, ...filesUnder(join(path.slice(0, -'.jsonl'.length), 'subagents'), 0)];
  const parsed = new Map();
  const read = () =>
    runningCalls(
      files.flatMap((transcript) => {
        const { size } = statSync(transcript);
        if (parsed.get(transcript)?.size !== size) parsed.set(transcript, { size, calls: openClaudeCalls([{ transcript, text: tailLines(transcript).join('\n') }]) });
        return parsed.get(transcript).calls;
      }),
      command
    );
  const deadline = performance.now() + (command === null ? ANY_CALL_WAIT_MS : OWN_CALL_WAIT_MS);
  let found = read();
  while (found.length === 0 && performance.now() < deadline) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
    found = read();
  }
  return claudeVerdict(found, command);
}

const commandOf = (pid) => bashCommandOf(execFileSync('ps', ['-ww', '-o', 'command=', '-p', String(pid)], { encoding: 'utf8' }));

export function findLead() {
  try {
    const nearest = nearestRuntime();
    const runtime = nearest?.name;
    if (runtime === 'claude') return claudeLead(process.env.CLAUDE_CODE_SESSION_ID, nearest.shell === null ? null : commandOf(nearest.shell));
    if (runtime !== 'codex') return { miss: 'no claude or codex process is an ancestor of this command' };
    const claudeKey = ['CLAUDECODE', 'CLAUDE_SESSION_ID', 'CLAUDE_CODE_SESSION_ID', 'CLAUDE_PID', 'CLAUDE_CODE_ENTRYPOINT'].find((key) => process.env[key]);
    if (claudeKey) return { miss: `codex runs this command, but ${claudeKey} is set` };
    const identity = { runtime, thread: process.env.CODEX_THREAD_ID, session: process.env.CODEX_SESSION_ID, invocation: process.env.CODEX_TOOL_CALL_ID };
    const files = ID.test(identity.thread ?? '') ? filesUnder(join(codexHome(), 'sessions'), 3).filter((file) => file.endsWith(`-${identity.thread}.jsonl`)) : [];
    return invocationRun(identity, files.map((transcript) => ({ transcript, text: readFileSync(transcript, 'utf8') })));
  } catch (error) {
    return { miss: error.message };
  }
}

export const leadLabel = (run) => `${run.model} @${run.effort}`;

export const EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max'];

export function maxEffort(root = process.cwd()) {
  const config = join(root, '.agents/pstack.json');
  const max = existsSync(config) ? JSON.parse(readFileSync(config, 'utf8')).maxEffort : undefined;
  if (max === undefined) return null;
  if (!EFFORTS.includes(max)) throw new Error(`${config}: maxEffort is ${JSON.stringify(max)}, not one of ${EFFORTS.join(', ')}`);
  return max;
}

export const capEffort = (effort, max) => (max && EFFORTS.indexOf(effort) > EFFORTS.indexOf(max) ? max : effort);

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { run, miss } = findLead();
  if (!run) {
    console.error(`Runtime identity could not be verified because ${miss}, so the effort is unknown.`);
    process.exit(1);
  }
  console.info(leadLabel(run));
}
