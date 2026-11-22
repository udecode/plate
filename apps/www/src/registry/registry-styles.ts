import type { RegistryItem } from 'shadcn/schema';

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
  {
    cssVars: {
      dark: {
        'syntax-keyword': '#ee6960',
        'syntax-constant': '#6596cf',
        'syntax-built-in': '#c3854e',
        'syntax-bullet': '#967e38',
        'syntax-comment': '#78828c',
        'syntax-tag': '#36a84f',
        'syntax-string': '#3593ff',
        'syntax-section': '#61a5f2',
        'syntax-title': '#a77bfa',
        'syntax-addition': '#ceead5',
        'syntax-addition-background': '#3c5743',
        'syntax-deletion': '#e7c7cb',
        'syntax-deletion-background': '#473235',
      },
      light: {
        'syntax-keyword': '#d13344',
        'syntax-constant': '#005cc5',
        'syntax-built-in': '#bc4f01',
        'syntax-bullet': '#735c0f',
        'syntax-comment': '#68717b',
        'syntax-tag': '#1b8136',
        'syntax-string': '#032f62',
        'syntax-section': '#005cc5',
        'syntax-title': '#6f42c1',
        'syntax-addition': '#1b8136',
        'syntax-addition-background': '#f0fff4',
        'syntax-deletion': '#b31d28',
        'syntax-deletion-background': '#ffeef0',
      },
    },
    files: [],
    name: 'code-syntax-style',
    type: 'registry:style',
  },
];
