import { BaseIndentPlugin, PLUGINS } from 'platejs';

export const BaseIndentKit = [
  BaseIndentPlugin.configure({
    initialState: {
      offset: 24,
    },
    targetPlugins: [
      PLUGINS.heading,
      PLUGINS.paragraph,
      PLUGINS.blockquote,
      PLUGINS.codeBlock,
      PLUGINS.details,
      PLUGINS.image,
      PLUGINS.audio,
      PLUGINS.callout,
      PLUGINS.columnGroup,
      PLUGINS.equation,
      PLUGINS.excalidraw,
      PLUGINS.file,
      PLUGINS.horizontalRule,
      PLUGINS.mediaEmbed,
      PLUGINS.toc,
      PLUGINS.upload,
      PLUGINS.video,
    ],
  }),
];
