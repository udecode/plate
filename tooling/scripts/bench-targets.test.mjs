import assert from 'node:assert/strict';
import { execFile, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';

import {
  createRichTextEditorBenchmarkRows,
  createSlateLegacyCompareRows,
} from '../../benchmarks/editor/src/index.mjs';
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

const benchmarkNodeRuntime = process.versions.bun
  ? JSON.parse(
      execFileSync(
        'node',
        [
          '-p',
          'JSON.stringify({ version: process.version, executable: process.execPath })',
        ],
        { encoding: 'utf-8' }
      )
    )
  : { executable: process.execPath, version: process.version };

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
      ...benchmarkNodeRuntime,
      pnp: 'active',
    });
  });
}

for (const [packageName, directoryName] of [
  ['platejs', 'platejs'],
  ['@platejs/test', 'test'],
  ['plitejs', 'plitejs'],
  ['slate', 'slate'],
  ['slate-react', 'slate-react'],
  ['slate-history', 'slate-history'],
]) {
  test(`resolves ${packageName} from an isolated comparison runner`, async () => {
    const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-workspace-'));
    const packageDirectory = path.join(repo, 'packages', directoryName);
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

test('rejects target paths outside the repo and reports missing paths', () => {
  const escaping = {
    ...target({ id: 'escaping-target', path: 'tmp/../../escape.json' }),
    cwd: '../outside',
  };
  const missing = {
    ...target({ id: 'missing-paths', path: null }),
    cwd: null,
  };

  assert.deepEqual(
    validateRegistry({
      version: 1,
      policy: { timeouts: { benchmarkMs: 1000, correctnessMs: 1000 } },
      targets: [escaping, missing],
    }),
    [
      'escaping-target: cwd must stay inside the repo',
      'escaping-target: artifact path must stay inside the repo',
      'missing-paths: missing cwd',
      'missing-paths: artifact missing path',
    ]
  );
});

test('rejects a recipe variable that the environment scrub cannot see', () => {
  const recipe = (id, command) => ({
    ...target({ id, path: 'tmp/recipe.json' }),
    command,
  });

  assert.deepEqual(
    validateRegistry({
      version: 1,
      policy: { timeouts: { benchmarkMs: 1000, correctnessMs: 1000 } },
      targets: [
        recipe('chained', 'node prepare.mjs && KNOB=1 node bench.mjs'),
        recipe('env', 'env KNOB=1 node bench.mjs'),
        recipe('leading', 'KNOB=1 node bench.mjs -g "keeps rows=8"'),
      ],
    }),
    [
      'chained: command must set variables only before its first word',
      'env: command must set variables only before its first word',
    ]
  );
});

test('rejects evidence on more than one artifact of a target', () => {
  const evidence = { category: 'core', kind: 'current' };
  const twice = {
    ...target({ id: 'twice', path: 'tmp/first.json' }),
    artifacts: [
      { path: 'tmp/first.json', required: true, evidence },
      { path: 'tmp/second.json', required: true, evidence },
    ],
  };

  assert.deepEqual(
    validateRegistry({
      version: 1,
      policy: { timeouts: { benchmarkMs: 1000, correctnessMs: 1000 } },
      targets: [twice],
    }),
    ['twice: only one artifact may declare evidence']
  );
});

test('preserves historical receipts without claiming current benchmark success', (t) => {
  const stickyPath = `.tmp/bench-targets-sticky-${process.pid}.json`;
  const missingPath = `.tmp/bench-targets-missing-${process.pid}.json`;
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-history-'));
  t.after(() => fs.rmSync(repoRoot, { force: true, recursive: true }));

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
    ],
    { repoRoot }
  );

  assert.deepEqual(history.counts, {
    artifacts: 2,
    recordedArtifacts: 1,
    missingOptionalArtifacts: 0,
    missingRequiredArtifacts: 1,
    requiredArtifacts: 2,
    statusCounts: {
      'missing-required-artifact': 1,
      recorded: 1,
    },
    latestRunCounts: { none: 2 },
    targets: 2,
  });
  assert.equal(
    history.targets.find((entry) => entry.id === 'sticky-target')?.status,
    'recorded'
  );
  assert.equal(history.targets[1].artifacts[0].recorded, true);
  assert.equal(fs.existsSync(stickyPath), false);
  const regenerated = buildTargetHistory(
    {
      version: 1,
      policy: {},
      targets: [target({ id: 'sticky-target', path: stickyPath })],
    },
    [history],
    { repoRoot }
  );
  assert.equal(regenerated.targets[0].artifacts[0].recorded, true);
  assert.match(
    renderMarkdownReport(history),
    /does not establish current availability, source freshness, or passing budgets/
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

const receiptFile = (workspace) =>
  path.join(workspace, 'tmp/bench-targets/receipts/runner-fixture.json');

const readReceipt = (workspace) =>
  JSON.parse(fs.readFileSync(receiptFile(workspace), 'utf-8'));

const sha256 = (text) => createHash('sha256').update(text).digest('hex');

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
  assert.deepEqual(readReceipt(workspace), result.receipt);
  assert.deepEqual(result.receipt.contract, {
    cwd: '.',
    command: fixtureCommand(benchmark),
    correctness: fixtureCommand(correctness),
    unset: [],
    artifacts: [{ path: 'artifact.json', required: true }],
    metric: {
      primary: 'runner-fixture_metric',
      direction: 'lower',
      printsMetric: true,
    },
    timeouts: { benchmarkMs: 5000, correctnessMs: 5000 },
  });
  assert.deepEqual(
    result.receipt.processes.map(({ role, exitCode }) => [role, exitCode]),
    [
      ['correctness', 0],
      ['benchmark', 0],
    ]
  );
  assert.deepEqual(result.receipt.artifacts, [
    {
      path: 'artifact.json',
      required: true,
      sha256: sha256('fresh'),
      changed: true,
    },
  ]);
  assert.deepEqual(result.receipt.result, {
    status: 'passed',
    primaryMetric: 12.5,
  });
});

test('reports the latest receipt and whether its recipe still matches', async (t) => {
  const { script, workspace } = fixtureWorkspace(t);
  const correctness = script('correctness.mjs', 'process.exit(0);');
  const benchmark = script(
    'benchmark.mjs',
    "import fs from 'node:fs'; fs.writeFileSync('artifact.json', 'fresh'); console.log('METRIC runner-fixture_metric=1');"
  );
  const fixture = fixtureTarget({ benchmark, correctness });
  await runBenchmarkTarget(fixture, {
    repoRoot: workspace,
    writeOutput: false,
  });
  const registry = (targets) => ({
    version: 1,
    policy: { timeouts: { benchmarkMs: 5000, correctnessMs: 5000 } },
    targets,
  });
  const history = (targets, previous = []) =>
    buildTargetHistory(registry(targets), previous, { repoRoot: workspace })
      .targets[0];

  const relabelled = history([{ ...fixture, question: 'reworded question' }]);
  assert.equal(relabelled.latestRun.status, 'passed');
  assert.equal(relabelled.recipe, 'current');
  assert.equal(
    history([{ ...fixture, command: `${fixture.command} --changed` }]).recipe,
    'changed'
  );

  fs.rmSync(receiptFile(workspace));
  assert.deepEqual(
    history([fixture], [{ targets: [relabelled] }]).latestRun,
    relabelled.latestRun
  );
});

test('keeps variables a recipe names out of the inherited environment', async (t) => {
  const { script, workspace } = fixtureWorkspace(t);
  const correctness = script('correctness.mjs', 'process.exit(0);');
  const benchmark = script(
    'benchmark.mjs',
    "import fs from 'node:fs'; fs.writeFileSync('artifact.json', process.env.FIXTURE_ITERATIONS ?? 'default'); console.log('METRIC runner-fixture_metric=1');"
  );
  process.env.FIXTURE_ITERATIONS = '1';
  t.after(() => {
    delete process.env.FIXTURE_ITERATIONS;
  });

  const result = await runBenchmarkTarget(
    {
      ...fixtureTarget({ benchmark, correctness }),
      correctness: {
        command: `FIXTURE_ITERATIONS=1 ${fixtureCommand(correctness)}`,
      },
    },
    { repoRoot: workspace, writeOutput: false }
  );

  assert.equal(
    fs.readFileSync(path.join(workspace, 'artifact.json'), 'utf-8'),
    'default'
  );
  assert.deepEqual(result.receipt.contract.unset, ['FIXTURE_ITERATIONS']);
});

test('replaces the latest receipt when correctness fails before the benchmark', async (t) => {
  const { script, workspace } = fixtureWorkspace(t);
  const correctness = script('correctness.mjs', 'process.exit(7);');
  const benchmark = script(
    'benchmark.mjs',
    "import fs from 'node:fs'; fs.writeFileSync('benchmark.marker', 'ran');"
  );
  fs.writeFileSync(path.join(workspace, 'artifact.json'), 'old pass');
  fs.mkdirSync(path.dirname(receiptFile(workspace)), { recursive: true });
  fs.writeFileSync(
    receiptFile(workspace),
    JSON.stringify({ result: { status: 'passed', primaryMetric: 1 } })
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
  const receipt = readReceipt(workspace);
  assert.equal(receipt.result.status, 'failed');
  assert.equal(receipt.result.stage, 'correctness');
  assert.deepEqual(receipt.artifacts, [
    {
      path: 'artifact.json',
      required: true,
      sha256: sha256('old pass'),
      changed: false,
    },
  ]);
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
  assert.equal(readReceipt(workspace).result.stage, 'artifact');
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
  assert.equal(readReceipt(workspace).result.stage, 'metric');
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
  assert.equal(readReceipt(workspace).result.stage, 'benchmark');
});

test('fails the run when its receipt cannot be written', async (t) => {
  const { script, workspace } = fixtureWorkspace(t);
  const correctness = script('correctness.mjs', 'process.exit(0);');
  const benchmark = script(
    'benchmark.mjs',
    "import fs from 'node:fs'; fs.writeFileSync('artifact.json', 'fresh'); console.log('METRIC runner-fixture_metric=1');"
  );
  fs.mkdirSync(receiptFile(workspace), { recursive: true });

  await assert.rejects(
    () =>
      runBenchmarkTarget(fixtureTarget({ benchmark, correctness }), {
        repoRoot: workspace,
        writeOutput: false,
      }),
    /Could not write benchmark receipt for runner-fixture/u
  );
});

function evidenceRepo(t, thresholds = {}) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'evidence-admission-'));
  t.after(() => fs.rmSync(base, { force: true, recursive: true }));
  const repo = path.join(base, 'repo');
  const lab = path.join(repo, 'benchmarks/editor');
  const write = (file, content) => {
    fs.mkdirSync(path.dirname(path.join(repo, file)), { recursive: true });
    fs.writeFileSync(path.join(repo, file), content);
  };
  const node = (file) => `${JSON.stringify(process.execPath)} ${file}`;
  const evidence = {
    kind: 'current',
    category: 'core',
    library: 'slate-v2:core',
  };
  const core = {
    ...target({ id: 'core', path: 'tmp/core.json' }),
    command: node('write-core.mjs'),
    correctness: { command: node('ok.mjs') },
    metrics: { primary: 'core_metric', direction: 'lower', printsMetric: true },
    artifacts: [{ path: 'tmp/core.json', required: true, evidence }],
  };
  const declared = {
    ...core,
    id: 'declared',
    artifacts: [{ path: 'tmp/declared.json', required: true, evidence }],
  };

  fs.mkdirSync(path.join(base, 'slate'), { recursive: true });
  write('src/input.ts', 'export const input = 1;\n');
  write('ok.mjs', 'process.exit(0);');
  write(
    'write-core.mjs',
    `import { createHash } from 'node:crypto'; import fs from 'node:fs';
const digest = createHash('sha256').update(fs.readFileSync('src/input.ts')).digest('hex');
fs.mkdirSync('tmp', { recursive: true });
fs.writeFileSync('tmp/core.json', JSON.stringify({ lanes: { normal: { opMs: { median: 1, p95: 2, samples: [1, 2] } } }, issueTargetThresholds: ${JSON.stringify(thresholds)}, sourceIdentity: { measuredInputs: { 'src/input.ts': digest } } }));
console.log('METRIC core_metric=1');`
  );
  write(
    'benchmarks/targets/slate-v2.json',
    JSON.stringify({
      version: 1,
      policy: { timeouts: { benchmarkMs: 5000, correctnessMs: 5000 } },
      targets: [core, declared],
    })
  );
  write(
    'benchmarks/editor/research/benchmark-registry.json',
    JSON.stringify({
      version: 2,
      policy: {},
      discardUnregistered: [],
      workloads: [
        { id: 'core-work', workload: 'core work', targets: ['core'] },
        { id: 'declared-work', workload: 'declared', targets: ['declared'] },
      ],
      retired: [
        {
          id: 'old-core',
          relatedTarget: 'core',
          kind: 'current',
          category: 'old-core',
          path: 'tmp/old-core.json',
        },
      ],
    })
  );

  const rows = () => createRichTextEditorBenchmarkRows({ rootDir: lab });
  const registry = (edit) =>
    write(
      'benchmarks/targets/slate-v2.json',
      JSON.stringify({
        version: 1,
        policy: { timeouts: { benchmarkMs: 5000, correctnessMs: 5000 } },
        targets: [{ ...core, ...edit }, declared],
      })
    );
  return {
    registry,
    coverage: (workload) =>
      rows().find(
        (row) =>
          row.category === 'rich-text-editor-workload-coverage' &&
          row.fixture === workload &&
          row.library === 'slate-v2'
      ).status,
    lab,
    produce: () =>
      execFileSync(process.execPath, ['write-core.mjs'], { cwd: repo }),
    repo,
    rows: (id) => rows().filter((row) => row.target === id),
    run: () => runBenchmarkTarget(core, { repoRoot: repo, writeOutput: false }),
    write,
  };
}

