import type { Registry } from 'shadcx/registry';

export const hooks: Registry['items'] = [
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
  {
    files: [
      {
        path: 'hooks/use-is-touch-device.ts',
        type: 'registry:hook',
      },
    ],
    name: 'use-is-touch-device',
    type: 'registry:hook',
  },
];
