import type { Registry } from 'shadcn/schema';

export const registryLib: Registry['items'] = [
  {
    dependencies: [],
    files: [
      {
        path: 'lib/suggestion.ts',
        type: 'registry:lib',
      },
    ],
    name: 'suggestion-style',
    type: 'registry:lib',
  },
  {
    dependencies: ['uploadthing@7.7.4'],
    files: [
      {
        path: 'lib/uploadthing.ts',
        type: 'registry:lib',
      },
    ],
    name: 'uploadthing',
    type: 'registry:lib',
  },
  {
    dependencies: ['ai@6'],
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
