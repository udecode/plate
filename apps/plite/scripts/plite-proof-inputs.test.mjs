import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  appBuildEntries,
  browserBuildEntries,
  browserPlanEntries,
  browserRunEntries,
  createBuildManifest,
  createProofIntegrityMonitor,
  fingerprintDigest,
  hashEntries,
  hashOutputTree,
  isBuildManifestFresh,
  repoRoot,
  snapshotEnvironmentByPrefix,
  snapshotFileIdentity,
} from './plite-proof-inputs.mjs';

const normalizedEntries = (entries) =>
  new Set(
    entries.map((entry) =>
      path.relative(repoRoot, entry).split(path.sep).join('/')
    )
  );

const waitForChange = async (monitor, timeoutMs = 1000) => {
  const startedAt = performance.now();

  while (performance.now() - startedAt < timeoutMs) {
    const change = await monitor.checkpoint();

    if (change) return change;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
};

const waitForMonitorReady = async (monitor) => {
  await monitor.ready();
  assert.equal(await monitor.checkpoint(), null);
};

test('app build inputs cover styles, config, local dependencies, and tooling', () => {
  const entries = normalizedEntries(appBuildEntries);

  for (const expected of [
    'apps/plite/scripts/build-app-if-stale.mjs',
    'apps/plite/scripts/plite-proof-inputs.mjs',
    'tooling/scripts/run-bounded-process.mjs',
    'apps/www/src/app/globals.css',
    'tsconfig.json',
    'packages/udecode/react-hotkeys/src',
    'packages/udecode/react-utils/src',
    'packages/udecode/utils/src',
    'tooling/config/tsconfig.base.json',
    'tooling/config/tsconfig.build.json',
    'tooling/config/direct-package.config.mts',
    'tooling/scripts/check-package-build-artifacts.mjs',
  ]) {
    assert.ok(entries.has(expected), `missing app build input: ${expected}`);
  }
});

test('browser build inputs cover its declaration and tooling config chain', () => {
  const entries = normalizedEntries(browserBuildEntries);

  for (const expected of [
    'apps/plite/scripts/build-browser-if-stale.mjs',
    'apps/plite/scripts/plite-proof-inputs.mjs',
    'tooling/scripts/run-bounded-process.mjs',
    'packages/browser/tsconfig.build.json',
    'tooling/config/tsconfig.base.json',
    'tooling/config/tsconfig.build.json',
    'tooling/config/direct-package.config.mts',
    'tooling/scripts/check-package-build-artifacts.mjs',
    'tsconfig.json',
  ]) {
    assert.ok(
      entries.has(expected),
      `missing browser build input: ${expected}`
    );
  }
});

test('browser discovery fingerprint covers its executable owner', () => {
  const entries = normalizedEntries(browserPlanEntries);

  assert.ok(
    entries.has('apps/plite/scripts/run-plite-browser.mjs'),
    'browser plan does not fingerprint its discovery owner'
  );
  assert.ok(entries.has('apps/plite/scripts/plite-proof-inputs.mjs'));
});

test('browser run identity covers its server, build owners, and built runtime', () => {
  const entries = normalizedEntries(browserRunEntries);

  for (const expected of [
    'apps/plite/scripts/build-app-if-stale.mjs',
    'apps/plite/scripts/build-browser-if-stale.mjs',
    'apps/plite/scripts/plite-proof-inputs.mjs',
    'apps/plite/scripts/run-plite-browser.mjs',
    'apps/plite/scripts/serve.mjs',
    'packages/browser/src',
    'packages/browser/dist',
  ]) {
    assert.ok(entries.has(expected), `missing browser run input: ${expected}`);
  }
});

test('public Yjs build environment snapshot is complete and stable', () => {
  assert.deepEqual(
    snapshotEnvironmentByPrefix('NEXT_PUBLIC_PLITE_YJS_', {
      NEXT_PUBLIC_OTHER: 'ignored',
      NEXT_PUBLIC_PLITE_YJS_TOKEN: 'token',
      NEXT_PUBLIC_PLITE_YJS_ROOM: 'room',
      NEXT_PUBLIC_PLITE_YJS_URL: 'url',
    }),
    {
      NEXT_PUBLIC_PLITE_YJS_ROOM: 'room',
      NEXT_PUBLIC_PLITE_YJS_TOKEN: 'token',
      NEXT_PUBLIC_PLITE_YJS_URL: 'url',
    }
  );
});

test('browser runtime identity detects executable replacement', () => {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), 'plite-runtime-identity-')
  );
  const executable = path.join(root, 'browser');

  try {
    assert.deepEqual(snapshotFileIdentity(executable), {
      missing: true,
      path: executable,
    });
    fs.writeFileSync(executable, 'browser-a');
    const initial = snapshotFileIdentity(executable);

    fs.writeFileSync(executable, 'browser-version-b');
    const replacement = snapshotFileIdentity(executable);

    assert.equal(initial.path, executable);
    assert.notEqual(replacement.size, initial.size);
  } finally {
    fs.rmSync(root, { force: true, recursive: true });
  }
});

