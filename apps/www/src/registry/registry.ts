import type { Registry, RegistryItem } from 'shadcn/schema';

import { registryBlocks } from './registry-blocks';
import { registryComponents } from './registry-components';
import { registryExamples } from './registry-examples';
import { registryHooks } from './registry-hooks';
import { registryLib } from './registry-lib';
import { registryStyles } from './registry-styles';
import { registryUI } from './registry-ui';

const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://platejs.org';

export const registryInit: RegistryItem[] = [
  {
    dependencies: ['platejs'],
    description: 'Install Plate package',
    devDependencies: [],
    files: [],
    name: 'plate',
    registryDependencies: [],
    type: 'registry:lib',
  },
  {
    cssVars: {
      dark: {
        brand: 'oklch(0.707 0.165 254.624)',
      },
      light: {
        brand: 'oklch(0.623 0.214 259.815)',
      },
    },
    description: 'Install Plate package and styles',
    devDependencies: [],
    files: [],
    name: 'plate-ui',
    registryDependencies: ['@plate/plate'],
    type: 'registry:style',
  },
];

export function createPlateRegistryItems(): Registry['items'] {
  const registryBlockItems = registryBlocks.map((block) => ({
    ...block,
    registryDependencies: [
      '@plate/plate-ui',
      ...(block.registryDependencies ?? []),
    ],
  }));

  return [
    ...registryInit,
    ...registryUI,
    ...registryComponents,
    ...registryBlockItems,
    ...registryLib,
    ...registryStyles,
    ...registryHooks,
    ...registryExamples,
  ];
}

export function createPlateRegistry(homepage = url): Registry {
  return {
    homepage,
    items: createPlateRegistryItems(),
    name: 'plate',
  };
}

export const registry = createPlateRegistry();
