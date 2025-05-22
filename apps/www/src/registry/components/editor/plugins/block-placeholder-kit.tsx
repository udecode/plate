'use client';

import { BlockPlaceholderPlugin, ParagraphPlugin } from '@udecode/plate/react';

export const BlockPlaceholderKit = [
  BlockPlaceholderPlugin.configure({
    options: {
      className:
        'before:absolute before:cursor-text before:opacity-30 before:content-[attr(placeholder)]',
      placeholders: {
        [ParagraphPlugin.key]: 'Type something...',
      },
      query: ({ path }) => {
        return path.length === 1;
      },
    },
  }),
];
