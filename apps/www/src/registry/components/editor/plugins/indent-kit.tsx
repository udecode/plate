'use client';

import { IndentPlugin } from '@platejs/indent/react';
import { PLUGINS } from 'platejs';

export const IndentKit = [
  IndentPlugin.configure({
    initialState: {
      offset: 24,
    },
    targetPlugins: [
      PLUGINS.h1,
      PLUGINS.h2,
      PLUGINS.h3,
      PLUGINS.h4,
      PLUGINS.h5,
      PLUGINS.h6,
      PLUGINS.paragraph,
      PLUGINS.blockquote,
      PLUGINS.codeBlock,
      PLUGINS.toggle,
      PLUGINS.image,
    ],
  }),
];
