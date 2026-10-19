#!/usr/bin/env node
// Reads the model and reasoning effort a Claude Code or Codex session ran at
// from its own transcript, because an agent cannot see its own effort.
// Installed by sync-pstack.
// Usage: node .agents/pstack/lead.mjs
//        (prints this session's "<model> @<effort>", or exits 1 when no
//        transcript holds this very command)

import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RECENT_MS = 10 * 60 * 1000;
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

/**
 * The session whose pending execution calls
 * hold `marker`, a string from the running command, with the model and effort
 * in force when it made that call. Returns null when no recent transcript, or
 * more than one, holds it.
 */
export function currentLead(marker, now = Date.now()) {
  const sources = [
    { files: filesUnder(join(claudeHome(), 'projects'), 1), runtime: 'claude' },
    { files: filesUnder(join(codexHome(), 'sessions'), 3), runtime: 'codex' },
  ];
  return leadFromTranscripts(marker, sources.flatMap(({ files, runtime }) =>
    files
      .filter((file) => now - statSync(file).mtimeMs < RECENT_MS)
      .map((file) => ({ runtime, transcript: file, text: readFileSync(file, 'utf8') })),
  ));
}

export function leadFromTranscripts(marker, transcripts) {
  const found = transcripts.flatMap(({ runtime, transcript, text }) => {
    let run = null;
    const pending = new Map();
    for (const line of text.split('\n')) {
      const record = parse(line);
      if (runtime === 'claude') {
        if (record?.type === 'assistant') {
          run = record.effort && record.message?.model ? { runtime, model: record.message.model, effort: record.effort, at: record.timestamp } : null;
          for (const block of Array.isArray(record.message?.content) ? record.message.content : []) {
            if (block.type === 'tool_use' && block.name === 'Bash' && typeof block.input?.command === 'string') pending.set(block.id, { command: block.input.command, run });
          }
        }
        if (record?.type === 'user') {
          for (const block of Array.isArray(record.message?.content) ? record.message.content : []) {
            if (block.type === 'tool_result') pending.delete(block.tool_use_id);
          }
        }
      } else if (runtime === 'codex') {
        if (record?.type === 'turn_context') run = record.payload?.model ? { runtime, model: record.payload.model, effort: record.payload.effort ?? 'default', at: record.timestamp } : null;
        if (record?.type !== 'response_item') continue;
        const call = record.payload;
        if (call?.type === 'function_call_output' || call?.type === 'custom_tool_call_output') pending.delete(call.call_id);
        if (call?.type === 'function_call' && call.name === 'exec_command') {
          const args = parse(call.arguments);
          if (typeof args?.cmd === 'string') pending.set(call.call_id, { command: args.cmd, run });
        }
        if (call?.type === 'custom_tool_call' && call.name === 'exec' && typeof call.input === 'string') pending.set(call.call_id, { command: call.input, run });
      }
    }
    const matches = [...pending.values()].filter(({ command }) => command.includes(marker));
    if (!matches.length) return [];
    const first = matches[0].run;
    return [{ ...(matches.every(({ run }) => run && first && leadLabel(run) === leadLabel(first)) ? first : {}), transcript }];
  });
  return found.length === 1 && found[0].model ? found[0] : null;
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
  const run = currentLead('lead.mjs');
  if (!run) {
    console.error('No single recent Claude Code or Codex transcript holds this command, so the effort is unknown.');
    process.exit(1);
  }
  console.info(leadLabel(run));
}
