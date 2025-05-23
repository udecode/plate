'use client';

import { KEYS } from '@udecode/plate';
import { AlignPlugin } from '@udecode/plate-alignment/react';

export const AlignKit = [
  AlignPlugin.extend({
    inject: {
      targetPlugins: [KEYS.p, ...KEYS.heading, KEYS.img, KEYS.mediaEmbed],
    },
  }),
];
