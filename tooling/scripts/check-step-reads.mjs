// Runs the Node scripts of each pnpm check step that shares its passes, and
// fails when one reads a file its affected rule does not reach or a file git
// ignores, either of which lets a recorded pass cover a change it never saw.
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { planAffected, steps } from './check.mjs';
import { hasPrivateHalf, trackedFiles } from './private-files.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));
const preload = fileURLToPath(
  new URL('step-reads-preload.mjs', import.meta.url)
);

const readJson = (file) => JSON.parse(readFileSync(file, 'utf-8'));
let packageDirs;
const packageDir = (name) => {
  packageDirs ??= new Map(
    ['apps', 'packages'].flatMap((parent) =>
      readdirSync(path.join(root, parent)).flatMap((entry) => {
        const file = path.join(root, parent, entry, 'package.json');
        return existsSync(file)
          ? [[readJson(file).name, `${parent}/${entry}`]]
          : [];
      })
    )
  );
  return packageDirs.get(name);
};
const scriptsIn = (dir) =>
  readJson(path.join(root, dir, 'package.json')).scripts ?? {};

/** The commands a step's run line ends in, with pnpm scripts expanded. */
const leaves = (command, dir = '.') =>
  command.split(/\s*&&\s*/u).flatMap((part) => {
    const pnpm =
      /^pnpm (?:--filter (?<filter>\S+) )?(?:(?<exec>exec) )?(?:run )?(?<name>[\w:.-]+)(?<rest>.*)$/u.exec(
        part.trim()
      );
    if (!pnpm) return [{ command: part.trim(), dir }];
    const { exec, filter, name, rest } = pnpm.groups;
    const at = filter ? packageDir(filter) : dir;
    const script = !exec && scriptsIn(at)[name];
    return script
      ? leaves(`${script}${rest}`, at)
      : [{ command: `${name}${rest}`, dir: at }];
  });

// tsc runs on Node, but what it reads is what its tsconfig includes, so it
// stays with the compilers this check does not trace.
const toolOf = (command) => {
  if (/typescript\/bin\/tsc\b/u.test(command)) return 'tsc';
  return /^(?:node|tsx)\s/u.test(command) ? null : command.split(/\s/u)[0];
};
const toolOfScript = (script) => {
  const inModules = /node_modules\/((?:@[^/]+\/)?[^/]+)/u.exec(script);
  return inModules
    ? inModules[1]
    : path.basename(script).replace(/\.[cm]?js$/u, '');
};

