import type { Registry } from './schema';

const plugins: Registry = [
  {
    dependencies: [
      '@udecode/cn',
      '@udecode/plate-ai',
      '@udecode/plate-basic-marks',
      '@udecode/plate-block-quote',
      '@udecode/plate-code-block',
      '@udecode/plate-common',
      '@udecode/plate-font',
      '@udecode/plate-heading',
      '@udecode/plate-horizontal-rule',
      '@udecode/plate-indent',
      '@udecode/plate-indent-list',
      '@udecode/plate-link',
      '@udecode/plate-markdown',
      '@udecode/plate-selection',
      'prismjs',
    ],
    files: [
      {
        path: 'lib/plugins/ai-plugins.tsx',
        type: 'registry:lib',
      },
    ],
    name: 'ai-plugins',
    type: 'registry:lib',
  },
];

export const lib: Registry = [
  {
    dependencies: ['clsx', 'tailwind-merge'],
    files: [
      {
        path: 'lib/utils.ts',
        type: 'registry:lib',
      },
    ],
    name: 'utils',
    type: 'registry:lib',
  },
  {
    dependencies: [
      '@udecode/plate-callout',
      '@udecode/plate-code-block',
      '@udecode/plate-date',
      '@udecode/plate-heading',
      '@udecode/plate-indent-list',
      '@udecode/plate-layout',
      '@udecode/plate-link',
      '@udecode/plate-math',
      '@udecode/plate-media',
      '@udecode/plate-table',
    ],
    doc: {
      description:
        'A collection of utility functions for transforming editor content.',
    },
    files: [
      {
        path: 'lib/transforms.ts',
        type: 'registry:lib',
      },
    ],
    name: 'transforms',
    type: 'registry:lib',
  },
  ...plugins,
];
