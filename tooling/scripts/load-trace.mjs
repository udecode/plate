import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { globSync } from 'tinyglobby';

import { entrypointDags } from '../entrypoints/entrypoint-dag.mjs';
import { testModuleEffects } from '../entrypoints/test-module-effects.mjs';
import {
  evictsModules,
  moduleEffects,
  passesRegistry,
  runtimeClosure,
  tsconfigChain,
} from './import-graph.mjs';

const repoRoot = path.resolve(import.meta.dirname, '../..');
const preloadPath = path.join(repoRoot, 'tooling/config/load-trace-preload.ts');
const TURBO_ROOT = '$TURBO_ROOT$/';
const globOptions = { cwd: repoRoot, dot: true, followSymbolicLinks: false };
const scriptPattern = /\.[cm]?[jt]sx?$/u;

const packageTasks = new Map();

const readPackageTasks = (packageName) => {
  if (!packageTasks.has(packageName)) {
    const turboConfig = path.join(
      repoRoot,
      entrypointDags[packageName].packageRoot,
      'turbo.json'
    );

    packageTasks.set(
      packageName,
      JSON.parse(fs.readFileSync(turboConfig, 'utf-8')).tasks
    );
  }

  return packageTasks.get(packageName);
};

const splitTaskId = (taskId) => {
  const at = taskId.lastIndexOf('#');

  return [taskId.slice(0, at), taskId.slice(at + 1)];
};

export const taskDependencies = (taskId) => {
  const [packageName, taskName] = splitTaskId(taskId);

  return readPackageTasks(packageName)[taskName].dependsOn.map((dependency) => {
    if (dependency.startsWith('^')) {
      throw new Error(
        `${taskId} depends on ${dependency}, which the hash model cannot follow`
      );
    }

    return dependency.includes('#')
      ? dependency
      : `${packageName}#${dependency}`;
  });
};

export const taskClosure = (taskId) => {
  const closure = new Set();
  const visit = (id) => {
    if (closure.has(id)) return;

    closure.add(id);

    for (const dependency of taskDependencies(id)) visit(dependency);
  };

  visit(taskId);

  return [...closure];
};

const taskInputs = (taskId) => {
  const [packageName, taskName] = splitTaskId(taskId);

  return readPackageTasks(packageName)[taskName].inputs;
};

// Turbo also hashes each task's package.json and turbo.json.
export const taskInputFiles = (taskId) => {
  const [packageName] = splitTaskId(taskId);
  const packageDir = entrypointDags[packageName].packageRoot;
  const include = [];
  const exclude = [];

  for (const input of taskInputs(taskId)) {
    if (input === '$TURBO_DEFAULT$') {
      throw new Error(
        `${taskId} hashes $TURBO_DEFAULT$, which the hash model cannot list`
      );
    }

    const negated = input.startsWith('!');
    const glob = negated ? input.slice(1) : input;
    const repoGlob = glob.startsWith(TURBO_ROOT)
      ? glob.slice(TURBO_ROOT.length)
      : path.posix.join(packageDir, glob);

    (negated ? exclude : include).push(repoGlob);
  }

  return [
    ...new Set([
      ...globSync(include, { ...globOptions, ignore: exclude }),
      `${packageDir}/package.json`,
      `${packageDir}/turbo.json`,
    ]),
  ];
};

export const taskHash = (taskId) => {
  const closure = taskClosure(taskId);

  return {
    files: new Set(closure.flatMap(taskInputFiles)),
    inputs: new Set(closure.flatMap(taskInputs)),
  };
};

const repoPath = (id) => {
  const filename = id.split('?')[0];

  // Bun keys `--eval` source as `<cwd>/[eval]`, which is no file.
  if (!path.isAbsolute(filename) || !fs.existsSync(filename)) return null;

  const relative = path.relative(repoRoot, filename);

  if (
    relative.startsWith(`..${path.sep}`) ||
    relative.split(path.sep).includes('node_modules')
  ) {
    return null;
  }

  return relative.split(path.sep).join('/');
};

const readTraceDir = (traceDir) => {
  const names = new Set(fs.readdirSync(traceDir));
  const processes = [...names]
    .filter((name) => name.endsWith('.start'))
    .map((name) => name.slice(0, -'.start'.length));
  const silent = processes.filter((name) => !names.has(`${name}.json`));
  const loaded = processes
    .filter((name) => names.has(`${name}.json`))
    .flatMap((name) =>
      JSON.parse(fs.readFileSync(path.join(traceDir, `${name}.json`), 'utf-8'))
    );

  return { loaded, processes, silent };
};

