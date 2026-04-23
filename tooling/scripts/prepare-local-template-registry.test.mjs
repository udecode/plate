import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getDependencyPackageName,
  rewriteRegistryDependencies,
  rewriteRegistryPackageDependencies,
} from './prepare-local-template-registry.mjs';

test('parses registry dependency package names from npm specs', () => {
  assert.equal(
    getDependencyPackageName('@platejs/footnote'),
    '@platejs/footnote'
  );
  assert.equal(
    getDependencyPackageName('@platejs/footnote@52.3.10'),
    '@platejs/footnote'
  );
  assert.equal(getDependencyPackageName('remark-gfm'), 'remark-gfm');
  assert.equal(getDependencyPackageName('remark-gfm@4.0.1'), 'remark-gfm');
  assert.equal(getDependencyPackageName('file:/tmp/package.tgz'), null);
});

test('rewrites local registry dependencies and changed workspace package installs', () => {
  const registryItem = {
    dependencies: [
      '@platejs/footnote',
      '@platejs/markdown@52.3.10',
      'remark-gfm',
    ],
    nested: {
      dependencies: ['@platejs/link', 'sonner'],
      registryDependencies: ['http://localhost:3000/rd/link-kit.json'],
    },
    registryDependencies: ['http://127.0.0.1:3000/rd/markdown-kit.json'],
  };

  rewriteRegistryDependencies(registryItem);
  rewriteRegistryPackageDependencies(
    registryItem,
    new Map([
      ['@platejs/footnote', '/tmp/platejs-footnote-52.3.10.tgz'],
      ['@platejs/link', '/tmp/platejs-link-52.3.17.tgz'],
    ])
  );

  assert.deepEqual(registryItem.dependencies, [
    '@platejs/footnote@file:/tmp/platejs-footnote-52.3.10.tgz',
    '@platejs/markdown@52.3.10',
    'remark-gfm',
  ]);
  assert.deepEqual(registryItem.nested.dependencies, [
    '@platejs/link@file:/tmp/platejs-link-52.3.17.tgz',
    'sonner',
  ]);
  assert.deepEqual(registryItem.registryDependencies, ['markdown-kit.json']);
  assert.deepEqual(registryItem.nested.registryDependencies, ['link-kit.json']);
});
