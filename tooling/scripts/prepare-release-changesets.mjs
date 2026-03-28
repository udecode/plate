#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import {
  access,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const changesetDir = path.join(repoRoot, '.changeset');
const autoChangesetFilenamePrefix = 'auto-runtime-dependent-';
const legacyAutoChangesetFilename = 'auto-runtime-dependents.md';
const statusOutputPath = path.join(
  repoRoot,
  '.tmp',
  'prepare-release-changesets-status.json'
);
const scopePrefixPattern = /^@/;

if (isMainModule()) {
  await main();
}

async function main() {
  await mkdir(path.dirname(statusOutputPath), { recursive: true });

  const workspacePackages = await getWorkspacePackages();
  const manualChangesetPaths = await getManualChangesetPaths();

  if (manualChangesetPaths.length === 0) {
    await cleanupAutoChangesets();
    console.log(
      'No pending manual changesets. Skipping auto release changeset.'
    );
    return;
  }

  const status = getChangesetStatus();
  const autoReleasePackages = getAutoReleasePackages(
    status.releases,
    workspacePackages
  );

  if (autoReleasePackages.length === 0) {
    await cleanupAutoChangesets();
    console.log(
      'No runtime dependents require an automated release changeset.'
    );
    return;
  }

  await syncAutoChangesets(autoReleasePackages);

  console.log(
    `Created auto release changeset for: ${autoReleasePackages.map((pkg) => pkg.name).join(', ')}`
  );
}

function isMainModule() {
  const entrypoint = process.argv[1];

  return (
    !!entrypoint && path.resolve(entrypoint) === fileURLToPath(import.meta.url)
  );
}

export function getAutoReleasePackages(releases, workspacePackages) {
  const releasedPackageNames = new Set(
    releases
      .filter((release) => release.type !== 'none')
      .map((release) => release.name)
  );
  const autoReleasePackageNames = new Set();
  const queue = [...releasedPackageNames];

  while (queue.length > 0) {
    const dependencyName = queue.shift();

    for (const dependentName of workspacePackages.get(dependencyName)
      ?.runtimeDependentNames ?? []) {
      if (
        releasedPackageNames.has(dependentName) ||
        autoReleasePackageNames.has(dependentName)
      ) {
        continue;
      }

      autoReleasePackageNames.add(dependentName);
      queue.push(dependentName);
    }
  }

  const versionedPackageNames = new Set([
    ...releasedPackageNames,
    ...autoReleasePackageNames,
  ]);

  return [...autoReleasePackageNames].sort().map((packageName) => ({
    name: packageName,
    updatedDependencyNames: workspacePackages
      .get(packageName)
      ?.runtimeDependencyNames.filter((dependencyName) =>
        versionedPackageNames.has(dependencyName)
      )
      .sort(),
  }));
}

export function createAutoChangesetContent(
  packageName,
  updatedDependencyNames
) {
  return `---\n"${packageName}": patch\n---\n\nUpdated ${updatedDependencyNames
    .map((dependencyName) => `\`${dependencyName}\``)
    .join(', ')}.\n`;
}

async function getWorkspacePackages() {
  const workspacePackageDirectories = [
    path.join(repoRoot, 'packages'),
    path.join(repoRoot, 'packages', 'udecode'),
  ];
  const workspacePackages = new Map();

  for (const workspacePackageDirectory of workspacePackageDirectories) {
    for (const packageDirectory of await listDirectories(
      workspacePackageDirectory
    )) {
      const packageJsonPath = path.join(packageDirectory, 'package.json');
      const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

      workspacePackages.set(packageJson.name, {
        packageJson,
        runtimeDependencyNames: [],
        runtimeDependentNames: [],
      });
    }
  }

  for (const workspacePackage of workspacePackages.values()) {
    workspacePackage.runtimeDependencyNames = Object.entries(
      workspacePackage.packageJson.dependencies ?? {}
    )
      .filter(
        ([dependencyName, version]) =>
          workspacePackages.has(dependencyName) &&
          typeof version === 'string' &&
          version.startsWith('workspace:')
      )
      .map(([dependencyName]) => dependencyName);
  }

  for (const [packageName, workspacePackage] of workspacePackages) {
    for (const dependencyName of workspacePackage.runtimeDependencyNames) {
      workspacePackages
        .get(dependencyName)
        ?.runtimeDependentNames.push(packageName);
    }
  }

  return workspacePackages;
}

async function getManualChangesetPaths() {
  const entries = await readdir(changesetDir, { withFileTypes: true });

  return entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith('.md') &&
        entry.name !== 'README.md' &&
        entry.name !== legacyAutoChangesetFilename &&
        !entry.name.startsWith(autoChangesetFilenamePrefix)
    )
    .map((entry) => path.join(changesetDir, entry.name))
    .toSorted();
}

function getChangesetStatus() {
  const result = spawnSync(
    'pnpm',
    ['exec', 'changeset', 'status', `--output=${statusOutputPath}`],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        CI: process.env.CI || '1',
      },
    }
  );

  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }

  return JSON.parse(result.stdout || readFileSyncUtf8(statusOutputPath));
}

async function listDirectories(parentDirectory) {
  const entries = await readdir(parentDirectory, { withFileTypes: true });
  const directories = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const directoryPath = path.join(parentDirectory, entry.name);

    try {
      await access(path.join(directoryPath, 'package.json'));
      directories.push(directoryPath);
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }

  return directories;
}

async function cleanupAutoChangesets() {
  for (const filePath of await getExistingAutoChangesetPaths()) {
    await rm(filePath);
  }
}

async function getExistingAutoChangesetPaths() {
  const entries = await readdir(changesetDir, { withFileTypes: true });

  return entries
    .filter(
      (entry) =>
        entry.isFile() &&
        (entry.name === legacyAutoChangesetFilename ||
          entry.name.startsWith(autoChangesetFilenamePrefix))
    )
    .map((entry) => path.join(changesetDir, entry.name))
    .toSorted();
}

async function syncAutoChangesets(autoReleasePackages) {
  const desiredEntries = autoReleasePackages.map((autoReleasePackage) => ({
    content: createAutoChangesetContent(
      autoReleasePackage.name,
      autoReleasePackage.updatedDependencyNames
    ),
    filePath: path.join(
      changesetDir,
      `${autoChangesetFilenamePrefix}${sanitizePackageName(autoReleasePackage.name)}.md`
    ),
  }));
  const desiredPaths = new Set(desiredEntries.map((entry) => entry.filePath));

  for (const filePath of await getExistingAutoChangesetPaths()) {
    if (!desiredPaths.has(filePath)) {
      await rm(filePath);
    }
  }

  for (const entry of desiredEntries) {
    const existingContent = await readOptionalFile(entry.filePath);

    if (existingContent === entry.content) continue;

    await writeFile(entry.filePath, entry.content);
  }
}

async function readOptionalFile(filePath) {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

function sanitizePackageName(packageName) {
  return packageName.replace(scopePrefixPattern, '').replaceAll('/', '-');
}

export { autoChangesetFilenamePrefix };

function readFileSyncUtf8(filePath) {
  return readFileSync(filePath, 'utf8');
}
