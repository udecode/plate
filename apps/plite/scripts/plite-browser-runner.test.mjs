import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { stopProcessTree } from '../../../tooling/scripts/run-bounded-process.mjs';

import {
  applyWorkerCap,
  assertBrowserNodeVersion,
  assertBrowserWorkerArgs,
  assertRetryFreeBrowserArgs,
  BROWSER_UNIT_TIMEOUT_OVERHEAD_MS,
  classifyFailure,
  collectReportTests,
  createBrowserRunSummary,
  createProjectExecutionPlan,
  createTestUnits,
  DEFAULT_UNIT_WORKERS,
  fingerprintBrowserUnit,
  formatIntegrityFailureDetails,
  getDefaultMaxTestsPerProcess,
  getSelectionUniverseSelectors,
  MAX_BROWSER_WORKERS,
  MAX_NORMAL_TESTS_PER_PROCESS,
  parseJob,
  resolvePliteBrowserBaseURL,
  resolveBrowserWorkerCount,
  resolveMaxTestsPerProcess,
  resolveTimeoutMs,
  resolveReusableProofState,
  runProjectPool,
  runProjectWaves,
  selectUnitsForJob,
  validateCompletedUnit,
  validateUnitResult,
  verifyExactCoverage,
  verifyMergedSummaries,
} from './plite-browser-runner.mjs';

const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptRoot, '..');

const profileAnnotation = (description) => [
  { description, type: 'plite-browser-profile' },
];

const makeTests = (file, count, profile) =>
  Array.from({ length: count }, (_, index) => ({
    ...(profile ? { annotations: profileAnnotation(profile) } : {}),
    file,
    id: `${file}:${index}`,
    line: index + 1,
    timeoutMs: 45_000,
    title: `${file} duplicate title`,
  }));

test('defaults browser proof to numeric loopback and preserves an explicit target', () => {
  assert.equal(resolvePliteBrowserBaseURL(undefined), 'http://127.0.0.1:3102');
  assert.equal(
    resolvePliteBrowserBaseURL('https://plite-proof.example.test'),
    'https://plite-proof.example.test'
  );
});

test('requires the repository Node major for browser proof', () => {
  assert.equal(assertBrowserNodeVersion('v22.22.1', 'v22'), 22);
  assert.equal(assertBrowserNodeVersion('22.22.1', '22'), 22);
  assert.throws(
    () => assertBrowserNodeVersion('v24.14.1', 'v22'),
    /requires Node 22 from \.nvmrc; received v24\.14\.1/
  );
  assert.throws(
    () => assertBrowserNodeVersion('current', 'v22'),
    /Runtime version must be a Node major or semantic version/
  );
});

test('reports the exact integrity invalidation path and event', () => {
  assert.equal(
    formatIntegrityFailureDetails(
      {
        eventType: 'update',
        path: '/repo/packages/core/src/internal/plugin/resolvePlugin.ts',
      },
      '/repo'
    ),
    ': packages/core/src/internal/plugin/resolvePlugin.ts (update)'
  );
  assert.equal(
    formatIntegrityFailureDetails({ path: '/repo' }, '/repo'),
    ': .'
  );
  assert.equal(formatIntegrityFailureDetails({}, '/repo'), '');
});

test('bounds normal browser processes by exact discovered locations', () => {
  const units = createTestUnits(
    [
      ...makeTests('a.test.ts', 3),
      ...makeTests('b.test.ts', 17),
      ...makeTests('c.test.ts', 4),
    ],
    8
  );

  assert.deepEqual(
    units.map(({ expectedTests, files }) => ({
      expectedTests,
      files,
    })),
    [
      {
        expectedTests: 8,
        files: ['a.test.ts', 'b.test.ts'],
      },
      {
        expectedTests: 8,
        files: ['b.test.ts'],
      },
      {
        expectedTests: 8,
        files: ['b.test.ts', 'c.test.ts'],
      },
    ]
  );
  assert.ok(units.every((unit) => unit.expectedTests <= 8));
  assert.ok(units.every((unit) => unit.testTimeoutMs === 45_000));
  assert.deepEqual(
    units.flatMap(({ testTimeouts }) => testTimeouts),
    units.flatMap(({ testIds }) =>
      testIds.map((id) => ({ id, timeoutMs: 45_000 }))
    )
  );
  assert.deepEqual(units[0].selectors, [
    'a.test.ts:1',
    'a.test.ts:2',
    'a.test.ts:3',
    'b.test.ts:1',
    'b.test.ts:2',
    'b.test.ts:3',
    'b.test.ts:4',
    'b.test.ts:5',
  ]);
  assert.ok(units.every((unit) => !('grep' in unit)));
  assert.deepEqual(
    units.flatMap(({ testIds }) => testIds),
    [
      ...makeTests('a.test.ts', 3),
      ...makeTests('b.test.ts', 17),
      ...makeTests('c.test.ts', 4),
    ].map(({ id }) => id)
  );
});

