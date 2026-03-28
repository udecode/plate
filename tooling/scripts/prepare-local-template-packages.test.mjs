import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  getAffectedRelevantPackageNames,
  getReachableWorkspacePackageNames,
  rewriteTemplatePackageJson,
} from './prepare-local-template-packages.mjs';

function createWorkspacePackages(entries) {
  const workspacePackages = new Map(
    Object.entries(entries).map(([packageName, localDependencyNames]) => [
      packageName,
      {
        localDependencyNames,
        localDependentNames: [],
      },
    ])
  );

  for (const [packageName, workspacePackage] of workspacePackages) {
    for (const dependencyName of workspacePackage.localDependencyNames) {
      workspacePackages
        .get(dependencyName)
        ?.localDependentNames.push(packageName);
    }
  }

  return workspacePackages;
}

test('includes affected template-facing packages for transitive changes', () => {
  const workspacePackages = createWorkspacePackages({
    '@platejs/basic-nodes': ['@platejs/core'],
    '@platejs/core': ['@platejs/slate'],
    '@platejs/slate': [],
    platejs: ['@platejs/basic-nodes', '@platejs/core', '@platejs/slate'],
  });
  const relevantPackageNames = getReachableWorkspacePackageNames(
    ['platejs'],
    workspacePackages
  );

  const affectedPackageNames = getAffectedRelevantPackageNames(
    new Set(['@platejs/core']),
    relevantPackageNames,
    workspacePackages
  );

  assert.deepEqual([...affectedPackageNames].sort(), [
    '@platejs/basic-nodes',
    '@platejs/core',
    'platejs',
  ]);
});

test('ignores changed packages outside the template graph', () => {
  const workspacePackages = createWorkspacePackages({
    '@platejs/core': [],
    '@platejs/media': ['@platejs/core'],
    '@platejs/table': ['@platejs/core'],
  });
  const relevantPackageNames = getReachableWorkspacePackageNames(
    ['@platejs/table'],
    workspacePackages
  );

  const affectedPackageNames = getAffectedRelevantPackageNames(
    new Set(['@platejs/media']),
    relevantPackageNames,
    workspacePackages
  );

  assert.deepEqual([...affectedPackageNames], []);
});

test('writes overrides for prepared local tarballs', async () => {
  const templateDir = await mkdtemp(
    path.join(os.tmpdir(), 'prepare-local-template-packages-')
  );
  const packageJsonPath = path.join(templateDir, 'package.json');

  try {
    await writeFile(
      packageJsonPath,
      JSON.stringify(
        {
          dependencies: {
            platejs: '^52.3.11',
          },
        },
        null,
        2
      )
    );

    await rewriteTemplatePackageJson(
      {
        packageJson: {
          dependencies: {
            platejs: '^52.3.11',
          },
        },
        packageJsonPath,
        relevantPackageNames: new Set(['@platejs/core', 'platejs']),
        templateDir,
      },
      new Map([
        ['platejs', '/repo/cache/platejs-52.3.11.tgz'],
        ['@platejs/core', '/repo/cache/platejs-core-52.3.13.tgz'],
      ])
    );

    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

    assert.equal(
      packageJson.overrides.platejs,
      `file:${path.relative(templateDir, '/repo/cache/platejs-52.3.11.tgz')}`
    );
    assert.equal(
      packageJson.overrides['@platejs/core'],
      `file:${path.relative(templateDir, '/repo/cache/platejs-core-52.3.13.tgz')}`
    );
  } finally {
    await rm(templateDir, { force: true, recursive: true });
  }
});
