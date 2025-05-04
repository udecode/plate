import type { Registry } from 'shadcx/registry';

export const lib: Registry['items'] = [
  {
    dependencies: [
      'uploadthing@7.6.0',
      '@uploadthing/react@7.3.0',
      'sonner',
      'zod',
    ],
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
