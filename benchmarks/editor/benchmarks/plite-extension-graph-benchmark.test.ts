import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';

const root = resolve(import.meta.dir, '../../..');
const benchmarkPath = resolve(
  root,
  'benchmarks/editor/benchmarks/plite-extension-graph-benchmark.ts'
);
const registryPath = resolve(root, 'benchmarks/targets/slate-v2.json');
const packagePath = resolve(root, 'package.json');

describe('extension graph benchmark authority', () => {
  it('registers one strict current target and artifact', () => {
    const registry = JSON.parse(readFileSync(registryPath, 'utf-8')) as {
      targets: Array<{
        artifacts: Array<{ path: string; required: boolean }>;
        command: string;
        id: string;
        metrics: { primary: string; printsMetric: boolean; unit: string };
      }>;
    };
    const targets = registry.targets.filter(
      ({ id }) => id === 'plite-extension-graph'
    );

    assert.equal(targets.length, 1);
    assert.match(targets[0].command, /PLITE_EXTENSION_GRAPH_STRICT=1/u);
    assert.match(targets[0].command, /plite-extension-graph-benchmark\.ts/u);
    assert.equal(
      targets[0].metrics.primary,
      'plite_extension_graph_worst_budget_ratio'
    );
    assert.equal(targets[0].metrics.printsMetric, true);
    assert.equal(targets[0].metrics.unit, 'ratio');
    assert.deepEqual(targets[0].artifacts, [
      {
        path: 'tmp/plite-extension-graph-benchmark.json',
        required: true,
      },
    ]);
  });

  it('keeps cohorts, lifecycle proof, retention, and fixed budgets explicit', () => {
    const source = readFileSync(benchmarkPath, 'utf-8');

    assert.match(source, /descriptors: 10/u);
    assert.match(source, /descriptors: 100/u);
    assert.match(source, /descriptors: 1000/u);
    assert.match(source, /extensionsByDescriptor\.size/u);
    assert.match(source, /dependencyOrder\.length/u);
    assert.match(source, /Object\.values\(installedRegistrySizes\)\.some/u);
    assert.match(source, /removedRegistryRecords !== 0/u);
    assert.match(source, /lifecycle\.activations/u);
    assert.match(source, /lifecycle\.cleanups/u);
    assert.match(source, /worstBudgetRatio >= 1/u);
  });

  it('runs the authority check in the strict Plite contract gate', () => {
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8')) as {
      scripts: Record<string, string>;
    };

    assert.match(
      packageJson.scripts['check:plite:contracts'] ?? '',
      /plite-extension-graph-benchmark\.test\.ts/u
    );
  });
});