test('keeps same-line tests atomic and bounds generated title selection', () => {
  const atomic = createTestUnits(
    [
      {
        file: 'same-line.test.ts',
        id: 'a',
        line: 10,
        timeoutMs: 45_000,
        title: 'same',
      },
      {
        file: 'same-line.test.ts',
        id: 'b',
        line: 10,
        timeoutMs: 45_000,
        title: 'same',
      },
      {
        file: 'same-line.test.ts',
        id: 'c',
        line: 20,
        timeoutMs: 45_000,
        title: 'same',
      },
    ],
    2
  );
  const missingLine = createTestUnits(
    [
      {
        file: 'missing-line.test.ts',
        fullTitle: 'chromium missing-line.test.ts generated d',
        id: 'd',
        timeoutMs: 45_000,
        title: 'generated d',
      },
      {
        file: 'missing-line.test.ts',
        fullTitle: 'chromium missing-line.test.ts generated e',
        id: 'e',
        timeoutMs: 45_000,
        title: 'generated e',
      },
      {
        file: 'missing-line.test.ts',
        fullTitle: 'chromium missing-line.test.ts generated f',
        id: 'f',
        timeoutMs: 45_000,
        title: 'generated f',
      },
    ],
    2
  );
  const generatedTests = Array.from({ length: 24 }, (_, index) => ({
    annotations: profileAnnotation('serial'),
    file: 'generated.test.ts',
    fullTitle: `chromium generated.test.ts generated [${index}] (a+b?)`,
    id: `generated-${String(index).padStart(2, '0')}`,
    line: 1324,
    timeoutMs: 45_000,
    title: `generated [${index}] (a+b?)`,
  }));
  const generated = createTestUnits(generatedTests, 8);
  const scopedUniverse = generatedTests.map((row, index) =>
    index === 1 ? { ...row, expectedStatus: 'skipped' } : row
  );
  const scoped = createTestUnits([scopedUniverse[0]], 8, {
    selectionUniverse: scopedUniverse,
  });
  const ambiguous = [
    {
      file: 'ambiguous.test.ts',
      fullTitle: 'chromium ambiguous.test.ts duplicate',
      id: 'ambiguous-a',
      line: 30,
      timeoutMs: 45_000,
      title: 'duplicate',
    },
    {
      file: 'ambiguous.test.ts',
      fullTitle: 'chromium ambiguous.test.ts duplicate',
      id: 'ambiguous-b',
      line: 30,
      timeoutMs: 45_000,
      title: 'duplicate',
    },
  ];

  assert.deepEqual(
    atomic.map(({ selectionMode, selections, selectors, testIds }) => ({
      selectionMode,
      selections,
      selectors,
      testIds,
    })),
    [
      {
        selectionMode: 'location',
        selections: [
          {
            file: 'same-line.test.ts',
            fullTitle: undefined,
            line: 10,
            mode: 'location',
            testIds: ['a', 'b'],
          },
        ],
        selectors: ['same-line.test.ts:10'],
        testIds: ['a', 'b'],
      },
      {
        selectionMode: 'location',
        selections: [
          {
            file: 'same-line.test.ts',
            fullTitle: undefined,
            line: 20,
            mode: 'location',
            testIds: ['c'],
          },
        ],
        selectors: ['same-line.test.ts:20'],
        testIds: ['c'],
      },
    ]
  );

  assert.deepEqual(
    missingLine.map(({ expectedTests, selectionMode, selectors }) => ({
      expectedTests,
      selectionMode,
      selectors,
    })),
    [
      {
        expectedTests: 2,
        selectionMode: 'title',
        selectors: ['missing-line.test.ts'],
      },
      {
        expectedTests: 1,
        selectionMode: 'title',
        selectors: ['missing-line.test.ts'],
      },
    ]
  );
  assert.equal(generated.length, 8);
  assert.ok(
    generated.every(
      (unit) =>
        unit.expectedTests === 3 &&
        unit.profile === 'serial' &&
        unit.selectionMode === 'title' &&
        unit.selectors.length === 1 &&
        unit.selectors[0] === 'generated.test.ts'
    )
  );
  for (const unit of generated) {
    const matcher = new RegExp(unit.grep);

    assert.deepEqual(
      generatedTests
        .filter(({ fullTitle }) => matcher.test(fullTitle))
        .map(({ id }) => id),
      unit.testIds
    );
  }
  assert.deepEqual(
    generated.flatMap(({ testIds }) => testIds),
    generatedTests.map(({ id }) => id)
  );
  assert.equal(scoped.length, 1);
  assert.deepEqual(
    {
      expectedTests: scoped[0].expectedTests,
      selectionMode: scoped[0].selectionMode,
      selectors: scoped[0].selectors,
      testIds: scoped[0].testIds,
    },
    {
      expectedTests: 1,
      selectionMode: 'title',
      selectors: ['generated.test.ts'],
      testIds: [scopedUniverse[0].id],
    }
  );
  assert.deepEqual(
    scopedUniverse
      .filter(({ fullTitle }) => new RegExp(scoped[0].grep).test(fullTitle))
      .map(({ id }) => id),
    [scopedUniverse[0].id]
  );
  assert.equal(
    new RegExp(scoped[0].grep).test(scopedUniverse[1].fullTitle),
    false
  );
  assert.throws(
    () =>
      createTestUnits([ambiguous[0]], 1, {
        selectionUniverse: ambiguous,
      }),
    /ambiguous full test titles/
  );
  assert.throws(
    () =>
      createTestUnits(
        [
          {
            ...ambiguous[0],
            fullTitle: `${ambiguous[0].fullTitle} 0`,
            fullTitleExact: false,
          },
        ],
        1,
        {
          selectionUniverse: ambiguous.map((row, index) => ({
            ...row,
            fullTitle: `${row.fullTitle} ${index}`,
            fullTitleExact: false,
          })),
        }
      ),
    /tagged tests whose exact grep titles cannot be proven/
  );
  assert.throws(() =>
    createTestUnits(
      [
        {
          file: 'duplicate.test.ts',
          id: 'duplicate',
          line: 1,
          timeoutMs: 45_000,
        },
        {
          file: 'duplicate.test.ts',
          id: 'duplicate',
          line: 2,
          timeoutMs: 45_000,
        },
      ],
      2
    )
  );
});

test('scales normal process bounds with unit workers', () => {
  assert.equal(getDefaultMaxTestsPerProcess(1), 4);
  assert.equal(getDefaultMaxTestsPerProcess(2), 8);
  assert.equal(getDefaultMaxTestsPerProcess(8), 32);
  assert.equal(getDefaultMaxTestsPerProcess(16), 32);
  assert.throws(() => getDefaultMaxTestsPerProcess(0));
});

