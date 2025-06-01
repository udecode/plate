'use client';

import { KEYS } from '@udecode/plate';
import { ExitBreakPlugin } from '@udecode/plate/react';

export const ExitBreakKit = [
  ExitBreakPlugin.configure({
    options: {
      rules: [
        {
          hotkey: 'mod+enter',
        },
        {
          before: true,
          hotkey: 'mod+shift+enter',
        },
        {
          hotkey: 'enter',
          level: 1,
          query: {
            allow: KEYS.heading,
            end: true,
            start: true,
          },
          relative: true,
        },
      ],
    },
  }),
];
