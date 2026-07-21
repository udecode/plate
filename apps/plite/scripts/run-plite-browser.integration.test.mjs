import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { runBoundedProcess } from '../../../tooling/scripts/run-bounded-process.mjs';

const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const sourceAppRoot = path.resolve(scriptRoot, '..');
const sourceRepoRoot = path.resolve(sourceAppRoot, '../..');

const copyFile = (source, target) => {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
};

const writeFile = (file, source) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, source);
};

const fakePlaywrightCli = String.raw`#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const args = process.argv.slice(2);
const project =
  args.find((argument) => argument.startsWith('--project='))?.slice(10) ??
  'chromium';
const controlFile = process.env.FAKE_PLAYWRIGHT_CONTROL;
const logFile = process.env.FAKE_PLAYWRIGHT_LOG;
const control = JSON.parse(fs.readFileSync(controlFile, 'utf8'));
const catalog = Array.from({ length: 5 }, (_, index) => ({
  file: 'fake.spec.ts',
  id: 'fake-' + (index + 1),
  line: index + 1,
  title: 'fake test ' + (index + 1),
}));
const isDiscovery = args.includes('--list');
const locations = args
  .filter((argument) => /^tests\/plite-browser\/fake\.spec\.ts:\d+$/.test(argument))
  .map((argument) => Number(argument.slice(argument.lastIndexOf(':') + 1)));
const selected = isDiscovery
  ? catalog
  : catalog.filter(({ line }) => locations.includes(line));
const unitOrdinal = isDiscovery ? null : (control.unitOrdinal ?? 0) + 1;

if (!isDiscovery) {
  control.unitOrdinal = unitOrdinal;
  fs.writeFileSync(controlFile, JSON.stringify(control));
}

fs.appendFileSync(
  logFile,
  JSON.stringify({
    args,
    kind: isDiscovery ? 'discovery' : 'unit',
    selected: selected.map(({ id }) => id),
    unitOrdinal,
  }) + '\n'
);

if (!isDiscovery && control.mutateOnUnitOrdinal === unitOrdinal) {
  const sourceFile = process.env.FAKE_PLAYWRIGHT_SOURCE;
  const source = fs.readFileSync(sourceFile, 'utf8');

  fs.writeFileSync(sourceFile, source + '\n// transient mutation\n');
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 75);
  fs.writeFileSync(sourceFile, source);
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 75);
}

if (!isDiscovery && control.mutateManifestOnUnitOrdinal === unitOrdinal) {
  fs.appendFileSync(process.env.FAKE_PLAYWRIGHT_MANIFEST, '\nchanged\n');
}

if (!isDiscovery && control.failOnUnitOrdinal === unitOrdinal) {
  process.stderr.write('synthetic bounded-unit failure\n');
  process.exit(1);
}

if (!isDiscovery && selected.length === 0) {
  process.stderr.write('fake Playwright received no exact test locations\n');
  process.exit(1);
}

const report = {
  suites: [
    {
      specs: selected.map((row) => ({
        file: row.file,
        id: row.id,
        line: row.line,
        tests: [
          {
            annotations: [],
            expectedStatus: 'passed',
            projectName: project,
            results: isDiscovery ? [] : [{ status: 'passed' }],
            timeout: 1000,
          },
        ],
        title: row.title,
      })),
      title: 'fake.spec.ts',
    },
  ],
};

fs.mkdirSync(path.dirname(process.env.PLITE_BROWSER_JSON_OUTPUT), {
  recursive: true,
});
fs.writeFileSync(
  process.env.PLITE_BROWSER_JSON_OUTPUT,
  JSON.stringify(report)
);
`;

