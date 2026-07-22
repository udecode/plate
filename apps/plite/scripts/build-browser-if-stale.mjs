import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  browserBuildEntries,
  createBuildManifest,
  hashEntries,
  isBuildManifestFresh,
  repoRoot,
  snapshotEnvironment,
} from './plite-proof-inputs.mjs';
import { runBoundedProcess } from '../../../tooling/scripts/run-bounded-process.mjs';

const browserRoot = path.join(repoRoot, 'packages/browser');

const requiredOutputs = [
  'core/index.js',
  'core/index.d.ts',
  'browser/index.js',
  'browser/index.d.ts',
  'playwright/index.js',
  'playwright/index.d.ts',
].map((outputPath) => path.join(browserRoot, 'dist', outputPath));
const manifestPath = path.join(browserRoot, 'dist/.plite-browser-build.json');
const manifestVersion = 4;
const outputRoot = path.join(browserRoot, 'dist');

const outputsAreFresh = ({ inputDigest }) => {
  if (requiredOutputs.some((outputPath) => !fs.existsSync(outputPath))) {
    return false;
  }

  return isBuildManifestFresh({
    inputDigest,
    manifestPath,
    outputRoot,
    version: manifestVersion,
  });
};

export const buildBrowserIfStale = async ({
  environment = process.env,
  timeoutMs = Number(environment.PLITE_BROWSER_BUILD_TIMEOUT_MS ?? 600_000),
} = {}) => {
  const buildEnvironment = snapshotEnvironment(['CI'], environment);
  const inputDigest = hashEntries(browserBuildEntries, [
    'plite-browser-build-v4',
    JSON.stringify(buildEnvironment),
  ]);

  if (outputsAreFresh({ inputDigest })) {
    console.log('@platejs/browser dist is fresh');
    return 0;
  }

  const result = await runBoundedProcess({
    args: ['--filter', '@platejs/browser', 'build'],
    command: 'pnpm',
    cwd: repoRoot,
    env: environment,
    timeoutMs,
  });

  if (result.status === 0) {
    const manifest = createBuildManifest({
      inputDigest,
      manifestPath,
      outputRoot,
      version: manifestVersion,
    });

    fs.writeFileSync(
      manifestPath,
      `${JSON.stringify(
        {
          ...manifest,
          environmentKeys: Object.keys(buildEnvironment),
        },
        null,
        2
      )}\n`
    );
  }

  return result.status;
};

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  process.exit(await buildBrowserIfStale());
}
