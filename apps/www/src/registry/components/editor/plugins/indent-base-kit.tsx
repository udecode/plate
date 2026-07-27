import { BaseIndentPlugin } from '@platejs/indent';
import { KEYS } from 'platejs';

export const BaseIndentKit = [
  BaseIndentPlugin.configure({
    initialState: {
      offset: 24,
    },
    targetPluginKeys: [
      ...KEYS.heading,
      KEYS.p,
      KEYS.blockquote,
      KEYS.codeBlock,
      KEYS.toggle,
    ],
  }),
];
