#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: node .agents/pstack/reread.mjs --dir <snapshot-dir> <file> [...]
//        node .agents/pstack/reread.mjs --hook <file> [...]
// Prints each sentence that changed in each instruction file since this
// helper's last snapshot of it, then stores the new snapshot. A file with no
// snapshot yet is reported as a first read to take in full. --hook reads a
// Claude Code SessionStart payload from stdin, reads the files in the
// session's own checkout, keeps the session's snapshots under the main
// checkout's <plans>/artifacts/reread/<session_id> and prints that
// directory's absolute path to pass as --dir. On a startup or clear session
// it stays silent about first reads, which only seed the snapshots, and
// about missing files. After a compaction it also prints a reload: line
// naming each loaded skill that Claude Code's compaction restore cut short;
// it restores shorter skills in full.

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { hookPayload, sessionCheckout } from './checkout.mjs';

const BLOCK_START = /^\s*(?:[-*+]\s|\d+\.\s|#|\||>|```|~~~)/u;
const ONE_LINE = /^\s*(?:#|\||```|~~~)/u;
// Claude Code's compaction restores each invoked skill up to this many characters.
const RESTORED_SKILL_CHARS = 20_000;

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

// Claude Code writes injected skill text as isMeta user records, and the first
// one's nearest non-attachment ancestor is the Skill tool result or the typed
// /command. Typed built-ins that run locally, such as /model, get no isMeta record.
function loadedSkills(transcript) {
  let text;
  try {
    text = readFileSync(transcript, 'utf8');
  } catch {
    return [];
  }
  const records = text
    .split('\n')
    .flatMap((line) => {
      try {
        return [JSON.parse(line) ?? {}];
      } catch {
        return [];
      }
    });
  const byUuid = new Map(records.map((record) => [record.uuid, record]));
  const longest = new Map();
  for (const record of records) {
    if (record.type !== 'user' || !record.isMeta) continue;
    let source = byUuid.get(record.parentUuid);
    while (source?.type === 'attachment') source = byUuid.get(source.parentUuid);
    const content = source?.message?.content;
    const typed = typeof content === 'string' && content.trimStart().startsWith('<command-') && content.match(/<command-name>\/?([^<\s]+)<\/command-name>/u);
    const name = source?.toolUseResult?.success && typeof source.toolUseResult.commandName === 'string' ? source.toolUseResult.commandName : typed?.[1];
    if (!name) continue;
    const body = record.message?.content;
    const length = typeof body === 'string' ? body.length : (body ?? []).reduce((sum, part) => sum + (part.text?.length ?? 0), 0);
    longest.set(name, Math.max(longest.get(name) ?? 0, length));
  }
  return [...longest].filter(([, length]) => length > RESTORED_SKILL_CHARS).map(([name]) => name);
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

const shellWord = (word) => (/^[\w./@:=+-]+$/u.test(word) ? word : `'${word.replaceAll("'", "'\\''")}'`);

const args = process.argv.slice(2);
if (args[0] === '--hook') {
  const { cwd, session_id: session, source, transcript_path: transcript } = hookPayload();
  if (!session) process.exit(0);
  const checkout = sessionCheckout(cwd);
  if (checkout) process.chdir(checkout.root);
  const dir = resolve(checkout?.main ?? '.', plansDir(), 'artifacts', 'reread', session);
  const freshContext = ['startup', 'clear'].includes(source);
  // The hook runs before the next turn, so every skill load in the transcript
  // predates this compaction, even when its compact_boundary record lags.
  const skills = source === 'compact' && transcript ? loadedSkills(transcript) : [];
  const reload = skills.length > 0 ? [`reload: ${skills.join(', ')}. The compaction restored only the first 20,000 characters of these skills; as the Long runs rule says, reload through the Skill tool each one whose mode you are running before your next step.`] : [];
  const command = args.length > 1 ? [`Instruction snapshots: run node .agents/pstack/reread.mjs --dir ${[dir, ...args.slice(1)].map(shellWord).join(' ')} before each gate to compare against them.`] : [];
  console.log([...reread(dir, args.slice(1), { quiet: freshContext }), ...reload, ...command].join('\n'));
} else if (args[0] === '--dir' && args[1] && args.length > 2) {
  console.log(reread(args[1], args.slice(2)).join('\n'));
} else {
  console.error('Usage: node .agents/pstack/reread.mjs --dir <snapshot-dir> <file> [...] | --hook <file> [...]');
  process.exit(2);
}
