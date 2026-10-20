import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test, { after, before, describe } from 'node:test';

import { benchmarkRepo } from '../../benchmarks/slate-v2/donor/shared/repo-compare.mjs';
import {
  entrypointDags,
  partitionTypecheckTask,
} from '../entrypoints/entrypoint-dag.mjs';
import { repoRoot } from '../entrypoints/entrypoint-turbo.mjs';

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
    path.join(cwd, 'node_modules/.bin/turbo'),
    [
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

const createGraphFixture = () => {
  const graph = readDryGraph();
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'plate-turbo-graph-')
  );

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

  return { directory, graph: fixtureGraph };
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

describe('a copied workspace', () => {
  let fixture;
  let baselineHashes;
  let probeId;

  before(() => {
    fixture = createGraphFixture();
    baselineHashes = sourceHashes(fixture.graph);
    probeId = `${process.pid}-${Date.now()}`;
  });
  after(() => fs.rmSync(fixture.directory, { force: true, recursive: true }));

  const probe = (directory, suffix = '') =>
    path.join(
      fixture.directory,
      directory,
      `__entrypoint_turbo_probe_${probeId}${suffix}.ts`
    );
  const assertMutation = (filename, ownerTaskId) => {
    fs.writeFileSync(filename, 'export const entrypointTurboProbe = true;\n');

    const candidateHashes = sourceHashes(readDryGraph(fixture.directory));

    assertSameSet(
      changedSourceTasks(baselineHashes, candidateHashes),
      reverseClosure(fixture.graph, ownerTaskId),
      ownerTaskId
    );

    return candidateHashes;
  };

  test('aggregate tasks reject --only execution with uncached partitions', () => {
    const uncached = probe('packages/plitejs/src/diff', '_uncached');

    fs.writeFileSync(uncached, 'export const uncachedPartitionProbe = true;\n');

    try {
      const result = spawnSync(
        process.execPath,
        [
          'tooling/scripts/run-entrypoint-package-task.mjs',
          'plitejs',
          'typecheck',
        ],
        {
          cwd: fixture.directory,
          encoding: 'utf-8',
          env: { ...process.env, TURBO_HASH: 'uncached-partition-proof' },
        }
      );

      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /cannot run without its partition tasks/u);
    } finally {
      fs.rmSync(uncached, { force: true });
    }
  });

  test('root workspace dependencies leave every Turbo task hash alone', () => {
    assert.equal(
      fixture.graph.globalCacheInputs.hashOfInternalDependencies,
      '',
      'root workspace dependencies globally invalidate every Turbo task'
    );
  });

  test('Turbo hashes exactly a leaf entrypoint and its reverse dependents, and a rename there again', () => {
    const leafOwner = 'plitejs#typecheck:partition:diff';
    const created = probe('packages/plitejs/src/diff');
    const renamed = probe('packages/plitejs/src/diff', '_renamed');

    try {
      const leafHashes = assertMutation(created, leafOwner);

      fs.renameSync(created, renamed);

      const renamedHashes = sourceHashes(readDryGraph(fixture.directory));

      assertSameSet(
        changedSourceTasks(baselineHashes, renamedHashes),
        reverseClosure(fixture.graph, leafOwner),
        'rename closure'
      );
      assert.notDeepEqual([...leafHashes], [...renamedHashes]);
    } finally {
      fs.rmSync(created, { force: true });
      fs.rmSync(renamed, { force: true });
    }
  });

  test('Turbo hashes exactly the Plite core entrypoint and its reverse dependents', () => {
    const created = probe('packages/plitejs/src');

    try {
      assertMutation(created, 'plitejs#typecheck:partition:core');
    } finally {
      fs.rmSync(created, { force: true });
    }
  });

  test('Turbo hashes exactly the Plate static entrypoint and its reverse dependents', () => {
    const created = probe('packages/platejs/src/static');

    try {
      assertMutation(created, 'platejs#typecheck:partition:static');
    } finally {
      fs.rmSync(created, { force: true });
    }
  });

  test('Turbo restores every source task hash once the probes are gone', () => {
    assertSameSet(
      changedSourceTasks(
        baselineHashes,
        sourceHashes(readDryGraph(fixture.directory))
      ),
      new Set(),
      'all probes cleaned up'
    );
  });
});