const runTraced = ({ command, dir }) => {
  const log = mkdtempSync(path.join(tmpdir(), 'step-reads-'));
  const cwd = path.join(root, dir);
  const started = Date.now();
  const result = spawnSync('bash', ['-o', 'pipefail', '-c', command], {
    cwd,
    encoding: 'utf-8',
    env: {
      ...process.env,
      NODE_OPTIONS: [process.env.NODE_OPTIONS, `--import=${preload}`]
        .filter(Boolean)
        .join(' '),
      PATH: [
        path.join(cwd, 'node_modules/.bin'),
        path.join(root, 'node_modules/.bin'),
        process.env.PATH,
      ].join(path.delimiter),
      STEP_READS_LOG: log,
    },
    maxBuffer: 1024 * 1024 * 256,
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  const processes = readdirSync(log).map((name) =>
    readJson(path.join(log, name))
  );
  rmSync(log, { force: true, recursive: true });
  return {
    processes,
    seconds: (Date.now() - started) / 1000,
    status: result.status ?? 1,
    stderr: result.stderr,
  };
};

// A path through a tracked symlink, such as .claude/skills/<name>/SKILL.md,
// reads the file the link points at, which is what a record hashes.
const realRoot = realpathSync(root);
const realPath = (file) => {
  try {
    return realpathSync(file);
  } catch {
    return file;
  }
};

const tracked = new Set(trackedFiles(root, { untracked: true }));
const trackedDirs = new Set(
  [...tracked].flatMap((file) => {
    const dirs = [];
    for (let at = path.dirname(file); at !== '.'; at = path.dirname(at)) {
      dirs.push(at);
    }
    return dirs;
  })
);
// The .env files that check-cache.mjs hashes into every record.
const isRecordedEnv = (file) =>
  path.basename(file).startsWith('.env') &&
  /^(?:\.|(?:apps|packages)\/[^/]+)$/u.test(path.dirname(file));

/**
 * What a record knows of a path: `tracked` when a half tracks it, `ignored`
 * when it exists but no record hashes it, `missing` when it does not exist,
 * and null when it is a dependency, git's own data or a folder of tracked
 * files.
 */
const kindOf = (file) => {
  if (
    file === '' ||
    file.startsWith('..') ||
    path.isAbsolute(file) ||
    file.split('/').includes('node_modules') ||
    /^\.git(?:-private)?(?:\/|$)/u.test(file) ||
    trackedDirs.has(file)
  ) {
    return null;
  }
  if (tracked.has(file)) return 'tracked';
  if (!statSync(path.join(root, file), { throwIfNoEntry: false })) {
    return 'missing';
  }
  return isRecordedEnv(file) ? null : 'ignored';
};

const reachedBy = new Map();
/**
 * Whether a change to `file` selects `step`. A probe depends only on
 * whether the path exists, so it asks about the file being added or removed,
 * which is how the planner sees a path whose target changed.
 */
const reaches = (step, file, how = 'reads') => {
  const key = `${how} ${file}`;
  if (!reachedBy.has(key)) {
    reachedBy.set(
      key,
      new Set(
        planAffected([file], how === 'probes' ? [file] : [])
          .filter(({ command }) => command)
          .map(({ step: planned }) => planned.name)
      )
    );
  }
  return reachedBy.get(key).has(step.name);
};
// A step whose rule even the root manifest does not reach, such as
// review-ledger, never runs under --affected; the daily full check runs it.
const hasRule = (step) => reaches(step, 'package.json');

/**
 * Each repository path the step's own Node scripts read or probe, with the
 * script that did; a path a script stats while it walks a folder it listed
 * counts as listed, since only the walk's names reach it.
 */
const traceStep = (step) => {
  const commands = leaves(step.run);
  const tools = new Set(commands.map(({ command }) => toolOf(command)));
  const touched = new Map();
  const git = new Set();
  let complete = true;
  for (const leaf of commands.filter(({ command }) => !toolOf(command))) {
    const run = runTraced(leaf);
    console.info(
      `[step-reads] ${step.name}: ${leaf.command} (${run.seconds.toFixed(1)} s, exit ${run.status})`
    );
    if (run.status !== 0) {
      complete = false;
      const tail = run.stderr
        .split('\n')
        .filter((line) => line.trim() && !line.startsWith('    at '))
        .slice(-4)
        .map((line) => `    ${line.slice(0, 200)}`);
      console.info(
        `  it failed, so its trace stops there:\n${tail.join('\n')}`
      );
    }
    for (const traced of run.processes) {
      const script = traced.argv[0] ?? '';
      const by = path.relative(root, script);
      if (!by || by.startsWith('..') || by.includes('node_modules/')) {
        tools.add(toolOfScript(script));
        continue;
      }
      const listed = new Set(traced.listed);
      for (const [files, how] of [
        [traced.read, 'reads'],
        [traced.probed.filter((file) => !listed.has(file)), 'probes'],
      ]) {
        for (const file of files) {
          const relative = path.relative(realRoot, realPath(file));
          if (touched.get(relative)?.how !== 'reads') {
            touched.set(relative, { by, how });
          }
        }
      }
      for (const spawned of traced.spawns) {
        const [command, ...args] = spawned.split(' ');
        if (path.basename(command) === 'git') {
          git.add(args.find((arg) => /^[a-z][\w-]*$/u.test(arg)));
        }
      }
    }
  }
  tools.delete(null);
  return { complete, git, tools, touched };
};

const under = (prefix, file) =>
  file === prefix.replace(/\/$/u, '') || file.startsWith(prefix);

const main = () => {
  const names = process.argv.slice(2);
  const unknown = names.filter(
    (name) => !steps.some((step) => step.name === name)
  );
  if (unknown.length > 0) {
    console.error(`[step-reads] unknown step: ${unknown.join(', ')}`);
    return 1;
  }
  const privateHalf = hasPrivateHalf(root);
  const gaps = [];
  const probes = [];
  for (const step of steps.filter(
    (entry) =>
      entry.key &&
      (names.length === 0 || names.includes(entry.name)) &&
      (privateHalf || !entry.private)
  )) {
    const { complete, git, tools, touched } = traceStep(step);
    const declared = step.ignoredReads ?? [];
    const used = new Set();
    const probed = [];
    const counts = { ignored: 0, missing: 0, tracked: 0 };
    for (const [file, { by, how }] of touched) {
      const kind = kindOf(file);
      if (kind) counts[kind] += 1;
      if (kind === 'tracked' && hasRule(step) && !reaches(step, file, how)) {
        if (how === 'reads') {
          gaps.push(`${step.name}: its rule misses ${file}, which ${by} reads`);
        } else {
          probed.push(file);
        }
      } else if (kind === 'ignored') {
        const prefix = declared.find((entry) => under(entry, file));
        if (prefix) {
          used.add(prefix);
        } else {
          gaps.push(
            `${step.name}: ${by} ${how} ${file}, which git ignores, so no record covers it; list it in the step's ignoredReads with why it cannot make a pass stale, or drop the step's key`
          );
        }
      }
    }
    if (complete) {
      for (const prefix of declared.filter((entry) => !used.has(entry))) {
        gaps.push(
          `${step.name}: ignoredReads lists ${prefix}, which it no longer reads`
        );
      }
    }
    if (step.filesOnly && git.size > 0) {
      gaps.push(
        `${step.name}: runs git ${[...git].join(', ')}, which can read HEAD or the index, but is filesOnly, so a commit that changes no file keeps its pass`
      );
    }
    // A probe depends only on whether the path exists, and a rule can reach a
    // deletion through the disk, as knowledge's does, which no path that
    // exists here can show; so a probe the rule misses is reported, not failed.
    if (probed.length > 0) {
      probes.push(
        `${step.name}: its rule misses ${probed.length} paths its scripts only probe, such as ${probed.slice(0, 3).join(', ')}`
      );
    }
    console.info(
      `[step-reads] ${step.name}: ${counts.tracked} tracked, ${counts.ignored} ignored and ${counts.missing} missing paths${tools.size > 0 ? `; not traced: ${[...tools].join(', ')}` : ''}${git.size > 0 ? `; git ${[...git].join(', ')}${step.filesOnly ? ' (filesOnly)' : ''}` : ''}`
    );
  }
  for (const probe of probes) console.info(`[step-reads] note: ${probe}`);
  for (const gap of gaps) console.error(`[step-reads] ${gap}`);
  return gaps.length > 0 ? 1 : 0;
};

process.exit(main());
