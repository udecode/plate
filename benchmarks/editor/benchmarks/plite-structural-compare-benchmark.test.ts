import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';

const root = resolve(import.meta.dir, '../../..');
const benchmarkPath = resolve(
  root,
  'benchmarks/editor/benchmarks/plite-structural-compare-benchmark.ts'
);
const registryPath = resolve(root, 'benchmarks/targets/slate-v2.json');

describe('structural compare benchmark authority', () => {
  it('keeps one production compare target with frozen scale cohorts', () => {
    const registry = JSON.parse(readFileSync(registryPath, 'utf-8')) as {
      targets: Array<{
        artifacts: Array<{ path: string }>;
        command: string;
        id: string;
        metrics: { primary: string };
      }>;
    };
    const targets = registry.targets.filter(
      ({ id }) => id === 'plite-structural-compare'
    );
    const source = readFileSync(benchmarkPath, 'utf-8');

    assert.equal(targets.length, 1);
    assert.match(targets[0].command, /plite-structural-compare-benchmark\.ts/u);
    assert.equal(targets[0].metrics.primary, 'plite_structural_compare_passed');
    assert.deepEqual(targets[0].artifacts, [
      {
        path: 'tmp/plite-structural-compare-benchmark.json',
        required: true,
      },
    ]);
    assert.match(source, /const warmups = 1;/u);
    assert.match(source, /const samples = 7;/u);
    assert.match(source, /kind: 'normal', nodes: 100/u);
    assert.match(source, /kind: 'large', nodes: 1000/u);
    assert.match(source, /kind: 'stress', nodes: 10_000/u);
    assert.match(source, /kind: 'duplicate-heavy',\s+nodes: 10_000/u);
    assert.match(source, /await compare\(/u);
    assert.match(source, /METRIC plite_structural_compare_passed=/u);
  });
});
