import { BaseIndentPlugin } from '@platejs/indent';
import { PLUGINS } from 'platejs';

export const BaseIndentKit = [
  BaseIndentPlugin.configure({
    initialState: {
      offset: 24,
    },
    targetPlugins: [
      PLUGINS.h1,
      PLUGINS.h2,
      PLUGINS.h3,
      PLUGINS.h4,
      PLUGINS.h5,
      PLUGINS.h6,
      PLUGINS.paragraph,
      PLUGINS.blockquote,
      PLUGINS.codeBlock,
      PLUGINS.toggle,
    ],
  }),
];
