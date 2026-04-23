#!/usr/bin/env node

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildWorkspacePackages,
  getChangedWorkspacePackageNames,
  getWorkspacePackages,
  localPackageOutputDir,
  packWorkspacePackage,
} from './prepare-local-template-packages.mjs';

const [sourceDir, targetDir] = process.argv.slice(2);
const scopedPackageNamePattern = /^(@[^/]+\/[^@/]+)(?:@.+)?$/;

if (isMainModule()) {
  if (!sourceDir || !targetDir) {
    console.error(
      'Usage: node tooling/scripts/prepare-local-template-registry.mjs <sourceDir> <targetDir>'
    );
    process.exit(1);
  }

  await main(sourceDir, targetDir);
}

async function main(sourceDir, targetDir) {
  const sourcePath = path.resolve(sourceDir);
  const targetPath = path.resolve(targetDir);
  const baseRef = process.env.TEMPLATE_LOCAL_PACKAGE_BASE_REF?.trim();
  const registryItems = await readRegistryItems(sourcePath, targetPath);
  const tarballsByPackageName = await prepareLocalRegistryPackageTarballs(
    registryItems.map((item) => item.parsed),
    baseRef
  );

  await mkdir(targetPath, { recursive: true });

  for (const { parsed, to } of registryItems) {
    rewriteRegistryDependencies(parsed);
    rewriteRegistryPackageDependencies(parsed, tarballsByPackageName);

    await writeFile(to, `${JSON.stringify(parsed, null, 2)}\n`);
  }
}

function isMainModule() {
  const entrypoint = process.argv[1];

  return (
    !!entrypoint && path.resolve(entrypoint) === fileURLToPath(import.meta.url)
  );
}

async function readRegistryItems(sourcePath, targetPath) {
  const registryItems = [];

  for (const entry of await readdir(sourcePath, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;

    const from = path.join(sourcePath, entry.name);
    const to = path.join(targetPath, entry.name);
    const content = await readFile(from, 'utf8');

    registryItems.push({
      parsed: JSON.parse(content),
      to,
    });
  }

  return registryItems;
}

async function prepareLocalRegistryPackageTarballs(registryItems, baseRef) {
  if (!baseRef) {
    return new Map();
  }

  const workspacePackages = await getWorkspacePackages();
  const registryPackageNames = collectRegistryDependencyPackageNames(
    registryItems,
    workspacePackages
  );
  const changedPackageNames = getChangedWorkspacePackageNames(
    baseRef,
    workspacePackages
  );
  const packageNamesToPrepare = [...registryPackageNames]
    .filter((packageName) => changedPackageNames.has(packageName))
    .sort();

  if (packageNamesToPrepare.length === 0) {
    return new Map();
  }

  console.log(
    `Preparing local registry package dependencies for ${baseRef}...HEAD: ${packageNamesToPrepare.join(', ')}`
  );

  await mkdir(localPackageOutputDir, { recursive: true });

  const packagesToBuild = packageNamesToPrepare
    .map((packageName) => workspacePackages.get(packageName))
    .filter(Boolean);

  buildWorkspacePackages(packagesToBuild);

  return new Map(
    packageNamesToPrepare.map((packageName) => [
      packageName,
      packWorkspacePackage(workspacePackages.get(packageName).directory),
    ])
  );
}

function collectRegistryDependencyPackageNames(
  registryItems,
  workspacePackages
) {
  const packageNames = new Set();

  for (const registryItem of registryItems) {
    collectRegistryDependencyPackageNamesFromValue(
      registryItem,
      workspacePackages,
      packageNames
    );
  }

  return packageNames;
}

function collectRegistryDependencyPackageNamesFromValue(
  value,
  workspacePackages,
  packageNames
) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectRegistryDependencyPackageNamesFromValue(
        item,
        workspacePackages,
        packageNames
      );
    }
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value.dependencies)) {
    for (const dependency of value.dependencies) {
      const packageName = getDependencyPackageName(dependency);

      if (packageName && workspacePackages.has(packageName)) {
        packageNames.add(packageName);
      }
    }
  }

  for (const entry of Object.values(value)) {
    collectRegistryDependencyPackageNamesFromValue(
      entry,
      workspacePackages,
      packageNames
    );
  }
}

function rewriteRegistryDependencies(value) {
  if (Array.isArray(value)) {
    for (const item of value) {
      rewriteRegistryDependencies(item);
    }
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value.registryDependencies)) {
    value.registryDependencies = value.registryDependencies.map((dependency) =>
      toLocalDependency(dependency)
    );
  }

  for (const entry of Object.values(value)) {
    rewriteRegistryDependencies(entry);
  }
}

function rewriteRegistryPackageDependencies(value, tarballsByPackageName) {
  if (Array.isArray(value)) {
    for (const item of value) {
      rewriteRegistryPackageDependencies(item, tarballsByPackageName);
    }
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value.dependencies)) {
    value.dependencies = value.dependencies.map((dependency) => {
      const packageName = getDependencyPackageName(dependency);
      const tarballPath = packageName
        ? tarballsByPackageName.get(packageName)
        : undefined;

      if (!packageName || !tarballPath) {
        return dependency;
      }

      return `${packageName}@file:${tarballPath}`;
    });
  }

  for (const entry of Object.values(value)) {
    rewriteRegistryPackageDependencies(entry, tarballsByPackageName);
  }
}

function toLocalDependency(dependency) {
  if (typeof dependency !== 'string') return dependency;

  try {
    const url = new URL(dependency);

    if (
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1') &&
      url.pathname.endsWith('.json')
    ) {
      return path.basename(url.pathname);
    }

    return dependency;
  } catch {
    return dependency;
  }
}

function getDependencyPackageName(dependency) {
  if (typeof dependency !== 'string') return null;
  if (dependency.startsWith('file:')) return null;

  if (dependency.startsWith('@')) {
    const match = dependency.match(scopedPackageNamePattern);

    return match?.[1] ?? null;
  }

  return dependency.split('@')[0] || null;
}

export {
  collectRegistryDependencyPackageNames,
  getDependencyPackageName,
  rewriteRegistryDependencies,
  rewriteRegistryPackageDependencies,
};
