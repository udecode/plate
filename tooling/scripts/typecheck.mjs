#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getWorkspaceSourceEntries } from '../../config/workspace-source-entries.mjs';
import { entrypointDags } from '../entrypoints/entrypoint-dag.mjs';
import {
  getEntrypointTypecheckProjects,
  repoRoot,
} from '../entrypoints/entrypoint-turbo.mjs';
import { hasPrivateHalf } from './private-files.mjs';

const bunGenericAnyBug =
  'Bun reports assignability errors that tsc does not on generic editor types compared with `any` type arguments';

const tscReasons = new Map([
  ['packages/plitejs/tsconfig.entrypoints/tests.json', bunGenericAnyBug],
  ['packages/plitejs/test/react/tsconfig.json', bunGenericAnyBug],
]);

const handWrittenProjects = {
  '@platejs/cli': [
    {
      config: 'packages/cli/tsconfig.json',
      readsPrivateHalf: false,
      workspaceSource: true,
    },
  ],
  plitejs: [
    {
      config: 'packages/plitejs/test/react/tsconfig.json',
      readsPrivateHalf: true,
    },
    {
      config: 'packages/plitejs/scripts/tsconfig.json',
      readsPrivateHalf: true,
    },
  ],
};

const packageNamesInOrder = [...Object.keys(entrypointDags), '@platejs/cli'];

const packageProjects = (packageName) => [
  ...(packageName in entrypointDags
    ? getEntrypointTypecheckProjects(packageName)
    : []),
  ...(handWrittenProjects[packageName] ?? []),
];

const selectProjects = (packageNames, withPrivateHalf) => {
  const unknown = packageNames.filter(
    (name) => !packageNamesInOrder.includes(name)
  );

  if (unknown.length > 0) {
    throw new Error(
      `Unknown package ${unknown.join(', ')}. Usage: typecheck.mjs [${packageNamesInOrder.join('|')}]...`
    );
  }

  const selected = (
    packageNames.length > 0 ? packageNames : packageNamesInOrder
  ).flatMap(packageProjects);
  const laneOf = (project) => {
    if (project.readsPrivateHalf && !withPrivateHalf) return 'skipped';

    return tscReasons.has(project.config) ? 'tsc' : 'bun';
  };
  const inLane = (lane) =>
    selected.filter((project) => laneOf(project) === lane);

  return { bun: inLane('bun'), skipped: inLane('skipped'), tsc: inLane('tsc') };
};

const bunExecutable = path.join(repoRoot, 'node_modules/.bin/bun');
const tscExecutable = path.join(repoRoot, 'node_modules/.bin/tsc');

const perCheckoutCacheDirectory = path.join(
  repoRoot,
  'node_modules/.cache/plate-typecheck',
  createHash('sha256').update(repoRoot).digest('hex').slice(0, 12)
);

const writeGenerated = (name, contents) => {
  const file = path.join(perCheckoutCacheDirectory, name);
  const partial = `${file}.${process.pid}`;

  fs.writeFileSync(partial, `${JSON.stringify(contents, null, 2)}\n`);
  fs.renameSync(partial, file);

  return file;
};

const generatedName = (config) => config.replaceAll(/[\\/]/gu, '__');

const assertBunMatchesTypescript = () => {
  const bunVersions = spawnSync(
    bunExecutable,
    [
      '--print',
      'JSON.stringify([Bun.version, process.versions.typescript ?? null])',
    ],
    { cwd: repoRoot, encoding: 'utf-8' }
  );

  if (bunVersions.error) throw bunVersions.error;
  if (bunVersions.status !== 0) {
    throw new Error(`bun --print failed: ${bunVersions.stderr}`);
  }

  const [bunVersion, bunTypescript] = JSON.parse(bunVersions.stdout);
  const { devDependencies } = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf-8')
  );

  if (bunVersion !== devDependencies.bun) {
    throw new Error(
      `This checkout installed Bun ${bunVersion}, but package.json pins bun ${devDependencies.bun}. Run pnpm install.`
    );
  }

  const { version: typescriptVersion } = JSON.parse(
    fs.readFileSync(
      path.join(repoRoot, 'node_modules/typescript/package.json'),
      'utf-8'
    )
  );

  if (bunTypescript !== typescriptVersion) {
    throw new Error(
      `Bun ${bunVersion} checks types with TypeScript ${bunTypescript ?? 'none'}, but the repository pins TypeScript ${typescriptVersion}. Move the bun and typescript pins in package.json together, then run pnpm install.`
    );
  }
};