test('admits an artifact only while its receipt and recorded inputs match', async (t) => {
  const fixture = evidenceRepo(t);
  const states = () => [
    ...new Set(
      fixture.rows('core').map((row) => `${row.status}/${row.admission}`)
    ),
  ];

  fixture.produce();
  assert.deepEqual(states(), ['unknown/unknown']);
  assert.equal(fixture.coverage('core-work'), 'uncovered');

  await fixture.run();
  assert.deepEqual(states(), ['ok/current']);
  assert.equal(fixture.coverage('core-work'), 'ok');
  assert.equal(fixture.coverage('declared-work'), 'uncovered');

  fixture.registry({ question: 'reworded question' });
  assert.deepEqual(states(), ['ok/current']);
  fixture.registry({ command: 'node write-core.mjs --changed' });
  assert.deepEqual(states(), ['stale/stale']);
  assert.match(fixture.rows('core')[0].note, /contract-changed/u);
  fixture.registry({});

  fixture.write('src/input.ts', 'export const input = 2;\n');
  assert.deepEqual(states(), ['stale/stale']);
  assert.match(fixture.rows('core')[0].note, /input-changed:src\/input\.ts/u);
  assert.equal(fixture.coverage('core-work'), 'uncovered');

  fixture.write('src/input.ts', 'export const input = 1;\n');
  fixture.write('write-core.mjs', 'process.exit(3);');
  await assert.rejects(fixture.run, /benchmark failed: exit=3/u);
  const [failed, ...older] = fixture.rows('core');
  assert.equal(older.length, 0);
  assert.equal(failed.status, 'stale');
  assert.equal(failed.medianUs, undefined);
  assert.match(failed.note, /latest run failed at benchmark: .*exit=3/u);
});