const createFixture = () => {
  const fixtureRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), 'plite-browser-runner-integration-')
  );
  const appRoot = path.join(fixtureRoot, 'apps/plite');
  const fixtureScriptRoot = path.join(appRoot, 'scripts');
  const runnerFile = path.join(fixtureScriptRoot, 'run-plite-browser.mjs');

  for (const name of [
    'build-app-if-stale.mjs',
    'plite-browser-runner.mjs',
    'plite-proof-inputs.mjs',
    'run-plite-browser.mjs',
  ]) {
    copyFile(path.join(scriptRoot, name), path.join(fixtureScriptRoot, name));
  }
  copyFile(
    path.join(sourceRepoRoot, 'tooling/scripts/run-bounded-process.mjs'),
    path.join(fixtureRoot, 'tooling/scripts/run-bounded-process.mjs')
  );

  const testFile = path.join(appRoot, 'tests/plite-browser/fake.spec.ts');
  const controlFile = path.join(appRoot, '.tmp/fake-playwright-control.json');
  const logFile = path.join(appRoot, '.tmp/fake-playwright-invocations.jsonl');
  const manifestFile = path.join(
    fixtureRoot,
    'packages/browser/dist/.plite-browser-build.json'
  );
  const packageRoot = path.join(fixtureRoot, 'node_modules/@playwright/test');

  writeFile(testFile, '// fake discovery input\n');
  writeFile(path.join(appRoot, 'playwright.config.ts'), 'export default {};\n');
  writeFile(path.join(appRoot, 'package.json'), '{"private":true}\n');
  writeFile(path.join(fixtureRoot, 'package.json'), '{"private":true}\n');
  writeFile(
    path.join(
      fixtureRoot,
      'apps/www/src/app/(app)/examples/plite/plite-example-registry.ts'
    ),
    "export const EXAMPLE_NAMES_AND_PATHS = [['Fake', 'fake']] as const;\n"
  );
  writeFile(
    path.join(packageRoot, 'package.json'),
    JSON.stringify({
      main: 'index.cjs',
      name: '@playwright/test',
      version: '0.0.0-fake',
    })
  );
  writeFile(
    path.join(packageRoot, 'index.cjs'),
    `const browser = { executablePath: () => process.execPath };\nmodule.exports = { chromium: browser, firefox: browser, webkit: browser };\n`
  );
  writeFile(path.join(packageRoot, 'cli.js'), fakePlaywrightCli);
  writeFile(manifestFile, '{"fingerprint":"fixture-browser"}\n');
  writeFile(
    path.join(fixtureRoot, 'packages/browser/dist/index.js'),
    'export const fixture = true;\n'
  );
  writeFile(controlFile, '{"unitOrdinal":0}\n');
  writeFile(logFile, '');

  return {
    appRoot,
    controlFile,
    fixtureRoot,
    logFile,
    manifestFile,
    runnerFile,
    testFile,
  };
};

const readInvocations = (file) =>
  fs
    .readFileSync(file, 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));

const readSingleJson = (directory, prefix) => {
  const files = fs
    .readdirSync(directory)
    .filter((file) => file.startsWith(prefix) && file.endsWith('.json'));

  assert.equal(files.length, 1, `expected one ${prefix} JSON file`);

  return JSON.parse(fs.readFileSync(path.join(directory, files[0]), 'utf8'));
};