test('lets the process override lower but never raise the worker-scaled bound', () => {
  assert.equal(MAX_NORMAL_TESTS_PER_PROCESS, 32);
  assert.equal(resolveMaxTestsPerProcess(undefined, 1), 4);
  assert.equal(resolveMaxTestsPerProcess('2', 1), 2);
  assert.equal(resolveMaxTestsPerProcess('32', 1), 4);
  assert.equal(resolveMaxTestsPerProcess('32', 8), 32);
  assert.throws(() => resolveMaxTestsPerProcess('33', 8), /cannot exceed 32/u);
  assert.throws(() => resolveMaxTestsPerProcess('0', 8), /positive integer/u);
});

test('limits scoped universe discovery to exact discovered files', () => {
  assert.deepEqual(
    getSelectionUniverseSelectors({
      selectionUniverse: [
        { file: 'tests/a.test.ts', id: 'a' },
        { file: 'tests/a.test.ts', id: 'b' },
        { file: 'tests/b.test.ts', id: 'c' },
      ],
    }),
    ['tests/a.test.ts', 'tests/b.test.ts']
  );
  assert.deepEqual(getSelectionUniverseSelectors({}), []);
});

test('bounds parallel browser projects inside one worker budget', () => {
  assert.deepEqual(
    createProjectExecutionPlan(
      ['chromium', 'firefox', 'mobile', 'webkit'],
      DEFAULT_UNIT_WORKERS
    ),
    { concurrency: 2, unitWorkers: 2 }
  );
  assert.deepEqual(createProjectExecutionPlan(['chromium', 'firefox'], 8, 1), {
    concurrency: 1,
    unitWorkers: 8,
  });
  assert.deepEqual(createProjectExecutionPlan(['chromium', 'firefox'], 1, 2), {
    concurrency: 1,
    unitWorkers: 1,
  });
  assert.deepEqual(
    createProjectExecutionPlan(
      ['chromium', 'firefox', 'mobile', 'webkit'],
      16,
      16
    ),
    { concurrency: 4, unitWorkers: 2 }
  );
  assert.deepEqual(createProjectExecutionPlan(['chromium'], 16, 16), {
    concurrency: 1,
    unitWorkers: MAX_BROWSER_WORKERS,
  });
  assert.throws(() => createProjectExecutionPlan([], 8));
  assert.throws(() => createProjectExecutionPlan(['chromium'], 0));
  assert.throws(() => createProjectExecutionPlan(['chromium'], 8, 0));
});

