import type { RegistryItem } from 'shadcn/registry';

export const registryStyles: RegistryItem[] = [
  {
    dependencies: ['tailwind-scrollbar-hide'],
    files: [],
    name: 'tailwind-scrollbar-hide',
    tailwind: {
      config: {
        plugins: ['tailwind-scrollbar-hide'],
      },
    },
    type: 'registry:style',
  },
  {
    cssVars: {
      dark: {
        highlight: 'oklch(0.852 0.199 91.936)',
      },
      light: {
        highlight: 'oklch(0.852 0.199 91.936)',
      },
    },
    files: [],
    name: 'highlight-style',
    type: 'registry:style',
  },
];
