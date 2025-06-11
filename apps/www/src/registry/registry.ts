import type { Registry, RegistryItem } from 'shadcn/registry';

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
    registryDependencies: ['plate'],
    type: 'registry:style',
  },
];

export const registry = {
  homepage: url,
  items: [
    ...registryInit,
    ...registryUI,
    ...registryComponents,
    ...registryBlocks,
    ...registryLib,
    ...registryStyles,
    ...registryHooks,
    ...registryExamples,
  ],
  name: 'plate',
} satisfies Registry;