test('hard-caps every browser worker input at eight', async () => {
  assert.equal(MAX_BROWSER_WORKERS, 8);
  assert.equal(resolveBrowserWorkerCount(4), 4);
  assert.equal(resolveBrowserWorkerCount(16), MAX_BROWSER_WORKERS);
  assert.equal(
    applyWorkerCap(
      [
        {
          expectedTests: 32,
          maxWorkers: Number.POSITIVE_INFINITY,
          testTimeoutMs: 45_000,
        },
      ],
      16
    )[0].workers,
    MAX_BROWSER_WORKERS
  );
  assert.deepEqual(assertBrowserWorkerArgs(['--workers=8']), ['--workers=8']);
  assert.deepEqual(assertBrowserWorkerArgs(['-j', '4']), ['-j', '4']);
  for (const args of [
    ['--workers=9'],
    ['--workers', '9'],
    ['-j=9'],
    ['-j9'],
    ['-j', '9'],
    ['--workers=50%'],
  ]) {
    assert.throws(() => assertBrowserWorkerArgs(args), /workers/u);
  }

  let active = 0;
  let maximumActive = 0;

  await runProjectPool({
    concurrency: 16,
    projects: Array.from({ length: 16 }, (_, index) => String(index)),
    runProject: async () => {
      active++;
      maximumActive = Math.max(maximumActive, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active--;

      return 0;
    },
    stopSiblings: async () => {},
  });

  assert.equal(maximumActive, MAX_BROWSER_WORKERS);
});

test('project pool stops active siblings and does not schedule more work', async () => {
  const started = [];
  let releaseSibling;
  let stops = 0;
  const status = await runProjectPool({
    concurrency: 2,
    projects: ['chromium', 'firefox', 'mobile', 'webkit'],
    runProject: async (project) => {
      started.push(project);

      if (project === 'chromium') return 7;

      return new Promise((resolve) => {
        releaseSibling = resolve;
      });
    },
    stopSiblings: async () => {
      stops++;
      releaseSibling(143);
    },
  });

  assert.equal(status, 7);
  assert.equal(stops, 1);
  assert.deepEqual(started, ['chromium', 'firefox']);
});

test('project pool executes every project exactly once', async () => {
  const completed = [];
  let active = 0;
  let maximumActive = 0;
  const status = await runProjectPool({
    concurrency: 2,
    projects: ['chromium', 'firefox', 'mobile', 'webkit'],
    runProject: async (project) => {
      active++;
      maximumActive = Math.max(maximumActive, active);
      await new Promise((resolve) => setTimeout(resolve, 1));
      completed.push(project);
      active--;

      return 0;
    },
    stopSiblings: () => {
      throw new Error('passing projects must not stop siblings');
    },
  });

  assert.equal(status, 0);
  assert.equal(maximumActive, 2);
  assert.deepEqual(completed.sort(), [
    'chromium',
    'firefox',
    'mobile',
    'webkit',
  ]);
  await assert.rejects(
    runProjectPool({
      concurrency: 0,
      projects: ['chromium'],
      runProject: async () => 0,
      stopSiblings: async () => {},
    }),
    /project concurrency must be a positive integer/
  );
});

test('project waves release one engine generation before starting the next', async () => {
  const completions = new Map();
  const started = [];
  const run = runProjectWaves({
    concurrency: 2,
    projects: ['chromium', 'firefox', 'mobile', 'webkit'],
    runProject: (project) => {
      started.push(project);

      return new Promise((resolve) => completions.set(project, resolve));
    },
    stopSiblings: () => {},
  });

  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(started, ['chromium', 'firefox']);

  completions.get('chromium')(0);
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(started, ['chromium', 'firefox']);

  completions.get('firefox')(0);
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(started, ['chromium', 'firefox', 'mobile', 'webkit']);

  completions.get('mobile')(0);
  completions.get('webkit')(0);
  assert.equal(await run, 0);
});

test('project pool fail-fast terminates a live sibling process', {
  timeout: 5000,
}, async () => {
  let sibling;

  try {
    const status = await runProjectPool({
      concurrency: 2,
      projects: ['chromium', 'firefox', 'mobile'],
      runProject: async (project) => {
        if (project === 'chromium') {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return 9;
        }

        sibling = spawn(
          process.execPath,
          ['--eval', 'setInterval(() => {}, 1000)'],
          {
            detached: process.platform !== 'win32',
            stdio: 'ignore',
          }
        );

        return new Promise((resolve) => {
          sibling.once('close', () => resolve(143));
        });
      },
      stopSiblings: () => stopProcessTree(sibling),
    });

    assert.equal(status, 9);
    assert.ok(sibling.exitCode !== null || sibling.signalCode !== null);
  } finally {
    await stopProcessTree(sibling);
  }
});

test('project pool stops siblings before propagating a project rejection', async () => {
  const expected = new Error('discovery exploded');
  const started = [];
  let releaseSibling;
  let siblingStarted;
  let stops = 0;
  const siblingReady = new Promise((resolve) => {
    siblingStarted = resolve;
  });

  await assert.rejects(
    runProjectPool({
      concurrency: 2,
      projects: ['chromium', 'firefox', 'mobile'],
      runProject: async (project, projectRun) => {
        started.push(project);

        if (project === 'chromium') {
          await siblingReady;
          throw expected;
        }

        siblingStarted();
        await new Promise((resolve) => {
          releaseSibling = resolve;
        });
        projectRun.throwIfCancelled();

        return 0;
      },
      stopSiblings: async () => {
        stops++;
        releaseSibling();
      },
    }),
    expected
  );

  assert.equal(stops, 1);
  assert.deepEqual(started, ['chromium', 'firefox']);
});

test('project cancellation generation prevents a sibling respawn after cleanup', async () => {
  const launches = [];
  let releaseBoundary;
  let siblingAtBoundary;
  let siblingRun;
  const boundaryReached = new Promise((resolve) => {
    siblingAtBoundary = resolve;
  });
  const cleanupFinished = new Promise((resolve) => {
    releaseBoundary = resolve;
  });
  const status = await runProjectPool({
    concurrency: 2,
    projects: ['chromium', 'firefox', 'mobile'],
    runProject: async (project, projectRun) => {
      if (project === 'chromium') {
        await boundaryReached;

        return 9;
      }

      siblingRun = projectRun;
      projectRun.throwIfCancelled();
      launches.push('first subprocess');
      siblingAtBoundary();
      await cleanupFinished;
      projectRun.throwIfCancelled();
      launches.push('second subprocess');

      return 0;
    },
    stopSiblings: async () => {
      assert.equal(siblingRun.cancelled, true);
      releaseBoundary();
    },
  });

  assert.equal(status, 9);
  assert.deepEqual(launches, ['first subprocess']);
});

test('isolates heavy, serial, and context-heavy workload profiles', () => {
  const heavyFile = 'arbitrary-heavy.test.ts';
  const serialFile = 'arbitrary-serial.test.ts';
  const contextHeavyFile = 'arbitrary-context-heavy.test.ts';
  const units = applyWorkerCap(
    createTestUnits(
      [
        ...makeTests('normal.test.ts', 9),
        ...makeTests(heavyFile, 17, 'heavy'),
        ...makeTests(serialFile, 8, 'serial'),
        ...makeTests(contextHeavyFile, 8, 'context-heavy'),
      ],
      8
    ),
    8
  );
  const heavyUnits = units.filter(({ profile }) => profile === 'heavy');
  const serialUnits = units.filter(({ profile }) => profile === 'serial');
  const contextHeavyUnits = units.filter(
    ({ profile }) => profile === 'context-heavy'
  );

  assert.deepEqual(
    heavyUnits.map(
      ({
        expectedTests,
        files,
        runtimeMultiplier,
        schedulingWeight,
        workers,
      }) => ({
        expectedTests,
        files,
        runtimeMultiplier,
        schedulingWeight,
        workers,
      })
    ),
    [
      {
        expectedTests: 8,
        files: [heavyFile],
        runtimeMultiplier: 4,
        schedulingWeight: 32,
        workers: 1,
      },
      {
        expectedTests: 8,
        files: [heavyFile],
        runtimeMultiplier: 4,
        schedulingWeight: 32,
        workers: 1,
      },
      {
        expectedTests: 1,
        files: [heavyFile],
        runtimeMultiplier: 4,
        schedulingWeight: 4,
        workers: 1,
      },
    ]
  );
  assert.deepEqual(
    serialUnits.map(
      ({
        expectedTests,
        files,
        runtimeMultiplier,
        schedulingWeight,
        workers,
      }) => ({
        expectedTests,
        files,
        runtimeMultiplier,
        schedulingWeight,
        workers,
      })
    ),
    [
      {
        expectedTests: 3,
        files: [serialFile],
        runtimeMultiplier: 2,
        schedulingWeight: 6,
        workers: 1,
      },
      {
        expectedTests: 3,
        files: [serialFile],
        runtimeMultiplier: 2,
        schedulingWeight: 6,
        workers: 1,
      },
      {
        expectedTests: 2,
        files: [serialFile],
        runtimeMultiplier: 2,
        schedulingWeight: 4,
        workers: 1,
      },
    ]
  );
  assert.deepEqual(
    contextHeavyUnits.map(
      ({ expectedTests, files, runtimeMultiplier, workers }) => ({
        expectedTests,
        files,
        runtimeMultiplier,
        workers,
      })
    ),
    [
      {
        expectedTests: 3,
        files: [contextHeavyFile],
        runtimeMultiplier: 2,
        workers: 3,
      },
      {
        expectedTests: 3,
        files: [contextHeavyFile],
        runtimeMultiplier: 2,
        workers: 3,
      },
      {
        expectedTests: 2,
        files: [contextHeavyFile],
        runtimeMultiplier: 2,
        workers: 2,
      },
    ]
  );
  assert.throws(
    () => createTestUnits(makeTests('anything.test.ts', 1, 'unknown'), 8),
    /unknown plite-browser-profile/
  );
  assert.throws(
    () =>
      createTestUnits(
        [
          {
            ...makeTests('anything.test.ts', 1)[0],
            annotations: [
              ...profileAnnotation('heavy'),
              ...profileAnnotation('serial'),
            ],
          },
        ],
        8
      ),
    /more than one plite-browser-profile/
  );
});

test('derives a safe outer deadline from Playwright timeout worker waves', () => {
  const units = applyWorkerCap(
    createTestUnits(
      [
        ...makeTests('normal.test.ts', 32),
        ...makeTests('serial.test.ts', 3, 'serial'),
        ...makeTests('heavy.test.ts', 8, 'heavy'),
      ],
      32
    ),
    8,
    1000
  );
  const summary = Object.fromEntries(
    units.map(({ profile, testTimeoutMs, timeoutMs, workers, workerWaves }) => [
      profile,
      { testTimeoutMs, timeoutMs, workers, workerWaves },
    ])
  );

  assert.deepEqual(summary, {
    heavy: {
      testTimeoutMs: 45_000,
      timeoutMs: 8 * 45_000 + BROWSER_UNIT_TIMEOUT_OVERHEAD_MS,
      workers: 1,
      workerWaves: 8,
    },
    normal: {
      testTimeoutMs: 45_000,
      timeoutMs: 4 * 45_000 + BROWSER_UNIT_TIMEOUT_OVERHEAD_MS,
      workers: 8,
      workerWaves: 4,
    },
    serial: {
      testTimeoutMs: 45_000,
      timeoutMs: 3 * 45_000 + BROWSER_UNIT_TIMEOUT_OVERHEAD_MS,
      workers: 1,
      workerWaves: 3,
    },
  });
  assert.ok(
    applyWorkerCap(
      createTestUnits(makeTests('floor.test.ts', 8, 'heavy'), 32),
      8,
      500_000
    ).every(({ timeoutMs }) => timeoutMs === 500_000)
  );
});

test('combines per-test runtime weights with profile multipliers', () => {
  const units = applyWorkerCap(
    createTestUnits(
      [
        {
          file: 'weighted.test.ts',
          id: 'slow',
          line: 1,
          runtimeWeight: 5,
          timeoutMs: 45_000,
        },
        {
          file: 'weighted.test.ts',
          id: 'fast',
          line: 2,
          runtimeWeight: 1,
          timeoutMs: 45_000,
        },
      ],
      8
    ),
    2
  );

  assert.deepEqual(
    units.map(({ runtimeMultiplier, runtimeWeight, schedulingWeight }) => ({
      runtimeMultiplier,
      runtimeWeight,
      schedulingWeight,
    })),
    [{ runtimeMultiplier: 1, runtimeWeight: 6, schedulingWeight: 3 }]
  );
  assert.throws(() =>
    createTestUnits(
      [
        {
          file: 'bad.test.ts',
          id: 'bad',
          line: 1,
          runtimeWeight: 0,
          timeoutMs: 45_000,
        },
      ],
      8
    )
  );
});

test('requires serial Playwright files to declare the serial workload policy', () => {
  const testRoot = path.join(appRoot, 'tests/plite-browser');
  const missingPolicy = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        visit(entryPath);
      } else if (
        entry.name.endsWith('.ts') &&
        fs
          .readFileSync(entryPath, 'utf8')
          .includes("test.describe.configure({ mode: 'serial' })")
      ) {
        const source = fs.readFileSync(entryPath, 'utf8');

        if (
          !source.includes("type: 'plite-browser-profile'") ||
          !source.includes("description: 'serial'")
        ) {
          missingPolicy.push(
            path.relative(appRoot, entryPath).split(path.sep).join('/')
          );
        }
      }
    }
  };

  visit(testRoot);

  assert.deepEqual(missingPolicy, []);
});

