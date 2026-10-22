import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';

const root = resolve(import.meta.dir, '../../..');
const registryPath = resolve(root, 'benchmarks/targets/slate-v2.json');
const packagePath = resolve(root, 'package.json');

describe('plugin graph benchmark authority', () => {
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
      ({ id }) => id === 'plite-plugin-graph'
    );

    assert.equal(targets.length, 1);
    assert.match(targets[0].command, /PLITE_PLUGIN_GRAPH_STRICT=1/u);
    assert.match(targets[0].command, /plite-plugin-graph-benchmark\.ts/u);
    assert.equal(
      targets[0].metrics.primary,
      'plite_plugin_graph_worst_budget_ratio'
    );
    assert.equal(targets[0].metrics.printsMetric, true);
    assert.equal(targets[0].metrics.unit, 'ratio');
    assert.deepEqual(targets[0].artifacts, [
      {
        path: 'tmp/plite-plugin-graph-benchmark.json',
        required: true,
      },
    ]);
  });

  it('runs the authority check in the strict Plite contract gate', () => {
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8')) as {
      scripts: Record<string, string>;
    };

    assert.match(
      packageJson.scripts['check:plite:contracts'] ?? '',
      /plite-plugin-graph-benchmark\.test\.ts/u
    );
  });
});
