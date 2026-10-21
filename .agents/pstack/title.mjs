#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/title.mjs --hook
// Reads a Claude Code UserPromptSubmit payload from stdin and finds the title
// of this session's last set_session_title call on itself in its transcript.
// When that title still starts with 👀, the mark of a closed run, it prints a
// reminder to retitle the session before the first step, as rules/title.md
// says. It prints nothing otherwise, and never fails the prompt.

import { readFileSync } from 'node:fs';

const CLOSED = '👀';
const TOOL = 'mcp__ccd_session_mgmt__set_session_title';

const parse = (line) => {
  try {
    return JSON.parse(line);
  } catch {
    return undefined;
  }
};

const lastTitle = (transcript) => {
  const lines = transcript.split('\n');
  for (let index = lines.length - 1; index >= 0; index--) {
    if (!lines[index].includes(TOOL)) continue;
    const content = parse(lines[index])?.message?.content;
    const call = Array.isArray(content)
      ? content.findLast(
          (block) => block.type === 'tool_use' && block.name === TOOL && block.input?.session_id === 'self'
        )
      : undefined;
    if (call) return call.input.title;
  }

  return undefined;
};

if (!process.argv.includes('--hook')) {
  console.error('Usage: node .agents/pstack/title.mjs --hook');
  process.exit(2);
}

const path = parse(readFileSync(0, 'utf8'))?.transcript_path;
let transcript;
try {
  transcript = path ? readFileSync(path, 'utf8') : undefined;
} catch {
  transcript = undefined;
}
const title = transcript ? lastTitle(transcript) : undefined;

if (typeof title === 'string' && title.startsWith(CLOSED)) {
  console.info(
    `This session's title is still "${title}", the mark of a closed run. Before your first step, retitle it with this request's first stage, or with its bare name for an answer that needs no work, as .agents/pstack/rules/title.md says.`
  );
}