test('keeps raw and managed Playwright proof retry-free and worker-bounded', () => {
  const configSource = fs.readFileSync(
    path.join(appRoot, 'playwright.config.ts'),
    'utf8'
  );
  const runnerSource = fs.readFileSync(
    path.join(appRoot, 'scripts/run-plite-browser.mjs'),
    'utf8'
  );
  const workflowSource = fs.readFileSync(
    path.resolve(appRoot, '../../.github/workflows/plite-ci.yml'),
    'utf8'
  );

  assert.deepEqual(assertRetryFreeBrowserArgs(['--project=chromium']), [
    '--project=chromium',
  ]);
  assert.throws(
    () => assertRetryFreeBrowserArgs(['--retries=2']),
    /forbids retry overrides/
  );
  assert.throws(
    () => assertRetryFreeBrowserArgs(['--retries', '2']),
    /forbids retry overrides/
  );
  assert.match(configSource, /retries: 0/u);
  assert.match(configSource, /assertBrowserWorkerArgs\(process\.argv\)/u);
  assert.match(configSource, /MAX_BROWSER_WORKERS/u);
  assert.match(configSource, /resolveBrowserWorkerCount/u);
  assert.doesNotMatch(configSource, /PLAYWRIGHT_RETRIES|retryCount/u);
  assert.match(runnerSource, /assertBrowserWorkerArgs\(args\)/u);
  assert.match(runnerSource, /assertRetryFreeBrowserArgs\(args\)/u);
  assert.match(runnerSource, /'--retries=0'/u);
  assert.match(runnerSource, /`--workers=\$\{MAX_BROWSER_WORKERS\}`/u);
  assert.doesNotMatch(runnerSource, /hasArg\(args, '--retries'\)/u);
  assert.doesNotMatch(workflowSource, /PLAYWRIGHT_RETRIES/u);
});

