#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  appBuildEntries,
  appRoot,
  createBuildManifest,
  hashEntries,
  isBuildManifestFresh,
  repoRoot,
  snapshotEnvironmentByPrefix,
} from './plite-proof-inputs.mjs';
import { runBoundedProcess } from '../../../tooling/scripts/run-bounded-process.mjs';

const registryPath = path.join(
  repoRoot,
  'apps/www/src/app/(app)/examples/plite/plite-example-registry.ts'
);
const registrySource = fs.readFileSync(registryPath, 'utf8');
const definitionsSource = registrySource.match(
  /export const EXAMPLE_NAMES_AND_PATHS = \[(?<definitions>[\s\S]*?)\] as const/
)?.groups?.definitions;

if (!definitionsSource) {
  throw new Error('Cannot read Plite example definitions');
}

const examplePaths = [...definitionsSource.matchAll(/\['[^']+', '([^']+)'\]/g)]
  .map((match) => match[1])
  .filter(Boolean);

if (examplePaths.length === 0) {
  throw new Error('Plite example registry is empty');
}

const requiredOutputs = [
  path.join(appRoot, 'out/index.html'),
  path.join(appRoot, 'out/examples/plite.html'),
  ...examplePaths.map((examplePath) =>
    path.join(appRoot, `out/examples/plite/${examplePath}.html`)
  ),
];
const manifestPath = path.join(appRoot, 'out/.plite-proof-build.json');
const manifestVersion = 4;
const outputRoot = path.join(appRoot, 'out');

const outputsAreFresh = ({ environment, inputDigest }) => {
  if (environment.PLITE_PROOF_FORCE_BUILD === '1') {
    return false;
  }

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

export const buildAppIfStale = async ({
  environment = process.env,
  onProcessEnd,
  onProcessStart,
  timeoutMs = Number(
    environment.PLITE_BROWSER_BUILD_SETUP_TIMEOUT_MS ?? 600_000
  ),
} = {}) => {
  const buildEnvironment = snapshotEnvironmentByPrefix(
    'NEXT_PUBLIC_PLITE_YJS_',
    environment
  );
  const inputDigest = hashEntries(appBuildEntries, [
    'plite-proof-app-v4',
    JSON.stringify(buildEnvironment),
  ]);

  if (outputsAreFresh({ environment, inputDigest })) {
    console.log('plite proof app export is fresh');
    return 0;
  }

  const result = await runBoundedProcess({
    args: ['build'],
    command: 'pnpm',
    cwd: appRoot,
    env: environment,
    onProcessEnd,
    onProcessStart,
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
  process.exit(await buildAppIfStale());
}
