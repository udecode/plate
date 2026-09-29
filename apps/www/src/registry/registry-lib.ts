import type { Registry } from 'shadcn/schema';

export const registryLib: Registry['items'] = [
  {
    dependencies: [],
    files: [
      {
        path: 'lib/inline-suggestion.ts',
        type: 'registry:lib',
      },
    ],
    name: 'suggestion-style',
    type: 'registry:lib',
  },
];
