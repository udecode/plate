#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: a Claude Code PreToolUse hook on Bash, `node .agents/pstack/guard.mjs`.
// Denies an agent's `git push` that forces or deletes the branch or the
// protected branch that .agents/pstack.json names: --force, -f, a short-flag
// cluster holding f or d, --force-with-lease, --mirror, --delete, a `+`
// refspec or a `:<branch>` refspec. A push with no refspec, or one whose
// destination is HEAD, targets the current branch. It reads every command in
// the line, including `bash -c` payloads and `$(...)` bodies, skips heredoc
// bodies, passes every other command, and prints the command for the owner to
// run in their own terminal. The owner's terminal never runs this hook.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CONFIG = new URL('../pstack.json', import.meta.url);
const GIT_VALUE_OPTIONS = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--config-env']);
const PUSH_VALUE_OPTIONS = new Set(['-o', '--push-option', '--repo', '--receive-pack', '--exec']);
const PREFIXES = new Set(['sudo', 'env', 'command', 'builtin', 'exec', 'nohup', 'time', 'timeout']);
const SHELLS = new Set(['bash', 'sh', 'zsh']);
const OPERATOR = /;|&&?|\|\|?|\n|[(){}]/uy;
const BARE = /(?:\\.|[^\s;&|(){}"'\\])+/uy;

function stripHeredocs(text) {
  const kept = [];
  let tag = null;
  for (const line of text.split('\n')) {
    if (tag) {
      if (line.trim() === tag) tag = null;
      continue;
    }
    kept.push(line);
    tag = line.match(/(?<!<)<<-?(?!<)\s*['"]?([A-Za-z_]\w*)['"]?/u)?.[1] ?? null;
  }
  return kept.join('\n');
}

function closingQuote(text, at, quote) {
  while (at < text.length && text[at] !== quote) at += quote === '"' && text[at] === '\\' ? 2 : 1;
  return Math.min(at, text.length);
}

function closingParen(text, at) {
  for (let depth = 1; at < text.length; at += 1) {
    if (text[at] === '\\') at += 1;
    else if (text[at] === "'" || text[at] === '"') at = closingQuote(text, at + 1, text[at]);
    else if (text[at] === '(') depth += 1;
    else if (text[at] === ')' && (depth -= 1) === 0) return at;
  }
  return text.length;
}

// Splits a command line into simple commands, each a list of words with
// quotes removed; a word made of adjacent quoted and bare parts stays one word.
function segments(source) {
  const text = stripHeredocs(source.replaceAll('\\\n', ' '));
  const result = [[]];
  let joining = false;
  const add = (word) => {
    if (joining && result.at(-1).length > 0) result.at(-1)[result.at(-1).length - 1] += word;
    else result.at(-1).push(word);
    joining = true;
  };
  let at = 0;
  while (at < text.length) {
    OPERATOR.lastIndex = at;
    BARE.lastIndex = at;
    if (text[at] === '"' || text[at] === "'") {
      const end = closingQuote(text, at + 1, text[at]);
      add(text.slice(at + 1, end));
      at = end + 1;
    } else if (OPERATOR.test(text)) {
      result.push([]);
      joining = false;
      at = OPERATOR.lastIndex;
    } else if (BARE.test(text)) {
      add(text.slice(at, BARE.lastIndex).replace(/\\(.)/gu, '$1'));
      at = BARE.lastIndex;
    } else {
      joining = false;
      at += 1;
    }
  }
  return result.filter((words) => words.length > 0);
}

function eachCommand(command, visit, depth = 0) {
  for (const words of segments(command)) {
    let start = 0;
    let wrapped = false;
    for (; start < words.length; start += 1) {
      if (PREFIXES.has(words[start])) wrapped = true;
      else if (!(wrapped && /^[-\d]/u.test(words[start])) && !/^[A-Za-z_]\w*=/u.test(words[start])) break;
    }
    visit(words.slice(start));
    if (depth >= 4) continue;
    for (const [index, word] of words.entries()) {
      if (SHELLS.has(word.split('/').at(-1)) && /^-[A-Za-z]*c[A-Za-z]*$/u.test(words[index + 1] ?? '') && words[index + 2]) {
        eachCommand(words[index + 2], visit, depth + 1);
      }
      for (let at = word.indexOf('$('); at !== -1; at = word.indexOf('$(', at + 2)) {
        eachCommand(word.slice(at + 2, closingParen(word, at + 2)), visit, depth + 1);
      }
    }
  }
}

// Returns the branches a forcing or deleting `git push` would rewrite, or null.
function rewrites(words, cwd) {
  if (words[0]?.split('/').at(-1) !== 'git') return null;
  let index = 1;
  let dir = cwd;
  while (words[index]?.startsWith('-')) {
    if (words[index] === '-C') dir = resolve(dir, words[index + 1] ?? '.');
    index += GIT_VALUE_OPTIONS.has(words[index]) ? 2 : 1;
  }
  if (words[index] !== 'push') return null;
  let forced = false;
  let every = false;
  let deleting = false;
  const positional = [];
  for (let at = index + 1; at < words.length; at += 1) {
    const word = words[at];
    if (word === '--') {
      positional.push(...words.slice(at + 1));
      break;
    }
    if (PUSH_VALUE_OPTIONS.has(word)) at += 1;
    else if (word === '--force' || word.startsWith('--force-with-lease')) forced = true;
    else if (word === '--mirror') forced = every = true;
    else if (word === '--all' || word === '--branches') every = true;
    else if (word === '--delete') deleting = true;
    else if (/^-[A-Za-z]+$/u.test(word)) {
      forced ||= word.includes('f');
      deleting ||= word.includes('d');
    } else if (!word.startsWith('-')) positional.push(word);
  }
  const current = () => spawnSync('git', ['-C', dir, 'branch', '--show-current'], { encoding: 'utf8' }).stdout.trim();
  const refspecs = positional.slice(1);
  const targets = [];
  for (const spec of refspecs) {
    const plain = spec.replace(/^\+/u, '');
    if (spec.startsWith('+')) forced = true;
    if (plain.startsWith(':')) deleting = true;
    const dst = plain.includes(':') ? plain.slice(plain.lastIndexOf(':') + 1) : plain;
    targets.push(dst === 'HEAD' || dst === '@' ? current() : dst.replace(/^refs\/heads\//u, ''));
  }
  if (!forced && !deleting) return null;
  if (every) return ['*'];
  return refspecs.length > 0 ? targets : [current()];
}

const input = JSON.parse(readFileSync(0, 'utf8'));
const command = input.tool_input?.command;
if (typeof command !== 'string' || !existsSync(CONFIG)) process.exit(0);
const config = JSON.parse(readFileSync(CONFIG, 'utf8'));
const kept = new Set([config.branch, config.protected].filter(Boolean));
const hits = new Set();
eachCommand(command, (words) => {
  for (const target of rewrites(words, input.cwd ?? process.cwd()) ?? []) {
    if (target === '*') for (const name of kept) hits.add(name);
    else if (kept.has(target)) hits.add(target);
  }
});
if (hits.size > 0) {
  const names = [...hits].join(' and ');
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: `guard.mjs: agents never force-push or delete ${names}. Tell the owner, who can run it in their own terminal if they want it:\n  ${command}`,
      },
    })
  );
}
