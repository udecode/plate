#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { buildAppIfStale } from './build-app-if-stale.mjs';
import {
  applyWorkerCap,
  assertBrowserNodeVersion,
  assertBrowserWorkerArgs,
  assertRetryFreeBrowserArgs,
  classifyFailure,
  collectReportTests,
  createBrowserRunSummary,
  createProjectExecutionPlan,
  createTestUnits,
  DEFAULT_PROJECT_CONCURRENCY,
  DEFAULT_UNIT_WORKERS,
  fingerprintBrowserUnit,
  formatIntegrityFailureDetails,
  getSelectionUniverseSelectors,
  MAX_BROWSER_WORKERS,
  parseJob,
  resolvePliteBrowserBaseURL,
  resolveBrowserWorkerCount,
  resolveMaxTestsPerProcess,
  resolveTimeoutMs,
  resolveReusableProofState,
  runProjectWaves,
  selectUnitsForJob,
  validateUnitResult,
  verifyExactCoverage,
} from './plite-browser-runner.mjs';
import {
  appRoot,
  browserPlanEntries,
  browserRunEntries,
  createProofIntegrityMonitor,
  fingerprintDigest,
  hashEntries,
  isBuildManifestFresh,
  repoRoot,
  snapshotEnvironment,
  snapshotFileIdentity,
} from './plite-proof-inputs.mjs';
import {
  runBoundedProcess,
  stopProcessTree,
} from '../../../tooling/scripts/run-bounded-process.mjs';

const mode = process.argv[2] ?? 'matrix';
const passthroughArgs = process.argv.slice(3);
const require = createRequire(import.meta.url);
const playwrightPackagePath = require.resolve('@playwright/test/package.json');
const playwrightPackage = require(playwrightPackagePath);
const playwrightRuntime = require('@playwright/test');
const playwrightCli = path.join(path.dirname(playwrightPackagePath), 'cli.js');
const requiredNodeVersion = fs
  .readFileSync(path.join(repoRoot, '.nvmrc'), 'utf8')
  .trim();

assertBrowserNodeVersion(process.version, requiredNodeVersion);

const baseArgs = ['test', '--config', 'playwright.config.ts'];
const baseURL = resolvePliteBrowserBaseURL(process.env.PLAYWRIGHT_BASE_URL);
const stateDirectory = path.join(appRoot, '.tmp/plite-browser-runner');
const summaryDirectory = path.join(
  appRoot,
  'test-results/plite-browser-runner'
);
const appBuildManifest = path.join(appRoot, 'out/.plite-proof-build.json');
const browserOutputRoot = path.join(repoRoot, 'packages/browser/dist');
const appOutputRoot = path.join(appRoot, 'out');
const projectOutputDirectory = (project) =>
  path.join(appRoot, 'test-results/plite-browser', project);
const unitWorkers = resolveBrowserWorkerCount(
  process.env.PLITE_BROWSER_UNIT_WORKERS ?? DEFAULT_UNIT_WORKERS,
  'PLITE_BROWSER_UNIT_WORKERS'
);
const configuredMaxTestsPerProcess =
  process.env.PLITE_BROWSER_MAX_TESTS_PER_PROCESS;
