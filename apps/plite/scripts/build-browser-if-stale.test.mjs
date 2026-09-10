import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..'
);

test('reuses a complete build of the published browser helper entrypoints', async (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'plite-browser-build-'));
  context.after(() => fs.rmSync(root, { force: true, recursive: true }));

  for (const name of [
    'apps/plite/scripts/build-browser-if-stale.mjs',
    'apps/plite/scripts/plite-proof-inputs.mjs',
    'tooling/scripts/run-bounded-process.mjs',
    'packages/test/package.json',
  ]) {
    const destination = path.join(root, name);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(repoRoot, name), destination);
  }

  const packageRoot = path.join(root, 'packages/test');
  const definition = JSON.parse(
    fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf-8')
  );
  for (const subpath of ['.', './browser', './playwright']) {
    for (const condition of ['types', 'import']) {
      const output = path.join(
        packageRoot,
        definition.exports[subpath][condition]
      );
      fs.mkdirSync(path.dirname(output), { recursive: true });
      fs.writeFileSync(output, 'export {};\n');
    }
  }

  const { inspectBrowserBuild, buildBrowserIfStale } = await import(
    pathToFileURL(
      path.join(root, 'apps/plite/scripts/build-browser-if-stale.mjs')
    ).href
  );
  const { createBuildManifest } = await import(
    pathToFileURL(path.join(root, 'apps/plite/scripts/plite-proof-inputs.mjs'))
      .href
  );
  const environment = {};
  const outputRoot = path.join(packageRoot, 'dist');
  const manifestPath = path.join(outputRoot, '.plite-browser-build.json');
  const { inputDigest } = inspectBrowserBuild(environment);
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      createBuildManifest({
        inputDigest,
        manifestPath,
        outputRoot,
        version: 4,
      })
    )
  );
  const manifest = fs.readFileSync(manifestPath, 'utf-8');
  const entry = path.join(outputRoot, 'playwright/index.js');
  const entryMtime = fs.statSync(entry).mtimeMs;

  assert.equal(inspectBrowserBuild(environment).fresh, true);
  assert.equal(await buildBrowserIfStale({ environment }), 0);
  assert.equal(fs.readFileSync(manifestPath, 'utf-8'), manifest);
  assert.equal(fs.statSync(entry).mtimeMs, entryMtime);

  fs.writeFileSync(entry, 'export const changed = true;\n');
  assert.equal(inspectBrowserBuild(environment).fresh, false);
  fs.rmSync(entry);
  assert.equal(inspectBrowserBuild(environment).fresh, false);
});
