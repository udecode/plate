import type { Registry } from 'shadcn/registry';

export const lib: Registry['items'] = [
  {
    dependencies: [
      'uploadthing@7.7.2',
      '@uploadthing/react@7.3.1',
      'sonner',
      'zod',
    ],
    files: [
      {
        path: 'hooks/use-upload-file.ts',
        type: 'registry:hook',
      },
      {
        path: 'lib/uploadthing.ts',
        type: 'registry:lib',
      },
    ],
    name: 'uploadthing',
    type: 'registry:hook',
  },
];
