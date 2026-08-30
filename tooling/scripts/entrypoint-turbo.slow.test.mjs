import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
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

const readDryGraph = () => {
  const result = spawnSync(
    packageManager,
    [
      'exec',
      'turbo',
      'run',
      'typecheck',
      '--filter=plitejs',
      '--filter=platejs',
      '--dry=json',
    ],
    {
      cwd: repoRoot,
      encoding: 'utf-8',
      env: { ...process.env, TURBO_TELEMETRY_DISABLED: '1' },
    }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);

  return JSON.parse(result.stdout);
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

test('aggregate tasks reject --only execution with uncached partitions', () => {
  const probe = path.join(
    repoRoot,
    'packages/plitejs/src/diff',
    `__entrypoint_turbo_uncached_${process.pid}_${Date.now()}.ts`
  );

  try {
    fs.writeFileSync(probe, 'export const uncachedPartitionProbe = true;\n');

    const result = spawnSync(
      process.execPath,
      [
        'tooling/scripts/run-entrypoint-package-task.mjs',
        'plitejs',
        'typecheck',
      ],
      {
        cwd: repoRoot,
        encoding: 'utf-8',
        env: { ...process.env, TURBO_HASH: 'uncached-partition-proof' },
      }
    );

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /cannot run without its partition tasks/u);
  } finally {
    fs.rmSync(probe, { force: true });
  }
});

test(
  'Turbo hashes exactly the owning source entrypoint and reverse dependents',
  { timeout: 15_000 },
  () => {
    const probeId = `${process.pid}-${Date.now()}`;
    const probes = {
      pliteDiff: path.join(
        repoRoot,
        'packages/plitejs/src/diff',
        `__entrypoint_turbo_probe_${probeId}.ts`
      ),
      pliteDiffRenamed: path.join(
        repoRoot,
        'packages/plitejs/src/diff',
        `__entrypoint_turbo_probe_${probeId}_renamed.ts`
      ),
      pliteRoot: path.join(
        repoRoot,
        'packages/plitejs/src',
        `__entrypoint_turbo_probe_${probeId}.ts`
      ),
      plateStatic: path.join(
        repoRoot,
        'packages/platejs/src/static',
        `__entrypoint_turbo_probe_${probeId}.ts`
      ),
    };
    const cleanup = () => {
      for (const filename of Object.values(probes)) {
        fs.rmSync(filename, { force: true });
      }
    };

    cleanup();

    try {
      const baselineGraph = readDryGraph();

      assert.equal(
        baselineGraph.globalCacheInputs.hashOfInternalDependencies,
        '',
        'root workspace dependencies globally invalidate every Turbo task'
      );
      const baselineHashes = sourceHashes(baselineGraph);
      const assertMutation = (filename, ownerTaskId) => {
        fs.writeFileSync(
          filename,
          'export const entrypointTurboProbe = true;\n'
        );

        const candidateGraph = readDryGraph();
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

      const renamedHashes = sourceHashes(readDryGraph());

      assertSameSet(
        changedSourceTasks(baselineHashes, renamedHashes),
        reverseClosure(baselineGraph, leafOwner),
        'rename closure'
      );
      assert.notDeepEqual([...leafHashes], [...renamedHashes]);

      fs.rmSync(probes.pliteDiffRenamed);
      assertSameSet(
        changedSourceTasks(baselineHashes, sourceHashes(readDryGraph())),
        new Set(),
        'deletion restores baseline'
      );

      assertMutation(probes.pliteRoot, 'plitejs#typecheck:partition:core');
      fs.rmSync(probes.pliteRoot);

      assertMutation(probes.plateStatic, 'platejs#typecheck:partition:static');
      fs.rmSync(probes.plateStatic);

      assertSameSet(
        changedSourceTasks(baselineHashes, sourceHashes(readDryGraph())),
        new Set(),
        'all probes cleaned up'
      );
    } finally {
      cleanup();
    }
  }
);
