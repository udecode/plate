#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import path from 'node:path';

import { entrypointDags } from '../entrypoints/entrypoint-dag.mjs';
import { repoRoot } from '../entrypoints/entrypoint-turbo.mjs';

const [packageName, taskName, ...taskArguments] = process.argv.slice(2);
const definition = entrypointDags[packageName];

if (!definition || !['lint', 'test', 'typecheck'].includes(taskName)) {
  console.error(
    'Usage: run-entrypoint-package-task.mjs <platejs|plitejs> <lint|test|typecheck> [...focused arguments]'
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

const runFocused = () => {
  if (taskName === 'lint') {
    return run('pnpm', ['exec', 'ultracite', 'check', ...taskArguments]);
  }
  if (taskName === 'typecheck') {
    console.error('Focused arguments are not supported for package typecheck.');
    return 1;
  }
  if (packageName === 'platejs') {
    return run('bun', ['test', ...taskArguments]);
  }

  const usesReactRunner = taskArguments.some((argument) =>
    argument.includes('test/react/')
  );

  return usesReactRunner
    ? run('pnpm', [
        'exec',
        'vitest',
        'run',
        '--config',
        './vitest.config.mjs',
        ...taskArguments,
      ])
    : run('bun', [
        'test',
        '--preload',
        '../../config/plite-source-test-setup.ts',
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
      `${aggregateTaskId} cannot run without its partition tasks. Remove --only or run the package script directly. Missing successful cache entries: ${missing.join(', ')}`
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
      '--output-logs=errors-only',
      '--log-order=grouped',
    ],
    repoRoot
  )
);