test('keeps evidence unknown unless a readable receipt vouches for its bytes and inputs', async (t) => {
  const fixture = evidenceRepo(t);
  const artifact = path.join(fixture.repo, 'tmp/core.json');
  const expectUnknown = (reason) => {
    const rows = fixture.rows('core');
    assert.deepEqual(
      rows.map((row) => row.status),
      rows.map(() => 'unknown')
    );
    assert.match(rows[0].note, reason);
  };

  await fixture.run();
  fixture.write('tmp/bench-targets/receipts/core.json', '{');
  expectUnknown(/receipt-unreadable/u);

  await fixture.run();
  const payload = JSON.parse(fs.readFileSync(artifact, 'utf-8'));
  payload.lanes.normal.opMs.median = 5;
  fs.writeFileSync(artifact, JSON.stringify(payload));
  expectUnknown(/artifact-not-from-receipt/u);

  fixture.write(
    'write-core.mjs',
    `import fs from 'node:fs';
fs.writeFileSync('tmp/core.json', JSON.stringify({ lanes: { normal: { opMs: { median: 1, p95: 2, samples: [1, 2] } } } }));
console.log('METRIC core_metric=1');`
  );
  await fixture.run();
  expectUnknown(/no-recorded-inputs/u);

  fs.writeFileSync(artifact, 'not json');
  assert.deepEqual(
    fixture.rows('core').map((row) => row.status),
    ['integrity-error']
  );
});

