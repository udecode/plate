import { registrySchema } from 'shadcn/schema';

import { registryBlocks } from '../src/registry/registry-blocks';
import { registryComponents } from '../src/registry/registry-components';
import { registryExamples } from '../src/registry/registry-examples';
import { registryHooks } from '../src/registry/registry-hooks';
import { registryLib } from '../src/registry/registry-lib';
import { registryInit } from '../src/registry/registry';
import { registryStyles } from '../src/registry/registry-styles';
import { registryUI } from '../src/registry/registry-ui';
import { toRegistryDependencySpecifier } from './registry-dependencies.mts';

const ABSOLUTE_URL_REGEX = /^https?:\/\//;

const normalizedRegistry = registrySchema.parse({
  homepage: 'https://platejs.org',
  name: 'plate',
  items: [
    ...registryInit,
    ...registryUI,
    ...registryComponents,
    ...registryBlocks.map((block) => ({
      ...block,
      registryDependencies: ['plate-ui', ...(block.registryDependencies ?? [])],
    })),
    ...registryLib,
    ...registryStyles,
    ...registryHooks,
    ...registryExamples,
  ].map((item) => ({
    ...item,
    registryDependencies: item.registryDependencies?.map(
      toRegistryDependencySpecifier
    ),
  })),
});

const itemsByName = new Map(
  normalizedRegistry.items.map((item) => [item.name, item])
);

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(itemsByName.has('plate-ui'), 'Expected plate-ui registry item');
assert(itemsByName.has('editor-basic'), 'Expected editor-basic registry item');

const editorBasic = itemsByName.get('editor-basic');
assert(
  editorBasic?.registryDependencies?.includes('@plate/plate-ui'),
  'Expected editor-basic to depend on @plate/plate-ui after normalization'
);
assert(
  normalizedRegistry.items.every((item) =>
    item.registryDependencies
      ? item.registryDependencies.every(
          (dependency) =>
            dependency.startsWith('@') ||
            dependency.startsWith('/') ||
            dependency.startsWith('./') ||
            dependency.startsWith('../') ||
            ABSOLUTE_URL_REGEX.test(dependency)
        )
      : true
  ),
  'Expected normalized registry dependencies to use resolver-safe specifiers'
);

console.info('Registry source check passed.');
