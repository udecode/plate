'use client';

import { TextAlignPlugin } from '@platejs/basic-styles/react';
import { KEYS } from 'platejs';

export const AlignKit = [
  TextAlignPlugin.configure({
    inject: {
      nodeProps: {
        defaultNodeValue: 'start',
        styleKey: 'textAlign',
        validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
      },
    },
    targetPluginNames: [
      ...KEYS.heading,
      KEYS.p,
      KEYS.img,
      KEYS.mediaEmbed,
      KEYS.audio,
      KEYS.video,
    ],
  }),
];
