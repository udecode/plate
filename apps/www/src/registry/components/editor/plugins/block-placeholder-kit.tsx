'use client';

import { KEYS } from '@udecode/plate';
import { BlockPlaceholderPlugin } from '@udecode/plate/react';

export const BlockPlaceholderKit = [
  BlockPlaceholderPlugin.configure({
    options: {
      className:
        'before:absolute before:cursor-text before:opacity-30 before:content-[attr(placeholder)]',
      placeholders: {
        [KEYS.p]: 'Type something...',
      },
      query: ({ path }) => {
        return path.length === 1;
      },
    },
  }),
];
