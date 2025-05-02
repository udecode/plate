import type { Registry } from 'shadcn/registry';

export const hooks: Registry['items'] = [
  {
    files: [
      {
        path: 'registry/hooks/use-debounce.ts',
        type: 'registry:hook',
      },
    ],
    name: 'use-debounce',
    type: 'registry:hook',
  },
  {
    files: [
      {
        path: 'registry/hooks/use-mounted.ts',
        type: 'registry:hook',
      },
    ],
    name: 'use-mounted',
    type: 'registry:hook',
  },
  {
    files: [
      {
        path: 'registry/hooks/use-is-touch-device.ts',
        type: 'registry:hook',
      },
    ],
    name: 'use-is-touch-device',
    type: 'registry:hook',
  },
];
