#!/usr/bin/env node
// Installed by the sync-pstack skill.
// PreToolUse guard for Claude Code and Antigravity. Protects real boundaries:
// force-push/delete on branch/protected, direct push to branch bypassing land.mjs,
// gh pr create into branch, workflow run approvals, main-checkout edits while on
// branch/protected (outside plans/artifacts), and companion-repo destructive git.
// Fails open if .agents/pstack.json is missing, conflicted, or invalid JSON.

import { spawnSync } from 'node:child_process';
import { existsSync, realpathSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONFIG = new URL('../pstack.json', import.meta.url);
const HERE_DIR = dirname(fileURLToPath(import.meta.url));
const BASE_SYNC = /(?:^|__)sync_with_base_branch$/u;
const EDIT_TOOLS = new Set(['Edit', 'MultiEdit', 'Write', 'NotebookEdit']);
const GIT_VAL = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--config-env']);
const PUSH_VAL = new Set(['-o', '--push-option', '--repo', '--receive-pack', '--exec']);
const PREFIXES = new Set(['sudo', 'env', 'command', 'builtin', 'exec', 'nohup', 'time', 'timeout', '!', 'if', 'then', 'elif', 'else', 'do']);
const RUN_APPROVAL = /actions\/runs\/.*?\/(?:approve|pending_deployments)\b/u;
const MOVES = new Set(['checkout', 'switch', 'reset', 'merge', 'rebase']);

let agyHook = false;
const allow = () => {
  if (agyHook) process.stdout.write('{"decision":"allow"}');
  process.exit(0);
};
const deny = (reason) => {
  process.stdout.write(
    JSON.stringify(
      agyHook
        ? { decision: 'deny', reason: `guard.mjs: ${reason}` }
        : { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: `guard.mjs: ${reason}` } },
    ),
  );
  process.exit(0);
};

