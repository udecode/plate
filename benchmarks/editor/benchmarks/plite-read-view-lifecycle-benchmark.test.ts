import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';

const root = resolve(import.meta.dir, '../../..');
const benchmarkPath = resolve(
  root,
  'benchmarks/editor/benchmarks/plite-read-view-lifecycle-benchmark.ts'
);
const registryPath = resolve(root, 'benchmarks/targets/slate-v2.json');
const packagePath = resolve(root, 'package.json');

describe('read-view lifecycle benchmark authority', () => {
  it('registers one strict target and artifact', () => {
    const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as {
      targets: Array<{
        artifacts: Array<{ path: string; required: boolean }>;
        command: string;
        id: string;
        metrics: { primary: string; printsMetric: boolean; unit: string };
      }>;
    };
    const targets = registry.targets.filter(
      ({ id }) => id === 'plite-read-view-lifecycle'
    );

    assert.equal(targets.length, 1);
    assert.match(targets[0]!.command, /PLITE_READ_VIEW_LIFECYCLE_STRICT=1/u);
    assert.match(
      targets[0]!.command,
      /plite-read-view-lifecycle-benchmark\.ts/u
    );
    assert.equal(
      targets[0]!.metrics.primary,
      'plite_read_view_lifecycle_width_ratio'
    );
    assert.equal(targets[0]!.metrics.printsMetric, true);
    assert.equal(targets[0]!.metrics.unit, 'ratio');
    assert.deepEqual(targets[0]!.artifacts, [
      {
        path: 'tmp/plite-read-view-lifecycle-benchmark.json',
        required: true,
      },
    ]);
  });

  it('locks structural counters, commit stability, and the width budget', () => {
    const source = readFileSync(benchmarkPath, 'utf8');

    assert.match(source, /runCohort\(1\)/u);
    assert.match(source, /runCohort\(100\)/u);
    assert.match(source, /warmFactoryCalls !== 0/u);
    assert.match(
      source,
      /postCommitFactoryCalls !== row\.initialFactoryCalls/u
    );
    assert.match(source, /revision < 100/u);
    assert.match(source, /widthRatio > 2/u);
  });

  it('runs the authority check in the strict Plite contract gate', () => {
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8')) as {
      scripts: Record<string, string>;
    };

    assert.match(
      packageJson.scripts['check:plite:contracts'] ?? '',
      /plite-read-view-lifecycle-benchmark\.test\.ts/u
    );
  });
});
