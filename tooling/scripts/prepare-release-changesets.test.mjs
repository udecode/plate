import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

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
  const root = mkdtempSync(path.join(tmpdir(), 'plate-release-changesets-'));
  const put = (file, content) => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(
      path.join(root, file),
      typeof content === 'string' ? content : JSON.stringify(content)
    );
  };

  mkdirSync(path.join(root, 'tooling/scripts'), { recursive: true });
  copyFileSync(
    fileURLToPath(new URL('prepare-release-changesets.mjs', import.meta.url)),
    path.join(root, 'tooling/scripts/prepare-release-changesets.mjs')
  );
  put('packages/plitejs/package.json', { name: 'plitejs' });
  put('packages/platejs/package.json', {
    dependencies: { plitejs: 'workspace:^' },
    name: 'platejs',
  });
  put('packages/optional-peer/package.json', {
    name: '@fixture/optional-peer',
    peerDependencies: { plitejs: 'workspace:^' },
  });
  put('.changeset/plitejs-fix.md', "---\n'plitejs': patch\n---\n\nFix.\n");
  put(
    'bin/pnpm',
    `#!/bin/sh\necho '${JSON.stringify({ releases: [{ name: 'plitejs', type: 'patch' }] })}'\n`
  );
  chmodSync(path.join(root, 'bin/pnpm'), 0o755);

  const result = spawnSync(
    process.execPath,
    ['tooling/scripts/prepare-release-changesets.mjs'],
    {
      cwd: root,
      encoding: 'utf-8',
      env: {
        ...process.env,
        PATH: `${path.join(root, 'bin')}${path.delimiter}${process.env.PATH}`,
      },
    }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(readdirSync(path.join(root, '.changeset')).toSorted(), [
    'auto-runtime-dependent-platejs.md',
    'plitejs-fix.md',
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
