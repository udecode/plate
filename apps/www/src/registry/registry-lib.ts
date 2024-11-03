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
];
