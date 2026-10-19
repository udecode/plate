#!/usr/bin/env node
// Reads the model and reasoning effort a Claude Code or Codex session ran at
// from its own transcript, because an agent cannot see its own effort.
// Installed by sync-pstack.
// Usage: node .agents/pstack/lead.mjs
//        (prints this session's "<model> @<effort>", or exits 1 when no
//        runtime identity can be verified against its transcript)

import { existsSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TAIL_BYTES = 512 * 1024;

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
  const text = readFileSync(path, 'utf8');
  return text.slice(Math.max(0, text.length - TAIL_BYTES)).split('\n').filter(Boolean);
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
  const seen = new Set();
  while (pid > 1 && !seen.has(pid)) {
    seen.add(pid);
    const result = execFileSync('ps', ['-o', 'ppid=,comm=', '-p', String(pid)], { encoding: 'utf8' }).trim();
    const match = result.match(/^(\d+)\s+(.+)$/u);
    if (!match) return null;
    const name = basename(match[2]);
    if (name === 'claude' || name === 'codex') return name;
    pid = Number(match[1]);
  }
  return null;
}

export function invocationRun(identity, transcripts) {
  const { runtime, thread, session, invocation } = identity;
  if (runtime !== 'codex' || !ID.test(session ?? '') || !ID.test(thread ?? '') || !/^exec-[a-f0-9-]{36}$/u.test(invocation ?? '')) return null;
  const found = transcripts.flatMap(({ transcript, text }) => {
    const records = text.split('\n').map(parse).filter(Boolean);
    const metas = records.filter((record) => record.type === 'session_meta');
    if (metas.length !== 1) return [];
    const meta = metas[0].payload;
    if (meta?.id !== thread || meta.session_id !== session) return [];
    if (thread !== session && meta.parent_thread_id !== session) return [];
    const execution = records.findLast((record) => record.type === 'event_msg' && record.payload?.item?.id === invocation);
    if (execution && (execution.payload.thread_id !== thread || execution.payload.item.type !== 'CommandExecution' || execution.payload.item.status !== 'inProgress')) return [];
    const context = records.findLast((record) => record.type === 'turn_context');
    if (!context?.payload?.model || !context.payload.effort) return [];
    if (execution && execution.payload.turn_id !== context.payload.turn_id) return [];
    return [{ runtime, model: context.payload.model, effort: context.payload.effort, at: context.timestamp, transcript }];
  });
  return found.length === 1 ? found[0] : null;
}

export function currentLead() {
  try {
    const runtime = nearestRuntime();
    if (runtime !== 'codex' || ['CLAUDECODE', 'CLAUDE_SESSION_ID', 'CLAUDE_CODE_SESSION_ID', 'CLAUDE_PID', 'CLAUDE_CODE_ENTRYPOINT'].some((key) => process.env[key])) return null;
    const identity = { runtime, thread: process.env.CODEX_THREAD_ID, session: process.env.CODEX_SESSION_ID, invocation: process.env.CODEX_TOOL_CALL_ID };
    const id = identity.thread;
    if (!ID.test(id ?? '')) return null;
    const files = filesUnder(join(codexHome(), 'sessions'), 3).filter((file) => file.endsWith(`-${id}.jsonl`));
    return invocationRun(identity, files.map((transcript) => ({ transcript, text: readFileSync(transcript, 'utf8') })));
  } catch {
    return null;
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
  const run = currentLead();
  if (!run) {
    console.error('Runtime identity could not be verified against one transcript, so the effort is unknown.');
    process.exit(1);
  }
  console.info(leadLabel(run));
}