test('recomputes a threshold verdict instead of trusting a cached pass', async (t) => {
  const fixture = evidenceRepo(t, {
    cachedPass: { actualMs: 100, limitMs: 1, operator: '<=', passed: true },
    exactMissed: { actual: 0, limit: 1, operator: '===', passed: false },
    missed: { actualMs: 100, limitMs: 1, operator: '<=', passed: false },
    underLimit: { actualMs: 1, limitMs: 100, operator: '<=', passed: true },
    unrecordedOperator: { actualMs: 100, limitMs: 1, passed: false },
  });
  await fixture.run();

  assert.deepEqual(
    Object.fromEntries(
      fixture
        .rows('core')
        .filter((row) => row.category === 'core-threshold')
        .map((row) => [row.fixture, row.status])
    ),
    {
      cachedPass: 'integrity-error',
      exactMissed: 'over-budget',
      missed: 'over-budget',
      underLimit: 'unassessed',
      unrecordedOperator: 'unassessed',
    }
  );
});

test('reports retired and unavailable evidence without a current claim', (t) => {
  const fixture = evidenceRepo(t);

  assert.deepEqual(
    createRichTextEditorBenchmarkRows({ rootDir: fixture.lab })
      .filter((row) => row.fixture === 'old-core')
      .map((row) => [row.status, row.admission]),
    [['historical', 'historical']]
  );
  assert.deepEqual(
    createSlateLegacyCompareRows({ rootDir: fixture.lab }).map(
      (row) => row.status
    ),
    ['unavailable']
  );
});
