#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const artifactRoot = path.dirname(fileURLToPath(import.meta.url));
const priorRoot = path.resolve(
  artifactRoot,
  '../multi-editor-full-architecture-audit'
);

const generators = [
  {
    input: 'plite-build-manifest.mjs',
    output: 'live-plite-source-manifest.json',
  },
  {
    input: 'plate-build-manifest.mjs',
    output: 'live-plate-coverage-manifest.json',
  },
];

for (const { input, output } of generators) {
  const sourcePath = path.join(priorRoot, input);
  const generatedPath = path.join(artifactRoot, `current-${input}`);
  const source = fs
    .readFileSync(sourcePath, 'utf8')
    .replace(
      /(['"])plite-source-manifest\.json\1/g,
      `'live-plite-source-manifest.json'`
    )
    .replace(
      /(['"])plate-coverage-manifest\.json\1/g,
      `'live-plate-coverage-manifest.json'`
    )
    .replace(
      'paths.reduce(',
      'paths.filter((file) => fs.existsSync(path.join(root, file))).reduce('
    )
    .replaceAll(
      'packages/utils/src/lib/plugins/single-block/SingleBlockPlugin.ts',
      'packages/utils/src/lib/plugins/SingleBlockPlugin.ts'
    )
    .replaceAll(
      'packages/utils/src/lib/plugins/single-block/SingleLinePlugin.ts',
      'packages/utils/src/lib/plugins/SingleLinePlugin.ts'
    )
    .replaceAll(
      'packages/utils/src/lib/plugins/trailing-block/TrailingBlockPlugin.ts',
      'packages/utils/src/lib/plugins/TrailingBlockPlugin.ts'
    )
    .replaceAll(
      'packages/utils/src/lib/plugins/normalize-types/NormalizeTypesPlugin.ts',
      'packages/utils/src/lib/plugins/NormalizeTypesPlugin.ts'
    );

  fs.writeFileSync(generatedPath, source);
  try {
    await import(`${pathToFileURL(generatedPath).href}?output=${output}`);
  } finally {
    fs.rmSync(generatedPath, { force: true });
  }
}
