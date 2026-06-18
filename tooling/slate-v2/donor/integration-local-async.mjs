import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import {
  appendFile,
  mkdir,
  open,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { createServer } from 'node:net';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptPath), '..');
const playwrightBin = path.join(repoRoot, 'node_modules', '.bin', 'playwright');
const runsRoot = path.join(repoRoot, '.tmp', 'integration-runs');
const lockPath = path.join(runsRoot, 'lock.json');
const latestPath = path.join(runsRoot, 'latest.json');
const sourceStampRoots = [
  'package.json',
  'bun.lock',
  'packages',
  'playwright',
  'site',
];
const sourceStampIgnoredDirs = new Set([
  '.next',
  '.tmp',
  '.turbo',
  'coverage',
  'dist',
  'node_modules',
  'out',
  'test-results',
]);
const sourceStampScriptFiles = [
  'scripts/integration-local-async.mjs',
  'scripts/serve-playwright.mjs',
];

const readJson = async (filePath) =>
  JSON.parse(await readFile(filePath, 'utf8'));

const writeJson = async (filePath, value) => {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(`${filePath}.tmp`, `${JSON.stringify(value, null, 2)}\n`);
  await rename(`${filePath}.tmp`, filePath);
};

const formatDateId = (date = new Date()) =>
  date.toISOString().replace(/[:.]/g, '-');

const runPath = (runId) => path.join(runsRoot, runId);
const statusPath = (runId) => path.join(runPath(runId), 'status.json');
const rawLogPath = (runId) => path.join(runPath(runId), 'raw.log');
const failuresPath = (runId) => path.join(runPath(runId), 'failures.md');
const pickupPath = (runId) => path.join(runPath(runId), 'pickup.md');
const reportPath = (runId) => path.join(runPath(runId), 'report.json');

const isProcessRunning = (pid) => {
  if (!pid) return false;

  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

const readLatestRunId = async () => {
  if (!existsSync(latestPath)) return null;
  return (await readJson(latestPath)).runId;
};

const readStatus = async (runId) => readJson(statusPath(runId));

const readStatusIfExists = async (runId) =>
  existsSync(statusPath(runId)) ? readStatus(runId) : null;

const updateStatus = async (runId, patch) => {
  const current = existsSync(statusPath(runId))
    ? await readStatus(runId)
    : { runId };
  const next = { ...current, ...patch };
  await writeJson(statusPath(runId), next);
  return next;
};

const isTerminalStatus = (status) =>
  status === 'failed' || status === 'passed' || status === 'cancelled';

const appendLog = async (runId, text) => {
  await appendFile(rawLogPath(runId), text);
};

const commandLine = (command, args) =>
  [command, ...args]
    .map((part) => (part.includes(' ') ? `"${part}"` : part))
    .join(' ');

export const commandKeyFor = (command) => JSON.stringify(command);

export const splitPlaywrightArgs = (args) => {
  const targets = [];
  const passthrough = [];

  for (const arg of args) {
    if (!arg.startsWith('-') && arg.startsWith('playwright/')) {
      targets.push(arg);
    } else {
      passthrough.push(arg);
    }
  }

  return {
    passthrough,
    targets: targets.length > 0 ? targets : ['playwright/integration'],
  };
};

export const buildPlaywrightCommand = (
  extraPlaywrightArgs,
  additionalPlaywrightArgs = []
) => {
  const { passthrough, targets } = splitPlaywrightArgs(extraPlaywrightArgs);

  return [
    playwrightBin,
    'test',
    ...targets,
    '--reporter=json',
    ...additionalPlaywrightArgs,
    ...passthrough,
  ];
};

export const buildSlateBrowserBuildCommand = () => [
  'bun',
  '--filter',
  '@platejs/browser',
  'build',
];

const collectSourceStampFiles = async (root, relativePath) => {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) return [];

  const info = await stat(absolutePath);
  if (info.isFile()) return [relativePath];
  if (!info.isDirectory()) return [];

  const entries = await readdir(absolutePath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.storybook') continue;
    if (entry.isDirectory() && sourceStampIgnoredDirs.has(entry.name)) continue;

    const childPath = path.join(relativePath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceStampFiles(root, childPath)));
    } else if (entry.isFile()) {
      files.push(childPath);
    }
  }

  return files;
};

