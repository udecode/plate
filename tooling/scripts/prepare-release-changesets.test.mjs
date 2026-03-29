import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createAutoChangesetContent,
  getAutoReleasePackages,
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

  const autoReleasePackages = getAutoReleasePackages(
    [{ name: '@platejs/core', type: 'patch' }],
    workspacePackages
  );

  assert.deepEqual(autoReleasePackages, [
    {
      name: '@platejs/transitive',
      updatedDependencyNames: ['@platejs/utils'],
    },
    {
      name: '@platejs/utils',
      updatedDependencyNames: ['@platejs/core'],
    },
    {
      name: 'platejs',
      updatedDependencyNames: ['@platejs/core', '@platejs/utils'],
    },
  ]);
});

test('does not follow peer-only relationships', () => {
  const workspacePackages = createWorkspacePackages({
    '@platejs/core': [],
    '@platejs/utils': ['@platejs/core'],
    '@platejs/yjs': [],
    platejs: ['@platejs/core', '@platejs/utils'],
  });

  const autoReleasePackages = getAutoReleasePackages(
    [{ name: '@platejs/core', type: 'patch' }],
    workspacePackages
  );

  assert.deepEqual(autoReleasePackages, [
    {
      name: '@platejs/utils',
      updatedDependencyNames: ['@platejs/core'],
    },
    {
      name: 'platejs',
      updatedDependencyNames: ['@platejs/core', '@platejs/utils'],
    },
  ]);
});

test('formats a synthetic changeset for one auto-bumped package', () => {
  const content = createAutoChangesetContent('platejs', [
    '@platejs/core',
    '@platejs/utils',
  ]);

  assert.match(content, /"platejs": patch/);
  assert.match(content, /Updated `@platejs\/core`, `@platejs\/utils`\./);
});
