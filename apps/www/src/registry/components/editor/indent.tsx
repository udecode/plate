'use client';

import { IndentPlugin } from '@platejs/indent/react';
import { PLUGINS } from 'platejs';

export const IndentKit = [
  IndentPlugin.configure({
    initialState: {
      offset: 24,
    },
    targetPlugins: [
      PLUGINS.heading,
      PLUGINS.paragraph,
      PLUGINS.blockquote,
      PLUGINS.codeBlock,
      PLUGINS.toggle,
      PLUGINS.image,
    ],
  }),
];
