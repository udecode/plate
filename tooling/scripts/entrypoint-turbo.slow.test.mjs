import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { benchmarkRepo } from '../../benchmarks/slate-v2/donor/shared/repo-compare.mjs';
import {
  entrypointDags,
  partitionTypecheckTask,
} from '../entrypoints/entrypoint-dag.mjs';
import { repoRoot } from '../entrypoints/entrypoint-turbo.mjs';

const packageManager = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const sourceTaskIds = new Set(
  Object.entries(entrypointDags).flatMap(([packageName, definition]) =>
    Object.keys(definition.taskPartitions).map(
      (partitionName) =>
        `${packageName}#${partitionTypecheckTask(partitionName)}`
    )
  )
);

const readDryGraph = (cwd = repoRoot) => {
  const result = spawnSync(
    packageManager,
    [
      'exec',
      'turbo',
      'run',
      'typecheck',
      '--filter=plitejs',
      '--filter=platejs',
      '--filter=@platejs/cli',
      '--dry=json',
    ],
    {
      cwd,
      encoding: 'utf-8',
      env: { ...process.env, TURBO_TELEMETRY_DISABLED: '1' },
    }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);

  return JSON.parse(result.stdout);
};

const createGraphFixture = (context) => {
  const graph = readDryGraph();
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'plate-turbo-graph-')
  );

  context.after(() => fs.rmSync(directory, { force: true, recursive: true }));

  const files = new Set([
    '.gitignore',
    '.npmrc',
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    'turbo.json',
  ]);

  for (const task of graph.tasks) {
    for (const filename of Object.keys(task.inputs)) {
      files.add(path.normalize(path.join(task.directory, filename)));
    }
  }
  for (const workspaceRoot of ['apps', 'packages']) {
    for (const entry of fs.readdirSync(path.join(repoRoot, workspaceRoot), {
      withFileTypes: true,
    })) {
      if (!entry.isDirectory()) continue;

      for (const filename of ['package.json', 'turbo.json']) {
        const relative = path.join(workspaceRoot, entry.name, filename);

        if (fs.existsSync(path.join(repoRoot, relative))) files.add(relative);
      }
    }
  }
  for (const filename of files) {
    const destination = path.join(directory, filename);

    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(repoRoot, filename), destination);
  }

  fs.symlinkSync(
    path.join(repoRoot, 'node_modules'),
    path.join(directory, 'node_modules'),
    'junction'
  );

  // Turbo includes cross-package root inputs only with a Git workspace boundary.
  const init = spawnSync('git', ['init', '--quiet'], {
    cwd: directory,
    encoding: 'utf-8',
  });

  assert.equal(init.status, 0, init.stderr || init.stdout);

  const fixtureGraph = readDryGraph(directory);

  assert.deepEqual(
    sourceHashes(fixtureGraph),
    sourceHashes(graph),
    'the temporary workspace must preserve every current source task hash'
  );

  return directory;
};

const sourceHashes = (graph) =>
  new Map(
    graph.tasks
      .filter(({ taskId }) => sourceTaskIds.has(taskId))
      .map(({ hash, taskId }) => [taskId, hash])
  );

const changedSourceTasks = (baseline, candidate) =>
  new Set(
    [...baseline].flatMap(([taskId, hash]) =>
      candidate.get(taskId) === hash ? [] : [taskId]
    )
  );

const reverseClosure = (graph, ownerTaskId) => {
  const reverseDependencies = new Map();

  for (const task of graph.tasks) {
    if (!sourceTaskIds.has(task.taskId)) continue;

    for (const dependency of task.dependencies) {
      if (!sourceTaskIds.has(dependency)) continue;

      const dependents = reverseDependencies.get(dependency) ?? new Set();

      dependents.add(task.taskId);
      reverseDependencies.set(dependency, dependents);
    }
  }

  const closure = new Set([ownerTaskId]);
  const queue = [ownerTaskId];

  while (queue.length > 0) {
    const taskId = queue.shift();

    for (const dependent of reverseDependencies.get(taskId) ?? []) {
      if (closure.has(dependent)) continue;

      closure.add(dependent);
      queue.push(dependent);
    }
  }

  return closure;
};

const assertSameSet = (actual, expected, label) => {
  assert.deepEqual(
    [...actual].sort((left, right) => left.localeCompare(right)),
    [...expected].sort((left, right) => left.localeCompare(right)),
    label
  );
};

