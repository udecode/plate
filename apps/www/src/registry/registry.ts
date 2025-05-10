import type { Registry, RegistryItem } from 'shadcn/registry';

import { blocks } from './registry-blocks';
import { components } from './registry-components';
import { examples } from './registry-examples';
import { hooks } from './registry-hooks';
import { lib } from './registry-lib';
import { ui } from './registry-ui';

const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://platejs.org';

export const init: RegistryItem[] = [
  {
    dependencies: ['@udecode/plate'],
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
        highlight: 'oklch(0.852 0.199 91.936)',
      },
      light: {
        brand: 'oklch(0.623 0.214 259.815)',
        highlight: 'oklch(0.852 0.199 91.936)',
      },
      theme: {
        'font-heading':
          "'var(--font-heading)', 'ui-sans-serif', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI Variable Display', 'Segoe UI', 'Helvetica', 'Apple Color Emoji', 'Arial', 'sans-serif', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
        'font-mono':
          "'var(--font-mono)', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        'font-sans':
          "'var(--font-sans)', 'ui-sans-serif', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI Variable Display', 'Segoe UI', 'Helvetica', 'Apple Color Emoji', 'Arial', 'sans-serif', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
      },
    },
    dependencies: ['tailwind-scrollbar-hide'],
    devDependencies: [],
    files: [],
    name: 'plate-ui',
    registryDependencies: ['plate'],
    tailwind: {
      config: {
        plugins: ['tailwind-scrollbar-hide'],
      },
    },
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
    ...hooks,
    ...examples,
  ],
  name: 'plate',
} satisfies Registry;
