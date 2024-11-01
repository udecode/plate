import type { Registry } from './schema';

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
      '@udecode/plate-code-block',
      '@udecode/plate-date',
      '@udecode/plate-heading',
      '@udecode/plate-indent-list',
      '@udecode/plate-layout',
      '@udecode/plate-math',
      '@udecode/plate-media',
      '@udecode/plate-table',
    ],
    files: [
      {
        path: 'lib/transforms.ts',
        type: 'registry:lib',
      },
    ],
    name: 'transforms',
    type: 'registry:lib',
  },
];