test('salts one captured input digest without reading its tree again', () => {
  assert.equal(
    fingerprintDigest('content', ['project-a']),
    fingerprintDigest('content', ['project-a'])
  );
  assert.notEqual(
    fingerprintDigest('content', ['project-a']),
    fingerprintDigest('content', ['project-b'])
  );
  assert.notEqual(
    fingerprintDigest('content-a', ['project']),
    fingerprintDigest('content-b', ['project'])
  );
});

test('proof monitor catches transient source changes and new files', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'plite-proof-monitor-'));
  const sourceRoot = path.join(root, 'source');
  const sourceFile = path.join(sourceRoot, 'input.ts');

  fs.mkdirSync(sourceRoot);
  fs.writeFileSync(sourceFile, 'before');
  const monitor = createProofIntegrityMonitor({
    sourceEntries: [sourceRoot],
  });

  try {
    await waitForMonitorReady(monitor);
    fs.writeFileSync(sourceFile, 'during');
    const change = await waitForChange(monitor);

    assert.equal(change?.kind, 'source');
    assert.ok(
      change?.path === sourceFile || change?.path === sourceRoot,
      change?.path
    );

    fs.writeFileSync(sourceFile, 'before');
    await monitor.checkpoint();

    assert.equal(monitor.change, change);
  } finally {
    monitor.close();
    fs.rmSync(root, { force: true, recursive: true });
  }

  const additionRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), 'plite-proof-monitor-addition-')
  );
  const additionSourceRoot = path.join(additionRoot, 'source');

  fs.mkdirSync(additionSourceRoot);
  const additionMonitor = createProofIntegrityMonitor({
    sourceEntries: [additionSourceRoot],
  });

  try {
    const addedFile = path.join(additionSourceRoot, 'added.ts');

    await waitForMonitorReady(additionMonitor);
    fs.writeFileSync(addedFile, 'added');
    const change = await waitForChange(additionMonitor);

    assert.equal(change?.kind, 'source');
    assert.ok(
      change?.path === addedFile || change?.path === additionSourceRoot,
      change?.path
    );
  } finally {
    additionMonitor.close();
    fs.rmSync(additionRoot, { force: true, recursive: true });
  }
});

test('proof monitor classifies output and manifest drift', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'plite-target-monitor-'));
  const manifestPath = path.join(root, '.manifest.json');
  const outputFile = path.join(root, 'index.html');

  fs.writeFileSync(manifestPath, '{}');
  fs.writeFileSync(outputFile, 'before');
  const monitor = createProofIntegrityMonitor({
    sourceEntries: [],
    targetRoot: root,
  });

  try {
    await waitForMonitorReady(monitor);
    fs.writeFileSync(manifestPath, '{"note":true}');
    const manifestChange = await waitForChange(monitor);

    assert.equal(manifestChange?.kind, 'target');
  } finally {
    monitor.close();
  }

  const outputMonitor = createProofIntegrityMonitor({
    sourceEntries: [],
    targetRoot: root,
  });

  try {
    await waitForMonitorReady(outputMonitor);
    fs.writeFileSync(outputFile, 'after');
    const outputChange = await waitForChange(outputMonitor);

    assert.equal(outputChange?.kind, 'target');
  } finally {
    outputMonitor.close();
    fs.rmSync(root, { force: true, recursive: true });
  }
});

test('source monitor ignores its build manifest but the run digest does not', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'plite-source-monitor-'));
  const manifestPath = path.join(root, '.build-manifest.json');
  const runtimePath = path.join(root, 'runtime.js');

  fs.writeFileSync(manifestPath, '{"fingerprint":"before"}');
  fs.writeFileSync(runtimePath, 'runtime-before');
  const initialDigest = hashEntries([root]);
  const monitor = createProofIntegrityMonitor({
    sourceEntries: [root],
    sourceIgnoredPaths: [manifestPath],
  });

  try {
    await waitForMonitorReady(monitor);
    fs.writeFileSync(manifestPath, '{"fingerprint":"after"}');

    assert.equal(await waitForChange(monitor, 100), undefined);
    assert.notEqual(hashEntries([root]), initialDigest);

    fs.writeFileSync(runtimePath, 'runtime-after');
    const runtimeChange = await waitForChange(monitor);

    assert.equal(runtimeChange?.kind, 'source');
    assert.equal(runtimeChange?.path, runtimePath);
  } finally {
    monitor.close();
    fs.rmSync(root, { force: true, recursive: true });
  }
});

