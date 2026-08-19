import { BaseIndentPlugin } from '@platejs/indent';
import { PLUGINS } from 'platejs';

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
      PLUGINS.toggle,
    ],
  }),
];
