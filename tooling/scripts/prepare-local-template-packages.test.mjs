import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  getAffectedRelevantPackageNames,
  getContentAddressedTarballPath,
  getPackagesToPrepare,
  getReachableWorkspacePackageNames,
  rewriteTemplatePackageJson,
} from './prepare-local-template-packages.mjs';

const compareStrings = (left, right) => {
  if (left < right) return -1;
  if (left > right) return 1;

  return 0;
};

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
    '@platejs/test': ['platejs'],
    platejs: ['plitejs'],
    plitejs: [],
  });
  const relevantPackageNames = getReachableWorkspacePackageNames(
    ['@platejs/test', 'platejs', 'plitejs'],
    workspacePackages
  );

  const affectedPackageNames = getAffectedRelevantPackageNames(
    new Set(['platejs']),
    relevantPackageNames,
    workspacePackages
  );

  assert.deepEqual([...affectedPackageNames].sort(compareStrings), [
    '@platejs/test',
    'platejs',
  ]);
});

test('ignores changed packages outside the template graph', () => {
  const workspacePackages = createWorkspacePackages({
    platejs: [],
    '@platejs/test': ['platejs'],
    '@platejs/cli': ['platejs'],
  });
  const relevantPackageNames = getReachableWorkspacePackageNames(
    ['@platejs/cli'],
    workspacePackages
  );

  const affectedPackageNames = getAffectedRelevantPackageNames(
    new Set(['@platejs/test']),
    relevantPackageNames,
    workspacePackages
  );

  assert.deepEqual([...affectedPackageNames], []);
});

test('prepares the full reachable workspace graph without a base ref', () => {
  const workspacePackages = createWorkspacePackages({
    '@platejs/test': ['platejs'],
    platejs: ['plitejs'],
    plitejs: [],
  });
  const relevantPackageNames = getReachableWorkspacePackageNames(
    ['platejs'],
    workspacePackages
  );
  const packagesToPrepare = getPackagesToPrepare({
    baseRef: undefined,
    templateConfigs: [
      {
        localDependencies: ['platejs'],
        relevantPackageNames,
      },
    ],
    workspacePackages,
  });

  assert.deepEqual([...packagesToPrepare.keys()].sort(compareStrings), [
    'platejs',
    'plitejs',
  ]);
});

test('content-addresses local tarballs so package-manager caches cannot reuse stale builds', () => {
  assert.equal(
    getContentAddressedTarballPath(
      '/repo/cache/platejs-54.0.0.tgz',
      Buffer.from('platejs artifact')
    ),
    '/repo/cache/platejs-54.0.0-e96375bde9e6.tgz'
  );
});

test('writes overrides for prepared local tarballs', async () => {
  const templateDir = await mkdtemp(
    path.join(os.tmpdir(), 'prepare-local-template-packages-')
  );
  const lockfilePath = path.join(templateDir, 'bun.lock');
  const stalePackagePath = path.join(
    templateDir,
    'node_modules/@platejs/core/package.json'
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
    await writeFile(lockfilePath, '{}\n');
    await mkdir(path.dirname(stalePackagePath), { recursive: true });
    await writeFile(stalePackagePath, '{}\n');

    await rewriteTemplatePackageJson(
      {
        packageJson: {
          dependencies: {
            platejs: '^52.3.11',
          },
        },
        packageJsonPath,
        relevantPackageNames: new Set(['platejs', 'plitejs']),
        templateDir,
      },
      new Map([
        ['platejs', '/repo/cache/platejs-52.3.11.tgz'],
        ['plitejs', '/repo/cache/plitejs-0.0.1.tgz'],
      ])
    );

    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

    assert.equal(
      packageJson.overrides.platejs,
      `file:${path.relative(templateDir, '/repo/cache/platejs-52.3.11.tgz')}`
    );
    assert.equal(
      packageJson.overrides.plitejs,
      `file:${path.relative(templateDir, '/repo/cache/plitejs-0.0.1.tgz')}`
    );
    await assert.rejects(readFile(lockfilePath), { code: 'ENOENT' });
    await assert.rejects(readFile(stalePackagePath), { code: 'ENOENT' });
  } finally {
    await rm(templateDir, { force: true, recursive: true });
  }
});
