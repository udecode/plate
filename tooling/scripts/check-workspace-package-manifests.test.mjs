import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';

import {
  validateChangesetPackageDeclarations,
  validateWorkspacePackageManifests,
} from './check-workspace-package-manifests.mjs';

const root = '/repo';
const workspacePackage = (directory, packageJson) => ({
  packageJson,
  packageJsonPath: path.join(root, 'packages', directory, 'package.json'),
});
const platejs = (dependencies = { plitejs: 'workspace:*' }) =>
  workspacePackage('platejs', {
    dependencies,
    name: 'platejs',
  });
const plitejs = workspacePackage('plitejs', { name: 'plitejs' });
const browser = (packageJson = {}) =>
  workspacePackage('browser', {
    devDependencies: { platejs: 'workspace:^' },
    name: '@platejs/test',
    peerDependencies: { platejs: '>=54.0.0-beta.1' },
    ...packageJson,
  });

test('accepts the Plate host and scoped peer-plus-dev contract', () => {
  assert.deepEqual(
    validateWorkspacePackageManifests([platejs(), plitejs, browser()], root),
    []
  );
});

test('rejects a normal platejs dependency in a scoped package', () => {
  const offenders = validateWorkspacePackageManifests(
    [platejs(), plitejs, browser({ dependencies: { platejs: 'workspace:^' } })],
    root
  );

  assert.equal(offenders.length, 1);
  assert.match(offenders[0], /platejs is a shared host/);
});

test('requires an explicit Plate peer and workspace dev provider', () => {
  const offenders = validateWorkspacePackageManifests(
    [
      platejs(),
      plitejs,
      browser({
        devDependencies: {},
        peerDependencies: { platejs: 'workspace:^' },
      }),
    ],
    root
  );

  assert.equal(offenders.length, 2);
  assert.match(offenders[0], /explicit peerDependencies\.platejs/);
  assert.match(offenders[1], /devDependencies\.platejs=workspace:\^/);
});

test('allows only platejs to declare the plitejs runtime', () => {
  const offenders = validateWorkspacePackageManifests(
    [platejs(), plitejs, browser({ dependencies: { plitejs: 'workspace:^' } })],
    root
  );

  assert.equal(offenders.length, 1);
  assert.match(offenders[0], /only platejs may declare plitejs/);
});

test('requires platejs to own plitejs as a workspace runtime dependency', () => {
  const offenders = validateWorkspacePackageManifests(
    [platejs({ plitejs: '^1.0.0' }), plitejs, browser()],
    root
  );

  assert.equal(offenders.length, 1);
  assert.match(offenders[0], /dependencies\.plitejs=workspace:\*/);
});

test('rejects unabsorbed workspace runtime dependencies from platejs', () => {
  const browserPackage = browser();
  const offenders = validateWorkspacePackageManifests(
    [
      platejs({
        '@platejs/test': 'workspace:^',
        plitejs: 'workspace:*',
      }),
      plitejs,
      browserPackage,
    ],
    root
  );

  assert.equal(offenders.length, 1);
  assert.match(offenders[0], /absorbed Plate code must not remain/);
});

test('rejects changesets for packages missing from the workspace', () => {
  const offenders = validateChangesetPackageDeclarations(
    [
      {
        changesetPath: path.join(root, '.changeset', 'valid.md'),
        packageName: 'plitejs',
      },
      {
        changesetPath: path.join(root, '.changeset', 'stale.md'),
        packageName: '@platejs/plite-react',
      },
    ],
    [platejs(), plitejs, browser()],
    root
  );

  assert.deepEqual(offenders, [
    '.changeset/stale.md: changeset targets missing workspace package @platejs/plite-react',
  ]);
});
