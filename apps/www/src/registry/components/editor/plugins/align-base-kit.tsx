import { BaseTextAlignPlugin } from '@platejs/basic-styles';
import { KEYS } from 'platejs';

export const BaseAlignKit = [
  BaseTextAlignPlugin.configure({
    inject: {
      nodeProps: {
        defaultNodeValue: 'start',
        nodeKey: 'align',
        styleKey: 'textAlign',
        validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
      },
    },
    targetPluginKeys: [
      ...KEYS.heading,
      KEYS.p,
      KEYS.img,
      KEYS.mediaEmbed,
      KEYS.audio,
      KEYS.video,
    ],
  }),
];
