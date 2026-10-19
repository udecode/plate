import { BaseTextAlignPlugin, PLUGINS } from 'platejs';

export const AlignKit = [
  BaseTextAlignPlugin.configure({
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
