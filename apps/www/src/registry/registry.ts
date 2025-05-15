import type { Registry, RegistryItem } from 'shadcn/registry';

import { blocks } from './registry-blocks';
import { components } from './registry-components';
import { examples } from './registry-examples';
import { hooks } from './registry-hooks';
import { lib } from './registry-lib';
import { styles } from './registry-styles';
import { ui } from './registry-ui';

const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://platejs.org';

const registryUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/r'
    : 'https://platejs.org/r';

export const init: RegistryItem[] = [
  {
    dependencies: ['@udecode/plate'],
    description: `Use \`npx shadcn@latest add ${registryUrl}/<name>\` to install items from this registry.`,
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
    ...init,
    ...ui,
    ...components,
    ...blocks,
    ...lib,
    ...styles,
    ...hooks,
    ...examples,
  ],
  name: 'plate',
} satisfies Registry;