const createSourceStamp = async () => {
  const hash = createHash('sha256');
  const files = [];

  for (const rootEntry of [...sourceStampRoots, ...sourceStampScriptFiles]) {
    files.push(...(await collectSourceStampFiles(repoRoot, rootEntry)));
  }

  for (const filePath of [...new Set(files)].sort()) {
    hash.update(filePath);
    hash.update('\0');
    hash.update(await readFile(path.join(repoRoot, filePath)));
    hash.update('\0');
  }

  return `sha256:${hash.digest('hex')}`;
};

const statusCommandKey = (status) =>
  status.commandKey ??
  (Array.isArray(status.command) ? commandKeyFor(status.command) : '');

const isCacheableStatus = (status) =>
  status === 'failed' || status === 'passed';

export const getRunReuseDecision = ({
  requestedCommandKey,
  requestedSourceStamp,
  status,
  live,
}) => {
  if (!status) {
    return {
      reason: 'missing-status',
      reuse: false,
    };
  }

  if (statusCommandKey(status) !== requestedCommandKey) {
    return {
      reason: 'different-command',
      reuse: false,
    };
  }

  if (status.sourceStamp && status.sourceStamp !== requestedSourceStamp) {
    return {
      reason: 'different-source-stamp',
      reuse: false,
    };
  }

  if (live) {
    return {
      reason: 'same-running-run',
      reuse: true,
    };
  }

  if (!status.sourceStamp) {
    return {
      reason: 'missing-source-stamp',
      reuse: false,
    };
  }

  if (!isCacheableStatus(status.status)) {
    return {
      reason: 'not-cacheable-status',
      reuse: false,
    };
  }

  return {
    reason: 'same-completed-run',
    reuse: true,
  };
};

const runCommand = async (runId, command, args, options = {}) => {
  await appendLog(runId, `\n$ ${commandLine(command, args)}\n`);

  const child = spawn(command, args, {
    cwd: repoRoot,
    env: {
      ...process.env,
      ...options.env,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    stdout += text;
    void appendLog(runId, text);
  });
  child.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    stderr += text;
    void appendLog(runId, text);
  });

  const exitCode = await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('exit', (code) => resolve(code ?? 1));
  });

  await appendLog(
    runId,
    `\n[exit ${exitCode}] ${commandLine(command, args)}\n`
  );

  return { exitCode, stderr, stdout };
};

export const findAvailablePort = async (startPort = 3111) => {
  for (let port = startPort; port < startPort + 200; port += 1) {
    const available = await new Promise((resolve) => {
      const server = createServer();
      server.once('error', () => resolve(false));
      server.once('listening', () => {
        server.close(() => resolve(true));
      });
      server.listen(port);
    });

    if (available) return port;
  }

  throw new Error(`No available port found from ${startPort}`);
};

const waitForUrl = async (url, timeoutMs = 60_000) => {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.status < 500) return;
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(
    `Timed out waiting for ${url}${lastError ? `: ${lastError.message}` : ''}`
  );
};

const startServer = async (runId, port) => {
  await appendLog(
    runId,
    `\n$ PORT=${port} node ./scripts/serve-playwright.mjs\n`
  );

  const child = spawn(process.execPath, ['./scripts/serve-playwright.mjs'], {
    cwd: repoRoot,
    env: {
      ...process.env,
      PORT: String(port),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const ready = new Promise((resolve, reject) => {
    let settled = false;
    let output = '';
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(
        new Error(
          `Timed out waiting for Playwright server on port ${port} to start`
        )
      );
    }, 60_000);

    const finish = (callback) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      callback();
    };

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      output += text;
      void appendLog(runId, text);

      if (text.includes('Playwright server listening')) {
        finish(resolve);
      }
    });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      output += text;
      void appendLog(runId, text);
    });

    child.once('error', (error) => {
      finish(() => reject(error));
    });

    child.once('exit', (code) => {
      void appendLog(runId, `\n[server exit ${code ?? 1}]\n`);
      finish(() =>
        reject(
          new Error(
            `Playwright server exited before listening on port ${port} with code ${code ?? 1}${
              output.trim() ? `\n${output.trim()}` : ''
            }`
          )
        )
      );
    });
  });

  await ready;
  await waitForUrl(`http://localhost:${port}`);

  return child;
};

