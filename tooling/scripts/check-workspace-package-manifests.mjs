#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(scriptPath);
const repoRoot = path.resolve(scriptDir, '..', '..');
const workspacePackageDir = path.join(repoRoot, 'packages');

export const readWorkspacePackageManifests = async (
  packageDir = workspacePackageDir
) => {
  const workspacePackages = [];
  const entries = await readdir(packageDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const packageJsonPath = path.join(packageDir, entry.name, 'package.json');

    try {
      const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

      workspacePackages.push({ packageJson, packageJsonPath });
    } catch {
      // Ignore workspace entries without a readable package manifest.
    }
  }

  return workspacePackages;
};

export const validateWorkspacePackageManifests = (
  workspacePackages,
  root = repoRoot
) => {
  const offenders = [];
  const workspacePackageNames = new Set(
    workspacePackages.map(({ packageJson }) => packageJson.name)
  );

  for (const { packageJson, packageJsonPath } of workspacePackages) {
    const packageLabel = `${packageJson.name} (${path.relative(root, packageJsonPath)})`;
    const plateDependency = packageJson.dependencies?.platejs;
    const plateDev = packageJson.devDependencies?.platejs;
    const platePeer = packageJson.peerDependencies?.platejs;
    const isPublicPlatePackage =
      packageJson.name?.startsWith('@platejs/') && !packageJson.private;

    if (packageJson.name !== 'platejs' && plateDependency) {
      offenders.push(
        `${packageLabel}: platejs is a shared host and must not be a normal dependency; declare an explicit peer plus devDependencies.platejs=workspace:^`
      );
    }

    if (isPublicPlatePackage || platePeer || plateDev) {
      if (!platePeer || platePeer.startsWith('workspace:')) {
        offenders.push(
          `${packageLabel}: expected an explicit peerDependencies.platejs compatibility range; found ${String(platePeer)}`
        );
      }

      if (plateDev !== 'workspace:^') {
        offenders.push(
          `${packageLabel}: expected devDependencies.platejs=workspace:^; found ${String(plateDev)}`
        );
      }
    }

    if (packageJson.name !== 'platejs' && packageJson.name !== 'plitejs') {
      const pliteDeclaration = [
        ['dependencies', packageJson.dependencies?.plitejs],
        ['devDependencies', packageJson.devDependencies?.plitejs],
        ['peerDependencies', packageJson.peerDependencies?.plitejs],
      ].find(([, value]) => value);

      if (pliteDeclaration) {
        offenders.push(
          `${packageLabel}: only platejs may declare plitejs; found ${pliteDeclaration[0]}.plitejs=${pliteDeclaration[1]}`
        );
      }
    }
  }

  const umbrellaPackage = workspacePackages.find(
    ({ packageJson }) => packageJson.name === 'platejs'
  );

  if (!umbrellaPackage) {
    offenders.push('platejs: missing packages/platejs/package.json');

    return offenders;
  }

  const { packageJson, packageJsonPath } = umbrellaPackage;

  if (packageJson.dependencies?.plitejs !== 'workspace:*') {
    offenders.push(
      `platejs (${path.relative(root, packageJsonPath)}): expected dependencies.plitejs=workspace:* so prereleases publish an exact runtime version; found ${String(packageJson.dependencies?.plitejs)}`
    );
  }

  for (const [dependencyName, dependencyRange] of Object.entries(
    packageJson.dependencies ?? {}
  )) {
    if (!workspacePackageNames.has(dependencyName)) continue;
    if (dependencyName === 'plitejs') continue;

    offenders.push(
      `platejs (${path.relative(root, packageJsonPath)}): absorbed Plate code must not remain a workspace dependency; found dependencies.${dependencyName}=${String(dependencyRange)}`
    );
  }

  return offenders;
};

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  const workspacePackages = await readWorkspacePackageManifests();
  const offenders = validateWorkspacePackageManifests(workspacePackages);

  if (offenders.length > 0) {
    console.error(offenders.join('\n'));
    process.exit(1);
  }

  console.log(
    'Verified scoped Plate packages peer on platejs with a workspace dev provider, only platejs declares plitejs, and platejs pins that runtime exactly'
  );
}
