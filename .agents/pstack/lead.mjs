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

// Codex writes one turn_context per turn, ahead of that turn's tool calls.
function codexRun(lines, upTo = lines.length - 1) {
  for (let index = upTo; index >= 0; index -= 1) {
    const record = parse(lines[index]);
    if (record?.type === 'turn_context' && record.payload?.model) {
      return { runtime: 'codex', model: record.payload.model, effort: record.payload.effort ?? 'default', at: record.timestamp };
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

const claudeResult = (record) => record?.type === 'user';
const codexResult = (record) => /_output$/u.test(record?.payload?.type ?? '');

/**
 * The session whose pending tool calls, the ones after its last tool result,
 * hold `marker`, a string from the running command, with the model and effort
 * in force when it made that call. Returns null when no recent transcript, or
 * more than one, holds it.
 */
export function currentLead(marker, now = Date.now()) {
  const sources = [
    { files: filesUnder(join(claudeHome(), 'projects'), 1), read: claudeRun, isResult: claudeResult },
    { files: filesUnder(join(codexHome(), 'sessions'), 3), read: codexRun, isResult: codexResult },
  ];
  const found = sources.flatMap(({ files, read, isResult }) =>
    files
      .filter((file) => now - statSync(file).mtimeMs < RECENT_MS)
      .flatMap((file) => {
        const lines = tailLines(file);
        const pending = lines.findLastIndex((line) => isResult(parse(line))) + 1;
        const index = lines.findLastIndex((line, at) => at >= pending && line.includes(marker));
        const run = index === -1 ? null : read(lines, index);
        return run ? [{ ...run, transcript: file }] : [];
      }),
  );
  return found.length === 1 ? found[0] : null;
}

export const leadLabel = (run) => `${run.model} @${run.effort}`;

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const run = currentLead('lead.mjs');
  if (!run) {
    console.error('No single recent Claude Code or Codex transcript holds this command, so the effort is unknown.');
    process.exit(1);
  }
  console.info(leadLabel(run));
}
