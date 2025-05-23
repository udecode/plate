'use client';

import { KEYS } from '@udecode/plate';
import { SkipMarkPlugin } from '@udecode/plate/react';

export const SkipMarkKit = [
  SkipMarkPlugin.configure({
    options: {
      query: {
        allow: [KEYS.suggestion, KEYS.code, KEYS.comment],
      },
    },
  }),
];