test('bounds discovery and local build setup subprocesses', () => {
  const runnerSource = fs.readFileSync(
    path.join(appRoot, 'scripts/run-plite-browser.mjs'),
    'utf8'
  );
  const appBuildSource = fs.readFileSync(
    path.join(appRoot, 'scripts/build-app-if-stale.mjs'),
    'utf8'
  );
  const browserBuildSource = fs.readFileSync(
    path.join(appRoot, 'scripts/build-browser-if-stale.mjs'),
    'utf8'
  );

  assert.equal(resolveTimeoutMs(undefined, 60_000, 'timeout'), 60_000);
  assert.equal(resolveTimeoutMs('1250', 60_000, 'timeout'), 1250);
  assert.throws(
    () => resolveTimeoutMs('0', 60_000, 'timeout'),
    /timeout must be a positive number/
  );
  assert.throws(
    () => resolveTimeoutMs('invalid', 60_000, 'timeout'),
    /timeout must be a positive number/
  );
  assert.match(
    runnerSource,
    /buildAppIfStale\(\{[\s\S]*?timeoutMs: buildSetupTimeoutMs/u,
    'local proof builds must have a process deadline'
  );
  assert.doesNotMatch(
    runnerSource,
    /spawnSync\([\s\S]*?build-app-if-stale/u,
    'the browser runner must not wrap the bounded app build in another process'
  );
  for (const source of [appBuildSource, browserBuildSource]) {
    assert.match(source, /await runBoundedProcess\(\{/u);
    assert.doesNotMatch(source, /spawnSync|shell:\s*true/u);
  }
  assert.match(
    runnerSource,
    /\{ echo: false, projectRun, timeoutMs: discoveryTimeoutMs \}/u,
    'Playwright --list discovery must have a process deadline'
  );
  assert.match(
    runnerSource,
    /const runCaptured = async \([\s\S]*?runBoundedProcess\(\{/u
  );
  assert.match(
    runnerSource,
    /PLITE_BROWSER_DIRECT_TIMEOUT_MS[\s\S]*?600_000/u,
    'direct diagnostic proof must have a ten-minute default deadline'
  );
  assert.match(
    runnerSource,
    /const runDirect = async[\s\S]*?timeoutMs: directTimeoutMs/u
  );
  assert.match(
    runnerSource,
    /\? await runDirect\(stripSeparators\(passthroughArgs\)\)/u
  );
  assert.match(
    runnerSource,
    /detached: process\.platform !== 'win32'[\s\S]*?await stopProcessTree\(serverProcess\)/u,
    'the owned proof server must terminate through the bounded process-tree owner'
  );
  assert.match(
    runnerSource,
    /finally \{\s*await stopActiveProcesses\(\);\s*await stopServer\(\);/u,
    'top-level cleanup must drain every bounded subprocess before the server'
  );
  assert.doesNotMatch(runnerSource, /waitForExit/u);
  assert.match(
    runnerSource,
    /spawnSync\(resolved, \['--version'\],[\s\S]*?timeout: 5000/u,
    'custom browser identity probes must have a process deadline'
  );
});

test('parallel local matrix isolates artifacts and keeps a serial override', () => {
  const configSource = fs.readFileSync(
    path.join(appRoot, 'playwright.config.ts'),
    'utf8'
  );
  const runnerSource = fs.readFileSync(
    path.join(appRoot, 'scripts/run-plite-browser.mjs'),
    'utf8'
  );

  assert.match(runnerSource, /PLITE_BROWSER_PROJECT_CONCURRENCY/u);
  assert.match(runnerSource, /PLITE_BROWSER_OUTPUT_DIR/u);
  assert.match(runnerSource, /stopSiblings: \(\) => stopActiveProcesses\(\)/u);
  assert.match(configSource, /PLITE_BROWSER_OUTPUT_DIR/u);
});

test('fans CI proof into independent project jobs with one build owner', () => {
  const workflow = fs.readFileSync(
    path.resolve(appRoot, '../../.github/workflows/plite-ci.yml'),
    'utf8'
  );
  const { dependencies } = JSON.parse(
    fs.readFileSync(path.join(appRoot, 'package.json'), 'utf8')
  );
  const playwrightVersion = dependencies['@playwright/test'];

  assert.equal(
    workflow.match(/name: Build Plite proof app/g)?.length,
    1,
    'the proof app must have one build owner'
  );
  assert.match(workflow, /browser-chromium:[\s\S]*?needs: browser-build/);
  assert.match(workflow, /browser-matrix-linux:[\s\S]*?needs: browser-build/);
  assert.match(workflow, /browser-webkit:[\s\S]*?needs: browser-build/);
  assert.match(workflow, /project: \[firefox, mobile\]/);
  assert.equal(
    workflow.match(/shard: \[1, 2, 3, 4\]/g)?.length,
    3,
    'every browser project lane must fan out into four bounded jobs'
  );
  assert.equal(
    workflow.match(/name: plite-browser-build/g)?.length,
    4,
    'one upload and three project-lane downloads must share the build artifact'
  );
  assert.match(workflow, /Verify exact Chromium coverage/);
  assert.match(workflow, /Verify exact browser-matrix coverage/);
  assert.match(workflow, /run: pnpm check:plite:contracts/);
  assert.doesNotMatch(workflow, /run: pnpm --filter plite test:runner/);
  assert.equal(
    workflow.match(
      new RegExp(
        `mcr\\.microsoft\\.com/playwright:v${playwrightVersion}-noble`,
        'g'
      )
    )?.length,
    2,
    'Linux browser jobs must use the workspace Playwright release'
  );
  assert.doesNotMatch(
    workflow,
    /plite-browser-runner-v2-.*-playwright-\d+\.\d+\.\d+-/u,
    'proof-state caches must derive their Playwright identity from the workspace package'
  );
  assert.match(
    workflow,
    /playwright-\$\{\{ hashFiles\('apps\/plite\/package\.json'\) \}\}/u
  );
});

test('splits CI jobs by workload and executes longest units first', () => {
  const units = [
    { id: '3', schedulingWeight: 6 },
    { id: '1', schedulingWeight: 8 },
    { id: '0', schedulingWeight: 9 },
    { id: '2', schedulingWeight: 7 },
  ];
  const first = selectUnitsForJob(units, parseJob('1/2'));
  const second = selectUnitsForJob(units, parseJob('2/2'));

  assert.equal(
    first.reduce((sum, unit) => sum + unit.schedulingWeight, 0),
    15
  );
  assert.equal(
    second.reduce((sum, unit) => sum + unit.schedulingWeight, 0),
    15
  );
  assert.deepEqual(
    first.map(({ id }) => id),
    ['0', '3']
  );
  assert.deepEqual(
    second.map(({ id }) => id),
    ['1', '2']
  );
  assert.deepEqual([...first, ...second].map(({ id }) => id).sort(), [
    '0',
    '1',
    '2',
    '3',
  ]);
  assert.throws(() => parseJob('0/3'));
  assert.throws(() => parseJob('4/3'));
  assert.throws(() => parseJob('wat'));
});

test('requires exact aggregate coverage including a unique plan', () => {
  assert.deepEqual(verifyExactCoverage(['a', 'b'], ['a', 'b']), {
    duplicatePlanned: [],
    duplicates: [],
    missing: [],
    ok: true,
    unexpected: [],
  });
  assert.deepEqual(verifyExactCoverage(['a', 'a', 'b'], ['a', 'a', 'c']), {
    duplicatePlanned: ['a'],
    duplicates: ['a'],
    missing: ['b'],
    ok: false,
    unexpected: ['c'],
  });
});

test('validates exact per-unit IDs and honest outcomes before resume', () => {
  const unit = {
    id: 'unit',
    testIds: ['a', 'b'],
  };
  const passed = validateUnitResult(unit, [
    { annotations: [], id: 'a', status: 'passed' },
    {
      annotations: [{ description: 'mobile only', type: 'skip' }],
      id: 'b',
      status: 'skipped',
    },
  ]);

  assert.equal(passed.ok, true);
  assert.equal(
    validateCompletedUnit(unit, {
      durationMs: 10,
      id: unit.id,
      results: passed.results,
      unitFingerprint: fingerprintBrowserUnit(unit),
    }),
    true
  );
  assert.equal(
    validateCompletedUnit(unit, {
      durationMs: 10,
      id: unit.id,
      results: passed.results,
      unitFingerprint: 'stale',
    }),
    false
  );
  assert.equal(
    validateUnitResult(unit, [
      { annotations: [], id: 'a', status: 'passed' },
      { annotations: [], id: 'c', status: 'passed' },
    ]).ok,
    false
  );
  assert.equal(
    validateUnitResult(unit, [
      { annotations: [], id: 'a', status: 'passed' },
      { annotations: [], id: 'b', status: 'failed' },
    ]).ok,
    false
  );
  assert.equal(
    validateUnitResult(unit, [
      { annotations: [], id: 'a', status: 'passed' },
      { annotations: [], id: 'b', status: 'skipped' },
    ]).ok,
    false
  );
});

test('reuses only fingerprint-matching complete batches with exact outcomes', () => {
  const [unit] = applyWorkerCap(
    createTestUnits(makeTests('resume.test.ts', 2), 2),
    2
  );
  const completed = {
    durationMs: 123,
    id: unit.id,
    results: unit.testIds.map((id) => ({ id, status: 'passed' })),
    unitFingerprint: fingerprintBrowserUnit(unit),
  };
  const previousState = {
    completed: { [unit.id]: completed },
    proofFingerprint: 'proof-a',
    status: 'complete',
    version: 1,
  };
  const matching = resolveReusableProofState({
    force: false,
    previousState,
    proofFingerprint: 'proof-a',
    selectedUnits: [unit],
    targetResumable: true,
  });

  assert.equal(matching.canResume, true);
  assert.equal(matching.complete, true);
  assert.deepEqual(matching.completed, previousState.completed);

  for (const override of [
    { force: true },
    { proofFingerprint: 'proof-b' },
    { targetResumable: false },
  ]) {
    const invalidated = resolveReusableProofState({
      force: false,
      previousState,
      proofFingerprint: 'proof-a',
      selectedUnits: [unit],
      targetResumable: true,
      ...override,
    });

    assert.equal(invalidated.canResume, false);
    assert.equal(invalidated.complete, false);
    assert.deepEqual(invalidated.completed, {});
  }

  const changedUnit = {
    ...unit,
    workers: unit.workers + 1,
  };
  const changedPolicy = resolveReusableProofState({
    force: false,
    previousState,
    proofFingerprint: 'proof-a',
    selectedUnits: [changedUnit],
    targetResumable: true,
  });

  assert.equal(changedPolicy.canResume, true);
  assert.equal(changedPolicy.complete, false);
  assert.deepEqual(changedPolicy.completed, {});

  const changedTimeoutPolicy = resolveReusableProofState({
    force: false,
    previousState,
    proofFingerprint: 'proof-a',
    selectedUnits: [{ ...unit, timeoutMs: unit.timeoutMs + 1 }],
    targetResumable: true,
  });

  assert.equal(changedTimeoutPolicy.canResume, true);
  assert.equal(changedTimeoutPolicy.complete, false);
  assert.deepEqual(changedTimeoutPolicy.completed, {});

  const falseGreen = resolveReusableProofState({
    force: false,
    previousState: {
      ...previousState,
      completed: {
        [unit.id]: {
          ...completed,
          results: [completed.results[0]],
        },
      },
    },
    proofFingerprint: 'proof-a',
    selectedUnits: [unit],
    targetResumable: true,
  });

  assert.equal(falseGreen.complete, false);
  assert.deepEqual(falseGreen.completed, {});
});

test('emits machine-readable coverage, timing, profiles, and failure phases', () => {
  const [unit] = applyWorkerCap(
    createTestUnits(makeTests('summary.test.ts', 2, 'heavy'), 8),
    2
  );
  const completed = {
    durationMs: 250,
    id: unit.id,
    results: unit.testIds.map((id) => ({ id, status: 'passed' })),
    unitFingerprint: fingerprintBrowserUnit(unit),
  };
  const summary = createBrowserRunSummary({
    completedUnits: [completed],
    durationMs: 12,
    failure: undefined,
    job: { index: 1, total: 1 },
    maxTestsPerProcess: 8,
    plan: {
      excludedTests: [{ id: 'excluded', reason: 'not applicable' }],
      planFingerprint: 'plan',
      tests: unit.testIds.map((id) => ({ id })),
    },
    project: 'chromium',
    proofFingerprint: 'proof',
    reusedUnitIds: [unit.id],
    scope: 'scope',
    selectedUnits: [unit],
    status: 'passed',
    unitTimeoutFloorMs: 1000,
    unitWorkers: 2,
  });

  assert.deepEqual(summary.coverage, {
    applicable: 2,
    duplicatePlanned: [],
    duplicates: [],
    excluded: 1,
    executed: 2,
    missing: [],
    ok: true,
    passed: 2,
    selected: 2,
    skipped: 0,
    unexpected: [],
  });
  assert.deepEqual(summary.profile, { heavy: 1 });
  assert.deepEqual(summary.timing, {
    batchMs: 250,
    executedBatchMs: 0,
    reusedBatchMs: 250,
    wallMs: 12,
  });
  assert.equal(summary.failurePhase, null);
  assert.equal(summary.reused, true);
  assert.equal(summary.units[0].reused, true);
  assert.equal(summary.units[0].testTimeoutMs, 45_000);
  assert.equal(summary.units[0].timeoutMs, unit.timeoutMs);
  assert.equal(summary.units[0].workerWaves, 2);
  assert.equal(summary.unitTimeoutFloorMs, 1000);

  const failed = createBrowserRunSummary({
    ...{
      completedUnits: [],
      durationMs: 5,
      failure: { phase: 'browser-launch' },
      job: { index: 1, total: 1 },
      maxTestsPerProcess: 8,
      plan: {
        excludedTests: [],
        planFingerprint: 'plan',
        tests: unit.testIds.map((id) => ({ id })),
      },
      project: 'chromium',
      proofFingerprint: 'proof',
      scope: 'scope',
      selectedUnits: [unit],
      status: 'failed',
      unitTimeoutFloorMs: 1000,
      unitWorkers: 2,
    },
  });

  assert.equal(failed.failurePhase, 'browser-launch');
  assert.equal(failed.coverage.ok, false);
  assert.equal(failed.units[0].status, 'not-run');
});

test('requires every requested browser project and job during merge', () => {
  const makeSummary = (project, index, total, ids) => ({
    coverage: { ok: true },
    executedTestIds: ids,
    failurePhase: null,
    job: { index, total },
    passedTestIds: ids,
    planFingerprint: `${project}-plan`,
    plannedTestIds: ['a', 'b'],
    project,
    proofFingerprint: `${project}-proof`,
    skippedTests: [],
    status: 'passed',
    version: 1,
  });
  const summaries = [
    makeSummary('chromium', 1, 2, ['a']),
    makeSummary('chromium', 2, 2, ['b']),
    makeSummary('firefox', 1, 1, ['a', 'b']),
  ];

  assert.deepEqual(verifyMergedSummaries(summaries, ['chromium', 'firefox']), [
    { jobs: 2, passed: 2, planned: 2, project: 'chromium', skipped: 0 },
    { jobs: 1, passed: 2, planned: 2, project: 'firefox', skipped: 0 },
  ]);
  assert.throws(() => verifyMergedSummaries(summaries, ['chromium']));
  assert.throws(() =>
    verifyMergedSummaries(summaries.slice(0, 2), ['chromium', 'firefox'])
  );
  assert.throws(() =>
    verifyMergedSummaries([summaries[0], summaries[0]], ['chromium'])
  );
});

test('reads statuses, annotations, and tags from nested Playwright reports', () => {
  const report = {
    suites: [
      {
        specs: [],
        suites: [
          {
            specs: [
              {
                file: 'a.test.ts',
                id: 'a',
                line: 12,
                tags: ['heavy'],
                tests: [
                  {
                    annotations: [],
                    expectedStatus: 'passed',
                    projectName: 'chromium',
                    results: [{ status: 'passed' }],
                    timeout: 60_000,
                  },
                  {
                    projectName: 'firefox',
                    results: [{ status: 'passed' }],
                  },
                ],
                title: 'works',
              },
            ],
            title: 'works suite',
          },
        ],
        title: 'a.test.ts',
      },
    ],
  };

  assert.deepEqual(collectReportTests(report, 'chromium'), [
    {
      annotations: [],
      expectedStatus: 'passed',
      file: 'a.test.ts',
      fullTitle: 'chromium a.test.ts works suite works',
      fullTitleExact: false,
      id: 'a',
      line: 12,
      status: 'passed',
      tags: ['heavy'],
      timeoutMs: 60_000,
      title: 'works',
    },
  ]);
});

test('classifies pre-navigation infrastructure separately from assertions', () => {
  assert.equal(
    classifyFailure('Error: browserContext.newPage: Test timeout exceeded'),
    'context-new-page'
  );
  assert.equal(
    classifyFailure('Error: browserType.launch failed'),
    'browser-launch'
  );
  assert.equal(classifyFailure('await page.goto failed'), 'navigation');
  assert.equal(classifyFailure('expect(locator).toHaveText'), 'assertion');
});
