import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildTargetHistory,
  renderMarkdownReport,
  runBenchmarkTarget,
  validateRegistry,
} from './bench-targets.mjs';

const target = ({ id, path: innerPath, required = true }) => ({
  id,
  question: `${id} question`,
  owner: 'plite',
  family: 'test',
  kind: 'current',
  cwd: '.',
  command: 'true',
  metrics: {
    primary: `${id}_metric`,
    direction: 'lower',
    printsMetric: true,
  },
  correctness: {
    command: 'true',
  },
  artifacts: [{ path: innerPath, required }],
  timeouts: { benchmarkMs: 5000, correctnessMs: 5000 },
});

test('keeps normalization benchmark correctness focused', () => {
  const registry = JSON.parse(
    fs.readFileSync(
      path.resolve(
        import.meta.dirname,
        '../../benchmarks/targets/slate-v2.json'
      ),
      'utf-8'
    )
  );
  const normalization = registry.targets.find(
    ({ id }) => id === 'core-normalization-current'
  );

  assert.equal(
    normalization?.correctness.command,
    'bun test --preload ./config/plite-source-test-setup.ts ./packages/plite/test/normalization-contract.ts'
  );
});

test('requires positive benchmark timeout policy fields', () => {
  const registry = {
    version: 1,
    policy: {
      timeouts: { benchmarkMs: 0, correctnessMs: 1000 },
    },
    targets: [target({ id: 'timeout-target', path: 'artifact.json' })],
  };

  assert.deepEqual(validateRegistry(registry), [
    'policy.timeouts.benchmarkMs must be a positive integer',
  ]);
});

test('keeps previous artifact existence sticky for partial local benchmark caches', () => {
  const stickyPath = `.tmp/bench-targets-sticky-${process.pid}.json`;
  const missingPath = `.tmp/bench-targets-missing-${process.pid}.json`;

  const history = buildTargetHistory(
    {
      version: 1,
      policy: {},
      targets: [
        target({ id: 'missing-target', path: missingPath }),
        target({ id: 'sticky-target', path: stickyPath }),
      ],
    },
    [
      {
        targets: [
          {
            id: 'sticky-target',
            artifacts: [{ path: stickyPath, required: true, exists: true }],
          },
        ],
      },
    ]
  );

  assert.deepEqual(history.counts, {
    artifacts: 2,
    existingArtifacts: 1,
    missingOptionalArtifacts: 0,
    missingRequiredArtifacts: 1,
    requiredArtifacts: 2,
    statusCounts: {
      'missing-required-artifact': 1,
      ok: 1,
    },
    targets: 2,
  });
  assert.equal(
    history.targets.find((entry) => entry.id === 'sticky-target')?.status,
    'ok'
  );
  assert.match(renderMarkdownReport(history), /Missing required artifacts: 1/);
});

function fixtureCommand(filePath) {
  return `${JSON.stringify(process.execPath)} ${JSON.stringify(filePath)}`;
}

function fixtureTarget({ artifact = 'artifact.json', benchmark, correctness }) {
  return {
    ...target({ id: 'runner-fixture', path: artifact }),
    command: fixtureCommand(benchmark),
    correctness: { command: fixtureCommand(correctness) },
  };
}

function fixtureWorkspace(t) {
  const workspace = fs.mkdtempSync(
    path.join(os.tmpdir(), 'plite-benchmark-target-')
  );
  t.after(() => {
    fs.rmSync(workspace, { force: true, recursive: true });
  });

  return {
    script(name, source) {
      const filePath = path.join(workspace, name);
      fs.writeFileSync(filePath, source);
      return filePath;
    },
    workspace,
  };
}

test('runs correctness before the benchmark and verifies fresh evidence', async (t) => {
  const { script, workspace } = fixtureWorkspace(t);
  const correctness = script(
    'correctness.mjs',
    "import fs from 'node:fs'; fs.writeFileSync('correctness.marker', 'ok');"
  );
  const benchmark = script(
    'benchmark.mjs',
    "import fs from 'node:fs'; if (!fs.existsSync('correctness.marker')) process.exit(4); fs.writeFileSync('artifact.json', 'fresh'); console.log('METRIC runner-fixture_metric=12.5');"
  );

  const result = await runBenchmarkTarget(
    fixtureTarget({ benchmark, correctness }),
    {
      repoRoot: workspace,
      writeOutput: false,
    }
  );

  assert.equal(result.primaryMetric, 12.5);
  assert.equal(
    fs.readFileSync(path.join(workspace, 'artifact.json'), 'utf-8'),
    'fresh'
  );
});

test('stops before the benchmark when correctness fails', async (t) => {
  const { script, workspace } = fixtureWorkspace(t);
  const correctness = script('correctness.mjs', 'process.exit(7);');
  const benchmark = script(
    'benchmark.mjs',
    "import fs from 'node:fs'; fs.writeFileSync('benchmark.marker', 'ran');"
  );

  await assert.rejects(
    () =>
      runBenchmarkTarget(fixtureTarget({ benchmark, correctness }), {
        repoRoot: workspace,
        writeOutput: false,
      }),
    /correctness failed: exit=7/u
  );
  assert.equal(fs.existsSync(path.join(workspace, 'benchmark.marker')), false);
});

test('rejects a required artifact that the benchmark did not refresh', async (t) => {
  const { script, workspace } = fixtureWorkspace(t);
  fs.writeFileSync(path.join(workspace, 'artifact.json'), 'stale');
  const correctness = script('correctness.mjs', 'process.exit(0);');
  const benchmark = script(
    'benchmark.mjs',
    "console.log('METRIC runner-fixture_metric=1');"
  );

  await assert.rejects(
    () =>
      runBenchmarkTarget(fixtureTarget({ benchmark, correctness }), {
        repoRoot: workspace,
        writeOutput: false,
      }),
    /Benchmark artifact is stale: artifact\.json/u
  );
});

test('rejects a benchmark that omits its finite primary metric', async (t) => {
  const { script, workspace } = fixtureWorkspace(t);
  const correctness = script('correctness.mjs', 'process.exit(0);');
  const benchmark = script(
    'benchmark.mjs',
    "import fs from 'node:fs'; fs.writeFileSync('artifact.json', 'fresh');"
  );

  await assert.rejects(
    () =>
      runBenchmarkTarget(fixtureTarget({ benchmark, correctness }), {
        repoRoot: workspace,
        writeOutput: false,
      }),
    /did not print a finite primary metric/u
  );
});

test('preserves the benchmark exit status as a hard failure', async (t) => {
  const { script, workspace } = fixtureWorkspace(t);
  const correctness = script('correctness.mjs', 'process.exit(0);');
  const benchmark = script('benchmark.mjs', 'process.exit(9);');

  await assert.rejects(
    () =>
      runBenchmarkTarget(fixtureTarget({ benchmark, correctness }), {
        repoRoot: workspace,
        writeOutput: false,
      }),
    /benchmark failed: exit=9/u
  );
});
