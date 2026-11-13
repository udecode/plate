#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

import { vitestSuiteOf, vitestSuites } from '../config/test-suites.mjs';
import { entrypointDags } from '../entrypoints/entrypoint-dag.mjs';
import { repoRoot } from '../entrypoints/entrypoint-turbo.mjs';

const [packageName, taskName, ...taskArguments] = process.argv.slice(2);
const definition = entrypointDags[packageName];

if (!definition || !['lint', 'test'].includes(taskName)) {
  console.error(
    'Usage: run-entrypoint-package-task.mjs <platejs|plitejs> <lint|test> [...focused arguments]'
  );
  process.exit(1);
}

const packageRoot = path.join(repoRoot, definition.packageRoot);
const turboExecutable = path.join(repoRoot, 'node_modules/.bin/turbo');
const run = (executable, args, cwd = packageRoot) => {
  const result = spawnSync(executable, args, {
    cwd,
    env: process.env,
    stdio: 'inherit',
  });

  if (result.error) throw result.error;

  return result.status ?? 1;
};

const TEST_FILE = /[._](?:spec|test)\.[cm]?[jt]sx?$/;

const runFocused = () => {
  if (taskName === 'lint') {
    return run('pnpm', ['exec', 'ultracite', 'check', ...taskArguments]);
  }
  if (packageName === 'platejs') {
    return run('bun', ['test', ...taskArguments]);
  }

  const runners = new Map();

  for (const argument of taskArguments) {
    const target = path.resolve(packageRoot, argument);

    if (!existsSync(target)) continue;

    const relative = path.relative(packageRoot, target);
    const isFolder = statSync(target).isDirectory();
    const suite = vitestSuiteOf(
      packageName,
      '',
      isFolder ? `${relative}/` : relative
    );
    const runner =
      suite?.config ?? (!isFolder && TEST_FILE.test(relative) ? 'bun' : null);

    if (runner) {
      runners.set(runner, {
        named: [...(runners.get(runner)?.named ?? []), argument],
        suite,
      });
    }
  }

  if (runners.size > 1) {
    console.error(
      `These files run under different runners, so name each runner's files in a command of its own: ${[
        ...runners,
      ]
        .map(([runner, { named }]) => `${runner}: ${named.join(' ')}`)
        .join('; ')}`
    );
    return 1;
  }

  const [{ suite } = {}] = runners.values();

  return suite
    ? run('pnpm', [
        'exec',
        'vitest',
        'run',
        '--config',
        `./${suite.config}`,
        ...suite.args,
        ...taskArguments,
      ])
    : run('bun', [
        'test',
        '--preload',
        '../../config/plite-source-test-setup.ts',
        ...(vitestSuites[packageName] ?? []).flatMap(({ folder }) =>
          folder ? [`--path-ignore-patterns=${folder}**`] : []
        ),
        ...taskArguments,
      ]);
};

const assertDependencyCache = () => {
  const result = spawnSync(
    turboExecutable,
    ['run', taskName, `--filter=${packageName}`, '--dry=json'],
    {
      cwd: repoRoot,
      encoding: 'utf-8',
      env: process.env,
      maxBuffer: 64 * 1024 * 1024,
    }
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    return result.status ?? 1;
  }

  const jsonStart = result.stdout.indexOf('{');
  const graph = JSON.parse(result.stdout.slice(jsonStart));
  const aggregateTaskId = `${packageName}#${taskName}`;
  const aggregate = graph.tasks.find(
    ({ taskId }) => taskId === aggregateTaskId
  );

  if (!aggregate) {
    console.error(`Turbo dry graph omitted ${aggregateTaskId}.`);
    return 1;
  }

  const tasks = new Map(graph.tasks.map((task) => [task.taskId, task]));
  const missing = aggregate.dependencies.filter(
    (taskId) => tasks.get(taskId)?.cache.status !== 'HIT'
  );

  if (missing.length > 0) {
    console.error(
      `${aggregateTaskId} cannot run without its partition tasks passing. These have no successful run: ${missing.join(', ')}. Under --only, run the package script directly instead.`
    );
    return 1;
  }

  console.log(`${packageName} ${taskName} partition graph complete.`);
  return 0;
};

if (taskArguments.length > 0) {
  process.exit(runFocused());
}

if (process.env.TURBO_HASH) {
  process.exit(assertDependencyCache());
}

process.exit(
  run(
    turboExecutable,
    [
      'run',
      taskName,
      `--filter=${packageName}`,
      '--continue=always',
      '--output-logs=errors-only',
      '--log-order=grouped',
    ],
    repoRoot
  )
);
