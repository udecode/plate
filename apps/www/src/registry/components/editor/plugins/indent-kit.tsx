'use client';

import { KEYS } from 'platejs';
import { IndentPlugin } from '@platejs/indent/react';

export const IndentKit = [
  IndentPlugin.configure({
    inject: {
      targetPlugins: [
        ...KEYS.heading,
        KEYS.p,
        KEYS.blockquote,
        KEYS.codeBlock,
        KEYS.toggle,
      ],
    },
    options: {
      offset: 24,
    },
  }),
];
