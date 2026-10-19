'use client';

import { PLUGINS } from 'platejs';
import { IndentPlugin } from 'platejs/react';

export const IndentKit = [
  IndentPlugin.configure({
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