test('package typechecking schedules source proof without release builds', () => {
  const graph = readDryGraph();

  assert.ok(
    graph.tasks.some(({ taskId }) => taskId === '@platejs/cli#typecheck')
  );
  assert.ok(
    graph.tasks.some(({ taskId }) => taskId === 'plitejs#typecheck:contracts')
  );
  assert.deepEqual(
    graph.tasks.filter(({ task }) => task === 'build'),
    []
  );
});

test('benchmark runners resolve workspace packages without root dependencies', async () => {
  const result = await benchmarkRepo({
    benchmarkSource: `
      const plate = await import('platejs/package.json', { with: { type: 'json' } });
      const plite = await import('plitejs/package.json', { with: { type: 'json' } });
      console.log(JSON.stringify({ plate: plate.default.name, plite: plite.default.name }));
    `,
    env: {},
    packageManager: 'pnpm',
    repo: repoRoot,
  });

  assert.deepEqual(result, { plate: 'platejs', plite: 'plitejs' });
});

test('aggregate tasks reject --only execution with uncached partitions', (context) => {
  const fixture = createGraphFixture(context);
  const probe = path.join(
    fixture,
    'packages/plitejs/src/diff',
    `__entrypoint_turbo_uncached_${process.pid}_${Date.now()}.ts`
  );

  fs.writeFileSync(probe, 'export const uncachedPartitionProbe = true;\n');

  const result = spawnSync(
    process.execPath,
    ['tooling/scripts/run-entrypoint-package-task.mjs', 'plitejs', 'typecheck'],
    {
      cwd: fixture,
      encoding: 'utf-8',
      env: { ...process.env, TURBO_HASH: 'uncached-partition-proof' },
    }
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /cannot run without its partition tasks/u);
});

test(
  'Turbo hashes exactly the owning source entrypoint and reverse dependents',
  { timeout: 30_000 },
  (context) => {
    const fixture = createGraphFixture(context);
    const probeId = `${process.pid}-${Date.now()}`;
    const probes = {
      pliteDiff: path.join(
        fixture,
        'packages/plitejs/src/diff',
        `__entrypoint_turbo_probe_${probeId}.ts`
      ),
      pliteDiffRenamed: path.join(
        fixture,
        'packages/plitejs/src/diff',
        `__entrypoint_turbo_probe_${probeId}_renamed.ts`
      ),
      pliteRoot: path.join(
        fixture,
        'packages/plitejs/src',
        `__entrypoint_turbo_probe_${probeId}.ts`
      ),
      plateStatic: path.join(
        fixture,
        'packages/platejs/src/static',
        `__entrypoint_turbo_probe_${probeId}.ts`
      ),
    };
    const baselineGraph = readDryGraph(fixture);

    assert.equal(
      baselineGraph.globalCacheInputs.hashOfInternalDependencies,
      '',
      'root workspace dependencies globally invalidate every Turbo task'
    );
    const baselineHashes = sourceHashes(baselineGraph);
    const assertMutation = (filename, ownerTaskId) => {
      fs.writeFileSync(filename, 'export const entrypointTurboProbe = true;\n');

      const candidateGraph = readDryGraph(fixture);
      const candidateHashes = sourceHashes(candidateGraph);

      assertSameSet(
        changedSourceTasks(baselineHashes, candidateHashes),
        reverseClosure(baselineGraph, ownerTaskId),
        ownerTaskId
      );

      return candidateHashes;
    };

    const leafOwner = 'plitejs#typecheck:partition:diff';
    const leafHashes = assertMutation(probes.pliteDiff, leafOwner);

    fs.renameSync(probes.pliteDiff, probes.pliteDiffRenamed);

    const renamedHashes = sourceHashes(readDryGraph(fixture));

    assertSameSet(
      changedSourceTasks(baselineHashes, renamedHashes),
      reverseClosure(baselineGraph, leafOwner),
      'rename closure'
    );
    assert.notDeepEqual([...leafHashes], [...renamedHashes]);

    fs.rmSync(probes.pliteDiffRenamed);
    assertMutation(probes.pliteRoot, 'plitejs#typecheck:partition:core');
    fs.rmSync(probes.pliteRoot);

    assertMutation(probes.plateStatic, 'platejs#typecheck:partition:static');
    fs.rmSync(probes.plateStatic);

    assertSameSet(
      changedSourceTasks(baselineHashes, sourceHashes(readDryGraph(fixture))),
      new Set(),
      'all probes cleaned up'
    );
  }
);