const requestedProjectConcurrency = Number(
  process.env.PLITE_BROWSER_PROJECT_CONCURRENCY ?? DEFAULT_PROJECT_CONCURRENCY
);
const unitTimeoutFloorMs = resolveTimeoutMs(
  process.env.PLITE_BROWSER_UNIT_TIMEOUT_MS,
  120_000,
  'PLITE_BROWSER_UNIT_TIMEOUT_MS'
);
const discoveryTimeoutMs = resolveTimeoutMs(
  process.env.PLITE_BROWSER_DISCOVERY_TIMEOUT_MS,
  60_000,
  'PLITE_BROWSER_DISCOVERY_TIMEOUT_MS'
);
const buildSetupTimeoutMs = resolveTimeoutMs(
  process.env.PLITE_BROWSER_BUILD_SETUP_TIMEOUT_MS,
  600_000,
  'PLITE_BROWSER_BUILD_SETUP_TIMEOUT_MS'
);
const directTimeoutMs = resolveTimeoutMs(
  process.env.PLITE_BROWSER_DIRECT_TIMEOUT_MS,
  600_000,
  'PLITE_BROWSER_DIRECT_TIMEOUT_MS'
);
const job = parseJob(process.env.PLITE_BROWSER_JOB);
const forceProof = process.env.PLITE_BROWSER_FORCE_PROOF === '1';
const smokeSelectors = [
  'tests/plite-browser/plite-examples.spec.ts',
  'tests/plite-browser/donor/examples/dom-integrity.test.ts',
  'tests/plite-browser/donor/examples/richtext.test.ts',
  'tests/plite-browser/donor/examples/yjs-collaboration.test.ts',
  '--grep=(plaintext typing keeps DOM and model text in sync|external DOM corruption is repaired from the model without moving selection|renders rich text|mounts peer editors and local collaboration controls)',
];
const planEnvironmentNames = ['CI', 'STRESS_FAMILIES', 'STRESS_ROUTES'];
const runEnvironmentNames = [
  ...planEnvironmentNames,
  'PLITE_BROWSER_CLIPBOARD_LOCK_TIMEOUT_MS',
  'PLITE_MENTIONS_FIREFOX_SELECT_ALL_DIAGNOSTIC',
  'PLITE_PAGINATION_AUTOSCROLL_PROOF',
  'PLITE_BROWSER_TRACE',
  'STRESS_ARTIFACT_DIR',
  'STRESS_REDUCTION',
  'STRESS_SEED',
];
const captureLimit = 2 * 1024 * 1024;
const activeProcesses = new Set();
let serverProcess;
let serverStartPromise;
let proofSessionPromise;
let stopping = false;

fs.mkdirSync(stateDirectory, { recursive: true });
fs.mkdirSync(summaryDirectory, { recursive: true });

const hasArg = (args, name) =>
  args.some((arg) => arg === name || arg.startsWith(`${name}=`));

const childEnv = (extra = {}) => {
  const env = {
    ...process.env,
    ...extra,
  };

  if ('NO_COLOR' in env) {
    env.NO_COLOR = undefined;
  }

  return env;
};

const runDirect = async (args, extraEnv = {}) => {
  assertBrowserWorkerArgs(args);
  assertRetryFreeBrowserArgs(args);
  const reporterArgs = hasArg(args, '--reporter') ? [] : ['--reporter=dot'];
  const result = await runBoundedProcess({
    args: [
      playwrightCli,
      ...baseArgs,
      ...reporterArgs,
      '--retries=0',
      `--workers=${MAX_BROWSER_WORKERS}`,
      ...args,
    ],
    command: process.execPath,
    cwd: appRoot,
    env: childEnv({
      PLAYWRIGHT_BASE_URL: baseURL,
      ...extraEnv,
    }),
    onProcessEnd: (child) => {
      activeProcesses.delete(child);
    },
    onProcessStart: (child) => {
      activeProcesses.add(child);
    },
    stdio: 'inherit',
    timeoutMs: directTimeoutMs,
  });

  return result.status;
};

const runCaptured = async (
  args,
  extraEnv = {},
  { echo = true, outputFile, projectRun, timeoutMs } = {}
) => {
  projectRun?.throwIfCancelled();
  const startedAt = performance.now();
  const result = await runBoundedProcess({
    args: [playwrightCli, ...baseArgs, ...args],
    captureLimitBytes: captureLimit,
    command: process.execPath,
    cwd: appRoot,
    echoOutput: echo,
    env: childEnv({
      PLAYWRIGHT_BASE_URL: baseURL,
      ...extraEnv,
    }),
    onProcessEnd: (child) => {
      activeProcesses.delete(child);
    },
    onProcessStart: (child) => {
      activeProcesses.add(child);
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    timeoutMs,
  });
  const output = `${result.stdout}\n${result.stderr}`;

  if (outputFile) fs.writeFileSync(outputFile, output);

  return {
    ...result,
    durationMs: Math.round(performance.now() - startedAt),
    output,
  };
};

const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return;
  }
};

const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporaryFile = `${file}.${process.pid}.tmp`;

  fs.writeFileSync(temporaryFile, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(temporaryFile, file);
};

const canReachServer = async () => {
  try {
    const response = await fetch(baseURL, {
      signal: AbortSignal.timeout(1000),
    });

    return response.ok || response.status < 500;
  } catch {
    return false;
  }
};

