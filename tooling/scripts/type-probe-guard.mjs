#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';

const SEGMENT_BREAK = /&&|\|\||[;|\n]/u;
const WORD = /"[^"]*"|'[^']*'|\S+/gu;

const unquote = (word) => word.replace(/^(["'])(.*)\1$/u, '$2');

const isTracked = (file) =>
  spawnSync(
    'git',
    ['-C', dirname(file), 'ls-files', '--error-unmatch', '--', basename(file)],
    { stdio: 'ignore' }
  ).status === 0;

const readConfig = (file) => {
  try {
    return JSON.parse(
      readFileSync(file, 'utf-8')
        .replace(/"(?:\\.|[^"\\])*"|\/\/[^\n]*|\/\*[\s\S]*?\*\//gu, (match) =>
          match.startsWith('"') ? match : ''
        )
        .replace(/,(\s*[\]}])/gu, '$1')
    );
  } catch {
    return undefined;
  }
};

const missingFile = (entry, base) =>
  !/[*?[{]/u.test(entry) &&
  !existsSync(isAbsolute(entry) ? entry : join(base, entry));

const unmatchedInclude = (config) => {
  if (!existsSync(config) || isTracked(config)) return undefined;
  let owner = config;
  let data = readConfig(owner);
  while (
    data &&
    data.include === undefined &&
    typeof data.extends === 'string' &&
    data.extends.startsWith('.')
  ) {
    const base = resolve(dirname(owner), data.extends);
    owner = base.endsWith('.json') ? base : `${base}.json`;
    data = readConfig(owner);
  }
  if (!Array.isArray(data?.include)) return undefined;
  return data.include.find(
    (entry) => typeof entry === 'string' && missingFile(entry, dirname(owner))
  );
};

const runDirectory = (words, compiler, directory) => {
  let current = directory;
  for (let index = 0; index < compiler; index += 1) {
    const word = words[index];
    const inline = /^--dir=(.+)$/u.exec(word)?.[1];
    if (inline) current = resolve(current, inline);
    else if ((word === '-C' || word === '--dir') && words[index + 1]) {
      current = resolve(current, words[index + 1]);
    }
  }
  return current;
};

const configOf = (target, cwd) => {
  const path = resolve(cwd, target);
  return existsSync(path) && statSync(path).isDirectory()
    ? join(path, 'tsconfig.json')
    : path;
};

function emptyProbeRun(command, cwd) {
  let directory = cwd;
  for (const segment of String(command).split(SEGMENT_BREAK)) {
    const words = (segment.match(WORD) ?? []).map(unquote);
    if (words[0] === 'cd' && words[1]) {
      directory = resolve(directory, words[1]);
      continue;
    }
    const compiler = words.findIndex((word) => basename(word) === 'tsc');
    if (compiler === -1) continue;
    const base = runDirectory(words, compiler, directory);
    for (let index = compiler + 1; index < words.length; index += 1) {
      const word = words[index];
      const target =
        /^--project=(.+)$/u.exec(word)?.[1] ??
        (word === '-p' || word === '--project' ? words[index + 1] : undefined);
      if (!target) continue;
      const config = configOf(target, base);
      const entry = unmatchedInclude(config);
      if (entry !== undefined) return { config, entry };
    }
  }
  return null;
}

const reason = ({ config, entry }) =>
  `${config} includes ${entry}, a file that does not exist. tsc skips that entry, so it can compile none of the probe and still exit 0. Run the probe through node tooling/scripts/type-probe.mjs [--tree <checkout or worktree>] [--package <name>] <probe.ts>..., which extends that package's tsconfig and exits 2 when the compiler did not read every probe, as verify's command recipes say.`;

const raw = JSON.parse(readFileSync(0, 'utf-8') || '{}');
const isAgy = Boolean(raw.toolCall || raw.hookEventName);
const toolName = raw.toolCall
  ? raw.toolCall.name === 'run_command'
    ? 'Bash'
    : raw.toolCall.name
  : raw.tool_name;
const command = raw.toolCall
  ? (raw.toolCall.args?.CommandLine ?? '')
  : (raw.tool_input?.command ?? '');
const run =
  toolName === 'Bash' ? emptyProbeRun(command, raw.cwd ?? process.cwd()) : null;
if (run) {
  process.stdout.write(
    JSON.stringify(
      isAgy
        ? { decision: 'deny', reason: reason(run) }
        : {
            hookSpecificOutput: {
              hookEventName: 'PreToolUse',
              permissionDecision: 'deny',
              permissionDecisionReason: reason(run),
            },
          }
    )
  );
} else if (isAgy) {
  process.stdout.write('{"decision":"allow"}');
}
