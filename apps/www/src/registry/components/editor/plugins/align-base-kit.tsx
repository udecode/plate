import { BaseTextAlignPlugin } from '@platejs/basic-styles';
import { KEYS } from 'platejs';

export const BaseAlignKit = [
  BaseTextAlignPlugin.configure({
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
