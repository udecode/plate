import { BaseTextAlignPlugin, PLUGINS } from 'platejs';

export const AlignKit = [
  BaseTextAlignPlugin.configure({
    inject: {
      nodeProps: {
        defaultNodeValue: 'start',
        styleKey: 'textAlign',
        validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
      },
    },
    targetPlugins: [
      PLUGINS.heading,
      PLUGINS.paragraph,
      PLUGINS.image,
      PLUGINS.mediaEmbed,
      PLUGINS.audio,
      PLUGINS.video,
    ],
  }),
] as const;