test('target monitor ignores its build manifest but freshness does not', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'plite-target-manifest-'));
  const manifestPath = path.join(root, '.build-manifest.json');
  const outputPath = path.join(root, 'index.html');
  const options = {
    inputDigest: 'input',
    manifestPath,
    outputRoot: root,
    version: 1,
  };

  fs.writeFileSync(outputPath, 'output');
  fs.writeFileSync(manifestPath, JSON.stringify(createBuildManifest(options)));
  const monitor = createProofIntegrityMonitor({
    sourceEntries: [],
    targetIgnoredPaths: [manifestPath],
    targetRoot: root,
  });

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    await waitForMonitorReady(monitor);
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({ ...manifest, fingerprint: 'drifted' })
    );

    assert.equal(await waitForChange(monitor, 100), undefined);
    assert.equal(isBuildManifestFresh(options), false);

    fs.writeFileSync(outputPath, 'changed output');
    const outputChange = await waitForChange(monitor);

    assert.equal(outputChange?.kind, 'target');
    assert.equal(outputChange?.path, outputPath);
  } finally {
    monitor.close();
    fs.rmSync(root, { force: true, recursive: true });
  }
});

test('output tree digest covers paths, bytes, additions, and deletions', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'plite-output-digest-'));

  try {
    fs.mkdirSync(path.join(root, 'chunks'));
    fs.writeFileSync(path.join(root, 'index.html'), 'index');
    fs.writeFileSync(path.join(root, 'chunks/app.js'), 'chunk');
    const initial = hashOutputTree(root);

    fs.writeFileSync(path.join(root, 'chunks/app.js'), 'CHUNK');
    assert.notEqual(hashOutputTree(root).digest, initial.digest);

    fs.writeFileSync(path.join(root, 'chunks/app.js'), 'chunk');
    assert.equal(hashOutputTree(root).digest, initial.digest);

    fs.renameSync(
      path.join(root, 'chunks/app.js'),
      path.join(root, 'chunks/renamed.js')
    );
    assert.notEqual(hashOutputTree(root).digest, initial.digest);

    fs.renameSync(
      path.join(root, 'chunks/renamed.js'),
      path.join(root, 'chunks/app.js')
    );
    fs.writeFileSync(path.join(root, 'extra.js'), 'extra');
    assert.notEqual(hashOutputTree(root).digest, initial.digest);

    fs.rmSync(path.join(root, 'extra.js'));
    fs.rmSync(path.join(root, 'chunks/app.js'));
    assert.notEqual(hashOutputTree(root).digest, initial.digest);
  } finally {
    fs.rmSync(root, { force: true, recursive: true });
  }
});

test('build manifest rejects any output-tree drift and ignores itself', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'plite-build-manifest-'));
  const manifestPath = path.join(root, '.manifest.json');
  const options = {
    inputDigest: 'input-a',
    manifestPath,
    outputRoot: root,
    version: 4,
  };

  try {
    fs.mkdirSync(path.join(root, 'routes'));
    fs.writeFileSync(path.join(root, 'routes/index.html'), 'route');
    fs.writeFileSync(
      manifestPath,
      `${JSON.stringify(createBuildManifest(options))}\n`
    );

    assert.equal(isBuildManifestFresh(options), true);

    fs.writeFileSync(
      manifestPath,
      `${JSON.stringify({
        ...JSON.parse(fs.readFileSync(manifestPath, 'utf8')),
        note: true,
      })}\n`
    );
    assert.equal(isBuildManifestFresh(options), true);

    fs.writeFileSync(path.join(root, 'routes/index.html'), 'ROUTE');
    assert.equal(isBuildManifestFresh(options), false);

    fs.writeFileSync(path.join(root, 'routes/index.html'), 'route');
    fs.writeFileSync(path.join(root, 'chunks.js'), 'chunk');
    assert.equal(isBuildManifestFresh(options), false);

    fs.rmSync(path.join(root, 'chunks.js'));
    fs.rmSync(path.join(root, 'routes/index.html'));
    assert.equal(isBuildManifestFresh(options), false);
  } finally {
    fs.rmSync(root, { force: true, recursive: true });
  }
});

test('proof identity changes with either inputs or built output', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'plite-identity-'));
  const manifestPath = path.join(root, '.manifest.json');

  try {
    fs.writeFileSync(path.join(root, 'index.js'), 'one');
    const first = createBuildManifest({
      inputDigest: 'input-a',
      manifestPath,
      outputRoot: root,
      version: 4,
    });
    const changedInput = createBuildManifest({
      inputDigest: 'input-b',
      manifestPath,
      outputRoot: root,
      version: 4,
    });

    fs.writeFileSync(path.join(root, 'index.js'), 'two');
    const changedOutput = createBuildManifest({
      inputDigest: 'input-a',
      manifestPath,
      outputRoot: root,
      version: 4,
    });

    assert.notEqual(changedInput.fingerprint, first.fingerprint);
    assert.notEqual(changedOutput.fingerprint, first.fingerprint);
  } finally {
    fs.rmSync(root, { force: true, recursive: true });
  }
});
