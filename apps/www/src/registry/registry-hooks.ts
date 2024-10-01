import type { Registry } from './schema';

export const hooks: Registry = [
  {
    files: [
      {
        path: 'hooks/use-debounce.ts',
        type: 'registry:hook',
      },
    ],
    name: 'use-debounce',
    type: 'registry:hook',
  },
  {
    files: [
      {
        path: 'hooks/use-mounted.ts',
        type: 'registry:hook',
      },
    ],
    name: 'use-mounted',
    type: 'registry:hook',
  },
];