const readConfig = (config) =>
  JSON.parse(fs.readFileSync(path.join(repoRoot, config), 'utf-8'));

const workspaceSourceConfig = (config) => {
  const packageRoot = path.dirname(path.join(repoRoot, config));
  const localPaths = Object.fromEntries(
    Object.entries(readConfig(config).compilerOptions?.paths ?? {}).map(
      ([specifier, targets]) => [
        specifier,
        targets.map((target) => path.resolve(packageRoot, target)),
      ]
    )
  );
  const workspacePaths = Object.fromEntries(
    getWorkspaceSourceEntries(repoRoot).map(({ sourceEntry, specifier }) => [
      specifier,
      [sourceEntry],
    ])
  );

  return writeGenerated(`source-${generatedName(config)}`, {
    compilerOptions: { paths: { ...localPaths, ...workspacePaths } },
    extends: path.join(repoRoot, config),
  });
};

// tsc --project reads a referenced project's declarations, which nothing
// builds. A config that only extends the project has no references, so tsc
// checks their source instead.
const sourceOnlyConfig = (config) =>
  readConfig(config).references
    ? writeGenerated(`tsc-${generatedName(config)}`, {
        extends: path.join(repoRoot, config),
      })
    : path.join(repoRoot, config);

const solutionConfig = (packageNames, bunProjects) =>
  writeGenerated(
    `bun-${packageNames.join('+').replaceAll(/[\\/@]/gu, '_') || 'all'}.json`,
    {
      files: [],
      references: bunProjects.map(({ config, workspaceSource }) => ({
        path: workspaceSource
          ? workspaceSourceConfig(config)
          : path.join(repoRoot, config),
      })),
    }
  );

const run = (label, executable, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(executable, args, { cwd: repoRoot, stdio: 'inherit' });

    child.once('error', reject);
    child.once('close', (status) => resolve({ label, status }));
  });

const main = async (packageNames) => {
  const projects = selectProjects(packageNames, hasPrivateHalf(repoRoot));

  assertBunMatchesTypescript();
  fs.mkdirSync(perCheckoutCacheDirectory, { recursive: true });

  // bun check -b reads a referenced partition's built declarations whenever
  // its outDir holds them, even after the partition's source changed. Nothing
  // writes them any more, so leftovers from older checkouts are stale.
  for (const definition of Object.values(entrypointDags)) {
    fs.rmSync(
      path.join(repoRoot, definition.packageRoot, '.turbo/entrypoint-types'),
      { force: true, recursive: true }
    );
  }

  for (const { config } of projects.skipped) {
    console.info(`skip ${config}: it reads udecode/plate-private's files`);
  }

  const runs = projects.tsc.map(({ config }) => {
    console.info(`tsc checks ${config}: ${tscReasons.get(config)}`);

    return run(`tsc ${config}`, tscExecutable, [
      '--project',
      sourceOnlyConfig(config),
      '--pretty',
      'false',
    ]);
  });

  if (projects.bun.length > 0) {
    runs.push(
      run(`bun check of ${projects.bun.length} projects`, bunExecutable, [
        'check',
        // The root package.json has a check script, which bun check would run.
        '--no-script',
        '-b',
        '-p',
        solutionConfig(packageNames, projects.bun),
        '--no-pretty',
      ])
    );
  }

  const results = await Promise.all(runs);
  const failed = results.filter(({ status }) => status !== 0);

  for (const { label, status } of failed) {
    console.error(`typecheck failed: ${label} exited ${status}`);
  }

  return failed.length > 0 ? 1 : 0;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    process.exit(await main(process.argv.slice(2)));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
