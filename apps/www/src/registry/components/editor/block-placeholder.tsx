'use client';

import { BlockPlaceholderPlugin } from 'platejs/react';

export const BlockPlaceholderKit = [
  BlockPlaceholderPlugin.configure({
    initialState: {
      className:
        'before:absolute before:cursor-text before:text-muted-foreground/80 before:content-[attr(placeholder)]',
      placeholders: {
        paragraph: 'Type something...',
      },
      query: ({ path }) => path.length === 1,
    },
  }),
];