const stopServer = async (child) => {
  if (!child || child.killed) return;

  const exited = new Promise((resolve) =>
    child.once('exit', () => resolve(true))
  );

  child.kill('SIGTERM');

  const didExit = await Promise.race([
    exited,
    new Promise((resolve) => setTimeout(resolve, 3000)),
  ]);

  if (!didExit && isProcessRunning(child.pid)) {
    child.kill('SIGKILL');
    await Promise.race([
      exited,
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
  }
};

const titlePath = (titles) => titles.filter(Boolean).join(' > ');

const errorMessage = (result) => {
  if (result?.error?.message) return result.error.message;
  if (Array.isArray(result?.errors) && result.errors[0]?.message) {
    return result.errors[0].message;
  }
  return '';
};

export const extractFailuresFromPlaywrightReport = (report) => {
  const failures = [];

  const visitSuite = (suite, parents = []) => {
    const titles = [...parents, suite.title].filter(Boolean);

    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        const badResults = (test.results ?? []).filter(
          (result) => result.status !== 'passed' && result.status !== 'skipped'
        );

        if (spec.ok !== false && badResults.length === 0) continue;

        const lastBadResult = badResults.at(-1);
        failures.push({
          file: suite.file ?? '',
          line: spec.line ?? suite.line ?? null,
          message: errorMessage(lastBadResult),
          project: test.projectName ?? '',
          status: lastBadResult?.status ?? 'failed',
          title: titlePath([...titles, spec.title]),
        });
      }
    }

    for (const child of suite.suites ?? []) {
      visitSuite(child, titles);
    }
  };

  for (const suite of report.suites ?? []) {
    visitSuite(suite);
  }

  return failures;
};

