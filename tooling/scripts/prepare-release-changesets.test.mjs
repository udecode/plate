import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createAutoChangesetContent,
  getAutoReleasePackageNames,
} from './prepare-release-changesets.mjs';

function createWorkspacePackages(entries) {
  const workspacePackages = new Map(
    Object.entries(entries).map(([packageName, runtimeDependencyNames]) => [
      packageName,
      {
        runtimeDependencyNames,
        runtimeDependentNames: [],
      },
    ])
  );

  for (const [packageName, workspacePackage] of workspacePackages) {
    for (const dependencyName of workspacePackage.runtimeDependencyNames) {
      workspacePackages
        .get(dependencyName)
        ?.runtimeDependentNames.push(packageName);
    }
  }

  return workspacePackages;
}

test('auto-releases transitive runtime dependents of released packages', () => {
  const workspacePackages = createWorkspacePackages({
    '@platejs/core': [],
    '@platejs/transitive': ['@platejs/utils'],
    '@platejs/utils': ['@platejs/core'],
    platejs: ['@platejs/core', '@platejs/utils'],
  });

  const autoReleasePackageNames = getAutoReleasePackageNames(
    [{ name: '@platejs/core', type: 'patch' }],
    workspacePackages
  );

  assert.deepEqual(autoReleasePackageNames, [
    '@platejs/transitive',
    '@platejs/utils',
    'platejs',
  ]);
});

test('does not follow peer-only relationships', () => {
  const workspacePackages = createWorkspacePackages({
    '@platejs/core': [],
    '@platejs/utils': ['@platejs/core'],
    '@platejs/yjs': [],
    platejs: ['@platejs/core', '@platejs/utils'],
  });

  const autoReleasePackageNames = getAutoReleasePackageNames(
    [{ name: '@platejs/core', type: 'patch' }],
    workspacePackages
  );

  assert.deepEqual(autoReleasePackageNames, ['@platejs/utils', 'platejs']);
});

test('formats a synthetic changeset covering every auto-bumped package', () => {
  const content = createAutoChangesetContent(
    ['@platejs/core'],
    ['@platejs/utils', 'platejs']
  );

  assert.match(content, /"@platejs\/utils": patch/);
  assert.match(content, /"platejs": patch/);
  assert.match(content, /Republish runtime dependents of `@platejs\/core`/);
});
