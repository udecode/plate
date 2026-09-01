import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';

import { benchmarkRepo } from '../../benchmarks/slate-v2/donor/shared/repo-compare.mjs';
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

for (const scenario of [
  { name: 'complete', status: 0, attachments: true, expected: 0 },
  {
    name: 'relative report path',
    status: 0,
    attachments: true,
    expected: 0,
    relative: true,
  },
  { name: 'failed', status: 7, attachments: true, expected: 7 },
  { name: 'missing', status: 0, attachments: false, expected: 1 },
]) {
  test(`pagination burst runner preserves ${scenario.name} proof`, async (t) => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'pagination-proof-')
    );
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
    const repo = path.resolve(import.meta.dirname, '../..');
    const report = path.join(directory, 'report.json');
    const artifact = path.join(directory, 'artifact.json');
    const attachments = [
      'pagination-staged-burst-metrics',
      'pagination-staged-500-row-burst-metrics',
      'pagination-virtualized-rows800-perf-metrics',
    ].map((name) => ({
      name,
      body: Buffer.from(JSON.stringify({ burstSettledMs: 1 })).toString(
        'base64'
      ),
    }));
    fs.writeFileSync(report, JSON.stringify({ attachments }));
    fs.writeFileSync(
      path.join(directory, 'pnpm'),
      `#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const args = process.argv.slice(2);
assert.deepEqual(args.slice(0, 3), ['exec', 'playwright', 'test']);
assert.ok(args.includes('--config=apps/plite/playwright.config.ts'));
assert.ok(args.includes('tests/plite-browser/donor/examples/pagination.test.ts'));
assert.ok(path.isAbsolute(process.env.PLAYWRIGHT_JSON_OUTPUT_NAME));
if (${scenario.attachments}) fs.writeFileSync(process.env.PLAYWRIGHT_JSON_OUTPUT_NAME, ${JSON.stringify(JSON.stringify({ attachments }))});
process.exitCode = ${scenario.status};
`,
      { mode: 0o755 }
    );
    let status = 0;
    try {
      await promisify(execFile)(
        process.execPath,
        [
          'benchmarks/slate-v2/donor/browser/react/pagination-virtualized-char-burst.mjs',
        ],
        {
          cwd: repo,
          env: {
            ...process.env,
            PATH: `${directory}${path.delimiter}${process.env.PATH}`,
            PLITE_PAGINATION_CHAR_BURST_BASE_URL: 'http://127.0.0.1:1',
            PLITE_PAGINATION_CHAR_BURST_REPORT: scenario.relative
              ? path.relative(repo, report)
              : report,
            PLITE_PAGINATION_CHAR_BURST_ARTIFACT: artifact,
          },
          timeout: 10_000,
        }
      );
    } catch (error) {
      status = error.code;
    }
    assert.equal(status, scenario.expected);
    const result = JSON.parse(fs.readFileSync(artifact, 'utf-8'));
    assert.equal(result.playwright.status, scenario.status);
    assert.equal(
      result.metrics.pagination_virtualized_failed,
      scenario.expected === 0 ? 0 : 1
    );
  });
}

for (const packageManager of ['pnpm', 'yarn', 'bun']) {
  test(`comparison uses the pinned Node runtime with ${packageManager}`, async (t) => {
    const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-runtime-'));
    t.after(() => fs.rmSync(repo, { recursive: true, force: true }));
    fs.writeFileSync(
      path.join(repo, '.pnp.cjs'),
      'process.env.BENCHMARK_FIXTURE_PNP = "active";'
    );
    const result = await benchmarkRepo({
      benchmarkSource:
        'console.log(JSON.stringify({ version: process.version, executable: process.execPath, pnp: process.env.BENCHMARK_FIXTURE_PNP }));',
      env: {},
      packageManager,
      repo,
    });
    assert.deepEqual(result, {
      version: process.version,
      executable: process.execPath,
      pnp: 'active',
    });
  });
}

for (const packageName of [
  'plitejs',
  'slate',
  'slate-react',
  'slate-history',
]) {
  test(`resolves ${packageName} from an isolated comparison runner`, async () => {
    const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-workspace-'));
    const packageDirectory = path.join(repo, 'packages', packageName);
    fs.mkdirSync(path.join(packageDirectory, 'dist'), { recursive: true });
    fs.writeFileSync(
      path.join(packageDirectory, 'package.json'),
      JSON.stringify({
        name: packageName,
        type: 'module',
        main: './dist/index.js',
        exports: { '.': './dist/index.js', './react': './dist/index.js' },
      })
    );
    fs.writeFileSync(
      path.join(packageDirectory, 'dist/index.js'),
      `export const owner = ${JSON.stringify(packageName)};`
    );
    try {
      const result = await benchmarkRepo({
        benchmarkSource: `import { owner } from ${JSON.stringify(packageName)};
import { owner as subpathOwner } from ${JSON.stringify(`${packageName}/react`)};
console.log(JSON.stringify({ owner, subpathOwner }));`,
        env: {},
        packageManager: 'node',
        repo,
      });
      assert.deepEqual(result, {
        owner: packageName,
        subpathOwner: packageName,
      });
      assert.deepEqual(fs.readdirSync(path.join(repo, '.tmp/benchmarks')), []);
    } finally {
      fs.rmSync(repo, { recursive: true, force: true });
    }
  });
}

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
    'bun test --preload ./config/plite-source-test-setup.ts ./packages/plitejs/test/normalization-contract.ts'
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
