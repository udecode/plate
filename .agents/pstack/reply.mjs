#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/reply.mjs [--notified] <task.output> <dest>
// Writes a background subagent's final reply verbatim to dest: the text blocks
// of the last assistant message in its JSONL transcript, joined by a blank line.
// It copies only a message that holds text and whose last record's stop_reason
// is end_turn or stop_sequence, or, under --notified, which the caller passes
// once the runtime's completion notice has arrived, null on a message that calls
// no tool. It refuses an API error the runtime wrote in the agent's place, even
// under --notified, and never overwrites dest.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const notified = process.argv.includes('--notified');
const [source, dest] = process.argv.slice(2).filter((arg) => arg !== '--notified');
if (!source || !dest) {
  console.error('Usage: node .agents/pstack/reply.mjs [--notified] <task.output> <dest>');
  process.exit(2);
}

// A transcript writes each content block of one message as its own record.
const blocks = new Map();
let last;
let ending;
for (const [index, line] of readFileSync(source, 'utf8').split('\n').entries()) {
  if (!line.trim()) continue;
  let record;
  try {
    record = JSON.parse(line);
  } catch {
    console.error(`${source}:${index + 1} is not a JSON record; pass the subagent's JSONL output file`);
    process.exit(1);
  }
  if (record.type !== 'assistant' || !Array.isArray(record.message?.content)) continue;
  last = record.message.id ?? record.uuid;
  blocks.set(last, [...(blocks.get(last) ?? []), ...record.message.content]);
  ending = record;
}

const text = (blocks.get(last) ?? []).filter((block) => block.type === 'text').map((block) => block.text);
function refusal() {
  if (!ending) return 'holds no assistant message';
  if (ending.isApiErrorMessage || ending.message.model === '<synthetic>') return 'ends with an API error, not a reply';
  const callsTool = (blocks.get(last) ?? []).some((block) => block.type === 'tool_use');
  const ended = ['end_turn', 'stop_sequence'].includes(ending.message.stop_reason) || (notified && ending.message.stop_reason === null && !callsTool);
  if (!ended || text.length === 0) {
    return `ends with a message that stopped on ${ending.message.stop_reason ?? 'nothing yet'}, so the agent has not finished`;
  }
  return null;
}
const reason = refusal();
if (reason) {
  console.error(`${source} ${reason}`);
  process.exit(1);
}
mkdirSync(dirname(dest), { recursive: true });
try {
  writeFileSync(dest, text.join('\n\n'), { flag: 'wx' });
} catch (error) {
  console.error(error.code === 'EEXIST' ? `${dest} exists; a saved reply is never overwritten` : error.message);
  process.exit(1);
}
console.log(`Saved the reply (${text.join('\n\n').length} characters) to ${dest}`);
