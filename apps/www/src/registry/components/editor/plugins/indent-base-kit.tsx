import { KEYS } from '@udecode/plate';
import { BaseIndentPlugin } from '@udecode/plate-indent';

export const BaseIndentKit = [
  BaseIndentPlugin.extend({
    inject: {
      targetPlugins: [
        KEYS.p,
        ...KEYS.heading,
        KEYS.blockquote,
        KEYS.codeBlock,
        KEYS.toggle,
      ],
    },
  }),
];
