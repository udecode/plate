'use client';

import { KEYS } from '@udecode/plate';
import { SoftBreakPlugin } from '@udecode/plate/react';

export const SoftBreakKit = [
  SoftBreakPlugin.configure({
    options: {
      rules: [
        {
          hotkey: 'enter',
          query: {
            allow: [KEYS.blockquote, KEYS.callout],
          },
        },
      ],
    },
  }),
];
