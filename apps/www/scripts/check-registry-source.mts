import { registrySchema } from 'shadcn/schema';

import { registryBlocks } from '../src/registry/registry-blocks';
import { registryComponents } from '../src/registry/registry-components';
import { registryExamples } from '../src/registry/registry-examples';
import { registryHooks } from '../src/registry/registry-hooks';
import { registryLib } from '../src/registry/registry-lib';
import { registry, registryInit } from '../src/registry/registry';
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
const runtimeItemsByName = new Map(
  registry.items.map((item) => [item.name, item])
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
  editorBasic?.registryDependencies?.includes(
    'https://platejs.org/r/plate-ui.json'
  ),
  'Expected editor-basic to depend on standalone plate-ui registry URL after normalization'
);

const runtimeEditorBasic = runtimeItemsByName.get('editor-basic');
assert(
  runtimeEditorBasic?.registryDependencies?.includes('plate-ui'),
  'Expected runtime editor-basic to depend on plate-ui'
);

const excalidrawNode = itemsByName.get('excalidraw-node');
assert(
  excalidrawNode?.meta?.examples?.includes('excalidraw-demo'),
  'Expected excalidraw-node to expose its existing registry demo'
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