export const effectProblems = (file, effects, hash) => {
  const uses = moduleEffects(path.join(repoRoot, file));

  if (uses.includes(evictsModules)) {
    return [`${file} ${evictsModules}, which hides what it loads`];
  }
  if (uses.includes(passesRegistry)) return [`${file} ${passesRegistry}`];
  if (uses.length === 0) return [];
  if (!(file in effects)) {
    return [
      `${file} ${uses.join(', ')}, and tooling/entrypoints/test-module-effects.mjs does not say what that reaches`,
    ];
  }
  if (typeof effects[file] === 'string') return [];

  const { reads = [], runs = [] } = effects[file];

  // A task's own exclusions can drop files a declared glob matches.
  return [...reads, ...runs].flatMap((glob) =>
    hash.inputs.has(`${TURBO_ROOT}${glob}`)
      ? globSync(glob, globOptions)
          .filter((match) => !hash.files.has(match))
          .map(
            (match) =>
              `${file} reaches ${match}, which the task's hash excludes`
          )
      : [`${file} reaches ${glob}, which the task's hash leaves out`]
  );
};

// The trace misses a module Vitest loads natively, one that evicts itself and
// one only a declared `runs` entry reaches, so the scan also reads what the
// loaded modules import and what their entries run.
const scannedModules = (files, effects) => {
  const closure = runtimeClosure(files);
  const runs = closure
    .flatMap((filename) => {
      const entry = effects[repoPath(filename)];

      return typeof entry === 'object' ? (entry.runs ?? []) : [];
    })
    .flatMap((glob) => globSync(glob, { ...globOptions, absolute: true }))
    .filter((filename) => !closure.includes(filename));

  return runs.length === 0
    ? closure
    : scannedModules([...closure, ...runs], effects);
};

export const traceProblems = ({ effects, hash, runs, testFiles }) => {
  const problems = [];
  const loaded = new Set();

  for (const { command, configFile, traceDir } of runs) {
    const trace = readTraceDir(traceDir);

    if (trace.processes.length === 0) {
      problems.push(`\`${command}\` left no load trace`);
    }

    for (const name of trace.silent) {
      problems.push(
        `process ${name} of \`${command}\` started but left no load trace`
      );
    }

    for (const id of [...trace.loaded, configFile]) {
      const file = id && repoPath(id);

      if (file) loaded.add(file);
    }
  }

  for (const file of testFiles) {
    if (!loaded.has(repoPath(file))) {
      problems.push(
        `${path.relative(repoRoot, file)} ran but appears in no load trace`
      );
    }
  }

  const configs = new Set();

  for (const file of [...loaded].sort((a, b) => a.localeCompare(b))) {
    if (!hash.files.has(file)) {
      problems.push(`${file} was loaded but is outside the task's hash`);
    }

    if (!scriptPattern.test(file)) continue;

    for (const config of tsconfigChain(path.join(repoRoot, file))) {
      configs.add(repoPath(config));
    }
  }

  for (const config of [...configs].sort((a, b) => a.localeCompare(b))) {
    if (config && !hash.files.has(config)) {
      problems.push(
        `${config} configures loaded modules but is outside the task's hash`
      );
    }
  }

  const scripts = [...loaded]
    .filter((file) => scriptPattern.test(file))
    .map((file) => path.join(repoRoot, file));

  for (const file of scannedModules(scripts, effects)
    .map(repoPath)
    .filter(Boolean)
    .sort()) {
    problems.push(...effectProblems(file, effects, hash));
  }

  return problems;
};

export const tracedEnv = (traceDir) => ({
  ...process.env,
  BUN_OPTIONS: [process.env.BUN_OPTIONS, `--preload=${preloadPath}`]
    .filter(Boolean)
    .join(' '),
  TEST_LOAD_TRACE_DIR: traceDir,
});

// Turbo saves only passing runs, so a pass whose loads escape the hash must
// fail before Turbo can replay it for a change the hash cannot see.
export const runTraced = ({ taskId, testFiles }, runTests) => {
  const traceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'plate-load-trace-'));
  const runs = [];
  const traceEnv = (command, configFile) => {
    const traceDir = path.join(traceRoot, String(runs.length));

    fs.mkdirSync(traceDir);
    runs.push({ command, configFile, traceDir });

    return tracedEnv(traceDir);
  };

  try {
    const status = runTests(traceEnv);

    if (status !== 0) return status;

    const problems = traceProblems({
      effects: testModuleEffects,
      hash: taskHash(taskId),
      runs,
      testFiles,
    });

    if (problems.length === 0) return 0;

    console.error(
      [
        `${taskId} passed, but its Turbo hash cannot vouch for the pass:`,
        ...problems.map((problem) => `  - ${problem}`),
        'Run `pnpm entrypoint:turbo:generate`. A file that still shows needs an entry in tooling/entrypoints/test-module-effects.mjs.',
      ].join('\n')
    );

    return 1;
  } finally {
    fs.rmSync(traceRoot, { force: true, recursive: true });
  }
};
