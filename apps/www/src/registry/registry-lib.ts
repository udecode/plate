import type { Registry } from 'shadcn/registry';

export const registryLib: Registry['items'] = [
  {
    dependencies: [
      'uploadthing@7.7.4',
      '@uploadthing/react@7.3.3',
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
  {
    dependencies: ['ai@5.0.28'],
    files: [
      {
        path: 'lib/markdown-joiner-transform.ts',
        type: 'registry:lib',
      },
    ],
    name: 'markdown-joiner-transform',
    type: 'registry:hook',
  },
];
