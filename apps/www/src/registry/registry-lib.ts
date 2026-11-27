import type { Registry } from 'shadcn/schema';

export const registryLib: Registry['items'] = [
  {
    dependencies: ['frimousse@0.4.0'],
    description:
      'Loads Emojibase emoji with GitHub shortcodes and ranks emoji searches.',
    files: [
      {
        path: 'lib/emoji-data.ts',
        type: 'registry:lib',
      },
    ],
    name: 'emoji-data',
    type: 'registry:lib',
  },
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
  {
    dependencies: ['platejs'],
    description:
      'Builds ink digitize requests, groups live marks by distance and time, validates readings, and applies confirmed edits, suggestions, and comments.',
    files: [
      {
        path: 'lib/ink-digitize.ts',
        type: 'registry:lib',
      },
    ],
    name: 'ink-digitize',
    title: 'Ink Digitize',
    type: 'registry:lib',
  },
];
