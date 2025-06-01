'use client';

import { KEYS } from '@udecode/plate';
import { SoftBreakPlugin } from '@udecode/plate/react';

export const SoftBreakKit = [
  SoftBreakPlugin.configure({
    options: {
      rules: [
        { hotkey: 'shift+enter' },
        {
          hotkey: 'enter',
          query: {
            allow: [
              KEYS.codeBlock,
              KEYS.blockquote,
              KEYS.td,
              KEYS.th,
              KEYS.callout,
            ],
          },
        },
      ],
    },
  }),
];
