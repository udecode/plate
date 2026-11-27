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
    type: 'registry:lib',
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
    type: 'registry:lib',
  },
  {
    cssVars: {
      dark: {
        'editor-suggestion-1': 'oklch(0.845 0.143 164.978)',
        'editor-suggestion-2': 'oklch(0.811 0.111 293.571)',
        'editor-suggestion-3': 'oklch(0.828 0.111 230.318)',
        'editor-suggestion-4': 'oklch(0.833 0.145 321.434)',
        'editor-suggestion-5': 'oklch(0.837 0.128 66.29)',
        'editor-suggestion-6': 'oklch(0.865 0.127 207.078)',
        'editor-suggestion-7': 'oklch(0.81 0.117 11.638)',
      },
      light: {
        'editor-suggestion-1': 'oklch(0.432 0.095 166.913)',
        'editor-suggestion-2': 'oklch(0.432 0.232 292.759)',
        'editor-suggestion-3': 'oklch(0.443 0.11 240.79)',
        'editor-suggestion-4': 'oklch(0.452 0.211 324.591)',
        'editor-suggestion-5': 'oklch(0.47 0.157 37.304)',
        'editor-suggestion-6': 'oklch(0.45 0.085 224.283)',
        'editor-suggestion-7': 'oklch(0.455 0.188 13.697)',
      },
      theme: {
        'color-editor-suggestion-1': 'var(--editor-suggestion-1)',
        'color-editor-suggestion-2': 'var(--editor-suggestion-2)',
        'color-editor-suggestion-3': 'var(--editor-suggestion-3)',
        'color-editor-suggestion-4': 'var(--editor-suggestion-4)',
        'color-editor-suggestion-5': 'var(--editor-suggestion-5)',
        'color-editor-suggestion-6': 'var(--editor-suggestion-6)',
        'color-editor-suggestion-7': 'var(--editor-suggestion-7)',
      },
    },
    files: [],
    name: 'suggestion-colors',
    type: 'registry:lib',
  },
  {
    cssVars: {
      dark: {
        'editor-insert': 'oklch(0.765 0.177 163.223)',
      },
      light: {
        'editor-insert': 'oklch(0.508 0.118 165.612)',
      },
      theme: {
        'color-editor-delete': 'var(--editor-delete, var(--destructive))',
        'color-editor-insert': 'var(--editor-insert)',
      },
    },
    files: [],
    name: 'diff-colors',
    type: 'registry:lib',
  },
];
