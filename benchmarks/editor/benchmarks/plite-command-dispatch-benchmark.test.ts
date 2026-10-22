import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';

const root = resolve(import.meta.dir, '../../..');
const registryPath = resolve(root, 'benchmarks/targets/slate-v2.json');
const packagePath = resolve(root, 'package.json');

describe('command dispatch benchmark authority', () => {
  it('registers one strict current target and its generated artifact', () => {
    const registry = JSON.parse(readFileSync(registryPath, 'utf-8')) as {
      targets: Array<{
        artifacts: Array<{ path: string; required: boolean }>;
        command: string;
        correctness: { command: string; policy: string };
        id: string;
        metrics: { primary: string; printsMetric: boolean; unit: string };
        thresholds?: { promotion?: string };
      }>;
    };
    const targets = registry.targets.filter(
      ({ id }) => id === 'plite-command-dispatch'
    );

    assert.equal(targets.length, 1);
    assert.match(targets[0].command, /PLITE_COMMAND_DISPATCH_STRICT=1/u);
    assert.match(targets[0].command, /--expose-gc/u);
    assert.match(targets[0].command, /plite-command-dispatch-benchmark\.ts/u);
    assert.equal(
      targets[0].metrics.primary,
      'plite_command_dispatch_worst_budget_ratio'
    );
    assert.equal(targets[0].metrics.printsMetric, true);
    assert.equal(targets[0].metrics.unit, 'ratio');
    assert.deepEqual(targets[0].artifacts, [
      {
        path: 'tmp/plite-command-dispatch-benchmark.json',
        required: true,
      },
    ]);
    assert.match(targets[0].correctness.command, /command-spec\.test\.ts/u);
    assert.match(
      targets[0].correctness.command,
      /plugin-configuration\.test\.ts/u
    );
    assert.match(
      targets[0].correctness.command,
      /plite-command-dispatch-benchmark\.test\.ts/u
    );
    assert.match(
      targets[0].thresholds?.promotion ?? '',
      /simple 20k\/100-block p50 ratio<=2/u
    );
  });

  it('runs the authority check in the strict Plite contract gate', () => {
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8')) as {
      scripts: Record<string, string>;
    };

    assert.match(
      packageJson.scripts['check:plite:contracts'] ?? '',
      /plite-command-dispatch-benchmark\.test\.ts/u
    );
  });
});
