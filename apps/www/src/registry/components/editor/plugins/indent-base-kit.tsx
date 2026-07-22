import { BaseIndentPlugin } from '@platejs/indent';
import { KEYS } from 'platejs';

export const BaseIndentKit = [
  BaseIndentPlugin.configure({
    options: {
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
