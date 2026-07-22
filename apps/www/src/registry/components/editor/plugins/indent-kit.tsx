'use client';

import { IndentPlugin } from '@platejs/indent/react';
import { KEYS } from 'platejs';

export const IndentKit = [
  IndentPlugin.configure({
    options: {
      offset: 24,
    },
    targetPluginKeys: [
      ...KEYS.heading,
      KEYS.p,
      KEYS.blockquote,
      KEYS.codeBlock,
      KEYS.toggle,
      KEYS.img,
    ],
  }),
];