test('orchestrates bounded units, resume, outputs, manifest drift, and sticky invalidation', {
  timeout: 30_000,
}, async (context) => {
  const fixture = createFixture();

  context.after(() =>
    fs.rmSync(fixture.fixtureRoot, { force: true, recursive: true })
  );

  const environment = {
    ...process.env,
    FAKE_PLAYWRIGHT_CONTROL: fixture.controlFile,
    FAKE_PLAYWRIGHT_LOG: fixture.logFile,
    FAKE_PLAYWRIGHT_MANIFEST: fixture.manifestFile,
    FAKE_PLAYWRIGHT_SOURCE: fixture.testFile,
    PLAYWRIGHT_BASE_URL: 'http://plite-runner-fixture.invalid',
    PLITE_BROWSER_DISCOVERY_TIMEOUT_MS: '5000',
    PLITE_BROWSER_MAX_TESTS_PER_PROCESS: '2',
    PLITE_BROWSER_TARGET_FINGERPRINT: 'fixture-target-v1',
    PLITE_BROWSER_UNIT_TIMEOUT_MS: '5000',
    PLITE_BROWSER_UNIT_WORKERS: '2',
  };
  const run = () =>
    runBoundedProcess({
      args: [fixture.runnerFile, 'chromium'],
      command: process.execPath,
      cwd: fixture.appRoot,
      env: environment,
      stdio: ['ignore', 'pipe', 'pipe'],
      timeoutMs: 15_000,
    });
  const writeControl = (value) =>
    writeFile(fixture.controlFile, `${JSON.stringify(value)}\n`);
  const stateDirectory = path.join(
    fixture.appRoot,
    '.tmp/plite-browser-runner'
  );
  const summaryDirectory = path.join(
    fixture.appRoot,
    'test-results/plite-browser-runner'
  );

  writeControl({ failOnUnitOrdinal: 2, unitOrdinal: 0 });
  const interrupted = await run();

  assert.equal(interrupted.status, 1);
  assert.match(
    interrupted.stderr,
    /successful bounded batches remain resumable/
  );
  const interruptedState = readSingleJson(stateDirectory, 'state-chromium-');

  assert.equal(interruptedState.status, 'in_progress');
  assert.equal(Object.keys(interruptedState.completed).length, 1);

  writeControl({ unitOrdinal: 0 });
  const resumed = await run();

  assert.equal(resumed.status, 0, resumed.stderr);
  assert.match(
    resumed.stdout,
    /Resuming chromium: 1 bounded batches already passed/
  );
  const resumedSummary = readSingleJson(summaryDirectory, 'summary-chromium-');

  assert.equal(resumedSummary.status, 'passed');
  assert.equal(resumedSummary.coverage.executed, 5);
  assert.equal(resumedSummary.units.filter(({ reused }) => reused).length, 1);
  assert.equal(resumedSummary.selectedUnits, 3);

  const beforeCompleteReuse = readInvocations(fixture.logFile).length;
  const reused = await run();

  assert.equal(reused.status, 0, reused.stderr);
  assert.match(reused.stdout, /reused 5 passed/);
  assert.equal(readInvocations(fixture.logFile).length, beforeCompleteReuse);
  const reusedSummary = readSingleJson(summaryDirectory, 'summary-chromium-');

  assert.equal(reusedSummary.reused, true);
  assert.equal(reusedSummary.timing.executedBatchMs, 0);

  fs.appendFileSync(fixture.testFile, '// persistent source change\n');
  writeControl({ unitOrdinal: 0 });
  const invalidatedByDigest = await run();

  assert.equal(invalidatedByDigest.status, 0, invalidatedByDigest.stderr);
  const digestSummary = readSingleJson(summaryDirectory, 'summary-chromium-');

  assert.equal(
    digestSummary.units.every(({ reused: value }) => !value),
    true
  );

  const manifestSource = fs.readFileSync(fixture.manifestFile, 'utf8');

  writeControl({ mutateManifestOnUnitOrdinal: 1, unitOrdinal: 0 });
  environment.PLITE_BROWSER_FORCE_PROOF = '1';
  const invalidatedByManifest = await run();
  delete environment.PLITE_BROWSER_FORCE_PROOF;

  assert.equal(invalidatedByManifest.status, 1);
  assert.match(invalidatedByManifest.stderr, /source-changed.*invalidated/s);
  assert.equal(
    JSON.parse(fs.readFileSync(fixture.controlFile, 'utf8')).unitOrdinal,
    3,
    'an ignored manifest watch event must still fail the final run digest'
  );
  assert.equal(
    readSingleJson(stateDirectory, 'state-chromium-').status,
    'invalid'
  );
  fs.writeFileSync(fixture.manifestFile, manifestSource);

  writeControl({ mutateOnUnitOrdinal: 1, unitOrdinal: 0 });
  const invalidatedInFlight = await run();

  assert.equal(invalidatedInFlight.status, 1);
  assert.match(invalidatedInFlight.stderr, /source-changed.*invalidated/s);
  const invalidState = readSingleJson(stateDirectory, 'state-chromium-');

  assert.equal(invalidState.status, 'invalid');
  assert.deepEqual(invalidState.completed, {});

  writeControl({ unitOrdinal: 0 });
  const afterInvalidation = await run();

  assert.equal(afterInvalidation.status, 0, afterInvalidation.stderr);
  const finalSummary = readSingleJson(summaryDirectory, 'summary-chromium-');
  const invocations = readInvocations(fixture.logFile);
  const discoveries = invocations.filter(({ kind }) => kind === 'discovery');
  const units = invocations.filter(({ kind }) => kind === 'unit');

  assert.equal(
    finalSummary.units.every(({ reused: value }) => !value),
    true
  );
  assert.equal(discoveries.length, 2);
  assert.equal(
    units.every(
      ({ args, selected }) =>
        selected.length > 0 &&
        selected.length <= 2 &&
        args.includes('--retries=0') &&
        Number(
          args.find((argument) => argument.startsWith('--workers='))?.slice(10)
        ) <= 2
    ),
    true
  );
});
