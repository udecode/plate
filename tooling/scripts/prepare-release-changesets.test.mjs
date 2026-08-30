import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createAutoChangesetContent,
  getAutoReleasePackages,
  getChangesetStatusArgs,
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
    '@platejs/test': ['platejs'],
    '@fixture/transitive': ['platejs'],
    platejs: ['plitejs'],
    plitejs: [],
  });

  const autoReleasePackages = getAutoReleasePackages(
    [{ name: 'plitejs', type: 'patch' }],
    workspacePackages
  );

  assert.deepEqual(autoReleasePackages, [
    {
      name: '@fixture/transitive',
      updatedDependencyNames: ['platejs'],
    },
    {
      name: '@platejs/test',
      updatedDependencyNames: ['platejs'],
    },
    {
      name: 'platejs',
      updatedDependencyNames: ['plitejs'],
    },
  ]);
});

test('does not follow peer-only relationships', () => {
  const workspacePackages = createWorkspacePackages({
    '@fixture/optional-peer': [],
    platejs: ['plitejs'],
    plitejs: [],
  });

  const autoReleasePackages = getAutoReleasePackages(
    [{ name: 'plitejs', type: 'patch' }],
    workspacePackages
  );

  assert.deepEqual(autoReleasePackages, [
    {
      name: 'platejs',
      updatedDependencyNames: ['plitejs'],
    },
  ]);
});

test('formats a synthetic changeset for one auto-bumped package', () => {
  const content = createAutoChangesetContent('platejs', ['plitejs']);

  assert.match(content, /"platejs": patch/);
  assert.match(content, /Updated `plitejs`\./);
});

test('uses the release branch as the changeset status base in CI', () => {
  assert.deepEqual(
    getChangesetStatusArgs({
      env: { GITHUB_REF_NAME: 'next' },
      outputPath: '.tmp/status.json',
    }),
    ['exec', 'changeset', 'status', '--output=.tmp/status.json', '--since=next']
  );

  assert.deepEqual(
    getChangesetStatusArgs({
      env: { PLATE_CHANGESET_STATUS_BASE: 'release/v53' },
      outputPath: '.tmp/status.json',
    }),
    [
      'exec',
      'changeset',
      'status',
      '--output=.tmp/status.json',
      '--since=release/v53',
    ]
  );
});
