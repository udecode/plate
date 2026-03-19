#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const templateDirArgs = process.argv.slice(2);

if (templateDirArgs.includes('-h') || templateDirArgs.includes('--help')) {
  console.log(
    'Usage: node tooling/scripts/prepare-local-template-packages.mjs <template-dir> [template-dir...]'
  );
  process.exit(0);
}

if (templateDirArgs.length === 0) {
  console.error(
    'Usage: node tooling/scripts/prepare-local-template-packages.mjs <template-dir> [template-dir...]'
  );
  process.exit(1);
}

const templateDirs = templateDirArgs.map((templateDir) =>
  path.resolve(repoRoot, templateDir)
);
const localPackageOutputDir = path.join(
  repoRoot,
  'node_modules',
  '.cache',
  'template-local-packages'
);
const workspacePackages = await getWorkspacePackages();
const templateConfigs = await Promise.all(
  templateDirs.map(async (templateDir) => {
    const packageJsonPath = path.join(templateDir, 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    const localDependencies = getLocalDependencies(packageJson);

    return {
      localDependencies,
      packageJson,
      packageJsonPath,
      templateDir,
    };
  })
);
const packagesToPrepare = new Map();

for (const templateConfig of templateConfigs) {
  for (const dependencyName of templateConfig.localDependencies) {
    const workspacePackage = workspacePackages.get(dependencyName);

    if (!workspacePackage) continue;

    packagesToPrepare.set(dependencyName, workspacePackage);
  }
}

if (packagesToPrepare.size === 0) {
  console.log('No local workspace packages referenced by templates.');
  process.exit(0);
}

await mkdir(localPackageOutputDir, { recursive: true });

buildWorkspacePackages([...packagesToPrepare.values()]);

const tarballsByPackageName = new Map();

for (const [packageName, workspacePackage] of packagesToPrepare) {
  const tarballPath = packWorkspacePackage(workspacePackage.directory);

  tarballsByPackageName.set(packageName, tarballPath);
}

await Promise.all(
  templateConfigs.map((templateConfig) =>
    rewriteTemplatePackageJson(templateConfig, tarballsByPackageName)
  )
);

function buildWorkspacePackages(workspacePackagesToBuild) {
  const filters = workspacePackagesToBuild
    .map((workspacePackage) => {
      const relativeDirectory = path.relative(
        repoRoot,
        workspacePackage.directory
      );

      return `--filter=./${toPosixPath(relativeDirectory)}`;
    })
    .sort();
  const result = spawnSync('pnpm', ['turbo', 'build', ...filters], {
    cwd: repoRoot,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function getLocalDependencies(packageJson) {
  const dependencyNames = new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
  ]);

  return [...dependencyNames].filter((dependencyName) =>
    workspacePackages.has(dependencyName)
  );
}

async function getWorkspacePackages() {
  const workspacePackageDirectories = [
    path.join(repoRoot, 'packages'),
    path.join(repoRoot, 'packages', 'udecode'),
  ];
  const workspacePackagesByName = new Map();

  for (const workspacePackageDirectory of workspacePackageDirectories) {
    for (const directoryEntry of await listDirectories(
      workspacePackageDirectory
    )) {
      const packageJsonPath = path.join(directoryEntry, 'package.json');
      const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

      workspacePackagesByName.set(packageJson.name, {
        directory: directoryEntry,
      });
    }
  }

  return workspacePackagesByName;
}

async function listDirectories(parentDirectory) {
  const directoryEntries = await readdir(parentDirectory, {
    withFileTypes: true,
  });
  const directories = [];

  for (const directoryEntry of directoryEntries) {
    if (!directoryEntry.isDirectory()) continue;

    const directoryPath = path.join(parentDirectory, directoryEntry.name);

    try {
      await access(path.join(directoryPath, 'package.json'));
      directories.push(directoryPath);
    } catch {}
  }

  return directories;
}

function packWorkspacePackage(packageDirectory) {
  const result = spawnSync(
    'pnpm',
    ['pack', '--pack-destination', localPackageOutputDir],
    {
      cwd: packageDirectory,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
    }
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  const tarballPath = result.stdout.trim().split('\n').at(-1)?.trim();

  if (!tarballPath) {
    console.error(`Failed to determine tarball path for ${packageDirectory}`);
    process.exit(1);
  }

  return tarballPath;
}

function rewriteTemplatePackageJson(templateConfig, tarballsByPackageName) {
  const { packageJson, packageJsonPath, templateDir } = templateConfig;
  const dependencySections = ['dependencies', 'devDependencies'];

  for (const section of dependencySections) {
    const dependencies = packageJson[section];

    if (!dependencies) continue;

    for (const dependencyName of Object.keys(dependencies)) {
      const tarballPath = tarballsByPackageName.get(dependencyName);

      if (!tarballPath) continue;

      let relativeTarballPath = path.relative(templateDir, tarballPath);

      if (!relativeTarballPath.startsWith('.')) {
        relativeTarballPath = `./${relativeTarballPath}`;
      }

      dependencies[dependencyName] = `file:${toPosixPath(relativeTarballPath)}`;
    }
  }

  return writeFile(
    packageJsonPath,
    `${JSON.stringify(packageJson, null, 2)}\n`
  );
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}