export const renderFailuresMarkdown = ({
  exitCode,
  fallbackText,
  failures,
  parseError,
  runId,
}) => {
  const lines = [
    `# Integration run ${runId}`,
    '',
    `Exit code: ${exitCode}`,
    '',
  ];

  if (parseError) {
    lines.push('Playwright JSON report could not be parsed.', '');
    lines.push(`Parse error: ${parseError}`, '');
  }

  if (fallbackText?.trim()) {
    lines.push('Command output:', '');
    lines.push('```text');
    lines.push(fallbackText.trim());
    lines.push('```', '');
  }

  if (failures.length === 0) {
    lines.push(exitCode === 0 ? 'No failures.' : 'No test failures parsed.');
    lines.push('');
    return `${lines.join('\n')}\n`;
  }

  lines.push(`Failures: ${failures.length}`, '');

  for (const [index, failure] of failures.entries()) {
    lines.push(`## ${index + 1}. ${failure.title || '(untitled)'}`);
    if (failure.file) {
      lines.push(
        `- File: ${failure.file}${failure.line ? `:${failure.line}` : ''}`
      );
    }
    if (failure.project) lines.push(`- Project: ${failure.project}`);
    lines.push(`- Status: ${failure.status}`);
    if (failure.message) {
      lines.push('- Error:');
      lines.push('');
      lines.push('```text');
      lines.push(failure.message.trim());
      lines.push('```');
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
};

export const renderPickupMarkdown = ({ failuresText = '', status }) => {
  const lines = [
    `# Integration pickup ${status.runId}`,
    '',
    `- Status: ${status.status}`,
  ];

  if (status.phase) lines.push(`- Phase: ${status.phase}`);
  if (status.exitCode != null) lines.push(`- Exit code: ${status.exitCode}`);
  if (status.failureCount != null) {
    lines.push(`- Parsed failures: ${status.failureCount}`);
  }
  if (status.startedAt) lines.push(`- Started: ${status.startedAt}`);
  if (status.completedAt) lines.push(`- Completed: ${status.completedAt}`);
  if (status.cwd) lines.push(`- Cwd: ${status.cwd}`);
  if (Array.isArray(status.command)) {
    lines.push(
      `- Command: ${commandLine(status.command[0], status.command.slice(1))}`
    );
  }
  if (status.rawLogPath) lines.push(`- Raw log: ${status.rawLogPath}`);
  if (status.failuresPath)
    lines.push(`- Failure inbox: ${status.failuresPath}`);

  lines.push('', '## Next action', '');

  if (status.status === 'running' || status.status === 'starting') {
    lines.push('Wait for the run to finish, then read this pickup again.');
  } else if (status.status === 'passed') {
    lines.push(
      'No integration failures. Keep using focused gates for normal work; run a broad async sweep again before release-quality closure.'
    );
  } else if (status.status === 'failed') {
    lines.push(
      status.failureCount > 0
        ? 'Fix the listed browser failures, rerun focused rows for each fix, then start another async integration sweep.'
        : 'Fix the command/build/config failure shown below, then start another async integration sweep.'
    );
  } else {
    lines.push('Inspect status and raw log before continuing.');
  }

  if (failuresText.trim()) {
    lines.push('', '## Failure inbox', '', failuresText.trim(), '');
  }

  return `${lines.join('\n')}\n`;
};

const writeFailureSummary = async (runId, exitCode, fallbackText = '') => {
  let failures = [];
  let parseError = '';

  try {
    const report = await readJson(reportPath(runId));
    failures = extractFailuresFromPlaywrightReport(report);
  } catch (error) {
    parseError = error.message;
  }

  const markdown = renderFailuresMarkdown({
    exitCode,
    fallbackText,
    failures,
    parseError,
    runId,
  });

  await writeFile(failuresPath(runId), markdown);

  return { failureCount: failures.length, parseError };
};

const writePickupSummary = async (runId, status) => {
  const failuresText = existsSync(failuresPath(runId))
    ? await readFile(failuresPath(runId), 'utf8')
    : '';

  await writeFile(
    pickupPath(runId),
    renderPickupMarkdown({ failuresText, status })
  );
};

const completeRun = async (runId, patch) => {
  const status = await updateStatus(runId, {
    completedAt: new Date().toISOString(),
    ...patch,
  });

  if (existsSync(lockPath)) {
    const lock = await readJson(lockPath);
    if (lock.runId === runId) {
      await rm(lockPath, { force: true });
    }
  }

  await writePickupSummary(runId, status);

  return status;
};

const runIntegration = async (runId, extraPlaywrightArgs) => {
  let server;
  let exitCode = 1;

  try {
    await updateStatus(runId, {
      phase: 'installing-playwright',
      status: 'running',
      workerPid: process.pid,
    });

    const install = await runCommand(runId, 'playwright', ['install']);
    if (install.exitCode !== 0) {
      await writeFailureSummary(
        runId,
        install.exitCode,
        install.stderr || install.stdout
      );
      await completeRun(runId, {
        exitCode: install.exitCode,
        phase: 'failed',
        status: 'failed',
      });
      return install.exitCode;
    }

    await updateStatus(runId, { phase: 'building-packages' });
    const packageBuild = await runCommand(runId, 'bun', ['build:packages']);
    if (packageBuild.exitCode !== 0) {
      await writeFailureSummary(
        runId,
        packageBuild.exitCode,
        packageBuild.stderr || packageBuild.stdout
      );
      await completeRun(runId, {
        exitCode: packageBuild.exitCode,
        phase: 'failed',
        status: 'failed',
      });
      return packageBuild.exitCode;
    }

    await updateStatus(runId, { phase: 'building-site' });
    const build = await runCommand(runId, 'bun', ['build:next']);
    if (build.exitCode !== 0) {
      await writeFailureSummary(
        runId,
        build.exitCode,
        build.stderr || build.stdout
      );
      await completeRun(runId, {
        exitCode: build.exitCode,
        phase: 'failed',
        status: 'failed',
      });
      return build.exitCode;
    }

    const port = await findAvailablePort();
    await updateStatus(runId, {
      baseURL: `http://localhost:${port}`,
      phase: 'serving-site',
      port,
    });
    server = await startServer(runId, port);

    await updateStatus(runId, { phase: 'building-slate-browser' });
    const slateBrowserBuildCommand = buildSlateBrowserBuildCommand();
    const slateBrowserBuild = await runCommand(
      runId,
      slateBrowserBuildCommand[0],
      slateBrowserBuildCommand.slice(1)
    );
    if (slateBrowserBuild.exitCode !== 0) {
      await writeFailureSummary(
        runId,
        slateBrowserBuild.exitCode,
        slateBrowserBuild.stderr || slateBrowserBuild.stdout
      );
      await completeRun(runId, {
        exitCode: slateBrowserBuild.exitCode,
        phase: 'failed',
        status: 'failed',
      });
      return slateBrowserBuild.exitCode;
    }

    await updateStatus(runId, { phase: 'running-playwright' });
    const command = buildPlaywrightCommand(extraPlaywrightArgs, [
      `--output=${path.join(runPath(runId), 'test-results')}`,
    ]);
    const test = await runCommand(runId, command[0], command.slice(1), {
      env: {
        PLAYWRIGHT_BASE_URL: `http://localhost:${port}`,
        PLAYWRIGHT_RETRIES: process.env.PLAYWRIGHT_RETRIES ?? '0',
        PLAYWRIGHT_WORKERS: process.env.PLAYWRIGHT_WORKERS ?? '2',
      },
    });

    await writeFile(reportPath(runId), test.stdout);
    const summary = await writeFailureSummary(
      runId,
      test.exitCode,
      test.stderr || ''
    );
    exitCode = test.exitCode;

    await completeRun(runId, {
      exitCode,
      failureCount: summary.failureCount,
      phase: 'complete',
      status: exitCode === 0 ? 'passed' : 'failed',
    });
  } catch (error) {
    await appendLog(
      runId,
      `\n[runner error] ${error.stack ?? error.message}\n`
    );
    await writeFile(
      failuresPath(runId),
      renderFailuresMarkdown({
        exitCode: 1,
        fallbackText: error.stack ?? error.message,
        failures: [],
        parseError: error.message,
        runId,
      })
    );
    await completeRun(runId, {
      error: error.message,
      exitCode: 1,
      phase: 'failed',
      status: 'failed',
    });
    exitCode = 1;
  } finally {
    await stopServer(server);
  }

  return exitCode;
};

const printRunReferences = (runId, prefix) => {
  console.log(`${prefix} integration run ${runId}`);
  console.log(`status: bun test:integration-local:status ${runId}`);
  console.log(`failures: bun test:integration-local:failures ${runId}`);
  console.log(`pickup: bun test:integration-local:pickup ${runId}`);
};

const getActiveRunStatus = async () => {
  if (!existsSync(lockPath)) return null;

  const lock = await readJson(lockPath);
  if (!isProcessRunning(lock.pid)) {
    await rm(lockPath, { force: true });
    return null;
  }

  return {
    lock,
    status: await readStatusIfExists(lock.runId),
  };
};

const reserveRunLock = async (lock) => {
  try {
    const file = await open(lockPath, 'wx');
    try {
      await file.writeFile(`${JSON.stringify(lock, null, 2)}\n`);
    } finally {
      await file.close();
    }
    return true;
  } catch (error) {
    if (error.code === 'EEXIST') return false;
    throw error;
  }
};

const maybeReuseActiveRun = async ({ commandKey, sourceStamp }) => {
  const active = await getActiveRunStatus();
  if (!active) return false;

  const decision = getRunReuseDecision({
    live: true,
    requestedCommandKey: commandKey,
    requestedSourceStamp: sourceStamp,
    status: active.status,
  });

  if (decision.reuse) {
    printRunReferences(active.lock.runId, 'reusing running');
    return true;
  }

  const currentCommand = Array.isArray(active.status?.command)
    ? commandLine(active.status.command[0], active.status.command.slice(1))
    : '(unknown command)';

  throw new Error(
    [
      `Integration run ${active.lock.runId} is already running with pid ${active.lock.pid}.`,
      `Cannot start another async integration run: ${decision.reason}.`,
      `Current: ${currentCommand}`,
      `Requested command key: ${commandKey}`,
      'Use bun test:integration-local:pickup to inspect the active run.',
    ].join('\n')
  );
};

const findReusableCompletedRun = async ({ commandKey, sourceStamp }) => {
  if (!existsSync(runsRoot)) return null;

  const entries = await readdir(runsRoot, { withFileTypes: true });
  const runIds = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .reverse();

  for (const runId of runIds) {
    const status = await readStatusIfExists(runId);
    const decision = getRunReuseDecision({
      live: false,
      requestedCommandKey: commandKey,
      requestedSourceStamp: sourceStamp,
      status,
    });

    if (decision.reuse) return status;
  }

  return null;
};

const reserveOrReuseRunLock = async ({ commandKey, lock, sourceStamp }) => {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (await reserveRunLock(lock)) return 'reserved';
    if (await maybeReuseActiveRun({ commandKey, sourceStamp })) return 'reused';
  }

  throw new Error('Could not reserve integration run lock.');
};

const start = async (extraPlaywrightArgs) => {
  await mkdir(runsRoot, { recursive: true });

  const command = buildPlaywrightCommand(extraPlaywrightArgs);
  const commandKey = commandKeyFor(command);
  const sourceStamp = await createSourceStamp();

  if (await maybeReuseActiveRun({ commandKey, sourceStamp })) return;

  const cached = await findReusableCompletedRun({ commandKey, sourceStamp });
  if (cached) {
    console.log(`reusing cached integration run ${cached.runId}`);
    await printPickup(cached.runId);
    return;
  }

  const runId = formatDateId();
  const dir = runPath(runId);
  await mkdir(dir, { recursive: true });
  const startedAt = new Date().toISOString();

  await writeFile(
    path.join(dir, 'command.txt'),
    commandLine(command[0], command.slice(1))
  );

  const initialStatus = {
    command,
    commandKey,
    cwd: repoRoot,
    failuresPath: failuresPath(runId),
    pickupPath: pickupPath(runId),
    rawLogPath: rawLogPath(runId),
    reportPath: reportPath(runId),
    runId,
    sourceStamp,
    startedAt,
    status: 'starting',
  };

  await writeJson(statusPath(runId), initialStatus);

  const lockResult = await reserveOrReuseRunLock({
    commandKey,
    lock: {
      commandKey,
      pid: process.pid,
      runId,
      sourceStamp,
      startedAt,
    },
    sourceStamp,
  });

  if (lockResult === 'reused') {
    await rm(dir, { force: true, recursive: true });
    return;
  }

  await writeJson(latestPath, {
    commandKey,
    runId,
    sourceStamp,
    statusPath: statusPath(runId),
  });

  const child = spawn(
    process.execPath,
    [scriptPath, 'run', runId, ...extraPlaywrightArgs],
    {
      cwd: repoRoot,
      detached: true,
      env: process.env,
      stdio: 'ignore',
    }
  );
  child.unref();

  await writeJson(lockPath, {
    commandKey,
    pid: child.pid,
    runId,
    sourceStamp,
    startedAt: initialStatus.startedAt,
  });

  const current = await readStatus(runId);
  if (!isTerminalStatus(current.status)) {
    await updateStatus(runId, {
      status: 'running',
      workerPid: child.pid,
    });
  }

  const finalStatus = await readStatus(runId);
  if (isTerminalStatus(finalStatus.status) || !isProcessRunning(child.pid)) {
    const lock = existsSync(lockPath) ? await readJson(lockPath) : null;
    if (lock?.runId === runId) {
      await rm(lockPath, { force: true });
    }
  }

  printRunReferences(runId, 'started');
};

const printStatus = async (runIdArg) => {
  const runId = runIdArg ?? (await readLatestRunId());

  if (!runId) {
    console.log('no integration runs found');
    return;
  }

  const status = await readStatus(runId);
  const live =
    status.status === 'running' && isProcessRunning(status.workerPid);
  const liveSuffix =
    status.status === 'running' ? (live ? ' (live)' : ' (stale)') : '';
  console.log(`${runId}: ${status.status}${liveSuffix}`);
  if (status.phase) console.log(`phase: ${status.phase}`);
  if (status.exitCode != null) console.log(`exit code: ${status.exitCode}`);
  if (status.failureCount != null)
    console.log(`failures: ${status.failureCount}`);
  if (status.baseURL) console.log(`base url: ${status.baseURL}`);
  console.log(`raw log: ${status.rawLogPath}`);
  console.log(`failures: ${status.failuresPath}`);
};

const printFailures = async (runIdArg) => {
  const runId = runIdArg ?? (await readLatestRunId());

  if (!runId) {
    console.log('no integration runs found');
    return;
  }

  const filePath = failuresPath(runId);
  if (!existsSync(filePath)) {
    console.log(`no failures summary yet for ${runId}`);
    return;
  }

  process.stdout.write(await readFile(filePath, 'utf8'));
};

const printPickup = async (runIdArg) => {
  const runId = runIdArg ?? (await readLatestRunId());

  if (!runId) {
    console.log('no integration runs found');
    return;
  }

  const filePath = pickupPath(runId);
  if (existsSync(filePath)) {
    process.stdout.write(await readFile(filePath, 'utf8'));
    return;
  }

  const status = await readStatus(runId);
  const failuresText = existsSync(failuresPath(runId))
    ? await readFile(failuresPath(runId), 'utf8')
    : '';

  process.stdout.write(renderPickupMarkdown({ failuresText, status }));
};

const main = async () => {
  const [command, maybeRunId, ...rest] = process.argv.slice(2);

  switch (command) {
    case 'start':
      await start([maybeRunId, ...rest].filter(Boolean));
      return;
    case 'run':
      process.exitCode = await runIntegration(maybeRunId, rest);
      return;
    case 'status':
      await printStatus(maybeRunId);
      return;
    case 'failures':
      await printFailures(maybeRunId);
      return;
    case 'pickup':
      await printPickup(maybeRunId);
      return;
    default:
      console.error(
        'Usage: node scripts/integration-local-async.mjs <start|status|failures|pickup|run> [args]'
      );
      process.exitCode = 1;
  }
};

if (process.argv[1] === scriptPath) {
  try {
    await main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
