#!/usr/bin/env node
// Installed by the sync-pstack skill.
// Usage: a Claude Code PreToolUse hook on Bash, Edit, MultiEdit, Write,
// NotebookEdit and the desktop app's sync_with_base_branch tool,
// `node .agents/pstack/guard.mjs`.
// Denies an agent's `git push` that forces or deletes the branch or the
// protected branch that .agents/pstack.json names: --force, -f, a short-flag
// cluster holding f or d, --force-with-lease, --mirror, --delete, a `+`
// refspec or a `:<branch>` refspec. A push with no refspec, or one whose
// destination is HEAD, targets the current branch. It reads every command in
// the line, including `bash -c` payloads and `$(...)` bodies, skips heredoc
// bodies, passes every other command, and prints the command for the owner to
// run in their own terminal. The owner's terminal never runs this hook. It
// also denies the app's base-branch sync, which refuses the branch whenever it
// changes .claude files, and names the rebase to run instead. On Edit,
// MultiEdit, Write and NotebookEdit it denies a file inside the main checkout,
// its .git folder included, while that checkout is on the branch or the
// protected branch, except the suggested-task ledger and the plans artifacts
// directory; a linked worktree, even one nested in the main checkout's folder,
// is its own checkout and passes. It refuses the edit when git or the guard
// itself fails, because a hook that exits with an error lets the edit through.

import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, readlinkSync, realpathSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONFIG = new URL('../pstack.json', import.meta.url);
const BASE_SYNC = /(?:^|__)sync_with_base_branch$/u;
const EDIT_TOOLS = new Set(['Edit', 'MultiEdit', 'Write', 'NotebookEdit']);
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

const git = (dir, ...args) => {
  const run = spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', timeout: 1000, killSignal: 'SIGKILL' });
  return run.error || run.status !== 0 ? null : run.stdout.replace(/\n$/u, '');
};
const sameDir = (a, b) => {
  const [x, y] = [statSync(a), statSync(b)];
  return x.dev === y.dev && x.ino === y.ino;
};

function resolvePhysically(path) {
  let parts = path.split(sep).filter(Boolean);
  let current = sep;
  for (let index = 0, hops = 0; index < parts.length; index += 1) {
    if (parts[index] === '.') continue;
    if (parts[index] === '..') {
      current = dirname(current);
      continue;
    }
    const next = join(current, parts[index]);
    let link;
    try {
      link = lstatSync(next).isSymbolicLink();
    } catch {
      current = next;
      continue;
    }
    if (!link) {
      current = realpathSync.native(next);
      continue;
    }
    if ((hops += 1) > 40) throw new Error(`too many symlinks at ${next}`);
    const target = readlinkSync(next);
    parts = [...target.split(sep).filter(Boolean), ...parts.slice(index + 1)];
    if (isAbsolute(target)) current = sep;
    index = -1;
  }
  return current;
}

function mainCheckoutPath(file, main) {
  let root = file;
  while (!existsSync(root) || !sameDir(root, main)) {
    if (dirname(root) === root) return null;
    root = dirname(root);
  }
  const path = relative(root, file);
  if (path.split(sep)[0] === '.git') return path;
  let dir = file;
  while (!existsSync(dir) || !statSync(dir).isDirectory()) dir = dirname(dir);
  const top = git(dir, 'rev-parse', '--show-toplevel');
  if (top === null) throw new Error(`git could not read ${dir}`);
  return sameDir(top, main) ? path : null;
}

const deny = (reason) => {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: `guard.mjs: ${reason}` },
    })
  );
  process.exit(0);
};

// Claude Code trims the path, expands ~ and resolves it against cwd before the
// hook sees it and before it writes, so the cleaned spelling is the one that
// lands. A host that wrote the raw spelling would follow links before any ..,
// so a raw path holding . or .. is walked too, and either walk can deny.
function editDenial(config, file, cwd) {
  if (typeof config.branch !== 'string' || config.branch === '') throw new Error('.agents/pstack.json names no branch');
  const common = git(dirname(fileURLToPath(import.meta.url)), 'rev-parse', '--path-format=absolute', '--git-common-dir');
  if (common === null) return 'git could not read this repository, so the guard cannot tell whether this edit lands in the main checkout. Fix git, then retry.';
  const main = dirname(common);
  const raw = file.trim().replace(/^~(?=\/|$)/u, homedir());
  const spellings = new Set([resolve(cwd, raw), isAbsolute(raw) ? raw : `${cwd}${sep}${raw}`]);
  const hits = [...spellings].map((spelling) => mainCheckoutPath(resolvePhysically(spelling), main)).filter((path) => path !== null);
  if (hits.length === 0) return null;
  const branch = git(main, 'branch', '--show-current');
  if (branch === null) return "git could not read the main checkout's branch, so the guard refuses this edit there. Fix git, then retry.";
  if (branch !== '' && ![config.branch, config.protected].includes(branch)) return null;
  const ledger = config.plans && join(config.plans, 'suggested-tasks.decisions.tsv');
  const artifacts = config.plans && join(config.plans, 'artifacts') + sep;
  const path = hits.find((hit) => hit !== ledger && !(artifacts && hit.startsWith(artifacts)));
  if (path === undefined) return null;
  const here = git(cwd, 'rev-parse', '--show-toplevel');
  const worktree =
    path.split(sep)[0] !== '.git' && here !== null && !sameDir(here, main) && sameDir(git(here, 'rev-parse', '--path-format=absolute', '--git-common-dir') ?? here, common) ? here : null;
  return `agents never edit the main checkout on ${branch || 'a detached HEAD'}, here ${path}. ${worktree ? `Edit ${join(worktree, path)} in your worktree instead` : 'Move to your own worktree, such as with EnterWorktree, edit there'}, and land it with land.mjs.${ledger ? ` Only ${ledger} and ${artifacts} are writable in the main checkout.` : ''}`;
}

const input = JSON.parse(readFileSync(0, 'utf8'));
if (!existsSync(CONFIG)) process.exit(0);
if (EDIT_TOOLS.has(input.tool_name)) {
  const file = input.tool_input?.file_path ?? input.tool_input?.notebook_path;
  if (typeof file !== 'string') process.exit(0);
  let reason;
  try {
    reason = editDenial(JSON.parse(readFileSync(CONFIG, 'utf8')), file, input.cwd ?? process.cwd());
  } catch (error) {
    reason = `the guard failed (${error.message}), so it refuses this edit. Fix the path, git or .agents/pstack.json, then retry.`;
  }
  if (reason) deny(reason);
  process.exit(0);
}
const config = JSON.parse(readFileSync(CONFIG, 'utf8'));
if (BASE_SYNC.test(input.tool_name ?? '')) {
  deny(
    `the app's base-branch sync refuses origin/${config.branch} whenever it changes .claude files. Commit your work, then run \`git fetch origin ${config.branch} && git rebase origin/${config.branch}\` in this worktree; land.mjs also rebases before it pushes.`
  );
}
const command = input.tool_input?.command;
if (typeof command !== 'string') process.exit(0);
const kept = new Set([config.branch, config.protected].filter(Boolean));
const hits = new Set();
eachCommand(command, (words) => {
  for (const target of rewrites(words, input.cwd ?? process.cwd()) ?? []) {
    if (target === '*') for (const name of kept) hits.add(name);
    else if (kept.has(target)) hits.add(target);
  }
});
if (hits.size > 0) {
  deny(`agents never force-push or delete ${[...hits].join(' and ')}. Tell the owner, who can run it in their own terminal if they want it:\n  ${command}`);
}
