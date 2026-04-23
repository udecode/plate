#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const localPackageOutputDir = path.join(
  repoRoot,
  'node_modules',
  '.cache',
  'template-local-packages'
);

if (isMainModule()) {
  await main();
}

async function main() {
  const baseRef = process.env.TEMPLATE_LOCAL_PACKAGE_BASE_REF?.trim();
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
  const workspacePackages = await getWorkspacePackages();
  const templateConfigs = await Promise.all(
    templateDirs.map(async (templateDir) => {
      const packageJsonPath = path.join(templateDir, 'package.json');
      const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
      const localDependencies = getLocalDependencies(
        packageJson,
        workspacePackages
      );

      return {
        localDependencies,
        packageJson,
        packageJsonPath,
        templateDir,
      };
    })
  );

  for (const templateConfig of templateConfigs) {
    templateConfig.relevantPackageNames = getReachableWorkspacePackageNames(
      templateConfig.localDependencies,
      workspacePackages
    );
  }

  const packagesToPrepare = getPackagesToPrepare({
    baseRef,
    templateConfigs,
    workspacePackages,
  });

  if (packagesToPrepare.size === 0) {
    if (baseRef) {
      console.log(
        `No affected local workspace packages referenced by templates for ${baseRef}...HEAD.`
      );
    } else {
      console.log('No local workspace packages referenced by templates.');
    }
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
}

function isMainModule() {
  const entrypoint = process.argv[1];

  return (
    !!entrypoint && path.resolve(entrypoint) === fileURLToPath(import.meta.url)
  );
}

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

function getPackagesToPrepare({ baseRef, templateConfigs, workspacePackages }) {
  const packagesToPrepare = new Map();
  const dependencyNames = new Set(
    templateConfigs.flatMap(
      (templateConfig) => templateConfig.localDependencies
    )
  );

  if (!baseRef) {
    for (const dependencyName of dependencyNames) {
      const workspacePackage = workspacePackages.get(dependencyName);

      if (!workspacePackage) continue;

      packagesToPrepare.set(dependencyName, workspacePackage);
    }

    return packagesToPrepare;
  }

  const changedPackageNames = getChangedWorkspacePackageNames(
    baseRef,
    workspacePackages
  );

  if (changedPackageNames.size === 0) {
    return packagesToPrepare;
  }

  const relevantPackageNames = new Set(
    templateConfigs.flatMap((templateConfig) => [
      ...templateConfig.relevantPackageNames,
    ])
  );
  const selectedPackageNames = [
    ...getAffectedRelevantPackageNames(
      changedPackageNames,
      relevantPackageNames,
      workspacePackages
    ),
  ];

  if (selectedPackageNames.length === 0) {
    return packagesToPrepare;
  }

  console.log(
    `Changed workspace packages for ${baseRef}...HEAD: ${[
      ...changedPackageNames,
    ]
      .sort()
      .join(', ')}`
  );
  console.log(
    `Selected workspace packages for templates: ${selectedPackageNames
      .toSorted()
      .join(', ')}`
  );

  for (const packageName of selectedPackageNames) {
    const workspacePackage = workspacePackages.get(packageName);

    if (!workspacePackage) continue;

    packagesToPrepare.set(packageName, workspacePackage);
  }

  return packagesToPrepare;
}

function getLocalDependencies(packageJson, workspacePackages) {
  return getDependencyNames(packageJson).filter((dependencyName) =>
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
        packageJson,
        relativeDirectory: toPosixPath(path.relative(repoRoot, directoryEntry)),
      });
    }
  }

  for (const workspacePackage of workspacePackagesByName.values()) {
    workspacePackage.localDependencyNames = getDependencyNames(
      workspacePackage.packageJson
    ).filter((dependencyName) => workspacePackagesByName.has(dependencyName));
    workspacePackage.localDependentNames = [];
  }

  for (const [packageName, workspacePackage] of workspacePackagesByName) {
    for (const dependencyName of workspacePackage.localDependencyNames) {
      workspacePackagesByName
        .get(dependencyName)
        ?.localDependentNames.push(packageName);
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

function getChangedWorkspacePackageNames(baseRef, workspacePackages) {
  const result = spawnSync(
    'git',
    ['diff', '--name-only', `${baseRef}...HEAD`],
    {
      cwd: repoRoot,
      encoding: 'utf8',
    }
  );

  if (result.status !== 0) {
    console.error(
      `Failed to determine changed workspace packages for ${baseRef}...HEAD`
    );
    process.exit(result.status ?? 1);
  }

  const changedFiles = result.stdout
    .split('\n')
    .map((filePath) => filePath.trim())
    .filter(Boolean);
  const changedPackageNames = new Set();

  for (const changedFile of changedFiles) {
    for (const [packageName, workspacePackage] of workspacePackages) {
      const packagePrefix = `${workspacePackage.relativeDirectory}/`;

      if (changedFile.startsWith(packagePrefix)) {
        changedPackageNames.add(packageName);
      }
    }
  }

  return changedPackageNames;
}

function getReachableWorkspacePackageNames(
  initialPackageNames,
  workspacePackages
) {
  const relevantPackageNames = new Set();
  const pendingPackageNames = [...initialPackageNames];

  while (pendingPackageNames.length > 0) {
    const packageName = pendingPackageNames.shift();

    if (!packageName || relevantPackageNames.has(packageName)) continue;

    relevantPackageNames.add(packageName);

    const workspacePackage = workspacePackages.get(packageName);

    if (!workspacePackage) continue;

    pendingPackageNames.push(...workspacePackage.localDependencyNames);
  }

  return relevantPackageNames;
}

function getAffectedRelevantPackageNames(
  changedPackageNames,
  relevantPackageNames,
  workspacePackages
) {
  const affectedPackageNames = new Set();
  const pendingPackageNames = [...changedPackageNames].filter((packageName) =>
    relevantPackageNames.has(packageName)
  );

  while (pendingPackageNames.length > 0) {
    const packageName = pendingPackageNames.shift();

    if (!packageName || affectedPackageNames.has(packageName)) continue;

    affectedPackageNames.add(packageName);

    for (const dependentName of workspacePackages.get(packageName)
      ?.localDependentNames ?? []) {
      if (!relevantPackageNames.has(dependentName)) continue;

      pendingPackageNames.push(dependentName);
    }
  }

  return affectedPackageNames;
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

function getDependencyNames(packageJson) {
  const dependencyNames = new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
    ...Object.keys(packageJson.optionalDependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
  ]);

  return [...dependencyNames];
}

function rewriteTemplatePackageJson(templateConfig, tarballsByPackageName) {
  const { packageJson, packageJsonPath, relevantPackageNames, templateDir } =
    templateConfig;
  const dependencySections = ['dependencies', 'devDependencies'];
  const rewrittenPackageNames = new Set();

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
      rewrittenPackageNames.add(dependencyName);
    }
  }

  const missingDependencyNames = [...tarballsByPackageName.keys()].filter(
    (dependencyName) =>
      relevantPackageNames.has(dependencyName) &&
      !rewrittenPackageNames.has(dependencyName)
  );

  if (missingDependencyNames.length > 0) {
    packageJson.devDependencies ??= {};

    for (const dependencyName of missingDependencyNames.toSorted()) {
      const tarballPath = tarballsByPackageName.get(dependencyName);

      if (!tarballPath) continue;

      let relativeTarballPath = path.relative(templateDir, tarballPath);

      if (!relativeTarballPath.startsWith('.')) {
        relativeTarballPath = `./${relativeTarballPath}`;
      }

      packageJson.devDependencies[dependencyName] =
        `file:${toPosixPath(relativeTarballPath)}`;
    }
  }

  if (tarballsByPackageName.size > 0) {
    packageJson.overrides ??= {};

    for (const [dependencyName, tarballPath] of tarballsByPackageName) {
      let relativeTarballPath = path.relative(templateDir, tarballPath);

      if (!relativeTarballPath.startsWith('.')) {
        relativeTarballPath = `./${relativeTarballPath}`;
      }

      packageJson.overrides[dependencyName] =
        `file:${toPosixPath(relativeTarballPath)}`;
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

export {
  getAffectedRelevantPackageNames,
  getPackagesToPrepare,
  getReachableWorkspacePackageNames,
  rewriteTemplatePackageJson,
};
