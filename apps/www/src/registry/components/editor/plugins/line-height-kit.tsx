'use client';

import { KEYS } from '@udecode/plate';
import { LineHeightPlugin } from '@udecode/plate-line-height/react';

export const LineHeightKit = [
  LineHeightPlugin.configure({
    inject: {
      nodeProps: {
        defaultNodeValue: 1.5,
        validNodeValues: [1, 1.2, 1.5, 2, 3],
      },
      targetPlugins: [KEYS.p, ...KEYS.heading],
    },
  }),
];
