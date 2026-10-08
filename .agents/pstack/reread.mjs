#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/reread.mjs --dir <snapshot-dir> <file> [...]
//        node .agents/pstack/reread.mjs --hook <file> [...]
// Prints each sentence that changed in each instruction file since this
// helper's last snapshot of it, then stores the new snapshot. A file with no
// snapshot yet is reported as a first read to take in full. --hook reads a
// Claude Code SessionStart payload from stdin, keeps the session's snapshots
// under <plans>/artifacts/reread/<session_id> and prints the directory to pass
// as --dir. On a startup or clear session it stays silent about first reads,
// which only seed the snapshots, and about missing files.

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const BLOCK_START = /^\s*(?:[-*+]\s|\d+\.\s|#|\||>|```|~~~)/u;
const ONE_LINE = /^\s*(?:#|\||```|~~~)/u;

function paragraphs(text) {
  const blocks = [];
  let joinable = false;
  for (const line of text.split('\n')) {
    if (!line.trim()) joinable = false;
    else if (joinable && !BLOCK_START.test(line)) blocks[blocks.length - 1] += ` ${line.trim()}`;
    else {
      blocks.push(line.trim());
      joinable = !ONE_LINE.test(line);
    }
  }
  return blocks;
}

const sentences = (text) =>
  paragraphs(text)
    .flatMap((block) => block.split(/(?<=[.!?])(?<!\b(?:cf|Dr|e\.g|etc|i\.e|Mr|Mrs|Ms|No|St|vs)\.)\s+(?=[A-Z0-9`*"'([])/u))
    .map((sentence) => sentence.trim())
    .filter(Boolean);

function changes(before, after) {
  const left = new Map();
  for (const sentence of sentences(before)) left.set(sentence, (left.get(sentence) ?? 0) + 1);
  const added = [];
  for (const sentence of sentences(after)) {
    if (left.get(sentence)) left.set(sentence, left.get(sentence) - 1);
    else added.push(sentence);
  }
  const removed = [...left].flatMap(([sentence, count]) => Array(count).fill(sentence));
  return { added, removed };
}

function plansDir() {
  const config = '.agents/pstack.json';
  return (existsSync(config) && JSON.parse(readFileSync(config, 'utf8')).plans) || 'docs/plans';
}

function reread(dir, files, { quiet = false } = {}) {
  mkdirSync(dir, { recursive: true });
  return files.flatMap((file) => {
    const path = resolve(file);
    if (!existsSync(path)) return quiet ? [] : [`${file}: missing`];
    const snapshot = join(dir, encodeURIComponent(path));
    const text = readFileSync(path, 'utf8');
    const first = !existsSync(snapshot);
    const since = first ? null : statSync(snapshot).mtime.toISOString();
    const { added, removed } = first ? { added: [], removed: [] } : changes(readFileSync(snapshot, 'utf8'), text);
    writeFileSync(snapshot, text);
    if (first) return quiet ? [] : [`${file}: first snapshot; read it in full`];
    if (added.length + removed.length === 0) return [`${file}: unchanged since ${since}`];
    return [
      `${file}: ${removed.length} sentence(s) removed and ${added.length} added since ${since}; each changed rule is its own todo`,
      ...removed.map((sentence) => `- ${sentence}`),
      ...added.map((sentence) => `+ ${sentence}`),
    ];
  });
}

const args = process.argv.slice(2);
if (args[0] === '--hook') {
  const { session_id: session, source } = JSON.parse(readFileSync(0, 'utf8') || '{}');
  if (!session) process.exit(0);
  const dir = join(plansDir(), 'artifacts', 'reread', session);
  const freshContext = ['startup', 'clear'].includes(source);
  console.log([...reread(dir, args.slice(1), { quiet: freshContext }), `Instruction snapshots: node .agents/pstack/reread.mjs --dir ${dir} <files> compares against them before each gate.`].join('\n'));
} else if (args[0] === '--dir' && args[1] && args.length > 2) {
  console.log(reread(args[1], args.slice(2)).join('\n'));
} else {
  console.error('Usage: node .agents/pstack/reread.mjs --dir <snapshot-dir> <file> [...] | --hook <file> [...]');
  process.exit(2);
}
