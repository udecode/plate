'use client';

import { KEYS } from '@udecode/plate';
import { TextAlignPlugin } from '@udecode/plate-basic-styles/react';

export const AlignKit = [
  TextAlignPlugin.extend({
    inject: {
      targetPlugins: [KEYS.p, ...KEYS.heading, KEYS.img, KEYS.mediaEmbed],
    },
  }),
];
