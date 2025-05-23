'use client';

import { KEYS } from '@udecode/plate';
import { IndentPlugin } from '@udecode/plate-indent/react';

export const IndentKit = [
  IndentPlugin.extend({
    inject: {
      targetPlugins: [
        KEYS.p,
        ...KEYS.heading,
        KEYS.blockquote,
        KEYS.codeBlock,
        KEYS.toggle,
      ],
    },
  }),
];