const waitForServer = async (projectRun) => {
  const deadline = Date.now() + 300_000;
  let lastError;

  while (Date.now() < deadline) {
    projectRun?.throwIfCancelled();
    if (
      serverProcess &&
      (serverProcess.exitCode !== null || serverProcess.signalCode !== null)
    ) {
      console.error(
        `Plite proof server exited ${
          serverProcess.signalCode
            ? `from signal ${serverProcess.signalCode}`
            : `with code ${serverProcess.exitCode ?? 'unknown'}`
        }`
      );

      return 1;
    }

    try {
      const response = await fetch(baseURL, {
        signal: AbortSignal.timeout(1000),
      });

      if (response.ok || response.status < 500) return 0;
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  console.error(
    `Timed out waiting for Plite proof server at ${baseURL}${
      lastError instanceof Error ? `: ${lastError.message}` : ''
    }`
  );

  return 1;
};

const startServer = async (projectRun) => {
  projectRun?.throwIfCancelled();
  if (await canReachServer()) {
    console.error(
      `Refusing to reuse the unowned Plite proof server at ${baseURL}. ` +
        'Stop it or pass PLAYWRIGHT_BASE_URL explicitly.'
    );

    return 1;
  }
  projectRun?.throwIfCancelled();

  serverProcess = spawn(process.execPath, ['scripts/serve.mjs'], {
    cwd: appRoot,
    detached: process.platform !== 'win32',
    env: childEnv({
      PORT: new URL(baseURL).port || '3102',
    }),
    stdio: 'inherit',
  });

  return waitForServer(projectRun);
};

const runSetup = async () => {
  if (process.env.PLAYWRIGHT_BASE_URL) return 0;

  return buildAppIfStale({
    environment: childEnv(),
    onProcessEnd: (child) => {
      activeProcesses.delete(child);
    },
    onProcessStart: (child) => {
      activeProcesses.add(child);
    },
    timeoutMs: buildSetupTimeoutMs,
  });
};

const ensureServer = async (projectRun) => {
  projectRun?.throwIfCancelled();
  if (process.env.PLAYWRIGHT_BASE_URL) return 0;
  if (
    serverProcess &&
    serverProcess.exitCode === null &&
    serverProcess.signalCode === null
  ) {
    return 0;
  }

  if (!serverStartPromise) {
    serverStartPromise = startServer(projectRun).finally(() => {
      serverStartPromise = undefined;
    });
  }

  const status = await serverStartPromise;

  projectRun?.throwIfCancelled();

  return status;
};

const stopServer = async () => {
  if (
    !serverProcess ||
    serverProcess.exitCode !== null ||
    serverProcess.signalCode !== null
  ) {
    return;
  }

  await stopProcessTree(serverProcess);
};

const stopActiveProcesses = (signal = 'SIGTERM') =>
  Promise.all(
    [...activeProcesses].map((child) => stopProcessTree(child, signal))
  );

for (const [signal, exitCode] of [
  ['SIGINT', 130],
  ['SIGTERM', 143],
]) {
  process.once(signal, async () => {
    if (stopping) return;

    stopping = true;
    await stopActiveProcesses(signal);
    await stopServer();
    process.exit(exitCode);
  });
}

const normalizeTestFile = (file) =>
  file.startsWith('tests/plite-browser/')
    ? file
    : `tests/plite-browser/${file}`;

const stripSeparators = (args) => args.filter((arg) => arg !== '--');

const normalizeSelectors = (args) => {
  const normalized = [];
  const values = stripSeparators(args);

  for (let index = 0; index < values.length; index++) {
    const value = values[index];

    if (['-g', '--grep', '--grep-invert'].includes(value)) {
      const expression = values[index + 1];

      if (!expression) {
        throw new Error(`${value} requires a regular expression`);
      }

      normalized.push(`${value === '-g' ? '--grep' : value}=${expression}`);
      index++;
      continue;
    }

    if (
      value.startsWith('--grep=') ||
      value.startsWith('--grep-invert=') ||
      !value.startsWith('-')
    ) {
      normalized.push(value);
      continue;
    }

    throw new Error(
      `Managed browser proof does not accept "${value}". ` +
        'Use the explicit direct mode for diagnostic Playwright options.'
    );
  }

  return normalized;
};

const selectorFingerprint = (selectors) =>
  createHash('sha256').update(selectors.join('\0')).digest('hex').slice(0, 12);

const artifactFingerprint = (file) => {
  if (!file) return null;

  const resolved = path.resolve(file);

  if (!fs.existsSync(resolved)) return `missing:${resolved}`;

  return hashEntries([resolved], ['plite-browser-artifact']);
};

const planEnvironment = () => ({
  ...snapshotEnvironment(planEnvironmentNames),
  arch: process.arch,
  platform: process.platform,
  stressReplay: artifactFingerprint(process.env.STRESS_REPLAY),
});

const runEnvironment = () => ({
  ...snapshotEnvironment(runEnvironmentNames),
  stressReplay: artifactFingerprint(process.env.STRESS_REPLAY),
});

const discoverTests = async (project, selectors, projectRun) => {
  projectRun?.throwIfCancelled();
  const proofSession = await getProofSession();
  projectRun?.throwIfCancelled();
  const scope = selectorFingerprint(selectors);
  const environment = planEnvironment();
  const planFingerprint = fingerprintDigest(proofSession.planInputDigest, [
    'plite-browser-plan-v6',
    project,
    JSON.stringify(environment),
    ...selectors,
  ]);
  const planFile = path.join(stateDirectory, `plan-${project}-${scope}.json`);
  const cached = readJson(planFile);

  if (cached?.planFingerprint === planFingerprint && cached?.version === 6) {
    return cached;
  }

  const reportFile = path.join(
    stateDirectory,
    `discovery-${project}-${scope}.json`
  );

  fs.rmSync(reportFile, { force: true });
  const result = await runCaptured(
    [`--project=${project}`, '--list', ...selectors],
    {
      PLITE_BROWSER_JSON_OUTPUT: reportFile,
      PLITE_BROWSER_OUTPUT_DIR: projectOutputDirectory(project),
    },
    { echo: false, projectRun, timeoutMs: discoveryTimeoutMs }
  );
  projectRun?.throwIfCancelled();
  const report = readJson(reportFile);

  if (result.status !== 0 || !report) {
    if (result.output) process.stderr.write(result.output);
    throw new Error(`Unable to enumerate ${project} browser tests`);
  }

  const discovered = collectReportTests(report, project).map((test) => ({
    ...test,
    file: normalizeTestFile(test.file),
  }));
  const excludedTests = discovered
    .filter(({ expectedStatus }) => expectedStatus === 'skipped')
    .map(({ annotations, id, title }) => ({
      id,
      reason:
        annotations.find(({ type }) => type === 'skip')?.description ??
        'statically skipped',
      title,
    }));
  const tests = discovered.filter(
    ({ expectedStatus }) => expectedStatus !== 'skipped'
  );
  const planIds = tests.map(({ id }) => id);

  if (tests.length === 0) {
    throw new Error(`Playwright enumerated no applicable ${project} tests`);
  }
  if (new Set(planIds).size !== planIds.length) {
    throw new Error(`${project} browser plan contains duplicate test IDs`);
  }

  const plan = {
    environment,
    excludedTests,
    planFingerprint,
    selectionUniverse: discovered,
    tests,
    version: 6,
  };

  writeJson(planFile, plan);

  return plan;
};

const customExecutableIdentity = () => {
  const executable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

  if (!executable) return null;

  const resolved = path.resolve(executable);
  const version = spawnSync(resolved, ['--version'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024,
    timeout: 5000,
  });

  return {
    ...snapshotFileIdentity(resolved),
    version: `${version.stdout ?? ''}${version.stderr ?? ''}`.trim(),
  };
};

const executableIdentity = (project) => {
  if (
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH &&
    ['chromium', 'mobile'].includes(project)
  ) {
    return customExecutableIdentity();
  }

  const browserType =
    project === 'firefox'
      ? playwrightRuntime.firefox
      : project === 'webkit'
        ? playwrightRuntime.webkit
        : playwrightRuntime.chromium;

  return snapshotFileIdentity(browserType.executablePath());
};

const runtimeIdentity = (project) => ({
  arch: process.arch,
  executable: executableIdentity(project),
  node: process.version,
  platform: process.platform,
  playwright: playwrightPackage.version,
  project,
});

const readLocalTargetFingerprint = () => {
  const manifest = readJson(appBuildManifest);

  if (
    !manifest ||
    !isBuildManifestFresh({
      inputDigest: manifest.inputDigest,
      manifestPath: appBuildManifest,
      outputRoot: appOutputRoot,
      version: manifest.version,
    })
  ) {
    return null;
  }

  return typeof manifest.fingerprint === 'string' ? manifest.fingerprint : null;
};

const targetIdentity = (proofSession) => {
  if (process.env.PLAYWRIGHT_BASE_URL) {
    const fingerprint = process.env.PLITE_BROWSER_TARGET_FINGERPRINT;

    if (!fingerprint) {
      return {
        fingerprint: `unresumable:${process.pid}:${Date.now()}`,
        resumable: false,
        url: baseURL,
      };
    }

    return {
      fingerprint,
      resumable: true,
      url: baseURL,
    };
  }

  const fingerprint = proofSession.localTargetFingerprint;

  if (!fingerprint) {
    throw new Error('Plite proof app output does not match its build manifest');
  }

  return {
    fingerprint,
    resumable: true,
    url: baseURL,
  };
};

const getProofSession = () => {
  proofSessionPromise ??= (async () => {
    const monitor = createProofIntegrityMonitor({
      sourceEntries: browserRunEntries,
      // Generated browser output is content-checked by runInputDigest after
      // every unit. Ignore its metadata so an identical rebuild cannot
      // invalidate an otherwise coherent proof.
      sourceIgnoredPaths: [browserOutputRoot],
      targetIgnoredPaths: [appBuildManifest],
      targetRoot: process.env.PLAYWRIGHT_BASE_URL ? undefined : appOutputRoot,
    });

    try {
      await monitor.ready();
      const planInputDigest = hashEntries(browserPlanEntries);
      const runInputDigest = hashEntries(browserRunEntries);
      const localTargetFingerprint = process.env.PLAYWRIGHT_BASE_URL
        ? null
        : readLocalTargetFingerprint();
      const change = await monitor.checkpoint();

      if (change) {
        if (change.kind === 'monitor') {
          throw new Error(
            `Plite proof monitor failed while its identity was captured: ${change.path}`
          );
        }

        const changedPath = path.relative(repoRoot, change.path);

        throw new Error(
          `Plite proof ${change.kind} changed while its identity was captured: ` +
            `${changedPath || '.'} (${change.eventType})`
        );
      }
      if (!process.env.PLAYWRIGHT_BASE_URL && !localTargetFingerprint) {
        throw new Error(
          'Plite proof app output does not match its build manifest'
        );
      }

      return {
        localTargetFingerprint,
        monitor,
        planInputDigest,
        runInputDigest,
      };
    } catch (error) {
      await monitor.close();
      throw error;
    }
  })();

  return proofSessionPromise;
};

const closeProofSession = async () => {
  if (!proofSessionPromise) return;

  try {
    const proofSession = await proofSessionPromise;

    await proofSession.monitor.close();
  } catch {
    // Session setup closes its own monitor before rejecting.
  }
};

const integrityFailure = async (proofSession, target) => {
  const changed = await proofSession.monitor.checkpoint();

  if (changed) {
    return {
      eventType: changed.eventType,
      path: changed.path,
      phase: changed.kind === 'target' ? 'target-changed' : 'source-changed',
    };
  }

  if (hashEntries(browserRunEntries) !== proofSession.runInputDigest) {
    return { phase: 'source-changed' };
  }

  if (
    !process.env.PLAYWRIGHT_BASE_URL &&
    readLocalTargetFingerprint() !== target.fingerprint
  ) {
    return { phase: 'target-changed' };
  }

  const lateChange = await proofSession.monitor.checkpoint();

  if (lateChange) {
    return {
      eventType: lateChange.eventType,
      path: lateChange.path,
      phase: lateChange.kind === 'target' ? 'target-changed' : 'source-changed',
    };
  }
};

const observedIntegrityFailure = async (proofSession) => {
  const changed = await proofSession.monitor.checkpoint();

  if (!changed) return;

  return {
    eventType: changed.eventType,
    path: changed.path,
    phase: changed.kind === 'target' ? 'target-changed' : 'source-changed',
  };
};

const unitReportFile = (project, scope, unit) => {
  const id = createHash('sha256').update(unit.id).digest('hex').slice(0, 12);

  return path.join(summaryDirectory, `report-${project}-${scope}-${id}.json`);
};

const unitOutputFile = (project, scope, unit) => {
  const id = createHash('sha256').update(unit.id).digest('hex').slice(0, 12);

  return path.join(summaryDirectory, `failure-${project}-${scope}-${id}.log`);
};

const summaryFile = (project, scope) =>
  path.join(
    summaryDirectory,
    `summary-${project}-${scope}-${job.index}-of-${job.total}.json`
  );

const stateFile = (project, scope) =>
  path.join(
    stateDirectory,
    `state-${project}-${scope}-${job.index}-of-${job.total}.json`
  );

const writeSummary = ({
  completedUnits,
  durationMs,
  failure,
  maxTestsPerProcess,
  plan,
  project,
  proofFingerprint,
  reusedUnitIds,
  scope,
  selectedUnits,
  status,
  unitWorkers,
}) => {
  const summary = createBrowserRunSummary({
    completedUnits,
    durationMs,
    failure,
    job,
    maxTestsPerProcess,
    plan,
    project,
    proofFingerprint,
    reusedUnitIds,
    scope,
    selectedUnits,
    status,
    unitTimeoutFloorMs,
    unitWorkers,
  });

  writeJson(summaryFile(project, scope), summary);

  return summary;
};

const runManagedProject = async (
  project,
  selectors = [],
  { echoOutput = true, projectRun, workerCap = unitWorkers } = {}
) => {
  projectRun?.throwIfCancelled();
  if (!Number.isInteger(unitTimeoutFloorMs) || unitTimeoutFloorMs < 1000) {
    throw new Error('PLITE_BROWSER_UNIT_TIMEOUT_MS must be at least 1000');
  }
  const projectMaxTestsPerProcess = resolveMaxTestsPerProcess(
    configuredMaxTestsPerProcess,
    workerCap
  );

  const startedAt = performance.now();
  const proofSession = await getProofSession();
  const scope = selectorFingerprint(selectors);
  const plan = await discoverTests(project, selectors, projectRun);
  projectRun?.throwIfCancelled();
  const selectionUniverse =
    selectors.length === 0
      ? plan.selectionUniverse
      : (
          await discoverTests(
            project,
            getSelectionUniverseSelectors(plan),
            projectRun
          )
        ).selectionUniverse;
  projectRun?.throwIfCancelled();
  const units = applyWorkerCap(
    createTestUnits(plan.tests, projectMaxTestsPerProcess, {
      selectionUniverse,
    }),
    workerCap,
    unitTimeoutFloorMs
  );
  const selectedUnits = selectUnitsForJob(units, job);
  projectRun?.throwIfCancelled();
  const target = targetIdentity(proofSession);
  const runtime = runtimeIdentity(project);
  const environment = runEnvironment();
  const fingerprintSalts = [
    'plite-browser-run-v6',
    project,
    plan.planFingerprint,
    String(projectMaxTestsPerProcess),
    String(workerCap),
    String(unitTimeoutFloorMs),
    JSON.stringify(environment),
    JSON.stringify(runtime),
    JSON.stringify(target),
  ];
  const proofFingerprint = fingerprintDigest(
    proofSession.runInputDigest,
    fingerprintSalts
  );
  const currentStateFile = stateFile(project, scope);
  const previousState = readJson(currentStateFile);
  const reusable = resolveReusableProofState({
    force: forceProof,
    previousState,
    proofFingerprint,
    selectedUnits,
    targetResumable: target.resumable,
  });
  const state = {
    completed: reusable.completed,
    planFingerprint: plan.planFingerprint,
    proofFingerprint,
    status: 'in_progress',
    version: 1,
  };
  const reusedUnitIds = new Set(Object.keys(reusable.completed));
  const writeProjectSummary = (options) =>
    writeSummary({
      ...options,
      maxTestsPerProcess: projectMaxTestsPerProcess,
      unitWorkers: workerCap,
    });

  if (!target.resumable) {
    console.log(
      'External browser target has no PLITE_BROWSER_TARGET_FINGERPRINT; resume is disabled'
    );
  }

  const selectedPlannedIds = selectedUnits.flatMap(({ testIds }) => testIds);
  const selectedCompletedUnits = selectedUnits.map(
    (unit) => state.completed[unit.id]
  );

  if (reusable.complete) {
    const failure = await integrityFailure(proofSession, target);

    if (failure) {
      state.completed = {};
      state.status = 'invalid';
      writeJson(currentStateFile, state);
      writeProjectSummary({
        completedUnits: selectedCompletedUnits,
        durationMs: Math.round(performance.now() - startedAt),
        failure,
        plan,
        project,
        proofFingerprint,
        reusedUnitIds,
        scope,
        selectedUnits,
        status: 'failed',
      });

      return 1;
    }

    const summary = writeProjectSummary({
      completedUnits: selectedCompletedUnits,
      durationMs: Math.round(performance.now() - startedAt),
      plan,
      project,
      proofFingerprint,
      reusedUnitIds,
      scope,
      selectedUnits,
      status: 'passed',
    });

    console.log(
      `${project}: reused ${summary.passedTestIds.length} passed and ` +
        `${summary.skippedTests.length} skipped from a matching complete proof`
    );

    return 0;
  }

  state.status = 'in_progress';
  writeJson(currentStateFile, state);
  if (reusable.canResume && Object.keys(state.completed).length > 0) {
    console.log(
      `Resuming ${project}: ${
        Object.keys(state.completed).length
      } bounded batches already passed`
    );
  }

  const fail = (failure, completedUnits = Object.values(state.completed)) => {
    if (['source-changed', 'target-changed'].includes(failure.phase)) {
      state.completed = {};
      state.status = 'invalid';
      writeJson(currentStateFile, state);
    }

    writeProjectSummary({
      completedUnits,
      durationMs: Math.round(performance.now() - startedAt),
      failure,
      plan,
      project,
      proofFingerprint,
      reusedUnitIds,
      scope,
      selectedUnits,
      status: 'failed',
    });
    console.error(
      state.status === 'invalid'
        ? `${project} stopped at ${failure.phase}; proof state was invalidated${formatIntegrityFailureDetails(failure, repoRoot)}`
        : `${project} stopped at ${failure.phase}; successful bounded batches remain resumable`
    );

    return 1;
  };

  for (const [index, unit] of selectedUnits.entries()) {
    if (state.completed[unit.id]) continue;

    projectRun?.throwIfCancelled();
    const serverStatus = await ensureServer(projectRun);
    projectRun?.throwIfCancelled();

    if (serverStatus !== 0) {
      return fail({ phase: 'server', unit: unit.id });
    }

    const beforeUnitFailure = await observedIntegrityFailure(proofSession);

    if (beforeUnitFailure) {
      return fail({ ...beforeUnitFailure, unit: unit.id });
    }

    const reportFile = unitReportFile(project, scope, unit);
    const outputFile = unitOutputFile(project, scope, unit);

    fs.rmSync(reportFile, { force: true });
    fs.rmSync(outputFile, { force: true });
    console.log(
      `[${project} ${index + 1}/${selectedUnits.length}] ${unit.files.join(
        ', '
      )} (${unit.expectedTests} tests, ${unit.workers} workers, ${
        unit.profile
      })`
    );

    const result = await runCaptured(
      [
        `--project=${project}`,
        `--workers=${unit.workers}`,
        '--retries=0',
        ...unit.selectors,
        ...(unit.grep ? [`--grep=${unit.grep}`] : []),
      ],
      {
        PLITE_BROWSER_FULLY_PARALLEL: '1',
        PLITE_BROWSER_JSON_OUTPUT: reportFile,
        PLITE_BROWSER_OUTPUT_DIR: projectOutputDirectory(project),
      },
      { echo: echoOutput, projectRun, timeoutMs: unit.timeoutMs }
    );
    projectRun?.throwIfCancelled();
    const report = readJson(reportFile);

    if (!echoOutput && result.output.trim()) {
      process.stdout.write(
        `[${project} ${index + 1}/${selectedUnits.length} output]\n` +
          `${result.output.trimEnd()}\n`
      );
    }

    if (result.timedOut) {
      fs.writeFileSync(outputFile, result.output);

      return fail({
        phase: 'process-timeout',
        timeoutMs: unit.timeoutMs,
        unit: unit.id,
      });
    }

    if (result.status !== 0 || !report) {
      fs.writeFileSync(outputFile, result.output);

      return fail({
        phase: report ? classifyFailure(result.output) : 'report',
        status: result.status,
        unit: unit.id,
      });
    }

    const validation = validateUnitResult(
      unit,
      collectReportTests(report, project)
    );

    if (!validation.ok) {
      fs.writeFileSync(outputFile, result.output);

      return fail({
        coverage: {
          duplicatePlanned: validation.duplicatePlanned,
          duplicates: validation.duplicates,
          missing: validation.missing,
          unexpected: validation.unexpected,
        },
        invalidOutcomes: validation.invalidOutcomes,
        phase: 'unit-result',
        unit: unit.id,
        unreasonedSkips: validation.unreasonedSkips,
      });
    }

    const afterUnitFailure = await observedIntegrityFailure(proofSession);

    if (afterUnitFailure) {
      return fail({ ...afterUnitFailure, unit: unit.id });
    }

    state.completed[unit.id] = {
      durationMs: result.durationMs,
      id: unit.id,
      results: validation.results,
      testIds: validation.results.map(({ id }) => id),
      unitFingerprint: fingerprintBrowserUnit(unit),
    };
    writeJson(currentStateFile, state);
  }

  const completedUnits = selectedUnits.map((unit) => state.completed[unit.id]);

  if (completedUnits.some((unit) => !unit)) {
    return fail({ phase: 'state', reason: 'missing selected unit' });
  }

  const coverage = verifyExactCoverage(
    selectedPlannedIds,
    completedUnits.flatMap(({ results }) => results.map(({ id }) => id))
  );

  if (!coverage.ok) {
    state.completed = {};
    state.status = 'invalid';
    writeJson(currentStateFile, state);

    return fail(
      {
        ...coverage,
        phase: 'coverage',
      },
      completedUnits
    );
  }

  const finalFailure = await integrityFailure(proofSession, target);

  if (finalFailure) {
    return fail(finalFailure);
  }

  state.status = 'complete';
  writeJson(currentStateFile, state);
  const summary = writeProjectSummary({
    completedUnits,
    durationMs: Math.round(performance.now() - startedAt),
    plan,
    project,
    proofFingerprint,
    reusedUnitIds,
    scope,
    selectedUnits,
    status: 'passed',
  });

  console.log(
    `${project}: ${summary.passedTestIds.length} passed, ${
      summary.skippedTests.length
    } skipped, ${summary.completedUnits} bounded batches, ${(
      summary.durationMs / 1000
    ).toFixed(1)}s`
  );

  return 0;
};

const runMatrix = async (selectors = []) => {
  const projects = [
    'chromium',
    'firefox',
    'mobile',
    ...(process.platform === 'darwin' ? ['webkit'] : []),
  ];

  const serverStatus = await ensureServer();

  if (serverStatus !== 0) return serverStatus;

  const execution = createProjectExecutionPlan(
    projects,
    unitWorkers,
    requestedProjectConcurrency
  );

  console.log(
    `Running ${projects.length} browser projects with concurrency ` +
      `${execution.concurrency} and ${execution.unitWorkers} workers per project`
  );

  return runProjectWaves({
    concurrency: execution.concurrency,
    projects,
    runProject: (project, projectRun) =>
      runManagedProject(project, selectors, {
        echoOutput: false,
        projectRun,
        workerCap: execution.unitWorkers,
      }),
    stopSiblings: () => stopActiveProcesses(),
  });
};

let status = 1;

try {
  if (job.total > 1 && mode !== 'project') {
    throw new Error(
      'PLITE_BROWSER_JOB is only valid in explicit project mode; ' +
        'aggregate chromium, matrix, and smoke proofs cannot be partial.'
    );
  }

  const setupStatus = await runSetup();

  if (setupStatus !== 0) {
    status = setupStatus;
  } else if (mode === 'matrix') {
    status = await runMatrix(normalizeSelectors(passthroughArgs));
  } else if (mode === 'chromium') {
    status = await runManagedProject(
      'chromium',
      normalizeSelectors(passthroughArgs)
    );
  } else if (mode === 'project') {
    const [project, ...selectors] = stripSeparators(passthroughArgs);

    if (!project) {
      console.error('Project mode requires a Playwright project name');
      status = 1;
    } else {
      status = await runManagedProject(project, normalizeSelectors(selectors));
    }
  } else if (mode === 'dev' || mode === 'smoke') {
    status = await runManagedProject('chromium', smokeSelectors);
  } else if (mode === 'direct') {
    const serverStatus = await ensureServer();

    status =
      serverStatus === 0
        ? await runDirect(stripSeparators(passthroughArgs))
        : serverStatus;
  } else {
    console.error(
      `Unknown Plite browser test mode "${mode}". Expected matrix, chromium, project, smoke, or direct.`
    );
    status = 1;
  }
} catch (error) {
  console.error(error);
  status = 1;
} finally {
  await stopActiveProcesses();
  await stopServer();
  await closeProofSession();
}

process.exit(status);
