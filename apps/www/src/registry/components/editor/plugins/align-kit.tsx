'use client';

import { KEYS } from '@udecode/plate';
import { TextAlignPlugin } from '@udecode/plate-basic-styles/react';

export const AlignKit = [
  TextAlignPlugin.configure({
    inject: {
      nodeProps: {
        defaultNodeValue: 'start',
        nodeKey: 'align',
        styleKey: 'textAlign',
        validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
      },
      targetPlugins: [...KEYS.heading, KEYS.p, KEYS.img, KEYS.mediaEmbed],
    },
  }),
];
