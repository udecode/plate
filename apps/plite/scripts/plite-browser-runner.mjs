import { createHash } from 'node:crypto';

export const MAX_NORMAL_TESTS_PER_PROCESS = 32;
const TESTS_PER_WORKER = 4;
export const BROWSER_UNIT_TIMEOUT_OVERHEAD_MS = 30_000;
export const DEFAULT_HEAVY_TESTS_PER_PROCESS = 8;
export const DEFAULT_PROJECT_CONCURRENCY = 2;
export const DEFAULT_SERIAL_TESTS_PER_PROCESS = 3;
export const DEFAULT_UNIT_WORKERS = 8;
export const MAX_BROWSER_WORKERS = 8;
export const BROWSER_PROFILE_ANNOTATION = 'plite-browser-profile';
const jobPattern = /^(\d+)\/(\d+)$/;
const contextFailurePattern = /browserContext\.newPage/i;
const launchFailurePattern = /browserType\.(?:launch|connect)/i;
const navigationFailurePattern = /\bpage\.goto\b|ERR_(?:CONNECTION|NAME)_/i;
const assertionFailurePattern =
  /expect\(|AssertionError|toHave[A-Z]|toEqual|toBe\(/;
const fixtureFailurePattern = /beforeEach|afterEach|globalSetup|globalTeardown/;

export const assertRetryFreeBrowserArgs = (args) => {
  const retryOverride = args.find(
    (arg) => arg === '--retries' || arg.startsWith('--retries=')
  );

  if (retryOverride) {
    throw new Error(
      `Plite browser proof forbids retry overrides; received ${retryOverride}`
    );
  }

  return args;
};

export const resolveBrowserWorkerCount = (value, name = 'browser workers') => {
  const workers = Number(value);

  if (!Number.isInteger(workers) || workers < 1) {
    throw new Error(`${name} must be a positive integer`);
  }

  return Math.min(workers, MAX_BROWSER_WORKERS);
};

export const assertBrowserWorkerArgs = (args) => {
  for (const [index, argument] of args.entries()) {
    let value;

    if (argument === '--workers' || argument === '-j') {
      value = args[index + 1];
    } else if (argument.startsWith('--workers=')) {
      value = argument.slice('--workers='.length);
    } else if (argument.startsWith('-j') && argument.length > 2) {
      const shortValue = argument.slice(2);

      value = shortValue.startsWith('=') ? shortValue.slice(1) : shortValue;
    } else {
      continue;
    }

    const workers = Number(value);

    if (!Number.isInteger(workers) || workers < 1) {
      throw new Error(
        `Playwright workers must be an integer from 1 to ${MAX_BROWSER_WORKERS}`
      );
    }
    if (workers > MAX_BROWSER_WORKERS) {
      throw new Error(
        `Plite browser proof is capped at ${MAX_BROWSER_WORKERS} workers; received ${workers}`
      );
    }
  }

  return args;
};

export const WORKLOAD_POLICIES = Object.freeze({
  'context-heavy': Object.freeze({
    maxTestsPerProcess: DEFAULT_SERIAL_TESTS_PER_PROCESS,
    maxWorkers: Number.POSITIVE_INFINITY,
    name: 'context-heavy',
    runtimeMultiplier: 2,
  }),
  heavy: Object.freeze({
    maxTestsPerProcess: DEFAULT_HEAVY_TESTS_PER_PROCESS,
    maxWorkers: 1,
    name: 'heavy',
    runtimeMultiplier: 4,
  }),
  serial: Object.freeze({
    maxTestsPerProcess: DEFAULT_SERIAL_TESTS_PER_PROCESS,
    maxWorkers: 1,
    name: 'serial',
    runtimeMultiplier: 2,
  }),
});

export const getBrowserWorkloadProfile = (test, defaultProfile) => {
  const annotations = (test.annotations ?? []).filter(
    ({ type }) => type === BROWSER_PROFILE_ANNOTATION
  );

  if (annotations.length === 0) return defaultProfile;
  if (annotations.length > 1) {
    throw new Error(
      `${test.id} declares more than one ${BROWSER_PROFILE_ANNOTATION}`
    );
  }

  const name = annotations[0].description;
  const policy = WORKLOAD_POLICIES[name];

  if (!policy) {
    throw new Error(
      `${test.id} declares unknown ${BROWSER_PROFILE_ANNOTATION} "${name ?? ''}"`
    );
  }

  return policy;
};

export const getDefaultMaxTestsPerProcess = (unitWorkers) => {
  const boundedUnitWorkers = resolveBrowserWorkerCount(
    unitWorkers,
    'unitWorkers'
  );

  return Math.min(
    MAX_NORMAL_TESTS_PER_PROCESS,
    TESTS_PER_WORKER * boundedUnitWorkers
  );
};

export const resolveMaxTestsPerProcess = (value, unitWorkers) => {
  const workerScaledDefault = getDefaultMaxTestsPerProcess(unitWorkers);

  if (value === undefined) return workerScaledDefault;

  const requested = Number(value);

  if (!Number.isInteger(requested) || requested < 1) {
    throw new Error(
      'PLITE_BROWSER_MAX_TESTS_PER_PROCESS must be a positive integer'
    );
  }
  if (requested > MAX_NORMAL_TESTS_PER_PROCESS) {
    throw new Error(
      `PLITE_BROWSER_MAX_TESTS_PER_PROCESS cannot exceed ${MAX_NORMAL_TESTS_PER_PROCESS}`
    );
  }

  return Math.min(requested, workerScaledDefault);
};

export const getSelectionUniverseSelectors = (plan) => [
  ...new Set((plan.selectionUniverse ?? []).map(({ file }) => file)),
];

export const createProjectExecutionPlan = (
  projects,
  unitWorkers,
  requestedConcurrency = DEFAULT_PROJECT_CONCURRENCY
) => {
  if (projects.length === 0) {
    throw new Error('At least one browser project is required');
  }
  const boundedUnitWorkers = resolveBrowserWorkerCount(
    unitWorkers,
    'unitWorkers'
  );
  const boundedConcurrency = resolveBrowserWorkerCount(
    requestedConcurrency,
    'project concurrency'
  );

  const concurrency = Math.min(
    projects.length,
    boundedUnitWorkers,
    boundedConcurrency
  );

  return Object.freeze({
    concurrency,
    unitWorkers: Math.max(1, Math.floor(boundedUnitWorkers / concurrency)),
  });
};

export const runProjectPool = async ({
  concurrency,
  projects,
  runProject,
  stopSiblings,
}) => {
  const boundedConcurrency = resolveBrowserWorkerCount(
    concurrency,
    'project concurrency'
  );

  let cursor = 0;
  let failedStatus = 0;
  let firstError;
  let generation = 0;
  let stopPromise;
  const cancel = () => {
    generation++;
    stopPromise ??= Promise.resolve().then(stopSiblings);

    return stopPromise;
  };
  const runNext = async () => {
    while (generation === 0) {
      const project = projects[cursor++];

      if (!project) return;

      const projectGeneration = generation;
      const projectRun = Object.freeze({
        get cancelled() {
          return generation !== projectGeneration;
        },
        generation: projectGeneration,
        throwIfCancelled() {
          if (generation !== projectGeneration) {
            throw new Error(`Browser project ${project} was cancelled`);
          }
        },
      });
      let status;

      try {
        status = await runProject(project, projectRun);
      } catch (error) {
        if (!projectRun.cancelled) {
          firstError = error;
          await cancel();
        }

        return;
      }

      if (status !== 0 && !projectRun.cancelled) {
        failedStatus = status;
        await cancel();
      }
    }
  };

  await Promise.all(
    Array.from({ length: boundedConcurrency }, () => runNext())
  );

  if (firstError) throw firstError;

  return failedStatus;
};

export const resolveTimeoutMs = (value, fallback, name) => {
  const timeoutMs = value === undefined ? fallback : Number(value);

  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error(`${name} must be a positive number`);
  }

  return timeoutMs;
};

const visitSuites = (suites, visitSpec, titlePath = []) => {
  for (const suite of suites ?? []) {
    const suiteTitlePath = suite.title
      ? [...titlePath, suite.title]
      : titlePath;

    for (const spec of suite.specs ?? []) {
      visitSpec(spec, suiteTitlePath);
    }

    visitSuites(suite.suites, visitSpec, suiteTitlePath);
  }
};

export const collectReportTests = (report, project) => {
  const tests = [];

  visitSuites(report.suites, (spec, titlePath) => {
    for (const test of spec.tests ?? []) {
      if ((test.projectName ?? test.projectId) !== project) continue;
      const tags = spec.tags ?? [];

      tests.push({
        annotations: test.annotations ?? [],
        expectedStatus: test.expectedStatus,
        file: spec.file,
        fullTitle: [project, ...titlePath, spec.title]
          .filter(Boolean)
          .join(' '),
        fullTitleExact: tags.length === 0,
        id: spec.id,
        line: spec.line,
        status:
          test.results?.at(-1)?.status ?? test.status ?? test.expectedStatus,
        tags,
        timeoutMs: test.timeout,
        title: spec.title,
      });
    }
  });

  return tests;
};

const escapeRegex = (value) =>
  value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

const createUnit = (selectionGroups, profile) => {
  const selectionMode = selectionGroups[0].mode;
  const tests = selectionGroups.flatMap(({ tests }) => tests);
  const files = [...new Set(tests.map(({ file }) => file))];
  const testIds = tests.map(({ id }) => id);
  const testTimeouts = tests.map(({ id, timeoutMs }) => ({ id, timeoutMs }));
  const selections = selectionGroups.map(
    ({ file, fullTitle, line, mode, tests }) => ({
      file,
      fullTitle,
      line,
      mode,
      testIds: tests.map(({ id }) => id),
    })
  );
  const selectors =
    selectionMode === 'title'
      ? files
      : selections.map(({ file, line }) => `${file}:${line}`);

  return {
    ...(selectionMode === 'title'
      ? {
          grep: `^(?:${selections
            .map(({ fullTitle }) => escapeRegex(fullTitle))
            .join('|')})$`,
        }
      : {}),
    expectedTests: tests.length,
    files,
    id: `tests:${testIds.join(',')}`,
    maxWorkers: profile.maxWorkers,
    profile: profile.name,
    runtimeMultiplier: profile.runtimeMultiplier,
    runtimeWeight: tests.reduce(
      (weight, test) => weight + (test.runtimeWeight ?? 1),
      0
    ),
    selectionMode,
    selections,
    selectors,
    testIds,
    testTimeoutMs: Math.max(...tests.map(({ timeoutMs }) => timeoutMs)),
    testTimeouts,
  };
};

const validateTitleSelection = (file, fileTests) => {
  const testsByFullTitle = new Map();

  for (const test of fileTests) {
    if (!test.fullTitle) {
      throw new Error(
        `${file} requires fullTitle metadata for bounded title selection`
      );
    }
    if (test.fullTitleExact === false) {
      throw new Error(
        `${file} has tagged tests whose exact grep titles cannot be proven`
      );
    }

    const titleTests = testsByFullTitle.get(test.fullTitle) ?? [];

    titleTests.push(test);
    testsByFullTitle.set(test.fullTitle, titleTests);
  }

  const ambiguousTitles = [...testsByFullTitle]
    .filter(([, titleTests]) => titleTests.length > 1)
    .map(([fullTitle]) => fullTitle);

  if (ambiguousTitles.length > 0) {
    throw new Error(
      `${file} has ambiguous full test titles: ${ambiguousTitles.join(', ')}`
    );
  }
};

const haveSameIds = (left, right) => {
  if (left.length !== right.length) return false;

  const rightIds = new Set(right.map(({ id }) => id));

  return left.every(({ id }) => rightIds.has(id));
};

const createSelectionGroups = (tests, profile, selectionUniverse) => {
  const testsByFile = new Map();
  const universeByFile = new Map();

  for (const test of tests) {
    const fileTests = testsByFile.get(test.file) ?? [];

    fileTests.push(test);
    testsByFile.set(test.file, fileTests);
  }
  for (const test of selectionUniverse) {
    const fileTests = universeByFile.get(test.file) ?? [];

    fileTests.push(test);
    universeByFile.set(test.file, fileTests);
  }

  return [...testsByFile].flatMap(([file, fileTests]) => {
    const selectedTestsByLine = new Map();
    const universeFileTests = universeByFile.get(file) ?? [];
    const universeTestsByLine = new Map();

    for (const test of fileTests) {
      if (!Number.isInteger(test.line) || test.line < 1) continue;

      const lineTests = selectedTestsByLine.get(test.line) ?? [];

      lineTests.push(test);
      selectedTestsByLine.set(test.line, lineTests);
    }
    for (const test of universeFileTests) {
      if (!Number.isInteger(test.line) || test.line < 1) continue;

      const lineTests = universeTestsByLine.get(test.line) ?? [];

      lineTests.push(test);
      universeTestsByLine.set(test.line, lineTests);
    }

    const needsTitleSelection = fileTests.some((test) => {
      const selectedLineTests = selectedTestsByLine.get(test.line);
      const universeLineTests = universeTestsByLine.get(test.line);

      return (
        !selectedLineTests ||
        selectedLineTests.length > profile.maxTestsPerProcess ||
        !universeLineTests ||
        !haveSameIds(selectedLineTests, universeLineTests)
      );
    });

    if (needsTitleSelection) {
      validateTitleSelection(file, universeFileTests);
    }

    const emittedLines = new Set();

    return fileTests.flatMap((test) => {
      const selectedLineTests = selectedTestsByLine.get(test.line);
      const universeLineTests = universeTestsByLine.get(test.line);
      const exactLocation =
        selectedLineTests &&
        selectedLineTests.length <= profile.maxTestsPerProcess &&
        universeLineTests &&
        haveSameIds(selectedLineTests, universeLineTests);

      if (!exactLocation) {
        return [
          {
            file,
            fullTitle: test.fullTitle,
            line: test.line,
            mode: 'title',
            tests: [test],
          },
        ];
      }
      if (emittedLines.has(test.line)) return [];

      emittedLines.add(test.line);

      return [
        {
          file,
          line: test.line,
          mode: 'location',
          tests: selectedLineTests,
        },
      ];
    });
  });
};

const createUnitsForTests = (tests, profile, selectionUniverse) => {
  const units = [];
  let currentGroups = [];
  let currentTestCount = 0;

  for (const group of createSelectionGroups(
    tests,
    profile,
    selectionUniverse
  )) {
    if (
      currentGroups.length > 0 &&
      (currentGroups[0].mode !== group.mode ||
        currentTestCount + group.tests.length > profile.maxTestsPerProcess)
    ) {
      units.push(createUnit(currentGroups, profile));
      currentGroups = [];
      currentTestCount = 0;
    }

    currentGroups.push(group);
    currentTestCount += group.tests.length;
  }

  if (currentGroups.length > 0) {
    units.push(createUnit(currentGroups, profile));
  }

  return units;
};

export const createTestUnits = (
  tests,
  maxTestsPerProcess,
  { selectionUniverse = tests } = {}
) => {
  if (!Number.isInteger(maxTestsPerProcess) || maxTestsPerProcess < 1) {
    throw new Error('maxTestsPerProcess must be a positive integer');
  }
  const validateTests = (inputTests, label) => {
    const seenIds = new Set();
    const duplicateIds = new Set();

    for (const test of inputTests) {
      if (seenIds.has(test.id)) duplicateIds.add(test.id);
      seenIds.add(test.id);
      if (!test.file || !test.id) {
        throw new Error('Every browser test requires a file and ID');
      }
      if (
        test.runtimeWeight !== undefined &&
        (!Number.isFinite(test.runtimeWeight) || test.runtimeWeight <= 0)
      ) {
        throw new Error('Browser test runtimeWeight must be positive');
      }
      if (!Number.isFinite(test.timeoutMs) || test.timeoutMs <= 0) {
        throw new Error('Every browser test requires a positive timeoutMs');
      }
    }
    if (duplicateIds.size > 0) {
      throw new Error(
        `${label} contains duplicate test IDs: ${[...duplicateIds].join(', ')}`
      );
    }
  };

  validateTests(tests, 'Browser plan');
  validateTests(selectionUniverse, 'Browser selection universe');
  const universeById = new Map(
    selectionUniverse.map((test) => [test.id, test])
  );

  for (const test of tests) {
    const universeTest = universeById.get(test.id);

    if (!universeTest) {
      throw new Error(
        `Browser selection universe is missing selected test ${test.id}`
      );
    }
    if (
      universeTest.file !== test.file ||
      universeTest.line !== test.line ||
      universeTest.fullTitle !== test.fullTitle ||
      universeTest.timeoutMs !== test.timeoutMs
    ) {
      throw new Error(
        `Browser selection universe metadata differs for selected test ${test.id}`
      );
    }
  }

  const sortedTests = [...tests].sort(
    (a, b) =>
      a.file.localeCompare(b.file) ||
      (a.line ?? 0) - (b.line ?? 0) ||
      a.id.localeCompare(b.id)
  );
  const defaultProfile = {
    maxTestsPerProcess,
    maxWorkers: Number.POSITIVE_INFINITY,
    name: 'normal',
    runtimeMultiplier: 1,
  };
  const testsByProfile = new Map();

  for (const test of sortedTests) {
    const profile = getBrowserWorkloadProfile(test, defaultProfile);
    const profileTests = testsByProfile.get(profile.name) ?? [];

    profileTests.push(test);
    testsByProfile.set(profile.name, profileTests);
  }

  const units = [];

  for (const [profileName, profileTests] of [...testsByProfile].sort(
    ([left], [right]) => left.localeCompare(right)
  )) {
    const policy =
      profileName === defaultProfile.name
        ? defaultProfile
        : WORKLOAD_POLICIES[profileName];

    units.push(
      ...createUnitsForTests(
        profileTests,
        {
          ...policy,
          maxTestsPerProcess: Math.min(
            maxTestsPerProcess,
            policy.maxTestsPerProcess
          ),
          runtimeMultiplier: policy.runtimeMultiplier ?? 1,
        },
        selectionUniverse
      )
    );
  }

  return units;
};

export const applyWorkerCap = (units, workerCap, timeoutFloorMs = 120_000) => {
  const boundedWorkerCap = resolveBrowserWorkerCount(workerCap, 'workerCap');
  const boundedTimeoutFloorMs = resolveTimeoutMs(
    timeoutFloorMs,
    120_000,
    'unit timeout floor'
  );

  return units.map((unit) => {
    const runtimeMultiplier = unit.runtimeMultiplier ?? 1;

    if (!Number.isFinite(runtimeMultiplier) || runtimeMultiplier <= 0) {
      throw new Error('Browser unit runtimeMultiplier must be positive');
    }
    const workers = Math.max(
      1,
      Math.min(boundedWorkerCap, unit.maxWorkers, unit.expectedTests)
    );
    const workerWaves = Math.ceil(unit.expectedTests / workers);

    if (!Number.isFinite(unit.testTimeoutMs) || unit.testTimeoutMs <= 0) {
      throw new Error('Browser unit testTimeoutMs must be positive');
    }
    const timeoutMs = Math.max(
      boundedTimeoutFloorMs,
      workerWaves * unit.testTimeoutMs + BROWSER_UNIT_TIMEOUT_OVERHEAD_MS
    );

    return {
      ...unit,
      runtimeMultiplier,
      schedulingWeight: Math.max(
        1,
        Math.ceil(
          ((unit.runtimeWeight ?? unit.expectedTests) * runtimeMultiplier) /
            workers
        )
      ),
      timeoutMs,
      workers,
      workerWaves,
    };
  });
};

export const fingerprintBrowserUnit = (unit) =>
  createHash('sha256')
    .update(
      JSON.stringify({
        expectedTests: unit.expectedTests,
        files: unit.files,
        grep: unit.grep ?? null,
        id: unit.id,
        maxWorkers: Number.isFinite(unit.maxWorkers)
          ? unit.maxWorkers
          : 'unbounded',
        profile: unit.profile,
        runtimeMultiplier: unit.runtimeMultiplier,
        runtimeWeight: unit.runtimeWeight,
        selectionMode: unit.selectionMode,
        selectors: unit.selectors,
        testIds: unit.testIds,
        testTimeoutMs: unit.testTimeoutMs,
        testTimeouts: unit.testTimeouts,
        timeoutMs: unit.timeoutMs,
        workers: unit.workers,
        workerWaves: unit.workerWaves,
      })
    )
    .digest('hex');

export const parseJob = (value = '1/1') => {
  const match = jobPattern.exec(value);

  if (!match) {
    throw new Error(`Invalid browser job "${value}"; expected <index>/<total>`);
  }

  const index = Number(match[1]);
  const total = Number(match[2]);

  if (index < 1 || total < 1 || index > total) {
    throw new Error(`Invalid browser job "${value}"`);
  }

  return { index, total };
};

export const selectUnitsForJob = (units, job) => {
  const buckets = Array.from({ length: job.total }, () => ({
    load: 0,
    units: [],
  }));
  const byDescendingWeight = [...units].sort(
    (left, right) =>
      right.schedulingWeight - left.schedulingWeight ||
      left.id.localeCompare(right.id)
  );

  for (const unit of byDescendingWeight) {
    const bucket = buckets.reduce((lightest, candidate) =>
      candidate.load < lightest.load ? candidate : lightest
    );

    bucket.units.push(unit);
    bucket.load += unit.schedulingWeight;
  }

  return buckets[job.index - 1].units.sort(
    (left, right) =>
      right.schedulingWeight - left.schedulingWeight ||
      left.id.localeCompare(right.id)
  );
};

export const verifyExactCoverage = (plannedIds, executedIds) => {
  const planned = new Set(plannedIds);
  const executed = new Set(executedIds);
  const duplicatePlanned = plannedIds.filter(
    (id, index) => plannedIds.indexOf(id) !== index
  );
  const duplicates = executedIds.filter(
    (id, index) => executedIds.indexOf(id) !== index
  );
  const missing = [...planned].filter((id) => !executed.has(id));
  const unexpected = [...executed].filter((id) => !planned.has(id));

  return {
    duplicatePlanned: [...new Set(duplicatePlanned)],
    duplicates: [...new Set(duplicates)],
    missing,
    ok:
      duplicatePlanned.length === 0 &&
      duplicates.length === 0 &&
      missing.length === 0 &&
      unexpected.length === 0,
    unexpected,
  };
};

const skipReason = (test) =>
  test.skipReason ??
  test.annotations?.find(
    ({ description, type }) => type === 'skip' && description?.trim()
  )?.description;

export const validateUnitResult = (unit, tests) => {
  const coverage = verifyExactCoverage(
    unit.testIds,
    tests.map(({ id }) => id)
  );
  const invalidOutcomes = tests
    .filter(({ status }) => status !== 'passed' && status !== 'skipped')
    .map(({ id, status }) => ({ id, status }));
  const unreasonedSkips = tests
    .filter((test) => test.status === 'skipped' && !skipReason(test))
    .map(({ id }) => id);
  const results = tests.map((test) => ({
    id: test.id,
    skipReason: test.status === 'skipped' ? skipReason(test) : undefined,
    status: test.status,
  }));

  return {
    ...coverage,
    invalidOutcomes,
    ok:
      coverage.ok &&
      invalidOutcomes.length === 0 &&
      unreasonedSkips.length === 0,
    results,
    unreasonedSkips,
  };
};

export const validateCompletedUnit = (unit, completed) =>
  !!completed &&
  completed.id === unit.id &&
  completed.unitFingerprint === fingerprintBrowserUnit(unit) &&
  Number.isFinite(completed.durationMs) &&
  completed.durationMs >= 0 &&
  validateUnitResult(
    unit,
    Array.isArray(completed.results) ? completed.results : []
  ).ok;

export const resolveReusableProofState = ({
  force,
  previousState,
  proofFingerprint,
  selectedUnits,
  targetResumable,
}) => {
  const canResume =
    !force &&
    targetResumable &&
    previousState?.version === 1 &&
    previousState?.proofFingerprint === proofFingerprint &&
    ['complete', 'in_progress'].includes(previousState?.status);
  const completed = {};

  if (canResume) {
    for (const unit of selectedUnits) {
      const candidate = previousState.completed?.[unit.id];

      if (validateCompletedUnit(unit, candidate)) {
        completed[unit.id] = candidate;
      }
    }
  }

  const selectedPlannedIds = selectedUnits.flatMap(({ testIds }) => testIds);
  const completedUnits = selectedUnits
    .map((unit) => completed[unit.id])
    .filter(Boolean);
  const coverage = verifyExactCoverage(
    selectedPlannedIds,
    completedUnits.flatMap(({ results }) => results.map(({ id }) => id))
  );

  return {
    canResume,
    complete:
      canResume &&
      previousState.status === 'complete' &&
      completedUnits.length === selectedUnits.length &&
      coverage.ok,
    completed,
  };
};

export const createBrowserRunSummary = ({
  completedUnits,
  durationMs,
  failure,
  job,
  maxTestsPerProcess,
  plan,
  project,
  proofFingerprint,
  reusedUnitIds = [],
  scope,
  selectedUnits,
  status,
  unitTimeoutFloorMs,
  unitWorkers,
}) => {
  const results = completedUnits.flatMap(({ results }) => results);
  const executedTestIds = results.map(({ id }) => id);
  const passedTestIds = results
    .filter(({ status: resultStatus }) => resultStatus === 'passed')
    .map(({ id }) => id);
  const skippedTests = results
    .filter(({ status: resultStatus }) => resultStatus === 'skipped')
    .map(({ id, skipReason }) => ({ id, reason: skipReason }));
  const selectedPlannedTestIds = selectedUnits.flatMap(
    ({ testIds }) => testIds
  );
  const exactCoverage = verifyExactCoverage(
    selectedPlannedTestIds,
    executedTestIds
  );
  const reused = new Set(reusedUnitIds);
  const batchDurationMs = completedUnits.reduce(
    (sum, unit) => sum + unit.durationMs,
    0
  );
  const reusedBatchMs = completedUnits.reduce(
    (sum, unit) => sum + (reused.has(unit.id) ? unit.durationMs : 0),
    0
  );

  return {
    completedUnits: completedUnits.length,
    coverage: {
      ...exactCoverage,
      applicable: plan.tests.length,
      excluded: plan.excludedTests.length,
      executed: executedTestIds.length,
      passed: passedTestIds.length,
      selected: selectedPlannedTestIds.length,
      skipped: skippedTests.length,
    },
    durationMs,
    excludedTests: plan.excludedTests,
    executedTestIds,
    failure,
    failurePhase: failure?.phase ?? null,
    job,
    maxTestsPerProcess,
    passedTestIds,
    plannedTestIds: plan.tests.map(({ id }) => id),
    planFingerprint: plan.planFingerprint,
    profile: selectedUnits.reduce((counts, unit) => {
      counts[unit.profile] = (counts[unit.profile] ?? 0) + 1;

      return counts;
    }, {}),
    project,
    proofFingerprint,
    reused: reused.size === selectedUnits.length && selectedUnits.length > 0,
    scope,
    selectedUnits: selectedUnits.length,
    skippedTests,
    sourceFingerprint: proofFingerprint,
    status,
    timing: {
      batchMs: batchDurationMs,
      executedBatchMs: batchDurationMs - reusedBatchMs,
      reusedBatchMs,
      wallMs: durationMs,
    },
    unitTimeoutFloorMs,
    unitWorkers,
    units: selectedUnits.map((unit) => {
      const completed = completedUnits.find(
        (candidate) => candidate.id === unit.id
      );

      return {
        durationMs: completed?.durationMs ?? null,
        expectedTests: unit.expectedTests,
        id: unit.id,
        profile: unit.profile,
        reused: reused.has(unit.id),
        status: completed ? 'passed' : 'not-run',
        testTimeoutMs: unit.testTimeoutMs,
        timeoutMs: unit.timeoutMs,
        workers: unit.workers,
        workerWaves: unit.workerWaves,
      };
    }),
    version: 1,
  };
};

export const verifyMergedSummaries = (summaries, requiredProjects) => {
  if (requiredProjects.length === 0) {
    throw new Error('At least one required browser project is required');
  }

  const expectedProjects = new Set(requiredProjects);
  const actualProjects = new Set(summaries.map(({ project }) => project));
  const missingProjects = [...expectedProjects].filter(
    (project) => !actualProjects.has(project)
  );
  const unexpectedProjects = [...actualProjects].filter(
    (project) => !expectedProjects.has(project)
  );

  if (missingProjects.length > 0 || unexpectedProjects.length > 0) {
    throw new Error(
      `Browser project mismatch: ${JSON.stringify({
        missingProjects,
        unexpectedProjects,
      })}`
    );
  }

  const reports = [];

  for (const project of requiredProjects) {
    const projectSummaries = summaries.filter(
      (summary) => summary.project === project
    );
    const first = projectSummaries[0];
    const totalJobs = first.job.total;
    const jobIndexes = new Set(projectSummaries.map(({ job }) => job.index));

    if (
      projectSummaries.length !== totalJobs ||
      projectSummaries.some(
        (summary) =>
          summary.version !== 1 ||
          summary.status !== 'passed' ||
          summary.failurePhase !== null ||
          summary.coverage?.ok !== true ||
          summary.job.total !== totalJobs ||
          summary.planFingerprint !== first.planFingerprint ||
          summary.proofFingerprint !== first.proofFingerprint
      )
    ) {
      throw new Error(`${project} summaries do not describe one passing proof`);
    }

    if (
      jobIndexes.size !== totalJobs ||
      Array.from({ length: totalJobs }, (_, index) => index + 1).some(
        (index) => !jobIndexes.has(index)
      )
    ) {
      throw new Error(`${project} is missing one or more browser jobs`);
    }

    const executedTestIds = projectSummaries.flatMap(
      ({ executedTestIds }) => executedTestIds
    );
    const outcomeIds = projectSummaries.flatMap((summary) => [
      ...(summary.passedTestIds ?? []),
      ...(summary.skippedTests ?? []).map(({ id }) => id),
    ]);
    const coverage = verifyExactCoverage(first.plannedTestIds, executedTestIds);
    const outcomeCoverage = verifyExactCoverage(executedTestIds, outcomeIds);

    if (!coverage.ok || !outcomeCoverage.ok) {
      throw new Error(
        `${project} coverage mismatch: ${JSON.stringify({
          coverage,
          outcomeCoverage,
        })}`
      );
    }

    reports.push({
      jobs: totalJobs,
      passed: projectSummaries.reduce(
        (count, summary) => count + (summary.passedTestIds?.length ?? 0),
        0
      ),
      planned: first.plannedTestIds.length,
      project,
      skipped: projectSummaries.reduce(
        (count, summary) => count + (summary.skippedTests?.length ?? 0),
        0
      ),
    });
  }

  return reports;
};

export const classifyFailure = (output) => {
  if (contextFailurePattern.test(output)) return 'context-new-page';
  if (launchFailurePattern.test(output)) return 'browser-launch';
  if (navigationFailurePattern.test(output)) {
    return 'navigation';
  }
  if (assertionFailurePattern.test(output)) {
    return 'assertion';
  }
  if (fixtureFailurePattern.test(output)) {
    return 'fixture';
  }

  return 'test-runtime';
};
