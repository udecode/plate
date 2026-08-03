import { BaseTextAlignPlugin } from '@platejs/basic-styles';
import { PLUGINS } from 'platejs';

export const BaseAlignKit = [
  BaseTextAlignPlugin.configure({
    inject: {
      nodeProps: {
        defaultNodeValue: 'start',
        styleKey: 'textAlign',
        validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
      },
    },
    targetPlugins: [
      PLUGINS.h1,
      PLUGINS.h2,
      PLUGINS.h3,
      PLUGINS.h4,
      PLUGINS.h5,
      PLUGINS.h6,
      PLUGINS.paragraph,
      PLUGINS.image,
      PLUGINS.mediaEmbed,
      PLUGINS.audio,
      PLUGINS.video,
    ],
  }),
];
