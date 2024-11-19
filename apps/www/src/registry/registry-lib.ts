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
    dependencies: ['uploadthing@7.2.0', 'sonner'],
    files: [
      {
        path: 'lib/uploadthing.ts',
        type: 'registry:lib',
      },
    ],
    name: 'uploadthing',
    type: 'registry:lib',
  },
];
