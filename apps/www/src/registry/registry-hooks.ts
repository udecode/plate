import type { Registry } from './schema';

export const hooks: Registry = [
  {
    files: [
      {
        path: 'hooks/use-mobile.tsx',
        type: 'registry:hook',
      },
    ],
    name: 'use-mobile',
    type: 'registry:hook',
  },
  {
    files: [
      {
        path: 'hooks/use-toast.ts',
        type: 'registry:hook',
      },
    ],
    name: 'use-toast',
    type: 'registry:hook',
  },
];
