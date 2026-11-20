#!/usr/bin/env node
// Claude Code hook that keeps wide reading out of the lead session, per pstack's principle-guard-the-context-window.
// PreToolUse counts the lead's read calls since its last edit, subagent dispatch or user prompt, and past LIMIT
// denies each new read once, naming the subagent route. Subagents (agent_id set) read freely.
// UserPromptSubmit with --reset zeroes the count.

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const LIMIT = 15;
const READ_TOOLS = new Set(['Read', 'Grep', 'Glob']);
const RESET_TOOLS = new Set([
  'Edit',
  'MultiEdit',
  'Write',
  'NotebookEdit',
  'Agent',
]);
const READ_COMMANDS = new Set([
  'cat',
  'sed',
  'head',
  'tail',
  'rg',
  'grep',
  'awk',
  'find',
  'ls',
  'wc',
  'nl',
  'jq',
]);
const READ_GIT = new Set(['grep', 'show', 'log', 'diff', 'blame']);

export function readKind(tool, input = {}) {
  if (RESET_TOOLS.has(tool)) return 'reset';
  if (READ_TOOLS.has(tool)) return 'read';
  if (tool !== 'Bash') return null;
  const words = String(input.command ?? '')
    .replace(/^\s*(?:cd\s+[^;&|]+(?:&&|;)\s*)+/u, '')
    .replace(/^(?:[A-Z_][A-Z0-9_]*=\S*\s+)+/u, '')
    .replace(/^(?:command|rtk proxy)\s+/u, '')
    .trim()
    .split(/\s+/u);
  if (words[0] === 'sed' && words.some((word) => /^-[a-zA-Z]*i/u.test(word))) {
    return 'reset';
  }
  if (READ_COMMANDS.has(words[0])) return 'read';
  if (
    words[0] === 'git' &&
    READ_GIT.has(
      words.find((word, index) => index > 0 && !word.startsWith('-'))
    )
  ) {
    return 'read';
  }
  return null;
}

const reason = (count) =>
  `Wide reading: this is the lead's read number ${count} since its last edit or subagent dispatch. Send the rest of the exploration to a subagent, such as an Agent with subagent_type Explore, with the question it must answer, then read in full only the code you change and the callers it can break. If you will edit this exact file next, run the same call again unchanged and it goes through.`;

function main(argv) {
  let event;
  try {
    event = JSON.parse(readFileSync(0, 'utf-8'));
  } catch {
    return 0;
  }
  if (event.agent_id || !event.session_id) return 0;
  const dir = join(tmpdir(), 'plate-read-budget');
  const file = join(
    dir,
    `${String(event.session_id).replace(/[^\w-]/gu, '')}.json`
  );
  let state;
  try {
    state = JSON.parse(readFileSync(file, 'utf-8'));
  } catch {
    state = { count: 0, retried: [] };
  }
  const save = () => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, JSON.stringify(state));
  };
  if (argv.includes('--reset')) {
    state = { count: 0, retried: [] };
    save();
    return 0;
  }
  const kind = readKind(event.tool_name, event.tool_input);
  if (kind === 'reset') {
    state = { count: 0, retried: [] };
    save();
    return 0;
  }
  if (kind !== 'read') return 0;
  state.count += 1;
  const key = createHash('sha1')
    .update(`${event.tool_name}\0${JSON.stringify(event.tool_input)}`)
    .digest('hex');
  if (state.count <= LIMIT || state.retried.includes(key)) {
    save();
    return 0;
  }
  state.retried.push(key);
  save();
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason(state.count),
      },
    })
  );
  return 0;
}

if (
  process.argv[1] &&
  realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  process.exitCode = main(process.argv.slice(2));
}