function loadConfig() {
  if (!existsSync(CONFIG)) return null;
  try {
    const raw = readFileSync(CONFIG, 'utf8');
    if (/^(?:<<<<<<<|=======|>>>>>>>)/mu.test(raw)) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

const git = (dir, ...args) => {
  const run = spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', timeout: 5000 });
  return run.error || run.status !== 0 ? null : run.stdout.replace(/\n$/u, '');
};
const sameDir = (a, b) => {
  try {
    const [x, y] = [statSync(a), statSync(b)];
    return x.dev === y.dev && x.ino === y.ino;
  } catch {
    return false;
  }
};
const realPath = (p) => {
  let cur = resolve(p);
  const tail = [];
  while (!existsSync(cur) && dirname(cur) !== cur) {
    tail.unshift(cur.slice(dirname(cur).length).replace(/^\/+/u, ''));
    cur = dirname(cur);
  }
  try {
    return join(realpathSync.native(cur), ...tail);
  } catch {
    return resolve(p);
  }
};
const otherRepo = (dir) => {
  const common = git(dir, 'rev-parse', '--path-format=absolute', '--git-common-dir');
  const ours = git(HERE_DIR, 'rev-parse', '--path-format=absolute', '--git-common-dir');
  return Boolean(common && ours && !sameDir(common, ours));
};

function editDenial(config, file, cwd) {
  if (typeof config.branch !== 'string' || !config.branch) return null;
  const common = git(HERE_DIR, 'rev-parse', '--path-format=absolute', '--git-common-dir');
  if (!common) return null;
  const main = realPath(dirname(common));
  const raw = file.trim().replace(/^~(?=\/|$)/u, homedir());
  const target = realPath(isAbsolute(raw) ? raw : resolve(cwd, raw));
  const rel = relative(main, target);
  if (!rel || rel.startsWith('..') || isAbsolute(rel)) return null;
  if (rel.split(sep)[0] !== '.git') {
    let dir = target;
    while (!existsSync(dir) || !statSync(dir).isDirectory()) dir = dirname(dir);
    const top = git(dir, 'rev-parse', '--show-toplevel');
    if (!top || !sameDir(top, main)) return null;
  }
  const branch = git(main, 'branch', '--show-current');
  if (branch === null || (branch !== '' && ![config.branch, config.protected].includes(branch))) return null;
  const artifacts = config.plans && join(config.plans, 'artifacts') + sep;
  if (artifacts && rel.startsWith(artifacts)) return null;
  return `agents never edit the main checkout on ${branch || 'a detached HEAD'}, here ${rel}. Edit in your worktree and land with land.mjs.${artifacts ? ` Only ${artifacts} is writable in the main checkout.` : ''}`;
}

function splitCommands(source) {
  const clean = source.replaceAll('\\\n', ' ');
  const cmds = [[]];
  let word = '';
  let quote = null;
  let inWord = false;
  const pushWord = () => {
    if (inWord) cmds.at(-1).push(word);
    word = '';
    inWord = false;
  };
  for (let i = 0; i < clean.length; i += 1) {
    const ch = clean[i];
    if (quote) {
      if (quote === '"' && ch === '\\' && i + 1 < clean.length) word += clean[++i];
      else if (ch === quote) quote = null;
      else word += ch;
      continue;
    }
    if (ch === '\\' && i + 1 < clean.length) {
      word += clean[++i];
      inWord = true;
    } else if (ch === "'" || ch === '"') {
      quote = ch;
      inWord = true;
    } else if (/[\s]/u.test(ch)) {
      pushWord();
      if (ch === '\n' && cmds.at(-1).length) cmds.push([]);
    } else if (';|&'.includes(ch)) {
      pushWord();
      if ((ch === '&' || ch === '|') && clean[i + 1] === ch) i += 1;
      if (cmds.at(-1).length) cmds.push([]);
    } else {
      word += ch;
      inWord = true;
    }
  }
  pushWord();
  return cmds.filter((words) => words.length > 0);
}

function parseGit(words, cwd) {
  if (words[0]?.split('/').at(-1) !== 'git') return null;
  let i = 1;
  let dir = cwd;
  let gitDir = null;
  while (words[i]?.startsWith('-')) {
    if (words[i] === '-C' && words[i + 1] && !/[$`*?[]/u.test(words[i + 1])) dir = resolve(dir, words[i + 1]);
    if (words[i] === '--git-dir') gitDir = words[i + 1] ?? '';
    if (words[i].startsWith('--git-dir=')) gitDir = words[i].slice(10);
    i += GIT_VAL.has(words[i]) ? 2 : 1;
  }
  return { sub: words[i], args: words.slice(i + 1), dir, gitDir };
}

const globMatches = (pat, name) => new RegExp(`^${pat.split('*').map((p) => p.replace(/[.+?^${}()|[\]\\]/gu, '\\$&')).join('.*')}$`, 'u').test(name);

function checkPush(words, cwd) {
  const call = parseGit(words, cwd);
  if (call?.sub !== 'push' || otherRepo(call.dir)) return null;
  let forced = false;
  let every = false;
  let deleting = false;
  let dry = false;
  let tags = false;
  const pos = [];
  for (let i = 0; i < call.args.length; i += 1) {
    const w = call.args[i];
    if (w === '--') {
      pos.push(...call.args.slice(i + 1));
      break;
    }
    if (PUSH_VAL.has(w)) i += 1;
    else if (w === '--force' || w.startsWith('--force-with-lease')) forced = true;
    else if (w === '--mirror') forced = every = true;
    else if (w === '--all' || w === '--branches') every = true;
    else if (w === '--delete') deleting = true;
    else if (w === '--dry-run') dry = true;
    else if (w === '--tags') tags = true;
    else if (/^-[A-Za-z]+$/u.test(w)) {
      forced ||= w.includes('f');
      deleting ||= w.includes('d');
      dry ||= w.includes('n');
    } else if (!w.startsWith('-')) pos.push(w);
  }
  const current = () => git(call.dir, 'branch', '--show-current') ?? '';
  const specs = pos.slice(1);
  const targets = specs.map((spec) => {
    const plain = spec.replace(/^\+/u, '');
    if (spec.startsWith('+')) forced = true;
    if (plain === ':') return '*';
    if (plain.startsWith(':')) deleting = true;
    const dst = plain.includes(':') ? plain.slice(plain.lastIndexOf(':') + 1) : plain;
    return dst === 'HEAD' || dst === '@' ? current() : dst.replace(/^refs\/heads\//u, '');
  });
  const rewriting = forced || deleting;
  if (every) return { targets: ['*'], rewriting, dry };
  return { targets: specs.length ? targets : tags ? [] : [current()], rewriting, dry };
}

function opensPr(words, branch, dir) {
  if (words[0]?.split('/').at(-1) !== 'gh' || words[1] !== 'pr' || !['create', 'new'].includes(words[2])) return false;
  let base = null;
  let repo = false;
  for (let i = 3; i < words.length; i += 1) {
    const w = words[i];
    if (w === '--help' || w === '-h') return false;
    if (w === '--repo' || w === '-R' || w.startsWith('--repo=') || /^-R./u.test(w)) repo = true;
    if (w === '--base' || w === '-B') base = words[++i] ?? '';
    else if (w.startsWith('--base=')) base = w.slice(7);
    else if (/^-B./u.test(w)) base = w.slice(2);
  }
  if (!repo && otherRepo(dir)) return false;
  return base === null || base.replace(/^refs\/heads\//u, '') === branch;
}

function companionDenial(words, cwd, companion) {
  const call = parseGit(words, cwd);
  if (!call || !companion?.dir || (call.sub !== 'clean' && !MOVES.has(call.sub))) return null;
  const top = git(call.dir, 'rev-parse', '--show-toplevel');
  if (!top || !existsSync(join(top, companion.dir))) return null;
  const flags = call.args.filter((w) => /^-[A-Za-z]+$/u.test(w)).join('');
  if (call.sub === 'clean' && !flags.includes('n') && !call.args.includes('--dry-run')) {
    if (call.gitDir && sameDir(resolve(call.dir, call.gitDir), join(top, companion.dir))) return `git clean through ${companion.dir} deletes public files. Clean through this checkout's own git instead.`;
    if (/[xX]/u.test(flags)) return `git clean -x or -X in ${top} deletes files ${companion.dir} tracks. Run without -x/-X, or with -n.`;
  }
  if (!MOVES.has(call.sub) || call.gitDir !== null) return null;
  const dd = call.args.indexOf('--');
  if (dd !== -1 && dd < call.args.length - 1 && ['checkout', 'reset'].includes(call.sub)) return null;
  for (const rev of (dd === -1 ? call.args : call.args.slice(0, dd)).filter((w) => !w.startsWith('-'))) {
    if (git(call.dir, 'rev-parse', '--verify', '--quiet', `${rev}^{commit}`) === null) continue;
    if (git(call.dir, 'cat-file', '-e', `${rev}:${companion.list}`) !== null) continue;
    return `${rev} has no ${companion.list}, so moving ${top} there overwrites files ${companion.dir} tracks. Use \`git show ${rev}:<path>\` or a detached worktree.`;
  }
  return null;
}

function normalizeInput(raw) {
  if (!raw?.toolCall) return raw ?? {};
  agyHook = true;
  const { name, args = {} } = raw.toolCall;
  if (name === 'run_command') return { ...raw, tool_name: 'Bash', tool_input: { command: args.CommandLine } };
  if (name === 'write_file') return { ...raw, tool_name: 'Write', tool_input: { file_path: args.Path } };
  if (name === 'edit_file') return { ...raw, tool_name: 'Edit', tool_input: { file_path: args.Path } };
  return { ...raw, tool_name: name, tool_input: args };
}

let rawInput;
try {
  rawInput = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  allow();
}
const input = normalizeInput(rawInput);
const config = loadConfig();
if (!config) allow();

if (EDIT_TOOLS.has(input.tool_name)) {
  const file = input.tool_input?.file_path ?? input.tool_input?.notebook_path;
  if (typeof file === 'string') {
    const reason = editDenial(config, file, input.cwd ?? process.cwd());
    if (reason) deny(reason);
  }
  allow();
}
if (BASE_SYNC.test(input.tool_name ?? '')) {
  deny(`base-branch sync fails on .claude files; run \`git fetch origin ${config.branch} && git rebase origin/${config.branch}\` in this worktree instead.`);
}
const command = input.tool_input?.command;
if (typeof command !== 'string') allow();

const kept = new Set([config.branch, config.protected].filter(Boolean));
const hits = new Set();
let direct = false;
let pr = false;
let lost = null;
let dir = input.cwd ?? process.cwd();
for (const raw of splitCommands(command)) {
  let start = 0;
  let wrapped = false;
  while (start < raw.length) {
    if (PREFIXES.has(raw[start])) {
      wrapped = true;
      start += 1;
    } else if (/^[A-Za-z_]\w*=/u.test(raw[start]) || (wrapped && /^[-\d]/u.test(raw[start]))) {
      start += 1;
    } else break;
  }
  const prefix = raw.slice(0, start);
  const words = raw.slice(start);
  if (!words.length) continue;
  if (words[0] === 'cd' && words[1] && !/[$`*?[]/u.test(words[1]) && words[1] !== '-') {
    const next = words[1] === '~' || words[1].startsWith('~/') ? join(homedir(), words[1].slice(2)) : resolve(dir, words[1]);
    if (existsSync(next)) dir = next;
    continue;
  }
  lost ??= companionDenial(words, dir, config.companion);
  const push = checkPush(words, dir);
  for (const target of push?.targets ?? []) {
    for (const name of target.includes('*') ? [...kept].filter((b) => globMatches(target, b)) : [target]) {
      if (push.rewriting && kept.has(name)) hits.add(name);
      else if (!push.rewriting && name === config.branch && !push.dry && !prefix.includes('PSTACK_RELEASE=1')) direct = true;
    }
  }
  pr ||= opensPr(words, config.branch, dir);
}
const reasons = [];
if (hits.size > 0) reasons.push(`agents never force-push or delete ${[...hits].join(' and ')}. Ask the owner to run it:\n  ${command}`);
if (direct) reasons.push(`agents push ${config.branch} only through \`node .agents/pstack/land.mjs\` from a worktree:\n  ${command}`);
if (lost) reasons.push(lost);
if (pr) reasons.push(`agents open a PR into ${config.branch} only through \`node .agents/pstack/land.mjs\`. Use --base for a stacked PR.`);
if (RUN_APPROVAL.test(command.replace(/['"\\]/gu, ''))) reasons.push(`agents never approve a workflow run. Tell the user which runs wait for approval:\n  ${command}`);
if (reasons.length > 0) deny(reasons.join('\n'));
allow();
